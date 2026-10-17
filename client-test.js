#!/usr/bin/env node
// Test client for launcher.js. Starts the launcher like an MCP client over stdio, sends
// initialize, notifications/initialized, tools/list, tools/call, ping and an unknown method,
// measures the time per answer, compares tools/list with tools-list.json, closes stdin and
// checks that the launcher exits. Both modes are covered:
//
//   node client-test.js                       without Rillsoft Project: fallback expected
//   node client-test.js                       with Rillsoft Project 10 running: bridge expected
//   node client-test.js --tool <name>         tool for the tools/call step
//                                             (default rillsoft_project_tree_get)
//
// Exit code 0 when every check of the detected mode passes, 1 otherwise. Not part of the
// npm package.
"use strict";

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const LAUNCHER = path.join(__dirname, "launcher.js");
const TOOLS_FILE = path.join(__dirname, "tools-list.json");
const NOT_RUNNING_PREFIX = "Rillsoft Project 10 is not running";
const TIMEOUT_MS = 15000;

const argTool = process.argv.indexOf("--tool");
const TOOL = argTool >= 0 && process.argv[argTool + 1] ? process.argv[argTool + 1] : "rillsoft_project_tree_get";

const requests = [
  { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "client-test", version: "0" } } },
  { jsonrpc: "2.0", method: "notifications/initialized" },
  { jsonrpc: "2.0", id: 2, method: "tools/list" },
  { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: TOOL, arguments: {} } },
  { jsonrpc: "2.0", id: 4, method: "ping" },
  { jsonrpc: "2.0", id: 5, method: "rillsoft/unknown_method" },
];
const expectedIds = requests.filter((r) => r.id !== undefined).map((r) => r.id);

const file = JSON.parse(fs.readFileSync(TOOLS_FILE, "utf8").replace(/^﻿/, ""));
const fileTools = file.tools;

const t0 = Date.now();
const sentAt = new Map();
const answers = new Map();
const timing = new Map();
let nonJsonLines = 0;
let stderrLines = [];
let buf = "";

const child = spawn(process.execPath, [LAUNCHER], { stdio: ["pipe", "pipe", "pipe"] });
child.stderr.setEncoding("utf8");
child.stderr.on("data", (d) => {
  for (const l of d.split("\n")) if (l.trim()) { stderrLines.push(l); console.log("  [stderr] " + l); }
});
child.stdout.setEncoding("utf8");
child.stdout.on("data", (d) => {
  buf += d;
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    let msg;
    try { msg = JSON.parse(line); } catch { nonJsonLines++; console.log("  NOT JSON: " + line.slice(0, 160)); continue; }
    const dt = Date.now() - (sentAt.get(msg.id) || t0);
    timing.set(msg.id, dt);
    answers.set(msg.id, msg);
    console.log("  id=" + msg.id + " after " + dt + " ms: " + line.slice(0, 140) + (line.length > 140 ? " ..." : ""));
    if (expectedIds.every((id) => answers.has(id))) finish();
  }
});
child.on("error", (e) => { console.log("launcher could not be started: " + e.message); process.exit(1); });

for (const r of requests) {
  if (r.id !== undefined) sentAt.set(r.id, Date.now());
  child.stdin.write(JSON.stringify(r) + "\n");
}
const guard = setTimeout(() => { console.log("TIMEOUT: not every answer arrived within " + TIMEOUT_MS + " ms"); finish(); }, TIMEOUT_MS);

function sortedTools(tools) {
  return JSON.stringify([...tools].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)));
}

