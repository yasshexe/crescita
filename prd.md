# Crescita Codebase Cleanup PRD

**Status:** Draft — review required  
**Target branch:** `docs/codebase-cleanup-prd`  
**Base branch:** `main`  
**Scope:** Codebase simplification, technical-debt reduction, dead-code removal, and production hardening  
**Rule:** No changes are to be merged into `main` until this PRD is reviewed and approved.

---

## 1. Objective

Simplify the Crescita Django codebase without changing the intended visual design or business behavior.

The cleanup should:

- Remove code that is no longer reachable or used.
- Consolidate duplicated frontend logic.
- Reduce CSS/JavaScript patch layers.
- Simplify the lead/contact architecture.
- Improve test coverage around the production lead flow.
- Remove stale repository configuration.
- Reduce deployment and database technical debt.
- Preserve all currently working user-facing functionality.

### Non-goals

This cleanup is **not** a redesign.

Do not use this work to:

- redesign the homepage;
- change branding;
- change project content;
- introduce a frontend framework;
- introduce Redis/Celery without a demonstrated requirement;
- optimize hypothetical performance bottlenecks;
- rewrite the entire Django application.

---

# 2. Risk / Priority Model

| Priority | Risk | Meaning |
|---|---|---|
| P0 | Critical | Production/data/reliability issue or very high-value cleanup |
| P1 | High | Significant technical debt or meaningful maintenance risk |
| P2 | Medium | Useful cleanup with limited production impact |
| P3 | Low | Optional cleanup / boilerplate / cosmetic debt |

### Execution rule

Work from **P0 → P1 → P2 → P3**.

Within each priority, make the smallest safe change first and verify before proceeding.

---

# 3. P0 — Critical

## P0-01 — Protect the existing production state

### Problem

Cleanup changes must not be made directly against `main`.

### Action

Create a dedicated cleanup branch from `main`:

`docs/codebase-cleanup-prd` is the documentation/review branch.

Implementation work should later use a separate branch created from the approved `main` state.

### Acceptance criteria

- `main` remains unchanged.
- PRD is reviewable before implementation begins.
- No production deployment is triggered by cleanup work.

---

## P0-02 — Move production database from SQLite to PostgreSQL

### Problem

Crescita now stores business leads. SQLite should not remain the long-term production database for the deployed lead-generation system.

### Why it is unnecessary / problematic

SQLite is suitable for local development but introduces operational and persistence concerns for a production web service.

### Impact of fixing

**Critical reliability improvement.**

### Risks

- Existing lead data could be lost during migration.
- Environment configuration may be incomplete.
- Migration may expose production-specific schema/configuration problems.

### Cleanup plan

1. Back up current production data.
2. Provision PostgreSQL.
3. Configure the database through environment variables.
4. Run Django migrations.
5. Migrate existing lead records if required.
6. Verify Django admin.
7. Submit a real test lead.
8. Verify the lead is persisted.
9. Verify notification delivery.
10. Only then remove production dependence on SQLite.

### Acceptance criteria

- Production uses PostgreSQL.
- Existing leads are preserved.
- New leads persist after deployment/restart.
- Admin can read the Lead records.
- Local development can still use a simple local database if desired.

---

## P0-03 — Remove runtime HTML rewriting from `views.py`

### Current issue

The project historically used Python regex processing to rewrite project links after rendering the homepage.

The current template already contains the intended project/social links.

### Target cleanup

Remove:

- `PROJECT_LINK_REPLACEMENTS`
- `_add_project_links()`
- unnecessary `re` import
- response mutation in `home()`

Replace:

```python
return _add_project_links(response)
```

with:

```python
return render(request, "website/home.html")
```

### Why unnecessary

The template is already the source of truth for the links. Runtime HTML mutation duplicates presentation logic inside the backend.

### Impact

- Simpler request path.
- Less runtime processing.
- Less coupling between template markup and Python regex.
- Easier debugging.

### Risk

Low, provided all current CTA/project/social links are verified before deletion.

