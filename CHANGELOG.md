# Changelog

## 2026-10-18 (2)

- Fix: when a client closes stdin while answers are still on their way, the
  launcher now delivers them before it closes the session (at most 10 s),
  then sends `DELETE /mcp`. Before, an answer in flight could be lost
  (seen: `tools/list` after `tools/call`).
- Fix: the launcher ends without `process.exit`. On Windows, `process.exit`
  while fetch connections were closing aborted Node with a libuv assertion
  (`!(handle->flags & UV_HANDLE_CLOSING)`, exit code 0xC0000409), e.g. after
  an HTTP 401 or with answers in flight. stdout is still flushed before the
  end (Linux pipe case of 2026-10-18 checked again).
- The session close reports the HTTP status when `DELETE /mcp` is not
  answered with success.

## 2026-10-18

- Fix: `launcher.js` no longer exits before stdout is flushed. A client that
  spawns the launcher through a pipe and closes stdin right after
  `tools/list` (seen with a Node parent under Linux) received the 385 kB
  answer cut off after the first 64 kB; the launcher now waits for the last
  write before it exits (at most 5 s).
- README EN/DE link the npm package `@rillsoft/rillsoft-project-mcp`
  instead of "not yet published". Workflow `.github/workflows/npm-publish.yml`
  publishes later versions from a GitHub release through npm trusted
  publishing (OIDC, provenance, no stored token); it skips a version that is
  already on npm. The first version 10.0.626 is published by hand.

## 2026-10-17 (4)

- `package.json`: scripts `build` (`node --check launcher.js`) and `test`
  (`node client-test.js`). Glama derives `pnpm install && pnpm run build`
  for Node repositories and failed with "Missing script: build"; the build
  script only validates the launcher, there is nothing to compile.

## 2026-10-17 (3)

- Tool catalogue regenerated from Rillsoft Project 10.0.626.0 (118 tools,
  decision of 2026-10-17 to use build 10.0.626 for the catalogue entries):
  only `rillsoft_project_status_date_reschedule` changed its description
  ("Reschedules only the unfinished work ..."). Package version raised to
  10.0.626 so that package and tool list belong to the same build.

## 2026-10-17 (2)

- `launcher.js` implemented: bridge from stdio to the fixed endpoint
  `http://127.0.0.1:3928/mcp` (Streamable HTTP; session id and protocol
  version on every request, JSON and SSE answers written as JSON-RPC lines,
  `DELETE /mcp` at EOF) and fallback without Rillsoft Project (`initialize`
  with `instructions` naming the state, `tools/list` from `tools-list.json`,
  `tools/call` with `isError: true` and a hint, `ping`, otherwise `-32601`).
  The mode is decided once at `initialize` (connection refused or 2 s
  timeout); a later outage or an HTTP `401` (API key set in the program) is
  reported as a JSON-RPC error, never as a silent fallback. No dependencies,
  Node 18 or later; only `RILLSOFT_MCP_LOG=<file>` for diagnostics.
  `client-test.js` (not in the package) exercises both modes and checks that
  stdout carries JSON-RPC only and that the launcher exits after EOF.

## 2026-10-17

- Launcher scaffold for the npm package `@rillsoft/rillsoft-project-mcp`
  (not yet published): `package.json` (bin `rillsoft-project-mcp`, files
  `launcher.js`, `tools-list.json`, READMEs, licenses, `mcpName`
  `ai.rillsoft/rillsoft-project`, no `os` field, version = program build
  10.0.624), `LICENSE-MIT` for the launcher code, README section "Install
  via npx" in English and German. `launcher.js` is a placeholder that reports
  its state; the bridge to `http://127.0.0.1:3928/mcp` and the fallback that
  lists the tools without Rillsoft Project follow in the next change. The
  address is fixed; the launcher knows no environment variables and no API
  key.

## 2026-10-12

- Client configurations per client in `clients/`: Claude Code
  (`claude-code.mcp.json`), Claude Desktop via the `mcp-remote` bridge
  (`claude-desktop.json`), Codex (`codex.toml`), VS Code (`vscode.mcp.json`)
  and Cursor (`cursor.mcp.json`); README table with file, location and
  verification date. Claude Code and VS Code need build 10.0.625 or later.

## 2026-09-29 (2)

- Tool catalogue regenerated from Rillsoft Project 10.0.624.0 (118 tools)
  after the follow-up to the portfolio change: `rillsoft_project_team_preference_set`
  and `_remove` no longer say "refused in a portfolio" - there `projectUuid`
  names a project or subproject, and the portfolio itself carries no
  preferred team (an empty `projectUuid` is refused, as in the user
  interface). Eleven more tools now state their portfolio limit in their own
  description (`rillsoft_task_create`, `rillsoft_subproject_create`,
  `rillsoft_element_move`, `rillsoft_element_subproject_group`,
  `rillsoft_task_dependency_create`, `rillsoft_machine_sharing_create`,
  `rillsoft_baseline_create/_select/_delete`, `rillsoft_document_ris_create`,
  `rillsoft_project_ris_save`). No new tools, no new parameters.

## 2026-09-29

- Tool catalogue regenerated from Rillsoft Project 10.0.624.0 (118 tools):
  inside an open portfolio the tools now work as in a single project, with
  the limits of the user interface. Five tool descriptions
  (`rillsoft_project_sort`, `rillsoft_project_renumber`,
  `rillsoft_portfolio_file_open`, `rillsoft_portfolio_ris_open`,
  `rillsoft_document_ris_list`) and the parameter descriptions of
  `rillsoft_project_update` no longer say "refused in a portfolio" but name
  the remaining limits (nothing directly
  below the portfolio, no task or subproject changes its project, a
  dependency across the project boundary only as a RIS link, no baseline,
  no 'save as'). New result field `portfolioId` in
  `rillsoft_document_ris_list`. No new tools, no new parameters.

## 2026-09-28

- Tool catalogue `TOOLS.md` and raw `tools-list.json` generated from
  `tools/list` of Rillsoft Project 10.0.624.0 (118 tools) by
  `scripts/generate_tools.py`; `tools-catalogue.json` (grouped, without
  schemas) is the source of the catalogue on rillsoft.ai.

- Published to the official MCP Registry as `ai.rillsoft/rillsoft-project`
  version 10.0.0 (namespace verified via DNS on `rillsoft.ai`).

- Initial documentation for the MCP server built into Rillsoft Project 10:
  README (EN, DE), client configurations.
