create extension pg_cron;
drop extension ltree;
create extension ltree;
create schema node;

grant connect on database node to nodeadmin;
grant usage on schema node to nodeadmin;
grant usage on schema users to nodeadmin;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA node 
TO nodeadmin;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA users 
TO nodeadmin;


drop type node.HandlingType;
create type node.HandlingType as enum ('auto', 'manual');
create type node.Environment as enum ('DEV', 'PROD');

drop table node.connections cascade;

create unlogged table node.connections (
	id uuid primary key,
	source_ip text,
	origin text,
	port int,
	handling node.HandlingType not null default 'auto',
	env text not null default 'PROD',
	endpoint text not null,
	schema text,
	storage_name text not null,
	created_at timestamp with time zone not null default now(),
	updated_at timestamp with time zone not null default now()
);



drop table node.intentions cascade;

create unlogged table node.intentions (
	id uuid primary key default gen_random_uuid(),
	storage_id uuid not null references node.connections (id) on delete cascade,
	input text not null,
	output text not null,
	title jsonb not null,
	created_at timestamp with time zone not null default now(),
	description jsonb not null,
	ondata text not null,
	interface jsonb,
	broadcast_path ltree generated always as (node.toltree(storage_id)) stored,
	key text generated always as (input || '-' || output) stored,
	reversed_key text generated always as (output || '-' || input) stored,
	unique (id, storage_id)
);

create index on node.intentions (storage_id);
create index on node.intentions using gist (broadcast_path);
 
create or replace function node.intention(r node.intentions)  RETURNS JSONB
AS $BODY$
	select jsonb_build_object(
					'id', r.id, 
					'input', r.input,
					'output', r.output,
					'title', r.title, 
					'description', r.description,
					'ondata', r.ondata,
					'broadcastPath', r.broadcast_path,
					'createTime', r.created_at,
					'storageId', r.storage_id,
					'key', r.key
				); 
$BODY$ 
LANGUAGE sql IMMUTABLE;

create or replace function node.toltree(t uuid) RETURNS ltree
AS $BODY$
	select replace(t::text, '-', '')::ltree;
$BODY$ 
LANGUAGE sql IMMUTABLE;


drop table node.accepting cascade;

create unlogged table node.accepting (
	owner_id uuid not null references node.intentions on delete cascade,
	intention_id uuid not null references node.intentions on delete cascade,
	created_at timestamp with time zone not null default now(),
	primary key(owner_id, intention_id)
);


drop table node.accepted cascade;

create unlogged table node.accepted (
	owner_id uuid not null references node.intentions on delete cascade,
	intention_id uuid not null references node.intentions on delete cascade,
	created_at timestamp with time zone not null default now(),
	primary key(owner_id, intention_id)
);

select * from node.connections;

drop view node.broadcast_ready;
create or replace view node.broadcast_ready as (
	select id, source_ip, origin, port, handling, env, endpoint, schema, storage_name, intentions
	from node.connections c
	inner join (
		select i.storage_id, array_agg(node.intention(i)) as intentions from node.intentions i
		left join (
			select intention_id from node.accepting
			union all
			select intention_id from node.accepted
		) a on (i.id = a.intention_id)	
		where a.intention_id is null
		group by storage_id
	) i on (i.storage_id = c.id)
);

select * from node.connections;
select * from node.intentions;


select c.storage_id as id, c.intention_id from (
	select c.id as storage_id, i.id as intention_id
	from node.connections c, node.intentions i 
	where index(i.broadcast_path, node.toltree(c.id)) = -1
) c
left join (
	select i.storage_id, i.id from node.intentions i
	inner join (
		select intention_id from node.accepting
		union all
		select intention_id from node.accepted
	) a on (i.id = a.intention_id)	
) a on (a.storage_id = c.storage_id and a.id = c.intention_id)
where a.storage_id is null






select id, storage_id, input, output, title, created_at, description, 
	   ondata, interface, broadcast_path, key, reversed_key
from node.intentions i
cross join node.intentions ri;


select * from node.users;

create schema users;
create table users.users (
	id uuid primary key default gen_random_uuid(),
	user_name text,
	email text,
	device_id uuid not null,
	voice_hash text not null
);

create unique index on users.users (user_name, device_id);

truncate table node.users;
select * from node.intentions;

select * from node.feedbacks order by create_time desc;

select * from node.feedbacks
where system_info-


CREATE TABLE users.authlogs (
	id serial4 NOT NULL,
	user_id uuid NOT NULL,
	system_id uuid NOT NULL,
	"result" float8 NULL,
	threshold float8 NULL,
	success_login bool NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT authlogs_pk PRIMARY KEY (id)
);

select u.user_name, u.email, al.* from node.authlogs al
inner join node.users u on al.user_id = u.id
order by created_at desc;


create index on users.authlogs (created_at desc);

select * from node.connections;
select * from node.intentions;

select gen_random_uuid();



