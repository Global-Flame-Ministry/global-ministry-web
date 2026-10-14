# Implementation Audit & Plan — Home Hero, Short Clips, Blog Redesign

**Status:** Audit & plan only. No source files were modified. This document is the only file created.
**Scope:** React + TypeScript frontend (`g-flame/flames-min`) and ASP.NET Core backend (`GlobalFlameMinistry.API`).
**Method:** Every claim below was verified by reading the cited file. Where something does not exist, it is stated explicitly.

---

## 1. Executive Summary

- **Feature A (home hero):** A carousel already exists (`HeroCarousel.tsx`) but rotates at **15 s** (`DEFAULT_INTERVAL = 15000`) and only consumes hero slides; it does **not** merge "featured" events.
- There is **no `IsFeatured`/featured flag on `Event`** and **no featured flag on `HeroSlide`** — both need a schema migration.
- **Feature B (Short Clips):** all hero slides (Image + Video) live in one table; there is **no separate clips page, route, nav entry, or home section**.
- Max-3 featured clips is **not enforced anywhere** (neither backend nor admin UI).
- **Feature C (blog):** Global Flame already uses a purple/fuchsia palette and a *block-based* post model; PIPDC uses a *markdown + categories + tags + read-time* model. A visual redesign is straightforward; full content-model parity is a larger backend effort.
- One **latent bug**: `blogApi.getDepartments()` calls `/api/blog/departments`, which has **no matching endpoint** and is shadowed by `GET /api/blog/{slug}`.
- Minor bug: `AdminHeroSlides.tsx` reads `s.createdAt`, but the API returns `createdOn` → renders "Invalid Date".

---

## 2. Current State

### 2.1 Feature A — Auto-rotating full-bleed home hero

| Item | Finding | Evidence |
| --- | --- | --- |
| Rotation interval | **15 000 ms**, hard-coded constant `DEFAULT_INTERVAL` | `src/components/HeroCarousel.tsx:9` |
| Interval overridable | Yes via `intervalMs` prop, but `Home` does not pass it | `HeroCarousel.tsx:44-47`, `src/pages/Home.tsx:312` |
| Slide source | Hero slides only, `heroApi.getActiveSlides()` → `GET /api/media/hero` | `Home.tsx:222-226`, `src/api/heroApi.ts:5-6` |
| Video handling | Videos are included in the hero (played muted/looped), not excluded | `HeroCarousel.tsx:85-102,139-178` |
| Featured events in hero | **Not implemented** — no merge of events | `Home.tsx:222-226` only queries hero slides |
| Full-bleed | Yes (`absolute inset-0`, `min-h-[100dvh]`) | `HeroCarousel.tsx:134`; `Home.tsx:310` |
| Event featured flag | **Does not exist** | `Models/Event.cs:1-27` (no `IsFeatured*`) |
| Text "rotates every 15s" | Hard-coded in 2 places | `AdminHeroSlides.tsx:222`, `AdminHeroSlides.tsx:347` |

**Event model (no featured flag):** `Models/Event.cs` — Id, Slug, Title, Description, StartDate, EndDate, Location, ImageUrl, Module, IsCancelled, AcceptsRegistrations, MaxRegistrations, SeatsTaken, AcceptsDonations, DonationLabel, MinistryId, Ministry, IsDeleted, CreatedOn, UpdatedOn, DeletedOn.

### 2.2 Feature B — Short Clips

