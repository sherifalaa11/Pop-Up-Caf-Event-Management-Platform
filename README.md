# ☕ PopEyez — Pop-Up Café Event Management Platform

A full-stack web application that centralises the entire lifecycle of a pop-up café event:
venue search & booking, guided daily workflow & task management, budgeting, vendor sourcing &
invoicing, guest invitations & RSVPs, day-of operations, and post-event feedback & reporting.

This is **Milestone 2** (implementation). It implements the requirements written in **Milestone 1**
(the 50 functional + 5 non-functional requirements) and follows the Milestone 2 user-journeys
document for all five stakeholder roles.

- **Frontend:** React 19 + Vite + React Router
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)

---

## 👥 Team Members

| Name | ID | Suggested area |
|------|----|----------------|
| Sherif Alaa | 22001262 | Backend (controllers / routes) |
| John Gerges | 22001221 | Backend (models / database / seed) |
| Seif Mostafa | 22001244 | Frontend (organizer + venue/booking pages) |
| Boshraa Sherif | 22001328 | Frontend (staff / vendor / guest / owner pages) |
| Kenzy Bekir | 22001327 | UI / styling + documentation |

---

## 🧰 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19, Vite, React Router 7 (plain `fetch`, no UI library; `jspdf` only for venue-layout PDF export) |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (`jsonwebtoken`) + password hashing (`bcryptjs`) |

---

## 📁 Project Structure

```
Pop-Up-Caf-Event-Management-Platform/
├── backend/
│   ├── server.js              # Express app, mounts all /api routes
│   ├── config/db.js           # MongoDB connection
│   ├── middleware/auth.js     # JWT verify (protect) + role guard (requireRole)
│   ├── models/                # 13 Mongoose schemas (User, Venue, Event, ...)
│   ├── controllers/           # one controller per resource (business logic)
│   ├── routes/                # one router per resource
│   └── seed/seed.js           # wipes + inserts dummy data, prints demo logins
└── frontend/
    └── src/
        ├── api.js             # fetch wrapper (adds JWT, CSV download helper)
        ├── auth.jsx           # AuthContext (login/register/logout in localStorage)
        ├── App.jsx            # routes + role-based layout
        ├── index.css          # café-themed design system
        ├── lib/layoutExport.js # venue layout → PNG picture / PDF file export helpers
        ├── components/        # Sidebar, Layout, ProtectedRoute, LayoutDesigner, Toast, ui
        └── pages/             # role-grouped pages (incl. DesignLayout = "Venue Layout")
```

---

## 🚀 Setup & Run (local)

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** running locally (default `mongodb://127.0.0.1:27017`)
  - macOS (Homebrew): `brew services start mongodb-community`
  - or run `mongod` manually

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env        # optional – defaults already work locally
npm run seed                # populate the database with dummy data
npm run dev                 # starts API on http://localhost:3000
```

### 2. Frontend (in a second terminal)
```bash
cd frontend
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open **http://localhost:5173** and log in with one of the demo accounts below.

> **Note on the port:** the backend runs on the `PORT` in `backend/.env` (currently **3000**).
> The frontend talks to it via `BASE` in `frontend/src/api.js` — if you change the port, update both.
> (Avoid port 5000 on macOS, which is reserved for AirPlay.)

---

## 🔑 Demo Accounts

There is **one primary login per role** (the five below) — all using the password **`password123`**.
The seed also adds supporting accounts (extra staff/vendors/guests/owner) so that every list,
filter and dashboard is populated with data.

| Role | Primary login | Extra accounts |
|------|---------------|----------------|
| Event Organizer | `organizer@popeyez.com` | — |
| Team Member / Staff | `staff@popeyez.com` | `staff2@popeyez.com` … `staff5@popeyez.com` |
| Vendor / Supplier | `vendor@popeyez.com` | `vendor2@popeyez.com`, `vendor3@popeyez.com` |
| Guest | `guest@popeyez.com` | `guest2@popeyez.com` |
| Venue Owner | `owner@popeyez.com` | `owner2@popeyez.com` |

After logging in you are taken to the home page for your role; the sidebar shows only the
features relevant to that role.

---

## 🌱 Dummy Data

The database is populated by **`backend/seed/seed.js`** (run with `npm run seed`). It:

1. Connects to MongoDB and **clears** all collections.
2. Inserts users for every role, ~7 venues across cities, 3 events (one past, one today,
   one upcoming), bookings, tasks, budgets + expenses, sourcing requests, invoices, guests
   with mixed RSVP/dietary/check-in states, notifications, feedback, and messages.
3. Prints the demo login credentials to the console.

**To reset the data at any time, just run `npm run seed` again.**

---

## ⚙️ Environment Variables (`backend/.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | API port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/popeyez` | Database connection string |
| `JWT_SECRET` | `popeyez_dev_secret_change_me` | Secret used to sign login tokens |

