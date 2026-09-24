# OrganSync 🫀
### Organ donation and transplant coordination portal

OrganSync brings donor pledges, recipient requests, hospital review, medical records, and case administration into one application. It is a **project prototype for coordination and basic screening**. Its matching output does not establish clinical compatibility or determine who should receive an organ.

## Overview

Donors can register and pledge organs. Recipients can submit requests and upload medical records. Hospital users can review records and potential donor matches, then manage allocation and appointment workflows. Administrators can review users, hospitals, cases, and audit logs.

## Features

| Area | Current functionality |
| --- | --- |
| Accounts | Registration, login, JWT authentication, and donor, recipient, hospital, and admin roles |
| Donors | Manage pledges and respond to incoming requests |
| Recipients | Create requests, view request status, and manage medical records |
| Hospitals | Review medical evidence, screen potential matches, and manage operations and allocations |
| Medical records | Upload PDF files, extract selected report fields, and verify records through hospital review |
| Administration | View statistics, manage accounts, verify hospitals, inspect cases and audit logs |
| Notifications | Email integration through Nodemailer for supported workflows, when mail credentials are configured |

## How matching works

The hospital matching endpoint filters **active donor pledges** by requested organ and **exact blood-group equality**. The recipient screening workflow also uses hospital-verified medical records where applicable. Results include the factors used and the limits of the screening.

**Clinical boundary:** The application does not calculate an HLA compatibility score, perform a crossmatch, assess clinical suitability, or make an allocation decision. Qualified transplant professionals must confirm all medical evidence, eligibility, and allocation decisions.

## Technology

| Layer | Stack |
| --- | --- |
| Frontend | React 18, Create React App, CSS, Fetch API |
| Backend | Node.js, Express, JWT, bcrypt |
| Database | MongoDB with Mongoose |
| Files and email | Multer, pdf-parse, Nodemailer |

## Repository layout

```text
OrganSync-New/
├── backEnd/
│   ├── config/          # Database connection
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication and role checks
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # PDF extraction and email
│   └── index.js         # Express entry point
├── frontEnd/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── config/api.js
│       ├── context/AuthContext.js
│       └── pages/       # Role-specific dashboards and pages
└── README.md
```

## Run locally

### Prerequisites

- Node.js and npm
- A MongoDB instance or MongoDB Atlas connection string

### Backend

```bash
cd backEnd
npm install
```

Create `backEnd/.env`:

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DATABASE=organsync
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
# Optional: required for email notifications
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

Then run `npm run dev` (or `npm start`). The API listens on `http://localhost:8080` by default. Keep `.env` out of version control.

### Frontend

In another terminal:

```bash
cd frontEnd
npm install
npm start
```

The Create React App development server normally opens at `http://localhost:3000`. For a deployed backend, create `frontEnd/.env` **before building**:

```env
REACT_APP_API_BASE_URL=https://your-backend.example/api
REACT_APP_API_URL=https://your-backend.example/api/users
```

Both variables are needed in this version: `src/config/api.js` uses `REACT_APP_API_BASE_URL`, while `src/context/AuthContext.js` uses `REACT_APP_API_URL`. Restart the frontend after changing them. For local development, the source defaults to `http://localhost:8080/api` and `http://localhost:8080/api/users`.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/users/register` | Create an account |
| POST | `/api/users/login` | Sign in |
| GET / POST | `/api/pledges/:userId` | View or create donor pledges |
| POST | `/api/requests` | Create a recipient request |
| GET | `/api/users/:userId/requests` | View a recipient's requests |
| GET | `/api/donor/:donorId/requests` | View donor requests |
| POST | `/api/medical-records/:userId/upload` | Upload a medical record |
| POST | `/api/medical-records/:recordId/analyze` | Extract supported PDF data |
| PATCH | `/api/medical-records/:recordId/verify` | Hospital verification |
| POST | `/api/match/hospital` | Basic donor screening |
| GET | `/api/match/recipient/:recipientId` | Recipient match screening |
| POST | `/api/allocations` | Start an allocation record |
| GET | `/api/admin/stats` | Admin overview |

Protected endpoints require `Authorization: Bearer <token>`. Some operations also require the appropriate role or verified hospital status; see `backEnd/routes/` for their exact access rules and request bodies.

## Current scope

This repository contains an evolving project prototype. Its matching rules are intentionally limited, extracted PDF data requires verification, and deployment needs valid MongoDB, JWT, and frontend API configuration. Do not use it to make real clinical or allocation decisions.

## Author

[Mohammad Saif](https://github.com/MohammadSaif09)
