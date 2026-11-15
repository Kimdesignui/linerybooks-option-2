# LineryBooks project checks

## Excel and catalog data import

- Treat every Excel import as UTF-8 data validation work, not only a copy operation.
- After importing, scan all text fields for mojibake (ký tự bị sai bảng mã, such as `â`, `Ã`, or `Â`) and replacement characters (`�`).
- Verify Vietnamese diacritics and punctuation in titles, creator names, descriptions, categories, and notes against the source workbook before release.
- Confirm the imported row count, required fields, relationships, and the rendered text in the storefront and admin screens.
- Keep the source workbook and the normalized import output in the same encoding, and record any intentional character normalization in the migration or import log.
- A failed encoding or font check blocks deployment; repair the data at the import/database source rather than masking it with CSS.
