# Dish app infrastructure

This Next.js app uses Bun, Drizzle with Neon Postgres, Upstash Redis over TLS, and Cloudflare R2 through its S3 API. Infrastructure clients are server-only modules.

The `dev`, `build`, and `start` scripts run the Next.js CLI with Bun's runtime. Without `--bun`, Bun follows Next.js's Node.js shebang, so the app and the standalone `db:test` check would use different network runtimes.

## Environment

Copy `.env.example` to `.env` and replace the placeholders. Next.js loads `.env` automatically. Do not commit credentials.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string for Drizzle and Drizzle Kit. |
| `REDIS_URL` | Upstash TLS Redis connection string beginning with `rediss://`. |
| `R2_ACCOUNT_ID` | Cloudflare account ID. |
| `S3_API` | R2 S3 endpoint, optionally followed by `/<bucket>`. |
| `R2_BUCKET_NAME` | Bucket name if `S3_API` has no bucket path; overrides the path when set. |
| `R2_ACCESS_KEY_ID` | R2 S3 API access key ID. |
| `R2_SECRET_ACCESS_KEY` | R2 S3 API secret access key. |
| `LOG_LEVEL` | Optional server log level: `fatal`, `error`, `warn`, `info`, `debug`, or `trace` (default: `info`). |

`S3_API` must use `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`. Create a bucket-scoped R2 S3 API token with the permissions your application needs, then add its access key ID and secret access key. The endpoint and account ID alone cannot authenticate S3 requests.

## Server-side clients

Import `db` from `@/drizzle/src`, `redis` from `@/lib/redis`, and `r2` with `r2Bucket` from `@/lib/r2` in server code. Redis connects on the first command. The R2 client uses path-style bucket requests and the configured S3 API credentials.

## Database migrations

Define tables in `drizzle/src/db/schema.ts`. Then run:

```bash
bun run db:generate
bun run db:migrate
```

The schema is currently empty because no application data model has been specified. Do not run migrations until tables have been defined and reviewed.

## Logging and startup checks

The server emits structured JSON logs. At startup it checks Neon with `select 1`, Upstash Redis with `PING`, and R2 with `HeadBucket`. Each service gets a `ready` or `unavailable` log with its check duration. Checks run independently and time out after five seconds; an unavailable service does not prevent the server from starting. Server request errors are logged through Next.js instrumentation. Uncaught process exceptions are logged without suppressing the runtime's normal exit behavior.

Startup error logs include the error and nested causes, with codes, statuses, and redacted messages where available. Request error logs omit messages and payloads. Credentials are redacted from logged error messages.

## Checks

```bash
bunx tsc --noEmit
bun run lint
bun run db:check
```

Run `bun run db:test` to issue a read-only query against the configured Neon database. This requires network access and a valid `DATABASE_URL`.