| Item | Finding | Evidence |
| --- | --- | --- |
| Video content store | Same `HeroSlide` table, `MediaType = "Video"` | `Models/HeroSlide.cs:6`, `DTOs/HeroSlide/CreateHeroSlideDto.cs:8-10` |
| Dedicated clips page/route | **Does not exist** — no `/clips` or `/videos` route | `App.tsx:171-223` (public routes) |
| Nav entry in Explore | **Does not exist** | `Navbar.tsx:58-68` (`EXPLORE_CHURCH_LIFE`, `EXPLORE_QUICKLINKS`) |
| Distinct from Sermons | Sermons are a separate domain; clips are not separated | `Navbar.tsx:70-74` (`MEDIA_LINKS`) |
| Featured clip flag | **Does not exist** on `HeroSlide` | `Models/HeroSlide.cs:1-17` |
| Max-3 enforcement (backend) | **Does not exist** | `HeroSlideService.cs` / `HeroSlideRepository.cs` have no limit logic |
| Max-3 enforcement (admin UI) | **Does not exist** | `AdminHeroSlides.tsx` (no featured concept) |
| Home Featured Clip section | **Does not exist** | `Home.tsx` (no such section) |
| Public clips endpoint | None (public hero endpoint returns all active slides incl. video) | `HeroSlidesController.cs:22-29` |

**HeroSlide model:** Id, MediaType ("Image"/"Video"), Url, Title, Subtitle, TargetUrl, DisplayOrder, IsActive, IsDeleted, CreatedOn, UpdatedOn (`Models/HeroSlide.cs`).

`GET /api/media/hero` returns active slides ordered by `DisplayOrder` then `CreatedOn` (`HeroSlideRepository.cs:19-26`), mapped to `HeroSlideDto` (`DTOs/HeroSlide/HeroSlideDto.cs`).

### 2.3 Feature C — Blog redesign (PIPDC parity)

| Item | Global Flame (current) | PIPDC (reference) |
| --- | --- | --- |
| Index page | `src/pages/BlogPage.tsx` — pill "Blog", Playfair heading, search, department tabs derived from current page, 3-col cards | `PIPDC-Frontend/src/pages/blog/BlogPage.tsx` — pill "Insights" + `Newspaper` icon, `heading-2`, card grid, read-time badge |
| Post page | `src/pages/BlogPostDetail.tsx` — block renderer (`Heading/Paragraph/Image/Quote`), related posts, `DepartmentBadge`, `AuthorAvatar` | `PIPDC-Frontend/src/pages/blog/BlogDetailPage.tsx` — `react-markdown`, `KeyQuote`, `ShareButtons`, `BlogSidebar`, `useRelatedPosts` |
| Sidebar | **Does not exist** | `PIPDC-Frontend/src/components/blog/BlogSidebar.tsx` (Latest Posts + Categories) |
| Share buttons | **Does not exist** | `PIPDC-Frontend/src/components/blog/ShareButtons.tsx` |
| Parent-key quote | **Does not exist** as distinct component | `PIPDC-Frontend/src/components/blog/KeyQuote.tsx` |
| Home blog section | `Home.tsx:796-845` "Latest from the Blog" (3 cards) | not in scope of PIPDC blog page |
| Content model | Block-based (`BlogPostBlock`: Heading/Paragraph/Image/Quote) | Markdown `content` + `categoryId` + `tags[]` + `readMinutes` + `keyQuote` |
| Categories/tags | **No category or tag entities**; `Department` string only | `Category`, `Tag`, `/blog/categories`, `/blog/tags` |
| Palettes | Purple/fuchsia (`index.css` `@theme`, `#5b0064`, `#80008c`, `#712ae2`) | forest/gold/ink (`PIPDC-Frontend/tailwind.config.js`) |
| Tailwind | v4 (CSS-first `@theme`, no config file) | v3 (JS config) |
| `react-markdown` | **Not installed** | Installed (`PIPDC-Frontend/package.json`) |
| Fonts | Playfair Display + Inter (loaded per-page via `Home.tsx:286-289`) | Inter (`fontFamily.display`/`sans`) |

**Key mismatch:** PIPDC renders markdown; Global Flame renders structured blocks. Parity therefore has a *visual* layer (easy, re-skin) and a *data-model* layer (new categories/tags/read-time/key-quote — substantial).

