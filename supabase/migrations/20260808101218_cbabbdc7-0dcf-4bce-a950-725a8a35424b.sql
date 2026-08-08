-- ============ ENUMS ============
create type public.app_role as enum ('seeker','landlord');
create type public.listing_kind as enum ('rent','sale');
create type public.listing_lifecycle as enum ('draft','published','paused','negotiating','rented');
create type public.match_state as enum ('interested','conversation','visit_scheduled','visit_done','negotiating','rental_confirmed','closed');
create type public.visit_state as enum ('proposed','accepted','rescheduled','confirmed','done','cancelled');
create type public.document_type as enum ('cc','passaporte','titulo-residencia');
create type public.plan_id as enum ('free','pro');
create type public.billing_period as enum ('monthly','annual');
create type public.notification_category as enum ('interest','match','conversation','visit','availability','marketplace','system');
create type public.ticket_status as enum ('open','pending','resolved','closed');
create type public.close_reason as enum ('homematch','outside','paused','rework');

-- ============ UTIL ============
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  avatar_url text not null default '',
  bio text not null default '',
  occupation text not null default '',
  phone text not null default '',
  nif text not null default '',
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  document_type public.document_type,
  resident_in_portugal boolean not null default true,
  has_income boolean not null default false,
  is_student boolean not null default false,
  authorized_to_list boolean not null default false,
  property_docs_in_order boolean not null default false,
  terms_accepted boolean not null default false,
  onboarding_completed boolean not null default false,
  fiscal_name text not null default '',
  fiscal_address text not null default '',
  plan public.plan_id not null default 'free',
  billing_period public.billing_period not null default 'monthly',
  language text not null default 'pt',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create trigger profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();

-- ============ ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "user_roles_select_own" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.current_role_is(_role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = _role)
$$;

-- ============ PREFERENCES ============
create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  kind public.listing_kind not null default 'rent',
  city text not null default '',
  max_distance_km integer not null default 5,
  space_types_rent text[] not null default '{}',
  space_types_sale text[] not null default '{}',
  min_price integer not null default 0,
  max_price integer not null default 2000,
  max_sale_price integer not null default 400000,
  move_in_from text not null default '',
  pets boolean not null default false,
  needs_furnished boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.user_preferences to authenticated;
grant all on public.user_preferences to service_role;
alter table public.user_preferences enable row level security;
create policy "prefs_all_own" on public.user_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger prefs_updated_at before update on public.user_preferences for each row execute function public.update_updated_at_column();

-- ============ SETTINGS ============
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notif_interest boolean not null default true,
  notif_conversation boolean not null default true,
  notif_visit boolean not null default true,
  notif_match boolean not null default true,
  notif_marketplace boolean not null default false,
  channel_push boolean not null default true,
  channel_email boolean not null default true,
  privacy_discoverable boolean not null default true,
  privacy_show_activity boolean not null default true,
  privacy_personalised boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.user_settings to authenticated;
grant all on public.user_settings to service_role;
alter table public.user_settings enable row level security;
create policy "settings_all_own" on public.user_settings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger settings_updated_at before update on public.user_settings for each row execute function public.update_updated_at_column();

-- ============ NEW USER TRIGGER ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare _role public.app_role;
begin
  begin
    _role := coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'seeker');
  exception when others then _role := 'seeker';
  end;

  insert into public.profiles (id, email, name, email_verified)
  values (new.id, coalesce(new.email,''), coalesce(new.raw_user_meta_data->>'name',''), new.email_confirmed_at is not null)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role) values (new.id, _role) on conflict do nothing;
  insert into public.user_preferences (user_id) values (new.id) on conflict do nothing;
  insert into public.user_settings (user_id) values (new.id) on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ LISTINGS ============
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  kind public.listing_kind not null default 'rent',
  price integer not null default 0,
  city text not null default '',
  neighborhood text not null default '',
  distance_m integer not null default 0,
  type text not null default 'Quarto',
  space_type text not null default 'Quarto',
  lifecycle public.listing_lifecycle not null default 'draft',
  quality_score integer not null default 0,
  pets boolean not null default false,
  smoke boolean not null default false,
  available_from text not null default '',
  move_in_from text not null default '',
  visit_availability text[] not null default '{}',
  min_months integer not null default 0,
  capacity integer not null default 1,
  description text not null default '',
  amenities text[] not null default '{}',
  rules text not null default '',
  photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_owner_idx on public.listings(owner_id);
create index listings_lifecycle_idx on public.listings(lifecycle);
grant select, insert, update, delete on public.listings to authenticated;
grant select on public.listings to anon;
grant all on public.listings to service_role;
alter table public.listings enable row level security;
create policy "listings_public_read" on public.listings for select using (lifecycle in ('published','negotiating'));
create policy "listings_owner_read" on public.listings for select to authenticated using (owner_id = auth.uid());
create policy "listings_owner_insert" on public.listings for insert to authenticated
  with check (owner_id = auth.uid() and public.current_role_is('landlord'));
