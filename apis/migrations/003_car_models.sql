-- AutoPilot — car model catalogue
--
-- Seeds `car_models` for the makes already in `car_makes`, so the vehicle
-- form can offer a model picker scoped to the chosen make instead of free
-- text. Models are matched to their make by name, not by id, so this is safe
-- against a project whose ids differ.
--
-- Re-runnable: a model already present for its make is skipped, so adding a
-- name to a list below and running the file again inserts only that name.
--
-- No catalogue of this kind is ever complete — trims, regional names and new
-- releases will be missing — which is why the picker still accepts a typed
-- model. `year` and `body_type` are left null: a row here is a model line,
-- not a model year.

insert into public.car_models (make, name, is_active)
select mk.id, model.name, true
from (
  values
    ('Alfa Romeo', array['Giulia', 'Stelvio', 'Tonale', 'Junior', 'Giulietta', 'MiTo', '147', '156', '159', '166', 'GT', 'Brera', 'Spider', '4C', '8C Competizione']),
    ('Audi', array['A1', 'A2', 'A3', 'A4', 'A4 Allroad', 'A5', 'A6', 'A6 Allroad', 'A7', 'A8', 'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q6 e-tron', 'Q7', 'Q8', 'Q8 e-tron', 'e-tron', 'e-tron GT', 'TT', 'R8', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'SQ5', 'SQ7', 'SQ8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RS Q3', 'RS Q8']),
    ('Avatr', array['06', '07', '11', '12']),
    ('BAIC', array['X3', 'X25', 'X35', 'X55', 'X7', 'U5', 'U5 Plus', 'D20', 'D50', 'BJ30', 'BJ40', 'BJ60', 'BJ80', 'EU5', 'EX5']),
    ('BMW', array['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM', 'Z3', 'Z4', 'i3', 'i4', 'i5', 'i7', 'i8', 'iX', 'iX1', 'iX2', 'iX3', 'M2', 'M3', 'M4', 'M5', 'M6', 'M8', 'X3 M', 'X4 M', 'X5 M', 'X6 M']),
    ('BYD', array['F0', 'F3', 'L3', 'G3', 'S6', 'Qin', 'Qin Plus', 'Han', 'Tang', 'Song Plus', 'Song Pro', 'Yuan Plus', 'Yuan Up', 'Atto 3', 'Dolphin', 'Seal', 'Seal U', 'Seagull', 'Sealion 6', 'Sealion 7', 'Destroyer 05', 'King', 'Chazor', 'e2', 'e6', 'Shark']),
    ('Changan', array['Alsvin', 'Eado', 'Eado Plus', 'Benni', 'Lamore', 'CS15', 'CS35', 'CS35 Plus', 'CS55', 'CS55 Plus', 'CS75', 'CS75 Plus', 'CS85', 'CS95', 'UNI-T', 'UNI-K', 'UNI-V', 'UNI-S', 'X7 Plus', 'Hunter']),
    ('Chery', array['QQ', 'A1', 'A3', 'A5', 'A11', 'A15', 'Envy', 'Arrizo 5', 'Arrizo 6', 'Arrizo 6 Pro', 'Arrizo 8', 'Tiggo', 'Tiggo 2', 'Tiggo 2 Pro', 'Tiggo 3', 'Tiggo 4', 'Tiggo 4 Pro', 'Tiggo 5', 'Tiggo 5x', 'Tiggo 7', 'Tiggo 7 Pro', 'Tiggo 7 Pro Max', 'Tiggo 8', 'Tiggo 8 Pro', 'Tiggo 8 Pro Max', 'Tiggo 9', 'eQ1']),
    ('Chevrolet', array['Aveo', 'Optra', 'Lanos', 'Cruze', 'Malibu', 'Impala', 'Caprice', 'Lumina', 'Epica', 'Spark', 'Sonic', 'Onix', 'Groove', 'Captiva', 'Equinox', 'Trax', 'Trailblazer', 'Blazer', 'Traverse', 'Tahoe', 'Suburban', 'Orlando', 'Silverado', 'Colorado', 'Camaro', 'Corvette', 'Bolt', 'Bolt EUV', 'N300', 'T-Series']),
    ('Chrysler', array['200', '300', '300C', 'Pacifica', 'Voyager', 'Grand Voyager', 'Town & Country', 'PT Cruiser', 'Sebring', 'Crossfire', 'Neon', 'Aspen']),
    ('Citroen', array['C1', 'C2', 'C3', 'C3 Aircross', 'C4', 'C4 Cactus', 'C4 Picasso', 'C4 X', 'e-C4', 'C5', 'C5 Aircross', 'C5 X', 'C6', 'C8', 'C-Elysee', 'Berlingo', 'Xsara', 'Xsara Picasso', 'Saxo', 'DS3', 'DS4', 'DS5', 'Jumpy', 'Jumper', 'SpaceTourer', 'Ami']),
    ('Cupra', array['Formentor', 'Leon', 'Ateca', 'Born', 'Tavascan', 'Terramar']),
    ('Daewoo', array['Lanos', 'Nubira', 'Leganza', 'Matiz', 'Espero', 'Nexia', 'Cielo', 'Racer', 'Tico', 'Lacetti', 'Kalos', 'Tacuma']),
    ('Daihatsu', array['Terios', 'Sirion', 'Charade', 'Mira', 'Cuore', 'Materia', 'Gran Max', 'Rocky', 'Copen', 'Move', 'YRV', 'Feroza', 'Applause', 'Xenia', 'Ayla', 'Sigra', 'Taft', 'Tanto', 'Hijet']),
    ('Deepal', array['S05', 'S07', 'S09', 'L07', 'SL03', 'G318']),
    ('Dodge', array['Charger', 'Challenger', 'Durango', 'Journey', 'Ram', 'Dakota', 'Dart', 'Neon', 'Caliber', 'Avenger', 'Stratus', 'Magnum', 'Nitro', 'Viper', 'Caravan', 'Grand Caravan', 'Hornet']),
    ('Dongfeng', array['A30', 'A60', 'S30', 'H30 Cross', 'AX3', 'AX4', 'AX7', 'Aeolus Shine', 'Aeolus Huge', 'Mage', 'T5', 'T5 Evo', 'Glory 330', 'Glory 500', 'Glory 580', 'ix5', 'Rich 6', 'Box', 'Nano Box']),
    ('EXEED', array['TX', 'TXL', 'VX', 'LX', 'RX', 'Sterra ES', 'Sterra ET']),
    ('Fiat', array['500', '500e', '500L', '500X', '600', 'Panda', 'Grande Panda', 'Punto', 'Grande Punto', 'Tipo', 'Egea', 'Linea', 'Siena', 'Albea', 'Palio', 'Uno', '127', '128', '131', 'Regata', 'Tempra', 'Shahin', 'Bravo', 'Brava', 'Marea', 'Stilo', 'Doblo', 'Fiorino', 'Qubo', 'Ducato', 'Freemont', 'Fullback', 'Toro', 'Strada']),
    ('Ford', array['Ka', 'Figo', 'Fiesta', 'Focus', 'Escort', 'Fusion', 'Mondeo', 'Taurus', 'Crown Victoria', 'Mustang', 'Mustang Mach-E', 'EcoSport', 'Puma', 'Kuga', 'Escape', 'Territory', 'Edge', 'Explorer', 'Expedition', 'Flex', 'Bronco', 'Bronco Sport', 'Everest', 'Ranger', 'Maverick', 'F-150', 'F-250', 'B-Max', 'C-Max', 'S-Max', 'Galaxy', 'Tourneo', 'Transit', 'Transit Custom']),
    ('Geely', array['CK', 'MK', 'LC', 'Pandino', 'Panda', 'EC7', 'EC8', 'Emgrand', 'Emgrand 7', 'Emgrand X7', 'Emgrand GT', 'Binrui', 'Preface', 'GX3 Pro', 'Coolray', 'Binyue', 'Cityray', 'Azkarra', 'Okavango', 'Tugella', 'Starray', 'Monjaro', 'Geometry C', 'EX5', 'Galaxy E5']),
    ('GMC', array['Sierra', 'Canyon', 'Yukon', 'Yukon XL', 'Suburban', 'Terrain', 'Acadia', 'Envoy', 'Jimmy', 'Savana', 'Hummer EV']),
    ('Great Wall', array['Peri', 'Florid', 'Voleex C30', 'Safe', 'Deer', 'Wingle 5', 'Wingle 7', 'Poer', 'M4', 'Hover', 'Hover H3', 'Hover H5', 'Hover H6', 'Tank 300', 'Tank 500']),
    ('Haval', array['H1', 'H2', 'H4', 'H5', 'H6', 'H6 GT', 'H7', 'H8', 'H9', 'M6', 'F7', 'F7x', 'Jolion', 'Jolion Pro', 'Dargo', 'Big Dog']),
    ('Honda', array['Brio', 'Amaze', 'City', 'Civic', 'Accord', 'Legend', 'Insight', 'Integra', 'Prelude', 'Jazz', 'Fit', 'Freed', 'Mobilio', 'Stream', 'Odyssey', 'WR-V', 'BR-V', 'HR-V', 'ZR-V', 'CR-V', 'Elevate', 'Passport', 'Pilot', 'Element', 'Ridgeline', 'CR-Z', 'S2000', 'NSX', 'e']),
    ('Hummer', array['H1', 'H2', 'H3', 'H3T']),
    ('Hyundai', array['Atos', 'i10', 'Grand i10', 'i20', 'i30', 'i40', 'ix20', 'ix35', 'Getz', 'Matrix', 'Excel', 'Verna', 'Accent', 'Accent RB', 'Accent HCI', 'Elantra', 'Elantra HD', 'Elantra AD', 'Elantra CN7', 'Sonata', 'Azera', 'Grandeur', 'Genesis', 'Coupe', 'Veloster', 'Venue', 'Bayon', 'Kona', 'Creta', 'Tucson', 'Santa Fe', 'Palisade', 'Terracan', 'Santa Cruz', 'H-1', 'H-100', 'Staria', 'Ioniq', 'Ioniq 5', 'Ioniq 6']),
    ('IM Motors', array['L6', 'L7', 'LS6', 'LS7', 'IM5', 'IM6']),
    ('Infiniti', array['Q30', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX55', 'QX56', 'QX60', 'QX70', 'QX80', 'EX35', 'FX35', 'FX45', 'FX50', 'G35', 'G37', 'M35', 'M37', 'JX35']),
    ('Isuzu', array['D-Max', 'MU-X', 'Trooper', 'Rodeo', 'Ascender', 'Panther', 'TFR', 'N-Series']),
    ('JAC', array['J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'S2', 'S3', 'S4', 'S5', 'S7', 'JS2', 'JS3', 'JS4', 'JS6', 'JS8', 'T6', 'T8', 'T9', 'e-JS1', 'e-JS4', 'Refine']),
    ('Jaguar', array['XE', 'XF', 'XJ', 'XK', 'S-Type', 'X-Type', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace']),
    ('Jeep', array['Wrangler', 'Gladiator', 'Renegade', 'Avenger', 'Compass', 'Patriot', 'Liberty', 'Cherokee', 'Grand Cherokee', 'Grand Cherokee L', 'Commander', 'Wagoneer', 'Grand Wagoneer']),
    ('Jetour', array['X50', 'X70', 'X70 Plus', 'X70S', 'X90', 'X90 Plus', 'X95', 'Dashing', 'T1', 'T2']),
    ('Kaiyi', array['X3', 'X3 Pro', 'X7', 'E5']),
    ('Kia', array['Picanto', 'Rio', 'Pegas', 'Sephia', 'Shuma', 'Spectra', 'Cerato', 'Grand Cerato', 'Forte', 'K3', 'K5', 'Optima', 'Cadenza', 'K8', 'K900', 'Quoris', 'Stinger', 'Ceed', 'Pro Ceed', 'XCeed', 'Soul', 'Stonic', 'Sonet', 'Seltos', 'Niro', 'Sportage', 'Sorento', 'Telluride', 'Mohave', 'Carens', 'Carnival', 'Sedona', 'Bongo', 'EV3', 'EV5', 'EV6', 'EV9']),
    ('Lada', array['2105', '2106', '2107', '2110', 'Samara', 'Kalina', 'Priora', 'Granta', 'Vesta', 'Largus', 'XRAY', 'Niva', 'Niva Legend', 'Niva Travel']),
    ('Land Rover', array['Defender', 'Discovery', 'Discovery Sport', 'Freelander', 'LR2', 'LR3', 'LR4', 'Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque']),
    ('Lexus', array['CT', 'IS', 'ES', 'GS', 'LS', 'RC', 'LC', 'LBX', 'UX', 'NX', 'RX', 'RZ', 'TX', 'GX', 'LX', 'LM']),
    ('Lynk & Co', array['01', '02', '03', '05', '06', '07', '08', '09']),
    ('Mazda', array['Mazda2', 'Mazda3', 'Mazda5', 'Mazda6', '323', '626', 'Demio', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-60', 'CX-7', 'CX-8', 'CX-9', 'CX-90', 'MX-5', 'MX-30', 'RX-8', 'BT-50']),
    ('Mercedes-Benz', array['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'Maybach S-Class', 'CLA', 'CLE', 'CLK', 'CLS', 'SL', 'SLK', 'SLC', 'AMG GT', 'GLA', 'GLB', 'GLC', 'GLK', 'GLE', 'ML', 'GL', 'GLS', 'G-Class', 'X-Class', 'V-Class', 'Viano', 'Vito', 'Sprinter', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'EQV']),
    ('MG', array['MG3', 'MG4', 'MG5', 'MG6', 'MG7', '350', '360', '550', '750', 'GT', 'GS', 'ZS', 'ZS EV', 'HS', 'One', 'RX5', 'RX5 Plus', 'RX8', 'Marvel R', 'Whale', 'Cyberster']),
    ('Mini', array['Cooper', 'Cooper S', 'Cooper Electric', 'John Cooper Works', 'Convertible', 'Coupe', 'Roadster', 'Clubman', 'Countryman', 'Paceman', 'Aceman']),
    ('Mitsubishi', array['Colt', 'Mirage', 'Space Star', 'Attrage', 'Lancer', 'Lancer EX', 'Galant', 'Eclipse', 'Eclipse Cross', 'ASX', 'Xforce', 'Outlander', 'Outlander Sport', 'Pajero', 'Pajero Sport', 'Montero', 'Grandis', 'Xpander', 'Xpander Cross', 'L200', 'Triton']),
    ('Nissan', array['Micra', 'Note', 'Versa', 'Sunny', 'Sentra', 'Tiida', 'Almera', 'Bluebird', 'Primera', 'Altima', 'Maxima', 'Livina', 'Magnite', 'Juke', 'Kicks', 'Qashqai', 'X-Trail', 'Rogue', 'Murano', 'Pathfinder', 'Terra', 'Xterra', 'Patrol', 'Armada', 'Navara', 'Frontier', 'Pickup', 'Urvan', '350Z', '370Z', 'Z', 'GT-R', 'Leaf', 'Ariya']),
    ('Opel', array['Adam', 'Karl', 'Corsa', 'Kadett', 'Astra', 'Vectra', 'Insignia', 'Omega', 'Tigra', 'Cascada', 'Meriva', 'Zafira', 'Crossland', 'Mokka', 'Grandland', 'Antara', 'Frontera', 'Combo', 'Vivaro']),
    ('Peugeot', array['106', '107', '108', '205', '206', '207', '208', '2008', '301', '305', '306', '307', '308', '3008', '405', '406', '407', '408', '504', '505', '508', '5008', '605', '607', 'RCZ', 'Partner', 'Rifter', 'Expert', 'Traveller', 'Boxer', 'Landtrek']),
    ('Porsche', array['911', '718 Boxster', '718 Cayman', 'Boxster', 'Cayman', 'Panamera', 'Taycan', 'Macan', 'Cayenne', 'Carrera GT', '918 Spyder']),
    ('Proton', array['Saga', 'Persona', 'Gen-2', 'Waja', 'Wira', 'Preve', 'Iriz', 'Exora', 'S70', 'X50', 'X70', 'X90']),
    ('RAM', array['700', '1200', '1500', '2500', '3500', 'ProMaster']),
    ('Renault', array['5', '9', '11', '12', '19', 'Twingo', 'Kwid', 'Clio', 'Symbol', 'Logan', 'Taliant', 'Sandero', 'Sandero Stepway', 'Megane', 'Fluence', 'Laguna', 'Talisman', 'Scenic', 'Espace', 'Captur', 'Kardian', 'Duster', 'Arkana', 'Kadjar', 'Austral', 'Koleos', 'Oroch', 'Kangoo', 'Trafic', 'Master', 'Zoe']),
    ('Rox', array['01']),
    ('Seat', array['Mii', 'Ibiza', 'Cordoba', 'Leon', 'Toledo', 'Exeo', 'Altea', 'Arona', 'Ateca', 'Tarraco', 'Alhambra']),
    ('Skoda', array['Citigo', 'Felicia', 'Fabia', 'Rapid', 'Scala', 'Slavia', 'Octavia', 'Superb', 'Roomster', 'Yeti', 'Kushaq', 'Kamiq', 'Karoq', 'Kodiaq', 'Elroq', 'Enyaq']),
    ('Soeast', array['V3', 'V5', 'A5', 'DX3', 'DX5', 'DX7', 'S06', 'S07', 'S09']),
    ('SsangYong', array['Tivoli', 'XLV', 'Korando', 'Torres', 'Actyon', 'Kyron', 'Rexton', 'Musso', 'Rodius', 'Stavic', 'Chairman']),
    ('Subaru', array['Impreza', 'Legacy', 'Levorg', 'WRX', 'WRX STI', 'BRZ', 'XV', 'Crosstrek', 'Forester', 'Outback', 'Tribeca', 'Ascent', 'Solterra']),
    ('Suzuki', array['Alto', 'Maruti', 'Celerio', 'S-Presso', 'Wagon R', 'Splash', 'Ignis', 'Swift', 'Dzire', 'Baleno', 'Ciaz', 'Liana', 'Kizashi', 'SX4', 'S-Cross', 'Fronx', 'Vitara', 'Grand Vitara', 'Jimny', 'Ertiga', 'XL7', 'APV', 'Eeco', 'Carry', 'Van']),
    ('Toyota', array['Aygo', 'Starlet', 'Echo', 'Tercel', 'Yaris', 'Belta', 'Corolla', 'Corona', 'Cressida', 'Auris', 'Avensis', 'Camry', 'Avalon', 'Crown', 'Prius', 'Celica', 'MR2', '86', 'GR86', 'Supra', 'Raize', 'Rush', 'Urban Cruiser', 'Yaris Cross', 'C-HR', 'Corolla Cross', 'RAV4', 'Venza', 'Highlander', 'Fortuner', '4Runner', 'FJ Cruiser', 'Land Cruiser', 'Land Cruiser Prado', 'Sequoia', 'bZ4X', 'Hilux', 'Tacoma', 'Tundra', 'Avanza', 'Veloz', 'Innova', 'Sienna', 'Previa', 'Alphard', 'Hiace', 'Coaster']),
    ('Volkswagen', array['Up', 'Gol', 'Pointer', 'Parati', 'Polo', 'Virtus', 'Vento', 'Golf', 'Bora', 'Jetta', 'Beetle', 'Scirocco', 'Passat', 'CC', 'Arteon', 'Phaeton', 'T-Cross', 'Taigo', 'T-Roc', 'Tiguan', 'Touareg', 'Teramont', 'Atlas', 'Touran', 'Sharan', 'Caddy', 'Transporter', 'Multivan', 'Amarok', 'ID.3', 'ID.4', 'ID.5', 'ID.6', 'ID.7', 'ID. Buzz']),
    ('Volvo', array['240', '850', 'C30', 'C40', 'C70', 'S40', 'S60', 'S80', 'S90', 'V40', 'V60', 'V90', 'XC40', 'XC60', 'XC70', 'XC90', 'EX30', 'EX40', 'EX90']),
    ('XPeng', array['G3', 'G6', 'G7', 'G9', 'P5', 'P7', 'X9', 'Mona M03']),
    ('Zeekr', array['001', '007', '009', 'X', '7X'])
) as catalogue (make_name, models)
join public.car_makes mk
  on lower(mk.name) = lower(catalogue.make_name)
cross join lateral (
  select distinct unnest(catalogue.models) as name
) as model
where not exists (
  select 1
  from public.car_models existing
  where existing.make = mk.id
    and lower(existing.name) = lower(model.name)
);
