-- Uzbek Food Database — 20 ta boshlang'ich yozuv
INSERT INTO uzbek_foods (name_uz, name_ru, calories_per_100g, protein_g, carbs_g, fat_g, serving_size_g, category, aliases, verified) VALUES
('Osh (palov)',         'Плов',          180, 5.2, 25.0, 7.0,  350, 'main_dish', ARRAY['palov','plov','osh'], true),
('Shurpa',             'Шурпа',          65,  4.5,  5.0, 3.0,  400, 'soup',      ARRAY['shorpa','shorva'], true),
('Manti',              'Манты',          195, 9.8, 22.0, 8.0,  200, 'main_dish', ARRAY['manty'], true),
('Somsa (go''shtli)',  'Самса',          320, 11.0,32.0, 16.0, 120, 'snack',     ARRAY['samsa','somsa'], true),
('Non (oq)',           'Лепёшка',        270, 8.5, 53.0, 2.5,  100, 'bread',     ARRAY['lepyoshka','non'], true),
('Lag''mon',           'Лагман',         145, 6.0, 18.0, 5.5,  350, 'main_dish', ARRAY['lagmon','lagman'], true),
('Dimlama',            'Димлама',         95, 5.5,  8.0, 4.5,  300, 'main_dish', ARRAY['dimlama'], true),
('Kabob (mol go''shti)','Кабоб',         285, 22.0, 2.0, 21.0, 150, 'main_dish', ARRAY['kebab','kabob'], true),
('Tovuq shurva',       'Куриный бульон',  55, 5.8,  3.5, 2.0,  400, 'soup',      ARRAY['chicken shorwa','tovuq shorva'], true),
('Qozon kabob',        'Казан кабоб',    310, 20.0, 5.0, 24.0, 200, 'main_dish', ARRAY['qazon kabob'], true),
('Sho''rva (mol go''sht)','Шорпа говяжья',72, 7.2, 4.8, 2.8, 400, 'soup',      ARRAY['beef shorwa','mol shorva'], true),
('Mastava',            'Мастава',        120, 5.5, 14.0, 4.5,  350, 'soup',      ARRAY['mastava'], true),
('Chuchvara',          'Чучвара',        185, 8.5, 22.0, 7.0,  250, 'main_dish', ARRAY['chuchvara'], true),
('Norin',              'Норин',          195, 10.5,22.0, 7.5,  300, 'main_dish', ARRAY['norin'], true),
('Halim',              'Халим',          165, 11.0,18.0, 5.5,  300, 'main_dish', ARRAY['halim','haleem'], true),
('Tuxum (qaynatilgan)','Яйцо варёное',   155, 12.6, 1.1, 10.6,  60, 'protein',  ARRAY['egg','tuxum'], true),
('Tovuq go''shti (grilled)','Куриная грудка',165,31.0,0.0, 3.6, 150,'protein',  ARRAY['chicken breast','tovuq'], true),
('Limon suvi',         'Лимонад',         25, 0.2,  6.0, 0.0,  250, 'drink',     ARRAY['limonad','lemon water'], true),
('Qovoq oshi',         'Тыквенная каша', 135, 2.5, 28.0, 2.0,  300, 'main_dish', ARRAY['qovoq','pumpkin'], true),
('Yog''li non (tandirdan)','Самса слоёная',380,8.5,38.0,22.0, 100, 'snack',     ARRAY['tandir non','layered bread'], true)
ON CONFLICT DO NOTHING;