**Verified existing blog backend:**
- `BlogController.cs` (`api/blog`) exposes only `GetAll` (forces `IsPublished = true`) and `GetBySlug`. **No `/departments`, `/categories`, `/related` endpoints.**
- `BlogPostService.GetDistinctDepartmentsAsync()` **already exists** (`BlogPostService.cs:172-175`) and the repository method exists (`BlogPostRepository.cs:192-205`) — but **no controller exposes it**.
- `blogApi.getDepartments()` targets `/api/blog/departments` (`src/api/blogApi.ts:52-53`) — **broken today**: routing falls through to `GET api/blog/{slug}` with slug `"departments"` → `404 "Blog post not found"`.
- `BlogPost` model: no category entity, no tags, no read-time, no key-quote (`Models/BlogPost.cs`).
- `BlogPostResponseDto` includes `ConferenceTheme`, `ThemeScripture`, `Blocks` (`DTOs/Blog/BlogPostResponseDto.cs`).

### 2.4 Cross-cutting current state

| Area | Finding | Evidence |
| --- | --- | --- |
| Routing | Public routes in one `<Routes>`; `fullBleed` layout flag exists | `App.tsx:89-112,171-223` |
| Navbar Explore (desktop) | Mega menu with 3 columns: Departments, Church Life, Quick Links | `Navbar.tsx:58-68,437-595` |
| Navbar Explore (mobile) | Built from `navMinistries + EXPLORE_CHURCH_LIFE + EXPLORE_QUICKLINKS` | `Navbar.tsx:218-223` |
| Media dropdown | Sermons / Books / News | `Navbar.tsx:70-74` |
| Admin nav | `NAV_ITEMS` includes "Hero Slides" → `/admin/hero-slides` | `AdminLayout.tsx:13-29`, `App.tsx:274-275` |
| API envelope | `ApiResponseFilter` double-wraps non-`ApiResponse` `ObjectResult`s | `Filters/ApiResponseFilter.cs`; controllers return raw values |
| Hero admin page | Full CRUD modal, reorder, Image/Video upload | `AdminHeroSlides.tsx` |
| Uploads | Images ≤10 MB, video/audio ≤100 MB; `MediaController` limit 120 MB | `Helpers/UploadValidation.cs`, `MediaController.cs` |
| Cache | HybridCache with tag invalidation; hero tag `TagHeroSlides` | `HeroSlideService.cs:25-48,87-102` |
| Migrations | `AddHeroSlides` (`20261013150304`) is the latest | `Migrations/` |
| Type drift | `types.ts` `HeroSlide.createdAt` vs API `createdOn` | `src/types.ts:87-88`, `AdminHeroSlides.tsx:287` |

---

## 3. Gap Analysis

| # | Gap | Feature | Severity | Needs |
| --- | --- | --- | --- | --- |
| G1 | Interval is 15 s, not 5 s; hard-coded constant + 2 hard-coded strings | A | Med | `HeroCarousel.tsx:9`; `Home.tsx:312`; `AdminHeroSlides.tsx:222,347` |
| G2 | No featured flag on `Event` | A | High | Model + migration + DTOs + admin UI + query |
| G3 | Hero does not merge featured events | A | High | Data fetch + mapping logic |
| G4 | Video slides still rotate in the hero | A/B | High | Filter video out of hero |
| G5 | No Short Clips page/route | B | High | New page + `App.tsx` route |
| G6 | No Explore nav entry for clips | B | Med | `Navbar.tsx` |
| G7 | No featured flag on `HeroSlide` | B | High | Model + migration + DTOs + admin UI |
| G8 | Max-3 featured clips not enforced (backend) | B | High | Service/repo validation → 400 |
| G9 | Max-3 not enforced (admin UI) | B | Med | `AdminHeroSlides.tsx` disable/warn |
| G10 | No home Featured Clip section | B | High | New `Home.tsx` section + API |
| G11 | Blog sidebar missing | C | Med | New component |
| G12 | Share buttons missing | C | Low | New component |
| G13 | Key-quote component missing | C | Low | New component (or reuse Quote block) |
| G14 | `/api/blog/departments` missing; `getDepartments()` broken | C | Med | Controller endpoint (service already exists) |
| G15 | `Happening Now`/"Divine Presence" ordering for clip section | B | Low | Home section placement |
| G16 | `createdAt` vs `createdOn` type mismatch | A/B | Low | `types.ts:87-88`, `AdminHeroSlides.tsx:287` |

