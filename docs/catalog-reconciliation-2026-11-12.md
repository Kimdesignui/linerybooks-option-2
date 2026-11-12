# Catalog reconciliation — 2026-11-12

## Source and matching

- Book source: `C:/Users/kimtieuke/AppData/Local/Temp/linery-books-source.xlsx`.
- Creator source: `C:/Users/kimtieuke/AppData/Local/Temp/linery-authors-source.xlsx`.
- Books were matched by normalized 13-digit ISBN. All 227 source ISBNs matched a row in `public.books`.
- Creator names were matched with punctuation, spacing, case, and Vietnamese-diacritic normalization.

## Database result

- `public.books`: 227 records checked.
- Books with at least one category relation: **227/227**.
- Books with at least one taxonomy relation: **227/227**.
- Books with at least one creator relation: **227/227**.
- Publisher relation: **227/227**.
- English-language relation: **227/227**.
- Category terms now include the standard Fiction / Non-fiction hierarchy: Novels, Short stories, Poetry & Drama, Essays, Research & Studies, and Memoir & Biography.
- Creator book links: **248**; creator roles: **190 author records**.

## Corrections applied

- Added the missing category hierarchy under Fiction and Non-fiction.
- Added category roots/children for the previously unclassified Penguin UK records and the remaining four records without a category root.
- Added deterministic publisher, imprint/line, and language relations from the source workbook.
- Split five source rows that had multiple creators stored as one creator name. Their books now link to the individual creator records.
- Added missing individual creator records for contributors that appeared in the source book credits but were absent from the creator table, then linked them to their books.
- Marked the five aggregate duplicate creator records inactive instead of deleting them, preserving a recovery path.
- Added the `author` role to active creators linked to catalog books.

## Deliberate limitation

The source workbooks do not provide translator or illustrator fields for these book rows. No translator/illustrator role was invented; those roles should be added only when the editorial source supplies them.

## Frontend verification

- The Books filter exposes the new category hierarchy.
- Selecting `Novels` returned matching catalog cards from the live Supabase-backed frontend.
- The final database audit reports zero books without category, taxonomy, or creator relations.