### Acceptance criteria

- All existing project links still work.
- Social links still work.
- Homepage renders normally.
- No HTML regex manipulation remains in the homepage request path.

---

## P0-04 — Replace the empty test suite with production-flow tests

### Current issue

`website/tests.py` contains no meaningful application tests.

The CI test command can therefore pass without protecting the critical lead-generation flow.

### Required tests

At minimum:

1. Homepage GET.
2. About page GET.
3. Valid contact submission.
4. Invalid contact submission.
5. Lead record creation.
6. Selected services persistence.
7. Successful redirect/confirmation.
8. Email notification behavior.
9. Lead admin registration.

### Impact

**High reliability improvement.**

### Risk

Low.

### Acceptance criteria

The tests fail when the lead flow is broken and pass against the current implementation.

---

# 4. P1 — High Priority

## P1-01 — Remove dead JavaScript

### Candidates

Remove code that has no corresponding current UI:

- animated counter system;
- current-year updater;
- unused project parallax data assignment;
- obsolete mockup/phone/AI interaction logic;
- any confirmed selector-based interaction whose target does not exist.

### Why unnecessary

These are remnants of previous UI implementations.

### Impact

- Smaller JS payload.
- Less runtime work.
- Less cognitive load.
- Fewer obsolete selectors.

### Risks

A selector may be generated dynamically or be intended for future restoration.

### Cleanup plan

1. Search every selector across templates/CSS/JS.
2. Confirm no current usage.
3. Delete one feature block at a time.
4. Run the homepage after each deletion.
5. Test desktop/mobile/reduced-motion behavior.

### Acceptance criteria

No deleted JS feature has a live consumer.

---

## P1-02 — Remove dead legacy CSS

### Candidates

Strong candidates include obsolete families such as:

- `.mockup-window`
- `.mockup-header`
- `.mockup-title`
- `.mockup-menu`
- `.phone-mockup`
- `.phone-header`
- `.chat-bubble`
- `.incoming`
- `.outgoing`
- `.ai-card`
- other selectors confirmed absent from the current rendered UI

### Why unnecessary

They belong to older UI concepts no longer represented by the current templates.

### Impact

High maintainability improvement and smaller CSS payload.

### Risks

CSS can be consumed by dynamically-created elements.

### Acceptance criteria

- Search confirms no live consumers.
- Visual regression checks pass.
- No deleted selector is recreated dynamically by JavaScript.

---

## P1-03 — Consolidate CSS override layers

### Current problem

The project has multiple CSS layers:

```text
agency.css
mobile-fix.css
stability-fix.css
connexaa-work-fix.css
```

The same project/card/grid rules are repeatedly overridden, sometimes with `!important`.

### Why this is technical debt

The cascade has become the mechanism for maintaining the layout rather than the stylesheet structure itself.

### Impact

**Very high maintainability improvement.**

### Risks

This is one of the riskiest cleanup operations because removing an override can alter layout at specific breakpoints.

### Cleanup plan

1. Inventory duplicate selectors.
2. Identify the final intended rule for each component.
3. Move final values into a canonical stylesheet location.
4. Remove obsolete overrides.
5. Remove `!important` only where safe.
6. Test:
   - desktop;
   - tablet;
   - mobile;
   - project cards;
   - hover states;
   - navigation;
   - contact section;
   - reduced-motion mode.
7. Delete empty/obsolete fix files only after visual verification.

### Acceptance criteria

The final UI matches the current approved design while using fewer conflicting rules.

---

## P1-04 — Stop loading the full agency JavaScript on pages that do not need it

### Problem

`about.html` currently loads the general agency JavaScript even though much of that code targets homepage-specific UI.

### Cleanup plan

Determine which behavior is genuinely shared.

Then choose:

**Preferred:**

```text
site.js
agency.js
```

where shared behavior lives in `site.js`.

Or load `agency.js` only on the homepage if About does not need it.

### Impact

Medium performance and maintainability improvement.

### Risk

A currently working shared interaction could disappear from About.

