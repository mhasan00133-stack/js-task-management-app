# JavaScript Task Management Application (No Frameworks)

- **Intern Name:** Muhammad Hasan Sajid
- **Registration / Roll No:** `SEP26-FE21-44`
- **Candidate ID:** `7b34eedb-05cd-42e8-af67-efe820701d53`
- **Program:** Frontend Developer Internship - 6 weeks (Sep 23, 2026)

## Architecture & ES6 Modules
1. `js/storage.js`: `localStorage` persistence with Schema v1 -> v2 automatic migration.
2. `js/command.js`: Command Pattern Undo/Redo engine with a bounded 20-action history stack.
3. `js/urlState.js`: Filter & sort persistence via `URLSearchParams` and `history.replaceState`.
4. `js/dnd.js`: Native HTML5 Drag and Drop task reordering.
5. `js/ui.js`: Debounced search (250ms) with `<mark>` match highlighting and DOM rendering.
6. `js/app.js`: Main CRUD controller and global keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`, `Alt+N`, `/`, `Esc`).