---

## 4. Proposed Architecture, Data Model & Endpoints

### 4.1 Data model changes

**`Event` (Feature A)** — add:
```
bool IsFeaturedOnHome { get; set; } = false;
DateTime? FeaturedOn { get; set; }        // optional: when it was featured (audit/sort)
```
- Add an index for the featured lookup: `(IsFeaturedOnHome, StartDate)`.
- No relationship changes.

**`HeroSlide` (Feature B)** — add:
```
bool IsFeatured { get; set; } = false;        // "Featured on home page" clip
int FeaturedOrder { get; set; } = 0;          // deterministic ordering for the home section
```
- Constraint: at most 3 rows with `IsFeatured = true` **and** `MediaType = "Video"` and `IsActive = true` (enforced in service, not a DB check, for a clear 400 message).
- `MediaType = "Video"` implicitly means "Short Clip".

> Alternative (simpler) considered: reuse `DisplayOrder` for featured ordering and skip `FeaturedOrder`. Rejected because clip ordering on the home page is conceptually independent of the all-clips listing order.

### 4.2 API surface

**Feature A**
- `GET /api/ministry/events` (public): add optional query `isFeaturedOnHome=true` in `EventQueryObject`.
- New: `GET /api/media/hero` already exists — change behavior OR add `GET /api/media/home-hero` that returns a merged, normalized list (`{ id, type: "Image"|"Event", url, title, subtitle, targetUrl, startDate? }`). **Recommended:** keep `/api/media/hero` returning image slides only (exclude video), and have the frontend merge featured events client-side from the existing events endpoint to avoid ordering ambiguity. *(Decision D1 below.)*

**Feature B**
- `GET /api/media/clips` (public, new): active `HeroSlide` where `MediaType = "Video"`, ordered by `DisplayOrder`, `CreatedOn`.
- `GET /api/media/clips/featured` (public, new): active video slides where `IsFeatured = true`, ordered by `FeaturedOrder`, capped at 3.
- Reuse existing admin CRUD under `api/ministry/hero-slides` (already `[Authorize(Roles="Admin")]`), extending DTOs with `IsFeatured` / `FeaturedOrder`.
- Create/Update validation: reject (HTTP 400) when marking a video slide featured would exceed 3.

**Feature C**
- `GET /api/blog/departments` (new): expose existing `BlogPostService.GetDistinctDepartmentsAsync()`.
- Optional (if full parity chosen): `GET /api/blog/{slug}/related`.

### 4.3 Envelope & caching notes
- New GET endpoints must return **raw** values (`Ok(list)`) so `ApiResponseFilter` wraps once; the frontend reads `res.data.data`.
- Featured-clip mutation invalidates `TagHeroSlides`; featured-event mutation invalidates `TagEvents` (both already exist in `Helpers/CacheKeys.cs`).

---

## 5. Frontend Plan

### 5.1 Feature A — 5 s full-bleed hero with featured events
1. `src/components/HeroCarousel.tsx`: rename/keep named constant and set `HERO_ROTATION_MS = 5000` (export it). Keep `intervalMs` prop default = `HERO_ROTATION_MS`.
2. `Home.tsx`:
   - Fetch featured events: `eventApi.getAll({ isFeaturedOnHome: true, pageSize: 10 })`.
   - Filter hero slides to `mediaType === 'Image'` before passing to the carousel.
   - Merge: map featured events → slide shape (`url = imageUrl`, `title`, `subtitle = description`, `targetUrl = /events/{slug}`). Decide merge order (recommended: images by `displayOrder`, then featured events by `startDate`).
   - Pass an explicit `intervalMs={HERO_ROTATION_MS}`.
