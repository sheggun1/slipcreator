# GTMC Login Slip Creator

Standalone login-slip manager. GitHub Pages hosts the UI; Google Apps Script + a separate Google Sheet provides cloud storage.

## Features
- Responsive desktop/mobile interface
- Password setup and unlock, password change
- Paste TSV from Excel/Google Sheets (Username, Password, Class, Student optional)
- Cloud load/save and cross-device access
- Class filter, search, select/deselect, preview and print
- QR code on every slip opens the configured portal (QR contains URL only)
- Print layout presets: A4 portrait, default 4 columns x 5 rows (20/page)
- CSV export
- Settings: portal URL, school label, print columns and rows

## Deploy the Apps Script API
1. Create a **new standalone** Apps Script project at https://script.google.com/ (do not reuse GTMC portal project).
2. Paste the repository's current `Code.gs` into the script editor and save.
3. Deploy > New deployment > Web app.
4. Execute as: **Me**.
5. Who has access: **Anyone** (the GitHub-hosted website is external and cannot use an owner-only web app). Deploy and authorize Google permissions.
6. Copy the `/exec` web app URL. Open it in a browser; it should return JSON with `service: SlipCreator API` and version.
7. The spreadsheet `GTMC SlipCreator Cloud Data` is created automatically the first time a database action is used.

## Deploy GitHub Pages
1. In GitHub repo Settings > Pages, choose Deploy from a branch.
2. Select branch `main`, folder `/ (root)`, save.
3. Wait for the Pages URL. Open it and enter the Apps Script URL into the connect dialog.
4. On first run, create a strong unique app password (at least 10 characters). On subsequent use, unlock with it.
5. Paste credential rows, replace/append, select/filter, print. Save to cloud to sync to another device.
6. Use the app-password section to change the password.

## Security limitations / important
- The Google Sheet contains student credentials in plaintext, so keep its sharing private.
- The Apps Script Web App must be publicly reachable for the external GitHub frontend. API operations check the app password, but the password is transmitted in JSONP request URLs, which may appear in browser history, network logs, or endpoint logs. Do not use a password you use elsewhere, and do not share browser history or deployment URL.
- This architecture is suitable for private pilot use, not a high-security production system. A safer production design should use authenticated POST requests through a backend/proxy with appropriate access control, rate limiting, and audit logs.
- The API payload is URL encoded and may hit URL length limits with large datasets; split records or keep each save under the backend's 800-row limit and reasonably sized credentials.
- QR image generation uses an external QR service, so printing QR codes requires internet access. QR codes contain only the portal URL, not the username/password.
- Keep your app password private; setup can only be done once after the first password is configured.

## Files
- `index.html`: GitHub Pages frontend
- `Code.gs`: Apps Script backend API
- `Index.html`: legacy Apps Script-hosted UI; no longer required by API deployment
