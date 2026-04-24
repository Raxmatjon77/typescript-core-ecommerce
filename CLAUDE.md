# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commit rules

- Write short, imperative commit messages (e.g. `refactor auth module`, `fix body parser async bug`)
- Do **not** include AI tool names, model names, or co-author lines in commit messages or bodies
- Stage specific files by name; avoid `git add -A` or `git add .`

## Commands

```bash
# Start development server (auto-restarts on file changes)
npm run dev
```

No build or test scripts are configured yet.

## Architecture

Framework-free Node.js HTTP server — no Express or Fastify. All routing, middleware, and request handling is custom-built in `src/http/router.ts`.

### Layering

```
HTTP Request
  └── Router (src/http/router.ts)
       ├── Global middlewares (in order, outermost first):
       │    errorMiddleware → corsMiddleware → securityHeadersMiddleware
       │    → bodyParserMiddleware → loggerMiddleware
       └── Route-specific middlewares: authMiddleware → requireRole → validate → handler
                                                                                    │
                                                                             Controller
                                                                             (req, res)
                                                                                    │
                                                                              Service
                                                                          (pure domain logic)
                                                                                    │
                                                                            Repository
                                                                          (Mongo collection)
```

### Key Files

- **`src/server.ts`** — Entry point: loads env, creates logger + Mongo connection, calls `buildApp`, registers SIGINT/SIGTERM shutdown handlers.
- **`src/app.ts`** — Composition root: wires all repositories → services → controllers → routers.
- **`src/http/router.ts`** — `Router` class; supports `.use()` globals, `.get/post/patch/delete/put()` routes, `.mount(prefix, subRouter)` for module-owned sub-routers, proper `URL` parsing so query strings don't cause 404s, HEAD→GET fallback, 405 on method mismatch.
- **`src/config/env.ts`** — `loadEnv()` validates all env vars with Zod at startup; the process exits with a readable error if any required var is missing or invalid.
- **`src/common/exceptions.ts`** — `CustomError` hierarchy: `BadRequestException` (400), `UnauthorizedException` (401), `ForbiddenException` (403), `NotFoundException` (404), `ConflictException` (409), `InternalServerException` (500).
- **`src/common/jwt.service.ts`** — `JwtService` class; takes `env` in constructor; tokens have configurable `expiresIn`.
- **`src/common/logger.service.ts`** — Singleton `LoggerService`; Winston transports created once at startup; redacts `authorization`/`cookie` headers.
- **`src/db/mongo.ts`** — `createMongoConnection(uri, dbName)` returns `{ client, db, close() }`.

### Modules (`src/modules/`)

Each module owns its own model, repository, service, controller, routes, and DTOs:

```
src/modules/
├── auth/        POST /auth/signup, POST /auth/signin, GET /auth/me
├── user/        GET /users/:userId    (admin only)
└── product/     GET|POST /products, GET|PATCH|DELETE /products/:productId   (admin only)
```

### Middleware factories

- `authMiddleware(jwt)` — verifies Bearer JWT, sets `(req as any).user`
- `requireRole('admin')` — checks `req.user.role`; assumes `authMiddleware` ran first
- `validate(schema, 'body'|'params'|'query')` — Zod-parses the target; throws `BadRequestException` with field-level errors on failure; replaces `req[target]` with the parsed result
- `rateLimitMiddleware(env)` — in-memory sliding window by IP; applied per-router (auth routes only)
- `corsMiddleware(env)` — reads `CORS_ORIGIN` / `CORS_CREDENTIALS`
- `bodyParserMiddleware(maxBytes?)` — async; size-limited (default 1 MB); skips body for GET/HEAD/OPTIONS/DELETE

### Request validation pattern

DTOs live in `src/modules/<feature>/dto/*.dto.ts`. Use the `validate` middleware factory:

```ts
router.post('/signup', handler, [validate(SignupBodySchema, 'body')]);
```

The `errorMiddleware` (registered first/outermost) catches all `CustomError` and `ZodError` and formats them as `{ error: { message, details? } }`.

### Path Aliases

`@*` maps to `src/*` (tsconfig `paths` + `tsconfig-paths` at runtime). Examples:
- `@common/exceptions` → `src/common/exceptions`
- `@http/router` → `src/http/router`
- `@middlewares` → `src/middlewares/index.ts`
- `@modules/user/user.service` → `src/modules/user/user.service`
- `@config/env` → `src/config/env`

### Environment Variables

All validated by Zod at startup in `src/config/env.ts`.  
Required: `MONGO_URI`, `DB_NAME`, `JWT_SECRET` (≥ 8 chars), `PORT`  
Optional (have defaults): `NODE_ENV`, `JWT_ACCESS_EXPIRES_IN` (15m), `JWT_REFRESH_EXPIRES_IN` (7d), `CORS_ORIGIN`, `CORS_CREDENTIALS`, `LOG_LEVEL`, `MAX_BODY_BYTES`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`

### Notes

- Prisma is installed as a dependency but the codebase uses the native MongoDB driver — do not add Prisma usage without discussion.
- `strictNullChecks` and `noImplicitAny` are disabled in `tsconfig.json`.
- `(req as any).user / .body / .params / .query` — the `IncomingMessage` augmentation in `src/types/http.d.ts` is not loaded by ts-node automatically; use explicit casts when accessing these properties in new code.
- Redis env vars are present but not yet integrated — rate limiting uses an in-memory store for now.
