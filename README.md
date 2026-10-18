# Rillsoft Project MCP server

[Deutsch](README.de.md)

Rillsoft AI is the AI gateway to Rillsoft Project, the specialist solution for
multi-project resource and capacity planning in mid-sized industrial
companies: an MCP server built into Rillsoft Project 10, on top of its
scheduling engine – not on top of a task list.

The server runs inside the visible, running Rillsoft Project on Windows and
exposes the open project to an AI assistant or a script over the Model
Context Protocol: project structure and schedule, roles, people, teams,
machines and material, candidate search and staffing assistants, capacity
analysis, baselines and plan/actual comparison, progress and status date, the
resource pool, undo and redo.

This repository contains **documentation, client configuration and the npm
launcher** (`launcher.js`, see [Install via npx](#install-via-npx-launcher)).
The server itself is part of the Rillsoft Project 10 desktop application; the
launcher only forwards to it, and there is no hosted endpoint.

Full documentation: **https://rillsoft.ai/en/mcp/**

## At a glance

| | |
|---|---|
| Endpoint | `http://127.0.0.1:3928/mcp` |
| Protocol | MCP over Streamable HTTP, revision `2025-06-18` |
| Reach | `127.0.0.1` only – no cloud service, nothing is sent to Rillsoft |
| Requirement | Rillsoft Project 10 on Windows |
| Access protection | optional API key, read-only mode, browser origins rejected |
| Trade-off | an MCP call carries no user identity and reaches exactly one Rillsoft Project instance |

## What it is not

- Not a task, to-do or Kanban tool, and not a platform for chat, wiki or team
  collaboration.
- Not a standalone AI product or chat plug-in, but AI access to Rillsoft
  Project as a whole – product, editions and pricing are on
  [www.rillsoft.com](https://www.rillsoft.com/mcp-server/).
- Not an AI that schedules on its own: Rillsoft Project calculates dates,
  workload and the critical path; the AI reads the result.
- Not a cloud service: the server is reachable on `127.0.0.1` only, inside
  the open Rillsoft Project. Rillsoft sends nothing; what your AI client sends
  is governed by its provider's privacy policy.
- Not a team server: there is no remote access.
- Not a portfolio editor: portfolios can be opened and evaluated, but not
  changed.

## Set up

1. **Enable the server.** In Rillsoft Project open **Settings → MCP server**,
   set the active switch and leave **read-only mode** switched on for now.
   Alternatively start `RillPrj.exe /mcp` (port `3928`) or
   `RillPrj.exe /mcp:8123` (another port) for one session.
   **Check:** the status line shows "running on port 3928".
2. **Connect your AI client** with [`clients/generic.json`](clients/generic.json):

   ```json
   {
     "mcpServers": {
       "rillsoft-project": {
         "type": "http",
         "url": "http://127.0.0.1:3928/mcp"
       }
     }
   }
   ```

   With an API key set in the settings, use
   [`clients/generic-api-key.json`](clients/generic-api-key.json)
   (`Authorization: Bearer <KEY>`). Ready-made entries per client:

   | Client | File | Where it goes | Verified |
   |---|---|---|---|
   | Claude Code | [`claude-code.mcp.json`](clients/claude-code.mcp.json) | `.mcp.json` in the project folder, or `claude mcp add --transport http rillsoft-project http://127.0.0.1:3928/mcp` | 12 Oct 2026, 2.1.296 |
   | Claude Desktop | [`claude-desktop.json`](clients/claude-desktop.json) | `claude_desktop_config.json` (Settings → Developer → Edit Config); bridge `mcp-remote` needs Node.js | 12 Oct 2026, 2.31226 |
   | Codex | [`codex.toml`](clients/codex.toml) | `~/.codex/config.toml`, or `codex mcp add rillsoft-project --url http://127.0.0.1:3928/mcp` | 12 Oct 2026, CLI 0.162 |
   | VS Code | [`vscode.mcp.json`](clients/vscode.mcp.json) | `.vscode/mcp.json` | 12 Oct 2026, 1.117 |
   | Cursor | [`cursor.mcp.json`](clients/cursor.mcp.json) | `~/.cursor/mcp.json` | per vendor documentation |

   Claude Code and VS Code need Rillsoft Project 10 build 10.0.625 or later.
   Any other client that speaks MCP over Streamable HTTP uses the address
   above; its documentation names the field names.
   **Check:** the client lists the server's tools – in read-only mode only the
   read-only ones. `/mcp` is exact, `/mcp/` is a 404.
3. **Ask the first question**, for example: *Summarize the current project
   status: dates, progress, open conflicts, in five paragraphs.* Shipped
   industry examples with synthetic data let you try it without your own
   projects.

Every mutating call is one ordinary undo step in Rillsoft Project – you take
it back with Ctrl+Z like any of your own edits.

Step by step with success checks: [Get started](https://rillsoft.ai/en/get-started/).

## Install via npx (launcher)

For catalogues, registries and clients that only start stdio servers there is
an npm package,
[`@rillsoft/rillsoft-project-mcp`](https://www.npmjs.com/package/@rillsoft/rillsoft-project-mcp),
built from this repository. It is a launcher, not the server:

- **With Rillsoft Project 10 running** it forwards every request over stdio to
  the endpoint `http://127.0.0.1:3928/mcp`. The address is fixed; there is no
  environment variable for the address and no API key. If an API key is set in
  Rillsoft Project, the launcher reports the `401` – use the HTTP configuration
  above instead. For diagnostics only, `RILLSOFT_MCP_LOG=<file>` writes the
  requests and answers of a session to a log file.
- **Without Rillsoft Project** (not running, or not Windows) it answers
  `initialize` and `tools/list` itself from `tools-list.json` – the same 118
  tools as the program – and every `tools/call` with `isError: true` and a
  hint. This is what lets catalogues show the tools on Linux.

```json
{
  "mcpServers": {
    "rillsoft-project": {
      "command": "npx",
      "args": ["-y", "@rillsoft/rillsoft-project-mcp"]
    }
  }
}
```

Requires Node.js 18 or later; real results only on Windows with Rillsoft
Project 10 running. Customers do not need the launcher: the configurations
above connect directly to the running program.

## Install as Claude plugin

This repository is also a plugin for Claude Code and Cowork (`.claude-plugin/`).
In Claude Code:

```text
/plugin install rillsoft-project --marketplace rillsoft/rillsoft-project-mcp
```

What the plugin does on your machine:

- It starts one local MCP server, `node ${CLAUDE_PLUGIN_ROOT}/launcher.js`
  (Node.js 18 or later), the same launcher as the npm package above.
- The launcher talks only to `http://127.0.0.1:3928/mcp`, the MCP endpoint of
  Rillsoft Project 10 running on the same computer. It sends no data anywhere
  else, collects no telemetry, needs no account and no API key.
- Without Rillsoft Project running it reads `tools-list.json` from the plugin
  folder and lists the tools; every tool call then answers with a hint instead
  of a result.
- It writes a log file only if you set `RILLSOFT_MCP_LOG=<file>` yourself.

Your AI client sends the project data that the tools return to its provider,
as with every MCP server. Local plugin servers run in Claude Code and Cowork;
the chat in Claude Desktop ignores them – use the configuration under
“Set up” there.

## If something is stuck

| Symptom | Cause and remedy |
|---|---|
| `400` | session or protocol revision missing – send `initialize`, then include `Mcp-Session-Id` and `MCP-Protocol-Version: 2025-06-18` |
| `401` | an API key is set; the client needs `Authorization: Bearer <KEY>` |
| `403` | the request carries an `Origin` header as browsers send it; use an MCP client, not a browser page |
| no port after a crash | the auto-recovery dialog is waiting; answer it or start `RillPrj.exe /mcp` |
| server does not listen immediately | it starts a few seconds after the program |

## Tool catalogue and contract

Tool names carry the prefix `rillsoft_` and are English in every language
build; arguments, result fields, enum values and error codes are stable,
messages follow the language of the running Rillsoft Project. How
`tools/list`, schemas, errors, undo, read-only mode and sessions work:
[Developers: the MCP server contract](https://rillsoft.ai/en/developers/).

The complete tool catalogue – 118 tools of Rillsoft Project 10.0.626.0 with
title, access class, parameters and description – is in
[TOOLS.md](TOOLS.md). It is generated from `tools/list` of the running program
by `scripts/generate_tools.py`, never edited by hand; the raw result, including
the output schemas, is in [tools-list.json](tools-list.json).

## Links

- MCP server: https://rillsoft.ai/en/mcp/
- Get started: https://rillsoft.ai/en/get-started/
- Developers: https://rillsoft.ai/en/developers/
- Prompt library: https://rillsoft.ai/en/prompts/
- Product: https://www.rillsoft.com/mcp-server/
- Official MCP Registry: `ai.rillsoft/rillsoft-project` ([entry](https://registry.modelcontextprotocol.io/v0/servers?search=ai.rillsoft/rillsoft-project))

## Provider

Rillsoft GmbH, Leonberg, Germany – software for scheduling, resource and
multi-project planning. Rillsoft Project is proprietary software; this
repository contains its MCP documentation and the launcher.

## License

The documentation and the tool catalogue in this repository are licensed
under [CC BY 4.0](LICENSE); the launcher code (`launcher.js`) under the
[MIT License](LICENSE-MIT). Rillsoft Project itself, including its MCP
server, is proprietary software of Rillsoft GmbH and is not covered by either
license.
