# CalendarPro Admin

A small React admin site for managing the four data collections that the
CalendarPro Android app reads from Firestore:

- **Holidays** (`public_holidays`) — name + date or date range
- **Extra working days** (`extra_working_days`) — normally-off days declared working
- **Optional leave** (`optional_leaves`) — restricted/optional holiday days, per month
- **Monthly notes** (`monthly_notes`) — one free-text note per month

It writes to the **same Firebase project** (`calendar-pro-4f906`) the app
already reads from, in the exact document shape `AdminRepository.kt`
expects — so anything you add here shows up in the app automatically
(the app has a live Firestore listener, so updates appear without the
user reopening it).

## 1. Firebase config — already done

Your real Web app config and `VITE_ADMIN_EMAILS=myexcelweb@gmail.com` are
already filled into `.env.example`. Just copy it:

```bash
cp .env.example .env
```

(`.env` itself isn't included in the zip — only `.env.example` — since
`.env` is meant to be the file you actually edit per-environment. Copying
it over gets you working values immediately.)

## 2. Turn on Google Sign-In

This site signs in with **Google**, not a separate username/password — you
sign in with `myexcelweb@gmail.com` (or whichever Google account you list),
the same way you would on any "Sign in with Google" button.

1. Firebase console → **Authentication** → **Sign-in method** → enable the
   **Google** provider (pick a support email if it asks).
2. That's it — no manual "create user" step needed. The first time
   `myexcelweb@gmail.com` clicks **Sign in with Google**, Firebase creates
   the account automatically.
3. Only the email(s) listed in `VITE_ADMIN_EMAILS` (in your `.env`, see
   step 1) are allowed in — anyone else who signs in with a different
   Google account is immediately signed back out with a message saying
   they're not authorized. Add more emails there, comma-separated, if more
   than one person needs access.

## 3. Firestore security rules — already published

The `firestore.rules` file in this folder matches what's already live on
your project (writes gated to `myexcelweb@gmail.com` via `isAdmin()`,
public read on the 4 calendar collections). Nothing to do here unless you
add more admin emails — if you do, update `VITE_ADMIN_EMAILS` in `.env`
*and* add a matching check in `isAdmin()` in Firebase console, since the
rules are the real enforcement and the app-side check is just the friendly
front door.

## 4. Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL and click **Sign in with Google**.

## 5. Deploy it somewhere

This is a static Vite build, so it deploys anywhere static hosting works —
Firebase Hosting, Vercel, Netlify, etc. Example with Firebase Hosting:

```bash
npm run build
npm install -g firebase-tools   # if you don't have it
firebase login
firebase init hosting           # point it at the "dist" folder
firebase deploy
```

Whatever host you use, remember to set the same environment variables from
`.env` in that host's dashboard (Vercel/Netlify both have an "Environment
Variables" settings page) — don't commit your real `.env` file.

Once it's live on a real domain, add that domain in Firebase console →
**Authentication** → **Settings** → **Authorized domains**, or the Google
sign-in popup will fail with an "unauthorized domain" error. `localhost` is
already authorized by default, so local dev works out of the box.

## Notes on the data shapes

Matched to what's **actually** in your `calendar-pro-4f906` Firestore data
(checked against the console directly — a couple of fields differ from
`AdminModels.kt`'s most literal reading, since the Android reader is
deliberately flexible about field names):

| Collection | Doc id | Fields |
|---|---|---|
| `public_holidays` | auto-id | `date` (yyyy-MM-dd) for single-day holidays; `from`/`to`/`type: "range"` for multi-day ones |
| `extra_working_days` | year, e.g. `"2026"` | `dates`: array of `"yyyy-MM-dd"` |
| `optional_leaves` | year, e.g. `"2026"` | lowercase month name (`"january"`–`"december"`): array of day numbers |
| `monthly_notes` | year, e.g. `"2026"` | lowercase month name (`"january"`–`"december"`): note text |

**Two things worth knowing if you edit data by hand in the Firestore
console again:**
- Optional leave / notes month fields must be the **lowercase month name**
  (`"december"`), not a number (`"12"`) — the site reads both, but always
  *writes* the name form to match your existing data.
- Single-day holidays only need a `date` field — `from`/`to`/`type` are
  optional and only used for multi-day ranges.
