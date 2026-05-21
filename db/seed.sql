INSERT INTO companies (id, name, address) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'PurePath Inc.',  '1200 Health Sciences Dr, Omaha, NE 68102');

  INSERT INTO shipper_locations (id, company_id, erp_id, name, address, city, state, zip_code, country, latitude, longitude) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'PP01', 'PurePath Omaha',    '1200 Health Sciences Dr', 'Omaha',    'NE', '68102', 'USA',  41.257160, -95.994820),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'PP02', 'PurePath New York', '350 Fifth Ave',           'New York', 'NY', '10118', 'USA',  40.748440, -73.985664),
  ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'PP03', 'PurePath Seattle',  '1730 Minor Ave',          'Seattle',  'WA', '98101', 'USA',  47.615310, -122.335960);

  INSERT INTO customers (id, company_id, name, address, city, state, zip_code, country) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Houston Methodist Hospital',   '6565 Fannin St',       'Houston',     'TX', '77030', 'USA'),
  ('f1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Mayo Clinic',                  '200 First St SW',      'Rochester',   'MN', '55905', 'USA'),
  ('f1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Cedars-Sinai Medical Center',  '8700 Beverly Blvd',    'Los Angeles', 'CA', '90048', 'USA'),
  ('f1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Massachusetts General',        '55 Fruit St',          'Boston',      'MA', '02114', 'USA'),
  ('f1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'Emory University Hospital',    '1364 Clifton Rd NE',   'Atlanta',     'GA', '30322', 'USA');

  INSERT INTO customer_locations (id, customer_id, name, address, city, state, zip_code, country, latitude, longitude) VALUES
  ('a2000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'Houston Methodist - Receiving', '6565 Fannin St',      'Houston',     'TX', '77030', 'USA',  29.710650, -95.397320),
  ('a2000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 'Mayo Clinic - Receiving',       '200 First St SW',     'Rochester',   'MN', '55905', 'USA',  44.022450, -92.466630),
  ('a2000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000003', 'Cedars-Sinai - Receiving',      '8700 Beverly Blvd',   'Los Angeles', 'CA', '90048', 'USA',  34.075820, -118.380600),
  ('a2000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000004', 'Mass General - Receiving',      '55 Fruit St',         'Boston',      'MA', '02114', 'USA',  42.363560, -71.068970),
  ('a2000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000005', 'Emory University - Receiving',  '1364 Clifton Rd NE',  'Atlanta',     'GA', '30322', 'USA',  33.798840, -84.325310);

  INSERT INTO products (id, company_id, material_number, description, weight, freight_class, unit_of_measure) VALUES
  ('a3000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'PP-MED-1001', 'Surgical Instrument Tray Set',  12.50, '85',   'EA'),
  ('a3000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'PP-MED-1002', 'Patient Monitoring System',     45.00, '70',   'EA'),
  ('a3000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'PP-MED-1003', 'IV Infusion Pump',              18.00, '85',   'EA'),
  ('a3000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'PP-MED-1004', 'Portable Ultrasound Unit',      32.00, '70',   'EA'),
  ('a3000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'PP-MED-1005', 'Sterilization Cabinet',        185.00, '65',   'EA'),
  ('a3000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'PP-MED-1006', 'Exam Table',                   120.00, '65',   'EA'),
  ('a3000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'PP-MED-1007', 'Defibrillator Unit',            14.00, '85',   'EA'),
  ('a3000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000001', 'PP-MED-1008', 'Surgical Light System',        220.00, '65',   'EA');