function finish() {
  clearTimeout(guard);
  const results = [];
  const check = (name, ok, detail, warnOnly) => {
    results.push({ name, ok: ok || warnOnly === true, label: ok ? "PASS" : warnOnly ? "WARN" : "FAIL", detail });
  };

  const init = answers.get(1);
  const initResult = init && init.result;
  const mode = initResult && typeof initResult.instructions === "string" && initResult.instructions.startsWith(NOT_RUNNING_PREFIX) ? "fallback" : "bridge";
  console.log("");
  console.log("Mode detected: " + mode + (initResult && initResult.serverInfo ? " (serverInfo " + initResult.serverInfo.name + " " + initResult.serverInfo.version + ")" : ""));

  check("stdout carries JSON-RPC lines only", nonJsonLines === 0, nonJsonLines + " non-JSON line(s)");
  check("initialize answered with result", !!initResult, init ? JSON.stringify(init).slice(0, 120) : "no answer");
  check("initialize under 3 s", timing.has(1) && timing.get(1) < 3000, (timing.get(1) || "-") + " ms");
  check("initialize names protocolVersion and serverInfo", !!(initResult && initResult.protocolVersion && initResult.serverInfo && initResult.serverInfo.name), initResult ? initResult.protocolVersion + " / " + JSON.stringify(initResult.serverInfo) : "-");
  if (mode === "fallback") check("initialize instructions name the state", true, initResult.instructions);

  const list = answers.get(2);
  const tools = list && list.result && Array.isArray(list.result.tools) ? list.result.tools : null;
  check("tools/list answered", !!tools, tools ? tools.length + " tools" : (list ? JSON.stringify(list).slice(0, 160) : "no answer"));
  if (tools) {
    const same = sortedTools(tools) === sortedTools(fileTools);
    const names = new Set(tools.map((t) => t.name));
    const missing = fileTools.filter((t) => !names.has(t.name)).map((t) => t.name);
    const extra = tools.filter((t) => !fileTools.some((f) => f.name === t.name)).map((t) => t.name);
    check("tools/list equals tools-list.json (" + fileTools.length + " tools)", same,
      same ? "identical" : "differs: " + tools.length + " vs " + fileTools.length + (missing.length ? ", missing " + missing.join(",") : "") + (extra.length ? ", extra " + extra.join(",") : "") + (!missing.length && !extra.length ? ", same names but different content" : ""),
      mode === "bridge");
  }

  const call = answers.get(3);
  const callResult = call && call.result;
  if (mode === "fallback") {
    check("tools/call answers isError: true with a hint", !!(callResult && callResult.isError === true && callResult.content && callResult.content[0] && /rillsoft\.ai/.test(callResult.content[0].text)), callResult ? callResult.content[0].text.slice(0, 120) : (call ? JSON.stringify(call).slice(0, 160) : "no answer"));
  } else {
    const real = !!(callResult && callResult.isError !== true);
    check("tools/call " + TOOL + " returns a real result", real, callResult ? (real ? JSON.stringify(callResult).slice(0, 160) : "isError: " + (callResult.content && callResult.content[0] ? callResult.content[0].text.slice(0, 160) : "")) : (call ? JSON.stringify(call).slice(0, 160) : "no answer"), !real && !!callResult);
  }

  const ping = answers.get(4);
  check("ping answers {}", !!(ping && ping.result && typeof ping.result === "object" && Object.keys(ping.result).length === 0), ping ? JSON.stringify(ping) : "no answer");

  const unknown = answers.get(5);
  if (mode === "fallback") check("unknown method answers -32601", !!(unknown && unknown.error && unknown.error.code === -32601), unknown ? JSON.stringify(unknown.error) : "no answer");
  else check("unknown method answers an error", !!(unknown && unknown.error), unknown ? JSON.stringify(unknown.error).slice(0, 160) : "no answer");

  console.log("Total until last answer: " + (Date.now() - t0) + " ms");
  child.stdin.end();
  setTimeout(() => {
    check("launcher exits within 1.5 s after EOF", child.exitCode !== null, "exitCode " + child.exitCode);
    if (child.exitCode === null) child.kill();
    console.log("");
    let failed = 0;
    for (const r of results) {
      if (r.label === "FAIL") failed++;
      console.log("  " + r.label + "  " + r.name + (r.detail ? " - " + r.detail : ""));
    }
    console.log("");
    console.log(failed === 0 ? "OK: all checks of mode " + mode + " passed" : "FAILED: " + failed + " check(s)");
    process.exit(failed === 0 ? 0 : 1);
  }, 1500);
}
