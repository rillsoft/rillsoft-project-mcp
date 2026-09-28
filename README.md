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

This repository contains **documentation and client configuration only**. The
server is part of the Rillsoft Project 10 desktop application; there is no
package to install and no hosted endpoint.

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
   (`Authorization: Bearer <KEY>`). The format follows the MCP specification;
   field names may differ per client – your client's documentation is
   authoritative. We have verified the connection with Claude and Codex.
   **Check:** the client lists the server's tools – in read-only mode only the
   read-only ones. `/mcp` is exact, `/mcp/` is a 404.
3. **Ask the first question**, for example: *Summarize the current project
   status: dates, progress, open conflicts, in five paragraphs.* Shipped
   industry examples with synthetic data let you try it without your own
   projects.

Every mutating call is one ordinary undo step in Rillsoft Project – you take
it back with Ctrl+Z like any of your own edits.

Step by step with success checks: [Get started](https://rillsoft.ai/en/get-started/).

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

The complete tool catalogue – 118 tools of Rillsoft Project 10.0.624.0 with
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
repository contains its MCP documentation only.

## License

The documentation in this repository is licensed under
[CC BY 4.0](LICENSE). Rillsoft Project itself, including its MCP server, is
proprietary software of Rillsoft GmbH and is not covered by this license.
