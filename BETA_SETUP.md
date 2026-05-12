# Eastman Colour Printers — Beta Setup Guide

This is a beta build of the Eastman Colour Printers Internal Quote Calculator. Follow these steps to run it on your local machine.

> **Beta version:** `v0.2.0-beta` — please share feedback during our review meeting.

---

## 1. Prerequisites

Install these once:

| Software    | Version     | Download                                       |
| ----------- | ----------- | ---------------------------------------------- |
| **Node.js** | 18 or newer | https://nodejs.org/                            |
| **MongoDB** | 6 or newer  | https://www.mongodb.com/try/download/community |

To verify after install, open a terminal and run:

**macOS / Linux** (Terminal)

```bash
node --version
npm --version
mongod --version
```

**Windows** (Command Prompt or PowerShell)

```powershell
node --version
npm --version
mongod --version
```

> On Windows, if `mongod` is not recognised, install MongoDB as a Windows Service from the installer (the default option). The service starts automatically on boot.

> **Easier alternative:** instead of installing MongoDB locally, you can use a free **MongoDB Atlas** cluster. If you prefer that, ask the developer for a ready-made connection string.

---

## 2. First-time Setup

1. Unzip the beta archive to a folder of your choice.
2. Open a terminal **inside that folder**:
   - **macOS:** right-click the folder in Finder → `New Terminal at Folder`.
   - **Windows:** open the folder in File Explorer → click the address bar → type `cmd` and press Enter (or use PowerShell).
   - **Linux:** right-click in the folder → `Open in Terminal`.
3. Install all dependencies:

```bash
npm run install:all
```

This installs dependencies for the root, server, and client (takes 2–3 minutes the first time).

### Configure the server

Copy the example env file:

**macOS / Linux**

```bash
cp server/.env.example server/.env
```

**Windows** (Command Prompt)

```cmd
copy server\.env.example server\.env
```

**Windows** (PowerShell)

```powershell
Copy-Item server\.env.example server\.env
```

Open `server/.env` in any text editor (Notepad works on Windows) and update `MONGODB_URI` to match your setup:

- **Local MongoDB (default):**
  ```
  MONGODB_URI=mongodb://127.0.0.1:27017/eastman-polybags
  ```
- **MongoDB Atlas:** paste the connection string provided by the developer.

The other defaults are fine for local use.

### (Optional) Configure the client

The client points to `http://localhost:3001` by default. If your server runs elsewhere, copy the example file and edit it:

**macOS / Linux**

```bash
cp client/.env.example client/.env.local
```

**Windows** (Command Prompt)

```cmd
copy client\.env.example client\.env.local
```

**Windows** (PowerShell)

```powershell
Copy-Item client\.env.example client\.env.local
```

---

## 3. Start the App

From the project root:

```bash
npm start
```

This starts both the API server and the web app. When you see:

```
Server running on http://localhost:3001
VITE  ready in ...
```

…open **http://localhost:8000** in your browser.

To stop, press `Ctrl + C` in the terminal.

---

## 4. Sample Data (optional)

The app starts with **empty rate values** — material and charge rate rows exist but are blank, ready for you to enter your prices via the **Price Settings** panel in the app.

If you'd rather start from a pre-filled set of example values:

```bash
npm run seed-db
```

Sample data is added only if the corresponding collection is empty — running it again is safe and will not duplicate entries.

> Requires `DEV_RESET_DB_KEY` to be set in `server/.env` and passed via `--key`. For example:
>
> ```bash
> npm run seed-db -- --key your-key-here
> ```

---

## 5. Reset the Database (optional)

If you want to wipe all your saved data and start from scratch:

```bash
npm run reset-db
```

This clears all rate history and removes added rows. To repopulate with sample data afterwards, run `npm run seed-db`.

You will need to set `DEV_RESET_DB_KEY` in `server/.env` to a value of your choice and pass it as `--key your-key-here`.

---

## 6. Troubleshooting

| Problem                                                                 | Likely cause                                                  | Fix                                                                                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `MongoNetworkError` on startup                                          | MongoDB is not running, or `MONGODB_URI` is wrong             | Start MongoDB (`brew services start mongodb-community` on macOS) or fix the URI in `server/.env`                           |
| Browser shows "Failed to fetch" or settings won't load                  | API server not running, or wrong `VITE_API_BASE`              | Make sure the server terminal is up; check `client/.env.local`                                                             |
| Port 3001 already in use                                                | Another app is using the port                                 | Change `PORT` in `server/.env` and update `VITE_API_BASE` accordingly                                                      |
| Port 8000 already in use                                                | Another app is using the port                                 | Stop the other app, or change `port` in `client/vite.config.js`                                                            |
| Quotes saved earlier disappeared                                        | Quotes are saved in your browser's `localStorage` per browser | Use the same browser/profile to see your saved quotes                                                                      |
| **Windows:** "running scripts is disabled on this system" in PowerShell | PowerShell execution policy blocks npm scripts                | Open PowerShell as Administrator and run: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then restart the terminal |
| **Windows:** `'cp' is not recognized`                                   | Used a macOS/Linux command in Windows terminal                | Use the Windows `copy` (cmd) or `Copy-Item` (PowerShell) commands shown above                                              |
| **Windows:** MongoDB doesn't start                                      | Service not installed or not running                          | Open `services.msc`, find `MongoDB Server`, right-click → Start. Or reinstall MongoDB and tick "Install as a Service"      |

---

## 7. Sharing Feedback

We'll go through your feedback in person during our review meeting. Please note:

- Anything that's confusing or unclear in the UI
- Missing fields or rates
- Any wrong calculations vs. your manual quotes
- Features you'd like to see prioritized

Thank you for trying the beta!
