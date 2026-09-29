# Tool catalogue

Generated from `tools/list` of Rillsoft Project **10.0.624.0** on 2026-09-29 (MCP protocol `2025-06-18`) by `scripts/generate_tools.py`. Do not edit by hand – the running program is the contract; what `tools/list` of your installation returns applies.

118 tools: 37 read-only, 81 writing (of which 38 marked destructive). Names, titles, descriptions and parameters are English in every language build. Undo, read-only mode, errors and sessions: [Developers: the MCP server contract](https://rillsoft.ai/en/developers/). Output schemas are part of `tools/list` ([`tools-list.json`](tools-list.json)) and not repeated here.

**Access** follows the tool annotations: *read-only* (`readOnlyHint`), *write*, *write, destructive* (`destructiveHint`). **Parameters** marked \* are required.

## Rillsoft Integration Server (RIS)

Tools with `_ris_` in their name work on projects, portfolios, resource pools, documents and folders stored in a Rillsoft Integration Server (RIS) – run by your company or provided as Rillsoft Cloud. The MCP server itself always runs locally inside Rillsoft Project on `127.0.0.1`; it uses the RIS connection configured in Rillsoft Project. There is no Rillsoft cloud MCP endpoint.

## Contents

- [Projects and files](#projects-and-files) (20)
- [Structure: subprojects, elements and outline](#structure-subprojects-elements-and-outline) (11)
- [Tasks, assignments and progress](#tasks-assignments-and-progress) (19)
- [Resources and resource pool](#resources-and-resource-pool) (18)
- [Calendars](#calendars) (6)
- [Baselines and variance](#baselines-and-variance) (5)
- [Analysis](#analysis) (2)
- [Portfolios](#portfolios) (8)
- [RIS documents and folders](#ris-documents-and-folders) (10)
- [View, window and session](#view-window-and-session) (19)

## Projects and files

| Tool | Title | Access |
|---|---|---|
| [`rillsoft_project_conflict_list`](#rillsoft_project_conflict_list) | List conflicts | read-only |
| [`rillsoft_project_create`](#rillsoft_project_create) | Create project | write, destructive |
| [`rillsoft_project_file_export_xml`](#rillsoft_project_file_export_xml) | Export project as RIS XML | write, destructive |
| [`rillsoft_project_file_open`](#rillsoft_project_file_open) | Open project file | write, destructive |
| [`rillsoft_project_file_save`](#rillsoft_project_file_save) | Save project file | write, destructive |
| [`rillsoft_project_file_save_as`](#rillsoft_project_file_save_as) | Save project file as | write, destructive |
| [`rillsoft_project_renumber`](#rillsoft_project_renumber) | Renumber project | write |
| [`rillsoft_project_reschedule`](#rillsoft_project_reschedule) | Reschedule project | write |
| [`rillsoft_project_ris_delete`](#rillsoft_project_ris_delete) | Delete RIS project | write, destructive |
| [`rillsoft_project_ris_list`](#rillsoft_project_ris_list) | List RIS projects | read-only |
| [`rillsoft_project_ris_open`](#rillsoft_project_ris_open) | Open RIS project | write, destructive |
| [`rillsoft_project_ris_save`](#rillsoft_project_ris_save) | Save RIS project | write, destructive |
| [`rillsoft_project_ris_save_as`](#rillsoft_project_ris_save_as) | Save RIS project as | write, destructive |
| [`rillsoft_project_sort`](#rillsoft_project_sort) | Reorder elements | write |
| [`rillsoft_project_status_date_reschedule`](#rillsoft_project_status_date_reschedule) | Reschedule at status date | write |
| [`rillsoft_project_status_date_set`](#rillsoft_project_status_date_set) | Set status date | write |
| [`rillsoft_project_team_preference_remove`](#rillsoft_project_team_preference_remove) | Remove preferred team | write, destructive |
| [`rillsoft_project_team_preference_set`](#rillsoft_project_team_preference_set) | Set preferred team | write |
| [`rillsoft_project_tree_get`](#rillsoft_project_tree_get) | Read project | read-only |
| [`rillsoft_project_update`](#rillsoft_project_update) | Set project properties | write |

### rillsoft_project_conflict_list

**List conflicts** · read-only · Parameters: `category`

Reads the six conflict lists of the info sheet as a flat YAML report: delayed (tasks lagging behind the status date), overload (overallocated resources), resourceLoss (failed resources), unassigned (unassigned resources), partiallyAssigned (partially assigned resources) and crossProjectDependencies (cross-project dependencies together with their float). The same selection as the tabs of that sheet; one task can appear in several lists. Numbers in hours, dates as everywhere else. Read-only, no undo step.

### rillsoft_project_create

**Create project** · write, destructive · Parameters: `discardChanges`, `name`

Creates a new empty project and replaces the one that is open. With unsaved changes pending, discardChanges:true is required. Opening an existing file goes through rillsoft_project_file_open. The command history starts over, so this call cannot be undone.

### rillsoft_project_file_export_xml

**Export project as RIS XML** · write, destructive · Parameters: `path`\*, `overwrite`

Writes the open project into an .xml file in exactly the form the Rillsoft Integration Server receives on upload (rillprj version 13, UTF-8, stylesheet instruction). This is not the older 'save as XML' of the File menu, which follows its own settings. Where that file exists already, overwrite:true is required. The project itself is not touched - neither its path nor its saved state changes - and a portfolio is refused. No undo step.

### rillsoft_project_file_open

**Open project file** · write, destructive · Parameters: `path`\*, `discardChanges`

Opens exactly one project file (.rpj) and replaces the current project. A portfolio (.rpp) is refused; rillsoft_portfolio_file_open covers that. With unsaved changes pending, discardChanges:true is required. No undo step - the command history starts over. Whatever the loader has to say ends up in note.

### rillsoft_project_file_save

**Save project file** · write, destructive · Parameters: –

Saves the open project under the path it already has. Where it has never been saved, rillsoft_project_file_save_as is required. An open portfolio is refused; there rillsoft_portfolio_project_files_save writes the contained project files back. No undo step.

### rillsoft_project_file_save_as

**Save project file as** · write, destructive · Parameters: `path`\*, `overwrite`

Saves the project under a new path (.rpj). Where that file exists already, overwrite:true is required. Refused while a portfolio is open; there rillsoft_portfolio_project_files_save saves the contained projects. No undo step.

### rillsoft_project_renumber

**Renumber project** · write · Parameters: –

Renumbers the project - the same function as the 'Renumber' menu: pull WBS codes into a gapless sequence, align task numbers with the WBS order, normalize the structure. Worth doing after rillsoft_project_sort or after many rillsoft_element_move calls. In a portfolio only the WBS codes are pulled, as the menu does there - task numbers are assigned per project and stay. One undo step.

### rillsoft_project_reschedule

**Reschedule project** · write · Parameters: `direction`

Reschedules the project: the same menu entries as 'Recalculate as early as possible' and 'as late as possible'. Fixed tasks and tasks already begun stay where they are - they are the anchors the rest is aligned to, and nothing moves before the status date. The direction is not stored state but this one-off recalculation; rillsoft_project_tree_get shows the new dates afterwards. One undo step.

### rillsoft_project_ris_delete

**Delete RIS project** · write, destructive · Parameters: `projectId`\*

Deletes a project of the logged-in client on the Rillsoft Integration Server - the 'Delete project' button of the folder dialog. The server deactivates it with all its versions (soft delete; an administrator can restore it there). The project that is open right now, alone or inside the open portfolio, is refused (ris_project_is_open; call rillsoft_project_create first). rillsoft_project_ris_save_as is the counterpart that creates projects; a local file is not touched. Takes effect at once: no undo step. Runs with the login of the desktop session.

### rillsoft_project_ris_list

**List RIS projects** · read-only · Parameters: `permission`

Lists the folders and projects of the logged-in client on the Rillsoft Integration Server (RIS) with projectId, versionId, uuid, name, code, path, lock and template flags - the projectId is what rillsoft_project_ris_open takes. Runs with the login of the desktop session and never asks for credentials; the answer names server, userName and clientId. Local project files are opened through rillsoft_project_file_open instead. Read-only, no undo step.

### rillsoft_project_ris_open

**Open RIS project** · write, destructive · Parameters: `projectId`\*, `discardChanges`, `lock`, `readOnly`

Opens a project of the logged-in client from the Rillsoft Integration Server by its projectId (see rillsoft_project_ris_list) and replaces the current project. Templates are refused (ris_template_unsupported); a local .rpj file is opened through rillsoft_project_file_open instead. With unsaved changes pending, discardChanges:true is required. Runs with the login of the desktop session and never asks for credentials. Saving goes back to the server through rillsoft_project_ris_save. No undo step - the command history starts over. Whatever the loader has to say ends up in note.

### rillsoft_project_ris_save

**Save RIS project** · write, destructive · Parameters: `notes`

Writes the open project back to the Rillsoft Integration Server as a new version of the project it was opened from (rillsoft_project_ris_open). Creates one new version on the server per call; the document is then reloaded from the server; the UUIDs of every element stay valid, and the command history is kept, so the last steps can still be undone afterwards. Refused where the open document is not a project of the server (ris_project_not_open; use rillsoft_project_ris_save_as to store it there as a new project), where it is open read-only (ris_read_only), or where the server holds a newer version or a foreign lock (ris_conflict - reopen it). A local file is saved through rillsoft_project_file_save. An open portfolio is refused (a portfolio of the Integration Server is saved through rillsoft_portfolio_ris_save). Runs with the login of the desktop session and never asks for credentials. No undo step.

### rillsoft_project_ris_save_as

**Save RIS project as** · write, destructive · Parameters: `folderId`\*, `notes`, `template`

Stores the open single project - new, a local file or a project of the server - as a new project in a folder of the logged-in client on the Rillsoft Integration Server. Creates one new project with version 1 per call, even when called twice. The document becomes that server project afterwards: rillsoft_project_ris_save writes further versions, a former file path no longer applies; the command history is kept. The new project is held in the optimistic lock mode; reopen it with rillsoft_project_ris_open lock:pessimistic to lock it. A portfolio is refused; a local copy is written through rillsoft_project_file_save_as. Runs with the login of the desktop session and never asks for credentials. No undo step.

### rillsoft_project_sort

**Reorder elements** · write · Parameters: `criterion`\*

Reorders the elements of the project - the same ordering function as the 'Order by ...' menu. What gets reassigned are the WBS codes; task numbers stay untouched (use rillsoft_project_renumber for those). It acts on the main project and on every subproject; in a portfolio on the portfolio and every project, as the menu does. One undo step.

### rillsoft_project_status_date_reschedule

**Reschedule at status date** · write · Parameters: –

Runs the status date computation: whatever is unfinished moves behind the current status date, computed by RP. One undo step.

### rillsoft_project_status_date_set

**Set status date** · write · Parameters: `statusDate`\*

Sets the status date of the project without recomputing anything. Moving unfinished work behind the new status date is a second, deliberate step through rillsoft_project_status_date_reschedule; recomputing the whole schedule goes through rillsoft_project_reschedule. Values before the project start are lifted to the project start. One undo step.

### rillsoft_project_team_preference_remove

**Remove preferred team** · write, destructive · Parameters: `teamId`\*, `projectUuid`

Takes the preferred team of a project or subproject back out. The counterpart of rillsoft_project_team_preference_set. An inherited preferred team is removed at the pack that carries it; under preferredTeams[] rillsoft_project_tree_get shows only the entries a pack carries itself. Where the project or subproject does not carry that team, the call fails rather than reporting a silent success. In a portfolio projectUuid names a project or a subproject inside it, as in a single project; an empty projectUuid - the portfolio itself - is refused. One undo step.

### rillsoft_project_team_preference_set

**Set preferred team** · write · Parameters: `teamId`\*, `projectUuid`

Marks a team as the preferred team of a project or subproject. This is not an assignment but a preference, carrying neither utilization nor productivity: it is inherited by every subproject below, it presets the team filter in rillsoft_task_resource_candidate_list and in the dialogs, and it narrows the supply in the capacity view split by project. projectUuid addresses the main project (empty) or any subproject. Read it back through rillsoft_project_tree_get (preferredTeams[]). Team assignments on individual tasks do not exist in this contract; people are assigned through rillsoft_task_employee_assignment_set. In a portfolio projectUuid names a project or a subproject inside it, as in a single project; the portfolio itself carries no preferred team (the user interface offers none there), so an empty projectUuid is refused. One undo step.

### rillsoft_project_tree_get

**Read project** · read-only · Parameters: `includePositionRange`

Use this to read tasks and dependencies: it returns the whole project as a tree - key data including the status date, subprojects, tasks (UUID, WBS, computed dates, milestone and critical flags, progress and effort) and every dependency. There is no separate task list tool; this is the read path for them. Read-only, no undo step. Each task carries four assignment arrays: assignments[] (roles), employeeAssignments[], machineRoleAssignments[] and machineAssignments[] - empty where the task holds nothing of that resource type. Where several tasks use one machine or machine role together, it appears in none of those arrays but in sharedAssignments[] (type, id, name, quantity, utilization, sharedTaskUuids[] holding the UUIDs of the other tasks involved); that field is absent where the task shares nothing. A task with sameRow:true is drawn on one display row together with its WBS predecessor. With includePositionRange:true the position range per task is reported as well. Beware: the critical field is not a float indicator.

### rillsoft_project_update

**Set project properties** · write · Parameters: `calendarId`, `categoryId`, `color`, `customerId`, `durationStepUnit`, `dynamicRedistribution`, `effortEditable`, `finish`, `fixed`, `name`, `outputQuantityEditable`, `planningVariant`, `primaryColor`, `priority`, `quantityStepUnit`, `schedulingMode`, `start`, `statusId`, `timeStepMinutes`, `validationMode`

Sets properties of the main project: key data (name, start, finish, fixing), calendar and color, the master-data references category, status, customer, priority and plan variant, plus scheduling mode, input step widths and the two metric switches. This changes the period of the project, not the time scale of the display (use rillsoft_timescale_apply for that). Subprojects go through rillsoft_subproject_update. One undo step.

## Structure: subprojects, elements and outline

| Tool | Title | Access |
|---|---|---|
| [`rillsoft_element_delete`](#rillsoft_element_delete) | Delete element | write, destructive |
| [`rillsoft_element_move`](#rillsoft_element_move) | Move element | write |
| [`rillsoft_element_reorder`](#rillsoft_element_reorder) | Reorder children | write |
| [`rillsoft_element_subproject_group`](#rillsoft_element_subproject_group) | Group elements into subproject | write |
| [`rillsoft_fixed_element_list`](#rillsoft_fixed_element_list) | List fixed elements | read-only |
| [`rillsoft_outline_apply`](#rillsoft_outline_apply) | Apply outline state | read-only |
| [`rillsoft_outline_get`](#rillsoft_outline_get) | Read outline state | read-only |
| [`rillsoft_outline_row_apply`](#rillsoft_outline_row_apply) | Apply outline state of one row | read-only |
| [`rillsoft_subproject_create`](#rillsoft_subproject_create) | Create subproject | write |
| [`rillsoft_subproject_delete`](#rillsoft_subproject_delete) | Delete subproject | write, destructive |
| [`rillsoft_subproject_update`](#rillsoft_subproject_update) | Update subproject | write |

### rillsoft_element_delete

**Delete element** · write, destructive · Parameters: `uuid`\*

Deletes a task or a subproject, together with its dependencies respectively its content. Here element means a task or a subproject - this is the generic way that takes either. Where you know which of the two you have, rillsoft_task_delete and rillsoft_subproject_delete say so in the name and refuse the other kind. The main project cannot be deleted. One undo step.

### rillsoft_element_move

**Move element** · write · Parameters: `direction`, `extractFromSubproject`, `newParentUuid`, `number`, `position`, `uuid`, `uuids`

Moves elements - here an element is a task or a subproject. Give exactly one of position with newParentUuid, direction, or extractFromSubproject. RP reassigns the WBS codes; dependencies and assignments survive. Display rows stay valid: where only part of a row moves away, the row is split cleanly. In a portfolio no element changes its project and none goes directly below the portfolio, as in the user interface; with direction the projects themselves can be reordered at portfolio level. One undo step.

### rillsoft_element_reorder

**Reorder children** · write · Parameters: `orderedUuids`\*, `dissolveRows`, `parentUuid`

Reorders every direct child of a subproject completely and deterministically; a child is an element, meaning a task or a subproject. RP reassigns the WBS codes. An order that separates a display row is refused and names the UUIDs affected. One undo step.

### rillsoft_element_subproject_group

**Group elements into subproject** · write · Parameters: `name`, `uuid`, `uuids`

Creates a subproject and pulls the named elements into it - an element being a task or a subproject. This groups elements that already exist; creating an empty subproject goes through rillsoft_subproject_create. In a portfolio the elements must lie inside a project - at portfolio level a new subproject would be a project, which the user interface does not offer either. One undo step, which takes the new subproject away again as well. The answer names the new subproject (uuid, wbs) and the elements that were moved.

### rillsoft_fixed_element_list

**List fixed elements** · read-only · Parameters: –

Lists every fixed element of the project - an element here being a task, a milestone or a subproject - whose dates are pinned. These are exactly the elements rillsoft_project_reschedule leaves in place - to reschedule a project freely, release them first through rillsoft_task_update or rillsoft_subproject_update with fixed:false. projectFixed reports the same for the main project. Read-only, no undo step.

### rillsoft_outline_apply

**Apply outline state** · read-only · Parameters: `openRows`, `outline`

Expands or collapses the visible resource or capacity view - the same effect as the expand and collapse buttons of the ribbon. Give exactly one of outline and openRows; openRows restores a state read before, row by row, which outline alone cannot do once someone has opened rows by hand. In any other view the call fails and points at rillsoft_view_state_apply. No undo step and no change to the plan itself - no task, no assignment, no date moves; that is why this tool counts as read-only. What it does change is the way the project is displayed: the outline state is stored with the project, and going through the user interface marks the document as changed, so a later save writes the new state along. It answers like rillsoft_outline_get.

### rillsoft_outline_get

**Read outline state** · read-only · Parameters: –

Reads how far the visible resource or capacity view is expanded: outline names the absolute state where the view is in one (collapsed, level_1 to level_3, expanded) and mixed where it is not, openRows[] names every group row that is open in the same coordinates the report uses per row, levels[] gives the grouping of the view outermost first, and canExpand and canCollapse say whether anything is left to do. In any other view the call fails and points at rillsoft_view_state_apply. Read-only, no undo step.

### rillsoft_outline_row_apply

**Apply outline state of one row** · read-only · Parameters: `action`\*, `row`\*

Opens or closes one single group row of the visible resource or capacity view - the same effect as clicking the plus or minus in front of it. Every other row keeps its state, which is what sets this apart from rillsoft_outline_apply. Rows that become visible this way can be opened the same way, level by level. A row already in the wanted state is left alone and reported back, so the call can be repeated. A row whose parent is still closed is not addressable; open the parent first. In any other view the call fails and points at rillsoft_view_state_apply. Like a click it moves the selection to that row and the property sheet of the info window follows. No undo step and no change to the plan itself - no task, no assignment, no date moves; that is why this tool counts as read-only. What it does change is the way the project is displayed: the outline state is stored with the project, and going through the user interface marks the document as changed, so a later save writes the new state along. It answers like rillsoft_outline_get.

### rillsoft_subproject_create

**Create subproject** · write · Parameters: `name`\*, `finish`, `parentUuid`, `start`

Creates a subproject (a summary task) and returns its UUID. It creates an empty one - grouping elements that already exist into a new subproject goes through rillsoft_element_subproject_group. Changing it afterwards goes through rillsoft_subproject_update, deleting it through rillsoft_subproject_delete. In a portfolio parentUuid names a project or a subproject inside it - nothing is created directly below the portfolio, as in the user interface. One undo step.

### rillsoft_subproject_delete

**Delete subproject** · write, destructive · Parameters: `uuid`\*

Deletes a subproject together with everything inside it. Refused where the UUID names a task - rillsoft_task_delete does that one, and rillsoft_element_delete takes either kind. The main project cannot be deleted; use rillsoft_project_create for a fresh one. Creating goes through rillsoft_subproject_create, changing through rillsoft_subproject_update. One undo step.

### rillsoft_subproject_update

**Update subproject** · write · Parameters: `uuid`\*, `calendarId`, `code`, `color`, `finish`, `fixed`, `name`, `notes`, `primaryColor`, `start`

Changes a subproject: name, start, finish, notes, pinning, calendar, color and code. The main project goes through rillsoft_project_update, a task through rillsoft_task_update, and deleting the subproject through rillsoft_subproject_delete. One undo step.

## Tasks, assignments and progress

| Tool | Title | Access |
|---|---|---|
| [`rillsoft_task_create`](#rillsoft_task_create) | Create task | write |
| [`rillsoft_task_delete`](#rillsoft_task_delete) | Delete task | write, destructive |
| [`rillsoft_task_dependency_create`](#rillsoft_task_dependency_create) | Create dependency | write |
| [`rillsoft_task_dependency_delete`](#rillsoft_task_dependency_delete) | Delete dependency | write, destructive |
| [`rillsoft_task_employee_assignment_set`](#rillsoft_task_employee_assignment_set) | Assign person | write |
| [`rillsoft_task_machine_assignment_set`](#rillsoft_task_machine_assignment_set) | Assign machine | write |
| [`rillsoft_task_machine_role_assignment_derive`](#rillsoft_task_machine_role_assignment_derive) | Derive machine kinds from assignments | write, destructive |
| [`rillsoft_task_machine_role_assignment_set`](#rillsoft_task_machine_role_assignment_set) | Assign machine role | write |
| [`rillsoft_task_material_assignment_set`](#rillsoft_task_material_assignment_set) | Assign material | write |
| [`rillsoft_task_progress_recalculate`](#rillsoft_task_progress_recalculate) | Recompute progress | write |
| [`rillsoft_task_progress_set`](#rillsoft_task_progress_set) | Set progress | write |
| [`rillsoft_task_resource_assignment_fill`](#rillsoft_task_resource_assignment_fill) | Assign resources automatically | write |
| [`rillsoft_task_resource_assignment_remove`](#rillsoft_task_resource_assignment_remove) | Take resources off tasks | write, destructive |
| [`rillsoft_task_resource_candidate_list`](#rillsoft_task_resource_candidate_list) | List candidates | read-only |
| [`rillsoft_task_role_assignment_derive`](#rillsoft_task_role_assignment_derive) | Derive roles from assignments | write, destructive |
| [`rillsoft_task_role_assignment_set`](#rillsoft_task_role_assignment_set) | Assign role | write |
| [`rillsoft_task_split`](#rillsoft_task_split) | Split task | write |
| [`rillsoft_task_split_options_get`](#rillsoft_task_split_options_get) | Read split options | read-only |
| [`rillsoft_task_update`](#rillsoft_task_update) | Update task | write |

### rillsoft_task_create

**Create task** · write · Parameters: `name`\*, `durationHours`, `finish`, `fixedType`, `milestone`, `notes`, `parentUuid`, `start`

Creates a task (RP computes the dates through the calendar) and returns its UUID. Changing it afterwards goes through rillsoft_task_update, moving it in the structure through rillsoft_element_move, deleting it through rillsoft_task_delete. In a portfolio parentUuid names a project or a subproject inside it - nothing is created directly below the portfolio, as in the user interface. One undo step.

### rillsoft_task_delete

**Delete task** · write, destructive · Parameters: `uuid`\*

Deletes a task together with its dependencies. Refused where the UUID names a subproject - rillsoft_subproject_delete does that one, and rillsoft_element_delete takes either kind. Creating goes through rillsoft_task_create, changing through rillsoft_task_update. One undo step.

### rillsoft_task_dependency_create

**Create dependency** · write · Parameters: `predecessorUuid`\*, `successorUuid`\*, `dependencyDistanceHours`, `dependencyDistanceType`, `type`

Creates a dependency between two tasks. It links existing tasks; it does not create them, and it does not move them - RP computes the new dates from the link. Removing it again goes through rillsoft_task_dependency_delete. In a portfolio, as in the user interface: across the project boundary a file portfolio refuses the dependency; a portfolio of the Integration Server creates it on the server as a RIS link (finish-start, start-start, finish-finish or start-finish with an absolute lag). One undo step.

### rillsoft_task_dependency_delete

**Delete dependency** · write, destructive · Parameters: `predecessorUuid`\*, `successorUuid`\*, `type`

Deletes the dependency between two tasks. Only the link goes; both tasks stay, and deleting a task itself goes through rillsoft_task_delete. One undo step.

### rillsoft_task_employee_assignment_set

**Assign person** · write · Parameters: `employeeId`\*, `quantity`\*, `taskUuid`\*, `utilization`

Assigns one specific existing person to a task, or removes that assignment with quantity 0. It touches one task - one person across many tasks goes through rillsoft_resource_usage_set, and filling many tasks at once through rillsoft_task_resource_assignment_fill. The master data stays untouched; an overload over time is a legitimate planning state and shows up in the report. One undo step.

### rillsoft_task_machine_assignment_set

**Assign machine** · write · Parameters: `machineId`\*, `quantity`\*, `taskUuid`\*, `utilization`

Assigns one specific existing machine to a task, or removes that assignment with quantity 0. The twin of rillsoft_task_employee_assignment_set; machines carry neither an employment period nor an efficiency. It touches one task - letting several tasks share one machine goes through rillsoft_machine_sharing_create. The master data stays untouched; an overload over time is a legitimate planning state and shows up in the report. One undo step.

### rillsoft_task_machine_role_assignment_derive

**Derive machine kinds from assignments** · write, destructive · Parameters: `taskUuids`

The 'Derive machine kinds from the assignment' wizard: rebuilds the machine role assignments of each task out of the concrete machines assigned to it - existing machine role assignments are replaced, quantity and volume are formed from those machines. Reports them under machineRoleAssignments[]. People are the mirror case and go through rillsoft_task_role_assignment_derive; setting a single machine kind by hand goes through rillsoft_task_machine_role_assignment_set. One undo step. Tasks without concrete assignments appear with the cause in skipped[].

### rillsoft_task_machine_role_assignment_set

**Assign machine role** · write · Parameters: `machineRoleId`\*, `quantity`\*, `taskUuid`\*, `utilization`

Assigns a machine role from the existing master data to a task, or removes it again with quantity 0. The twin of rillsoft_task_role_assignment_set for the machine park; one undo step.

### rillsoft_task_material_assignment_set

**Assign material** · write · Parameters: `materialId`\*, `quantity`\*, `taskUuid`\*, `calculationMode`, `notes`

Assigns material from the existing master data to a task, or removes that assignment with quantity 0. Material carries neither utilization nor capacity: it moves no dates but feeds the cost through quantity and calculation mode. Calling it again changes the existing assignment. One undo step.

### rillsoft_task_progress_recalculate

**Recompute progress** · write · Parameters: –

Derives the actual progress of every task from the current status date, computed by RP. It writes progress, not dates - moving unfinished work goes through rillsoft_project_status_date_reschedule, and a single task by hand through rillsoft_task_progress_set. One undo step.

### rillsoft_task_progress_set

**Set progress** · write · Parameters: `progressPercent`\*, `uuid`\*

Sets the actual progress of a task (0 to 100 %). It sets one task by hand; deriving the progress of every task from the status date goes through rillsoft_task_progress_recalculate, and the planning data of the task itself through rillsoft_task_update. The value is passed along to predecessors and successors. One undo step.

### rillsoft_task_resource_assignment_fill

**Assign resources automatically** · write · Parameters: `assignments`, `mode`, `resourceIds`, `taskUuids`, `type`

The 'Assign staff' respectively 'Assign machine park' wizard: fills many tasks at once out of their role assignments. One call is exactly one undo step, labelled like the menu entry. An assignment is made only where the task carries the matching role, the resource is not on it yet, it is not already involved through another role, and the balance of that role is still open. The result gives the assignments made per task plus skipped[] with the cause. Only at progress 0 %.

### rillsoft_task_resource_assignment_remove

**Take resources off tasks** · write, destructive · Parameters: `resourceIds`\*, `taskUuids`, `type`

The 'Remove staff' respectively 'Remove machine park' wizard: takes the named resources out of many tasks at once - one undo step. A task already begun is split at its progress first, and the completed part keeps its assignment. Completed tasks stay untouched and appear with the cause in skipped[].

### rillsoft_task_resource_candidate_list

**List candidates** · read-only · Parameters: `matchingOnly`, `roleIds`, `searchText`, `taskUuid`, `taskUuids`, `teamFilter`, `type`

Reports per task the roles attached to it (quantity, assigned, balance, balanceOpen) and the candidates matching them - the same set the task dialog shows after the role and team filter. Per candidate: id, name, code, teamId, free (free capacity within the task period), cost, alreadyAssigned, scheduleConflict and reason where it cannot be assigned; with type employee also availability and efficiency. Read-only, no undo step. Filling the slots afterwards goes through rillsoft_task_employee_assignment_set, rillsoft_task_machine_assignment_set or rillsoft_task_resource_assignment_fill.

### rillsoft_task_role_assignment_derive

**Derive roles from assignments** · write, destructive · Parameters: `taskUuids`

The 'Derive roles from the assignment' wizard: rebuilds the role assignments of each task out of the concrete people assigned to it - existing role assignments are replaced, quantity and volume are formed from those people. Reports them under assignments[]. Machine kinds are the mirror case and go through rillsoft_task_machine_role_assignment_derive; setting a single role by hand goes through rillsoft_task_role_assignment_set. One undo step. Tasks without concrete assignments appear with the cause in skipped[].

### rillsoft_task_role_assignment_set

**Assign role** · write · Parameters: `quantity`\*, `roleId`\*, `taskUuid`\*, `utilization`

Assigns a role (a professional qualification) from the existing pool to a task, or removes it again with quantity 0. A role is the requirement, not the person: filling it with someone concrete goes through rillsoft_task_employee_assignment_set, and rillsoft_task_role_assignment_derive works the other way round and rebuilds roles out of the people already assigned. Machine kinds are the mirror case (rillsoft_task_machine_role_assignment_set). One undo step.

### rillsoft_task_split

**Split task** · write · Parameters: `uuid`\*, `completedPart`, `linkParts`, `number`, `proportions`, `sameRow`, `splitTime`

Splits a task. Give exactly one of splitTime, completedPart or proportions. Splitting into n parts is a single undo step. The result is parts[] carrying uuid, wbs, number, name, start, finish, durationHours and progressPercent in WBS order. Beware: every part keeps the UUID of the original task, which is what preserves the baseline reference. What is unique is the number; passed as number it addresses one part in rillsoft_task_update, rillsoft_task_split and rillsoft_task_split_options_get. The name stays the same for all parts as well (just as in the user interface); rename them one by one through rillsoft_task_update.

### rillsoft_task_split_options_get

**Read split options** · read-only · Parameters: `uuid`\*, `number`, `resourceType`

Enumerates the ways a task can be split: completedPart (the point of progress), shiftStarts[] (starting shifts from the quantity profile), conflicts[] (start times of colliding tasks together with resourceType), criteria[] (criterion, metric, totalValue for proportions), plus splittable and timeSheet. Read-only, no undo step. Every point of time it reports can be passed straight to rillsoft_task_split.splitTime without conversion.

### rillsoft_task_update

**Update task** · write · Parameters: `uuid`\*, `calendarId`, `code`, `durationHours`, `dynamicRedistribution`, `finish`, `fixed`, `fixedType`, `name`, `notes`, `number`, `sameRow`, `start`

Changes the planning data of a task: name, dates, duration, notes, fixing, display row, task kind and the dynamic redistribution of the personnel effort. It changes the task itself - moving it in the structure goes through rillsoft_element_move, its progress through rillsoft_task_progress_set, its assignments through the rillsoft_task_*_assignment_set family, and a subproject through rillsoft_subproject_update. One undo step; conflicts are rolled back for you.

## Resources and resource pool

| Tool | Title | Access |
|---|---|---|
| [`rillsoft_machine_sharing_create`](#rillsoft_machine_sharing_create) | Share machine | write, destructive |
| [`rillsoft_machine_sharing_release`](#rillsoft_machine_sharing_release) | Release shared use | write, destructive |
| [`rillsoft_resource_absence_list`](#rillsoft_resource_absence_list) | List absences | read-only |
| [`rillsoft_resource_absence_sync`](#rillsoft_resource_absence_sync) | Reconcile absences | write, destructive |
| [`rillsoft_resource_pool_catalog_list`](#rillsoft_resource_pool_catalog_list) | List master data catalogs | read-only |
| [`rillsoft_resource_pool_edit_close`](#rillsoft_resource_pool_edit_close) | Close unit of work | write, destructive |
| [`rillsoft_resource_pool_edit_open`](#rillsoft_resource_pool_edit_open) | Open unit of work | write |
| [`rillsoft_resource_pool_edit_save`](#rillsoft_resource_pool_edit_save) | Save unit of work | write, destructive |
| [`rillsoft_resource_pool_file_select`](#rillsoft_resource_pool_file_select) | Select resource pool | write |
| [`rillsoft_resource_pool_get`](#rillsoft_resource_pool_get) | Read resource pool | read-only |
| [`rillsoft_resource_pool_resource_create`](#rillsoft_resource_pool_resource_create) | Create master data record | write |
| [`rillsoft_resource_pool_resource_delete`](#rillsoft_resource_pool_resource_delete) | Delete master data record | write, destructive |
| [`rillsoft_resource_pool_resource_get`](#rillsoft_resource_pool_resource_get) | Read master data record | read-only |
| [`rillsoft_resource_pool_resource_update`](#rillsoft_resource_pool_resource_update) | Update master data record | write |
| [`rillsoft_resource_pool_ris_list`](#rillsoft_resource_pool_ris_list) | List RIS clients | read-only |
| [`rillsoft_resource_pool_ris_select`](#rillsoft_resource_pool_ris_select) | Select RIS resource pool | write |
| [`rillsoft_resource_usage_list`](#rillsoft_resource_usage_list) | List tasks using a resource | read-only |
| [`rillsoft_resource_usage_set`](#rillsoft_resource_usage_set) | Assign a resource to several tasks | write |

### rillsoft_machine_sharing_create

**Share machine** · write, destructive · Parameters: `resourceId`\*, `taskUuids`\*, `type`\*

Lets several tasks share one machine or machine role: the individual assignments go away and the resource is consumed once instead of n times - one crane used by three tasks is one crane. Beware, this loses information: quantity and utilization of the shared entry are the maximum over all participants, exactly as in the 'Share' menu. rillsoft_machine_sharing_release is therefore not an inverse - a task taken back out gets the shared value, not its original one. Afterwards the resource appears in rillsoft_project_tree_get under sharedAssignments[] and no longer under machineAssignments[] or machineRoleAssignments[]. In a portfolio all tasks must belong to the same project - shared use stays within one project. One undo step.

### rillsoft_machine_sharing_release

**Release shared use** · write, destructive · Parameters: `resourceId`\*, `taskUuid`\*, `type`\*

Takes one task back out of shared use: it gets its individual assignment back, carrying the shared value rather than its original one (see rillsoft_machine_sharing_create). Once the last task is gone, the shared entry disappears. The counterpart of the 'Exclusive' menu entry; one undo step.

### rillsoft_resource_absence_list

**List absences** · read-only · Parameters: `absenceType`, `code`, `from`, `id`, `includeTeams`, `to`, `type`

Reads the absences of a person or a team: holiday, sickness and other time away. The pool is never changed.

### rillsoft_resource_absence_sync

**Reconcile absences** · write, destructive · Parameters: `entries`\*, `timeWindow`

Mirrors the absences of many people and teams in one call - the daily run of a foreign system. Every entry is resolved and checked first and written only afterwards; one faulty entry leaves the whole run without effect. Inside an open unit of work only.

### rillsoft_resource_pool_catalog_list

**List master data catalogs** · read-only · Parameters: `activeOnly`, `searchText`, `types`

Reads the catalogs of the existing master data: role, team, employee, material, machine_role, machine, project_category, project_status, project_customer and calendar - each entry with id and name, people additionally with teamIds, roleIds and personId. The ids fit rillsoft_task_employee_assignment_set, rillsoft_resource_pool_resource_get and the analysis report. The master data is never changed.

### rillsoft_resource_pool_edit_close

**Close unit of work** · write, destructive · Parameters: `save`

Closes the unit of work and releases the lock. Without save:true the working copy is discarded, and the stored pool stays as it was.

### rillsoft_resource_pool_edit_open

**Open unit of work** · write · Parameters: `discardChanges`

Opens a unit of work on the resource pool: it locks the pool and creates a working copy. Every writing pool tool is valid inside an open unit of work only, and none of them ever saves on its own. While a unit is open, rillsoft_resource_pool_file_select is blocked.

### rillsoft_resource_pool_edit_save

**Save unit of work** · write, destructive · Parameters: `confirm`

Checks the working copy against the open projects and writes it back *once*. The unit of work stays open. Against the Rillsoft Integration Server this creates exactly one new pool version, no matter how many changes the unit holds.

### rillsoft_resource_pool_file_select

**Select resource pool** · write · Parameters: `path`\*

Switches the global resource pool to a pool file (.xml). Possible only on a new, unmodified project, so call rillsoft_project_create first. No undo step; the setting holds application-wide.

### rillsoft_resource_pool_get

**Read resource pool** · read-only · Parameters: –

Shows the current resource pool source (a file or the Rillsoft Integration Server), how much it holds (roles, teams, people, calendars) and whether a unit of work is open. The pool is never changed.

### rillsoft_resource_pool_resource_create

**Create master data record** · write · Parameters: `type`\*, `fields`

Creates a single element in the resource pool. Inside an open unit of work only (rillsoft_resource_pool_edit_open); nothing is stored before rillsoft_resource_pool_edit_save. The group is picked through 'group' and created where it does not exist yet.

### rillsoft_resource_pool_resource_delete

**Delete master data record** · write, destructive · Parameters: `type`\*, `code`, `id`

Deletes a single element of the resource pool. Where that leaves its group empty, the group goes with it. Inside an open unit of work only. Where something inside the pool still points at the element - a person on the role or team, a machine on the machine kind - the call is refused and names what refers to it, just as rillsoft_calendar_delete does. Assignments inside open projects are not checked: a project carries its own copy of the resource data, so deleting here does not reach into it.

### rillsoft_resource_pool_resource_get

**Read master data record** · read-only · Parameters: `id`\*, `type`\*, `from`, `to`

Reads the complete master data of one object: a person with their identity, all their roles (efficiency, hourly rate), employment period, calendar, absences and shift cycles; a team with calendar, productivity and members; a customer with postal address and contact. Read-only, no undo step.

### rillsoft_resource_pool_resource_update

**Update master data record** · write · Parameters: `type`\*, `code`, `fields`, `id`

Changes a single element of the resource pool as a partial update. Inside an open unit of work only. Absences cannot be changed here; the absence tools cover them.

### rillsoft_resource_pool_ris_list

**List RIS clients** · read-only · Parameters: –

Lists the clients of the Rillsoft Integration Server whose resource pool the logged-in user may read - the clientId is what rillsoft_resource_pool_ris_select takes - and reports selectedClientId where the active pool already comes from the server. Runs with the login of the desktop session and never asks for credentials. A pool file is selected through rillsoft_resource_pool_file_select instead. Read-only, no undo step.

### rillsoft_resource_pool_ris_select

**Select RIS resource pool** · write · Parameters: `clientId`\*

Switches the global resource pool to the pool of a client on the Rillsoft Integration Server and makes that client the logged-in client of the session (clientId of the other RIS tools). Possible only on a new, unmodified project and without an open unit of work, so call rillsoft_project_create first. A pool file is selected through rillsoft_resource_pool_file_select instead. Runs with the login of the desktop session and never asks for credentials. No undo step; the setting holds application-wide and survives a restart.

### rillsoft_resource_usage_list

**List tasks using a resource** · read-only · Parameters: `resourceId`\*, `type`\*, `taskUuids`

Reports per task whether it carries one resource and with which values - the page 'Using tasks' of the capacity planning, read through the contract. Every task of the range appears, carrying or not; alreadyAssigned tells them apart. Per kind exactly its own columns: role and machine_role a count, team a productivity, employee an efficiency and who answers for the task, material an amount and a calculation mode, and everything but material a utilization. Team, employee and machine carry free on top - the capacity left within the task period - and team and employee availability from the calendar; employee adds employeeBalanceHours, absences, the compensator and whom the assignment stands in for. Hours are hours, never the volume unit of the view. Read-only, no undo step. Writing goes through rillsoft_resource_usage_set, which takes five of the six kinds - team assignments on tasks are not part of the write contract.

### rillsoft_resource_usage_set

**Assign a resource to several tasks** · write · Parameters: `assignments`\*, `resourceId`\*, `type`\*

Puts one resource on several tasks at once, or takes it off them, with the single values per task - the page 'Using tasks' of the capacity planning, written through the contract. One call is exactly **one** undo step for all of them, labelled like the page. quantity 0 removes, as with the five single-task tools. Each entry carries only the fields the page offers for that kind (rillsoft_resource_usage_list documents them); a field that belongs to another kind, or one the page merely displays such as free, is refused by name. Every check runs before the change: a single unknown UUID leaves the project untouched and creates no undo step. team is not part of this contract - assigning a team to a task belongs to the Standard edition alone; read it through rillsoft_resource_usage_list and set the preferred team of a project through rillsoft_project_team_preference_set. Beware of the neighbour: rillsoft_task_resource_assignment_fill is the wizard, filling tasks automatically out of their roles and without single values; this one fills exactly the tasks named, with them.

## Calendars

| Tool | Title | Access |
|---|---|---|
| [`rillsoft_calendar_create`](#rillsoft_calendar_create) | Create calendar | write |
| [`rillsoft_calendar_delete`](#rillsoft_calendar_delete) | Delete calendar | write, destructive |
| [`rillsoft_calendar_list`](#rillsoft_calendar_list) | List calendars | read-only |
| [`rillsoft_calendar_source_get`](#rillsoft_calendar_source_get) | Read holiday source | read-only |
| [`rillsoft_calendar_source_import`](#rillsoft_calendar_source_import) | Adopt holidays | write, destructive |
| [`rillsoft_calendar_update`](#rillsoft_calendar_update) | Update calendar | write, destructive |

### rillsoft_calendar_create

**Create calendar** · write · Parameters: `code`, `color`, `name`, `notes`, `week`

Creates a calendar; without 'week' it takes the default weekly model, Monday to Friday 08:00-12:00;13:00-17:00. Inside an open unit of work only.

### rillsoft_calendar_delete

**Delete calendar** · write, destructive · Parameters: `code`, `id`, `name`

Deletes a calendar. Where at least one idref_calendar points at it, the call is refused and names what refers to it - that reference lives inside the pool and would point nowhere. The last calendar of a pool stays. Inside an open unit of work only.

### rillsoft_calendar_list

**List calendars** · read-only · Parameters: `from`, `id`, `to`

Reads calendars of the master data: the weekly scheme (shifts per weekday sun..sat, empty meaning a day off) and the exception days (public and special days) within the period. Read-only, no undo step.

### rillsoft_calendar_source_get

**Read holiday source** · read-only · Parameters: `source`

Reads the holiday source without changing anything: which source calendars exist, and which years do they carry days for? The pool is never changed.

### rillsoft_calendar_source_import

**Adopt holidays** · write, destructive · Parameters: `sourceCalendar`\*, `targetCalendar`\*, `source`, `years`

Adopts the holidays of a source calendar into a pool calendar. What gets replaced is a **whole year at a time**: a year the source carries days for is overwritten completely, company holidays entered by hand in that year included, while a year without source data stays untouched. The only guard against that is 'years'. The answer names the days removed and the days created per year. Inside an open unit of work only.

### rillsoft_calendar_update

**Update calendar** · write, destructive · Parameters: `code`, `color`, `exceptionDays`, `id`, `name`, `newCode`, `newName`, `notes`, `range`, `week`

Changes a calendar as a partial update, so only the fields given take effect, and replaces its exception days inside a range you name explicitly. Days outside that range stay as they are. Inside an open unit of work only.

## Baselines and variance

| Tool | Title | Access |
|---|---|---|
| [`rillsoft_baseline_create`](#rillsoft_baseline_create) | Create baseline | write, destructive |
| [`rillsoft_baseline_delete`](#rillsoft_baseline_delete) | Delete baseline | write, destructive |
| [`rillsoft_baseline_list`](#rillsoft_baseline_list) | List baselines | read-only |
| [`rillsoft_baseline_select`](#rillsoft_baseline_select) | Select baseline | write |
| [`rillsoft_variance_report_get`](#rillsoft_variance_report_get) | Read variance report | read-only |

### rillsoft_baseline_create

**Create baseline** · write, destructive · Parameters: `name`, `replaceAll`

Creates a baseline as a snapshot of the current state of the project and selects it. With replaceAll:true the existing baselines are deleted first - that is the destructive part of this tool. Switching between existing baselines goes through rillsoft_baseline_select, and the planned-versus-actual comparison itself through rillsoft_variance_report_get. Refused in a portfolio: there is no baseline there, not even per project. One undo step.

### rillsoft_baseline_delete

**Delete baseline** · write, destructive · Parameters: `number`\*

Deletes a baseline; where it was the selected one, the selection falls back to the dynamic baseline. Only that snapshot goes - the project keeps its planning data untouched. Listing what exists goes through rillsoft_baseline_list. Refused in a portfolio: there is no baseline there, not even per project. One undo step.

### rillsoft_baseline_list

**List baselines** · read-only · Parameters: –

Reads the baselines of the project (number, name, uuid) and the active selection (number, dynamic, name). Number 0 while baselines exist means the dynamic baseline. Read-only, no undo step.

### rillsoft_baseline_select

**Select baseline** · write · Parameters: `number`\*

Selects the baseline used for the planned-versus-actual comparison. It only moves the selection; no baseline is created or deleted here (rillsoft_baseline_create and rillsoft_baseline_delete do that), and the comparison itself is read through rillsoft_variance_report_get. Refused in a portfolio: there is no baseline there, not even per project. One undo step.

### rillsoft_variance_report_get

**Read variance report** · read-only · Parameters: –

Reads the visible variance view (time_variance, effort_variance or cost_variance) as a flat YAML report: per element the planned value from the active baseline, the actual value from the current computed state, and the variance between them. The scope is that one visible view, not the whole project - rillsoft_view_state_apply switches it, and rillsoft_baseline_select decides which baseline the comparison uses. It takes no parameters. Read-only, no undo step.

## Analysis

| Tool | Title | Access |
|---|---|---|
| [`rillsoft_analysis_option_list`](#rillsoft_analysis_option_list) | List analysis options | read-only |
| [`rillsoft_analysis_report_get`](#rillsoft_analysis_report_get) | Read analysis report | read-only |

### rillsoft_analysis_option_list

**List analysis options** · read-only · Parameters: `view`

Reports the supported views with the groupings (named ones and every 2D/3D/4D combination of the grouping menu), presentations and secondary views each of them permits, the value sets for secondaryChart and costCurve, and the view state currently set (view, grouping, presentation, time filter, secondary view). Ask this before rillsoft_view_state_apply to learn which combinations exist; pass view to get only the one view you need. Read-only, no undo step.

### rillsoft_analysis_report_get

**Read analysis report** · read-only · Parameters: –

Reads the resource or capacity view currently visible as a flat YAML report: reference lists plus items carrying demand (and in capacity views supply) in the time grid of the visible calendar scale. The scope is that one visible view, not the whole project - which view it is comes from rillsoft_view_state_get, and rillsoft_view_state_apply switches it. It takes no parameters. Read-only, no undo step.

## Portfolios

| Tool | Title | Access |
|---|---|---|
| [`rillsoft_portfolio_file_open`](#rillsoft_portfolio_file_open) | Open portfolio file | write, destructive |
| [`rillsoft_portfolio_project_files_save`](#rillsoft_portfolio_project_files_save) | Save portfolio project files | write, destructive |
| [`rillsoft_portfolio_ris_create`](#rillsoft_portfolio_ris_create) | Create RIS portfolio | write |
| [`rillsoft_portfolio_ris_delete`](#rillsoft_portfolio_ris_delete) | Delete RIS portfolio | write, destructive |
| [`rillsoft_portfolio_ris_list`](#rillsoft_portfolio_ris_list) | List RIS portfolios | read-only |
| [`rillsoft_portfolio_ris_open`](#rillsoft_portfolio_ris_open) | Open RIS portfolio | write, destructive |
| [`rillsoft_portfolio_ris_save`](#rillsoft_portfolio_ris_save) | Save RIS portfolio | write, destructive |
| [`rillsoft_portfolio_ris_update`](#rillsoft_portfolio_ris_update) | Update RIS portfolio | write |

### rillsoft_portfolio_file_open

**Open portfolio file** · write, destructive · Parameters: `path`\*, `discardChanges`

Opens exactly one file portfolio (.rpp), which is a list of project files, and replaces the current project. A single project file (.rpj) is refused; rillsoft_project_file_open covers that. The answer carries portfolio:true and projects[] (uuid, name, path, readOnly); lines of the .rpp that point nowhere end up in skipped[], anything else the loader has to say in note. Inside a portfolio the tools work as in a single project, with the limits of the user interface: nothing is created directly below the portfolio, no task or subproject changes its project, no dependency crosses the project boundary in a file portfolio, no baseline, no 'save as'; rillsoft_portfolio_project_files_save writes the changed projects back. No undo step.

### rillsoft_portfolio_project_files_save

**Save portfolio project files** · write, destructive · Parameters: –

Writes the projects of an open file portfolio back into their own .rpj files; only the locked, writable members are saved, and the answer names them under saved[]. The .rpp itself is never written - it is only the list of paths, and there is no 'save as' for it. Where a single project is open, the call is refused (use rillsoft_project_file_save). No undo step.

### rillsoft_portfolio_ris_create

**Create RIS portfolio** · write · Parameters: `name`\*, `combine`, `folderIds`, `projectIds`

Creates a portfolio of the logged-in client on the Rillsoft Integration Server - the 'New' button of the portfolio dialog - with its kind, folders and projects. Takes effect on the server at once: no undo step; rillsoft_portfolio_ris_delete removes it, rillsoft_portfolio_ris_open loads it. A duplicate name and unknown folder or project ids are refused before anything is sent. Runs with the login of the desktop session.

### rillsoft_portfolio_ris_delete

**Delete RIS portfolio** · write, destructive · Parameters: `portfolioId`\*

Deletes a portfolio of the logged-in client on the Rillsoft Integration Server - the 'Delete' button of the portfolio dialog. The server deactivates the portfolio record (soft delete); the projects stay untouched. The portfolio that is open right now is refused (portfolio_is_open; call rillsoft_project_create first). Takes effect at once: no undo step. rillsoft_portfolio_ris_create is the counterpart. Runs with the login of the desktop session.

### rillsoft_portfolio_ris_list

**List RIS portfolios** · read-only · Parameters: `combine`

Lists the portfolios of the logged-in client on the Rillsoft Integration Server - project portfolios and summary projects - with their folders, the projects they resolve to and the portfolioId that rillsoft_portfolio_ris_open takes. Runs with the login of the desktop session and never asks for credentials; the answer names server, userName and clientId. A portfolio file (.rpp) is opened through rillsoft_portfolio_file_open instead. Read-only, no undo step.

### rillsoft_portfolio_ris_open

**Open RIS portfolio** · write, destructive · Parameters: `portfolioId`\*, `discardChanges`, `lock`, `projectIds`, `readOnlyProjectIds`

Opens a portfolio of the logged-in client from the Rillsoft Integration Server - all of its projects or a subset - and replaces the current document with a portfolio: the tools work there as in a single project, with the limits of the user interface (nothing directly below the portfolio, no task or subproject changes its project, a dependency across the project boundary becomes a RIS link, no baseline, no 'save as'; documents of the loaded projects can be listed, downloaded, updated and deleted, not created). Projects with a foreign resource pool or that cannot be read are left out and named in skipped. With unsaved changes pending, discardChanges:true is required. Saving goes back through rillsoft_portfolio_ris_save; a portfolio file is opened through rillsoft_portfolio_file_open instead. No undo step - the command history starts over. Runs with the login of the desktop session.

### rillsoft_portfolio_ris_save

**Save RIS portfolio** · write, destructive · Parameters: `notes`

Writes the open portfolio of the Rillsoft Integration Server back: every project that changed and is not read-only gets a new version on the server (saved names them), cross-project links and the portfolio's configuration, favourites and signature are written along, then the portfolio is reloaded from the server keeping its display state. Nothing changed means nothing written and a note. Refused where the open document is not a portfolio of the server (ris_portfolio_not_open; a single project is saved through rillsoft_project_ris_save, a portfolio file through rillsoft_portfolio_project_files_save). A link cycle stops the save and is named in note. Runs with the login of the desktop session. No undo step.

### rillsoft_portfolio_ris_update

**Update RIS portfolio** · write · Parameters: `portfolioId`\*, `folderIds`, `name`, `projectIds`

Renames a portfolio of the logged-in client on the Rillsoft Integration Server and/or replaces its folder and project selection - the properties dialog and the in-place rename of the portfolio dialog. At least one of name, folderIds and projectIds is required; the kind (summary project or portfolio) cannot be changed. Takes effect on the server at once: no undo step. Where the portfolio is open right now, the change shows with the next rillsoft_portfolio_ris_open and note says so. Runs with the login of the desktop session.

## RIS documents and folders

| Tool | Title | Access |
|---|---|---|
| [`rillsoft_document_ris_create`](#rillsoft_document_ris_create) | Attach RIS document | write |
| [`rillsoft_document_ris_delete`](#rillsoft_document_ris_delete) | Delete RIS document | write, destructive |
| [`rillsoft_document_ris_get`](#rillsoft_document_ris_get) | Download RIS document | read-only |
| [`rillsoft_document_ris_list`](#rillsoft_document_ris_list) | List RIS documents | read-only |
| [`rillsoft_document_ris_update`](#rillsoft_document_ris_update) | Update RIS document | write, destructive |
| [`rillsoft_folder_ris_create`](#rillsoft_folder_ris_create) | Create RIS folder | write |
| [`rillsoft_folder_ris_delete`](#rillsoft_folder_ris_delete) | Delete RIS folder | write, destructive |
| [`rillsoft_folder_ris_list`](#rillsoft_folder_ris_list) | List RIS folders | read-only |
| [`rillsoft_folder_ris_move`](#rillsoft_folder_ris_move) | Move RIS folder | write |
| [`rillsoft_folder_ris_update`](#rillsoft_folder_ris_update) | Rename RIS folder | write |

### rillsoft_document_ris_create

**Attach RIS document** · write · Parameters: `folderId`\*, `path`\*, `description`, `uuid`

Stores a local file as a new document in the document management of the Rillsoft Integration Server and hangs it on a task, a subproject or the project itself - the 'Add' button of the documents page. Today the server accepts documents on tasks only: a subproject or the project itself answers ris_not_found (the text says why), so give the uuid of a task. Takes effect on the server at once: no undo step, the project itself is not marked as changed, and rillsoft_history_undo does not take it back; rillsoft_document_ris_delete removes it. Requires the project to be stored on the server (rillsoft_project_ris_save_as first for a new one), the DMS license function and the create role; refused in an open portfolio, as in the documents dialog; the answer is the document as the server holds it afterwards.

### rillsoft_document_ris_delete

**Delete RIS document** · write, destructive · Parameters: `documentId`\*

Deletes one document of the open project from the document management of the Rillsoft Integration Server - the 'Delete' button of the documents page. The server deactivates it (soft delete; an administrator can restore it there). Takes effect at once: no undo step, the project itself is not marked as changed. A document that is already gone answers ris_not_found. rillsoft_document_ris_create is the counterpart. Runs with the login of the desktop session; needs the delete role.

### rillsoft_document_ris_get

**Download RIS document** · read-only · Parameters: `documentId`\*, `path`\*, `overwrite`

Downloads one document of the open project from the document management of the Rillsoft Integration Server into a local file - the 'Download' button of the documents page, with the target path given instead of asked. An existing file at path is refused unless overwrite:true; on any failure no partial file is left behind. The document itself is not changed; rillsoft_document_ris_list names the ids. Runs with the login of the desktop session. No undo step.

### rillsoft_document_ris_list

**List RIS documents** · read-only · Parameters: `uuid`

Lists the documents the document management (DMS) of the Rillsoft Integration Server holds for the open project - files hanging on a task, a subproject or the project itself - together with the DMS folder tree of the client. In an open RIS portfolio it lists the documents of every loaded project (each names its projectId; the answer carries portfolioId), and downloading, updating and deleting work there too - only creating is refused, as in the documents dialog. Each document names the element it hangs on (uuid), its folder (folderId, folderPath) and the documentId the other document tools take. Requires a project opened from the server (rillsoft_project_ris_open) or stored there (rillsoft_project_ris_save_as); a new or file-based project has no documents. Reads the server every time; runs with the login of the desktop session. Read-only, no undo step. Not to be confused with the project files rillsoft_project_file_open handles.

### rillsoft_document_ris_update

**Update RIS document** · write, destructive · Parameters: `documentId`\*, `description`, `folderId`, `path`

Changes the description, the DMS folder and/or the content of one document in the document management of the Rillsoft Integration Server - editing the description in the list, dragging it into a folder and the 'Upload' button of the documents page. At least one of description, folderId and path is required; the element the document hangs on cannot be changed (delete and attach again). Replacing the content with path is destructive: the stored file is overwritten and its name follows the new file. Takes effect on the server at once - no undo step, the project itself is not marked as changed. Without a path and without a difference nothing is sent. Runs with the login of the desktop session; needs the modify role.

### rillsoft_folder_ris_create

**Create RIS folder** · write · Parameters: `name`\*, `parentFolderId`\*

Creates a subfolder in the project folder tree of the logged-in client on the Rillsoft Integration Server - the 'New folder' button of the folder dialog. Takes effect on the server at once: no undo step; rillsoft_folder_ris_delete removes it. An unknown parent is refused before anything is sent. Runs with the login of the desktop session.

### rillsoft_folder_ris_delete

**Delete RIS folder** · write, destructive · Parameters: `folderId`\*

Deletes an empty project folder of the logged-in client on the Rillsoft Integration Server - the 'Delete folder' button of the folder dialog. A folder that still holds subfolders or projects is refused (ris_folder_not_empty); nothing disappears silently. The server deactivates the folder (soft delete). Takes effect at once: no undo step. rillsoft_folder_ris_create is the counterpart. Runs with the login of the desktop session.

### rillsoft_folder_ris_list

**List RIS folders** · read-only · Parameters: `permission`

Lists the project folder tree of the logged-in client on the Rillsoft Integration Server - the tree of the 'Open from database' dialog - with parentFolderId, path and depth per folder, so no nested-set arithmetic is needed; the folderId is what rillsoft_project_ris_save_as and the other folder tools take. Not the DMS folder tree of the documents (rillsoft_document_ris_list). Runs with the login of the desktop session. Read-only, no undo step.

### rillsoft_folder_ris_move

**Move RIS folder** · write · Parameters: `folderId`\*, `targetFolderId`\*, `position`

Moves a project folder of the logged-in client on the Rillsoft Integration Server under another folder or next to it, with its subfolders and projects - dragging in the folder dialog, plus the sibling positions the server offers. A folder cannot go under itself or one of its subfolders (ris_folder_cycle). Renaming is rillsoft_folder_ris_update; a project changes its folder through rillsoft_project_ris_save_as. Takes effect at once: no undo step. Runs with the login of the desktop session.

### rillsoft_folder_ris_update

**Rename RIS folder** · write · Parameters: `folderId`\*, `name`\*

Renames a project folder of the logged-in client on the Rillsoft Integration Server - editing the label in the folder dialog. The same name again sends nothing. Moving a folder is rillsoft_folder_ris_move. Takes effect on the server at once: no undo step. Runs with the login of the desktop session.

## View, window and session

| Tool | Title | Access |
|---|---|---|
| [`rillsoft_history_redo`](#rillsoft_history_redo) | Redo command | write |
| [`rillsoft_history_undo`](#rillsoft_history_undo) | Undo command | write, destructive |
| [`rillsoft_property_panel_close`](#rillsoft_property_panel_close) | Close property sheet | read-only |
| [`rillsoft_property_panel_get`](#rillsoft_property_panel_get) | Read property sheet | read-only |
| [`rillsoft_property_panel_open`](#rillsoft_property_panel_open) | Open property sheet | read-only |
| [`rillsoft_row_selection_apply`](#rillsoft_row_selection_apply) | Apply row selection | read-only |
| [`rillsoft_row_selection_get`](#rillsoft_row_selection_get) | Read row selection | read-only |
| [`rillsoft_session_dialogs_set`](#rillsoft_session_dialogs_set) | Set recording mode for message boxes | read-only |
| [`rillsoft_timescale_apply`](#rillsoft_timescale_apply) | Apply time scale | write |
| [`rillsoft_view_columns_apply`](#rillsoft_view_columns_apply) | Apply columns of the view | read-only |
| [`rillsoft_view_columns_get`](#rillsoft_view_columns_get) | Read columns of the view | read-only |
| [`rillsoft_view_favorite_create`](#rillsoft_view_favorite_create) | Create favourite view | write |
| [`rillsoft_view_favorite_delete`](#rillsoft_view_favorite_delete) | Delete favourite view | write, destructive |
| [`rillsoft_view_favorite_list`](#rillsoft_view_favorite_list) | List favourite views | read-only |
| [`rillsoft_view_favorite_select`](#rillsoft_view_favorite_select) | Select favourite view | write |
| [`rillsoft_view_state_apply`](#rillsoft_view_state_apply) | Apply view state | write |
| [`rillsoft_view_state_get`](#rillsoft_view_state_get) | Read view state | read-only |
| [`rillsoft_window_layout_apply`](#rillsoft_window_layout_apply) | Apply window layout | read-only |
| [`rillsoft_window_layout_get`](#rillsoft_window_layout_get) | Read window layout | read-only |

### rillsoft_history_redo

**Redo command** · write · Parameters: –

Redoes the undo step taken back last and reports the command that was redone. The counterpart to rillsoft_history_undo; it restores the step and takes nothing away, which is why it carries no destructive hint. One undo step.

### rillsoft_history_undo

**Undo command** · write, destructive · Parameters: –

Undoes the last undo step, including changes made in the user interface, and reports the command that was undone. It walks the command history of the open project; it is not a way to undo a save, and the resource pool has no undo step at all - there the unit of work is closed without saving instead. Taking the step back again goes through rillsoft_history_redo. One undo step.

### rillsoft_property_panel_close

**Close property sheet** · read-only · Parameters: –

Switches the property sheet back to the info sheet. Where the info sheet is open already it does nothing, and that is not an error. No undo step, no change to the project. It answers like rillsoft_property_panel_get.

### rillsoft_property_panel_get

**Read property sheet** · read-only · Parameters: –

Reads the property sheet in the info window: type (info, task, project, subproject, portfolio, combination, other), uuid, number and name of the element shown, activeTab, availableTabs[] and infoPanelVisible. Read-only, no undo step.

### rillsoft_property_panel_open

**Open property sheet** · read-only · Parameters: `number`, `tab`, `uuid`

Shows a task, a subproject or the project in the property sheet of the info window, optionally on a named tab. A hidden info window is shown for that (for the running session only). The element gets selected and scrolled into view along the way - the selection is part of the picture. Purely navigational: values are set through rillsoft_task_update, rillsoft_subproject_update and the other writing tools. No undo step, no change to the project. It answers like rillsoft_property_panel_get.

### rillsoft_row_selection_apply

**Apply row selection** · read-only · Parameters: `row`\*

Selects one row of the visible resource or capacity view - the same effect as clicking it. The row is scrolled into view and the property sheet of the info window follows, exactly as it does on a click. A row whose parent is collapsed is not addressable; open it first through rillsoft_outline_apply. In any other view the call fails and points at rillsoft_view_state_apply. No undo step and no change to the plan itself - no task, no assignment, no date moves; that is why this tool counts as read-only. What it does change is the way the project is displayed: the selected row is stored with the project, and going through the user interface marks the document as changed, so a later save writes it along. Pass taskUuid inside row to select a task listed under that row instead of the row itself - the detail rows have no coordinate of their own, they hang below their group row; that is what makes the gantt secondary view show the task with its links. It answers like rillsoft_row_selection_get.

### rillsoft_row_selection_get

**Read row selection** · read-only · Parameters: –

Reads which row of the visible resource or capacity view is selected, in the same coordinates the report uses per row. selected:false means none is. In any other view the call fails and points at rillsoft_view_state_apply. Read-only, no undo step.

### rillsoft_session_dialogs_set

**Set recording mode for message boxes** · read-only · Parameters: `visible`\*, `autoAnswer`, `autoCloseSeconds`, `scope`

Switches the recording mode of this session: with visible true, every following call that would show a message box in the user interface - a warning, a hint, the question about moving fixed dates - shows the real box on screen for screenshots, and a timer closes it after autoCloseSeconds with the answer chosen by autoAnswer. A person who clicks earlier wins. The call that showed a box returns only once the box is closed, so run it in the background and take the picture meanwhile; every other tools/call sent while a box stands is refused with dialog_open and the remaining seconds. Each box shown is reported in _meta.dialogs[] of the answer with title, text, buttons, answer and shownMs. After a server start the mode is off. No undo step, no change to the project. It answers with the state now in force.

### rillsoft_timescale_apply

**Apply time scale** · write · Parameters: `level`, `subdivision`, `unit`

Applies the time scale of the time axis - either through level or through unit plus subdivision. A pure display property: tasks, dates, assignments, calendars and baselines stay untouched. One undo step; a level already set creates none.

### rillsoft_view_columns_apply

**Apply columns of the view** · read-only · Parameters: `columns`, `order`

Shows, hides, sizes and arranges columns of the list on the left of the visible view - the same effect as the context menu of the column header, dragging its edge and the column arrangement dialog. Give order, columns or both; a call with neither is rejected. Under columns only the columns named are touched, and a column that already stands as asked is left alone, so the call can be repeated. Rejected in plain words: an unknown column name, hiding a column the context menu greys out, a width on a column that stays hidden ({ visible: true, width: X } in one entry shows it and sizes it in one go), and an order that leaves a column out or names one twice. The list at the bottom of a view with a second chart is not addressable. No undo step and no change to the plan itself - no task, no assignment, no date moves; that is why this tool counts as read-only. What it does change is the way the project is displayed: the column state is stored with the project, and going through the user interface marks the document as changed, so a later save writes it along. It answers like rillsoft_view_columns_get.

### rillsoft_view_columns_get

**Read columns of the view** · read-only · Parameters: –

Reads the columns of the list on the left of the visible view - the Gantt chart, the three variance views and the resource and capacity views carry one. Per column it gives name (the contract name), caption (the heading in the language of the running program), visible, width in neutral units and toggleable, in display order and hidden columns included. The field order repeats that display order as a plain list of names, ready to be passed back to rillsoft_view_columns_apply. In the network diagram and the bar network diagram there is no such list and the call fails, pointing at rillsoft_view_state_apply. Read-only, no undo step.

### rillsoft_view_favorite_create

**Create favourite view** · write · Parameters: `name`\*

Saves the visible view as a favourite view under 'name': view type, grouping, filter, time window, column layout and time scale as they are right now - rillsoft_view_state_apply and rillsoft_view_columns_apply shape it beforehand. The visible view stays as it is; switching to the favourite goes through rillsoft_view_favorite_select, removing it through rillsoft_view_favorite_delete. One undo step.

### rillsoft_view_favorite_delete

**Delete favourite view** · write, destructive · Parameters: `name`\*

Deletes the favourite view 'name' from the project. The favourite view that is visible right now cannot be deleted - switch to another view with rillsoft_view_state_apply first; any other favourite can go while it stays visible. Only the saved view goes; the project keeps its planning data untouched. Listing what exists goes through rillsoft_view_favorite_list. One undo step.

### rillsoft_view_favorite_list

**List favourite views** · read-only · Parameters: –

Reads the favourite views of the project (name and the view each one was saved from), where they are stored, and which one is visible right now. Switching to one goes through rillsoft_view_favorite_select. Read-only, no undo step.

### rillsoft_view_favorite_select

**Select favourite view** · write · Parameters: `name`\*

Switches the visible view to the favourite view 'name', the same way as the favourites menu: afterwards rillsoft_view_state_get reports 'favorite' next to the underlying view name. It only changes what is shown, nothing in the project - and like every view switch it is no undo step. Creating and deleting favourites go through rillsoft_view_favorite_create and rillsoft_view_favorite_delete.

### rillsoft_view_state_apply

**Apply view state** · write · Parameters: `application`, `baseline`, `note`, `taskFilter`, `timeFilter`, `timescale`, `view`

Switches the visible view ('view.name', for example gantt or employee) and sets its state - grouping, presentation, secondary view, time and task filter, time scale, application-wide switches - in the shape of the rillsoft_view_state_get answer: reading it and applying it back restores the state exactly. Informational fields (baseline, note, favorite) are ignored; rillsoft_baseline_select is what switches the baseline, and rillsoft_view_favorite_select is what switches to a favourite view. At least one section is required. One undo step.

### rillsoft_view_state_get

**Read view state** · read-only · Parameters: –

Reads the complete visible view state in one answer: 'view' (its name including the task views, grouping, presentation, secondary view together with secondary chart and cost curve; while a favourite view is visible also 'favorite' with its name next to the underlying view), 'timescale', 'timeFilter', 'taskFilter' and 'baseline'. Read-only, no undo step.

### rillsoft_window_layout_apply

**Apply window layout** · read-only · Parameters: `height`, `infoPanel`, `ribbon`, `statusBar`, `width`

Applies the window state for reproducible screenshots; at least one parameter is required, and sizes left out stay as they are. It answers like rillsoft_window_layout_get. No undo step, no change to the project. The state holds for the running session only.

### rillsoft_window_layout_get

**Read window layout** · read-only · Parameters: –

Reads the window state: width and height of the visible client area, windowWidth and windowHeight including the frame, dpi, maximized, infoPanel (the docking bar holding the property sheet), statusBar and ribbon (normal or minimized). Read-only, no undo step.
