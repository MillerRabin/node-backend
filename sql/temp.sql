drop type HandlingType;
create type HandlingType as enum ('auto', 'manual');



alter table node.connections add column handling HandlingType not null default 'auto';

create table node.connections (
	id text primary key,
	source_ip text,
	origin text,
	port int,
	handling HandlingType not null default 'auto',
	schema text,
	storage_id text not null,
	created_at timestamp with time zone not null default now()
);

alter table node.connections add column source_ip text;
alter table node.connections add column env Environment not null default 'PROD';

alter table node.connections drop env;

alter table node.connections add column storage_id text;


alter table node.connections drop column address;

create index on node.connections (storage_id);

create index on node.intentions (storage_id);

drop type IntentionType;

select * from node.connections 
order by created_at desc
limit 100;

truncate table node.connections;

drop table node.intentions cascade;

create table node.intentions (
	id uuid primary key default gen_random_uuid(),
	storage text references node.connections (id) on delete cascade,
	input text not null,
	output text not null,
	title jsonb not null,
	create_time timestamp with time zone not null default now(),
	description jsonb not null,
	ondata text not null,
	key text
);

alter table node.intentions add column create_time timestamp with time zone not null default now();

alter table node.intentions drop column accepted;
alter table node.intentions drop column accepting;

alter table node.intentions add column accepted jsonb;
alter table node.intentions add column accepting jsonb;


insert into node.intentions (input, output, title, description, ondata, interface)
values 
	('AuthService', 'Token', 
	'{ "en": "Provides auth service", "ru": "Сервис уатентификации"}',
	'{ "en": "Can register and login user by voice", "ru": "Могу зарегистрировать и авторизовать по голосу пользователя"}',
	'users.auth', '{ "register": { "result": "Token", "arguments": {"voiceData": "B64Audio", "deviceId": "uuid" }}, 
                     "login": { "result": "Token", "arguments": {"voiceData": "B64Audio", "deviceId": "uuid" } }}');

DROP VIEW accept_ready;

select * from node.intentions;



create or replace view node.accept_ready as ( 
	select 	source,
		case when target->>'id' is null then null else target end as target,
		storage_name
		from (
			select json_build_object(
					'id', lp.id, 
					'input', lp.input,
					'output', lp.output,
					'title', lp.title, 
					'description', lp.description,
					'ondata', lp.ondata,
					'type', case when lp.storage_id is null then 'Intention' else 'NetworkIntention' end,
					'createTime', lp.create_time,
					'storageId', lp.storage_id
				) as source, 
				json_build_object(
					'id', rp.id, 
					'input', rp.input,
					'output', rp.output,
					'title', rp.title, 
					'description', rp.description,
					'ondata', rp.ondata,
					'type', case when rp.storage_id is null then 'Intention' else 'NetworkIntention' end,
					'createTime', rp.create_time,
					'storageId', rp.storage_id			
				) as target,
				rp.storage_name
			from (
				select id, storage_id, title, description, input, output, ondata, create_time, reversed_key
				from node.intentions
				where storage_id is null
			) lp
			left join ( 
				select  rp.id, rp.storage_id, rp.title, rp.description, rp.input, rp.output, rp.ondata, rp.create_time, rp.key, conn.storage_id as storage_name
				from node.intentions rp
				inner join node.connections conn on (conn.id = rp.storage_id)				
			) rp on ( rp.key = lp.reversed_key )
		) t
);

select * from node.accept_ready;

delete from node.connections where storage_id = 'speakease-dev';



drop table node.accepting;
drop table node.accepted;

select * from node.intentions;

select * from node.connections;


select 	source,
		case when target->>'id' is null then null else target end as target,
		storage_name
		from (
			select json_build_object(
					'id', lp.id, 
					'input', lp.input,
					'output', lp.output,
					'title', lp.title, 
					'description', lp.description,
					'ondata', lp.ondata,
					'type', case when lp.storage_id is null then 'Intention' else 'NetworkIntention' end,
					'createTime', lp.create_time,
					'storageId', lp.storage_id
				) as source, 
				json_build_object(
					'id', rp.id, 
					'input', rp.input,
					'output', rp.output,
					'title', rp.title, 
					'description', rp.description,
					'ondata', rp.ondata,
					'type', case when rp.storage_id is null then 'Intention' else 'NetworkIntention' end,
					'createTime', rp.create_time,
					'storageId', rp.storage_id			
				) as target,
				rp.storage_name
			from (
				select id, storage_id, title, description, input, output, ondata, create_time, reversed_key
				from node.intentions
				where storage_id is null
			) lp
			left join ( 
				select  rp.id, rp.storage_id, rp.title, rp.description, rp.input, rp.output, rp.ondata, rp.create_time, rp.key, conn.storage_id as storage_name
				from node.intentions rp
				inner join node.connections conn on (conn.id = rp.storage_id)				
			) rp on ( rp.key = lp.reversed_key )
		) t

