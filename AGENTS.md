<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# GitHub Commit & Workflow Rules

1. **Commit Message Convention**:
   - Use standardized prefixes for commit messages:
     - `feat:` for new features or data layers.
     - `fix:` for bug fixes or filtering corrections.
     - `refactor:` for code restructurings or layout cleanups.
     - `docs:` for markdown updates.
     - `style:` for CSS adjustments.
   - Example: `feat: Implement flat unit search, cascading regions, price/pyeong filters, and direct apply links`

2. **Pre-Commit Verification**:
   - Always run local compile checks (`npm run build` or similar validation task) before committing. Never commit code that breaks TypeScript types or production bundles.

3. **Remote Synchronization**:
   - Once a set of tasks is successfully verified and committed locally, push the changes to the remote repository (`origin/main`) to maintain team synchronization.
