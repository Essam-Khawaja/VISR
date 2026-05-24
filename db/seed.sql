-- =============================================================
-- Pathwise / StraighterNoodles - Showcase Seed
-- -------------------------------------------------------------
-- Safe to run on an EMPTY database or a populated one.
-- Wipes app data tables (TRUNCATE ... CASCADE) and repopulates
-- with a demo-ready, feature-complete dataset:
--   * Past dummy   : May 16 - May 23
--   * Today        : May 24 (packed showcase day - all warnings fire)
--   * Showcase week: May 25 - May 29 (every feature lit up)
--   * Future dummy : May 30 - Jun 12 (two weeks)
--
-- Demonstrates every shipped feature:
--   - Categories (incl. custom + personal_time)
--   - Auto-transit blocks
--   - One-time event-specific items
--   - Manual checklist items per day
--   - Clickable links in notes
--   - Note status (unresolved / follow_up / important / completed)
--   - Routines with ends_on (forward-only delete)
--   - Personal time blocks (weekday recurring + specific date)
--   - Calgary late-transit cases
--   - Long-stretch lunch warning
--   - Custom categories with their own packing defaults
--
-- Does NOT touch user_settings (preserves city/timezone).
-- =============================================================

begin;

-- 0. Defensive: drop legacy CHECK constraints if any DB still has them.
alter table events drop constraint if exists events_category_check;
alter table category_default_items drop constraint if exists category_default_items_category_check;

-- 1. Wipe (cascade clears child tables)
truncate table
  event_items,
  category_default_items,
  events,
  items,
  saved_locations,
  routines,
  manual_checklist_items,
  custom_categories,
  personal_time_blocks
restart identity cascade;

-- =============================================================
-- 2. Saved locations
-- =============================================================
insert into saved_locations (name, address, location_type, transit_minutes) values
  ('University of Calgary',     '2500 University Dr NW, Calgary',  'university', 30),
  ('T&T Supermarket',           '180 94 Ave SE, Calgary',          'grocery',    25),
  ('Goodlife Fitness Downtown', '4th Ave SW, Calgary',             'gym',        15),
  ('Local Coffee Shop',         'Bridgeland Riverside, Calgary',   'other',      10),
  ('Home',                       null,                              'home',       0);

-- =============================================================
-- 3. Items (packing master list)
-- =============================================================
insert into items (name) values
  ('Laptop'),
  ('iPad'),
  ('Notebook'),
  ('Charger'),
  ('Water bottle'),
  ('Gym clothes'),
  ('Protein powder'),
  ('Grocery bag'),
  ('Headphones'),
  ('Wallet'),
  ('Student ID'),
  ('Pen'),
  ('Printed assignment'),
  ('Calculator'),
  ('Arduino kit'),
  ('USB drive'),
  ('Hand sanitizer'),
  ('Printed resumes'),
  ('Reusable tote'),
  ('Volunteer vest'),
  ('Name tag'),
  ('Clipboard'),
  ('Yoga mat'),
  ('Umbrella'),
  ('Sunscreen');

-- =============================================================
-- 4. Custom categories (showcase user-added category)
-- =============================================================
insert into custom_categories (name, label) values
  ('volunteering', 'Volunteering');

-- =============================================================
-- 5. Category defaults (Before-You-Leave per category, including
--    a custom category with its own defaults).
-- =============================================================
insert into category_default_items (category, item_id)
  select 'class', id from items where name in
    ('iPad', 'Notebook', 'Charger', 'Student ID', 'Pen')
  union all
  select 'meeting', id from items where name in
    ('Laptop', 'Notebook')
  union all
  select 'gym', id from items where name in
    ('Gym clothes', 'Water bottle', 'Protein powder')
  union all
  select 'grocery', id from items where name in
    ('Grocery bag', 'Wallet', 'Reusable tote')
  union all
  select 'assignment', id from items where name in
    ('Laptop', 'Charger', 'Calculator')
  union all
  select 'project', id from items where name in
    ('Laptop', 'Charger')
  union all
  select 'club', id from items where name in
    ('Laptop', 'Notebook')
  union all
  select 'volunteering', id from items where name in
    ('Volunteer vest', 'Name tag', 'Clipboard');

