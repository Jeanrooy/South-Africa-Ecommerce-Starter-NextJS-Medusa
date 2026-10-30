# Deployment from source

This guide targets a Linux host with Node 24 LTS, pnpm 10.11.1, Git and an HTTPS reverse proxy. Run application processes as an unprivileged service user. Commands use a POSIX shell. The two applications remain in the workspace so pnpm workspace dependencies and the shared page-builder package resolve correctly.

The supplied root Compose file runs local databases only. Full application containers, automated HTTPS and a turnkey production Compose stack are planned in [the roadmap](ROADMAP.md). For now, use Compose or managed services for infrastructure and run the apps from source as below.

## 1. Infrastructure

For local evaluation, `pnpm setup` provisions the supplied development Compose stack. Do not use its hard-coded password and publicly bound database ports as your production configuration.

For a single-host source deployment, create a separate infrastructure directory outside the repository with this `compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: medusa
      POSTGRES_DB: ecomstarter
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD}
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U medusa -d ecomstarter"]
      interval: 5s
      retries: 10
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis-data:/data
    command: ["redis-server", "--appendonly", "yes"]
volumes:
  postgres-data:
  redis-data:
```

Set a strong `POSTGRES_PASSWORD` through a protected Compose environment file or shell environment, then run `docker compose up -d --wait` in that directory. Back up PostgreSQL outside its Docker volume. Database initialization variables apply when the data directory is first created; changing a password variable does not rotate an existing database password. Do not delete volumes to update a running store.

These loopback addresses work when Node runs on the host. If you later containerize the apps, use service names such as `postgres` and `redis` from the container network instead of `localhost`.

Redis does not automatically configure Medusa infrastructure providers. The template currently uses in-memory event/workflow/locking defaults. Configure durable Redis modules and shared rate limiting before relying on durable background processing or multiple replicas. See [Medusa deployment guidance](https://docs.medusajs.com/learn/deployment/general).

## 2. Checkout and install

```sh
git clone https://github.com/Jeanrooy/South-Africa-Ecommerce-Starter-NextJS-Medusa.git
cd South-Africa-Ecommerce-Starter-NextJS-Medusa
corepack enable
pnpm install --frozen-lockfile
```

Use the branch/release you intend to deploy. Do not run `pnpm setup` on a live deployment: it provisions development databases, demo data and local admin credentials.

## 3. Backend environment

Use your host's secret manager or service environment. For the commands below, one option is a protected file **outside the repository**, for example `/etc/ecomstarter/backend.env`:

```dotenv
NODE_ENV=production
DATABASE_URL=postgres://medusa:URL_ENCODED_PASSWORD@127.0.0.1:5432/ecomstarter
CMS_DATABASE_URL=postgresql://medusa:URL_ENCODED_PASSWORD@127.0.0.1:5432/ecomstarter?schema=cms
STORE_CORS=https://shop.example.co.za
ADMIN_CORS=https://api.example.co.za
AUTH_CORS=https://shop.example.co.za,https://api.example.co.za
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
COOKIE_SECRET=REPLACE_WITH_ANOTHER_LONG_RANDOM_SECRET
STOREFRONT_URL=https://shop.example.co.za
DEFAULT_COUNTRY=za
EMAIL_MODE=log
PEACH_ENABLED=false
```

The API domain serves Admin at `/app`. Replace domains, passwords and secrets. URL-encode special characters in database passwords. Restrict environment-file permissions to the service user. If using the shell loading commands below, quote values containing spaces or shell metacharacters using valid shell assignment syntax.

Load the backend variables in the build/release shell:

```sh
set -a
. /etc/ecomstarter/backend.env
set +a
pnpm --filter @dtc/backend exec prisma generate
```

Production commands must receive environment variables explicitly. A development `apps/backend/.env` is not a reliable production configuration: Medusa's production environment handling differs. Do not copy secrets into generated build output or commit them. See [Medusa build documentation](https://docs.medusajs.com/learn/build).

## 4. Migrate and build Medusa

From the workspace root with the backend environment loaded:

```sh
pnpm --filter @dtc/backend exec prisma migrate deploy
pnpm --filter @dtc/backend exec medusa db:migrate
pnpm --filter @dtc/backend run build
```

Run migrations once per release, before starting new application processes. The Medusa migration scripts seed store defaults, including South Africa; inspect them before deploying into an existing database. Do not rerun demo expansion or local-admin scripts as production release steps.

The built server remains inside this workspace and resolves dependencies from `apps/backend/node_modules` and the root pnpm store. Keep the complete installed workspace on the host. Do not copy `.medusa/server` alone without packaging/installing its dependencies: its manifest includes the local `@ecom/page-builder` workspace package.

Start Medusa from its generated directory:

```sh
cd apps/backend/.medusa/server
node ../../node_modules/@medusajs/cli/cli.js start
```

Configure your process supervisor with this working directory, the backend environment and the same command. The API defaults to port 9000. Supervise it rather than leaving an interactive terminal open.

For the first deployment, create a merchant administrator using the Medusa CLI with your own email and password. Use the `medusa user` command from the backend app with its environment loaded; keep credentials out of shared shell history/logs. Do not use generated local demo credentials. Create a publishable API key in Admin, associate it with the storefront sales channel and copy only that publishable key into the storefront environment.

## 5. Storefront environment and build

For local development, use `apps/storefront/.env.local`. For deployment, either inject variables through the host or create a protected `apps/storefront/.env.production.local`:

```dotenv
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.example.co.za
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_REPLACE_WITH_YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_DEFAULT_REGION=za
NEXT_PUBLIC_BASE_URL=https://shop.example.co.za
```

Start a fresh shell for the storefront; do not reuse the backend secret environment. Set `NODE_ENV=production` in its service configuration. Public variables must be present **before building** as well as at runtime. They are not secrets, and changing them requires rebuilding. Backend credentials never belong in a `NEXT_PUBLIC_*` variable.

With the backend running and reachable, from the workspace root:

```sh
pnpm --filter @dtc/storefront run build
pnpm --filter @dtc/storefront run start
```

The storefront listens on port 8000. Configure a separate supervised process with working directory `apps/storefront` and command `pnpm run start`. The root `pnpm start` is not the deployment command for these two services because Medusa must start in its generated server directory.

## 6. HTTPS, integrations and verification

Route `shop.example.co.za` to port 8000 and `api.example.co.za` to port 9000 through your reverse proxy. Restrict direct application/database access with the host firewall. Preserve forwarded protocol/host headers and test Admin login over HTTPS.

Configure shared object storage or durable uploads, real delivery rules, tax settings, policies, backups and monitoring. Enable Peach and Resend only after following [their setup instructions](SETUP.md). Verify Peach success, decline, cancel, pending, webhook retry and refund scenarios against your merchant sandbox before live payments.

Check `/za`, product options, cart, checkout, customer account, `/app`, content publishing and uploaded images on the deployed domains. Keep automated smoke/browser scripts pointed at local demo data: they can create customers and orders. No remote production deployment has been verified by this guide.

## Updates

Back up the database, fetch the intended release, install with the lockfile, regenerate Prisma, apply both migration systems, rebuild each app and restart supervised processes. Rebuild Next.js when public configuration changes. Rebuilding Medusa recreates `.medusa/server`; avoid building over a running release directory. Use separate release directories and switch services after the build is complete.
