# Dashboard (React SPA)

The Vite + React + TypeScript frontend of the React Keycloak Dashboard.

See the [main README](../README.md) for the overall architecture and for how authentication, authorization and live updates work. This file covers **developing, building and deploying** the frontend.

---

## Contents

- [Local development](#local-development)
- [Environment variables and env files](#environment-variables-and-env-files)
- [Build steps](#build-steps)
- [Deploy as a main site](#deploy-as-a-main-site)
- [Deploy as a sub-site](#deploy-as-a-sub-site)
- [Web server configuration](#web-server-configuration)
- [Deployment checklist](#deployment-checklist)
- [Troubleshooting deployments](#troubleshooting-deployments)

---

## Local development

```bash
npm install
npm run dev     # http://localhost:5173, hot reload
```

You need Keycloak (`:8080`) and the API (`:5105`) running. See [Getting started](../README.md#getting-started).

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run lint` | Lint with oxlint |
| `npm run build` | Type-check (`tsc -b`), then build for production into `dist/` |
| `npm run preview` | Serve the built `dist/` locally to test a production build |

---

## Environment variables and env files

The app reads these variables:

| Variable | Example | Purpose |
|---|---|---|
| `VITE_KEYCLOAK_URL` | `https://sso.example.com` | Keycloak base URL, without `/realms/...` |
| `VITE_KEYCLOAK_REALM` | `mvc-sample` | Realm name |
| `VITE_KEYCLOAK_CLIENT_ID` | `react-dashboard` | Keycloak client ID (public client) |
| `VITE_API_URL` | `https://api.example.com` | DashboardApi base URL, no trailing slash |
| `VITE_BASE_PATH` | `/` or `/dashboard/` | URL path the app is served from. Optional; defaults to `/`. Must **start and end with `/`**. |

> ⚠️ **These values are built into the JavaScript bundle by `npm run build`.** They are not read when the app runs. Changing a URL means **rebuilding**, and none of these values may be secret (they're visible to every browser).

Vite picks the env files based on the **mode**. Later files override earlier ones:

| File | Loaded when | Commit it? |
|---|---|---|
| `.env` | always | ✅ yes: the local development defaults (already present) |
| `.env.local` | always | ❌ no: your personal overrides (`*.local` is git-ignored) |
| `.env.production` | `npm run build` (default mode `production`) | ✅ if the URLs aren't sensitive |
| `.env.production.local` | `npm run build` | ❌ no: machine- or server-specific values |
| `.env.<mode>` | `npm run build -- --mode <mode>` | ✅ e.g. `.env.subsite` |

---

## Build steps

1. **Install exact dependencies.** `npm ci` installs exactly what `package-lock.json` specifies, which gives reproducible builds:
   ```bash
   npm ci
   ```
2. **Create the env file** for your target: see [main site](#deploy-as-a-main-site) or [sub-site](#deploy-as-a-sub-site).
3. **Lint** (optional, recommended in CI):
   ```bash
   npm run lint
   ```
4. **Build.**
   ```bash
   npm run build                    # main site, uses .env.production
   npm run build -- --mode subsite  # sub-site, uses .env.subsite
   ```
   The build fails on any TypeScript error.
5. **Check the output** in `dist/`:
   ```
   dist/
   ├── index.html
   ├── favicon.svg
   ├── icons.svg
   └── assets/
       ├── index-<hash>.js
       └── index-<hash>.css
   ```
   For a sub-site build, `dist/index.html` must reference `/dashboard/assets/...`. For a main site, it's `/assets/...`.
6. **Test the build locally** (optional):
   ```bash
   npm run preview                     # main-site build → http://localhost:4173/
   npm run preview -- --mode subsite   # sub-site build  → http://localhost:4173/dashboard/
   ```
   To sign in from the preview, Keycloak's `react-dashboard` client must allow `http://localhost:4173/*` as a redirect URI, and the API's `Cors:AllowedOrigins` must include `http://localhost:4173`.
7. **Deploy** by copying the **contents** of `dist/` to the web server (see below).

> **Windows / Git Bash:** don't pass the base path on the command line (`--base=/dashboard/`). Git Bash rewrites arguments that start with `/` into Windows paths, so you'd get `/Program Files/Git/dashboard/`. Set `VITE_BASE_PATH` in an env file instead, as shown here.

---

## Deploy as a main site

The app sits at the root of its own host name, e.g. **`https://dashboard.example.com/`**.

### 1. Env file: `.env.production`

```env
VITE_KEYCLOAK_URL=https://sso.example.com
VITE_KEYCLOAK_REALM=mvc-sample
VITE_KEYCLOAK_CLIENT_ID=react-dashboard
VITE_API_URL=https://api.example.com
VITE_BASE_PATH=/
```

### 2. Build

```bash
npm ci
npm run build
```

### 3. Keycloak: client `react-dashboard`

| Setting | Value |
|---|---|
| Valid redirect URIs | `https://dashboard.example.com/*` |
| Valid post logout redirect URIs | `https://dashboard.example.com/*` |
| Web origins | `https://dashboard.example.com` |

### 4. API: `appsettings.json` (or environment variables)

```json
"Cors": { "AllowedOrigins": [ "https://dashboard.example.com" ] }
```

### 5. Copy files

Copy the contents of `dist/` into the site's root folder, e.g. `C:\inetpub\dashboard\` for IIS or `/var/www/dashboard/` for nginx. Then configure the server as described under [Web server configuration](#web-server-configuration).

---

## Deploy as a sub-site

The app sits under a path of an existing site, e.g. **`https://www.example.com/dashboard/`**, next to other content.

### 1. Env file: `.env.subsite`

```env
VITE_KEYCLOAK_URL=https://sso.example.com
VITE_KEYCLOAK_REALM=mvc-sample
VITE_KEYCLOAK_CLIENT_ID=react-dashboard
VITE_API_URL=https://api.example.com
VITE_BASE_PATH=/dashboard/
```

`VITE_BASE_PATH` sets Vite's [`base`](https://vite.dev/config/shared-options.html#base) option (see `vite.config.ts`), and its effects are automatic:

- Every asset URL in `index.html` and the bundle gets the `/dashboard/` prefix.
- `import.meta.env.BASE_URL` becomes `/dashboard/`, so **Logout** returns the user to `https://www.example.com/dashboard/`, not the main site.
- Keycloak redirects back to the page the user started on (the default in `keycloak-js`), which is under `/dashboard/`.

### 2. Build

```bash
npm ci
npm run build -- --mode subsite
```

### 3. Keycloak: client `react-dashboard`

| Setting | Value |
|---|---|
| Valid redirect URIs | `https://www.example.com/dashboard/*` |
| Valid post logout redirect URIs | `https://www.example.com/dashboard/*` |
| Web origins | `https://www.example.com` **(the origin only, no path)** |

### 4. API: CORS

```json
"Cors": { "AllowedOrigins": [ "https://www.example.com" ] }
```

A browser origin is scheme + host + port only, so `/dashboard` must **not** be included here.

### 5. Copy files

Copy the contents of `dist/` into the folder that serves `/dashboard/`. For IIS, that's an application or virtual directory named `dashboard`. For nginx, see the `alias` example below.

> The path in `VITE_BASE_PATH` must match the URL path exactly, including case and the trailing slash. To serve the app at `/apps/sales/`, set `VITE_BASE_PATH=/apps/sales/` and rebuild.

---

## Web server configuration

The dashboard is a single page with **no client-side routes**: every screen is `index.html`, and Keycloak returns its login response in the URL **fragment** (`#state=...&code=...`), which never reaches the server. So any static file server works with **no rewrite rules**. The rewrite examples below are only needed if you add client-side routing later, e.g. React Router. Including them now does no harm.

**Caching:** the files in `assets/` have content hashes in their names, so they can be cached for a year. `index.html` must **not** be cached, so users get the new asset names after a deployment.

### IIS: main site

1. In IIS Manager, create a site whose physical path is the folder that holds the `dist/` contents.
2. Optional: install the [URL Rewrite module](https://www.iis.net/downloads/microsoft/url-rewrite) if you want the rewrite rule.
3. Put this `web.config` next to `index.html`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <!-- Optional: only needed once you add client-side routes -->
    <rewrite>
      <rules>
        <rule name="SPA fallback" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" />
    </staticContent>
  </system.webServer>
  <!-- Never cache index.html -->
  <location path="index.html">
    <system.webServer>
      <staticContent>
        <clientCache cacheControlMode="DisableCache" />
      </staticContent>
    </system.webServer>
  </location>
</configuration>
```

### IIS: sub-site

1. In IIS Manager, right-click the existing site → **Add Application…** (or **Add Virtual Directory…**). Set **Alias** to `dashboard` and **Physical path** to the folder that holds the `dist/` contents.
2. Use the same `web.config` as above, with the rewrite target changed to the sub-site path:
   ```xml
   <action type="Rewrite" url="/dashboard/index.html" />
   ```

### nginx: main site

```nginx
server {
    listen 443 ssl;
    server_name dashboard.example.com;
    root /var/www/dashboard;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        add_header Cache-Control "no-cache";
        try_files $uri $uri/ /index.html;
    }
}
```

### nginx: sub-site

```nginx
server {
    listen 443 ssl;
    server_name www.example.com;
    # ... the existing site's configuration ...

    location = /dashboard {
        return 301 /dashboard/;            # add the trailing slash
    }

    location /dashboard/assets/ {
        alias /var/www/dashboard/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /dashboard/ {
        alias /var/www/dashboard/;          # trailing slashes on both lines matter
        add_header Cache-Control "no-cache";
        try_files $uri $uri/ /dashboard/index.html;
    }
}
```

### Other static hosts

Static hosts such as Azure Static Web Apps, Netlify, S3 + CloudFront and GitHub Pages work as well. Upload `dist/`, set `VITE_BASE_PATH` to the path the host serves the app from (e.g. `/<repo-name>/` for GitHub Pages project sites), and apply the same Keycloak and CORS settings.

---

## Deployment checklist

- [ ] Env file has the production URLs, and `VITE_BASE_PATH` matches the URL path
- [ ] Built with the right mode (`npm run build` or `npm run build -- --mode subsite`)
- [ ] `dist/index.html` asset paths start with the expected base path
- [ ] Keycloak client `react-dashboard`: redirect URIs, post-logout redirect URIs and web origins updated
- [ ] Keycloak client still has the **Audience** mapper adding `dashboard-api`
- [ ] API: `Cors:AllowedOrigins` contains the site **origin**, `Keycloak:Authority` points at the production realm, and `PermittedUsers` is set
- [ ] HTTPS everywhere: the site, the API and Keycloak. Browsers block an HTTPS page from calling HTTP URLs (mixed content).
- [ ] Web server sends `no-cache` for `index.html`
- [ ] Smoke test: sign in → dashboard loads → header badge shows **Live** → Logout returns to the app

---

## Troubleshooting deployments

| Symptom | Likely cause | Fix |
|---|---|---|
| Blank page, and the browser shows **404s for `/assets/...`** | Built for the wrong base path, e.g. a main-site build deployed under `/dashboard/` | Set `VITE_BASE_PATH` to match the URL, then rebuild |
| Asset URLs contain `/Program Files/Git/...` | Base path passed on the Git Bash command line and rewritten into a Windows path | Put `VITE_BASE_PATH` in the env file instead |
| Keycloak: **"Invalid parameter: redirect_uri"** | The app's URL isn't in the client's *Valid redirect URIs* | Add `https://<host>/<base path>/*` |
| Logout ends on a Keycloak error page | Post-logout redirect URI isn't allowed | Add the same pattern to *Valid post logout redirect URIs* |
| API calls fail with a **CORS** error | Site origin missing from the API's `Cors:AllowedOrigins`, or a path was included | Add the origin only, e.g. `https://www.example.com` |
| Every API call returns **401** | Token audience or issuer mismatch: `VITE_KEYCLOAK_URL` and the API's `Keycloak:Authority` point to different hosts or realms | Use the same public Keycloak URL in both, and keep the audience mapper |
| Old version still showing after deploy | `index.html` was cached | Serve `index.html` with `Cache-Control: no-cache` |
| Header badge stays **Offline** in production | A proxy or load balancer blocks WebSockets, or `/hubs` isn't forwarded | Enable WebSocket proxying for the API (`Upgrade` / `Connection` headers in nginx, *WebSocket Protocol* feature in IIS) |
