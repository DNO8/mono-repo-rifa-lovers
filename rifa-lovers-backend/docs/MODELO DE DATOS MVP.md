**MODELO DE DATOS MVP**

\-- \=========================================  
\-- EXTENSIONS  
\-- \=========================================  
create extension if not exists "uuid-ossp";  
create extension if not exists "pgcrypto";

\-- \=========================================  
\-- ENUMS  
\-- \=========================================  
create type user\_role as enum ('admin','operator','customer');  
create type user\_status as enum ('active','blocked');

create type raffle\_status as enum (  
'draft','active','sold\_out','closed','drawn'  
);

create type purchase\_status as enum (  
'pending','paid','failed','refunded'  
);

create type payment\_status as enum (  
'created','pending','approved','rejected'  
);

create type prize\_type as enum ('milestone','flash');

create type lucky\_pass\_status as enum ('active','used','winner');

\-- \=========================================  
\-- ORGANIZATIONS  
\-- \=========================================  
create table organizations (  
id uuid primary key default uuid\_generate\_v4(),  
name varchar(200) not null,  
slug varchar(200) unique not null,  
created\_at timestamp default now(),  
updated\_at timestamp default now()  
);

\-- \=========================================  
\-- USERS  
\-- \=========================================  
create table users (  
id uuid primary key references auth.users(id),  
organization\_id uuid references organizations(id),  
email varchar(255),  
first\_name varchar(120),  
last\_name varchar(120),  
role user\_role default 'customer',  
status user\_status default 'active',  
created\_at timestamp default now(),  
updated\_at timestamp default now()  
);

\-- \=========================================  
\-- RAFFLES  
\-- \=========================================  
create table raffles (  
id uuid primary key default uuid\_generate\_v4(),  
organization\_id uuid references organizations(id),  
title varchar(255),  
description text,  
goal\_packs integer default 5000,  
status raffle\_status default 'draft',  
start\_date timestamp,  
end\_date timestamp,  
created\_at timestamp default now(),  
updated\_at timestamp default now()  
);

\-- \=========================================  
\-- PACKS  
\-- \=========================================  
create table packs (  
id uuid primary key default uuid\_generate\_v4(),  
name varchar(100),  
price numeric(10,2),  
lucky\_pass\_quantity integer,  
is\_featured boolean default false,  
is\_pre\_sale boolean default false,  
created\_at timestamp default now()  
);

\-- \=========================================  
\-- PURCHASES  
\-- \=========================================  
create table purchases (  
id uuid primary key default uuid\_generate\_v4(),  
raffle\_id uuid references raffles(id),  
user\_id uuid references users(id),  
total\_amount numeric(12,2),  
status purchase\_status default 'pending',  
created\_at timestamp default now(),  
paid\_at timestamp  
);

\-- \=========================================  
\-- USER PACKS  
\-- \=========================================  
create table user\_packs (  
id uuid primary key default uuid\_generate\_v4(),  
user\_id uuid references users(id),  
raffle\_id uuid references raffles(id),  
pack\_id uuid references packs(id),  
purchase\_id uuid references purchases(id),  
quantity integer default 1,  
total\_paid numeric(10,2),  
created\_at timestamp default now()  
);

\-- \=========================================  
\-- LUCKY PASS  
\-- \=========================================  
create table lucky\_passes (  
id uuid primary key default uuid\_generate\_v4(),  
raffle\_id uuid references raffles(id),  
user\_id uuid references users(id),  
user\_pack\_id uuid references user\_packs(id),  
status lucky\_pass\_status default 'active',  
is\_winner boolean default false,  
created\_at timestamp default now()  
);

create index idx\_lucky\_raffle on lucky\_passes(raffle\_id);  
create index idx\_lucky\_user on lucky\_passes(user\_id);

\-- \=========================================  
\-- MILESTONES  
\-- \=========================================  
create table milestones (  
id uuid primary key default uuid\_generate\_v4(),  
raffle\_id uuid references raffles(id),  
name varchar(150),  
required\_packs integer,  
sort\_order integer,  
is\_unlocked boolean default false,  
unlocked\_at timestamp,  
created\_at timestamp default now()  
);

\-- \=========================================  
\-- PRIZES  
\-- \=========================================  
create table prizes (  
id uuid primary key default uuid\_generate\_v4(),  
raffle\_id uuid references raffles(id),  
milestone\_id uuid references milestones(id),  
type prize\_type,  
name varchar(255),  
description text,  
value\_estimated numeric(12,2),  
quantity integer default 1,  
created\_at timestamp default now()  
);

\-- \=========================================  
\-- WINNERS  
\-- \=========================================  
create table prize\_winners (  
id uuid primary key default uuid\_generate\_v4(),  
prize\_id uuid references prizes(id),  
lucky\_pass\_id uuid references lucky\_passes(id),  
user\_id uuid references users(id),  
created\_at timestamp default now()  
);

\-- \=========================================  
\-- PROGRESS  
\-- \=========================================  
create table raffle\_progress (  
id uuid primary key default uuid\_generate\_v4(),  
raffle\_id uuid unique references raffles(id),  
packs\_sold integer default 0,  
revenue\_total numeric(12,2),  
percentage\_to\_goal numeric(5,2),  
updated\_at timestamp default now()  
);

