# Changelog

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