3. `AdminHeroSlides.tsx`: replace both hard-coded "15s/15 seconds" strings with the shared constant.

### 5.2 Feature B — Short Clips page + home section
1. New `src/pages/Clips.tsx`: fetches `heroApi.getClips()`; renders a grid; supports one active player at a time; links to `/clips`.
2. New route in `App.tsx` (public): `<Route path="/clips" element={<PublicLayout fullBleed><Clips/></PublicLayout>} />` (also consider `/videos` alias).
3. `Navbar.tsx`: add `{ label: 'Short Clips', path: '/clips' }` to `EXPLORE_CHURCH_LIFE` (auto-propagates to desktop mega menu + mobile drawer).
4. New component `src/components/home/FeaturedClips.tsx`:
   - Uses `heroApi.getFeaturedClips()`.
   - 0 featured → render nothing; 1 → hide Next/Prev; 2–3 → Next/Prev + "X of N".
   - One `<video>` playing at a time (pause others); "View all clips" link → `/clips`.
5. Place `<FeaturedClips/>` in `Home.tsx` **immediately after the "Experience the Divine Presence" section** (after `Home.tsx:498`, before the Sermons block at `:501`).
6. `src/api/heroApi.ts`: add `getClips()` → `/api/media/clips`, `getFeaturedClips()` → `/api/media/clips/featured`.

### 5.3 Feature C — Blog redesign (PIPDC look, Global Flame palette)
Primary (visual redesign, no model change):
1. Add PIPDC-style utility classes to `src/index.css` `@theme`/layer: `heading-2`, `heading-3`, `section-pad`, `container-x`, `shadow-soft`, `shadow-lift` (mapped to Global Flame purple tokens).
2. Rebuild `BlogPage.tsx` to the PIPDC card grid (pill badge + Playfair heading + cards with department badge, read-time *if/when available*, date).
3. Rebuild `BlogPostDetail.tsx` around a `[1fr_280px]` layout with a sticky `BlogSidebar`.
4. New `src/components/blog/BlogSidebar.tsx` (Latest Posts from `getPublishedPosts`, Categories from `/api/blog/departments`).
5. New `src/components/blog/ShareButtons.tsx` and `src/components/blog/KeyQuote.tsx` (port from PIPDC, re-skin to `primary`/`secondary-container`).
6. Update `Home.tsx` blog section styling to match.
Optional (data parity, larger): categories, tags, read-time, markdown content — see decisions.

### 5.4 Types & API clients
- `src/types.ts`: add `EventDto.isFeaturedOnHome`; add `HeroSlide.isFeatured` / `featuredOrder`; fix `createdAt` → `createdOn` (`:87-88`).
- `eventApi.ts`: add `isFeaturedOnHome` to params.
- `heroApi.ts`: add clips + featured-clips calls and DTO fields.

---

## 6. Admin Dashboard Plan

1. **`AdminHeroSlides.tsx`**
   - Add a "Featured clip" toggle in the modal, shown **only when `mediaType === 'Video'`**.
   - Disable the toggle (with helper text "Maximum of 3 featured clips") when 3 are already featured and the current slide is not one of them.
   - Add a "Featured" badge to the list row.
   - Fix `s.createdAt` → `s.createdOn` (`:287`).
   - Make the descriptive text dynamic from `HERO_ROTATION_MS` (`:222`, `:347`).
2. **`AdminEvents.tsx`**
   - Add an "Feature on home page" toggle to the event form.
   - Add a "Featured" badge/filter in the list.
   - Surface a helper hinting that featured events appear in the home hero.
