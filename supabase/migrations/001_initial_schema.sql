-- ============================================
-- CaDeT: Career Development Tracker
-- Database Schema — Supabase PostgreSQL
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. PROFILES
-- ============================================
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text not null,
  headline text,
  bio text,
  avatar_url text,
  current_role text,
  years_experience integer default 0,
  preferred_industries text[] default '{}',
  onboarding_completed boolean default false,
  onboarding_step integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = user_id);

-- ============================================
-- 2. CAREER GOALS (AIM stage)
-- ============================================
create table career_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null check (category in ('ambition', 'role', 'interest', 'value', 'environment', 'long_term', 'industry', 'lifestyle')),
  title text not null,
  description text,
  priority integer default 3 check (priority between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table career_goals enable row level security;
create policy "Users can manage own goals" on career_goals for all using (auth.uid() = user_id);

-- ============================================
-- 3. CAREER TARGETS (COMPRESS stage)
-- ============================================
create table career_targets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  original_goal text not null,
  compressed_target text not null,
  role_clarity integer default 0 check (role_clarity between 0 and 100),
  skill_clarity integer default 0 check (skill_clarity between 0 and 100),
  industry_clarity integer default 0 check (industry_clarity between 0 and 100),
  experience_clarity integer default 0 check (experience_clarity between 0 and 100),
  evidence_clarity integer default 0 check (evidence_clarity between 0 and 100),
  overall_clarity integer generated always as (
    (role_clarity + skill_clarity + industry_clarity + experience_clarity + evidence_clarity) / 5
  ) stored,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table career_targets enable row level security;
create policy "Users can manage own targets" on career_targets for all using (auth.uid() = user_id);

-- ============================================
-- 4. ACTOR STATES
-- ============================================
create table actor_states (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  current_stage text not null default 'aim' check (current_stage in ('aim', 'compress', 'test', 'own', 'run')),
  aim_progress integer default 0,
  compress_progress integer default 0,
  test_progress integer default 0,
  own_progress integer default 0,
  run_progress integer default 0,
  aim_status text default 'active' check (aim_status in ('locked', 'active', 'completed')),
  compress_status text default 'locked',
  test_status text default 'locked',
  own_status text default 'locked',
  run_status text default 'locked',
  cycle_count integer default 1,
  last_transition timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table actor_states enable row level security;
create policy "Users can manage own actor state" on actor_states for all using (auth.uid() = user_id);

-- ============================================
-- 5. ACTOR EVENTS (Historical — critical for longitudinal analysis)
-- ============================================
create table actor_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stage text not null check (stage in ('aim', 'compress', 'test', 'own', 'run')),
  event_type text not null,
  title text not null,
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index idx_actor_events_user_stage on actor_events(user_id, stage, created_at desc);
create index idx_actor_events_user_date on actor_events(user_id, created_at desc);

alter table actor_events enable row level security;
create policy "Users can manage own events" on actor_events for all using (auth.uid() = user_id);

-- ============================================
-- 6. SKILLS (master catalog)
-- ============================================
create table skills (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  category text not null check (category in ('technical', 'soft', 'domain', 'tool', 'language', 'framework')),
  description text,
  created_at timestamptz default now()
);

-- Seed some initial skills
insert into skills (name, category) values
  ('React', 'framework'), ('TypeScript', 'language'), ('Node.js', 'framework'),
  ('Python', 'language'), ('JavaScript', 'language'), ('CSS/Tailwind', 'technical'),
  ('Git & GitHub', 'tool'), ('AI/LLM Integration', 'technical'),
  ('Communication', 'soft'), ('Problem Solving', 'soft'),
  ('SQL', 'language'), ('Docker', 'tool'), ('AWS', 'tool');

-- ============================================
-- 7. USER SKILLS
-- ============================================
create table user_skills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  skill_id uuid references skills(id) on delete cascade not null,
  level text default 'beginner' check (level in ('beginner', 'intermediate', 'advanced', 'expert')),
  confidence integer default 0 check (confidence between 0 and 100),
  evidence_count integer default 0,
  last_practiced timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, skill_id)
);

alter table user_skills enable row level security;
create policy "Users can manage own skills" on user_skills for all using (auth.uid() = user_id);

-- ============================================
-- 8. PROJECTS
-- ============================================
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  skills text[] default '{}',
  evidence text,
  linked_target_id uuid references career_targets(id) on delete set null,
  status text default 'planned' check (status in ('planned', 'in_progress', 'completed')),
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects enable row level security;
create policy "Users can manage own projects" on projects for all using (auth.uid() = user_id);

