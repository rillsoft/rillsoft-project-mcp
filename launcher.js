#!/usr/bin/env node
// Launcher for the MCP server built into Rillsoft Project 10 (Windows).
//
// Bridge:   forwards every JSON-RPC line from stdin to the fixed local endpoint
//           http://127.0.0.1:3928/mcp (Streamable HTTP) and writes the answers to stdout.
// Fallback: when the endpoint is not reachable at initialize (connection refused, timeout 2 s),
//           answers initialize and tools/list from tools-list.json (the tools of the program)
//           and every tools/call with isError: true and a hint. The mode is decided once per
//           session; a later outage of the endpoint is reported as a JSON-RPC error, never as
//           a silent switch to the fallback.
//
// No environment variables for URL or key, no Authorization header (decision 2026-10-17).
// Only RILLSOFT_MCP_LOG (optional path of a diagnostic log file) is read. stdout carries
// JSON-RPC lines only; everything else goes to stderr. No dependencies, Node >= 18.
"use strict";

const fs = require("fs");
const path = require("path");

const ENDPOINT = "http://127.0.0.1:3928/mcp";
const PROTOCOL_VERSION = "2025-06-18";
const INITIALIZE_TIMEOUT_MS = 2000;
const CLOSE_TIMEOUT_MS = 2000;
const GET_STARTED_URL = "https://rillsoft.ai/en/get-started/";
const TOOLS_FILE = path.join(__dirname, "tools-list.json");
const TAG = "rillsoft-project-mcp";

const NOT_RUNNING =
  "Rillsoft Project 10 is not running or not installed on this machine. Windows only. " +
  "Tools are listed for discovery; calls fail until Rillsoft Project is running.";
const CALL_HINT =
  "Rillsoft Project 10 is not running on this machine, so this tool cannot be executed. " +
  "Install Rillsoft Project 10 on Windows, start it with its MCP server enabled and call again. " +
  "Getting started: " + GET_STARTED_URL;
const KEY_HINT =
  "The MCP endpoint of Rillsoft Project requires an API key (HTTP 401). This launcher never " +
  "sends a key: remove the key in Rillsoft Project or connect your client directly to " +
  ENDPOINT + " with the key.";

// ---- diagnostics (stderr and optional log file) --------------------------------------------

const logFile = process.env.RILLSOFT_MCP_LOG;

function log(kind, text) {
  if (!logFile) return;
  try {
    fs.appendFileSync(logFile, new Date().toISOString() + " " + kind + " " + text + "\n");
  } catch {
    /* a broken log file must not disturb the session */
  }
}

function note(text) {
  process.stderr.write(TAG + ": " + text + "\n");
  log("note", text);
}

function describe(err) {
  if (!err) return "unknown error";
  if (err.cause && err.cause.code) return err.cause.code;
  if (err.name === "TimeoutError" || err.name === "AbortError") return "timeout";
  return err.message || String(err);
}

// ---- stdout: JSON-RPC lines only -----------------------------------------------------------

process.stdout.on("error", () => process.exit(0)); // the client closed the pipe

function send(msg) {
  const line = JSON.stringify(msg);
  process.stdout.write(line + "\n");
  log("out", line);
}

function sendError(id, code, message) {
  send({ jsonrpc: "2.0", id: id === undefined ? null : id, error: { code, message } });
}

function isRequest(msg) {
  return msg !== null && typeof msg === "object" && !Array.isArray(msg) &&
    msg.id !== undefined && msg.method !== undefined;
}

// ---- fallback: answers from tools-list.json ------------------------------------------------

let toolsCache = null;

function toolsList() {
  if (toolsCache) return toolsCache;
  try {
    const raw = fs.readFileSync(TOOLS_FILE, "utf8").replace(/^﻿/, "");
    const data = JSON.parse(raw);
    toolsCache = {
      tools: Array.isArray(data.tools) ? data.tools : [],
      serverInfo: data.serverInfo || { name: "rillsoft-project", version: "0" },
      protocolVersion: data.protocolVersion || PROTOCOL_VERSION,
    };
  } catch (err) {
    note("tools-list.json not readable (" + describe(err) + "); tools/list is empty");
    toolsCache = {
      tools: [],
      serverInfo: { name: "rillsoft-project", version: "0" },
      protocolVersion: PROTOCOL_VERSION,
    };
  }
  return toolsCache;
}

