# PlooTunes — Docker Setup

## Prerequisites

- Docker + Docker Compose installed on the server
- Both the `plootunes` and `PDS` repos cloned as siblings:
  ```
  ~/code/
  ├── plootunes/
  └── PDS/
  ```
  The build context is two levels up (`../..`) so both repos must be present at the same level.

## First-time setup

### 1. Create the `.env` file

```sh
cp docker/.env.example docker/.env
```

Fill in `DATABASE_URL`, `POSTGRES_PASSWORD`, `SESSION_SECRET`, and the OIDC vars.

> **Note:** `DATABASE_URL` must use `@postgres:5432` (the Docker service name), not `localhost`.

### OS-ownership write guard

The server container runs as a fixed non-root user (`PLOOTUNES_UID`/`PLOOTUNES_GID`, default `1001:1001`). The `covers` named volume inherits this ownership automatically on first mount.

`MEDIA_ROOT` (the library mount) is bind-mounted **read-only** by default — the server only scans it, never writes to it. If you want the server's library-upload feature to write into the same tree, mount it read-write instead and `chown` the host directory to `1001:1001` (group/other read-only) before starting the stack, so the app is the sole writer:

```sh
sudo chown -R 1001:1001 /opt/plootunes/library
sudo chmod -R 750 /opt/plootunes/library
```

### 2. Build and start

Run from the `docker/` directory:

```sh
cd docker
docker compose up --build -d
```

On first startup the server will:
1. Run all database migrations
2. Scan `MEDIA_ROOT` and ingest the library

PlooTunes will be available at `http://<server-ip>:<PLOOTUNES_PORT>`.

### Local smoke test (no `.env` needed)

With no `.env` file, `MEDIA_HOST_DIR` defaults to the in-repo stub library (`src/core/db/test/assets/testLibrary`), so `docker compose up --build` boots the full stack and scans real (test) audio files with zero setup:

```sh
cd docker
docker compose up --build
curl http://localhost:8080/api/health   # -> proxied through nginx to the server
```

## Updating

After pulling new code, rebuild the images:

```sh
cd docker
docker compose up --build -d
```

## Useful commands

```sh
# View logs
docker compose logs -f

# View server logs only (scan progress, migration output)
docker compose logs -f server

# Check the server is running as the fixed non-root user
docker compose exec server id

# Stop all containers
docker compose down

# Stop and wipe the database + covers volume (destructive!)
docker compose down -v
```

## Production deployment

This `docker-compose.yml` is the base stack, built and validated in-repo. The production wiring (host paths, secrets, reverse proxy/TLS termination) lives in **plootServer**, not here — see the plootServer repo for the deployed configuration.
