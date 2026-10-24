# 🐄 KhamarBari — Livestock & Pet Care Management Ecosystem

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Turso Database](https://img.shields.io/badge/Database-Turso%20SQLite-410099?logo=sqlite)](https://turso.tech/)
[![Cloudflare Pages](https://img.shields.io/badge/Deployment-Cloudflare%20Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com/)
[![Python ML](https://img.shields.io/badge/ML%20Engine-Scikit--Learn%20%2F%20Flask-3776AB?logo=python)](https://scikit-learn.org/)

**KhamarBari** is an end-to-end, enterprise-grade digital platform designed for livestock farmers, pet owners, veterinary clinic receptionists, veterinarians, and system administrators. The ecosystem combines modern web architecture, edge database performance, AI-driven livestock disease prediction, e-commerce marketplace, and interactive telehealth appointment scheduling into a seamless, high-performance web solution.

---

## 📋 Table of Contents

- [✨ Core Capabilities \& Highlights](#-core-capabilities--highlights)
- [🏗️ System Architecture](#️-system-architecture)
- [👥 Role-Based Portals \& Workflows](#-role-based-portals--workflows)
- [🤖 Machine Learning Microservice (\`Pet/\`)](#-machine-learning-microservice-pet)
- [🗄️ Database Architecture \& Schema](#️-database-architecture--schema)
- [📡 API Endpoint Reference](#-api-endpoint-reference)
- [📁 Project Directory Structure](#-project-directory-structure)
- [🔑 Environment Variables \& Configuration](#-environment-variables--configuration)
- [🚀 Local Development \& Setup](#-local-development--setup)
- [🚢 Cloudflare Pages Deployment Guide](#-cloudflare-pages-deployment-guide)

---

## ✨ Core Capabilities & Highlights

1. **Livestock & Pet Medical Lifecycle Management**: Comprehensive digital records tracking species (cow, goat, buffalo, sheep, camel, pets), breed, age, weight, blood group, neutered status, and medical history.
2. **AI-Powered Livestock Disease Predictor**: Integration with a scikit-learn Machine Learning pipeline (`HistGradientBoostingClassifier`) to evaluate cattle vital signs, ruminating patterns, body metrics, and faecal consistency to generate instant health diagnostics and veterinary recommendations.
3. **Veterinary Telehealth & Geolocation Directory**: Searchable veterinarian database filtered by specialization, experience, rating, and geographic proximity using latitude/longitude mapping.
4. **Multi-Role Appointment Scheduling**: Real-time appointment booking between livestock owners and veterinarians with receptionist queue management and instant user notifications.
5. **Livestock Marketplace (E-Commerce)**: Peer-to-peer farmer marketplace to list and purchase milk/dairy products, fresh meat, live animals, animal feed, and farming equipment.
6. **Vaccination Tracking & Automated Reminders**: Preventive healthcare schedule manager tracking vaccine batches, administered dates, and upcoming due dates with customizable reminder intervals.
7. **Receptionist Clinic Operations Panel**: Dedicated receptionist interface for managing multi-doctor queues, assigning doctors, confirming/canceling appointments, and sending updates directly to pet owners.
8. **Admin Operations Suite**: Full administrative governance over user roles, veterinarian approvals, feedback tickets, marketplace oversight, and receptionist-doctor mapping.

---

## 🏗️ System Architecture

KhamarBari utilizes a decoupled, modern hybrid architecture:

```mermaid
graph TD
    Client[Browser Client / PWA] -->|HTTPS Requests| NextServer[Next.js 15 App Router - Edge Runtime]
    NextServer -->|SQL Queries via @libsql/client/web| TursoDB[(Turso Cloud SQLite DB)]
    NextServer -->|POST /api/predict| MLProxy[Next.js ML Route Handler]
    MLProxy -->|REST API over HTTPS| HFSpace[Hugging Face Space / Flask ML Container]
    HFSpace -->|Joblib Pipeline| MLModel[Scikit-Learn HistGradientBoosting Model]
    NextServer -->|Auth & Media| Services[Firebase Auth / Cloudinary Assets]
```

### Key Technical Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15.1 (App Router) | Turbopack powered, React 19 server components, dynamic client hooks |
| **Styling & UI** | Tailwind CSS v4, Radix UI primitives, Lucide React, GSAP | Glassmorphism aesthetics, dark/light themes (`next-themes`), micro-animations |
| **Database** | Turso Cloud SQLite (`libsql`) | Multi-region, low-latency edge database queried via `@libsql/client/web` |
| **ML Engine** | Python 3.11, Flask, Scikit-Learn | Microservice hosting a trained `HistGradientBoostingClassifier` model |
| **Deployment** | Cloudflare Pages (`@cloudflare/next-on-pages`) | Global Edge deployment with `nodejs_compat` runtime compatibility flags |
| **Authentication** | HTTP-Only Session Cookies & Firebase Auth | Secure multi-role access control (`user`, `livestock_farmer`, `receptionist`, `admin`) |

---

## 👥 Role-Based Portals & Workflows

### 1. 🌾 Livestock Owner / Farmer / User (`role: 'user'` or `'livestock_farmer'`)
- **Dashboard Overview**: Immediate view of registered animals, upcoming appointments, pending vaccinations, and recent marketplace orders.
- **Animal Management**: Register livestock/pets with photo uploads, track weight trends, blood groups, and medical notes.
- **AI Health Predictor**: Input clinical observations (temperature, respiratory rate, milk yield, rumination duration, faecal consistency) to receive automated diagnostic risk scores.
- **Appointment Booking**: Find nearby clinics/vets on an interactive map, inspect fees, select timeslots, and schedule appointments.
- **Marketplace**: List farm produce/livestock for sale and purchase feed or equipment from other verified farmers.
- **Vaccination Tracker**: Receive alerts for overdue vaccines and log new doses.

### 2. 🏥 Receptionist (`role: 'receptionist'`)
- **Multi-Doctor Schedule Queue**: Access an aggregated queue of appointments for all assigned clinic doctors (`receptionist_doctors` mapping).
- **Appointment Control**: Confirm, reschedule, reassign veterinarians, or cancel appointments.
- **Instant Patient Notification**: Dispatch customized notification messages straight to the pet owner's dashboard drawer.

### 3. 🩺 Veterinarian (`role: 'veterinarian'`)
- **Profile Directory Listing**: Detailed clinic profile including qualifications, experience, fees, consultation hours, and geographic coordinates.
- **Patient Record Access**: Review complete medical history, vaccination logs, and owner contact details before consultations.

### 4. ⚙️ System Administrator (`role: 'admin'`)
- **Platform Analytics**: High-level telemetry on user counts, active livestock records, total appointments, and marketplace transaction values.
- **User Governance**: Search, update, or elevate user accounts to administrative or receptionist roles.
- **Vet Directory Control**: Onboard, edit, approve, or toggle active status of veterinarians.
- **Receptionist Assignment Engine**: Dynamically map receptionists to single or multiple veterinarians.
- **Feedback Desk**: Review user inquiries and dispatch official admin responses.

---

## 🤖 Machine Learning Microservice (`Pet/`)

The disease prediction engine resides in the `Pet/` directory and is built as a standalone Python Flask API microservice designed for deployment on Hugging Face Spaces (or Docker environments).

### ML Model Pipeline Overview

- **Algorithm**: `HistGradientBoostingClassifier` (Scikit-Learn).
- **Preprocessing**: `ColumnTransformer` with `StandardScaler` for numeric inputs and `OrdinalEncoder` for categorical traits.
- **Dataset**: `Pet/dataset/cattle_dataset.csv` containing livestock health telemetry.
- **Target Label**: `health_status` (Encodes healthy vs. various cattle clinical disease risks).

### Feature Input Set

The model evaluates 13 core clinical indicators:
1. `body_temperature` (°C)
2. `breed_type`
3. `milk_production` (Liters/day)
4. `respiratory_rate` (Breaths/min)
5. `walking_capacity` (Steps/day)
6. `sleeping_duration` (Hours/day)
7. `body_condition_score` (1 - 5 scale)
8. `heart_rate` (BPM)
9. `eating_duration` (Hours/day)
10. `lying_down_duration` (Hours/day)
11. `ruminating` (Hours/day)
12. `rumen_fill` (1 - 5 scale)
13. `faecal_consistency` (`ideal`, `watery`, `firm`, etc.)

### Microservice File Structure (`Pet/`)
- `Pet/app.py`: Flask HTTP server serving `POST /predict`. Implements unit cleaning (stripping `°C`, `days`, `weeks`).
- `Pet/ml/train_cattle_model.py`: Retraining script that compiles dataset and serializes artifacts (`model.pkl`, `labelencoder.pkl`, `featurecols.pkl`).
- `Pet/Dockerfile`: Container configuration exposing port `7860`.
- `Pet/requirements.txt`: Python dependencies (`flask`, `flask-cors`, `scikit-learn`, `pandas`, `joblib`).

---

## 🗄️ Database Architecture & Schema

The application uses an SQLite schema (`schema.sql`) hosted on **Turso Cloud Database**, ensuring zero-latency read replicas on Cloudflare Edge nodes.

```mermaid
erDiagram
    users ||--o{ pets : owns
    users ||--o{ appointments : books
    users ||--o{ marketplace_products : sells
    users ||--o{ marketplace_orders : buys
    users ||--o{ feedbacks : submits
    users ||--o{ notifications : receives
    veterinarians ||--o{ appointments : attends
    pets ||--o{ appointments : subject
    pets ||--o{ vaccinations : receives
    marketplace_orders ||--|{ marketplace_order_items : contains
    marketplace_products ||--o{ marketplace_order_items : listed_in
    users ||--o{ receptionist_doctors : receptionist
    veterinarians ||--o{ receptionist_doctors : vet
```

### Table Definitions

#### 1. `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique user identifier |
| `email` | TEXT | UNIQUE, NOT NULL | Account email address |
| `password` | TEXT | | Hashed password (`bcryptjs`) |
| `name` | TEXT | | Full name |
| `avatar` | TEXT | | Avatar image URL |
| `phone` | TEXT | | Contact phone number |
| `address` | TEXT | | Physical address |
| `role` | TEXT | DEFAULT 'user' | Access level (`user`, `livestock_farmer`, `receptionist`, `admin`) |
| `isVerified` | INTEGER | DEFAULT 0 | Verification status flag |
| `firebaseUid` | TEXT | UNIQUE | Firebase Auth mapping UID |

#### 2. `veterinarians`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique veterinarian identifier |
| `name` | TEXT | NOT NULL | Doctor full name |
| `specialization` | TEXT | | Field of veterinary expertise |
| `clinic` | TEXT | | Associated clinic or hospital name |
| `phone` / `email` | TEXT | | Contact details |
| `qualification` | TEXT | | Medical degrees and certifications |
| `experience` | INTEGER | | Years of experience |
| `rating` | REAL | DEFAULT 0 | Aggregate user review rating |
| `consultationFee`| REAL | | Base fee for consultations |
| `latitude` / `longitude` | REAL | | Geolocation coordinates for map search |

#### 3. `pets` (Livestock & Animals)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique animal identifier |
| `userId` | TEXT | FK -> users.id | Owner reference |
| `name` | TEXT | NOT NULL | Name or tag identifier |
| `species` | TEXT | NOT NULL | Species (`cow`, `goat`, `buffalo`, `sheep`, `camel`, `dog`, `cat`, etc.) |
| `breed` | TEXT | | Specific breed details |
| `age` / `birthDate` | TEXT | | Age specifications |
| `weight` | TEXT | | Current weight |
| `bloodGroup` | TEXT | | Blood type |
| `isNeutered` | INTEGER | DEFAULT 0 | Neutered / spayed status |

#### 4. `appointments`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique appointment ID |
| `userId` | TEXT | FK -> users.id | Booking user |
| `petId` | TEXT | FK -> pets.id | Animal receiving treatment |
| `vetId` | TEXT | FK -> veterinarians.id | Assigned veterinarian |
| `date` / `time` | TEXT | NOT NULL | Appointment schedule |
| `status` | TEXT | DEFAULT 'pending' | Status (`pending`, `confirmed`, `completed`, `cancelled`) |
| `fee` | REAL | DEFAULT 0 | Final consultation fee |

#### 5. `vaccinations`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique record ID |
| `petId` | TEXT | FK -> pets.id | Target animal |
| `name` | TEXT | NOT NULL | Vaccine title (e.g. FMD, Rabies, Anthrax) |
| `dateAdministered`| TEXT | | Date vaccine was given |
| `nextDueDate` | TEXT | | Scheduled next booster date |
| `status` | TEXT | DEFAULT 'completed'| Status (`completed`, `scheduled`, `overdue`) |

#### 6. `marketplace_products` & `marketplace_orders`
- **`marketplace_products`**: Product catalog (`category`: `milk_dairy`, `fresh_meat`, `live_animals`, `animal_feed`, `equipment`), price, unit, stock, and JSON image URLs.
- **`marketplace_orders`**: E-commerce orders linking buyer, shipping address, status (`pending`, `processing`, `shipped`, `delivered`), and line items (`marketplace_order_items`).

#### 7. `feedbacks`, `notifications`, `receptionist_doctors`
- **`feedbacks`**: User support tickets and rating entries with `adminResponse` tracking.
- **`notifications`**: User notifications with read flags and deep links (`actionUrl`).
- **`receptionist_doctors`**: Junction table (`receptionistId`, `vetId`) defining doctor assignments for reception staff.

---

## 📡 API Endpoint Reference

All API routes are situated in `src/app/api/` and run on Cloudflare Edge Runtime (`export const runtime = "edge"`).

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate user, issue HTTP-only `petcare_session` cookie.
- `POST /api/auth/signup`: Create user account, hash password via `bcryptjs`.
- `POST /api/auth/logout`: Clear session cookies.
- `GET /api/auth/check-email?email=...`: Verify if an email address is available.

### 🐾 Livestock & Animals (`/api/pets`)
- `GET /api/pets`: Fetch all registered livestock for the authenticated user.
- `POST /api/pets`: Register a new animal.
- `GET /api/pets/[id]`: Retrieve single animal details with medical records.
- `PUT /api/pets/[id]`: Update animal metrics or medical history.
- `DELETE /api/pets/[id]`: Deactivate / delete animal record.

### 🩺 Veterinarians (`/api/vets`)
- `GET /api/vets`: Search active veterinarians by specialization, clinic, or location.
- `GET /api/vets/[id]`: Get detailed vet profile including ratings and consultation fee.

### 📅 Appointments (`/api/appointments`)
- `GET /api/appointments`: List user's upcoming and past appointments.
- `POST /api/appointments`: Create a new appointment booking.

### 💉 Vaccinations (`/api/vaccinations`)
- `GET /api/vaccinations`: Retrieve vaccination history and upcoming schedules.
- `POST /api/vaccinations`: Add a vaccination entry for an animal.

### 🛒 Marketplace (`/api/marketplace`)
- `GET /api/marketplace/products`: Browse marketplace listings with category filters.
- `POST /api/marketplace/products`: List a new product for sale (Farmers).
- `GET /api/marketplace/orders`: Retrieve buyer/seller order history.
- `POST /api/marketplace/orders`: Checkout cart items and place an order.

### 🤖 AI Predictor & Assistant
- `POST /api/predict`: Proxy request handler that formats clinical metrics and calls the Hugging Face Flask ML service (with fallback clinical rule evaluation).
- `POST /api/chat`: Process interactive AI care assistant queries.

### 🏥 Receptionist Desk (`/api/receptionist`)
- `GET /api/receptionist/appointments`: Fetch appointment queue for doctors assigned to current receptionist.
- `PATCH /api/receptionist/appointments`: Update appointment status, assign doctor, and send notifications.

### ⚙️ Admin Operations (`/api/admin`)
- `GET /api/admin/stats`: Aggregate system telemetry statistics.
- `GET /api/admin/users` & `PATCH /api/admin/users/[id]`: User administration and role management.
- `GET /api/admin/vets` & `POST /api/admin/vets`: Onboard and update veterinarian accounts.
- `GET /api/admin/receptionists` & `POST /api/admin/receptionists`: Manage receptionist-to-doctor assignments.
- `GET /api/admin/feedback` & `POST /api/admin/feedback/[id]`: Review and respond to user feedback tickets.

---

## 📁 Project Directory Structure

```
khamarbari/
├── Pet/                             # Python Machine Learning Microservice
│   ├── dataset/
│   │   └── cattle_dataset.csv       # Training dataset for livestock health
│   ├── ml/
│   │   ├── featurecols.pkl          # Serialized feature list
│   │   ├── labelencoder.pkl         # Serialized target label encoder
│   │   ├── model.pkl                # Trained HistGradientBoosting pipeline
│   │   └── train_cattle_model.py    # Training & serialization script
│   ├── app.py                       # Flask REST server (port 7860)
│   ├── Dockerfile                   # HF Spaces Docker container definition
│   └── requirements.txt             # Python dependencies
├── public/                          # Static assets and media files
├── scripts/                         # Database setup & deployment helper scripts
│   ├── setup-turso-local.js         # Local SQLite setup script
│   ├── seed-turso.js                # Database seeding script (vets, users, pets)
│   ├── push-schema-turso.ts         # Turso cloud schema migration executor
│   ├── reset-cloud-db.ts            # Reset Turso cloud tables
│   └── add-edge-runtime.js          # Cloudflare Pages build hook
├── src/
│   ├── app/                         # Next.js 15 App Router Pages & API Routes
│   │   ├── admin/                   # Admin portal (/admin/users, /admin/vets, etc.)
│   │   ├── api/                     # Cloudflare Edge API endpoints
│   │   ├── auth/                    # Login, signup, reset-password pages
│   │   ├── dashboard/               # User portal (/dashboard/animals, /dashboard/predictor, etc.)
│   │   ├── globals.css              # Tailwind CSS v4 & custom design utility definitions
│   │   ├── layout.tsx               # Root layout wrapper with providers
│   │   └── page.tsx                 # Public landing page
│   ├── components/                  # UI Components
│   │   ├── theme/                   # Dark/light mode theme toggles
│   │   └── ui/                      # Radix UI primitives (dialog, toast, sidebar, map, etc.)
│   ├── hooks/                       # Custom React hooks (use-mobile, use-toast)
│   ├── lib/                         # Core client & service utilities
│   │   ├── auth.ts                  # Session creation, hashing, and validation
│   │   ├── auth-edge.ts             # Lightweight edge-compatible auth parser
│   │   ├── db.ts                    # Raw SQL database helper
│   │   ├── firebase.ts              # Firebase client SDK initialization
│   │   ├── firebase-admin.ts        # Firebase Admin SDK setup
│   │   ├── geocoding.ts             # Distance calculation & reverse geocoding
│   │   └── turso.ts                 # Turso web client connection factory
│   └── types/                       # TypeScript interfaces & database models
├── components.json                  # Shadcn UI configuration
├── next.config.ts                   # Next.js configuration & webpack aliases
├── package.json                     # Project scripts and Node dependencies
├── schema.sql                       # D1/Turso compatible master database schema
├── seed.sql                         # Raw SQL seed dataset
└── wrangler.toml                    # Cloudflare Pages deployment manifest
```

---

## 🔑 Environment Variables & Configuration

Create a `.env.local` file in the root directory for local development:

```env
# Database Mode & Turso Cloud Credentials
DATABASE_MODE=cloud
TURSO_CONNECTION_URL=libsql://khamarbari-istiaqul-islam.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Hugging Face Space ML Endpoint (or local Flask server URL)
HFS_API_URL=https://istiaq666-khamarbari-cattle-predictor.hf.space/predict

# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=khamarbari-92e76.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=khamarbari-92e76
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=khamarbari-92e76.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=961293357388
NEXT_PUBLIC_FIREBASE_APP_ID=1:961293357388:web:add2785637ff127e0f3fe9

# Firebase Admin SDK (Server/Edge)
FIREBASE_PROJECT_ID=khamarbari-92e76
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@khamarbari-92e76.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Cloudinary Assets Storage
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🚀 Local Development & Setup

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **Python**: 3.11+ (for training or running the local ML Flask microservice)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Initialize Database Schema & Seed Data
To push the database schema to your Turso cloud database and seed initial test data:

```bash
# Push schema to Turso Cloud DB
npm run turso:push

# Seed cloud database with initial users, vets, pets, and products
npm run db:seed
```

*(Optional: For local offline SQLite testing using `file:./data/petcare.db`, run `npm run db:init`)*

### Step 3: Run Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: (Optional) Run Local Python ML Server
If you wish to test the ML service locally instead of calling Hugging Face Spaces:

```bash
cd Pet
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
The Flask ML server will start on `http://localhost:7860`. Update `HFS_API_URL` in `.env.local` to point to `http://localhost:7860/predict`.

---

## 🚢 Cloudflare Pages Deployment Guide

KhamarBari is optimized for seamless zero-downtime deployment to **Cloudflare Pages** using `@cloudflare/next-on-pages`.

### 1. Build the Application
```bash
npm run deploy
```
This command triggers Next.js build compilation and runs `@cloudflare/next-on-pages` to compile edge handlers to `.vercel/output/static`.

### 2. Cloudflare Pages Dashboard Setup
1. Create a new project on **Cloudflare Pages** and connect your GitHub repository.
2. Build Settings:
   - **Framework Preset**: None / Next.js
   - **Build Command**: `npx @cloudflare/next-on-pages@1`
   - **Build Output Directory**: `.vercel/output/static`
3. Environment Variables:
   - Add `TURSO_CONNECTION_URL` in `wrangler.toml` or environment settings.
   - Add the following **Secrets** in the Cloudflare Dashboard (*Settings > Environment Variables*):
     - `TURSO_AUTH_TOKEN`
     - `FIREBASE_PRIVATE_KEY`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `HFS_API_URL`

---

## 📄 License & Credits

Developed for the **KhamarBari** ecosystem. All rights reserved. Designed and engineered for modern digital livestock agriculture and companion animal care.