-- ============================================
-- 9. EXPERIMENTS (TEST stage)
-- ============================================
create table experiments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  hypothesis text not null,
  experiment text not null,
  timeline text,
  start_date date,
  end_date date,
  status text default 'planned' check (status in ('planned', 'active', 'completed', 'abandoned')),
  interest_score integer check (interest_score between 1 and 10),
  enjoyment_score integer check (enjoyment_score between 1 and 10),
  difficulty_score integer check (difficulty_score between 1 and 10),
  confidence_score integer check (confidence_score between 1 and 10),
  performance_score integer check (performance_score between 1 and 10),
  would_repeat boolean,
  reflection text,
  linked_target_id uuid references career_targets(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table experiments enable row level security;
create policy "Users can manage own experiments" on experiments for all using (auth.uid() = user_id);

-- ============================================
-- 10. ACHIEVEMENTS
-- ============================================
create table achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  type text not null check (type in ('certification', 'award', 'milestone', 'project_completion', 'skill_mastery')),
  evidence text,
  date_earned date default current_date,
  created_at timestamptz default now()
);

alter table achievements enable row level security;
create policy "Users can manage own achievements" on achievements for all using (auth.uid() = user_id);

-- ============================================
-- 11. REFLECTIONS
-- ============================================
create table reflections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  sentiment text default 'neutral' check (sentiment in ('positive', 'neutral', 'negative')),
  linked_entity_type text check (linked_entity_type in ('experiment', 'project', 'task', 'general')),
  linked_entity_id uuid,
  tags text[] default '{}',
  created_at timestamptz default now()
);

alter table reflections enable row level security;
create policy "Users can manage own reflections" on reflections for all using (auth.uid() = user_id);

-- ============================================
-- 12. CAREER SIGNALS
-- ============================================
create table career_signals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  signal_type text not null check (signal_type in ('behavioral', 'skill', 'experiment', 'reflection', 'evidence')),
  direction text not null,
  strength numeric(3,2) check (strength between -1 and 1),
  description text,
  source_event uuid references actor_events(id) on delete set null,
  created_at timestamptz default now()
);

create index idx_career_signals_user_dir on career_signals(user_id, direction, created_at desc);

alter table career_signals enable row level security;
create policy "Users can manage own signals" on career_signals for all using (auth.uid() = user_id);

-- ============================================
-- 13. CAREER FORECASTS
-- ============================================
create table career_forecasts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  direction text not null,
  confidence integer default 0 check (confidence between 0 and 100),
  trend text default 'stable' check (trend in ('rising', 'stable', 'declining')),
  positive_signals text[] default '{}',
  negative_signals text[] default '{}',
  behavioral_evidence text[] default '{}',
  skill_evidence text[] default '{}',
  experiment_results text[] default '{}',
  missing_evidence text[] default '{}',
  explanation text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table career_forecasts enable row level security;
create policy "Users can manage own forecasts" on career_forecasts for all using (auth.uid() = user_id);

-- ============================================
-- 14. TASKS (RUN stage)
-- ============================================
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  reason text not null, -- WHY this task matters
  linked_target_id uuid references career_targets(id) on delete set null,
  linked_skill_id uuid references user_skills(id) on delete set null,
  priority text default 'medium' check (priority in ('high', 'medium', 'low')),
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'deferred')),
  due_date date,
  completed_at timestamptz,
  period text default 'one_time' check (period in ('daily', 'weekly', 'one_time')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;
create policy "Users can manage own tasks" on tasks for all using (auth.uid() = user_id);

-- ============================================
-- 15. HABITS
-- ============================================
create table habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  frequency text default 'daily' check (frequency in ('daily', 'weekly', 'monthly')),
  linked_target_id uuid references career_targets(id) on delete set null,
  streak integer default 0,
  last_completed timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table habits enable row level security;
create policy "Users can manage own habits" on habits for all using (auth.uid() = user_id);

-- ============================================
-- 16. AI INSIGHTS
-- ============================================
create table ai_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('career_direction', 'skill_gap', 'pattern_detected', 'experiment_recommendation', 'trajectory_shift', 'next_action', 'milestone_approaching', 'evidence_gap')),
  title text not null,
  description text,
  explanation text not null, -- MUST always explain WHY
  evidence text[] default '{}',
  action_items text[] default '{}',
  confidence integer default 50 check (confidence between 0 and 100),
  priority text default 'medium' check (priority in ('high', 'medium', 'low')),
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table ai_insights enable row level security;
create policy "Users can manage own insights" on ai_insights for all using (auth.uid() = user_id);

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to all tables with updated_at
create trigger update_profiles_updated_at before update on profiles for each row execute procedure update_updated_at();
create trigger update_career_goals_updated_at before update on career_goals for each row execute procedure update_updated_at();
create trigger update_career_targets_updated_at before update on career_targets for each row execute procedure update_updated_at();
create trigger update_actor_states_updated_at before update on actor_states for each row execute procedure update_updated_at();
create trigger update_user_skills_updated_at before update on user_skills for each row execute procedure update_updated_at();
create trigger update_projects_updated_at before update on projects for each row execute procedure update_updated_at();
create trigger update_experiments_updated_at before update on experiments for each row execute procedure update_updated_at();
create trigger update_career_forecasts_updated_at before update on career_forecasts for each row execute procedure update_updated_at();
create trigger update_tasks_updated_at before update on tasks for each row execute procedure update_updated_at();
create trigger update_habits_updated_at before update on habits for each row execute procedure update_updated_at();

-- ============================================
-- Trigger: Auto-create profile on user signup
-- ============================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'User'));

  insert into actor_states (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();