Sensible defaults are baked into the code, so the app runs even without a `.env` file.

---

## 🗺️ Implemented User Journeys

- **Event Organizer** — register/login, manage stakeholder accounts (create + deactivate +
  permissions), browse/filter/shortlist venues, request bookings, create events, schedule &
  milestones, assign & track tasks, budgets & expenses, **design the venue layout on a dedicated
  "Venue Layout" page (drag-and-drop floor plan, share with the setup team, export as a PNG picture
  or a PDF file)**, send sourcing requests, review invoices, invite guests, day-of dashboard &
  communications, feedback & reports.
- **Team Member / Staff** — login, see assigned events & tasks, update task status, view the
  shared floor plan, check guests in, mark vendor arrivals, day-of dashboard.
- **Vendor / Supplier** — login/register, edit profile (supplies & pricing), accept/decline
  sourcing requests, update delivery status, submit & track invoices, message organizers.
- **Guest** — view invitations, RSVP with dietary preferences, receive day-of notifications
  (mark as seen), submit post-event feedback.
- **Venue Owner** — register, manage listings (CRUD + availability), respond to booking
  requests (approve/decline/counter-message), performance dashboard.

---

## ✅ Requirements Traceability (Milestone 1 → Milestone 2)

Every functional requirement from the Milestone 1 submission is implemented. Each row lists the
main API endpoint and the UI location.

| FR | Requirement | API endpoint | Where in the UI |
|----|-------------|--------------|-----------------|
| FR-01 | Create an account | `POST /api/auth/register` | Register page |
| FR-02 | Log in securely | `POST /api/auth/login` | Login page |
| FR-03 | Edit profile | `PUT /api/users/me` | Vendor → My Profile (any role) |
| FR-04 | Vendor upload products/services | `PUT /api/users/me` | Vendor → My Profile |
| FR-05 | Venue owner manage venue info & photos | `POST/PUT /api/venues` | Owner → My Listings |
| FR-06 | Assign permissions to team members | `PUT /api/users/:id` | Organizer → Team → Permissions |
| FR-07 | Reset password | `POST /api/auth/reset-password` | Login → “Forgot password?” |
| FR-08 | Browse venues | `GET /api/venues` | Organizer → Venues |
| FR-09 | Filter venues (budget/location/capacity) | `GET /api/venues?city=&minCapacity=&maxPrice=&date=` | Venues filters |
| FR-10 | View venue descriptions/images/facilities | `GET /api/venues/:id` | Venue details |
| FR-11 | Shortlist venues | `POST /api/venues/:id/shortlist` | Venues (★ button) |
| FR-12 | Request a venue booking | `POST /api/bookings` | Venue details |
| FR-13 | Owner approve/reject booking | `PATCH /api/bookings/:id/respond` | Owner → Booking Requests |
| FR-14 | Receive booking updates | `GET /api/bookings` | Organizer → Bookings |
| FR-15 | Cancel booking before confirmation | `PATCH /api/bookings/:id/cancel` | Organizer → Bookings |
| FR-16 | Create an event | `POST /api/events` | Organizer → Events |
| FR-17 | Define schedule & milestones | `PUT /api/events/:id` | Event → Overview |
| FR-18 | Assign planning tasks | `POST /api/tasks`, `PATCH /api/tasks/:id/assign` | Event → Tasks |
| FR-19 | Team member update task status | `PATCH /api/tasks/:id/status` | Staff → My Tasks |
| FR-20 | Daily operations checklist | `GET /api/tasks?event=` | Event → Tasks |
| FR-21 | Create & manage budget | `PUT /api/budget/event/:id` | Event → Budget |
| FR-22 | Record expenses | `POST /api/budget/event/:id/expense` | Event → Budget |
| FR-23 | Budget summary & remaining balance | `GET /api/budget/event/:id` | Event → Budget |
| FR-24 | Design seating/booth layout (drag & drop, export PNG/PDF) | `PUT /api/events/:id/layout` | Organizer → **Venue Layout** (and Event → Layout) |
| FR-25 | Team access shared layout | `GET /api/events/:id/layout` | Staff → Floor Plan |
| FR-26 | Monitor activities from a dashboard | `GET /api/events/dashboard` | Organizer → Dashboard |
| FR-27 | Track task completion & vendor arrivals | `GET /api/events/:id/dayof` | Event → Day-of |
| FR-28 | Send supply requests to vendors | `POST /api/sourcing` | Event → Sourcing |
| FR-29 | Vendor respond to supply requests | `PATCH /api/sourcing/:id/respond` | Vendor → Sourcing Requests |
| FR-30 | Vendor update delivery progress | `PATCH /api/sourcing/:id/delivery` | Vendor → Sourcing Requests |
| FR-31 | View delivery updates | `GET /api/sourcing` | Event → Sourcing / Day-of |
| FR-32 | Vendor upload invoices | `POST /api/invoices` | Vendor → Invoices |
| FR-33 | Review submitted invoices | `GET /api/invoices?event=` | Event → Sourcing (Invoices) |
| FR-34 | Approve/reject invoices | `PATCH /api/invoices/:id/review` | Event → Sourcing (Invoices) |
| FR-35 | In-platform messaging (organizer/vendor) | `POST /api/messages` | Organizer/Vendor → Messages |
| FR-36 | Send digital invitations | `POST /api/guests` | Event → Guests |
| FR-37 | Guest RSVP | `PATCH /api/guests/:id/rsvp` | Guest → My Invitations |
| FR-38 | Submit dietary preferences | `PATCH /api/guests/:id/rsvp` | Guest → My Invitations |
| FR-39 | View RSVP responses | `GET /api/guests?event=` | Organizer → Guests / Event → Guests |
| FR-40 | Check in guests | `PATCH /api/guests/:id/checkin` | Staff → Guest Check-In |
| FR-41 | Send announcements & reminders | `POST /api/notifications` | Event → Day-of |
| FR-42 | Guests receive live notifications | `GET /api/notifications/mine` | Guest → Notifications |
| FR-43 | Export guest attendance | `GET /api/reports/attendance/:id?format=csv` | Organizer → Reports |
| FR-44 | Create feedback forms / request feedback | `POST /api/feedback/request` | Event → Feedback |
| FR-45 | Guest submit feedback | `POST /api/feedback` | Guest → Feedback |
| FR-46 | Generate attendance reports | `GET /api/reports/attendance/:id` | Organizer → Reports |
| FR-47 | Financial summaries & expense reports | `GET /api/reports/financial/:id` | Organizer → Reports |
| FR-48 | Rate vendor performance | `POST /api/reports/vendor-rating/:vendorId` | Organizer → Reports |
| FR-49 | Export event analytics reports | `GET /api/reports/analytics/:id` + CSV | Organizer → Reports |
| FR-50 | Review summarized feedback trends | `GET /api/feedback/trends/:id` | Event → Feedback |

