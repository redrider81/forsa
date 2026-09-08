# P0-A — Public booking communication: release runbook

Internal deployment runbook. Written for the person performing the deployment.

This file contains no secrets, no real recipient addresses, no production
project identifiers and no customer data. Nothing here should ever be filled
in with a real value — configuration lives in the hosting platform's
environment settings, never in the repository.

---

## Scope

**P0-A deploys the public first-contact chain:**

```text
visitor submits a booking request
→ pending public booking request (atomic, one availability window reserved)
→ two durable notification rows written in the same transaction
→ post-commit send attempts: customer receipt + operator notification
→ pending request visible on the coach dashboard and in Kalender
→ coach accepts or declines → customer notification row + post-commit send
→ coach-only retry for a failed send
→ coach-only notice when email is running in simulated mode
```

**P0-A does not deploy, and must not appear to:**

- Client creation
- Supabase Auth user creation
- Profiles
- CVB Base invitations or access
- Account activation or client onboarding
- Engagement taxonomy changes
- Session creation
- Coaching-agreement or development-goal creation

An accepted introductory-call request is **not** an accepted coaching client.
Client creation stays manual and happens later, after the introductory call.

**Availability windows are unchanged by this release:** Monday–Friday only,
exactly four fixed two-hour windows (08–10, 10–12, 13–15, 15–17), and only
`pending` and `accepted` hold a window. A two-hour window is the period within
which Carolina may call — never the length of the call.

---

## Required release unit

These two commits form one release unit and must ship together:

```text
aac328e821e8ebef573793bc47a32988c322198f
feat: complete public booking communication flow

d854f2bb8901843a17b9ab853017753820e9cc96
feat: surface booking email operational state
```

The first commit is unusable without the second in an operational sense: the
second is what makes simulated mode visible to the coach, and without it a
production environment could silently run in simulated mode.

**This runbook's own commit has no runtime effect** and is not required for the
deployment to function. Including it in the same deployment is preferred so the
deployed tree carries its own instructions, but omitting it changes nothing.

---

## Pre-deployment checks

- [ ] Branch reviewed and clean; `git status --short` is empty.
- [ ] `npm run typecheck`, `npm run test` and `npm run build` all pass locally.
- [ ] The migration below has been read and understood by the deployer.
- [ ] Database backup / restore: **this repository documents no backup or
      rollback convention.** Confirm the hosting database provider's own
      point-in-time recovery or backup state before applying the migration.
- [ ] Sender domain verified. **Not checkable from this repository** — the
      sender identity is verified in the email provider's own account, outside
      version control. Confirm it there before enabling real sending.
- [ ] Environment variables configured server-side in the hosting platform's
      environment settings (see table below).
- [ ] `EMAIL_SEND_ENABLED=true` is set **only** in the environment intended to
      deliver mail. Any other environment must leave it unset or not equal to
      the exact string `true`.
- [ ] `EMAIL_FROM` matches a sender identity verified with the email provider.
- [ ] `RESEND_API_KEY` is valid and set server-side only.
- [ ] Operator recipient resolves — either `BOOKING_OPERATOR_EMAIL` is set, or
      the established server-side fallback is accepted.
- [ ] No mail-related value carries a `NEXT_PUBLIC_` prefix. Anything with that
      prefix is compiled into the browser bundle and is public.
- [ ] The environment is not about to go live while unknowingly simulated —
      see **Confirming the environment is not simulated** below.

### Variables

| Variable | Required for real sends | Exposure |
| --- | --- | --- |
| `EMAIL_SEND_ENABLED` | Yes — must be exactly `true` | Server only |
| `RESEND_API_KEY` | Yes | Server only, secret |
| `EMAIL_FROM` | Yes — a verified sender identity | Server only |
| `BOOKING_OPERATOR_EMAIL` | No — falls back to the established server-side operator address | Server only |

Any value other than the exact string `true` for `EMAIL_SEND_ENABLED` — including
`TRUE`, `1` and `yes` — is treated as simulated mode.

### Confirming the environment is not simulated

Do this **without** reading any secret value back:

1. Sign in to CVB Base as the coach.
2. Open `/cvb-base`.
3. If the notice **"E-postutskick är i simulerat läge"** is shown, real sending
   is off in that environment. If the notice is absent, real sending is on.

There is deliberately no positive "email is healthy" indicator: configuration
being enabled is not evidence that anything reached an inbox.

---

## Migration deployment

One additive migration ships with this release:

```text
supabase/migrations/20260908090000_cvb_base_public_booking_notifications.sql
```

It adds `locale` and `dispatch_token` to `public_booking_requests`, creates the
`public_booking_notifications` ledger with its RLS policy and read-only grants,
and adds or replaces four functions. It grants no write access to any browser
role and weakens no existing policy.

**This repository does not document a Supabase migration deployment process,
and there is no CI workflow that applies migrations.** Therefore:

