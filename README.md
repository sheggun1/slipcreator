# GTMC Login Slip Creator

Standalone login-slip generator with a Google Apps Script + Google Sheets cloud backend for cross-device use.

## Features
- Paste data from Excel/Google Sheets (Username, Password, Class, Student name optional)
- Cloud save/load across devices signed into the authorized Google account
- A4 portrait default 4 × 5 (20 slips per page)
- Search, class filter, account selection, preview, print, CSV export
- Portal URL setting default: https://greaterportal.vercel.app/

## Deploy the cloud app (free)
1. Go to https://script.google.com/ and create a **new standalone Apps Script project** named `GTMC SlipCreator`.
2. Add a script file and paste the repository's `Code.gs` contents.
3. Add an HTML file named **Index** (without .html in the file name) and paste `Index.html`.
4. Save the project.
5. Click **Deploy → New deployment → Web app**.
6. Set **Execute as: Me** and **Who has access: Only myself**. Do not choose public access: this app stores passwords.
7. Deploy and authorize the script when Google prompts you. Keep the deployment URL private.
8. Open the deployed URL while signed into the same Google account on each device. The database spreadsheet is created on first run and stored in your Drive.
9. Paste credentials into the app, choose **Replace loaded data** or **Append rows**, then **Save to Cloud**. On another device choose **Load from Cloud**.

## Privacy and security
- The cloud spreadsheet stores the credentials in plaintext because slips must print the actual passwords. Restrict its sharing and never make it public.
- Web app access should be restricted to **Only myself**. Use devices signed into the same Google account.
- The HTML local-only version is available as `index.html`, but cross-device syncing requires the Apps Script hosted version.
- Treat printed slips and exported CSVs as confidential and dispose of unwanted copies securely.
