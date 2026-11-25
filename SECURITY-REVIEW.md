# Security review

Review date: 2026-11-25

## Finding

### MEDIUM — Comment authorship can be spoofed

**Confidence:** 9/10
**Affected files:** `firestore.rules` (lines 14–17), `src/services/comments/comments-service.ts` (lines 67–68), and `src/features/comments/components/comments-panel.tsx` (line 139)

The Firestore create rule requires `authorId` to match the authenticated user's UID, but it accepts any non-empty `author` string up to 120 characters. An authenticated user can bypass the client UI and write a comment directly to Firestore with another person's name. The comments interface displays that string as the comment author, which can mislead readers about who posted it.

**Recommendation:** Do not trust a client-supplied display name for authorship. Derive the displayed identity from a trusted source keyed by the authenticated UID, or assign and validate authorship on a trusted server.

**Applicability:** This finding applies if the checked-in rules are deployed to the Firebase project. The deployed Firestore rules and Firebase project configuration were not accessible during this review.

## Review notes

- `.env.local` is ignored by Git and was not found among tracked project files. Firebase Web configuration values are intended to be available to client applications; privileged Admin SDK credentials must not be placed in the frontend.
- `npm audit` reported no known vulnerabilities at the time of review.
- No other confirmed exploitable issues were identified in the reviewed project files.

## Overall assessment

Moderate risk for the comments feature because authenticated users may impersonate another commenter. The production Firebase posture remains unverified until deployed rules and project settings are checked.