-- =============================================================
-- 6. Personal time blocks
--   - Weekly recurring (weekday-based)
--   - Specific-date blocks across showcase week
-- =============================================================
insert into personal_time_blocks
  (label, weekday, specific_date, start_time, end_time, active) values
  ('Family dinner',      0,    null,         '18:00', '20:00', true),  -- Sundays
  ('Personal reading',   6,    null,         '17:00', '18:00', true),  -- Saturdays
  ('Phone-free hour',    3,    null,         '19:00', '20:00', true),  -- Wednesdays
  ('Morning meditation', 1,    null,         '06:30', '07:00', true),  -- Mondays
  ('Yoga focus block',   null, '2026-05-24', '08:00', '09:00', true),
  ('Evening wind-down',  null, '2026-05-25', '21:30', '23:00', true),
  ('Self-care block',    null, '2026-05-27', '16:00', '17:00', true),
  ('Pre-midterm rest',   null, '2026-05-28', '20:00', '21:00', true),
  ('Post-midterm break', null, '2026-05-29', '13:30', '15:00', true);

-- =============================================================
-- 7. Routines
--   - Daily yoga ends_on May 26 (forward-only delete showcase)
--   - Mix of daily / weekly / every_n_days
-- =============================================================
insert into routines
  (title, category, frequency, interval_days, preferred_time, next_due, ends_on, active) values
  ('Yoga & stretch',            'personal', 'daily',         1, '07:00',  now(),                       '2026-05-26', true),
  ('Drink 8 glasses of water',  'personal', 'daily',         1, null,     now(),                       null,         true),
  ('Journal entry',             'personal', 'daily',         1, '22:00',  now(),                       null,         true),
  ('Call family',               'social',   'weekly',        7, '20:00',  now(),                       null,         true),
  ('Water the plants',          'personal', 'every_n_days',  3, null,     now(),                       null,         true),
  ('Take out trash',            'personal', 'weekly',        7, null,     now() + interval '1 day',    null,         true),
  ('Meal prep for the week',    'personal', 'weekly',        7, '18:00',  now() + interval '1 day',    null,         true),
  ('Laundry',                   'personal', 'weekly',        7, null,     now() + interval '6 days',   null,         true),
  ('Haircut',                   'personal', 'every_n_days', 21, null,     now() + interval '14 days',  null,         true),
  ('Vitamins',                  'personal', 'daily',         1, '08:00',  now(),                       null,         true);

-- =============================================================
-- 8. Events
-- =============================================================