\-- \=========================================  
\-- PAYMENT TRANSACTIONS  
\-- \=========================================  
create table payment\_transactions (  
id uuid primary key default uuid\_generate\_v4(),  
purchase\_id uuid references purchases(id),  
provider varchar(50),  
provider\_transaction\_id varchar(255),  
amount numeric(12,2),  
status payment\_status default 'created',  
created\_at timestamp default now()  
);  
FUNCIONES:  
\-- \=========================================  
\-- TIMESTAMP TRIGGER  
\-- \=========================================  
create or replace function update\_timestamp()  
returns trigger as $$  
begin  
new.updated\_at \= now();  
return new;  
end;  
$$ language plpgsql;

create trigger trg\_users\_update before update on users  
for each row execute procedure update\_timestamp();

create trigger trg\_raffles\_update before update on raffles  
for each row execute procedure update\_timestamp();

\-- \=========================================  
\-- GENERATE LUCKY PASSES  
\-- \=========================================  
create or replace function generate\_lucky\_passes()  
returns trigger as $$  
declare pass\_count integer;  
begin

select lucky\_pass\_quantity into pass\_count  
from packs where id \= new.pack\_id;

insert into lucky\_passes (raffle\_id, user\_id, user\_pack\_id)  
select new.raffle\_id, new.user\_id, new.id  
from generate\_series(1, pass\_count \* new.quantity);

return new;  
end;  
$$ language plpgsql;

create trigger trg\_generate\_lucky  
after insert on user\_packs  
for each row execute procedure generate\_lucky\_passes();

\-- \=========================================  
\-- UPDATE PROGRESS \+ UNLOCK MILESTONES  
\-- \=========================================  
create or replace function update\_progress\_and\_milestones()  
returns trigger as $$  
declare total integer;  
begin

select count(\*) into total  
from user\_packs where raffle\_id \= new.raffle\_id;

update raffle\_progress  
set packs\_sold \= total,  
revenue\_total \= (select sum(total\_paid) from user\_packs where raffle\_id \= new.raffle\_id),  
percentage\_to\_goal \= (total \* 100.0 / 5000\)  
where raffle\_id \= new.raffle\_id;

\-- unlock milestones  
update milestones  
set is\_unlocked \= true,  
unlocked\_at \= now()  
where raffle\_id \= new.raffle\_id  
and required\_packs \<= total  
and is\_unlocked \= false;

return new;  
end;  
$$ language plpgsql;

create trigger trg\_progress  
after insert on user\_packs  
for each row execute procedure update\_progress\_and\_milestones();

\-- \=========================================  
\-- RLS  
\-- \=========================================  
alter table users enable row level security;  
alter table purchases enable row level security;  
alter table user\_packs enable row level security;  
alter table lucky\_passes enable row level security;

create policy users\_self  
on users for select  
using (auth.uid() \= id);

create policy purchases\_self  
on purchases for select  
using (auth.uid() \= user\_id);

create policy userpacks\_self  
on user\_packs for select  
using (auth.uid() \= user\_id);

create policy lucky\_self  
on lucky\_passes for select  
using (auth.uid() \= user\_id);

\-- \=========================================  
\-- SEEDS  
\-- \=========================================

\-- ORG  
insert into organizations (id, name, slug)  
values ('00000000-0000-0000-0000-000000000001','RifaLovers','rifalovers');

\-- RAFFLE  
insert into raffles (id, organization\_id, title, goal\_packs, status)  
values ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000001','Rifa MacBook Air','5000','active');

\-- PROGRESS INIT  
insert into raffle\_progress (raffle\_id) values ('11111111-1111-1111-1111-111111111111');

\-- PACKS  
insert into packs (name, price, lucky\_pass\_quantity, is\_featured)  
values  
('1 LuckyPass',2990,1,false),  
('3 LuckyPass',4990,3,true),  
('5 LuckyPass',9990,5,false);

\-- MILESTONES  
insert into milestones (id, raffle\_id, name, required\_packs, sort\_order)  
values  
('m1','11111111-1111-1111-1111-111111111111','Carrito Lleno',500,1),  
('m2','11111111-1111-1111-1111-111111111111','Respiro',1000,2),  
('m3','11111111-1111-1111-1111-111111111111','Escapada',2500,3),  
('m4','11111111-1111-1111-1111-111111111111','Respiro',3500,4),  
('m5','11111111-1111-1111-1111-111111111111','Gran Desbloqueo',5000,5);

\-- PRIZES  
insert into prizes (raffle\_id, milestone\_id, type, name, value\_estimated)  
values  
('11111111-1111-1111-1111-111111111111','m1','milestone','Giftcard Supermercado',100000),  
('11111111-1111-1111-1111-111111111111','m2','milestone','Respiro RifaLovers',250000),  
('11111111-1111-1111-1111-111111111111','m3','milestone','Escapada Sheraton',600000),  
('11111111-1111-1111-1111-111111111111','m4','milestone','Respiro RifaLovers',250000),  
('11111111-1111-1111-1111-111111111111','m5','milestone','MacBook Air M2',1200000);

\-- FLASH  
insert into prizes (raffle\_id, type, name, value\_estimated)  
values  
('11111111-1111-1111-1111-111111111111','flash','Giftcard comida',5000),  
('11111111-1111-1111-1111-111111111111','flash','Giftcard comida',10000);  
