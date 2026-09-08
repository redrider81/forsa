# 07 — Public content source map

Repository: redrider81/forsa
Branch: main
Commit: 088ffd03c531b59dc2772714249af8fa87a50654

Route-to-source map, the full list of public-facing source files, and the legacy copy documents that could create future copy drift.

Generated read-only from the current local HEAD. No secrets, environment values, credentials, tokens, private URLs or client data are included.

---

## Route to source map

| Route | Language | Page source | Export file |
| --- | --- | --- | --- |
| `/` | Swedish | `src/app/page.tsx` | 01 |
| `/individuell-coaching` | Swedish | `src/app/individuell-coaching/page.tsx` | 02 |
| `/business-coaching` | Swedish | `src/app/business-coaching/page.tsx` | 02 |
| `/om-oss` | Swedish | `src/app/om-oss/page.tsx` | 02a |
| `/kontakt` | Swedish | `src/app/kontakt/page.tsx` | 02a |
| `/en` | English | `src/app/en/page.tsx` | 03 |
| `/en/individuell-coaching` | English | `src/app/en/individuell-coaching/page.tsx` | 04 |
| `/en/business-coaching` | English | `src/app/en/business-coaching/page.tsx` | 04 |
| `/en/om-oss` | English | `src/app/en/om-oss/page.tsx` | 04a |
| `/en/kontakt` | English | `src/app/en/kontakt/page.tsx` | 04a |
| `/klient-login` | Swedish | `src/app/klient-login/page.tsx` | 06 |
| `/coach-login` | Swedish | `src/app/coach-login/page.tsx` | 06 |
| `/logga-in` | Swedish | `src/app/logga-in/page.tsx` | 06 |
| `/cvb-base/*` | Swedish | `src/app/cvb-base/layout.tsx` (redirect only) | 06 |

Retired public routes returning permanent 308 redirects to `/business-coaching` and
`/en/business-coaching`: `executive-coaching`, `ledningsgruppscoaching`, `team-coaching`,
`coachande-ledarskap`. Also `/om-forsa` → `/om-oss` and `/portal/*` → `/cvb-base/*`.
Defined in `next.config.ts` (05).

## All public-facing source files

| File | Role | Export file |
| --- | --- | --- |
| `src/app/layout.tsx` | Root layout, site metadata, JSON-LD mount | 01 |
| `src/app/page.tsx` | Swedish homepage | 01 |
| `src/components/site-footer.tsx` | Footer | 01 |
| `src/components/cta-link.tsx` | Shared CTA / booking link | 01 |
| `src/components/brand/logo.tsx` | Logo, alt text | 01 |
| `src/components/hero-video-background.tsx` | Hero video | 01 |
| `src/components/contact-page-scroll-reset.tsx` | Contact scroll reset | 01 |
| `src/components/coaching-services-grid.tsx` | Two coaching path cards, both locales | 01a |
| `src/components/ui/kinetic-team-hybrid.tsx` | "Coaching med Carolina" section | 01a |
| `src/components/engagement-section.tsx` | Process section wrapper | 01a |
| `src/components/engagement-bento-grid.tsx` | Four process cards, both locales | 01a |
| `src/lib/i18n/dictionaries/sv.ts` | Swedish strings | 01a |
| `src/components/site-navigation.tsx` | Header, mega menu, language switch, login entry | 01b, 01c |
| `src/app/individuell-coaching/page.tsx` | Swedish service page | 02 |
| `src/app/business-coaching/page.tsx` | Swedish service page | 02 |
| `src/app/om-oss/page.tsx` | Swedish about page | 02a |
| `src/app/kontakt/page.tsx` | Swedish contact page | 02a |
| `src/components/process-faq.tsx` | Contact FAQ disclosure | 02a |
| `src/components/contact-intake-form.tsx` | Booking intake form, both locales | 02b |
| `src/components/contact-scheduling-picker.tsx` | Availability calendar, both locales | 02c |
| `src/app/en/page.tsx` | English homepage | 03 |
| `src/lib/i18n/dictionaries/en.ts` | English strings | 03 |
| `src/app/en/individuell-coaching/page.tsx` | English service page | 04 |
| `src/app/en/business-coaching/page.tsx` | English service page | 04 |
| `src/app/en/om-oss/page.tsx` | English about page | 04a |
| `src/app/en/kontakt/page.tsx` | English contact page | 04a |
| `src/components/json-ld.tsx` | Structured data | 05 |
| `src/lib/i18n/config.ts` | Locale config and path helpers | 05 |
| `src/lib/i18n/index.ts` | Dictionary type contract | 05 |
| `next.config.ts` | Public route redirects | 05 |
| `src/app/klient-login/page.tsx` | Pre-auth client login | 06 |
| `src/app/coach-login/page.tsx` | Pre-auth coach login | 06 |
| `src/app/logga-in/page.tsx` | Pre-auth login entry | 06 |
| `src/app/cvb-base/layout.tsx` | CVB Base redirect boundary | 06 |

## Legacy public-copy documents — copy drift risk

None of these are imported by production code; Markdown files are not referenced from
`src/` anywhere at HEAD. Risk is that a reader treats them as current copy.

| Document | Imported by production code | Referenced in current docs | Status and drift risk |
| --- | --- | --- | --- |
| `docs/homepage-copy.md` | No | Yes — `docs/README.md`, `docs/copy-style-guide.md` | **Stale.** Describes the retired "Executive coaching och ledningsstöd" positioning with Executive coaching and Ledningsgruppscoaching sections. Directly contradicts the current two-path model. Highest drift risk. |
| `docs/executive-coaching-copy.md` | No | Yes — `docs/README.md` | **Stale.** Full copy deck for the retired Executive coaching service, written for the former "Forsa" brand. |
| `docs/copy-style-guide.md` | No | Yes — `docs/README.md` | **Partly stale.** Contains sections "How to write about executive coaching" and "How to write about ledningsgruppscoaching", both retired services. |
| `docs/forsa-reference-audit.md` | No | Yes — `docs/README.md` | **Stale.** Positions the practice as a premium executive coaching and leadership advisory partner under the former Forsa brand. |
| `docs/project-brief.md` | No | Yes — `docs/README.md` | **Stale.** Describes executive coaching, leadership development and management team coaching for companies. |
| `docs/README.md` | No | No | **Stale index.** Links to all of the above, including a row for `executive-coaching-copy.md`. |
| `CONTENT-REVIEW.md` | No | No | **Current.** Standing approval record for public copy: unapproved pricing/package claims, the confidentiality principle, no fixed programme formats, and the approved first-conversation wording. |
| `docs/public-site-audit-export.md` | No | No | **Current.** The single-file export this split supersedes for reviewing; left unmodified. |
