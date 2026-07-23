# Daily Dev Dashboard

A small vanilla HTML, CSS, and JavaScript app for turning daily coding sessions into visible progress.

Live site: https://abhinav-0311.github.io/Dashboard/

The first version includes:

- A daily focus prompt that resets each new day, even if the dashboard stays open overnight
- A confirmation step before clearing today's focus or its unsaved draft
- Unsaved focus, task, and note drafts restored after reopening the browser
- A keyboard shortcut for saving focus with `Ctrl+Enter` or `Cmd+Enter`
- A matching keyboard shortcut for saving learning notes with `Ctrl+Enter` or `Cmd+Enter`
- A matching keyboard shortcut for adding backlog tasks with `Ctrl+Enter` or `Cmd+Enter`
- Live remaining-character counters for focus, task, and learning note inputs
- A small task backlog
- A confirmation step before removing a backlog task by mistake
- A recent completed-task history so finished work stays visible, with a per-task restore action, a show-all toggle for older items, and a confirmation before clearing it
- Learning notes saved in local storage, with confirmation before deleting a saved note
- JSON export and import controls for moving local dashboard data between browsers or machines
- Empty states for cleared task and note lists
- A 30-day improvement roadmap

## Run locally

Open `index.html` in your browser.

No build step or dependencies are required.

## Back up your data

Use **Export data** to download a JSON backup of your saved focus, backlog, completed tasks, and learning notes.
Use **Import data** to restore a previous dashboard backup. Importing replaces the current browser's saved dashboard data after confirmation, and the app rejects files larger than 1 MB, JSON files that are not labeled as Daily Dev Dashboard backups, and entries that exceed the dashboard's text limits.

## Validate changes

Run the lightweight JavaScript syntax check before committing:

```bash
npm run validate
```

## Deploy

The repository includes a GitHub Pages workflow. After Pages is configured to use GitHub Actions, every push to `main` publishes the static dashboard.

## License

MIT License. See [LICENSE](LICENSE).

## Daily contribution ideas

Use this repo for small, real improvements:

1. Improve one interaction or accessibility detail.
2. Add one task-management feature.
3. Polish one responsive layout issue.
4. Write one short documentation section.
5. Refactor one function without changing behavior.
6. Add export/import for saved data.
7. Add a streak counter.
8. Add task categories.
9. Add search or filters.
10. Deploy it with GitHub Pages.

## Suggested commit style

Keep commits small and descriptive:

```bash
git add .
git commit -m "Add learning notes list"
```