3. **`AdminBlog.tsx`** — only if data-parity is chosen (category/tag selectors). Visual redesign needs no admin change.
4. **`AdminLayout.tsx`** — no new nav item strictly required (clips are managed under Hero Slides). Optionally relabel "Hero Slides" → "Hero & Clips".

---

## 7. Database Migrations

Current latest migration: `20261013150304_AddHeroSlides`.

Proposed migrations (backend, applied automatically at startup via `context.Database.MigrateAsync()` in `Program.cs:358`):
1. `AddHomeHeroFeaturedEvents`
   - `Events`: add `IsFeaturedOnHome bit` (default `false`), `FeaturedOn datetime null`.
   - Index on `(IsFeaturedOnHome, StartDate)`.
2. `AddFeaturedToHeroSlides`
   - `HeroSlides`: add `IsFeatured bit` (default `false`), `FeaturedOrder int` (default `0`).
   - Index on `(MediaType, IsFeatured, IsActive)`.

> Both are additive/nullable-safe and require no data backfill. `IsFeatured...` defaults keep existing rows non-featured.

---

## 8. Decisions Needed

| # | Decision | Options | Recommendation |
| --- | --- | --- | --- |
| D1 | Hero merge location | (a) frontend merges image slides + featured events; (b) new backend `home-hero` endpoint | (a) — reuse existing endpoints, less backend surface |
| D2 | Clip route path | `/clips` vs `/videos` | `/clips` |
| D3 | Blog parity depth | (a) visual redesign only; (b) add categories/tags/read-time/key-quote/markdown | (a) first; (b) as a follow-up phase |
| D4 | Clip data owner | Reuse `HeroSlide` vs new `Clip` entity | Reuse `HeroSlide` (MediaType=Video) |
| D5 | Featured cap enforcement | DB constraint vs service validation | Service validation (clear 400 message) |
| D6 | Featured ordering field | `FeaturedOrder` vs reuse `DisplayOrder` | `FeaturedOrder` |
| D7 | Deliverable location | `g-flame/flames-min/docs/` vs backend repo | Chosen: `g-flame/flames-min/docs/IMPLEMENTATION_AUDIT.md` |
| D8 | Featured events sort in hero | by `StartDate` vs random | by `StartDate` ascending |

---

## 9. Phased Implementation Plan

### Phase 1 — Feature A (hero: 5 s + featured events)
- **Backend:** [G2] `Event.IsFeaturedOnHome` + migration; DTOs (`EventResponseDto`, `CreateEventDto`, `UpdateEventDto`); `EventQueryObject.IsFeaturedOnHome`; `EventRepository` filter; (optional) `EventService` invalidation already covers `TagEvents`.
- **Frontend:** [G1,G3,G4] `HeroCarousel.tsx`, `Home.tsx`, `types.ts`, `eventApi.ts`, `AdminEvents.tsx`.
- **Acceptance:** Hero rotates every 5 s; video slides absent; featured events appear and link to `/events/{slug}`; admin can feature/unfeature an event; no "15s" text remains.

### Phase 2 — Feature B (Short Clips)
- **Backend:** [G7,G8] `HeroSlide.IsFeatured` + `FeaturedOrder` + migration; extend HeroSlide DTOs; `HeroSlideRepository` clip/featured queries; max-3 validation in `HeroSlideService`; new `GET /api/media/clips`, `GET /api/media/clips/featured`.
- **Frontend:** [G5,G6,G9,G10] `Clips.tsx`, `App.tsx` route, `Navbar.tsx`, `FeaturedClips.tsx`, `Home.tsx`, `heroApi.ts`, `types.ts`, `AdminHeroSlides.tsx`.
- **Acceptance:** `/clips` lists all video slides; Explore has "Short Clips"; home shows up to 3 featured clips after "Divine Presence"; 0 → hidden, 1 → no Next/Prev; admin blocks a 4th featured clip with a clear message.

