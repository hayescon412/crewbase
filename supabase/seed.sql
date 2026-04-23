-- ============================================================
-- CREWBASE DEMO SEED DATA
-- Realistic fake data for portfolio screenshots
-- Run in Supabase SQL Editor (New Query tab)
-- ============================================================

-- Crew members
insert into crew (id, name, role, phone, email) values
  ('a1000001-0000-0000-0000-000000000001', 'Marcus Webb',  'Lead Installer', '615-402-7821', 'marcus.webb@email.com'),
  ('a1000001-0000-0000-0000-000000000002', 'Derek Solis',  'Installer',      '615-318-9043', 'derek.solis@email.com'),
  ('a1000001-0000-0000-0000-000000000003', 'Jake Pruitt',  'Finisher',       '615-774-2256', null),
  ('a1000001-0000-0000-0000-000000000004', 'Tyler Haws',   'Apprentice',     '615-509-8812', null)
on conflict do nothing;

-- Jobs
insert into jobs (id, name, address, trade, status, client_name, client_email, value) values
  ('b1000001-0000-0000-0000-000000000001', 'Kitchen Remodel — Miller Residence',      '4821 Chestnut Ln, Nashville TN',    'Cabinetry', 'Active',      'Sandra Miller',   'sandra.miller@email.com', 14500),
  ('b1000001-0000-0000-0000-000000000002', 'Master Bath Vanity — Thompson Home',      '312 Ridgeview Dr, Brentwood TN',    'Cabinetry', 'Wrapping Up', 'James Thompson',  'jthompson@email.com',     6800),
  ('b1000001-0000-0000-0000-000000000003', 'Home Office Built-Ins — Davidson Property','908 Maple Creek Rd, Franklin TN',  'Cabinetry', 'Active',      'Rachel Davidson', null,                      9200),
  ('b1000001-0000-0000-0000-000000000004', 'Mudroom Lockers — Harrington Build',      '2244 Sunridge Blvd, Spring Hill TN','Cabinetry', 'Active',      'Tom Harrington',  'tom.h@email.com',         7400),
  ('b1000001-0000-0000-0000-000000000005', 'Kitchen Remodel — Brooks Residence',      '1107 Elm Street, Nashville TN',     'Cabinetry', 'Complete',    'Kevin Brooks',    'kbrooks@email.com',       18200)
on conflict do nothing;

-- Tasks — Miller Kitchen (3 of 7 done)
insert into tasks (job_id, text, done, order_index) values
  ('b1000001-0000-0000-0000-000000000001', 'Demo existing cabinets',              true,  1),
  ('b1000001-0000-0000-0000-000000000001', 'Install upper cabinet boxes',         true,  2),
  ('b1000001-0000-0000-0000-000000000001', 'Install lower cabinet boxes',         true,  3),
  ('b1000001-0000-0000-0000-000000000001', 'Install cabinet doors and drawers',   false, 4),
  ('b1000001-0000-0000-0000-000000000001', 'Install crown molding',               false, 5),
  ('b1000001-0000-0000-0000-000000000001', 'Install hardware',                    false, 6),
  ('b1000001-0000-0000-0000-000000000001', 'Final touch-up and punch list',       false, 7);

-- Tasks — Thompson Vanity (4 of 6 done)
insert into tasks (job_id, text, done, order_index) values
  ('b1000001-0000-0000-0000-000000000002', 'Remove old vanity',                   true,  1),
  ('b1000001-0000-0000-0000-000000000002', 'Install new vanity cabinet',          true,  2),
  ('b1000001-0000-0000-0000-000000000002', 'Install mirror cabinet',              true,  3),
  ('b1000001-0000-0000-0000-000000000002', 'Install hardware and fixtures',       true,  4),
  ('b1000001-0000-0000-0000-000000000002', 'Caulk and seal',                      false, 5),
  ('b1000001-0000-0000-0000-000000000002', 'Final walkthrough with client',       false, 6);

-- Tasks — Davidson Built-Ins (2 of 5 done)
insert into tasks (job_id, text, done, order_index) values
  ('b1000001-0000-0000-0000-000000000003', 'Measure and template walls',          true,  1),
  ('b1000001-0000-0000-0000-000000000003', 'Frame out built-in structure',        true,  2),
  ('b1000001-0000-0000-0000-000000000003', 'Install cabinet boxes',               false, 3),
  ('b1000001-0000-0000-0000-000000000003', 'Install shelving and doors',          false, 4),
  ('b1000001-0000-0000-0000-000000000003', 'Paint and finish',                    false, 5);

-- Tasks — Harrington Mudroom (1 of 5 done)
insert into tasks (job_id, text, done, order_index) values
  ('b1000001-0000-0000-0000-000000000004', 'Site prep and measurements',          true,  1),
  ('b1000001-0000-0000-0000-000000000004', 'Install locker frames',               false, 2),
  ('b1000001-0000-0000-0000-000000000004', 'Install doors and benches',           false, 3),
  ('b1000001-0000-0000-0000-000000000004', 'Install hooks and hardware',          false, 4),
  ('b1000001-0000-0000-0000-000000000004', 'Paint and touch up',                  false, 5);

