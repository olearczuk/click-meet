\c interests_db;
create table interests (
    id serial,
    title text not null,
    professors char(24) []
) partition by range(title);

create table interests_eeee partition of interests
    for values from ('aaaa') to ('eeee');
create table interests_llll partition of interests
    for values from ('eeee') to ('llll');
create table interests_tttt partition of interests
    for values from ('llll') to ('tttt');
create table rest partition of interests
    for values from ('tttt') to ('zzzz');