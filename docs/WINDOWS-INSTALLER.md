# Veraglo ERP — Windows installer (.exe)

The desktop build packages the full ERP (UI + API) as a **Windows Setup.exe**. No Docker or PostgreSQL is required on the target PC — company data is stored under:

`%APPDATA%\Veraglo ERP\VeragloERP\data\`

## Build the installer

### GitHub Actions (automatic on every release)

When you [publish a GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release), the workflow **Release — Windows installer** (`.github/workflows/release-windows.yml`) runs on `windows-latest`, builds `Veraglo-ERP-Setup-<version>.exe`, and attaches it to the release assets.

1. Tag your release (e.g. `v1.0.0` — the `v` prefix is optional; it is stripped for the installer version).
2. Create a release from that tag and click **Publish release**.
3. Download the `.exe` from the release **Assets** section (also kept as a workflow artifact for 90 days).

Manual test without a release: **Actions** → **Release — Windows installer** → **Run workflow**.

### On Windows (recommended)

1. Install [Node.js LTS](https://nodejs.org/) (20+).
2. Open **Command Prompt** in the project folder.
3. Run:

```bat
scripts\build-windows-installer.bat
```

4. Output: `desktop\dist\Veraglo-ERP-Setup-1.0.0.exe`

### On macOS (cross-build)

```bash
chmod +x scripts/build-windows-installer.sh
./scripts/build-windows-installer.sh
```

Output is the same path. If the build fails, use a Windows machine or GitHub Actions.

## Install on another laptop

1. Copy `Veraglo-ERP-Setup-1.0.0.exe` (USB, network share, etc.).
2. Run the installer → choose install folder → finish.
3. Launch **Veraglo ERP** from Desktop or Start Menu.
4. First run: click **Continue with 14-day evaluation trial** on the activation screen (or enter Serial + License code).
5. On **Create administrator**, set your email and password (there are no default logins on a new install).
6. Sign in with the account you just created.

## What is included

| Component | Detail |
|-----------|--------|
| UI | Full ERP (all modules) |
| API | Embedded Node server on port **3847** |
| Database | Local JSON files (no Postgres) |
| Licensing | Activation gate + Admin licensing tools |
| Updates | Re-run a newer installer over the same folder |

## Data path (multi-PC / office share)

For several PCs sharing data:

1. Use **Admin → Data Path** to point to a network folder, **or**
2. Run the **server + PostgreSQL** stack from the main README on one office server and open `http://server:3000` in a browser.

The `.exe` installer is intended for **single-PC** or **one install per machine** with local data. For true multi-user on one database, use PostgreSQL mode on a server.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Windows SmartScreen | Click “More info” → “Run anyway” (unsigned build) |
| Port in use | Set env `VERAGLO_PORT=3848` before starting |
| Blank window | Wait 10s; check firewall allows localhost |
| Reset data | Delete `%APPDATA%\Veraglo ERP\VeragloERP\data` |
| Cannot sign in after deploy | Fresh installs have **no pre-set password**. Use **Create administrator** on first launch, or on the server run `cd server && npm run db:reset-admin` |
| Stuck on activation | Click **Continue with 14-day evaluation trial** |

## Code signing (optional)

For production, sign the installer with a code-signing certificate and pass `CSC_LINK` / `CSC_KEY_PASSWORD` to `electron-builder`.