### Acceptance criteria

About retains all intended behavior without loading unrelated homepage logic.

---

## P1-05 — Introduce a Django ModelForm for leads

### Current problem

The view manually reads:

```python
request.POST.get(...)
request.POST.getlist(...)
```

and performs basic validation.

### Target

Create:

```text
website/forms.py
```

with a `LeadForm`.

### Why

Validation and field definitions should not be scattered through the view.

### Impact

- Smaller view.
- Centralized validation.
- Better testability.
- Better error handling.

### Risk

Existing form behavior could change if validation becomes stricter.

### Acceptance criteria

- Valid leads behave exactly as before.
- Invalid input is handled predictably.
- Service selections remain persisted.
- Existing frontend form remains compatible.

---

## P1-06 — Extract notification logic from the view

### Current problem

Lead creation and email notification are coupled directly inside the request handler.

### Target

Create:

```text
website/services.py
```

with a focused notification function.

Example responsibility:

```text
create Lead
    ↓
send lead notification
```

### Additional issue

Avoid silently hiding email failures with `fail_silently=True` without logging.

### Recommended behavior

A failed email should be observable through logging while the lead remains safely stored.

### Risk

Changing error handling may expose previously hidden email configuration errors.

### Acceptance criteria

- Lead is saved independently of notification success.
- Notification failures are logged.
- The user receives a stable submission response.
- No lead is lost because email delivery fails.

---

## P1-07 — Simplify deployment command responsibilities

### Current problem

Build/startup logic currently overlaps around migrations and admin bootstrap.

### Target architecture

```text
Build
  ↓
install dependencies
collectstatic

Pre-deploy
  ↓
migrate
bootstrap admin

Start
  ↓
gunicorn
```

### Risk

Deployment configuration is external to Django code and must be tested against Render.

### Acceptance criteria

- Migrations run exactly where intended.
- Admin bootstrap is not unnecessarily repeated.
- Web start command only starts the web process.
- Production deployment succeeds.

---

# 5. P2 — Medium Priority

## P2-01 — Delete empty `style.css`

### Why

The file contains no useful implementation and is not part of the active styling system.

### Impact

Very small.

### Risk

Very low.

### Acceptance criteria

No template references the file.

---

## P2-02 — Move inline message/loading CSS into the stylesheet

### Problem

`home.html` contains styling for Django messages and submission loading state.

### Why

Presentation logic should live with the rest of the site's CSS.

### Impact

Medium maintainability improvement.

### Risk

Very low.

### Acceptance criteria

Visual appearance remains unchanged.

---

## P2-03 — Remove or simplify the project-level template directory configuration

### Problem

Django is configured with a project-level templates directory while the active templates live inside the app.

### Action

Confirm whether `BASE_DIR/templates` is actually used.

If not, simplify `TEMPLATES["DIRS"]`.

### Risk

Low, but keep it if project-level templates are intentionally planned.

---

## P2-04 — Delete merged feature branches

Branches currently associated with already-merged work should be removed after verifying there are no unique unmerged commits:

```text
feature/project-links
feature/social-links
feature/production-contact-system
```

### Also

Remove obsolete feature-branch triggers from CI if they are no longer needed.

### Impact

Repository hygiene.

### Risk

Low after commit comparison.

---

## P2-05 — Pin tested production dependency versions

### Current problem

Some dependencies use version ranges.

### Action

Pin versions intentionally after confirming the currently deployed versions.

### Do not

Blindly replace the file with an arbitrary `pip freeze`.

### Acceptance criteria

A clean install reproduces the tested environment.

---

# 6. P3 — Low Priority

## P3-01 — Review ASGI boilerplate

### Candidate

```text
crescita/asgi.py
ASGI_APPLICATION
```

### Decision

Do not delete automatically.

Keep if future async/ASGI functionality is expected.

Delete only if the project explicitly commits to WSGI-only deployment.

### Risk

Low, but unnecessary deletion creates future friction.

---

## P3-02 — Extract homepage sections into template partials

