# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This repo has two independent sibling projects with no shared tooling:
- `frontend/` — static HTML/CSS/JS, no build step
- `backend/` — Spring Boot (Java), Gradle

## Frontend (`frontend/`)

Plain HTML/CSS/JS — intentionally no package.json, bundler, framework, linter, formatter, or TypeScript. Pages load scripts directly via `<script type="module">` and use native browser ES module `import`/`export`.

- Run locally with VS Code Live Server (or any static file server) — no build/npm scripts exist.
- Layout: each page is a self-contained folder under `Page/` with a matching `.html`/`.css`/`.js` triplet (e.g. `Page/Board/board.{html,css,js}`). `API/request.js` is the shared fetch wrapper used by page scripts.
- Folder/file naming is inconsistently PascalCase vs snake_case across pages (e.g. `Login` vs `Password_edit`) — match whichever convention the folder you're editing already uses, don't rename to "fix" it.
- `API/request.js` hardcodes `BASE_URL = 'http://localhost:8080'` — there's no env-based config, so switching backend targets means editing this constant directly.
- Auth convention: `request.js` reads the JWT from `localStorage.getItem('accessToken')` and attaches it as `Authorization: Bearer <token>` to every request **except** paths listed in `NO_AUTH_PATHS`. Any new public (no-auth) endpoint must be added to that array or it will get an auth header it shouldn't.
- Error convention: `handleResponse()` in `request.js` throws a plain `Error` with `.status` and `.field` properties attached (not a custom error class) — callers catch and inspect these properties rather than checking response status directly.
- UI text and code comments are in Korean.

## Backend (`backend/`)

Spring Boot 3.5, Java 25 toolchain, Gradle, Spring Security + JWT (`jjwt`), Spring Data JPA, H2 in-memory DB.

- Run: `./gradlew bootRun` from `backend/`. Test: `./gradlew test`.
- Requires the `JWT_SECRET` env var to be set (`application.yaml` reads `jwt.secret: ${JWT_SECRET}`) — the app won't start without it.
- DB schema is managed via `src/main/resources/schema.sql` / `data.sql`, auto-run on startup (`spring.sql.init.mode=always`). JPA DDL auto-generation is disabled (`ddl-auto=none`) — schema changes go in `schema.sql`, not entity annotations.
- H2 console available at `/h2-console` when running.
- Code is organized by domain under `homework.week4` (`Auth`, `User`, `Post`, `Comment`, `Security`, `FileUpload`), each typically with `controller/`, `service/`, `repository/`, `dto/`, `entity/` subpackages.
- Controllers wrap responses in `ApiResponse<T>` (`{ message, data }`) — match this shape for new endpoints since the frontend's `request.js` expects it.

## Workflow

- Single `main` branch, direct commits — no PR/branching convention currently in use.
- Commit messages are written in Korean.
