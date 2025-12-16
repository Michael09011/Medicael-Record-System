**🏥 Medical Record System (EMR)**

This project is a simple educational and development-oriented Electronic Medical Record (EMR) web application template.

While working as a physical therapist in a hospital, I experienced both modern EMR systems and traditional handwritten charts.
Although existing EMR systems are powerful, I often felt they were overly complex and cluttered for everyday clinical workflows.

This project may be modest compared to real-world hospital systems, but it represents my attempt to design and build a clean, understandable EMR system from scratch.

With minimal SQL configuration, the application can be easily set up and run locally.

**📌 Overview ** 

This repository provides:

A Node.js-based Express REST API

A static frontend served from the public/ directory

It is well-suited for:

Quickly running a local EMR system

Learning domain-driven backend structures

Extending features for educational or prototyping purposes

<img width="1919" height="914" alt="EMR Screenshot" src="https://github.com/user-attachments/assets/1535e3dd-ef80-4716-b819-092f1e1066c1" />

**✨ Key Features **

REST API built with Express

Model management using Sequelize ORM

Database support:

MySQL (development)

SQLite (testing)

Static frontend served from public/

Basic EMR domain models:

Patient

Encounter

Prescription

** 🛠️ Tech Stack **

Language: JavaScript (Node.js)

Web Framework: Express

ORM: Sequelize

Database: MySQL (development), SQLite (testing)

Frontend: HTML / CSS / Vanilla JavaScript (static files)


✅ Prerequisites

Node.js v16 or higher

MySQL (or SQLite for local testing)

🚀 Quick Start
1. Install dependencies
npm install

2. Environment configuration

Copy .env.example to .env and configure the required values.

copy .env.example .env  # Windows (PowerShell / CMD)

Example .env (local development)
PORT=3000
NODE_ENV=development

DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=EMR
DB_USER=root
DB_PASS=0000


⚠️ Note:
For production environments, avoid using plaintext passwords or the root account.
Use environment-specific credentials or a secure secret manager.

3. Prepare the database (MySQL example)
CREATE DATABASE IF NOT EXISTS EMR
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;


Alternatively, use create_database.sql provided in this repository.

4. Run the server
npm run dev
# or
npm start


After the server starts, open:

http://localhost:3000/


to access the static frontend.

📁 Project Structure (Key Files)

server.js — Server entry point

app.js — Express app configuration

models/ — Sequelize model definitions (patient.js, encounter.js, etc.)

routes/ — API routes

public/ — Static frontend files

create_database.sql — Database initialization script

.env.example — Environment variable template

🔌 API Overview
Health Check

GET /api

Patients

GET /api/patients — List patients

POST /api/patients — Create a patient

GET /api/patients/:id — Patient details (includes related encounters)

Encounters

GET /api/encounters

POST /api/encounters

GET /api/encounters/:id — Encounter details (includes medical records and prescriptions)

For full API details, see the routes/ directory.

🔧 Development & Extension Ideas

Authentication: JWT-based token authentication

Input validation: Joi or express-validator

Enhanced error-handling middleware

Testing: unit and integration tests

Production database: PostgreSQL

Extensions:

File upload/download for PACS integration

Authorization: Role-Based Access Control (RBAC)

🧩 Troubleshooting Tips

Check server logs

Verify .env configuration

Confirm database credentials and DB service status

🌐 Translation Features
Header Translation (Google Translate Widget)

A Google Translate widget is added to the site header

Supported languages include:

Korean, English, Japanese, Chinese (Simplified/Traditional), French, Spanish, German, etc.

Automatically translates the entire page

Server Proxy (LibreTranslate)

To avoid direct client-side calls to external translation services, a server-side proxy endpoint is provided:

POST /api/translate


Request

{
  "q": "Text to translate",
  "source": "ko",
  "target": "en"
}


Response (example)

{
  "translatedText": "Hello"
}


⚠️ Limitations & Recommendations

Public LibreTranslate instances may enforce rate limits (e.g., 10 requests/min)

For production use, self-hosting or a commercial translation API is recommended

Google Translate Widget sends content to external services — avoid translating sensitive medical data

🧪 Translation Test (CLI)
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"q":"안녕하세요","source":"ko","target":"en"}'

📄 License / Usage

This project is provided for educational and personal learning purposes.
Commercial use should be reviewed separately.

📬 Contact

For questions or feedback:

📧 michaela00u@gmail.com

원하시면 다음도 바로 다듬어줄 수 있어요:
