-- =============================================================
-- StraighterNoodles - Showcase Reseed
-- -------------------------------------------------------------
-- Safe to run on an EMPTY database or a populated one.
-- Wipes saved_locations, items, category_default_items,
-- routines, events, event_items, then repopulates with a
-- demo-ready week-of-life dataset.
--
-- Does NOT touch user_settings (preserves your city/timezone).
--
-- Anchor date: Saturday, May 23, 2026 (Mountain Time, -06:00)
--   Past week:    May 16 - May 22
--   Showcase day: May 23 (today)
--   Showcase:     May 24, May 25
--   Future:       May 26 - Jun 5
-- =============================================================

begin;

-- -------------------------------------------------------------
-- 1. Wipe (cascade clears event_items + category_default_items)
-- -------------------------------------------------------------
truncate table
  event_items,
  category_default_items,
  events,
  items,
  saved_locations,
  routines
restart identity cascade;

-- -------------------------------------------------------------
-- 2. Saved locations
-- -------------------------------------------------------------
insert into saved_locations (name, address, location_type, transit_minutes) values
  ('University of Calgary',     '2500 University Dr NW, Calgary',  'university', 30),
  ('T&T Supermarket',           '180 94 Ave SE, Calgary',          'grocery',    25),
  ('Goodlife Fitness Downtown', '4th Ave SW, Calgary',             'gym',        15),
  ('Local Coffee Shop',         'Bridgeland Riverside, Calgary',   'other',      10),
  ('Home',                       null,                              'home',       0);

-- -------------------------------------------------------------
-- 3. Items
-- -------------------------------------------------------------
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
  ('Reusable tote');

-- -------------------------------------------------------------
-- 4. Category defaults - what goes in the "Before You Leave"
--    checklist for each category.
-- -------------------------------------------------------------
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
    ('Laptop', 'Notebook');

-- -------------------------------------------------------------
-- 5. Routines (mix of due now, due soon, due later)
-- -------------------------------------------------------------
insert into routines
  (title, category, frequency, interval_days, preferred_time, next_due, active) values
  ('Yoga & stretch',            'personal', 'daily',         1, '07:00', now(),                    true),
  ('Drink 8 glasses of water',  'personal', 'daily',         1, null,    now(),                    true),
  ('Journal entry',             'personal', 'daily',         1, '22:00', now(),                    true),
  ('Call family',               'social',   'weekly',        7, '20:00', now(),                    true),
  ('Water the plants',          'personal', 'every_n_days',  3, null,    now(),                    true),
  ('Take out trash',            'personal', 'weekly',        7, null,    now() + interval '1 day', true),
  ('Meal prep for the week',    'personal', 'weekly',        7, '18:00', now() + interval '1 day', true),
  ('Laundry',                   'personal', 'weekly',        7, null,    now() + interval '6 days',true),
  ('Haircut',                   'personal', 'every_n_days', 21, null,    now() + interval '14 days',true);

-- -------------------------------------------------------------
-- 6. Events
-- -------------------------------------------------------------