-- Tasks — Brooks Kitchen (all 6 done — Complete job)
insert into tasks (job_id, text, done, order_index) values
  ('b1000001-0000-0000-0000-000000000005', 'Demo existing cabinets',              true, 1),
  ('b1000001-0000-0000-0000-000000000005', 'Install upper and lower boxes',       true, 2),
  ('b1000001-0000-0000-0000-000000000005', 'Install doors and drawers',           true, 3),
  ('b1000001-0000-0000-0000-000000000005', 'Install crown molding',               true, 4),
  ('b1000001-0000-0000-0000-000000000005', 'Install hardware',                    true, 5),
  ('b1000001-0000-0000-0000-000000000005', 'Final punch list and walkthrough',    true, 6);

-- Job crew assignments
insert into job_crew (job_id, crew_id) values
  ('b1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001'),
  ('b1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000002'),
  ('b1000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000001'),
  ('b1000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000003'),
  ('b1000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000002'),
  ('b1000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000004'),
  ('b1000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000003'),
  ('b1000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000004'),
  ('b1000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000001'),
  ('b1000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000002')
on conflict do nothing;

-- ── TRANSACTIONS (Nov 2025 – Apr 2026) ───────────────────────

-- November 2025
insert into transactions (job_id, description, amount, type, category, date) values
  ('b1000001-0000-0000-0000-000000000005', 'Client deposit — Brooks Kitchen',         9100, 'income',  'Client Payment', '2025-11-03'),
  ('b1000001-0000-0000-0000-000000000005', 'Cabinet materials — Brooks',              4200, 'expense', 'Materials',      '2025-11-05'),
  ('b1000001-0000-0000-0000-000000000005', 'Labor — Brooks install week 1',           2800, 'expense', 'Labor',          '2025-11-10'),
  (null,                                   'Shop supplies and consumables',             340, 'expense', 'Equipment',      '2025-11-14'),
  ('b1000001-0000-0000-0000-000000000005', 'Final payment — Brooks Kitchen',          9100, 'income',  'Client Payment', '2025-11-28');

-- December 2025
insert into transactions (job_id, description, amount, type, category, date) values
  ('b1000001-0000-0000-0000-000000000002', 'Deposit — Thompson Vanity',              3400, 'income',  'Client Payment', '2025-12-02'),
  (null,                                   'Vehicle maintenance — work truck',         680, 'expense', 'Equipment',      '2025-12-06'),
  ('b1000001-0000-0000-0000-000000000002', 'Vanity cabinet materials',               1850, 'expense', 'Materials',      '2025-12-10'),
  (null,                                   'Shop rent — December',                   1200, 'expense', 'Overhead',       '2025-12-15'),
  ('b1000001-0000-0000-0000-000000000003', 'Deposit — Davidson Built-Ins',           4600, 'income',  'Client Payment', '2025-12-18');

-- January 2026
insert into transactions (job_id, description, amount, type, category, date) values
  ('b1000001-0000-0000-0000-000000000003', 'Lumber and framing — Davidson',          1240, 'expense', 'Materials',      '2026-01-06'),
  ('b1000001-0000-0000-0000-000000000003', 'Labor — Davidson week 1',                2400, 'expense', 'Labor',          '2026-01-10'),
  (null,                                   'Shop rent — January',                    1200, 'expense', 'Overhead',       '2026-01-15'),
  ('b1000001-0000-0000-0000-000000000004', 'Deposit — Harrington Mudroom',           3700, 'income',  'Client Payment', '2026-01-20'),
  ('b1000001-0000-0000-0000-000000000002', 'Labor — Thompson install',               1800, 'expense', 'Labor',          '2026-01-22'),
  (null,                                   'Router bits, clamps, sandpaper',          420, 'expense', 'Equipment',      '2026-01-28');

-- February 2026
insert into transactions (job_id, description, amount, type, category, date) values
  ('b1000001-0000-0000-0000-000000000004', 'Locker materials — Harrington',          2100, 'expense', 'Materials',      '2026-02-03'),
  ('b1000001-0000-0000-0000-000000000002', 'Final payment — Thompson Vanity',        3400, 'income',  'Client Payment', '2026-02-07'),
  (null,                                   'Shop rent — February',                   1200, 'expense', 'Overhead',       '2026-02-15'),
  ('b1000001-0000-0000-0000-000000000001', 'Deposit — Miller Kitchen',               7250, 'income',  'Client Payment', '2026-02-19'),
  ('b1000001-0000-0000-0000-000000000004', 'Labor — Harrington install',             1600, 'expense', 'Labor',          '2026-02-24');

