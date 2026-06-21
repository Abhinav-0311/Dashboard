# Daily Dev Dashboard

A small vanilla HTML, CSS, and JavaScript app for turning daily coding sessions into visible progress.

The first version includes:

- A daily focus prompt that resets each new day, even if the dashboard stays open overnight
- A keyboard shortcut for saving focus with `Ctrl+Enter` or `Cmd+Enter`
- A matching keyboard shortcut for saving learning notes with `Ctrl+Enter` or `Cmd+Enter`
- A matching keyboard shortcut for adding backlog tasks with `Ctrl+Enter` or `Cmd+Enter`
- A small task backlog
- A recent completed-task history so finished work stays visible, with a confirmation before clearing it
- Learning notes saved in local storage
- Empty states for cleared task and note lists
- A 30-day improvement roadmap

## Run locally

Open `index.html` in your browser.

No build step or dependencies are required.

## Validate changes

Run the lightweight JavaScript syntax check before committing:

```bash
npm run validate
```

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