-- ========== PAST WEEK: May 16 - May 22 (history) ==========
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values

  -- Sat May 16
  ('Sleep in',                    null,                              'personal',   '2026-05-16 09:00-06', '2026-05-16 10:30-06', 'Home',              null,                                                                false, null, null, true),
  ('Brunch with friends',         'Cliffhanger Bistro',              'social',     '2026-05-16 12:00-06', '2026-05-16 13:30-06', 'Bridgeland',        null,                                                                false, null, null, true),

  -- Sun May 17
  ('Reading day',                 'Catch up on assigned readings',   'assignment', '2026-05-17 11:00-06', '2026-05-17 14:00-06', 'Home',              null,                                                                false, null, null, true),
  ('Family dinner',               null,                              'social',     '2026-05-17 18:00-06', '2026-05-17 19:30-06', 'Home',              null,                                                                false, null, null, true),

  -- Mon May 18
  ('Data Structures Lecture',     null,                              'class',      '2026-05-18 09:00-06', '2026-05-18 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, true),
  ('Linear Algebra Lecture',      null,                              'class',      '2026-05-18 10:30-06', '2026-05-18 11:45-06', 'MS 211',            (select id from saved_locations where name='University of Calgary'),  false, null, null, true),
  ('Club exec meeting',           null,                              'club',       '2026-05-18 15:30-06', '2026-05-18 16:30-06', 'TFDL 5th floor',    (select id from saved_locations where name='University of Calgary'),  false, 'Reach out to sponsorship lead this week', 'follow_up', true),
  ('Gym session',                 'Pull day',                        'gym',        '2026-05-18 17:30-06', '2026-05-18 18:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true, null, null, true),

  -- Tue May 19
  ('Group project sync',          null,                              'meeting',    '2026-05-19 13:00-06', '2026-05-19 14:00-06', 'Discord',           null,                                                                false, null, null, true),
  ('Study session',               'Calc prep',                       'assignment', '2026-05-19 15:00-06', '2026-05-19 18:00-06', 'TFDL',              (select id from saved_locations where name='University of Calgary'),  true,  null, null, true),

  -- Wed May 20
  ('Data Structures Lecture',     null,                              'class',      '2026-05-20 09:00-06', '2026-05-20 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, true),
  ('Doctor appointment',          null,                              'personal',   '2026-05-20 14:00-06', '2026-05-20 15:00-06', 'Downtown clinic',   null,                                                                false, 'Prescription refilled, pick up Friday', 'completed', true),
  ('Dinner with parents',         null,                              'social',     '2026-05-20 18:30-06', '2026-05-20 20:00-06', 'Home',              null,                                                                false, null, null, true),

  -- Thu May 21
  ('Big assignment submission',   'COMP 311 - finally done!',        'assignment', '2026-05-21 09:00-06', '2026-05-21 13:00-06', 'TFDL',              (select id from saved_locations where name='University of Calgary'),  true,  null, null, true),
  ('Grocery run',                 null,                              'grocery',    '2026-05-21 17:00-06', '2026-05-21 18:00-06', null,                (select id from saved_locations where name='T&T Supermarket'),         false, null, null, true),

  -- Fri May 22
  ('Lab catch-up',                'Lighter session post-submission', 'class',      '2026-05-22 13:00-06', '2026-05-22 15:00-06', 'ICT 122',           (select id from saved_locations where name='University of Calgary'),  true,  null, null, true),
  ('Movie night with roommates',  'Dune Part 3',                     'social',     '2026-05-22 20:00-06', '2026-05-22 22:30-06', 'Home',              null,                                                                false, 'Movie was great - watch the sequel when it drops', 'completed', true);


-- ========== SHOWCASE DAY: Sat May 23 (today) ==========
-- Demonstrates: completed past events, NOW marker, long-stretch
-- warning (10:00-15:30 = 5.5h), auto-transit, notes in all 4
-- statuses, home-events excluded from Before-You-Leave,
-- Calgary late-transit warning (event ends 23:55).
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values

  -- Already happened today
  ('Morning yoga',                'Slow flow',                       'personal',   '2026-05-23 07:00-06', '2026-05-23 07:30-06', 'Living room',       null,                                                                false, null, null, true),
  ('Breakfast & coffee',          null,                              'personal',   '2026-05-23 08:00-06', '2026-05-23 08:45-06', 'Home',              null,                                                                false, null, null, true),

  -- Big stretch - triggers lunch warning + reschedule (incomplete)
  ('Marathon study at TFDL',      'Cramming for next week midterm',  'assignment', '2026-05-23 10:00-06', '2026-05-23 15:30-06', 'TFDL group room 4', (select id from saved_locations where name='University of Calgary'),  true,  'Hash tables question is tricky - ask TA on Monday', 'follow_up', false),

  -- Current / upcoming
  ('Coffee with Priya',           'Catch up + career chat',          'social',     '2026-05-23 16:00-06', '2026-05-23 17:30-06', null,                (select id from saved_locations where name='Local Coffee Shop'),       true,  'Priya is hiring summer interns - send her my resume by Wed', 'important', false),
  ('Gym session',                 'Push day',                        'gym',        '2026-05-23 17:45-06', '2026-05-23 18:45-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true,  null, null, false),
  ('Grocery run',                 null,                              'grocery',    '2026-05-23 19:00-06', '2026-05-23 20:00-06', null,                (select id from saved_locations where name='T&T Supermarket'),         false, 'Need produce, eggs, rice, tofu', 'unresolved', false),

  -- Home event - should NOT contribute items to Before-You-Leave
  ('Hackathon prep coding',       'StraighterNoodles polish',        'project',    '2026-05-23 20:30-06', '2026-05-23 22:00-06', 'Home desk',         null,                                                                false, null, null, false),

  -- Late event - triggers Calgary transit warning
  ('Late debug session',          'Engineering building has 24h access', 'project','2026-05-23 22:30-06', '2026-05-23 23:55-06', 'ENF 145',           (select id from saved_locations where name='University of Calgary'),  true,  null, null, false);


-- ========== PRE-BUILT TRANSIT BLOCKS for May 23 ==========
-- Mirrors what the auto-transit feature would create when the
-- user saves any of the above location-anchored events.
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Transit to University of Calgary', 'auto-transit for Marathon study at TFDL', 'transit', '2026-05-23 09:30-06', '2026-05-23 10:00-06', 'University of Calgary', null, false, null, null, true),
  ('Transit from University of Calgary','auto-transit for Marathon study at TFDL','transit', '2026-05-23 15:30-06', '2026-05-23 15:50-06', 'University of Calgary', null, false, null, null, true),
  ('Transit to Local Coffee Shop',     'auto-transit for Coffee with Priya',      'transit', '2026-05-23 15:50-06', '2026-05-23 16:00-06', 'Local Coffee Shop',     null, false, null, null, false),
  ('Transit to Goodlife Fitness',      'auto-transit for Gym session',            'transit', '2026-05-23 17:30-06', '2026-05-23 17:45-06', 'Goodlife Fitness Downtown', null, false, null, null, false),
  ('Transit to University of Calgary', 'auto-transit for Late debug session',     'transit', '2026-05-23 22:00-06', '2026-05-23 22:30-06', 'University of Calgary', null, false, null, null, false);


-- ========== SHOWCASE DAY: Sun May 24 (calm) ==========
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Long run at the park',        'Easy 5k',                         'gym',        '2026-05-24 09:00-06', '2026-05-24 10:00-06', 'Prince''s Island Park', null,                                                            false, null, null, false),
  ('Shower & brunch',             null,                              'personal',   '2026-05-24 10:30-06', '2026-05-24 11:30-06', 'Home',              null,                                                                false, null, null, false),
  ('Group project sync',          'Cap project plan',                'meeting',    '2026-05-24 12:00-06', '2026-05-24 13:00-06', 'Discord',           null,                                                                false, null, null, false),
  ('Reading: ML papers',          null,                              'assignment', '2026-05-24 14:00-06', '2026-05-24 16:00-06', 'Home',              null,                                                                false, null, null, false),
  ('Call cousin',                 null,                              'social',     '2026-05-24 16:30-06', '2026-05-24 17:30-06', 'Home',              null,                                                                false, null, null, false),
  ('Meal prep',                   'Sunday batch cook',               'personal',   '2026-05-24 18:00-06', '2026-05-24 19:30-06', 'Kitchen',           null,                                                                false, null, null, false);


-- ========== SHOWCASE DAY: Mon May 25 (busy school day) ==========
-- Demonstrates: back-to-back classes, auto-transit, lunch break,
-- 5h+ no-break stretch (16:30-22:00 across club+gym+study),
-- late event past 23:30 (Calgary transit warning).
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Data Structures Lecture',     'AVL Trees',                       'class',      '2026-05-25 09:00-06', '2026-05-25 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Linear Algebra Lecture',      'Eigenvalues',                     'class',      '2026-05-25 10:30-06', '2026-05-25 11:45-06', 'MS 211',            (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Lunch break',                 null,                              'break',      '2026-05-25 12:00-06', '2026-05-25 13:00-06', 'MacHall',           null,                                                                false, null, null, false),
  ('Data Structures Lab',         'Implement AVL rotations',         'class',      '2026-05-25 13:00-06', '2026-05-25 15:00-06', 'ICT 122',           (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Club exec meeting',           null,                              'club',       '2026-05-25 15:30-06', '2026-05-25 16:30-06', 'TFDL 5th floor',    (select id from saved_locations where name='University of Calgary'),  false, 'Bring lab equipment proposal', 'important', false),
  ('Gym session',                 'Pull day',                        'gym',        '2026-05-25 17:30-06', '2026-05-25 18:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true,  null, null, false),
  ('Quick dinner',                null,                              'break',      '2026-05-25 19:00-06', '2026-05-25 19:45-06', 'Home',              null,                                                                false, null, null, false),
  ('Study session at TFDL',       'Midterm prep',                    'assignment', '2026-05-25 20:30-06', '2026-05-25 22:00-06', 'TFDL',              (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Late hackathon hacking',      'Engineering building 24h',        'project',    '2026-05-25 22:30-06', '2026-05-25 23:55-06', 'ENF 145',           (select id from saved_locations where name='University of Calgary'),  false, null, null, false);


-- ========== Tue May 26 ==========
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Morning run',                 null,                              'gym',        '2026-05-26 08:00-06', '2026-05-26 08:45-06', 'Park',              null,                                                                false, null, null, false),
  ('Software Engineering Lecture','Design patterns',                 'class',      '2026-05-26 10:00-06', '2026-05-26 12:00-06', 'ICT 121',           (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Office hours with Prof. Reid',null,                              'meeting',    '2026-05-26 13:00-06', '2026-05-26 14:00-06', 'MS 678',            (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Coffee with mentor',          'Career chat',                     'social',     '2026-05-26 14:30-06', '2026-05-26 15:30-06', null,                (select id from saved_locations where name='Local Coffee Shop'),       true,  null, null, false),
  ('Project work',                null,                              'project',    '2026-05-26 16:00-06', '2026-05-26 18:00-06', 'Home',              null,                                                                false, null, null, false),
  ('Movie night',                 'with roommates',                  'social',     '2026-05-26 20:00-06', '2026-05-26 22:00-06', 'Home',              null,                                                                false, null, null, false);


-- ========== Wed May 27 ==========
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Data Structures Lecture',     null,                              'class',      '2026-05-27 09:00-06', '2026-05-27 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Linear Algebra Lecture',      null,                              'class',      '2026-05-27 10:30-06', '2026-05-27 11:45-06', 'MS 211',            (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Career Fair',                 'Engineering career fair',         'club',       '2026-05-27 12:30-06', '2026-05-27 14:30-06', 'MacHall Ballroom',  (select id from saved_locations where name='University of Calgary'),  false, 'Bring printed resumes', 'important', false),
  ('Tutoring session',            '1st year math tutoring',          'club',       '2026-05-27 16:00-06', '2026-05-27 17:00-06', 'TFDL group study',  (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Gym session',                 'Legs',                            'gym',        '2026-05-27 19:00-06', '2026-05-27 20:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true,  null, null, false);


-- ========== Thu May 28 ==========
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Calculus midterm prep',       'Review past papers',              'assignment', '2026-05-28 09:30-06', '2026-05-28 11:00-06', 'TFDL',              (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Therapist appointment',       null,                              'personal',   '2026-05-28 11:30-06', '2026-05-28 12:30-06', 'Downtown',          null,                                                                false, null, null, false),
  ('Hackathon team sync',         'StraighterNoodles demo prep',     'club',       '2026-05-28 13:00-06', '2026-05-28 14:30-06', 'Discord',           null,                                                                false, null, null, false),
  ('Lab make-up',                 'Missed lab from last week',       'class',      '2026-05-28 15:00-06', '2026-05-28 17:00-06', 'ICT 122',           (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Grocery run',                 null,                              'grocery',    '2026-05-28 18:00-06', '2026-05-28 19:00-06', null,                (select id from saved_locations where name='T&T Supermarket'),         false, null, null, false),
  ('Hackathon prep coding',       'Polish demo flow',                'project',    '2026-05-28 20:00-06', '2026-05-28 22:30-06', 'Home',              null,                                                                false, null, null, false);


-- ========== Fri May 29 - Heavy day ==========
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Calculus Midterm',            'Ch. 1-6, bring calculator & ID',  'assignment', '2026-05-29 09:00-06', '2026-05-29 11:00-06', 'ENA 101',           (select id from saved_locations where name='University of Calgary'),  true,  'Worth 25% of final grade', 'important', false),
  ('Lunch with team',             'Decompress after midterm',        'social',     '2026-05-29 12:00-06', '2026-05-29 13:00-06', 'MacHall',           null,                                                                false, null, null, false),
  ('Hackathon kickoff',           'Opening ceremony + team intro',   'club',       '2026-05-29 13:30-06', '2026-05-29 15:30-06', 'TFDL',              (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Hackathon hacking',           'Build all night',                 'project',    '2026-05-29 18:00-06', '2026-05-29 23:55-06', 'Engineering Building', (select id from saved_locations where name='University of Calgary'), true, null, null, false);


-- ========== Sat May 30 - Hackathon weekend ==========
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Hackathon Day 2',             'Continued hacking',               'project',    '2026-05-30 10:00-06', '2026-05-30 22:00-06', 'Engineering Building', (select id from saved_locations where name='University of Calgary'), true, null, null, false);


-- ========== Sun May 31 ==========
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  ('Recovery sleep-in',           null,                              'personal',   '2026-05-31 10:00-06', '2026-05-31 11:30-06', 'Home',              null,                                                                false, null, null, false),
  ('Family brunch',               null,                              'social',     '2026-05-31 12:30-06', '2026-05-31 14:00-06', 'Bridgeland Bistro', null,                                                                false, null, null, false),
  ('Laundry',                     null,                              'personal',   '2026-05-31 15:00-06', '2026-05-31 17:00-06', 'Home',              null,                                                                false, null, null, false);


-- ========== Week of Jun 1 - Jun 5 ==========
insert into events
  (title, description, category, start_time, end_time, location, location_id, auto_transit, notes, note_status, completed) values
  -- Mon Jun 1
  ('Data Structures Lecture',     null,                              'class',      '2026-06-01 09:00-06', '2026-06-01 10:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Linear Algebra Lecture',      null,                              'class',      '2026-06-01 10:30-06', '2026-06-01 11:45-06', 'MS 211',            (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Lab session',                 null,                              'class',      '2026-06-01 13:00-06', '2026-06-01 15:00-06', 'ICT 122',           (select id from saved_locations where name='University of Calgary'),  false, null, null, false),
  ('Gym session',                 null,                              'gym',        '2026-06-01 17:30-06', '2026-06-01 18:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true,  null, null, false),

  -- Tue Jun 2
  ('Software Engineering Lecture',null,                              'class',      '2026-06-02 10:00-06', '2026-06-02 12:00-06', 'ICT 121',           (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Project sync',                null,                              'meeting',    '2026-06-02 14:00-06', '2026-06-02 15:00-06', 'Discord',           null,                                                                false, null, null, false),

  -- Wed Jun 3
  ('Career fair follow-up interview', null,                          'meeting',    '2026-06-03 11:00-06', '2026-06-03 12:00-06', 'Zoom',              null,                                                                false, null, null, false),
  ('Data Structures Lecture',     null,                              'class',      '2026-06-03 14:00-06', '2026-06-03 15:15-06', 'MS 217',            (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),

  -- Thu Jun 4
  ('Lab session',                 null,                              'class',      '2026-06-04 13:00-06', '2026-06-04 15:00-06', 'ICT 122',           (select id from saved_locations where name='University of Calgary'),  true,  null, null, false),
  ('Gym session',                 null,                              'gym',        '2026-06-04 17:30-06', '2026-06-04 18:30-06', null,                (select id from saved_locations where name='Goodlife Fitness Downtown'), true,  null, null, false),

  -- Fri Jun 5
  ('Project deadline submission', 'Final hackathon submission',      'assignment', '2026-06-05 09:00-06', '2026-06-05 12:00-06', 'Engineering Building', (select id from saved_locations where name='University of Calgary'), true, null, null, false),
  ('Celebration dinner',          'With the team',                   'social',     '2026-06-05 19:00-06', '2026-06-05 21:00-06', 'Downtown',          null,                                                                false, null, null, false);


-- -------------------------------------------------------------
-- 7. One-time event-specific items (Arduino kits, printed
--    resumes, etc.) - link items to the events that need them.
-- -------------------------------------------------------------
insert into event_items (event_id, item_id, is_one_time)
  select e.id, i.id, true
  from events e cross join items i
  where e.title = 'Marathon study at TFDL'
    and e.start_time::date = date '2026-05-23'
    and i.name in ('Printed assignment', 'Calculator');

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

commit;

-- -------------------------------------------------------------
-- Sanity check (uncomment to run interactively)
-- -------------------------------------------------------------
-- select
--   (select count(*) from saved_locations)        as saved_locations,
--   (select count(*) from items)                  as items,
--   (select count(*) from category_default_items) as defaults,
--   (select count(*) from routines)               as routines,
--   (select count(*) from events)                 as events,
--   (select count(*) from event_items)            as event_items;
