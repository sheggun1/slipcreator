# GTMC SlipCreator

Parent login-slip generator for the Greater Tomorrow Model College portal.

- Live parent account and linked ward list via the existing GTMC Apps Script API (Apps Script HTML Service).
- Local credential-file import by email to fill passwords (passwords are not returned by the backend).
- A4 portrait print grid: default 4 columns x 5 rows = 20 slips.
- Class filtering, search, selection, portal URL and layout settings.

## Password limitation
The current backend stores parent passwords as salted hashes. These are irreversible. The live endpoint deliberately does not return passwords or hashes. Import a trusted local spreadsheet/CSV containing `email` and `password` columns; processing stays in the browser.

## Installation
Follow the install instructions in this repository's README. Add `SlipCreator.html` and `SlipCreatorIntegration.gs` to the existing Apps Script project, and add the `page=slipcreator` route in the existing `doGet(e)`. Deploy a new version and open the deployment URL with `?page=slipcreator`.

The HTML uses `google.script.run`, so live data requires Apps Script HTML Service hosting; standalone local HTML supports credential import/print only.
