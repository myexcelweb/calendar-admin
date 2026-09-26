/**
 * One-time migration: old flat collections -> new hierarchical schema.
 *
 *   public_holidays/{autoId}            -> calendars/{year}/months/{mm}/holidays/{dd}
 *   optional_leaves/{year}              -> calendars/{year}/months/{mm}.optionalLeaveDays
 *   extra_working_days/{year}           -> calendars/{year}/months/{mm}.extraWorkingDays
 *   monthly_notes/{year}                -> calendars/{year}/months/{mm}.note
 *
 * Usage:
 *   1. Firebase Console -> Project settings -> Service accounts ->
 *      "Generate new private key". Save the JSON as scripts/serviceAccountKey.json
 *      (this file is gitignored - never commit it).
 *   2. cd admin-website && npm install firebase-admin --save-dev
 *   3. node scripts/migrate.js            # dry run, prints what it would write
 *   4. node scripts/migrate.js --apply    # actually writes to Firestore
 *
 * Safe to re-run: every write is a merge, so running it twice just
 * overwrites the same values again rather than duplicating anything.
 * Old collections are left untouched - delete them yourself afterwards
 * once you've spot-checked the new data in the Firebase console.
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APPLY = process.argv.includes("--apply");

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function monthNumberFromKey(key) {
  const asNum = Number(key);
  if (Number.isInteger(asNum) && asNum >= 1 && asNum <= 12) return asNum;
  const idx = MONTH_NAMES.indexOf(String(key).toLowerCase());
  return idx === -1 ? null : idx + 1;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

async function main() {
  const keyPath = join(__dirname, "serviceAccountKey.json");
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
  } catch {
    console.error(
      `Missing ${keyPath}\nDownload a service account key from Firebase Console -> Project settings -> Service accounts, and save it there.`
    );
    process.exit(1);
  }

  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  console.log(APPLY ? "Running migration (writes enabled)…" : "Dry run (pass --apply to write)…\n");

  const writes = []; // { path, data }
  const monthDocFields = new Map(); // "year/mm" -> merged field object

  function queueMonthField(year, month, field, value) {
    const key = `${year}/${pad2(month)}`;
    const existing = monthDocFields.get(key) || {
      year: Number(year),
      month: Number(month),
      monthName: MONTH_NAMES[month - 1][0].toUpperCase() + MONTH_NAMES[month - 1].slice(1),
    };
    existing[field] = value;
    monthDocFields.set(key, existing);
  }

  // 1. public_holidays -> calendars/{year}/months/{mm}/holidays/{dd}
  const holidaysSnap = await db.collection("public_holidays").get();
  for (const doc of holidaysSnap.docs) {
    const d = doc.data();
    const from = d.from || d.fromDate || d.date;
    const to = d.to || d.toDate || from;
    if (!from) continue;
    // "yyyy-MM-dd" strings parse as UTC midnight: read them back with the UTC getters too,
    // or the day shifts by one in time zones behind UTC
    const start = new Date(from);
    const end = new Date(to || from);
    if (isNaN(start) || isNaN(end)) continue;
    for (let dt = new Date(start); dt <= end; dt.setUTCDate(dt.getUTCDate() + 1)) {
      const year = dt.getUTCFullYear();
      const month = dt.getUTCMonth() + 1;
      const day = dt.getUTCDate();
      writes.push({
        path: `calendars/${year}/months/${pad2(month)}/holidays/${pad2(day)}`,
        data: {
          day,
          name: d.name || d.title || d.occasion || "Holiday",
          date: dt.toISOString().slice(0, 10),
          migratedFrom: doc.id,
        },
      });
    }
  }

  // 2. optional_leaves/{year} -> calendars/{year}/months/{mm}.optionalLeaveDays
  const leavesSnap = await db.collection("optional_leaves").get();
  for (const doc of leavesSnap.docs) {
    const year = Number(doc.id);
    if (!year) continue;
    for (const [k, v] of Object.entries(doc.data())) {
      const month = monthNumberFromKey(k);
      if (!month || !Array.isArray(v)) continue;
      queueMonthField(year, month, "optionalLeaveDays", v.map(Number).sort((a, b) => a - b));
    }
  }

  // 3. extra_working_days/{year} -> calendars/{year}/months/{mm}.extraWorkingDays
  const workingSnap = await db.collection("extra_working_days").get();
  for (const doc of workingSnap.docs) {
    const year = Number(doc.id);
    if (!year) continue;
    const dates = doc.data().dates || [];
    const byMonth = new Map();
    for (const iso of dates) {
      const dt = new Date(iso);
      if (isNaN(dt) || dt.getUTCFullYear() !== year) continue;
      const month = dt.getUTCMonth() + 1;
      if (!byMonth.has(month)) byMonth.set(month, []);
      byMonth.get(month).push(dt.getUTCDate());
    }
    for (const [month, days] of byMonth) {
      queueMonthField(year, month, "extraWorkingDays", days.sort((a, b) => a - b));
    }
  }

  // 4. monthly_notes/{year} -> calendars/{year}/months/{mm}.note
  const notesSnap = await db.collection("monthly_notes").get();
  for (const doc of notesSnap.docs) {
    const year = Number(doc.id);
    if (!year) continue;
    for (const [k, v] of Object.entries(doc.data())) {
      const month = monthNumberFromKey(k);
      if (!month || typeof v !== "string" || !v.trim()) continue;
      queueMonthField(year, month, "note", v);
    }
  }

  for (const [key, fields] of monthDocFields) {
    const [year, mm] = key.split("/");
    writes.push({ path: `calendars/${year}/months/${mm}`, data: fields, merge: true });
  }

  console.log(`Prepared ${writes.length} writes:`);
  for (const w of writes.slice(0, 20)) console.log(" ", w.path, JSON.stringify(w.data));
  if (writes.length > 20) console.log(`  … and ${writes.length - 20} more`);

  if (!APPLY) {
    console.log("\nDry run only - nothing written. Re-run with --apply to commit these.");
    return;
  }

  let batch = db.batch();
  let count = 0;
  for (const w of writes) {
    const ref = db.doc(w.path);
    batch.set(ref, { ...w.data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    count++;
    if (count % 450 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }
  await batch.commit();
  console.log(`\nDone. Wrote ${writes.length} documents under calendars/.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
