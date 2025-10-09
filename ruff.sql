

create table sys_event_domain (
	id serial primary key not null,
	name text,
	last_update timestamp, 
	update_by uuid references auth.users(id) 
)


select *from sys_event_domain;



create table sys_event_type (
	id serial primary key not null,
	name text,
	last_update timestamp, 
	update_by uuid references auth.users(id) 
);

insert into sys_event_type (name) values ('Show');
insert into sys_event_type (name) values ('Exhibition');

select *from sys_event_type;



create table sys_event_edition (
	id serial primary key not null,
	name text,
	last_update timestamp, 
	update_by uuid references auth.users(id) 
);

insert into sys_event_edition (name) values ('Festival');
insert into sys_event_edition (name) values ('Saison');

select *from sys_event_edition;



create table event_edition (
	id serial primary key not null,
	name text,
	year text,
	id_edition_type int references sys_event_edition(id),
	created_on timestamp default current_timestamp,
	created_by uuid references auth.users(id),
	last_update timestamp, 
	update_by uuid references auth.users(id) 
);

INSERT INTO event_edition (name, year, id_edition_type) VALUES
('Festival Automne', '2018', 1),
('Festival Automne', '2020', 1),
('Festival été', '2019', 1),
('Festival hiver', '2020', 1),
('Festival printemps', '2017', 1),
('Festival printemps', '2018', 1),
('Festival printemps', '2019', 1),
('Festival printemps', '2021', 1),
('Festival printemps', '2022', 1),
('Festival printemps', '2024', 1),
('Festival printemps', '2025', 1),
('Saison', '2022', 1),
('Saison', '2023', 1),
('Saison', '2025', 1);


select *from event_edition;

ALTER TABLE public.events
DROP CONSTRAINT IF EXISTS events_id_edition_fkey;

-- 2. Add the new foreign key referencing event_edition(id)
ALTER TABLE public.events
ADD CONSTRAINT events_id_edition_fkey
FOREIGN KEY (id_edition) REFERENCES public.event_edition(id);


select *from sys_event_edition
create table events(
	id serial primary key not null,
	title text,
	id_edition int references sys_event_edition(id),
	id_event_domain int references sys_event_domain(id),
	id_event_type int references sys_event_type(id),
	teaser text,
	long_teaser text,
	id_host int references public.hosts(id),
	description text,
	booking_url text,
	photo text,
	credit_photo text,
	is_active bool default false,
	created_by uuid,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	last_update timestamp,
	updated_by uuid NULL
);

create table location(
	
	
)

-- public.hosts definition

-- Drop table

-- DROP TABLE public.hosts;

create table sys_host_types (
	id serial primary key not null,
	name text,
	last_update timestamp, 
	update_by uuid references auth.users(id) 
);

insert into sys_host_types (name) values ('Association');
insert into sys_host_types (name) values ('Particular');
insert into sys_host_types (name) values ('Enterprise');


CREATE TABLE public.hosts (
	id serial not null primary key,
	name text NULL,
	address text NULL,
	city text NULL,
	proviance text NULL,
	zip text NULL,
	country text NULL,
	host_per_year text NULL,
	public_name text NULL,
	capacity int4 NULL,
	id_host_type int4 null references sys_host_types(id),
	contact_fname text NULL,
	contact_lname text NULL,
	contact_phone1 text NULL,
	contact_phone2 text NULL,
	contact_email text NULL,
	comment text NULL,
	web_url text NULL,
	photo text null,
	photo_credit text,
	created_by uuid,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	last_update timestamp,
	updated_by uuid NULL
);

select *from hosts;


