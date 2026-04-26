# Eastman Polybags — Beta Setup Guide

This is a beta build of the Eastman Polybags Internal Quote Calculator. Follow these steps to run it on your local machine.

> **Beta version:** `v0.1.0-beta` — please share feedback during our review meeting.

---

## 1. Prerequisites

Install these once:

| Software    | Version  | Download                                          |
| ----------- | -------- | ------------------------------------------------- |
| **Node.js** | 18 or newer | https://nodejs.org/                            |
| **MongoDB** | 6 or newer | https://www.mongodb.com/try/download/community |

To verify after install, open a terminal and run:

```bash
node --version
npm --version
mongod --version
```

> **Easier alternative:** instead of installing MongoDB locally, you can use a free **MongoDB Atlas** cluster. If you prefer that, ask the developer for a ready-made connection string.

---

## 2. First-time Setup

Open a terminal in the project folder and run:

```bash
npm run install:all
```

This installs dependencies for the root, server, and client (takes 2–3 minutes the first time).

### Configure the server

Copy the example env file:

```bash
cp server/.env.example server/.env
```

Open `server/.env` in any text editor and update `MONGODB_URI` to match your setup:

- **Local MongoDB (default):**
  ```
  MONGODB_URI=mongodb://127.0.0.1:27017/eastman-polybags
  ```
- **MongoDB Atlas:** paste the connection string provided by the developer.

The other defaults are fine for local use.

### (Optional) Configure the client

The client points to `http://localhost:3001` by default. If your server runs elsewhere, copy the example file and edit it:

```bash
cp client/.env.example client/.env.local
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

## 4. Reset the Database (optional)

If you want to wipe all your saved data and restore the default rates:

```bash
npm run reset-db
```

You will need to set `DEV_RESET_DB_KEY` in `server/.env` to a value of your choice and pass it as documented in the prompt.

---

## 5. Troubleshooting

| Problem | Likely cause | Fix |
| --- | --- | --- |
| `MongoNetworkError` on startup | MongoDB is not running, or `MONGODB_URI` is wrong | Start MongoDB (`brew services start mongodb-community` on macOS) or fix the URI in `server/.env` |
| Browser shows "Failed to fetch" or settings won't load | API server not running, or wrong `VITE_API_BASE` | Make sure the server terminal is up; check `client/.env.local` |
| Port 3001 already in use | Another app is using the port | Change `PORT` in `server/.env` and update `VITE_API_BASE` accordingly |
| Port 8000 already in use | Another app is using the port | Stop the other app, or run client with `PORT=8001 npm run start:client` |
| Quotes saved earlier disappeared | Quotes are saved in your browser's `localStorage` per browser | Use the same browser/profile to see your saved quotes |

---

## 6. Sharing Feedback

We'll go through your feedback in person during our review meeting. Please note:

- Anything that's confusing or unclear in the UI
- Missing fields or rates
- Any wrong calculations vs. your manual quotes
- Features you'd like to see prioritized

Thank you for trying the beta!
