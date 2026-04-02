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
git clone <YOUR_REPO_URL>
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

## API Endpoints

### Auth APIs

Base path: `/api/auth`

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me` (requires auth cookie)

Register body example:

```json
{
   "name": "Animesh",
   "email": "animesh@example.com",
   "password": "StrongPass123!",
   "role": "Viewer"
}
```

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

Create record body example:

```json
{
   "title": "Salary",
   "amount": 50000,
   "type": "income",
   "category": "Job",
   "date": "2026-04-01"
}
```

### Dashboard APIs

Base path: `/api/dashboard`

- `GET /api/dashboard/summary` (Admin, Analyst)

## Notes

- Auth token is stored in an HttpOnly cookie named `token`.
- Keep your `.env` file private and never commit secrets.