INSERT INTO public.hosts (
    id,
    name,
    address,
    city,
    proviance,
    zip,
    country,
    host_per_year,
    public_name,
    capacity,
    id_host_type,
    contact_fname,
    contact_lname,
    contact_phone1,
    contact_phone2,
    contact_email,
    comment,
    web_url,
    photo,
    photo_credit,
    created_by,
    created_on,
    last_update,
    updated_by
) VALUES (
    1,
    'Pont Ar Gler',
    '23 rue Saint Vincent de Paul',
    'paris',
    'paris',
    '75010',
    'france',
    '10+',
    'Pont Ar Gler',
    50,
    1,
    'Véronique',
    'Gauidrat',
    '+33 (0) 6 14 38 63 38',
    '+33 (0) 6 14 38 63 38',
    'véronique.gaudrat@wanadoo.fr',
    NULL,
    'pontargler.com',
    'https://pekaexfrnhysdntbyqbl.supabase.co/storage/v1/object/public/hosts/116ad27e-45bd-48d7-a2f7-096f8418ea65/logo-1755595672712.jpg',
    NULL,
    NULL,
    '2025-08-06 20:52:16.872',
    '2025-08-19 09:27:53.811',
    NULL
);




CREATE TABLE public.locations (
    id serial PRIMARY KEY NOT NULL,
    id_host int references hosts(id),
    name text,
    address text,
    lat text,
    long text,
    description text,
    public text,
    public_description text,
    restricted_description text,
    capacity text,
    city text,
    country text,
    zip text,
    phone text,
    email text,
    website text,
    is_active boolean,
    created_by uuid,
    created_on timestamp DEFAULT current_timestamp,
    last_update timestamp,
    updated_by uuid
);





