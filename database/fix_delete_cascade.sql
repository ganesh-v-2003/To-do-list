-- Fix for "Database error deleting user"
-- This error occurs because the 'tasks' and 'focus_sessions' tables reference the user 
-- but were not set up to automatically delete the user's data when the user is deleted.

-- 1. Update 'tasks' table
alter table public.tasks
drop constraint if exists tasks_user_id_fkey;

alter table public.tasks
add constraint tasks_user_id_fkey
foreign key (user_id)
references auth.users(id)
on delete cascade;

-- 2. Update 'focus_sessions' table
alter table public.focus_sessions
drop constraint if exists focus_sessions_user_id_fkey;

alter table public.focus_sessions
add constraint focus_sessions_user_id_fkey
foreign key (user_id)
references auth.users(id)
on delete cascade;
