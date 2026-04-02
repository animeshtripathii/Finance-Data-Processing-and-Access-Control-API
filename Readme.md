# Finance Data Processing and Access Control API

REST API for authentication, role-based access control, financial records, and dashboard summary data.

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (cookie-based auth)
- Zod validation

## Dependencies

Main dependencies used in this project:

- express
- mongoose
- jsonwebtoken
- bcryptjs
- bcrypt
- zod
- swagger-jsdoc
- swagger-ui-express
- cors
- cookie-parser
- dotenv
- nodemon

## Project Setup

1. Clone the repository.

```bash
git clone https://github.com/animeshtripathii/Finance-Data-Processing-and-Access-Control-API
cd Backend
```

2. Install dependencies.

```bash
npm install
```

3. Create a `.env` file in the `Backend` folder.

Example `.env`:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/zorvyn
JWT_Secret_Key=your_super_secret_key
JWT_EXPIRES_IN=1d
NODE_ENV=development

```

4. Run the server.

Development mode (nodemon):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Base URL

Local base URL:

```text
http://localhost:3000
```

## Swagger API Docs

Swagger is integrated in this backend.

- Swagger JSON is generated using `swagger-jsdoc`.
- Swagger UI is served using `swagger-ui-express`.

Open API docs in browser:

```text
http://localhost:3000/api-docs
```

## Deploy On Render (Backend)

This backend is ready for Render deployment.

1. Push this `Backend` folder to GitHub.
2. In Render, click New + and choose Blueprint.
3. Select your GitHub repository.
4. Render will detect [render.yaml](render.yaml) and create the web service.
5. Set the required secret env vars in Render:

```env
MONGO_URI=your_mongodb_connection_string
JWT_Secret_Key=your_jwt_secret
API_BASE_URL=https://your-render-service-name.onrender.com
```

6. Deploy.

After deployment:

- API base URL: `https://your-render-service-name.onrender.com`
- Swagger docs: `https://your-render-service-name.onrender.com/api-docs`

## API Endpoints

## Role-Based Access (RBAC)

Role behavior used in this backend:

- Viewer: Can only view dashboard insights.
- Analyst: Can view records and access dashboard insights.
- Admin: Can create, update, and delete records, and manage users.

In this project, "insights" means dashboard analytics APIs:

- `GET /api/dashboard/summary`
- `GET /api/dashboard/recent-activity`
- `GET /api/dashboard/monthly-trends`

Permissions matrix:

- Viewer: `GET /api/dashboard/*` only
- Analyst: `GET /api/dashboard/*`, `GET /api/records/getRecord`
- Admin: Full access to `api/auth` user-management routes + full `api/records` CRUD + `api/dashboard/*`

### Auth APIs

Base path: `/api/auth`

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout` (requires auth cookie)
- `GET /api/auth/me` (requires auth cookie)
- `GET /api/auth/users` (Admin)
- `PATCH /api/auth/users/:id/role` (Admin)
- `PATCH /api/auth/users/:id/status` (Admin)

Register body example:

```json
{
   "name": "Animesh",
   "email": "animesh@example.com",
   "password": "StrongPass123!"
}
```

New users are created with `Viewer` role by default.

Login body example:

```json
{
   "email": "animesh@example.com",
   "password": "StrongPass123!"
}
```

### Record APIs

Base path: `/api/records`

- `GET /api/records/getRecord`
- `POST /api/records/addRecord` (Admin)
- `PUT /api/records/updateRecord/:id` (Admin)
- `DELETE /api/records/deleteRecord/:id` (Admin)

All record routes require authentication.

- `GET /api/records/getRecord` is allowed for `Admin` and `Analyst`.
- `POST`, `PUT`, `DELETE` record endpoints are allowed for `Admin` only.

Record list filters and pagination (`GET /api/records/getRecord` query params):

- `type=Income|Expense`
- `category=...`
- `startDate=2026-01-01`
- `endDate=2026-12-31`
- `page=1`
- `limit=10`

Create record body example:

```json
{
   "amount": 50000,
   "type": "Income",
   "category": "Job",
   "date": "2026-04-01T00:00:00.000Z",
   "notes": "Monthly salary"
}
```

### Dashboard APIs

Base path: `/api/dashboard`

- `GET /api/dashboard/summary` (Viewer, Analyst, Admin)
- `GET /api/dashboard/recent-activity?limit=10` (Viewer, Analyst, Admin)
- `GET /api/dashboard/monthly-trends?year=2026` (Viewer, Analyst, Admin)

## Backend-Only Testing

This project has no frontend dependency for evaluation.

- Use Swagger UI: `http://localhost:3000/api-docs`
- Use Postman collection calls against the same API routes
- Authentication is cookie-based (`token`), so protected route tests should be done after login

### Suggested Evaluator Flow (Swagger or Postman)

Use two separate sessions:

- Session A: Admin
- Session B: Analyst/Viewer

1. Register admin candidate using `POST /api/auth/register`.
2. Register analyst candidate using `POST /api/auth/register`.
3. Promote one account to Admin in database once for setup (or use an existing Admin account).
4. Login as Admin with `POST /api/auth/login`.
5. Verify identity with `GET /api/auth/me` (expected `200`).
6. Get users with `GET /api/auth/users` (expected `200` for Admin).
7. Update analyst role using `PATCH /api/auth/users/:id/role` with body:

```json
{
   "role": "Analyst"
}
```

8. Deactivate analyst using `PATCH /api/auth/users/:id/status` with body:

```json
{
   "isActive": false
}
```

Expected: analyst login returns `403`.

9. Reactivate analyst with:

```json
{
   "isActive": true
}
```

10. Login as analyst in Session B.
11. As Admin, create record using `POST /api/records/addRecord` (expected `201`).
12. As Analyst, read records using `GET /api/records/getRecord` (expected `200`).
13. As Analyst, try to create record using `POST /api/records/addRecord` (expected `403`).
14. As Analyst, call dashboard endpoints (all expected `200`):

- `GET /api/dashboard/summary`
- `GET /api/dashboard/recent-activity?limit=10`
- `GET /api/dashboard/monthly-trends?year=2026`

15. As Admin, update and delete record:

- `PUT /api/records/updateRecord/:id` (expected `200`)
- `DELETE /api/records/deleteRecord/:id` (expected `200`, soft delete)

16. Logout from both sessions with `POST /api/auth/logout`.

## Notes

- Auth token is stored in an HttpOnly cookie named `token`.
- Keep your `.env` file private and never commit secrets.