drop view node.broadcast_ready;
create or replace view node.broadcast_ready as (
	select c.id, c.storage_id as storage_name from node.intentions i
	inner join (
		select intention_id from node.accepting
		union all
		select intention_id from node.accepted
	) a on (i.id = a.intention_id)
	right join node.connections c on (c.id = i.storage_id)
	where i.storage_id is null
)

select c.id, c.storage_id as storage_name from node.intentions i
	inner join (
		select intention_id from node.accepting
		union all
		select intention_id from node.accepted
	) a on (i.id = a.intention_id)
	right join node.connections c on (c.id = i.storage_id)
	where i.storage_id is null
 
select c.id 
from node.connections c
inner join (
	select i.id, i.input, i.output, i.title, i.description, i.ondata, i.storage_id, c.storage_id as storage_name, i.create_time from (
		select owner_id, intention_id from node.accepting
		union all
		select owner_id, intention_id from node.accepted
	) s
	inner join node.intentions i on (s.intention_id = i.id)
	inner join node.connections c on (c.id = i.storage_id)
) a on (i.id = a.intention_id)
where c.storage_id = 'local-mr' and a.storage_name = 'local-mr';


select i.id, i.input, i.output, i.title, i.description, i.ondata, i.storage_id, c.storage_id as storage_name, i.create_time 
from node.intentions i
left join node.connections c on (c.id = i.storage_id)
left join (
	
) a on (a.owner_id = i.id)

select s.*, t.* from (
	select owner_id, intention_id from node.accepting
	union all
	select owner_id, intention_id from node.accepted
) a
inner join node.intentions s on (s.id = a.owner_id)
inner join node.intentions t on (t.id = a.intention_id)




select owner_id, intention_id from node.accepting
		union all
		select owner_id, intention_id from node.accepted
	) s
	inner join node.intentions i on (s.intention_id = i.id)
	inner join node.connections c on (c.id = i.storage_id)


select  c.id
	from node.accepted a
	inner join node.intentions i on (i.id = a.intention_id)
	inner join node.connections c on (c.id = i.storage_id)	 


select * from node.connections;

select count(*) from node.connections;

select * from node.intentions i
cross join node.connections c
where i.storage_id is null;

)
where c.storage_id = 'local-mr';

explain analyze
select * from (
	select i.connection_id, i.connection_storage_id, 
			array_agg(json_build_object(
				'id', i.id, 
				'input', i.input,
				'output', i.output,
				'title', i.title, 
				'description', i.description,
				'ondata', i.ondata,
				'type', case when i.storage_id is null then 'Intention' else 'NetworkIntention' end,
				'createTime', i.create_time,
				'storageId', i.storage_id
			)) as intentions
	from (
		select c.id as connection_id, c.storage_id as connection_storage_id, i.id, i.input, i.output, i.title, i.description, i.ondata, i.storage_id, i.create_time
		from node.intentions i
		cross join node.connections c
		where i.storage_id is null
	) i
	left join (
		select i.id, t.connected_to, t.storage_name
		from node.intentions i
		inner join (
			select a.owner_id as id, c.id as connected_to, c.storage_id as storage_name from (
				select owner_id, intention_id from node.accepting
				union all
				select owner_id, intention_id from node.accepted
			) a
			inner join node.intentions t on (t.id = a.intention_id)
			inner join node.connections c on (c.id = t.storage_id)
			where t.storage_id is not null
		) t on (t.id = i.id)
	) t on (t.connected_to = i.connection_id)
	where t.connected_to is null
	group by i.connection_id, i.connection_storage_id
) i
where  i.connection_storage_id = 'local-mr'


select * from node.users;

alter table node.users add column user_name text not null;
alter table node.users add column email text;
alter table node.users alter column device_id set not null;
alter table node.users alter column voice_hash set not null;

select count(*) from node.connections;
create unique index on node.users (user_name, device_id);

truncate table node.users;
select * from node.users;

select * from node.feedbacks order by create_time desc;

select * from node.feedbacks
where system_info-


CREATE TABLE node.authlogs (
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


create index on node.authlogs (created_at desc);



