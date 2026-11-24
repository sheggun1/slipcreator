# GTMC SlipCreator

Parent login-slip generator for Greater Tomorrow Model College.

**Project files:** download the HTML app from the conversation and use it as the Apps Script HTML file named `SlipCreator`. This repository stores the backend integration and installation instructions.

- Live parent account and linked ward list from the existing Apps Script backend.
- Local Excel/CSV credential import by email to merge passwords.
- A4 portrait print grid: default 4 columns x 5 rows = 20 slips.
- Class filtering, search, selection, portal URL and layout settings.

## Password limitation
The portal backend stores parent passwords as salted SHA-256 hashes. They cannot be reversed to reveal original passwords. The live endpoint deliberately returns account metadata and active wards only—not passwords or hashes. Import a trusted local Excel/CSV containing `email` and `password` columns; the file is processed locally in the browser and is not uploaded.

## Install into existing GTMC Apps Script project
1. Add an HTML file named **SlipCreator** to the existing Apps Script project and paste the downloaded `SlipCreator.html` app source.
2. Add `SlipCreatorIntegration.gs` from this repo.
3. Add the route snippet from `DoGetRouteSnippet.txt` inside the existing `doGet(e)`, after `params` is defined and before the API health response.
4. Save, deploy a new version of the existing web app, and open the deployment URL with `?page=slipcreator`.
5. Log in in the app using a portal administrator account, then import the local credential workbook if passwords need printing.

The app uses `google.script.run`, so live data requires Apps Script HTML Service hosting. The standalone HTML supports local credential-file import and printing only; direct cross-origin POST is not used because browser CORS is unreliable.

## Existing backend functions used
- `login(email, password, sessionMeta)` — administrator login/session.
- `adminGetParentAccounts({}, token)` — account metadata and active parent links.
- `portalFindStudent_(className, studentId)` — resolves linked student names.
