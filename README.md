# GTMC Login Slip Creator

Standalone manual-entry login slip tool for Greater Tomorrow Model College. This version is independent of the GTMC portal and does not require Apps Script or a backend.

## Use
1. Open `index.html` in a modern browser.
2. Unlock using the local convenience password: `sheggun2026`.
3. Paste tab-separated rows from Excel/Google Sheets. Column order: **Username | Password | Class | Student name (optional)**. CSV is also accepted; header row optional.
4. Load/replace or append. Filter by class, search, select accounts, preview and print.
5. Default print layout is A4 portrait, 4 columns × 5 rows = 20 slips per page. Portal link defaults to `https://greaterportal.vercel.app/`.

## Privacy
- Credential rows remain in browser memory only; no upload or local-storage persistence.
- The admin password is a casual lock only and is visible in source code. It is not real authentication.
- Treat printed/exported login details as sensitive and secure/destroy copies appropriately.

## Optional legacy integration files
The repository also contains earlier Apps Script integration files. They are not needed for the standalone `index.html` app.
