# webmcp-kitchen-sink

A pnpm monorepo of independent Vite + React + TypeScript apps exploring WebMCP use cases.

---

## Stack

- pnpm workspaces
- Vite + React 18 + TypeScript (per app)
- Tailwind CSS (shared preset)
- [`react-agent-tool`](https://github.com/littleplato/react-agent-tool) @ `experimental`
- Vercel for deployment (one project per app)

---

## Structure

```
webmcp-kitchen-sink/
├── apps/                          # one directory per app
├── packages/
│   └── shared/                    # Tailwind preset, common components
├── pnpm-workspace.yaml
├── package.json                   # private: true, root scripts only
├── tsconfig.json                  # base config, extended per app
└── .prettierrc
```

---

## Root Config

`pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Root `package.json`:
```json
{
  "name": "webmcp-kitchen-sink",
  "private": true,
  "scripts": {
    "dev:<appname>": "pnpm --filter <appname> dev",
    "build:all": "pnpm --filter './apps/*' build",
    "lint:all": "pnpm --filter './apps/*' lint"
  }
}
```

---

## Each App

Scaffold with:
```bash
cd apps/<appname>
pnpm create vite . --template react-ts
```

Dependencies per app:
- `react-agent-tool@experimental`
- `tailwindcss` + `@tailwindcss/vite`
- `@webmcp-kitchen-sink/shared` (`workspace:*`)

Every app calls `installPolyfill()` once before rendering:
```ts
// main.tsx
import { installPolyfill } from 'react-agent-tool'
installPolyfill()
```

---

## `packages/shared`

```json
{
  "name": "@webmcp-kitchen-sink/shared",
  "private": true,
  "main": "./src/index.ts"
}
```

Contains:
- `tailwind.preset.ts` — shared theme
- `AgentIndicator.tsx` — UI badge showing agent activity via `useAgentEvent`
- `Layout.tsx` — common page shell

Each app's `tailwind.config.ts`:
```ts
import sharedPreset from '@webmcp-kitchen-sink/shared/tailwind.preset'

export default {
  presets: [sharedPreset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/shared/src/**/*.{ts,tsx}'
  ],
}
```

---

## Deployment

One Vercel project per app, each pointing at this repo with root directory set to `apps/<appname>`.