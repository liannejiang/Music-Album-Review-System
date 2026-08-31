## Music Album Review System

IFN636 Assessment 1 — Software Requirements Analysis and Design

A web application allowing members to browse albums and submit ratings/reviews,
with admin moderation. Built with React, Node.js/Express, and MongoDB Atlas.

### Roles
- Admin: manage album catalogue, moderate reviews
- Member: browse albums, submit and manage own reviews

### Seeding the catalogue

`backend/scripts/seedAlbums.js` populates the catalogue with 11 albums with
complete metadata and track lists, 9 demo reviewer accounts, and reviews
linking them to most of the albums. It's idempotent — albums are matched by
`title` + `artistName`, users by `email`, and reviews by their
`{ userId, albumId }` pair (the same compound key the schema enforces
uniqueness on) — so it's safe to run more than once, including against a
completely fresh database (e.g. right after provisioning EC2), without
creating duplicates.

```
cd backend
npm run seed:albums
```

Requires `MONGO_URI` to be set in `backend/.env` (see `.env.example`).

**Demo reviewer accounts.** These are demonstration-only logins seeded for
grading/walkthrough purposes, not real user data — they share one
deliberately public password, so **do not treat it as a secret**: it is
meant to be documented here in plain text, unlike `MONGO_URI` or
`JWT_SECRET`.

| Email | Password |
|---|---|
| brad@example.com | `Demo1234` |
| mika@example.com | `Demo1234` |
| henry@example.com | `Demo1234` |
| kenny@example.com | `Demo1234` |
| laios@example.com | `Demo1234` |
| dio@example.com | `Demo1234` |
| giorno@example.com | `Demo1234` |
| jolene@example.com | `Demo1234` |
| josuke@example.com | `Demo1234` |

Each has `role: 'user'`. One album (*In Rainbows*) is deliberately left
without any reviews, to demonstrate the "No ratings yet" state.
