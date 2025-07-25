alter table votes enable row level security;\nalter table comments enable row level security;\nalter table posts enable row level security;\nalter table user_favorites enable row level security;\n\ncreate policy \
User
can
insert
their
own
votes\ on votes for insert with check (user_id = auth.uid());\ncreate policy \User
can
select
their
own
votes\ on votes for select using (user_id = auth.uid());\ncreate policy \User
can
delete
their
own
votes\ on votes for delete using (user_id = auth.uid());\n\ncreate policy \User
can
insert
their
own
comments\ on comments for insert with check (user_id = auth.uid());\ncreate policy \User
can
select
their
own
comments\ on comments for select using (user_id = auth.uid());\ncreate policy \User
can
delete
their
own
comments\ on comments for delete using (user_id = auth.uid());\n\ncreate policy \User
can
insert
their
own
posts\ on posts for insert with check (user_id = auth.uid());\ncreate policy \User
can
select
their
own
posts\ on posts for select using (user_id = auth.uid());\ncreate policy \User
can
delete
their
own
posts\ on posts for delete using (user_id = auth.uid());\n\ncreate policy \User
can
insert
their
own
favorites\ on user_favorites for insert with check (user_id = auth.uid());\ncreate policy \User
can
select
their
own
favorites\ on user_favorites for select using (user_id = auth.uid());\ncreate policy \User
can
delete
their
own
favorites\ on user_favorites for delete using (user_id = auth.uid());
