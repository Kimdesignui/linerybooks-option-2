-- Repair titles that were saved after an en dash was decoded as mojibake.
-- The update is keyed by slug so it is safe to run more than once.
update public.books
set title = 'Jeb and Dash A Diary of Gay Life, 1918–1945'
where slug = 'jeb-and-dash-a-diary-of-gay-life-1918-1945'
  and title = 'Jeb and Dash A Diary of Gay Life, 1918â1945';

update public.books
set title = 'The Selected Works of Edward W. Said, 1966 – 2006'
where slug = 'the-selected-works-of-edward-w-said-1966-2006'
  and title = 'The Selected Works of Edward W. Said, 1966 â 2006';
