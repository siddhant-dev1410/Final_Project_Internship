# Contact Book — Complete Frontend Project

This is the whole frontend, ready to run. It replaces your existing frontend folder entirely.

## Setup

1. Unzip this wherever your project lives (or replace your current frontend folder with it).
2. Open a terminal inside this folder and run:
   ```bash
   npm install
   npm run dev
   ```
3. Open the URL it gives you (usually `http://localhost:5173`).

## Before you run it

Open `src/App.jsx` and check this line near the top:
```js
const API_URL = "http://localhost:8080";
```
Make sure it matches wherever your Spring Boot backend is running. If your
backend runs on a different port, change it here.

## What you'll see

1. **Login page** loads first.
2. Click "Register" → create a username, email, password → you're logged in
   immediately and land on the Contacts page.
3. Contacts page has a navbar (your username + Logout), the same Add Contact
   form and table you had before, now scoped to your account only.
4. Refresh the page — you stay logged in (token is saved in the browser).
5. Click Logout → back to Login.

## Files in this project

```
index.html          - the HTML shell Vite loads
vite.config.js       - Vite + React plugin config
package.json         - dependencies (axios, react, react-dom, vite)
src/main.jsx          - mounts the App
src/index.css         - basic global styling
src/App.jsx           - EVERYTHING: login, register, contacts, navbar, API calls
```

Everything (login, register, contacts, navbar) lives in `App.jsx` on purpose —
one file, nothing to wire together.

## If something breaks

Paste me the exact red error text from the terminal or browser console and
I'll fix it directly.

## Next step

Once this runs locally and talks to your backend successfully, tell me and
I'll walk you through deploying it to Vercel with the live backend URL.