### Phase 3 — Feature C (blog redesign)
- **Frontend:** [G11,G12,G13] new `BlogSidebar`, `ShareButtons`, `KeyQuote`; rebuild `BlogPage.tsx`, `BlogPostDetail.tsx`; `index.css` utilities; `Home.tsx` blog section.
- **Backend:** [G14] `GET /api/blog/departments` in `BlogController` (service/repo already exist).
- **(Optional) Phase 3b:** categories/tags/read-time/markdown parity (new migration + services).
- **Acceptance:** Blog matches PIPDC layout in Global Flame palette; sidebar renders; share buttons work; `/api/blog/departments` returns 200.

### Phase 4 — cleanup
- [G16] Fix `createdAt`/`createdOn` type drift and any leftover references.
- Run frontend `npm run build` (includes `tsc -b`) and `npm run lint`; backend `dotnet build`.

---

## 10. Test Checklist

**Feature A**
- [ ] Hero interval = 5 s (inspect network/behaviour); no video slide in hero.
- [ ] Featured event (`IsFeaturedOnHome=true`, future `StartDate`) appears in hero and links correctly.
- [ ] Un-featured/cancelled/past events excluded per chosen rule.
- [ ] Admin toggle persists and refreshes cache (`TagEvents`).
- [ ] No hard-coded "15s" string in admin.
- [ ] `prefers-reduced-motion` and `saveData` still suppress rotation (existing behaviour preserved, `HeroCarousel.tsx:20-42`).

**Feature B**
- [ ] `/clips` lists only active video slides.
- [ ] Explore (desktop + mobile) shows "Short Clips".
- [ ] Home Featured Clip: 0 → absent; 1 → no controls; 2–3 → Next/Prev + "X of N"; only one video plays.
- [ ] "View all clips" navigates to `/clips`.
- [ ] Admin: 4th featured clip rejected (400) with message; toggle disabled in UI.
- [ ] Caching invalidated after clip CRUD.

**Feature C**
- [ ] Blog index matches PIPDC structure; responsive 1/2/3 columns.
- [ ] Post page + sidebar render; related posts work.
- [ ] Share buttons open correct URLs; SEO tags present (`react-helmet-async`).
- [ ] `/api/blog/departments` returns 200 and populates categories.
- [ ] Empty/error states handled.

**Regression**
- [ ] `Happy` admin CRUD for hero slides still works (create/update/reorder/delete).
- [ ] `GET /api/media/hero` still validates and returns images only.
- [ ] CORS/rate limits unaffected.

---

## 11. Risks & Open Questions

1. **Envelope coupling:** new endpoints must return raw values; double-wrapping already caused a prior bug (see `ApiResponseFilter`). All new endpoints must follow the raw-return pattern.
2. **Cache staleness:** featuring/unfeaturing must invalidate `TagHeroSlides` / `TagEvents`; HybridCache L1 TTL is 2 min, so verify invalidation actually bypasses L1 (`RemoveByTagAsync`).
3. **Event hero rules undefined:** should past/cancelled events be allowed as featured? (Assumed: only future, non-cancelled.)
4. **Blog content-model gap:** true PIPDC parity needs categories/tags/read-time/markdown. If the user expects markdown (PIPDC renders `react-markdown`), Global Flame would need that dependency added and a migration away from block rendering — a much larger change. **Needs explicit confirmation (D3).**
5. **Deliverable location:** assumed frontend repo. If the backend repo is preferred, move the file (D7).
6. **Slug collision for clips:** clips reuse hero slides and have no slug; if a public `/clips/{id}` detail page is later required, IDs (not slugs) are the natural key.
7. **`FeaturedOrder` collides with `DisplayOrder` semantics** on the admin reorder UI; confirm the home section uses `FeaturedOrder` while the all-clips list uses `DisplayOrder`.
8. **No existing tests** were found in either repo; verification will be manual (build + lint + live smoke), consistent with prior work.
