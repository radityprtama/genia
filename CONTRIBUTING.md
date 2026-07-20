# Contributing to Genia

Thank you for your interest in contributing to Genia! We appreciate community contributions to help make Genia the best AI-powered web development platform for agencies and businesses.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) `v1.1+`
- Node.js `v20+`
- Git

### Workspace Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/genia.git
   cd genia
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   ```

4. Verify build and typechecking:
   ```bash
   bun run typecheck
   bun run build
   ```

---

## 🎋 Development Workflow

1. Create a feature branch off `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes adhering to our design patterns:
   - Use UI components from `@workspace/ui` for shared visual consistency.
   - Keep styling consistent with Tailwind CSS v4 variables in `packages/ui/src/styles/globals.css`.

3. Format and typecheck your code before committing:
   ```bash
   bun run format
   bun run typecheck
   ```

---

## 📝 Commit Message Guidelines

We enforce the **Conventional Commits** specification:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes only
- `style:` Code style/formatting (no logic changes)
- `refactor:` Code refactoring (no functional changes)
- `test:` Adding or updating tests
- `chore:` Maintenance tasks or dependency updates

*Example:*
```bash
git commit -m "feat(affiliate): add referral link copy feedback toast"
```

---

## 🔀 Pull Request Process

1. Push your branch to GitHub.
2. Open a Pull Request against the `main` branch.
3. Ensure all CI checks (typecheck, lint, build) pass.
4. Address any code review feedback promptly.

---

## 📜 License & Contributor Agreement

By contributing to Genia, you agree that your contributions will be licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