-- -------------------------------------------------------------
-- PAST DUMMY WEEK: May 16 - May 22
-- -------------------------------------------------------------
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values

  -- Sat May 16
  ('Sleep in',                    null,                              'personal',   '2026-05-16 09:00-06', '2026-05-16 10:30-06', 'Home',              null,                                                                false, null, null, true),
  ('Brunch with friends',         'Cliffhanger Bistro',              'social',     '2026-05-16 12:00-06', '2026-05-16 13:30-06', 'Bridgeland',        null,                                                                false, 'Reservation: opentable.com/cliffhanger', 'completed', true),
  ('Park walk',                   null,                              'personal',   '2026-05-16 15:00-06', '2026-05-16 16:00-06', 'Prince''s Island',  null,                                                                false, null, null, true),

  -- Sun May 17 (family dinner block kicks in 18:00-20:00 automatically)
  ('Reading day',                 'Catch up on assigned readings',   'assignment', '2026-05-17 11:00-06', '2026-05-17 14:00-06', 'Home',              null,                                                                false, null, null, true),
  ('Grocery prep',                null,                              'grocery',    '2026-05-17 16:00-06', '2026-05-17 17:00-06', null,                (select id from saved_locations where name='T&T Supermarket'),         false, null, null, true),

  -- Mon May 18
  ('Data Structures Lecture',     null,                              'class',      '2026-05-18 09:00-06', '2026-05-18 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, true),
  ('Linear Algebra Lecture',      null,                              'class',      '2026-05-18 10:30-06', '2026-05-18 11:45-06', 'MS 211',            (select id from saved_locations where name='University of Calgary'),  false, null, null, true),
  ('Club exec meeting',           null,                              'club',       '2026-05-18 15:30-06', '2026-05-18 16:30-06', 'TFDL 5th floor',    (select id from saved_locations where name='University of Calgary'),  false, 'Sponsorship lead intro: linkedin.com/in/example', 'follow_up', true),
  ('Gym session',                 'Pull day',                        'gym',        '2026-05-18 17:30-06', '2026-05-18 18:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true, null, null, true),

  -- Tue May 19
  ('Group project sync',          'Zoom call',                       'meeting',    '2026-05-19 13:00-06', '2026-05-19 14:00-06', 'Zoom',              null,                                                                false, 'Join: https://zoom.us/j/9876543210', 'completed', true),
  ('Study session',               'Calc prep',                       'assignment', '2026-05-19 15:00-06', '2026-05-19 18:00-06', 'TFDL',              (select id from saved_locations where name='University of Calgary'),  true,  null, null, true),

  -- Wed May 20
  ('Data Structures Lecture',     null,                              'class',      '2026-05-20 09:00-06', '2026-05-20 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, true),
  ('Doctor appointment',          null,                              'personal',   '2026-05-20 14:00-06', '2026-05-20 15:00-06', 'Downtown clinic',   null,                                                                false, 'Refill prescription, pick up Friday', 'completed', true),
  ('Dinner with parents',         null,                              'social',     '2026-05-20 18:30-06', '2026-05-20 20:00-06', 'Home',              null,                                                                false, null, null, true),

  -- Thu May 21
  ('Big assignment submission',   'COMP 311 - finally done!',        'assignment', '2026-05-21 09:00-06', '2026-05-21 13:00-06', 'TFDL',              (select id from saved_locations where name='University of Calgary'),  true,  'Submitted via d2l.ucalgary.ca', 'completed', true),
  ('Volunteer shift',             'Drop-In Centre kitchen',          'volunteering','2026-05-21 14:30-06', '2026-05-21 16:30-06', 'Drop-In Centre',   null,                                                                false, null, null, true),
  ('Grocery run',                 null,                              'grocery',    '2026-05-21 17:00-06', '2026-05-21 18:00-06', null,                (select id from saved_locations where name='T&T Supermarket'),         false, null, null, true),

  -- Fri May 22
  ('Lab catch-up',                'Lighter session post-submission', 'class',      '2026-05-22 13:00-06', '2026-05-22 15:00-06', 'ICT 122',           (select id from saved_locations where name='University of Calgary'),  true,  null, null, true),
  ('Movie night with roommates',  'Dune Part 3',                     'social',     '2026-05-22 20:00-06', '2026-05-22 22:30-06', 'Home',              null,                                                                false, 'Trailer: youtube.com/watch?v=demo', 'completed', true);

-- -------------------------------------------------------------
-- PAST: Sat May 23 (previous day events)
-- -------------------------------------------------------------
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values

  -- Already happened today
  ('Morning yoga',                'Slow flow',                       'personal',   '2026-05-23 07:00-06', '2026-05-23 07:30-06', 'Living room',       null,                                                                false, null, null, true),
  ('Breakfast & coffee',          null,                              'personal',   '2026-05-23 08:00-06', '2026-05-23 08:45-06', 'Home',              null,                                                                false, null, null, true),

  -- Long-stretch lunch warning showcase
  ('Marathon study at TFDL',      'Cramming for next week midterm',  'assignment', '2026-05-23 10:00-06', '2026-05-23 15:30-06', 'TFDL group room 4', (select id from saved_locations where name='University of Calgary'),  true,  'Hash tables question is tricky - ask TA on Monday: stackoverflow.com/q/12345', 'follow_up', false),

  -- Custom-category event
  ('Soup kitchen shift',          'First-timer orientation included','volunteering','2026-05-23 15:45-06', '2026-05-23 16:45-06', 'Drop-In Centre',   null,                                                                false, null, null, false),

  -- Upcoming
  ('Coffee with Priya',           'Catch up + career chat',          'social',     '2026-05-23 17:00-06', '2026-05-23 18:00-06', null,                (select id from saved_locations where name='Local Coffee Shop'),       true,  'Priya is hiring summer interns - send her my resume by Wed. Her site: priya.dev', 'important', false),
  ('Gym session',                 'Push day',                        'gym',        '2026-05-23 18:30-06', '2026-05-23 19:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true, null, null, false),
  ('Grocery run',                 null,                              'grocery',    '2026-05-23 19:45-06', '2026-05-23 20:45-06', null,                (select id from saved_locations where name='T&T Supermarket'),         false, 'Need produce, eggs, rice, tofu', 'unresolved', false),

  -- Home event - should NOT pull items into Before-You-Leave
  ('Hackathon prep coding',       'Pathwise polish',                 'project',    '2026-05-23 21:00-06', '2026-05-23 22:00-06', 'Home desk',         null,                                                                false, null, null, false),

  -- Calgary late-transit warning (ends 23:55)
  ('Late debug session',          'Engineering building 24h',        'project',    '2026-05-23 22:30-06', '2026-05-23 23:55-06', 'ENF 145',           (select id from saved_locations where name='University of Calgary'),  true,  null, null, false);

-- Auto-transit blocks for May 23
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Transit to University of Calgary', 'auto-transit for Marathon study at TFDL', 'transit', '2026-05-23 09:30-06', '2026-05-23 10:00-06', 'University of Calgary',     null, false, null, null, true),
  ('Transit from University of Calgary','auto-transit for Marathon study at TFDL','transit', '2026-05-23 15:30-06', '2026-05-23 15:50-06', 'University of Calgary',     null, false, null, null, true),
  ('Transit to Local Coffee Shop',     'auto-transit for Coffee with Priya',      'transit', '2026-05-23 16:50-06', '2026-05-23 17:00-06', 'Local Coffee Shop',         null, false, null, null, false),
  ('Transit to Goodlife Fitness',      'auto-transit for Gym session',            'transit', '2026-05-23 18:15-06', '2026-05-23 18:30-06', 'Goodlife Fitness Downtown', null, false, null, null, false),
  ('Transit to University of Calgary', 'auto-transit for Late debug session',     'transit', '2026-05-23 22:00-06', '2026-05-23 22:30-06', 'University of Calgary',     null, false, null, null, false);

-- -------------------------------------------------------------
-- TODAY: Sun May 24 (packed day - every warning fires)
-- Demonstrates: transit warning, long stretch / no lunch break,
--   big commitment overlap, late-night transit, custom category,
--   important note, follow-up note, weather item (sunscreen)
-- Personal time block: Yoga focus block 08:00-09:00 (already seeded)
-- Family dinner phantom: 18:00-20:00 (already seeded via weekday=0)
-- -------------------------------------------------------------
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values

  -- Already happened
  ('Morning yoga',                'Slow flow',                       'personal',   '2026-05-24 07:00-06', '2026-05-24 07:30-06', 'Living room',       null,                                                                false, null, null, true),
  ('Breakfast',                   null,                              'personal',   '2026-05-24 07:45-06', '2026-05-24 08:15-06', 'Home',              null,                                                                false, null, null, true),

  -- Long stretch with no real lunch gap (triggers pack-lunch warning)
  ('Data Structures Lecture',     'AVL Trees + exam review',         'class',      '2026-05-24 09:00-06', '2026-05-24 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Linear Algebra Lecture',      'Eigenvalues + midterm Q&A',       'class',      '2026-05-24 10:30-06', '2026-05-24 11:45-06', 'MS 211',            (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  -- No lunch break - straight into lab (triggers long-stretch warning)
  ('Data Structures Lab',         'Implement red-black tree',        'class',      '2026-05-24 12:00-06', '2026-05-24 14:00-06', 'ICT 122',           (select id from saved_locations where name='University of Calgary'),  false, 'Submit on D2L by end of lab: d2l.ucalgary.ca', 'unresolved', false),
  ('Club exec meeting',           'Sponsorship budget review',       'club',       '2026-05-24 14:15-06', '2026-05-24 15:15-06', 'TFDL 5th floor',    (select id from saved_locations where name='University of Calgary'),  false, 'Bring lab equipment proposal. Doc: docs.google.com/d/abc', 'important', false),

  -- Volunteer shift - custom category, no break since morning
  ('Volunteer shift at library',  'Reading hour for kids',           'volunteering','2026-05-24 15:30-06', '2026-05-24 17:00-06', 'Memorial Park Library', null,                                                            false, 'Book list: calgarylibrary.ca/childrens', 'follow_up', false),

  -- Grocery run right before family dinner phantom kicks in
  ('Grocery run',                 'Restock for the week - pick up pack lunch supplies', 'grocery', '2026-05-24 17:15-06', '2026-05-24 18:15-06', null, (select id from saved_locations where name='T&T Supermarket'),         false, 'Need produce, eggs, rice, tofu. No break today so grab something for tomorrow too', 'unresolved', false),

  -- Late-night study session - triggers Calgary late-transit warning
  ('Hackathon prep coding',       'Pathwise demo polish - crunch night', 'project', '2026-05-24 21:00-06', '2026-05-24 23:00-06', 'ENF 145',          (select id from saved_locations where name='University of Calgary'),  true,  'Slides: docs.google.com/d/hackathon-slides', 'important', false);

-- Transit blocks May 24
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Transit to University of Calgary', 'auto-transit for Data Structures Lecture', 'transit', '2026-05-24 08:30-06', '2026-05-24 09:00-06', 'University of Calgary', null, false, null, null, false),
  ('Transit to Memorial Park Library', 'auto-transit for Volunteer shift',         'transit', '2026-05-24 15:10-06', '2026-05-24 15:30-06', 'Memorial Park Library', null, false, null, null, false),
  ('Transit from Memorial Park Library','auto-transit for Volunteer shift',        'transit', '2026-05-24 17:00-06', '2026-05-24 17:20-06', 'Memorial Park Library', null, false, null, null, false),
  ('Transit to University of Calgary', 'auto-transit for Hackathon prep coding',   'transit', '2026-05-24 20:30-06', '2026-05-24 21:00-06', 'University of Calgary', null, false, null, null, false),
  ('Transit from University of Calgary','auto-transit for Hackathon prep coding',  'transit', '2026-05-24 23:00-06', '2026-05-24 23:30-06', 'University of Calgary', null, false, null, null, false);

-- -------------------------------------------------------------
-- SHOWCASE: Mon May 25 (busy school day)
-- -------------------------------------------------------------
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Data Structures Lecture',     'AVL Trees',                       'class',      '2026-05-25 09:00-06', '2026-05-25 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Linear Algebra Lecture',      'Eigenvalues',                     'class',      '2026-05-25 10:30-06', '2026-05-25 11:45-06', 'MS 211',            (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Lunch break',                 null,                              'break',      '2026-05-25 12:00-06', '2026-05-25 13:00-06', 'MacHall',           null,                                                                false, null, null, false),
  ('Data Structures Lab',         'Implement AVL rotations',         'class',      '2026-05-25 13:00-06', '2026-05-25 15:00-06', 'ICT 122',           (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Club exec meeting',           null,                              'club',       '2026-05-25 15:30-06', '2026-05-25 16:30-06', 'TFDL 5th floor',    (select id from saved_locations where name='University of Calgary'),  false, 'Bring lab equipment proposal. Doc: docs.google.com/d/abc', 'important', false),
  ('Gym session',                 'Pull day',                        'gym',        '2026-05-25 17:30-06', '2026-05-25 18:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true,  null, null, false),
  ('Quick dinner',                null,                              'break',      '2026-05-25 19:00-06', '2026-05-25 19:45-06', 'Home',              null,                                                                false, null, null, false),
  ('Study session at TFDL',       'Midterm prep',                    'assignment', '2026-05-25 20:30-06', '2026-05-25 21:30-06', 'TFDL',              (select id from saved_locations where name='University of Calgary'),  true,  null, null, false);

-- -------------------------------------------------------------
-- SHOWCASE: Tue May 26 (mentor + project)
-- -------------------------------------------------------------
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Morning run',                 null,                              'gym',        '2026-05-26 08:00-06', '2026-05-26 08:45-06', 'Park',              null,                                                                false, null, null, false),
  ('Software Engineering Lecture','Design patterns',                 'class',      '2026-05-26 10:00-06', '2026-05-26 12:00-06', 'ICT 121',           (select id from saved_locations where name='University of Calgary'),  true,  'Reading list: refactoring.guru/design-patterns', null, false),
  ('Office hours with Prof. Reid',null,                              'meeting',    '2026-05-26 13:00-06', '2026-05-26 14:00-06', 'MS 678',            (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Coffee with mentor',          'Career chat',                     'social',     '2026-05-26 14:30-06', '2026-05-26 15:30-06', null,                (select id from saved_locations where name='Local Coffee Shop'),       true,  'Bring portfolio: github.com/ahmad', 'important', false),
  ('Project work',                null,                              'project',    '2026-05-26 16:00-06', '2026-05-26 18:00-06', 'Home',              null,                                                                false, null, null, false),
  ('Movie night',                 'with roommates',                  'social',     '2026-05-26 20:00-06', '2026-05-26 22:00-06', 'Home',              null,                                                                false, null, null, false);

-- -------------------------------------------------------------
-- SHOWCASE: Wed May 27 (Career Fair + rain demo)
-- -------------------------------------------------------------
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Data Structures Lecture',     null,                              'class',      '2026-05-27 09:00-06', '2026-05-27 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Linear Algebra Lecture',      null,                              'class',      '2026-05-27 10:30-06', '2026-05-27 11:45-06', 'MS 211',            (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Career Fair',                 'Engineering career fair',         'club',       '2026-05-27 12:30-06', '2026-05-27 14:30-06', 'MacHall Ballroom',  (select id from saved_locations where name='University of Calgary'),  false, 'Bring printed resumes. Companies: careerfair.ucalgary.ca', 'important', false),
  ('Tutoring session',            '1st year math tutoring',          'club',       '2026-05-27 17:30-06', '2026-05-27 18:30-06', 'TFDL group study',  (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Gym session',                 'Legs',                            'gym',        '2026-05-27 19:00-06', '2026-05-27 20:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true,  null, null, false);

-- -------------------------------------------------------------
-- SHOWCASE: Thu May 28 (heavy day, midterm prep)
-- -------------------------------------------------------------
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Calculus midterm prep',       'Review past papers',              'assignment', '2026-05-28 09:30-06', '2026-05-28 11:00-06', 'TFDL',              (select id from saved_locations where name='University of Calgary'),  true,  'Past midterms: math.ucalgary.ca/archive', 'unresolved', false),
  ('Therapist appointment',       null,                              'personal',   '2026-05-28 11:30-06', '2026-05-28 12:30-06', 'Downtown',          null,                                                                false, null, null, false),
  ('Hackathon team sync',         'Pathwise demo prep',              'club',       '2026-05-28 13:00-06', '2026-05-28 14:30-06', 'Discord',           null,                                                                false, 'Join: discord.gg/pathwise', null, false),
  ('Lab make-up',                 'Missed lab from last week',       'class',      '2026-05-28 15:00-06', '2026-05-28 17:00-06', 'ICT 122',           (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Grocery run',                 null,                              'grocery',    '2026-05-28 17:30-06', '2026-05-28 18:30-06', null,                (select id from saved_locations where name='T&T Supermarket'),         false, null, null, false),
  ('Career Fair follow-up',       'Connecting with recruiters',      'meeting',    '2026-05-28 18:45-06', '2026-05-28 19:45-06', 'Zoom',              null,                                                                false, 'Zoom link: zoom.us/j/1112223334', 'follow_up', false),
  ('Hackathon prep coding',       'Polish demo flow',                'project',    '2026-05-28 21:30-06', '2026-05-28 23:30-06', 'Home',              null,                                                                false, null, null, false);

-- -------------------------------------------------------------
-- SHOWCASE: Fri May 29 (midterm + hackathon kickoff)
-- -------------------------------------------------------------
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Calculus Midterm',            'Ch. 1-6, bring calculator & ID',  'assignment', '2026-05-29 09:00-06', '2026-05-29 11:00-06', 'ENA 101',           (select id from saved_locations where name='University of Calgary'),  true,  'Worth 25% of final grade. Formula sheet: math.ucalgary.ca/formulas', 'important', false),
  ('Lunch with team',             'Decompress after midterm',        'social',     '2026-05-29 12:00-06', '2026-05-29 13:00-06', 'MacHall',           null,                                                                false, null, null, false),
  ('Hackathon kickoff',           'Opening ceremony + team intro',   'club',       '2026-05-29 15:30-06', '2026-05-29 17:30-06', 'TFDL',              (select id from saved_locations where name='University of Calgary'),  false, 'Schedule: hackcalgary.ca/2026', 'important', false),
  ('Hackathon hacking',           'Build all night',                 'project',    '2026-05-29 18:00-06', '2026-05-29 23:55-06', 'Engineering Building', (select id from saved_locations where name='University of Calgary'), true, null, null, false);

-- -------------------------------------------------------------
-- FUTURE DUMMY: Sat May 30 - Sat Jun 12 (two weeks)
-- -------------------------------------------------------------
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values

  -- Sat May 30 (Hackathon Day 2)
  ('Hackathon Day 2',             'Continued hacking',               'project',    '2026-05-30 10:00-06', '2026-05-30 18:00-06', 'Engineering Building', (select id from saved_locations where name='University of Calgary'), true, null, null, false),
  ('Demo night',                  'Final presentations',             'project',    '2026-05-30 19:00-06', '2026-05-30 21:00-06', 'Engineering Building', (select id from saved_locations where name='University of Calgary'), false, 'Submit by 6pm: hackcalgary.ca/submit', 'important', false),

  -- Sun May 31
  ('Recovery sleep-in',           null,                              'personal',   '2026-05-31 10:00-06', '2026-05-31 11:30-06', 'Home',              null,                                                                false, null, null, false),
  ('Family brunch',               null,                              'social',     '2026-05-31 12:30-06', '2026-05-31 14:00-06', 'Bridgeland Bistro', null,                                                                false, null, null, false),
  ('Laundry',                     null,                              'personal',   '2026-05-31 15:00-06', '2026-05-31 17:00-06', 'Home',              null,                                                                false, null, null, false),

  -- Mon Jun 1
  ('Data Structures Lecture',     'Graphs intro',                    'class',      '2026-06-01 09:00-06', '2026-06-01 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Linear Algebra Lecture',      null,                              'class',      '2026-06-01 10:30-06', '2026-06-01 11:45-06', 'MS 211',            (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Lab session',                 'Graph traversal',                 'class',      '2026-06-01 13:00-06', '2026-06-01 15:00-06', 'ICT 122',           (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Gym session',                 null,                              'gym',        '2026-06-01 17:30-06', '2026-06-01 18:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true,  null, null, false),

  -- Tue Jun 2
  ('Software Engineering Lecture','Testing strategies',              'class',      '2026-06-02 10:00-06', '2026-06-02 12:00-06', 'ICT 121',           (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Project sync',                'Discord call',                    'meeting',    '2026-06-02 14:00-06', '2026-06-02 15:00-06', 'Discord',           null,                                                                false, 'Join: discord.gg/pathwise', null, false),
  ('Volunteer shift',             'Soup kitchen',                    'volunteering','2026-06-02 17:30-06', '2026-06-02 19:30-06', 'Drop-In Centre',   null,                                                                false, null, null, false),

  -- Wed Jun 3
  ('Career fair interview',       'Acme Co - first round',           'meeting',    '2026-06-03 11:00-06', '2026-06-03 12:00-06', 'Zoom',              null,                                                                false, 'Zoom: zoom.us/j/55512341234', 'important', false),
  ('Data Structures Lecture',     null,                              'class',      '2026-06-03 14:00-06', '2026-06-03 15:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Grocery run',                 null,                              'grocery',    '2026-06-03 18:00-06', '2026-06-03 19:00-06', null,                (select id from saved_locations where name='T&T Supermarket'),         false, null, null, false),

  -- Thu Jun 4
  ('Lab session',                 null,                              'class',      '2026-06-04 13:00-06', '2026-06-04 15:00-06', 'ICT 122',           (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Mentor coffee',               'Quick chat',                      'social',     '2026-06-04 16:00-06', '2026-06-04 17:00-06', null,                (select id from saved_locations where name='Local Coffee Shop'),       true,  null, null, false),
  ('Gym session',                 null,                              'gym',        '2026-06-04 17:30-06', '2026-06-04 18:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true,  null, null, false),

  -- Fri Jun 5
  ('Project deadline submission', 'Final hackathon submission',      'assignment', '2026-06-05 09:00-06', '2026-06-05 12:00-06', 'Engineering Building', (select id from saved_locations where name='University of Calgary'), true, 'Submit: hackcalgary.ca/final', 'important', false),
  ('Celebration dinner',          'With the team',                   'social',     '2026-06-05 19:00-06', '2026-06-05 21:00-06', 'Downtown',          null,                                                                false, null, null, false),

  -- Sat Jun 6
  ('Saturday morning yoga',       null,                              'gym',        '2026-06-06 08:00-06', '2026-06-06 09:00-06', 'Yoga studio',       null,                                                                false, null, null, false),
  ('Hackathon afterparty',        null,                              'social',     '2026-06-06 19:00-06', '2026-06-06 22:00-06', 'Downtown',          null,                                                                false, 'RSVP: hackcalgary.ca/afterparty', null, false),

  -- Sun Jun 7
  ('Lazy Sunday',                 null,                              'personal',   '2026-06-07 11:00-06', '2026-06-07 13:00-06', 'Home',              null,                                                                false, null, null, false),
  ('Plan next week',              null,                              'personal',   '2026-06-07 16:00-06', '2026-06-07 16:30-06', 'Home',              null,                                                                false, null, null, false),

  -- Mon Jun 8
  ('Data Structures Lecture',     'Dynamic programming',             'class',      '2026-06-08 09:00-06', '2026-06-08 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Linear Algebra Lecture',      null,                              'class',      '2026-06-08 10:30-06', '2026-06-08 11:45-06', 'MS 211',            (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Club exec meeting',           null,                              'club',       '2026-06-08 15:30-06', '2026-06-08 16:30-06', 'TFDL 5th floor',    (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Gym session',                 null,                              'gym',        '2026-06-08 17:30-06', '2026-06-08 18:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true,  null, null, false),

  -- Tue Jun 9
  ('Software Engineering Lecture',null,                              'class',      '2026-06-09 10:00-06', '2026-06-09 12:00-06', 'ICT 121',           (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Acme final interview',        'Onsite-style',                    'meeting',    '2026-06-09 13:30-06', '2026-06-09 15:30-06', 'Zoom',              null,                                                                false, 'Final round - prep system design. Brief: acme.com/interview', 'important', false),
  ('Grocery run',                 null,                              'grocery',    '2026-06-09 17:30-06', '2026-06-09 18:30-06', null,                (select id from saved_locations where name='T&T Supermarket'),         false, null, null, false),

  -- Wed Jun 10
  ('Data Structures Lecture',     null,                              'class',      '2026-06-10 09:00-06', '2026-06-10 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Linear Algebra Lecture',      null,                              'class',      '2026-06-10 10:30-06', '2026-06-10 11:45-06', 'MS 211',            (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Volunteer shift',             'Reading hour',                    'volunteering','2026-06-10 16:00-06', '2026-06-10 17:30-06', 'Memorial Park Library', null,                                                            false, null, null, false),

  -- Thu Jun 11
  ('Office hours',                'Math support',                    'meeting',    '2026-06-11 14:00-06', '2026-06-11 15:00-06', 'MS 678',            (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Gym session',                 null,                              'gym',        '2026-06-11 17:30-06', '2026-06-11 18:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true,  null, null, false),
  ('Movie night',                 null,                              'social',     '2026-06-11 20:00-06', '2026-06-11 22:00-06', 'Home',              null,                                                                false, null, null, false),

  -- Fri Jun 12
  ('Assignment 5 due',            'Algorithms - submit on D2L',      'assignment', '2026-06-12 09:00-06', '2026-06-12 11:00-06', 'TFDL',              (select id from saved_locations where name='University of Calgary'),  true,  'Submit: d2l.ucalgary.ca/d2l/lms/dropbox', 'unresolved', false),
  ('Weekend prep grocery',        null,                              'grocery',    '2026-06-12 17:00-06', '2026-06-12 18:00-06', null,                (select id from saved_locations where name='T&T Supermarket'),         false, null, null, false),
  ('Game night',                  'with roommates',                  'social',     '2026-06-12 20:00-06', '2026-06-12 23:00-06', 'Home',              null,                                                                false, null, null, false);

-- =============================================================
-- 9. One-time event-specific items
-- =============================================================
insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Marathon study at TFDL'
    and e.start_time::date = date '2026-05-23'
    and i.name in ('Printed assignment', 'Calculator');

insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Soup kitchen shift'
    and e.start_time::date = date '2026-05-23'
    and i.name in ('Volunteer vest', 'Name tag');

insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Volunteer shift at library'
    and e.start_time::date = date '2026-05-24'
    and i.name in ('Name tag', 'Clipboard');

insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Long run at the park'
    and e.start_time::date = date '2026-05-24'
    and i.name in ('Sunscreen');

insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Data Structures Lab'
    and e.start_time::date = date '2026-05-24'
    and i.name in ('Arduino kit', 'USB drive');

insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Hackathon prep coding'
    and e.start_time::date = date '2026-05-24'
    and i.name in ('USB drive', 'Charger');

insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Data Structures Lab'
    and e.start_time::date = date '2026-05-25'
    and i.name = 'Arduino kit';

insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Career Fair'
    and e.start_time::date = date '2026-05-27'
    and i.name = 'Printed resumes';

insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Hackathon prep coding'
    and e.start_time::date = date '2026-05-28'
    and i.name = 'USB drive';

insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Calculus Midterm'
    and e.start_time::date = date '2026-05-29'
    and i.name in ('Printed assignment', 'Hand sanitizer');

insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Acme final interview'
    and e.start_time::date = date '2026-06-09'
    and i.name in ('Printed resumes', 'Notebook');

insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Assignment 5 due'
    and e.start_time::date = date '2026-06-12'
    and i.name = 'USB drive';

-- =============================================================
-- 10. Manual checklist items (user-added per-day reminders)
-- =============================================================
insert into manual_checklist_items (item_name, for_date, checked) values
  ('Pick up dry cleaning', '2026-05-21', true),
  ('Mail rent cheque',     '2026-05-22', true),
  ('House keys',           '2026-05-23', false),
  ('Pack lunch - no break between 9am and 3pm', '2026-05-24', false),
  ('Birthday card',        '2026-05-25', false),
  ('Lab report draft',     '2026-05-26', false),
  ('Resume hard copy',     '2026-05-27', false),
  ('Permission slip',      '2026-05-28', false),
  ('Student ID badge',     '2026-05-29', false),
  ('Spare phone charger',  '2026-05-30', false),
  ('Birthday gift',        '2026-06-06', false),
  ('Conference badge',     '2026-06-09', false),
  ('Submit timesheet',     '2026-06-12', false);

commit;

-- =============================================================
-- Sanity check (uncomment to run interactively)
-- =============================================================
-- select
--   (select count(*) from saved_locations)        as saved_locations,
--   (select count(*) from items)                  as items,
--   (select count(*) from category_default_items) as defaults,
--   (select count(*) from routines)               as routines,
--   (select count(*) from events)                 as events,
--   (select count(*) from event_items)            as event_items,
--   (select count(*) from manual_checklist_items) as manual,
--   (select count(*) from custom_categories)      as custom_cats,
--   (select count(*) from personal_time_blocks)   as personal_time;