Potential structure:

```text
website/templates/website/
├── home.html
├── about.html
└── partials/
    ├── header.html
    ├── hero.html
    ├── services.html
    ├── projects.html
    ├── social.html
    ├── contact.html
    └── footer.html
```

### Important

Do this only after dead-code cleanup.

Otherwise the project will simply have the same technical debt distributed across more files.

---

# 7. Explicitly Out of Scope

Do not introduce these as part of this cleanup unless a separate requirement appears:

- React/Next.js migration.
- Tailwind migration.
- REST API layer.
- GraphQL.
- Redis.
- Celery.
- WebSockets.
- frontend framework.
- major visual redesign.
- animation redesign.
- CMS.
- authentication redesign.
- multi-tenant architecture.
- premature caching.
- database query optimization without measured evidence.

---

# 8. Verification Strategy

Every cleanup stage must pass:

### Functional

- Homepage loads.
- About page loads.
- Navigation works.
- Project links work.
- Social links work.
- Contact form submits.
- Lead appears in admin.
- Selected services persist.
- Email notification behavior is observable.

### Responsive

Test:

- desktop;
- tablet;
- mobile;
- narrow mobile.

### Interaction

Test:

- navigation menu;
- project hover;
- project cursor;
- service interactions;
- contact submission loading;
- success/error messages.

### Accessibility

Verify:

- keyboard navigation;
- focus states;
- reduced-motion behavior;
- form labels;
- link names.

### Deployment

After deployment-related changes:

- Render build succeeds;
- migrations succeed;
- static files load;
- admin works;
- database persists across restart;
- contact submission works.

---

# 9. Definition of Done

The cleanup is complete only when:

- [ ] No confirmed dead backend link-rewriting code remains.
- [ ] No confirmed dead JS feature remains.
- [ ] No confirmed legacy CSS component remains.
- [ ] CSS overrides have been consolidated.
- [ ] Homepage behavior is unchanged.
- [ ] About page does not load unnecessary JS.
- [ ] Contact flow uses structured validation.
- [ ] Lead notification failures are observable.
- [ ] Meaningful tests cover the lead flow.
- [ ] Production uses PostgreSQL.
- [ ] Deployment responsibilities are separated.
- [ ] Empty CSS files are removed.
- [ ] Stale merged branches are cleaned up.
- [ ] CI no longer references obsolete feature branches.
- [ ] No cleanup changes have been merged into `main` without review.

---

# 10. Recommended Execution Sequence

```text
PHASE 0
Protect main + review this PRD
        ↓
PHASE 1
Remove obvious dead backend/JS/CSS
        ↓
PHASE 2
Consolidate CSS safely
        ↓
PHASE 3
Refactor LeadForm + notification service
        ↓
PHASE 4
Add meaningful automated tests
        ↓
PHASE 5
Fix production database/deployment architecture
        ↓
PHASE 6
Repository/CI cleanup
        ↓
PHASE 7
Low-priority structural cleanup
        ↓
FINAL REVIEW
        ↓
Only then consider merge to main
```

---

# 11. Review Gate

**No implementation should be pushed to `main` based on this PRD until the PRD has been reviewed.**

The first implementation PR should be created from the approved state and should remain separate from `main` until review.

Suggested implementation branches:

```text
cleanup/dead-code
cleanup/css-consolidation
cleanup/contact-architecture
cleanup/production
cleanup/repository
```

This keeps risky changes isolated and makes rollback straightforward.

---

## 12. Expected Outcome

The target is not "fewer files" by itself.

The target architecture is:

```text
Django
│
├── views.py          → request orchestration
├── forms.py          → validation
├── models.py         → persistence
├── services.py       → external/business operations
├── admin.py          → lead management
│
├── templates/
│   └── website/      → source of truth for page structure
│
└── static/
    ├── css/          → canonical styles
    └── js/           → only live interactions
```

The resulting codebase should be smaller, easier to reason about, easier to test, and safer to modify without relying on historical CSS/JS patches.
