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

4. **User Confirmation Before Commit**:
   - 에이전트는 작업을 완료한 후, 변경 사항을 즉시 커밋하지 않고 사용자에게 어떤 내용이 구현되었는지 명확히 보고해야 합니다.
   - 보고 직후 "커밋할까요?" 라고 사용자에게 질문하여 커밋 의사를 명시적으로 확인받은 후에만 `git commit` 및 `git push` 절차를 진행해야 합니다.

# Documentation & UI Formatting Constraints

1. **Strictly Prohibit Redundant Expressions (Same Meaning Repetitions)**:
   - Never write redundant terms representing the exact same meaning side-by-side (e.g., avoid "시작하기 (Getting Started)", "전설의 레전드", "역전의 역전"). Use one clean representation (preferably English for technical titles, such as simply "Getting Started" or "Setup").
   
2. **Minimize Emojis & Childish Embellishments**:
   - Do not use colorful or excessive emojis (e.g., 🚀, 🟢, 💡, 📍, 📋) in the UI code, documentation, or response messages. Maintain a professional, clean, and premium typography-oriented look.

# UI & UX Design Rules

Always reference and follow the design guidelines from these resources to build highly polished, premium, and professional UIs:
- **Reddit ClaudeCode UI Design Guide**: [Claude Code UI Design Checklist](https://www.reddit.com/r/ClaudeCode/comments/1rfjovy/how_do_you_create_ui_designs_that_dont_look/?share_id=IQCQJeoOWomd94OkC6GQ_&utm_content=2&utm_medium=android_app&utm_name=androidcss&utm_source=share&utm_term=1)
- **Impeccable Style Guide**: [Impeccable Style](https://impeccable.style/)
- **Design for AI Checklist**: [Design for AI](https://github.com/ryanthedev/design-for-ai)

Ensure that all layouts feel responsive, interactive, and premium, prioritizing the user's focus and experience. Prevent layout crowding, provide accordion/collapsible options for dense configuration forms, and support clean transitions.