> Apply the pending Supabase migration using the project's established
> deployment process. Confirm that
> `20260908090000_cvb_base_public_booking_notifications.sql` is applied before
> application code relying on it serves traffic.

Do not invent a command. If the established process is not known to the person
deploying, stop and establish it before continuing — application code from this
release will fail against a database without the migration, because
`create_public_booking_request` changes its return shape.

---

## Application deployment

Deploy the application **only after** the migration has been applied
successfully.

The order matters and is not interchangeable: the new booking route reads
`request_id` and `dispatch_token` from the RPC's result. Against an
un-migrated database the RPC has its old single-value shape and every public
booking submission will fail.

---

## Post-deployment internal test

Use a controlled internal test identity — an address the deployer owns. Never a
real prospective client, and never an address taken from existing data.

```text
 1. Submit one test public booking request.
 2. Confirm the booking is pending.
 3. Confirm the selected public time window is blocked.
 4. Confirm customer receipt is received.
 5. Confirm Carolina/operator notification is received.
 6. Confirm the request appears in the coach dashboard.
 7. Accept the request as the coach.
 8. Confirm acceptance email is received.
 9. Confirm the time window remains blocked.
10. Submit a separate test request.
11. Decline it as the coach.
12. Confirm decline email is received.
13. Confirm the declined window becomes available again.
14. Confirm no client, Auth user, profile, engagement, agreement, session,
    goal, invitation, or CVB Base access was created.
```

Notes for steps 4, 5, 8 and 12: what is being confirmed is that the message
arrived. The system itself only records that the provider *accepted* the send —
it has no delivery, open or bounce tracking, so the ledger showing `sent` is not
by itself proof of arrival.

Clean up afterwards: the test requests remain as history. Decline or cancel any
test request still holding a window, so no real visitor sees a blocked slot.

### Retry check — controlled environments only

```text
Only in a non-production or explicitly approved controlled test environment:
- Simulate a provider send failure.
- Confirm notification state becomes failed.
- Confirm booking status and slot behavior remain correct.
- Retry as coach.
- Confirm only the notification changes state.
- Confirm booking request count and booking status are unchanged.
```

Do not deliberately break live production email to exercise this. There is no
approved production fault-injection mechanism in this repository. If a genuine
failure occurs in production, the same retry control on `/cvb-base` under
**"Mejl som behöver skickas om"** is the intended response.

---

## Rollback / containment

**Stopping real email immediately.** Change `EMAIL_SEND_ENABLED` away from the
exact string `true` using the hosting platform's normal environment
configuration process, then redeploy or restart according to that platform's
normal procedure. Confirm afterwards that `/cvb-base` shows the simulated-mode
notice — that is the signal that nothing is leaving the system.

**Data.** If the migration has been applied, do not casually delete booking or
notification history. Booking rows are the record of who asked for a
conversation; notification rows are the record of what was attempted. Neither is
regenerable. This repository documents no destructive rollback for either, and
none should be improvised.

**Failed notifications.** Investigate the cause and fix the configuration first,
then retry from `/cvb-base`. Specifically:

- Do not mark failed notifications resolved manually — there is no such feature,
  by design.
- Do not retry a notification already recorded as `sent`; the retry control
  refuses this, and the database treats `sent` as terminal.
- A retry never re-creates a booking and never repeats an accept or decline.

**Reverting the application.** The application can be reverted to the previous
release independently of the migration: the migration is additive, and the
previous application code does not read the new table. The one exception is
`create_public_booking_request`, whose return shape changed — reverting the
application without reverting the database will break public booking
submissions. Treat an application revert as requiring a matching database
decision, and get that decision before acting.

---

## Success criteria

P0-A may move from

```text
P0-A: PASS WITH LIMITATIONS
```

to

```text
P0-A: PASS
```

when all of the following hold:

- [ ] Migration applied successfully.
- [ ] Server configuration checked without exposing any secret value.
- [ ] Simulated-mode notice **absent** in the environment intended to send real
      mail.
- [ ] Receipt, operator notification, acceptance and decline each verified with
      controlled internal test data.
- [ ] Dashboard visibility verified by an authenticated coach.
- [ ] Accepted window confirmed still blocked; declined window confirmed
      released.
- [ ] No client, Auth user, profile, engagement, agreement, goal, session,
      invitation or CVB Base access created by any step.
- [ ] Failed-notification retry tested safely outside production, or through an
      explicitly approved controlled method.
- [ ] No security regression observed.

The limitation being lifted is specifically this: at the time P0-A was written,
its end-to-end HTTP path could not be exercised against a live database, and no
real provider send was ever performed. Everything above is what closes that gap.

---

## What this release intentionally does not track

- Inbox delivery
- Message opens
- Bounces
- Spam complaints

There is no delivery webhook. `sent` in the ledger means the provider accepted
the send request, and nothing more. Do not report it to anyone as proof that a
person received an email.