### Non-Functional Requirements

| NFR | Requirement | How it is addressed |
|-----|-------------|---------------------|
| NFR-01 | Performance (pages load < 3s) | Lightweight queries and simple payloads; data loads per page/tab on demand |
| NFR-02 | Privacy (role-based access) | `requireRole` middleware on the API **and** a role-aware sidebar that only shows permitted features |
| NFR-03 | Reliability (data backups) | Documented operational step — back up MongoDB with `mongodump` on a schedule (see *Assumptions*) |
| NFR-04 | Security (protect accounts) | Passwords hashed with **bcrypt**; sessions use signed **JWT** tokens |
| NFR-05 | Performance (RSVP/notifications < 1s) | Single-document writes for RSVP and bulk-insert for notifications |

---

## 📌 Assumptions

Because some Milestone-1 / user-journey features are heavier than a student-level scope, they are
implemented in a **simplified but functional** way:

All features in the user-journey document are implemented and functional. A few items that would
normally rely on external services are delivered as **in-app equivalents** so the project runs
locally with no accounts, secrets, or extra setup:

- **Invitations, day-of communications, reminders and feedback requests** are delivered as
  **in-app notifications** (no real email/SMS is sent). Organizers can see, per guest, whether each
  message was received and seen (Event → Day-of → Communication Log).
- **Vendors are notified** when an organizer reviews their invoice via an in-app **Message**.
- **Check-in** is name-based: each guest sees a **check-in code** and a confirmation badge once
  staff check them in (no physical QR scanner needed).
- **Venue photos** can be added as an **image URL** (rendered as a real photo); an emoji is used as a
  fallback when no image is provided.
- **Invoice attachments** are provided as a **link** (URL to an itemized breakdown / receipt) rather
  than an uploaded file.
- **Password reset** is an in-app form (enter email + new password) rather than an emailed link.
- **Report export** produces a **CSV download** (attendance, financial, venue performance); the
  report “PDF” is done via the browser’s Print dialog (Print → Save as PDF).
- **Venue layout export** produces a **real downloadable PNG picture and PDF file** (built from the
  layout via SVG → canvas, with `jspdf` for the PDF) — see Organizer → Venue Layout / Event → Layout
  and Staff → Floor Plan.
- **Real-time dashboards** refresh on page load / via a Refresh button (polling), not WebSockets.
- **Automatic 24h backups (NFR-03)** are treated as an operational task (e.g. a scheduled
  `mongodump`) rather than an in-app feature.

---

## 🧩 NPM Scripts

**backend/**
- `npm run dev` — start API with nodemon (auto-reload)
- `npm start` — start API with node
- `npm run seed` — reset + populate the database

**frontend/**
- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
