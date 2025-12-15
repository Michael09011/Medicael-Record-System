# EMR (전자 의무 기록) — 백엔드 + 프론트엔드

이 저장소는 백엔드와 프론트엔드(정적 파일)를 모두 포함합니다. Node.js, Express, Sequelize 기반의 서버와, 서버에서 제공되는 정적 프론트엔드(`public/`)를 함께 제공합니다. 개발·학습용으로 로컬에서 빠르게 실행하도록 구성되어 있습니다.

**요약:**
- 언어: JavaScript (Node.js)
- 백엔드: Express + Sequelize
- 프론트엔드: 정적 파일(HTML/CSS/JS) — `public/`
- DB(개발): MySQL(설정 가능), 테스트용 SQLite 사용 가능

---

**사전 요구 사항**
- Node.js (v16+ 권장)
- MySQL 또는 로컬 테스트용 SQLite

**설치 및 실행 (로컬)**
1. 의존성 설치

```bash
cd EMR
npm install
```

2. 환경 설정

- `.env.example` 파일이 있으면 복사하여 `.env`로 만든 뒤 DB 접속 정보 등을 설정합니다.

```bash
cp .env.example .env
```

3. 데이터베이스 생성 (MySQL 사용 시)

```sql
CREATE DATABASE IF NOT EXISTS EMR CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. 서버 시작

```bash
npm run dev
# 또는
npm start
```

5. 프론트엔드 접근

- 프론트엔드(정적 파일)는 `public/` 폴더에 있습니다. 서버를 실행한 뒤 브라우저에서 `http://localhost:3000/`(또는 `PORT`에 설정된 포트)로 접속하면 프론트엔드를 확인할 수 있습니다.

---

**주요 파일/폴더**
- `server.js` - 서버 엔트리포인트
- `app.js` - Express 앱 설정
- `models/` - Sequelize 모델 정의 (`patient.js`, `encounter.js`, `prescription.js` 등)
- `routes/` - 라우트 핸들러 (`patients.js`, `encounters.js`, `prescriptions.js`, `auth.js` 등)
- `public/` - 정적 프론트엔드 파일 (관리자/로그인 페이지 등)
- `create_database.sql` - DB 초기화(선택)

---

**간단한 API 요약**
- `GET /api` — 헬스체크
- `GET /api/patients` — 환자 목록
- `POST /api/patients` — 환자 생성
- `GET /api/patients/:id` — 환자 상세 (관련 방문 포함)
- `GET /api/encounters` — 방문 목록
- `POST /api/encounters` — 방문 생성

(자세한 엔드포인트는 `routes/` 폴더의 각 파일을 참고하세요.)

---

**환경변수 예시 (.env)**

```
PORT=3000
NODE_ENV=development
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=EMR
DB_USER=root
DB_PASS=your_password_here
```

> 보안: 운영 환경에서는 비밀번호를 환경 변수나 시크릿 매니저로 안전하게 관리하세요.

---

**개발 및 기여 안내**
- 인증(토큰 기반), 입력 검증, 단위/통합 테스트 추가를 권장합니다.
- 코드 스타일과 테스트를 맞춘 PR 환영합니다.

---

**문제 발생 시**
- 로그와 `.env` 설정을 먼저 확인하세요.
- DB 접속 문제는 호스트/포트/계정 정보를 점검하세요.

---

파일 위치: [EMR/README.md](EMR/README.md)

감사합니다.
# EMR (전자 의무 기록)

간단한 교육/개발용 EMR(전자 의무 기록) 서버 템플릿입니다. Node.js, Express, Sequelize를 사용하며 로컬 개발에서 빠르게 실행하도록 구성되어 있습니다.

**요약:**
- 언어: JavaScript (Node.js)
- 프레임워크: Express
- ORM: Sequelize
- DB(개발): MySQL (설정 가능), 테스트용 SQLite 사용 가능

**목적:**
- 환자, 방문(encounter), 처방(prescription) 등 기본 EMR 도메인 모델을 제공
- 로컬 개발 및 기능 확장, 학습용으로 사용