function answerLocally(line, msg) {
  if (msg === null || typeof msg !== "object") return sendError(null, -32700, "Parse error");
  if (Array.isArray(msg)) return sendError(null, -32600, "JSON-RPC batches are not supported");
  if (msg.method === undefined || msg.id === undefined) return; // client response or notification
  const t = toolsList();
  switch (msg.method) {
    case "initialize":
      return send({
        jsonrpc: "2.0",
        id: msg.id,
        result: {
          protocolVersion: t.protocolVersion,
          capabilities: { tools: {} },
          serverInfo: t.serverInfo,
          instructions: NOT_RUNNING,
        },
      });
    case "ping":
      return send({ jsonrpc: "2.0", id: msg.id, result: {} });
    case "tools/list":
      return send({ jsonrpc: "2.0", id: msg.id, result: { tools: t.tools } });
    case "tools/call": {
      const name = msg.params && msg.params.name ? String(msg.params.name) : "?";
      return send({
        jsonrpc: "2.0",
        id: msg.id,
        result: { content: [{ type: "text", text: CALL_HINT + " (tool: " + name + ")" }], isError: true },
      });
    }
    default:
      return sendError(msg.id, -32601, "Method not found: " + msg.method + ". " + NOT_RUNNING);
  }
}

// ---- bridge: stdio <-> Streamable HTTP -----------------------------------------------------

let sessionId = null;

function post(line, timeoutMs) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
    "MCP-Protocol-Version": PROTOCOL_VERSION,
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const opts = { method: "POST", headers, body: line };
  if (timeoutMs) opts.signal = AbortSignal.timeout(timeoutMs);
  return fetch(ENDPOINT, opts);
}

async function relaySse(body) {
  const decoder = new TextDecoder("utf-8");
  let buf = "";
  let data = [];
  const flush = () => {
    if (data.length === 0) return;
    const text = data.join("\n");
    data = [];
    try {
      send(JSON.parse(text));
    } catch {
      note("non-JSON event ignored: " + text.slice(0, 200));
    }
  };
  for await (const chunk of body) {
    buf += decoder.decode(chunk, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      let l = buf.slice(0, i);
      buf = buf.slice(i + 1);
      if (l.endsWith("\r")) l = l.slice(0, -1);
      if (l === "") { flush(); continue; }
      if (l.startsWith(":")) continue;
      const c = l.indexOf(":");
      const field = c < 0 ? l : l.slice(0, c);
      let value = c < 0 ? "" : l.slice(c + 1);
      if (value.startsWith(" ")) value = value.slice(1);
      if (field === "data") data.push(value);
    }
  }
  flush();
}

async function relay(res, wantsReply, id) {
  const sid = res.headers.get("mcp-session-id");
  if (sid && !sessionId) sessionId = sid;
  const ctype = (res.headers.get("content-type") || "").toLowerCase();
  log("http", res.status + " " + ctype);
  if (res.status === 202 || res.status === 204) return; // notification or client response accepted
  if (!res.ok) {
    let body = "";
    try { body = (await res.text()).trim(); } catch { /* ignore */ }
    let text;
    if (res.status === 401) {
      text = KEY_HINT;
    } else if (res.status === 404) {
      text = "Rillsoft Project endpoint " + ENDPOINT + " answered HTTP 404: the session is unknown " +
        "or expired (30 minutes idle). Reconnect the client.";
    } else {
      text = "Rillsoft Project endpoint " + ENDPOINT + " answered HTTP " + res.status +
        (body ? ": " + body.slice(0, 300) : "");
    }
    note(text);
    if (wantsReply) sendError(id, -32000, text);
    return;
  }
  if (ctype.includes("text/event-stream")) return relaySse(res.body);
  const body = await res.text();
  if (!body.trim()) return;
  let msg;
  try {
    msg = JSON.parse(body);
  } catch {
    note("non-JSON answer ignored: " + body.slice(0, 200));
    return;
  }
  if (Array.isArray(msg)) msg.forEach(send); else send(msg);
}

