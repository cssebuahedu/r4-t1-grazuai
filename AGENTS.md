<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Application architecture

- Use TanStack Router file routes with `/app` as the shared shell and separate leaf routes for each module; this preserves the installed framework and makes later phases independently extensible.
- Keep navigation metadata and shared page metadata in a browser-safe module, and static demo content in the frontend; Phase 1 needs no services or persistence.
- Define visual roles in the global semantic design system and use existing shadcn controls; this keeps the foundation consistent without additional dependencies.
- Keep compliance and review state in a React provider around the `/app` shell, linking evidence by existing product, run, test, and repository IDs; this preserves local edits across navigation without persistence or duplicated product records.
- Keep public sign-in and sign-up routes outside the `/app` shell and share their presentation in one component; this isolates account screens without altering module navigation or introducing authentication guards.
- Derive analytics, geospatial, and forecast views from the shared use case registry plus explicitly labeled simulation helpers in one module; this keeps totals consistent across pages and avoids duplicate fixtures.