INSERT INTO public.locations (
    id, id_host, name, address, lat, long, description, public, public_description, 
    restricted_description, capacity, city, country, zip, phone, email, website, 
    is_active, created_by, created_on, updated_by, last_update
) VALUES
(1, 1, 'Atelier du Manoir de Pont Ar Gler', '1 chemin de Pont AR Gler', NULL, NULL, 'Accès par le Chemin de St Julien dans ST Jean du Doigt\nAprès le camping de Pont Ar Gler', 'ALL', 'Accès par le Chemin de St Julien dans ST Jean du Doigt\nAprès le camping de Pont Ar Gler', 'Piano Erard de 1908 en bon état mais au toucher spécifique', '50', 'Plougasnou', NULL, '29630', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(2, 1, 'Jardin du Manoir de Pont Ar Gler', '1 chemin de Pont AR Gler', NULL, NULL, NULL, 'ALL', NULL, NULL, '50', 'Plougasnou', NULL, '29630', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(3, 1, 'Salle Municipale de Plougasnou', 'Route de Primer', NULL, NULL, NULL, 'ALL', NULL, NULL, '250', 'Plougasnou', NULL, '29630', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(4, 1, 'Ar Presbital', 'Rue de L’Église', NULL, NULL, NULL, 'ALL', NULL, NULL, '80', 'Locquirec', NULL, NULL, NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(5, 1, 'Salle Kasino', 'Cote de Pen ar Chra', NULL, NULL, NULL, 'ALL', NULL, NULL, '200', 'Saint Jean du Doigt', NULL, '29630', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(6, 1, 'Église de Locquirec', 'Rue de L’Église', NULL, NULL, NULL, 'ALL', NULL, NULL, '180', 'Locquirec', NULL, NULL, NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(7, 1, 'Église de Plougasnou', NULL, NULL, NULL, NULL, 'ALL', NULL, NULL, '150', 'Plougasnou', NULL, '29630', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(8, 1, 'Église de Saint Jean Du Doigt', NULL, NULL, NULL, NULL, 'ALL', NULL, NULL, '200', 'Saint Jean du Doigt', NULL, '29600', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(9, 1, 'Église de Ploujean', NULL, NULL, NULL, NULL, 'ALL', NULL, NULL, '100', 'Ploujean', NULL, '29600', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(10, 1, 'Médiathèque Plouigneau', '6988 Pl. de Coatanlem', NULL, NULL, 'Médiathèque de Plouigneau en face de la mairie', 'ALL', 'Médiathèque de Plouigneau en face de la mairie', NULL, '50', 'Plouigneau', NULL, '29610', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(11, 1, 'Atelier des Godard', '5 rue Cassini', NULL, NULL, NULL, 'Restricted', NULL, 'Atelier du peintre Laurens, 2 piano sà queue', '70', 'Paris', NULL, '75014', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(12, 1, 'Cinéma le Douron', NULL, NULL, NULL, 'Cinéma Le Douron', 'ALL', 'Cinéma Le Douron', NULL, '110', 'Plestin les grèves', NULL, NULL, NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(13, 1, 'Collection de voitures anciennes', NULL, NULL, NULL, 'Hangar contenant la collection de voitures de courses anciennes de Patrick Peter. Situé sur la Côte sauvage de Saint Jean du Doigt dans le hameau de Kerdrein', 'ALL', 'Hangar contenant la collection de voitures de courses anciennes de Patrick Peter. Situé sur la Côte sauvage de Saint Jean du Doigt dans le hameau de Kerdrein', 'Ecellente accoutique avec un piano droit de bonne qualité', '100', 'Saint Jean du Doigt', NULL, '29630', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(14, 1, 'Chez les Oriez', '22, rue Frédéric Clavel', NULL, NULL, NULL, 'NO', NULL, 'Piano à queue', '30', 'Suresnes', NULL, '92073', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(15, 1, 'Chez les Godard', '5 rue Cassini', NULL, NULL, NULL, 'NO', NULL, 'Atelier du peintre Laurens, 2 piano sà queue', '70', 'Paris', NULL, '75014', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(16, 1, NULL, NULL, NULL, NULL, NULL, 'NO', NULL, NULL, '25', 'Paris', NULL, '75017', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(17, 1, NULL, '17 rue de l’Espérance', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Villeneuve sur Yonne', NULL, '89500', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(18, 1, 'Atelier Barthel-Gande salle', '60 Rue de Rome', NULL, NULL, NULL, NULL, NULL, 'Atelier du luthier', '30', 'Paris', NULL, '75008', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(19, 1, 'Atelier Barthel-Petite Salle', '60 Rue de Rome', NULL, NULL, NULL, NULL, NULL, 'Salle en sous sol avec un piano', '12', 'Paris', NULL, '75008', NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL),
(20, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Salon avec un piano', '25', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, CURRENT_TIMESTAMP, NULL, NULL);




create table event_dates (
	id serial primary key not null,
	id_event int references events(id),
	id_location int references locations(id),
	flag text,
	start_date date,
	end_date date,
	time time, 
	created_on timestamp default current_timestamp,
	created_by uuid,
	last_update timestamp,
	updated_by uuid	
)


select *from event_dates

INSERT INTO public.events (
    id, title, id_edition, id_event_domain, id_event_type, teaser, long_teaser, 
    id_host, description, booking_url, photo, credit_photo, is_active, 
    created_by, created_on, updated_by, last_update
) VALUES
(
    231, 
    'Le Jazz s’invite à Pont Ar Gler', 
    8, 
    2, 
    1, 
    'Le trio interprétera des morceaux de leur composition ainsi que des standards post Bebop de compositeurs tels que Sonny Rollins, Thelonious Monk ou John Coltrane.', 
    NULL, 
    1, 
    NULL, 
    NULL, 
    NULL, 
    NULL, 
    FALSE, 
    NULL, 
    CURRENT_TIMESTAMP, 
    NULL, 
    NULL
);

select *from sys_event_edition;






 



















-- public.artist_instruments definition

-- Drop table

-- DROP TABLE public.artist_instruments;

CREATE TABLE public.artist_instruments (
	id serial4 NOT null primary key,
	id_artist uuid NULL,
	id_instrument int4 NULL,
	created_by uuid NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	last_update timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_by uuid NULL
);

-- public.artist_media definition

-- Drop table

-- DROP TABLE public.artist_media;

CREATE TABLE public.artist_media (
	id serial4 NOT NULL,
	id_media int4 NULL,
	id_artist uuid NULL,
	title text NULL,
	image text NULL,
	description text NULL,
	url text NULL,
	created_by uuid NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	last_update timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_by uuid NULL
);



-- public.artist_performance definition

-- Drop table

-- DROP TABLE public.artist_performance;

CREATE TABLE public.artist_performance (
	id serial4 NOT NULL,
	id_artist uuid NULL,
	id_performance uuid NULL,
	created_by uuid NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	last_update timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_by uuid NULL
);



-- public.artist_requirement definition

-- Drop table

-- DROP TABLE public.artist_requirement;

CREATE TABLE public.artist_requirement (
	id serial4 NOT NULL,
	id_artist uuid NOT NULL,
	rib text NULL,
	guso_nb text NULL,
	security_nb text NULL,
	arlergies text NULL,
	food_restriction text NULL,
	requirement text NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid NULL,
	updated_by uuid NULL,
	last_updated_on timestamp NULL,
	CONSTRAINT artist_requirement_pkey PRIMARY KEY (id)
);


-- public.artist_requirement foreign keys

ALTER TABLE public.artist_requirement ADD CONSTRAINT artist_requirement_id_artist_fkey FOREIGN KEY (id_artist) REFERENCES public.artists(id);



-- public.artist_requirement definition

-- Drop table

-- DROP TABLE public.artist_requirement;

CREATE TABLE public.artist_requirement (
	id serial4 NOT NULL,
	id_artist uuid NOT NULL,
	rib text NULL,
	guso_nb text NULL,
	security_nb text NULL,
	arlergies text NULL,
	food_restriction text NULL,
	requirement text NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid NULL,
	last_updated timestamp NULL,
	updated_by uuid NULL,
	CONSTRAINT artist_requirement_pkey PRIMARY KEY (id)
);


-- public.artist_requirement foreign keys

ALTER TABLE public.artist_requirement ADD CONSTRAINT artist_requirement_id_artist_fkey FOREIGN KEY (id_artist) REFERENCES public.artists(id);


-- public.artist_timeoff definition

-- Drop table

-- DROP TABLE public.artist_timeoff;

CREATE TABLE public.artist_availability (
	id serial4 NOT NULL,
	id_artist uuid NULL,
	start_date date NULL,
	end_data date NULL,
	notes text NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid NULL,
	
	last_updated timestamp NULL,
	updated_by uuid NULL,
	CONSTRAINT artist_timeoff_pkey PRIMARY KEY (id)
);


-- public.artist_timeoff foreign keys

ALTER TABLE public.artist_timeoff ADD CONSTRAINT artist_timeoff_id_artist_fkey FOREIGN KEY (id_artist) REFERENCES public.artists(id);






CREATE TABLE public.artists (
    id serial PRIMARY KEY NOT NULL,
    id_profile uuid REFERENCES auth.users(id),
    fname text,
    lname text,
    title text,
    teaser text,
    short_bio text,
    long_bio text,
    dob date,
    pob text,
    email text,
    phone text,
    website text,
    address text,
    city text,
    country text,
    gender text,
    photo text,
    credit_photo text,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT false,
    cover text,
    credit_cover text,
    created_on timestamp DEFAULT current_timestamp,
    created_by uuid,
    updated_by uuid,
    last_update timestamp
);


-- public.event_artists definition

-- Drop table

-- DROP TABLE public.event_artists;

CREATE TABLE public.event_artists (
	id serial4 NOT NULL,
	id_event int4 references events(id),
	id_artist int4 references artists(id),
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid null ,
	updated_by uuid NULL,
	last_update timestamp NULL
);

select *from event_instruments

-- public.event_instruments definition

-- Drop table

-- DROP TABLE public.event_instruments;

CREATE TABLE public.event_instruments (
	id serial4 NOT NULL,
	id_instrument int4 references sys_instruments(id),
	id_event int4 references events(id) NULL,
	id_artist int references artists(id) NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid NULL,
	updated_by uuid NULL,
	last_update timestamp DEFAULT CURRENT_TIMESTAMP NULL
);




CREATE TABLE public.sys_instruments (
    id serial PRIMARY KEY,
    name text NOT NULL,
    color text
);

INSERT INTO public.sys_instruments (id, name, color) VALUES
(1, 'accordéon', 'zinc'),
(2, 'alto', 'blue'),
(3, 'céramiste', 'violet'),
(4, 'chant', 'gray'),
(5, 'charengo', 'slate'),
(6, 'cinéaste', 'violet'),
(7, 'clarinette', 'gray'),
(8, 'clown', 'zinc'),
(9, 'comédien', 'indigo'),
(10, 'compositeur', 'green'),
(11, 'conteur', 'blue'),
(12, 'contrebasse', 'green'),
(13, 'cristal Baschet', 'neutral'),
(14, 'écrivainpoète', 'pink'),
(15, 'ensemble', 'purple'),
(16, 'flûte', 'amber'),
(17, 'graphiste', 'violet'),
(18, 'graveur', 'amber'),
(19, 'guitare', 'slate'),
(20, 'harpe', 'black'),
(21, 'mezzo-soprano', 'cyan'),
(22, 'orgue', 'blue'),
(23, 'peintre', 'slate'),
(24, 'percussion', 'rose'),
(25, 'photographe', 'zinc'),
(26, 'piano', 'neutral'),
(27, 'plasticien', 'fuchsia'),
(28, 'plasticienne', 'rose'),
(29, 'poète', 'violet'),
(30, 'saxophones', 'pink'),
(31, 'sculpteur', 'fuchsia'),
(32, 'soprano', 'fuchsia'),
(33, 'violon', 'violet'),
(34, 'violoncelle', 'sky'),
(35, 'Violoncelliste', 'purple'),
(36, 'voix', 'teal'),
(37, 'écrivain', 'amber'),
(38, 'saxophione', 'lime'),
(39, 'papier', 'rose'),
(40, 'espace-urbain', 'cyan'),
(41, 'murs', 'purple'),
(42, 'chanteuse', 'teal'),
(43, 'dessinateur', 'black'),
(44, 'scénographe', 'emerald');


-- public.event_media definition

-- Drop table

-- DROP TABLE public.event_media;

create table sys_media_type (id serial primary key, name text);
insert into sys_media_type (name) values ('cd');
insert into sys_media_type (name) values ('video');

CREATE TABLE public.event_media (
	id serial4 NOT NULL,
	id_media_type int4 references sys_media_type(id) null,
	id_event int4 references events(id) NULL,
	title text NULL,
	image text NULL,
	description text NULL,
	url text NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid NULL,
	updated_by uuid NULL,
	last_update timestamp DEFAULT CURRENT_TIMESTAMP NULL
);

-- public.location_amenity definition

-- Drop table

-- DROP TABLE public.location_amenity;

-- public.sys_location_amenity definition

-- Drop table

-- DROP TABLE public.sys_location_amenity;

CREATE TABLE public.sys_location_amenity (
	id serial4 NOT null primary key,
	"name" text null,
	created_by uuid,
	created_on timestamp default current_timestamp,
	last_update timestamp,
	updated_by uuid
);


INSERT INTO public.sys_location_amenity (id,"name") VALUES
	 (1,'Piano'),
	 (2,'Dressing Rooms'),
	 (3,'Catering Kitchen'),
	 (4,'Parking'),
	 (5,'Public Transport'),
	 (6,'Bar Service');




CREATE TABLE public.location_amenity (
	id serial4 NOT NULL,
	id_location int4 references locations (id) NULL,
	id_amenity int4 references sys_location_amenity(id) NULL,
	created_by uuid NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP null,
	last_update timestamp,
	updated_by uuid
);




-- public.location_images definition

-- Drop table

-- DROP TABLE public.location_images;

CREATE TABLE public.location_images (
	id serial4 NOT null primary key,
	id_location int4 references locations(id) NULL,
	url text NULL,
	created_by uuid NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP null,
	last_update timestamp,
	updated_by uuid
);

-- public.sys_location_specs definition

-- Drop table

-- DROP TABLE public.sys_location_specs;

CREATE TABLE public.sys_location_specs (
	id serial4 NOT null primary key,
	"name" text null,
	created_by uuid,
	created_on timestamp default current_timestamp,
	last_update timestamp,
	updated_by uuid
);


INSERT INTO public.sys_location_specs (id,"name") VALUES
	 (1,'historic'),
	 (2,'indoor'),
	 (3,'parking available'),
	 (4,'countryside'),
	 (5,'city center'),
	 (6,'accessible');


-- public.location_specs definition

-- Drop table

-- DROP TABLE public.location_specs;

CREATE TABLE public.location_specs (
	id serial4 NOT NULL,
	id_location int4 references locations(id) NULL,
	id_specs int4 references sys_location_specs(id) NULL,
	created_by uuid NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP null,
	last_update timestamp,
	updated_by uuid
);

-- public.location_types definition

-- Drop table

-- DROP TABLE public.location_types;

CREATE TABLE public.location_types (
	id serial4 NOT NULL,
	id_location int4 references locations(id) NULL,
	id_location_type int4 references sys_location_types(id) NULL,
	created_by uuid NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP null,
	last_update timestamp,
	updated_by uuid
);

-- public.sys_location_types definition

-- Drop table

-- DROP TABLE public.sys_location_types;

CREATE TABLE public.sys_location_types (
	id serial4 NOT null primary key,
	"name" text null,
	created_by uuid NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP null,
	last_update timestamp,
	updated_by uuid
);


INSERT INTO public.sys_location_types (id,"name") VALUES
	 (1,'church'),
	 (2,'outdoor'),
	 (3,'chapel'),
	 (4,'historic monument');


	-- public.artist_request definition

-- Drop table

-- DROP TABLE public.artist_request;

CREATE TABLE public.artist_request (
	id serial4 NOT null primary key,
	id_artist int references artists(id) NULL,
	id_req_type int4 references sys_request_type(id) NULL,
	title text NULL,
	short_desc text NULL,
	long_desc text NULL,
	id_host int references hosts(id)  NULL,
	status int4 DEFAULT 1 NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	comment text NULL,
	last_update timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_by uuid NULL
);


-- public.sys_request_type definition

-- Drop table

-- DROP TABLE public.sys_request_type;

CREATE TABLE public.sys_request_type (
	id serial4 NOT null primary key,
	"name" text null,
	created_by uuid NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP null,
	last_update timestamp,
	updated_by uuid
);

INSERT INTO public.sys_request_type (id,"name") VALUES
	 (1,'concert'),
	 (2,'exhibition');


	
	
-- public.artist_request_media definition

-- Drop table

-- DROP TABLE public.artist_request_media;

CREATE TABLE public.artist_request_media (
	id serial4 NOT null primary key,
	id_media_type int4 references sys_media_type(id) NULL,
	id_request int4 references artist_request(id) NULL,
	title text NULL,
	image text NULL,
	description text NULL,
	created_by uuid NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	last_update timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_by uuid NULL,
	id_auth uuid NULL,
	url text NULL
);	
	
	
-- public.user_roles definition

-- Drop table

-- DROP TABLE public.user_roles;

CREATE TABLE public.user_roles (
	id serial NOT NULL,
	"name" text NULL,
	CONSTRAINT user_roles_pkey PRIMARY KEY (id)
);

INSERT INTO public.user_roles ("name") VALUES
	 ('admin'),
	 ('host'),
	 ('artist');

-- public.user_profile definition

-- Drop table

-- DROP TABLE public.user_profile;

CREATE TABLE public.user_profile (
	id serial NOT NULL,
	id_user uuid NULL,
	id_role int references user_roles(id)  NULL,
	first_name text NULL,
	last_name text NULL,
	email text NULL,
	phone text NULL,
	city text NULL,
	proviance text NULL,
	country text NULL,
	created_at timestamptz DEFAULT timezone('utc'::text, now()) NULL,
	created_by uuid NULL,
	last_update timestamptz DEFAULT timezone('utc'::text, now()) NULL,
	updated_by uuid NULL,
	id_active bool DEFAULT true,
	CONSTRAINT user_profile_pkey PRIMARY KEY (id)
);


-- public.user_profile foreign keys

ALTER TABLE public.user_profile ADD CONSTRAINT user_profile_id_role_fkey FOREIGN KEY (id_role) REFERENCES public.user_roles(id);
ALTER TABLE public.user_profile ADD CONSTRAINT user_profile_id_user_fkey FOREIGN KEY (id_user) REFERENCES auth.users(id);



	
	
	
	
	