---

**사전 요구 사항**
- Node.js (v16+ 권장)
- MySQL 또는 로컬 테스트용 SQLite

**설치 및 실행 (로컬)**
1. 의존성 설치

```bash
cd EMR
npm install
```

2. 환경 설정

- `.env.example` 파일이 있으면 복사하여 `.env`로 만든 뒤 DB 접속 정보 등을 설정합니다.

```bash
cp .env.example .env
```

3. 데이터베이스 생성

- MySQL 사용 시:

```sql
CREATE DATABASE IF NOT EXISTS EMR CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. 서버 시작

```bash
npm run dev
# 또는
npm start
```

---

**주요 파일/폴더**
- `server.js` - 서버 엔트리포인트
- `app.js` - Express 앱 설정
- `models/` - Sequelize 모델 정의 (`patient.js`, `encounter.js`, `prescription.js` 등)
- `routes/` - 라우트 핸들러 (`patients.js`, `encounters.js`, `prescriptions.js`, `auth.js` 등)
- `public/` - 정적 프론트엔드 파일 (관리자/로그인 페이지 등)
- `create_database.sql` - DB 초기화(선택)

---

**간단한 API 요약**
- `GET /api` — 헬스체크
- `GET /api/patients` — 환자 목록
- `POST /api/patients` — 환자 생성
- `GET /api/patients/:id` — 환자 상세 (관련 방문 포함)
- `GET /api/encounters` — 방문 목록
- `POST /api/encounters` — 방문 생성

(자세한 엔드포인트는 `routes/` 폴더의 각 파일을 참고하세요.)

---

**환경변수 예시 (.env)**

```
PORT=3000
NODE_ENV=development
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=EMR
DB_USER=root
DB_PASS=your_password_here
```

> 보안: 운영 환경에서는 비밀번호를 환경 변수나 시크릿 매니저로 안전하게 관리하세요.

---

**개발 및 기여 안내**
- 인증(토큰 기반), 입력 검증, 단위/통합 테스트 추가를 권장합니다.
- 코드 스타일과 테스트를 맞춘 PR 환영합니다.

---

**문제 발생 시**
- 로그와 `.env` 설정을 먼저 확인하세요.
- DB 접속 문제는 호스트/포트/계정 정보를 점검하세요.

---

파일 위치: [EMR/README.md](EMR/README.md)

감사합니다.
# EMR Backend (Node.js / Express / Sequelize)


설치 및 실행:

```bash
cd EMR/backend
npm install
cp .env.example .env
# Configure MySQL settings in .env
# Create DB: e.g. `CREATE DATABASE emr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
npm run dev
```

기본 API:
- `GET /api` - 헬스 체크
- `GET /api/patients` - 환자 목록
- `POST /api/patients` - 환자 생성
- `GET /api/patients/:id` - 환자 상세 (Encounter 포함)
- `GET /api/encounters` - 방문 목록
- `POST /api/encounters` - 방문 생성
- `GET /api/encounters/:id` - 방문 상세 (의료기록/처방/물리치료 포함)

프론트엔드 정적 파일: `public/index.html` (Bootstrap + vanilla JS) — 서버 실행 후 `http://localhost:3000/` 으로 접속

빠른 DB 설정 (요청하신 값으로 로컬 테스트용 설정을 만든 예):

- 파일: `.env` (이미 프로젝트에 추가됨)

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

MySQL이 설치되어 있으면 `create_database.sql`을 실행하거나 아래 명령으로 DB를 생성하세요:

```sql
CREATE DATABASE IF NOT EXISTS EMR CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

주의: 실제 운영 환경에서는 `root` 계정과 평문 비밀번호를 코드/저장소에 두지 마세요. 로컬 테스트용으로만 사용하세요.

다음 단계 제안:
- 인증(토큰 기반)
- 입력 검증 및 오류 처리
- 테스트 추가
- 배포용 DB(Postgres 등) 전환
