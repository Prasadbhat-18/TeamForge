# Implementation Plan — TaskForge Polish & README

## Summary of findings

After reading all key files the work breaks cleanly into two independent features:

**FEAT-001 — Product Features**: backend task-count aggregation, delete-project UI, board toolbar UX polish (search clear button, filter clear), and mobile layout for the board.

**FEAT-002 — README**: replace the thin stub README with a comprehensive guide.

Both features are captured in full FEAT artifacts under `.agents/tasks/features/`. The numbered plan below mirrors those artifacts for the workflow's fallback loop.

---

## Implementation Plan

- [ ] 1. Add task-count aggregation to the `getProjects` controller.
      The `GET /api/projects` endpoint currently returns plain Project documents. Replace the `find+populate` query with an aggregation pipeline that `$lookup`s into the `tasks` collection, computing `totalTasks` (all tasks) and `doneTasks` (status = DONE) per project and appending them as virtual fields on each project object.
      Files: `server/src/controllers/projectController.js`
      Verify: start the server (`npm run dev` from root) and `curl http://localhost:5000/api/projects` after logging in — each project object must include `totalTasks` and `doneTasks` integer fields.

- [ ] 2. Display task counts on project cards in `ProjectsPage`.
      Read the `totalTasks` / `doneTasks` fields returned in step 1 and render them on each project card next to the member count, e.g. "5 tasks · 2 done". Keep the existing `members` + `createdAt` row; add tasks as a third chip using a `CheckSquare` lucide icon.
      Files: `client/src/pages/ProjectsPage.jsx`
      Verify: open the Projects page in the browser — each card shows task counts. New projects show "0 tasks · 0 done".

- [ ] 3. Add delete-project button and confirmation modal to `ProjectDetailPage`.
      Show a red "Delete project" button in the page header, visible only to the owner (`isOwner === true`). Clicking it opens an inline confirmation modal (same pattern as the existing create-project dialog in ProjectsPage). On confirm, call `deleteProject(id)` from `../api/projects.js`, show a success toast, and `navigate("/projects")`. On error, show an error toast.
      Files: `client/src/pages/ProjectDetailPage.jsx`
      Verify: log in as the owner, open a project, click "Delete project", confirm — the project is removed and the browser navigates to `/projects`. As a non-owner member the button must not appear.

- [ ] 4. Add a clear (×) button to the search box in `Board.jsx`.
      When `search` is non-empty, render an `X` icon button inside the search input (positioned absolutely, right side) that sets `setSearch("")`. Reuse the existing `X` import from lucide-react (already imported in other files; add it to Board.jsx imports).
      Files: `client/src/components/Board.jsx`
      Verify: type into the search box — the × button appears. Clicking it clears the input and restores all tasks.

- [ ] 5. Fix filter dropdowns so selecting "All priorities" / "All assignees" properly clears the filter.
      The selects already set state to `""` on the "All …" option, which is correct. However the `filterAssignee` comparison in `filtered` uses `t.assignee?._id || t.assignee` which can diverge between populated and non-populated assignee shapes. Normalise the comparison: extract assignee id as `(t.assignee?._id ?? t.assignee)?.toString()` and compare to `filterAssignee`. This ensures selecting "All assignees" (value `""`) always shows every task.
      Files: `client/src/components/Board.jsx`
      Verify: with tasks assigned to different members, choose a specific assignee in the filter — only their tasks show. Switch back to "All assignees" — all tasks reappear.

- [ ] 6. Fix mobile layout so the Kanban board does not overflow the viewport.
      Wrap the `<DragDropContext>` columns container (`<div className="flex gap-4 …">`) so it is inside a full-width scroll region: give the outer wrapper `className="w-full overflow-x-auto"` and keep the inner flex row. Also ensure the Board toolbar wraps gracefully: the toolbar already uses `flex-wrap`; add `sm:flex-nowrap` and cap the search input min-width at `min-w-0` on small screens so it shrinks rather than overflowing.
      Files: `client/src/components/Board.jsx`
      Verify: resize the browser to 375 px wide — columns are scrollable horizontally without breaking the page layout; the toolbar wraps to two rows cleanly.

- [ ] 7. Add error handling / toast on `getProjects` failure in `ProjectsPage`.
      The `load()` call currently swallows errors. Chain `.catch(e => toast.error(e.response?.data?.message || "Failed to load projects"))` after `.then(setProjects)`.
      Files: `client/src/pages/ProjectsPage.jsx`
      Verify: temporarily break the API URL in `.env`, refresh the Projects page — an error toast appears.

- [ ] 8. Update README with full documentation.
      Replace the thin stub `README.md` with a comprehensive guide covering: project overview, tech stack table, prerequisites, step-by-step local setup (clone → install → env files → seed → dev), demo credentials, feature overview (projects, board, tasks, team, activity, dashboard), API endpoints reference (grouped by resource), environment variables reference, build for production instructions, and a note about the AI-assisted development process.
      Files: `taskforge/README.md`
      Verify: the file renders correctly in a markdown viewer; all section headings and code blocks are well-formed.
