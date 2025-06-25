# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# BarberHub Monorepo

## Project Structure

```
barberhub/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── features/       # Feature-based organization
│   │   │   └── customers/
│   │   │       └── components/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   └── ui/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── styles/
│   │   ├── routes/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   ├── assets/
│   │   ├── vite.svg
│   │   └── react.svg
├── server/                  # Backend Node.js application
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── data/
│   │   └── server.js
│   ├── tests/
│   ├── package.json
│   └── package-lock.json
├── shared/                  # Shared types, schemas, constants
│   ├── types/
│   ├── schemas/
│   └── constants/
├── docs/
├── scripts/
```

## Path Aliases

- `@/` → `src/`
- `@ui/` → `src/shared/components/ui/`
- `@shared/` → `src/shared/`
- `@utils/` → `src/shared/utils/`
- `@services/` → `src/shared/services/`
- `@components/` → `src/shared/components/`

## Shared Code Conventions

- **UI Components:** Place all reusable UI components in `src/shared/components/ui/`.
- **Utilities:** Place all shared utility functions in `src/shared/utils/`.
- **API Services:** Place all shared API service files in `src/shared/services/`.
- **Types/Schemas/Constants:** Place cross-app types, Zod schemas, and constants in the root `shared/` directory.

## How to Import

```js
import { Button } from '@ui/button';
import { cn } from '@utils/utils';
import { authAPI } from '@services/api';
```

---

For more details, see the [project-rules](../project-rules.md) and the backend README in `/docs/README-backend.md`.
