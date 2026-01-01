# Pepo Badge System

This document describes the non-gamified badge system for Pepo: definitions, criteria, backend behavior, frontend display, and abuse prevention.

## Goals
- Recognize giving behavior and build trust.
- Calm, respectful UI: no leaderboards, ranking, or public comparisons.
- Badges are read-only and cannot be claimed manually by users.

## Badge Definitions (seeded)
Each badge has: `code`, `name`, `description`, `criteria`, `icon`, `color`, `isNGO`, `isAutoAward`.

Badges seeded:
- FIRST_GIVER: First successful give (criteria: 1 successful give)
- VERIFIED_GIVER: Verified account + successful give
- CONSISTENT_GIVER: 10+ successful gives
- COMMUNITY_GIVER: Contribution to community drives
- IMPACT_GIVER: High-impact items distributed
- VERIFIED_NGO: NGO verified by admin
- TRANSPARENT_NGO: Regular transparency reports
- PARTNER_NGO: Official partners
- SEASONAL_GIVER: Participation in seasonal drives
- COMMUNITY_HERO: Exceptional local contributions over time

## Data model
- `BadgeDefinition` stores metadata about badges.
- `BadgeAssignment` records awarded badges; links to `userId` or `ngoProfileId` and includes `awardedAt`, `awardedById`, `reason`, `isRevoked`.
- Unique constraints prevent duplicate assignments for the same badge+entity.

Files changed:
- `backend/prisma/schema.prisma` — added `BadgeDefinition` and `BadgeAssignment` models
- `backend/prisma/seed.ts` — added initial badge definitions

## Backend logic
- Badge assignments are created server-side only.
- Auto-award occurs when a `Pickup` is verified (successful give):
  - FIRST_GIVER: awarded when first pickup completes for giver
  - VERIFIED_GIVER: if giver has a verified account and at least one successful give
  - CONSISTENT_GIVER: when giver reaches 10 successful gives
- When an admin verifies an NGO, `VERIFIED_NGO` badge is awarded automatically.
- Assignments are idempotent; duplicates are prevented by DB constraints. Errors are logged to audit logs.

Files changed:
- `backend/src/ngo/ngo.service.ts` — award badges on pickup verification
- `backend/src/admin/admin.service.ts` — award VERIFIED_NGO on NGO verification
- `backend/src/badges/*` — new controller and module for badge endpoints

## Frontend UI
- `apps/web/components/Badge.tsx` — lightweight badge component (calm design)
- `apps/web/app/profile/page.tsx` — displays badges on user profile
- `apps/web/app/giveaway/[id]/page.tsx` — displays giver badges on giveaway detail
- `apps/admin/app/badges/page.tsx` — admin audit view for badge assignments

Design constraints followed:
- No leaderboards or rankings
- Badges are read-only; no UI to claim badges
- Badge display is calm, non-prominent, and respectful

## Admin audit
- Admins can view recent badge assignments at `GET /api/badges/admin/assignments`.
- Audit logs (`auditLog`) are written when badges are awarded or an error occurs.

## Abuse prevention
- Badges are auto-awarded only for verified database events (completed `Pickup`).
- Unique DB constraints prevent duplicate badge records.
- Awarding occurs server-side; clients cannot create badge assignments.
- Admin audit view allows reviewers to spot suspicious patterns (rapid assignments, repeated revocations).
- Future mitigations: heuristics to detect collusion (same users repeatedly awarding to each other), rate limits, manual revocation by admins.

## How to test
1. Run `npx prisma migrate dev` to apply schema changes.
2. Run `npm run seed` in backend to seed badge definitions.
3. Start backend and admin/web apps and exercise a pickup code verification to see badges awarded.
4. Visit Admin → Badges to audit assignments.

## Next steps / Improvements
- Add UI to show badge details in a non-intrusive modal.
- Add server-side background job to compute more complex badges (e.g., IMPACT_GIVER based on item categories and beneficiaries).
- Add automated tests around badge awarding logic.