create policy "listings_owner_update" on public.listings for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "listings_owner_delete" on public.listings for delete to authenticated using (owner_id = auth.uid());
create trigger listings_updated_at before update on public.listings for each row execute function public.update_updated_at_column();

create or replace function public.listing_owner_card(_listing_id uuid)
returns table (name text, avatar_url text, occupation text, email_verified boolean, phone_verified boolean, document_ok boolean)
language sql stable security definer set search_path = public as $$
  select p.name, p.avatar_url, p.occupation, p.email_verified, p.phone_verified, (p.document_type is not null)
  from public.listings l join public.profiles p on p.id = l.owner_id
  where l.id = _listing_id
$$;

-- ============ FAVORITES / PASSES ============
create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
grant select, insert, delete on public.favorites to authenticated;
grant all on public.favorites to service_role;
alter table public.favorites enable row level security;
create policy "favorites_all_own" on public.favorites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.listing_passes (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
grant select, insert, delete on public.listing_passes to authenticated;
grant all on public.listing_passes to service_role;
alter table public.listing_passes enable row level security;
create policy "passes_all_own" on public.listing_passes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============ MATCHES ============
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  seeker_id uuid not null references auth.users(id) on delete cascade,
  landlord_id uuid not null references auth.users(id) on delete cascade,
  state public.match_state not null default 'interested',
  message text not null default '',
  reasons text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, seeker_id)
);
create index matches_seeker_idx on public.matches(seeker_id);
create index matches_landlord_idx on public.matches(landlord_id);
grant select, insert, update on public.matches to authenticated;
grant all on public.matches to service_role;
alter table public.matches enable row level security;
create policy "matches_party_read" on public.matches for select to authenticated using (seeker_id = auth.uid() or landlord_id = auth.uid());
create policy "matches_seeker_insert" on public.matches for insert to authenticated with check (seeker_id = auth.uid());
create policy "matches_party_update" on public.matches for update to authenticated
  using (seeker_id = auth.uid() or landlord_id = auth.uid())
  with check (seeker_id = auth.uid() or landlord_id = auth.uid());
create trigger matches_updated_at before update on public.matches for each row execute function public.update_updated_at_column();

create or replace function public.is_match_party(_match_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.matches m where m.id = _match_id and (m.seeker_id = auth.uid() or m.landlord_id = auth.uid()))
$$;

-- ============ CHATS / MESSAGES ============
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  last_message text not null default '',
  last_at timestamptz not null default now(),
  locked boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.chats to authenticated;
grant all on public.chats to service_role;
alter table public.chats enable row level security;
create policy "chats_party_read" on public.chats for select to authenticated using (public.is_match_party(match_id));
create policy "chats_party_insert" on public.chats for insert to authenticated with check (public.is_match_party(match_id));
create policy "chats_party_update" on public.chats for update to authenticated using (public.is_match_party(match_id)) with check (public.is_match_party(match_id));

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index messages_chat_idx on public.messages(chat_id, created_at);
grant select, insert, update on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;

create or replace function public.is_chat_party(_chat_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.chats c join public.matches m on m.id = c.match_id
    where c.id = _chat_id and (m.seeker_id = auth.uid() or m.landlord_id = auth.uid())
  )
$$;
create policy "messages_party_read" on public.messages for select to authenticated using (public.is_chat_party(chat_id));
create policy "messages_party_insert" on public.messages for insert to authenticated with check (sender_id = auth.uid() and public.is_chat_party(chat_id));
create policy "messages_party_update" on public.messages for update to authenticated using (public.is_chat_party(chat_id)) with check (public.is_chat_party(chat_id));

-- ============ VISITS ============
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  slot text not null default '',
  scheduled_at timestamptz,
  status public.visit_state not null default 'proposed',
  proposed_by uuid references auth.users(id) on delete set null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.visits to authenticated;
grant all on public.visits to service_role;
alter table public.visits enable row level security;
create policy "visits_party_read" on public.visits for select to authenticated using (public.is_match_party(match_id));
create policy "visits_party_insert" on public.visits for insert to authenticated with check (public.is_match_party(match_id));
create policy "visits_party_update" on public.visits for update to authenticated using (public.is_match_party(match_id)) with check (public.is_match_party(match_id));
create policy "visits_party_delete" on public.visits for delete to authenticated using (public.is_match_party(match_id));
create trigger visits_updated_at before update on public.visits for each row execute function public.update_updated_at_column();

