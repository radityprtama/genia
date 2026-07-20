# Genia – AI-Powered Website Builder for Agencies & Businesses

Genia is a modern, high-performance monorepo platform built with **TanStack Start**, **React 19**, **Tailwind CSS v4**, **Prisma**, and a shared **shadcn/ui** design system.

---

## 🌟 Architecture Overview

This monorepo is managed by [Turborepo](https://turbo.build/) and [Bun](https://bun.sh/):

```
genia/
├── apps/
│   ├── web/       # Main Web Application (TanStack Start) – Dashboard, Builder, Affiliate, Auth
│   └── www/       # Marketing & Content Site (TanStack Start) – Landing Pages, Blog, Docs, Help Center
├── packages/
│   └── ui/        # Shared UI Design System (@workspace/ui) – Components, AI Elements, Themes
└── prisma/        # Database Schema & Migrations
```

---

## ✨ Features

- ⚡ **TanStack Start & React 19**: Full-stack type-safe routing, server functions, and streaming.
- 🎨 **Design System (`@workspace/ui`)**: Unified components with Tailwind v4, dark mode glassmorphism, and responsive micro-animations.
- 🤖 **AI Elements**: 26+ drop-in AI interface primitives (`artifact`, `chain-of-thought`, `reasoning`, `canvas`, `prompt-input`, etc.).
- 🤝 **Affiliate Program**: Partner dashboard, link generator, custom earnings calculator, and Stripe Connect payouts.
- 📝 **Content Collections & MDX**: Blazing fast static & dynamic rendering for Blog, Help Center, Integrations, Customer Stories, and Legal pages.
- 🛠️ **Control Room**: Administrative control panel for operator promotion, workspace management, and system settings.
- 🔒 **Authentication & Security**: Multi-factor authentication (TOTP/2FA), magic link sign-in, and RBAC guards.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) `v1.1+`
- [PostgreSQL](https://www.postgresql.org/) database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/genia.git
   cd genia
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` in the root and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

4. **Initialize Database Schema:**
   ```bash
   bunx prisma db push
   ```

5. **Start Development Servers:**
   ```bash
   bun dev
   ```
   - Main Web App: [http://localhost:3000](http://localhost:3000)
   - Marketing Site: [http://localhost:3001](http://localhost:3001)

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `bun dev` | Run all applications (`web` & `www`) concurrently in development mode |
| `bun run build` | Build all workspace applications for production |
| `bun run typecheck` | Run TypeScript type checking across all packages |
| `bun run lint` | Run ESLint across all apps and packages |
| `bun run format` | Format all codebase files using Prettier |

---

## 🤝 Contributing

We welcome contributions! Please review our [Contribution Guidelines](CONTRIBUTING.md) for details on our workflow, coding standards, and commit conventions.

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** - see the [LICENSE](LICENSE) file for details.