async function forward(line, msg) {
  const wantsReply = isRequest(msg);
  const id = wantsReply ? msg.id : undefined;
  try {
    const res = await post(line);
    await relay(res, wantsReply, id);
  } catch (err) {
    const text = "Rillsoft Project endpoint " + ENDPOINT + " not reachable (" + describe(err) + "). " +
      "Rillsoft Project 10 was closed or its MCP server stopped; start it again and reconnect the client.";
    note(text);
    if (wantsReply) sendError(id, -32000, text);
  }
}

// ---- session: the first line decides between bridge and fallback --------------------------

let mode = null; // null until decided, then "bridge" or "fallback"
let deciding = false;
let queue = [];
let stdinEnded = false;

async function decide() {
  const first = queue.shift();
  const wantsReply = isRequest(first.msg);
  let res = null;
  let failure = null;
  try {
    res = await post(first.line, INITIALIZE_TIMEOUT_MS);
  } catch (err) {
    failure = err;
  }
  if (res) {
    mode = "bridge";
    note("bridge to " + ENDPOINT + " (HTTP " + res.status + ")");
    try {
      await relay(res, wantsReply, wantsReply ? first.msg.id : undefined);
    } catch (err) {
      const text = "Rillsoft Project endpoint " + ENDPOINT + " broke off during initialize (" + describe(err) + ")";
      note(text);
      if (wantsReply) sendError(first.msg.id, -32000, text);
    }
  } else {
    mode = "fallback";
    note("Rillsoft Project not reachable at " + ENDPOINT + " (" + describe(failure) + "); answering from " +
      "tools-list.json. Windows only, requires Rillsoft Project 10 running for real results.");
    answerLocally(first.line, first.msg);
  }
  const rest = queue;
  queue = [];
  for (const q of rest) dispatch(q.line, q.msg);
  deciding = false;
  if (stdinEnded) finish();
}

function dispatch(line, msg) {
  if (mode === "bridge") forward(line, msg);
  else answerLocally(line, msg);
}

function handleLine(line) {
  if (line.trim() === "") return;
  log("in", line);
  let msg = null;
  try {
    msg = JSON.parse(line);
  } catch {
    msg = null;
  }
  if (mode !== null) return dispatch(line, msg);
  queue.push({ line, msg });
  if (!deciding) {
    deciding = true;
    decide();
  }
}

// ---- shutdown: EOF on stdin closes the session at the endpoint -----------------------------

let finishing = false;

async function closeSession() {
  if (mode !== "bridge" || !sessionId) return;
  try {
    await fetch(ENDPOINT, {
      method: "DELETE",
      headers: { "Mcp-Session-Id": sessionId, "MCP-Protocol-Version": PROTOCOL_VERSION },
      signal: AbortSignal.timeout(CLOSE_TIMEOUT_MS),
    });
    note("session closed at " + ENDPOINT);
  } catch (err) {
    note("closing the session failed (" + describe(err) + ")");
  }
}

// process.exit drops output that is still queued for a pipe or socket (the tools/list answer
// is about 385 kB), so exit only after everything written to stdout has been flushed.
function exitAfterFlush() {
  setTimeout(() => process.exit(0), 5000).unref();
  process.stdout.write("", () => process.exit(0));
}

function finish() {
  if (finishing) return;
  finishing = true;
  closeSession().then(exitAfterFlush, exitAfterFlush);
}

process.on("SIGINT", finish);
process.on("SIGTERM", finish);
process.on("unhandledRejection", (err) => note("internal error: " + describe(err)));

// ---- stdin: one JSON-RPC message per line --------------------------------------------------

process.stdin.setEncoding("utf8");
let inbuf = "";
process.stdin.on("data", (d) => {
  inbuf += d;
  let i;
  while ((i = inbuf.indexOf("\n")) >= 0) {
    let l = inbuf.slice(0, i);
    inbuf = inbuf.slice(i + 1);
    if (l.endsWith("\r")) l = l.slice(0, -1);
    handleLine(l);
  }
});
process.stdin.on("end", () => {
  if (inbuf.trim() !== "") handleLine(inbuf);
  inbuf = "";
  stdinEnded = true;
  if (!deciding) finish();
});
