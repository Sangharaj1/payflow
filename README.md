# Fullstack Multi-Stage Form & Authentication System

This is a comprehensive fullstack application featuring a secure JWT-based authentication system and a persistent 5-stage multipart form workflow.

## Features

### 0. Frontend System (React)
- **File-based Routing**: Powered by **TanStack Router** for seamless navigation.
- **Type-safe Forms**: Built with **TanStack Form** for robust state and validation.
- **Global State**: Managed via **Zustand** to ensure form continuity across sessions.
- **Persistence**: Automatically fetches and resumes the last saved stage upon login.
- **Validation**: Real-time frontend validation combined with strict backend enforcement.

### 1. Authentication System
- **JWT Based**: Implements short-lived Access Tokens (1 min) and long-lived Refresh Tokens (7 days).
- **Token Rotation**: Refresh tokens are rotated upon use to prevent replay attacks.
- **Hybrid Authorization**: Supports both `Authorization: Bearer <token>` headers and secure **HTTP-only cookies**.
- **Password Security**: Robust hashing using `bcrypt`.

### 2. Multi-Stage Form Workflow
- **5 Stages**: Progresses through Basic Info, Address, Professional Details, Document Upload, and Review.
- **Strict Multipart Enforcement**: Every form stage endpoint strictly accepts `multipart/form-data`.
- **State Persistence**: Progress is saved to PostgreSQL at each stage, allowing users to resume exactly where they left off.
- **Document Handling**: Handles multiple file uploads at Stage 4 using Multer memory storage (Serverless compatible).

### 3. Management & Listing
- **Pagination**: Built-in backend pagination for form listings.
- **Filtering**: Ability to filter form submissions by status (`IN_PROGRESS` or `COMPLETED`).

## Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Passport.js + JWT (Cookie-based)
- **File Handling**: Multer (Memory Storage)

### Frontend
- **Library**: React 18+
- **Routing**: TanStack Router
- **Form Logic**: TanStack Form
- **State**: Zustand

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database instance

## Setup Instructions

1. **Install Dependencies**
   ```bash
   # In /backend
   npm install

   # In /frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the `backend` folder:
   ```env
   # Database Connection
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_postgres_user
   DB_PASSWORD=your_postgres_password
   DB_NAME=your_database_name

   # JWT Configuration
   JWT_ACCESS_SECRET=your_super_secret_access_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   ```

3. **Run the Application**
   ```bash
   # Start Backend (from /backend)
   npm run start:dev

   # Start Frontend (from /frontend)
   npm run dev
   ```

## API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/auth/register` | Creates a new user account. |
| POST | `/auth/login` | Authenticates user and sets HTTP-only cookies. |
| POST | `/auth/refresh` | Rotates tokens using the refresh token cookie. |

### Form Management (Requires JWT)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/forms/stage-1` | Stage 1: Basic Information. |
| POST | `/forms/stage-2/:id` | Stage 2: Address Details. |
| POST | `/forms/stage-3/:id` | Stage 3: Professional Details. |
| POST | `/forms/stage-4/:id` | Stage 4: Multi-file Document Upload. |
| POST | `/forms/stage-5/:id` | Stage 5: Review & Final Submission. |
| GET | `/forms` | Paginated listing of all forms. |
| GET | `/forms/:id` | Resumes a specific form. |

## Deployment

This application is configured for deployment on **Vercel** via `vercel.json`. 

> **Note**: For production document storage, integrate a cloud provider like AWS S3 or Cloudinary within the `FormsController` to handle the file buffers, as the Vercel filesystem is ephemeral.

## Evaluation Highlights
- **Security**: Implementation of Refresh Token rotation and secure cookie handling.
- **Modularity**: Separation of concerns between `Auth` and `Forms` modules.
- **Efficiency**: TypeORM query builders used for optimized pagination.
- **Robustness**: Global guards and interceptors ensure data integrity and format enforcement.
