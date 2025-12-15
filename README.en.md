**Project: EMR (Electronic Medical Record)**

This is a simple educational/development Electronic Medical Record (EMR) web application template. The repository provides an Express-based Node.js API and a static frontend (`public/`). It's suitable for quickly running locally to learn the domain structure or to extend features.

Key Features
- Express-based REST API
- Sequelize ORM for models
- MySQL or SQLite support (development/testing)
- Static frontend served from `public/`
- Basic EMR models: Patient, Encounter, Prescription, etc.

Tech Stack
- Language: JavaScript (Node.js)
- Web framework: Express
- ORM: Sequelize
- DB: MySQL (development), SQLite (testing)
- Frontend: HTML / CSS / Vanilla JS (static files)

Prerequisites
- Node.js v16 or later
- MySQL (or SQLite for local testing)

Quick Start
1. Install dependencies

```bash
npm install
```

2. Configure environment variables

Copy `.env.example` to `.env` and set the required values.

```bash
copy .env.example .env  # Windows (PowerShell / CMD)
```

Example `.env` for local testing

```
PORT=3000
NODE_ENV=development

DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=EMR
DB_USER=root
DB_PASS=0000
```

Avoid using plaintext passwords or root accounts in production; use a secret manager.

3. Prepare the database (MySQL example)

```sql
CREATE DATABASE IF NOT EXISTS EMR
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

You can also use the repository's `create_database.sql`.

4. Run the server

```bash
npm run dev
# or
npm start
```

After the server starts, open http://localhost:3000/ to view the static frontend.

Project Structure (key files)
- `server.js` — Server entry point
- `app.js` — Express app configuration
- `models/` — Sequelize model definitions (`patient.js`, `encounter.js`, etc.)
- `routes/` — API routes
- `public/` — Static frontend files
- `create_database.sql` — DB initialization SQL
- `.env.example` — Environment variable example

API summary
- Health check: GET `/api`

- Patients
  - GET  `/api/patients` — List patients
  - POST `/api/patients` — Create a patient
  - GET  `/api/patients/:id` — Patient detail (includes related encounters)

- Encounters
  - GET  `/api/encounters`
  - POST `/api/encounters`
  - GET  `/api/encounters/:id` — Encounter detail (includes medical records/prescriptions)

See the `routes/` folder for more endpoints.

Development & Extensions
- Authentication: Add JWT-based token authentication
- Input validation: Use `Joi` or `express-validator`
- Strengthen error-handling middleware
- Tests: Add unit and integration tests
- Production DB: Consider PostgreSQL
- Integration: Connect to PACS systems
- Authorization: Implement RBAC

Troubleshooting
- Check server logs
- Verify your `.env` settings
- Confirm database connection and that the DB server is running

Translation Features
- Header translation: A Google Translate widget is added at the top of pages. Supported languages include Korean, English, Japanese, Simplified/Traditional Chinese, French, Spanish, German, and more via the widget.
- Server proxy: A LibreTranslate proxy endpoint is available on the server to prevent clients from calling external translation services directly: `POST /api/translate`.
  - Request format: `Content-Type: application/json` / body: `{ "q": "text", "source": "ko", "target": "en" }`
  - Example response: `{ "translatedText": "Hello" }` (actual response structure may vary by public instance)

Notes & Recommendations
- Public LibreTranslate instances may have rate limits (e.g., 10 req/min). For large-scale translations, self-host or use a paid translation API.
- The Google Translate widget sends text to an external provider; avoid translating sensitive data.

Testing the translation proxy

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"q":"안녕하세요","source":"ko","target":"en"}'
```

License / Usage
For educational and personal use. Review terms before commercial use.

---