-- ============ DEALS ============
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  kind public.listing_kind not null default 'rent',
  reason public.close_reason not null default 'homematch',
  move_in text not null default '',
  months integer,
  amount integer not null default 0,
  landlord_confirmed boolean not null default false,
  seeker_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.deals to authenticated;
grant all on public.deals to service_role;
alter table public.deals enable row level security;
create policy "deals_party_read" on public.deals for select to authenticated using (public.is_match_party(match_id));
create policy "deals_party_insert" on public.deals for insert to authenticated with check (public.is_match_party(match_id));
create policy "deals_party_update" on public.deals for update to authenticated using (public.is_match_party(match_id)) with check (public.is_match_party(match_id));
create trigger deals_updated_at before update on public.deals for each row execute function public.update_updated_at_column();

-- ============ REVIEWS ============
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  by_role public.app_role not null,
  rating integer not null check (rating between 1 and 5),
  tags text[] not null default '{}',
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (match_id, author_id)
);
grant select, insert on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "reviews_read" on public.reviews for select to authenticated using (
  author_id = auth.uid()
  or (
    public.is_match_party(match_id)
    and (select count(distinct r.author_id) from public.reviews r where r.match_id = reviews.match_id) >= 2
  )
);
create policy "reviews_insert_own" on public.reviews for insert to authenticated
  with check (author_id = auth.uid() and public.is_match_party(match_id));

-- ============ NOTIFICATIONS ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category public.notification_category not null default 'system',
  icon text not null default 'reminder',
  title text not null,
  body text not null default '',
  link text,
  unread boolean not null default true,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notifications_all_own" on public.notifications for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============ FATURAÇÃO ============
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  amount numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  status text not null default 'paid',
  issued_at timestamptz not null default now()
);
grant select on public.invoices to authenticated;
grant all on public.invoices to service_role;
alter table public.invoices enable row level security;
create policy "invoices_read_own" on public.invoices for select to authenticated using (user_id = auth.uid());

-- ============ SUPORTE / AJUDA ============
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  category text not null default 'geral',
  status public.ticket_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.support_tickets to authenticated;
grant all on public.support_tickets to service_role;
alter table public.support_tickets enable row level security;
create policy "tickets_all_own" on public.support_tickets for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger tickets_updated_at before update on public.support_tickets for each row execute function public.update_updated_at_column();

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  is_staff boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.support_messages to authenticated;
grant all on public.support_messages to service_role;
alter table public.support_messages enable row level security;
create or replace function public.owns_ticket(_ticket_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.support_tickets t where t.id = _ticket_id and t.user_id = auth.uid())
$$;
create policy "support_msgs_read_own" on public.support_messages for select to authenticated using (public.owns_ticket(ticket_id));
create policy "support_msgs_insert_own" on public.support_messages for insert to authenticated
  with check (public.owns_ticket(ticket_id) and is_staff = false and sender_id = auth.uid());

create table public.help_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null default 'geral',
  audience text not null default 'all',
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select on public.help_articles to anon, authenticated;
grant all on public.help_articles to service_role;
alter table public.help_articles enable row level security;
create policy "help_public_read" on public.help_articles for select using (published = true);
create trigger help_updated_at before update on public.help_articles for each row execute function public.update_updated_at_column();

insert into public.help_articles (slug, category, audience, question, answer, sort_order) values
('como-funciona','Primeiros passos','all','Como funciona o HomeMatch?','Vês espaços um a um, dás interesse no que gostas e, quando há match, abre-se uma conversa. A partir daí marcas visita e fechas o negócio com a outra parte.',1),
('trust-score','Confiança','all','O que é o Trust Score?','É a soma das verificações do teu perfil: email, telemóvel, documento, foto e bio. Quanto mais completo, mais confiança do outro lado.',2),
('publicar-anuncio','Anúncios','landlord','Como publico um anúncio?','Vai a Anúncios, toca em Publicar e segue o assistente. Um anúncio corresponde sempre a um único espaço.',3),
('limite-plano','Plano','landlord','Quantos anúncios posso ter ativos?','No plano Free podes ter 1 anúncio ativo. No Pro não há limite.',4),
('cancelar-visita','Visitas','all','Posso cancelar ou remarcar uma visita?','Sim. Abre a visita e escolhe remarcar ou cancelar; a outra parte é avisada.',5),
('apagar-conta','Conta','all','Como apago a minha conta?','Em Definições, Zona perigosa, escolhe apagar conta. Os teus anúncios e conversas são removidos.',6);

-- ============ STORAGE POLICIES ============
create policy "listing_photos_read" on storage.objects for select to authenticated using (bucket_id = 'listing-photos');
create policy "listing_photos_owner_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "listing_photos_owner_update" on storage.objects for update to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "listing_photos_owner_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_read" on storage.objects for select to authenticated using (bucket_id = 'avatars');
create policy "avatars_owner_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_owner_update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_owner_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);