-- March 2026
insert into transactions (job_id, description, amount, type, category, date) values
  ('b1000001-0000-0000-0000-000000000001', 'Cabinet order — Miller Kitchen',         5800, 'expense', 'Materials',      '2026-03-04'),
  ('b1000001-0000-0000-0000-000000000001', 'Crown molding and trim — Miller',         640, 'expense', 'Materials',      '2026-03-08'),
  (null,                                   'Shop rent — March',                      1200, 'expense', 'Overhead',       '2026-03-15'),
  ('b1000001-0000-0000-0000-000000000003', 'Progress payment — Davidson',            4600, 'income',  'Client Payment', '2026-03-18'),
  ('b1000001-0000-0000-0000-000000000001', 'Labor — Miller install week 1',          3200, 'expense', 'Labor',          '2026-03-24'),
  (null,                                   'Fuel and mileage',                         310, 'expense', 'Overhead',       '2026-03-28');

-- April 2026
insert into transactions (job_id, description, amount, type, category, date) values
  ('b1000001-0000-0000-0000-000000000001', 'Labor — Miller install week 2',          2800, 'expense', 'Labor',          '2026-04-02'),
  (null,                                   'Shop rent — April',                      1200, 'expense', 'Overhead',       '2026-04-07'),
  ('b1000001-0000-0000-0000-000000000004', 'Final payment — Harrington Mudroom',     3700, 'income',  'Client Payment', '2026-04-10'),
  (null,                                   'Safety equipment and PPE',                280, 'expense', 'Equipment',      '2026-04-14'),
  ('b1000001-0000-0000-0000-000000000001', 'Hardware and pulls — Miller',             890, 'expense', 'Materials',      '2026-04-17');

-- Materials
insert into materials (job_id, name, qty, status) values
  ('b1000001-0000-0000-0000-000000000001', 'Shaker upper cabinets — white',   '14 boxes', 'on_site'),
  ('b1000001-0000-0000-0000-000000000001', 'Shaker lower cabinets — white',   '10 boxes', 'on_site'),
  ('b1000001-0000-0000-0000-000000000001', '5-piece shaker doors',            '28 doors', 'ordered'),
  ('b1000001-0000-0000-0000-000000000001', 'Crown molding 3.5" traditional',  '80 LF',    'ordered'),
  ('b1000001-0000-0000-0000-000000000001', 'Brushed nickel pulls 3"',         '32 pulls', 'needed'),
  ('b1000001-0000-0000-0000-000000000003', 'Maple plywood 3/4"',              '18 sheets','on_site'),
  ('b1000001-0000-0000-0000-000000000003', 'Built-in cabinet boxes',          '8 boxes',  'on_site'),
  ('b1000001-0000-0000-0000-000000000003', 'Adjustable shelving hardware',    '4 sets',   'on_site'),
  ('b1000001-0000-0000-0000-000000000004', 'Locker units — 4 bay',            '1 unit',   'on_site'),
  ('b1000001-0000-0000-0000-000000000004', 'Bench seat — poplar',             '6 LF',     'needed');

-- Change orders
insert into change_orders (job_id, description, amount, status) values
  ('b1000001-0000-0000-0000-000000000001', 'Add soft-close hinges on all doors',         380,  'approved'),
  ('b1000001-0000-0000-0000-000000000001', 'Under-cabinet lighting rough-in',            650,  'pending'),
  ('b1000001-0000-0000-0000-000000000003', 'Extend built-in to full wall — 4 add''l boxes', 1200, 'approved');

-- Client updates
insert into client_updates (job_id, message, sent_by) values
  ('b1000001-0000-0000-0000-000000000001', 'Upper boxes are in and level — looking great. Starting lowers tomorrow morning.', 'Marcus Webb'),
  ('b1000001-0000-0000-0000-000000000001', 'Doors ordered and confirmed for delivery Thursday. Still on schedule.', 'Admin'),
  ('b1000001-0000-0000-0000-000000000002', 'Vanity install is complete. Coming back Friday to caulk and do the final walkthrough.', 'Marcus Webb'),
  ('b1000001-0000-0000-0000-000000000003', 'Framing is done and boxes arrive Monday. Looking really sharp in there.', 'Derek Solis');

-- Rating (completed job)
insert into ratings (job_id, score, comment) values
  ('b1000001-0000-0000-0000-000000000005', 5, 'Marcus and his crew were incredible. On time, clean, and the cabinets look better than we imagined. Would hire again without hesitation.');

-- Flags
insert into flags (job_id, job_name, flagged_by, text, resolved) values
  ('b1000001-0000-0000-0000-000000000001', 'Kitchen Remodel — Miller Residence',       'Derek Solis', 'Two upper boxes came in with wrong door bore — need replacements before doors can go on.', false),
  ('b1000001-0000-0000-0000-000000000003', 'Home Office Built-Ins — Davidson Property','Jake Pruitt',  'Right wall is out of square — need to scribe the end panel. Adding ~2 hours to install.', true);
