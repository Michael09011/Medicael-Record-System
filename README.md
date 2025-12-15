**프로젝트: EMR (Electronic Medical Record)**

간단한 교육·개발용 전자 의무 기록(EMR) 웹 애플리케이션 템플릿입니다. 이 저장소는 Node.js 기반의 Express API와 정적 프론트엔드(`public/`)를 함께 제공합니다. 로컬에서 빠르게 실행하여 도메인 구조를 학습하거나 기능을 확장하는 목적에 적합합니다.

**주요 기능**
- Express 기반 REST API
- Sequelize ORM을 통한 모델 관리
- MySQL 또는 SQLite 지원 (개발/테스트용)
- 정적 프론트엔드 제공 (`public/`)
- 기본 EMR 모델: 환자(Patient), 방문(Encounter), 처방(Prescription) 등

**기술 스택**
- 언어: JavaScript (Node.js)
- 웹 프레임워크: Express
- ORM: Sequelize
- DB: MySQL (개발), SQLite (테스트)
- 프론트엔드: HTML / CSS / Vanilla JS (정적 파일)

**사전 요구 사항**
- Node.js v16 이상
- MySQL (또는 로컬 테스트용 SQLite)

**빠른 시작**
1. 의존성 설치

```bash
npm install
```

2. 환경 변수 설정

`.env.example`를 복사해 `.env`를 만든 뒤 필요한 값을 설정하세요.

```bash
copy .env.example .env  # Windows (PowerShell / CMD)
```

.env 예시 (로컬 테스트)

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

운영 환경에서는 평문 비밀번호나 root 계정 사용을 피하시고, 시크릿 매니저를 사용하세요.

3. 데이터베이스 준비 (MySQL 예시)

```sql
CREATE DATABASE IF NOT EXISTS EMR
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

또는 저장소의 `create_database.sql`을 사용하세요.

4. 서버 실행

```bash
npm run dev
# 또는
npm start
```

서버 실행 후 브라우저에서 `http://localhost:3000/`에 접속하면 정적 프론트엔드를 확인할 수 있습니다.

**프로젝트 구조 (주요 파일)**

- `server.js` — 서버 엔트리포인트
- `app.js` — Express 앱 설정
- `models/` — Sequelize 모델 정의 (`patient.js`, `encounter.js`, 등)
- `routes/` — API 라우트
- `public/` — 정적 프론트엔드 파일
- `create_database.sql` — DB 초기화용 SQL
- `.env.example` — 환경 변수 예시

**간단한 API 요약**
- 헬스 체크: GET `/api`

- 환자(Patients)
	- GET  `/api/patients` — 환자 목록
	- POST `/api/patients` — 환자 생성
	- GET  `/api/patients/:id` — 환자 상세 (연관 방문 포함)

- 방문(Encounters)
	- GET  `/api/encounters`
	- POST `/api/encounters`
	- GET  `/api/encounters/:id` — 방문 상세 (의료기록/처방 포함)

자세한 엔드포인트는 `routes/` 폴더를 확인하세요.

**개발 및 확장 제안**
- 인증: JWT 기반 토큰 인증 도입
- 입력값 검증: `Joi` 또는 `express-validator` 적용
- 에러 처리 미들웨어 강화
- 테스트: 단위 및 통합 테스트 추가
- 배포용 DB 전환: PostgreSQL 등
- 확장: PACS시스템과의 연계
- 권한 관리: 역할 기반 접근 제어(RBAC)

**문제 해결 팁**
- 서버 로그 확인
- `.env` 설정 확인
- DB 연결 정보 및 DB 실행 상태 확인

**번역 기능 (Translation)**

- 헤더 번역: 사이트 상단에 Google Translate 위젯을 추가했습니다. 사용 가능한 언어는 한국어, 영어, 일본어, 중국어(간체/번체), 프랑스어, 스페인어, 독일어 등으로 제한되어 있으며, 위젯을 통해 페이지 전체를 자동 번역할 수 있습니다.
- 서버 프록시: 클라이언트에서 직접 외부 번역 서비스를 호출하지 않도록 서버에 LibreTranslate 프록시 엔드포인트를 추가했습니다: `POST /api/translate`.
	- 요청 형식: `Content-Type: application/json` / body: `{ "q": "텍스트", "source": "ko", "target": "en" }`
	- 응답 예시: `{ "translatedText": "Hello" }` (공개 인스턴스에 따라 응답 구조가 다를 수 있음)
- 한계 및 권장 사항:
	- 공개 LibreTranslate 인스턴스는 속도 제한(rate limits)이 있으므로 대량 텍스트를 페이지 단위로 번역할 경우 제한에 걸릴 수 있습니다 (예: 10 req/min). 프로덕션에서는 자체 호스팅하거나 상업용 번역 API(유료)를 사용하는 것을 권장합니다.
	- Google Translate 위젯은 빠르게 동작하지만 외부로 텍스트를 전송하므로 민감한 데이터를 번역할 때는 주의하세요.

**번역 사용 방법**
- 페이지 우측 상단의 번역 위젯에서 언어를 선택하면 Google 위젯이 페이지를 번역합니다.
- LibreTranslate 프록시를 테스트하려면 터미널에서:

```bash
curl -X POST http://localhost:3000/api/translate \
	-H "Content-Type: application/json" \
	-d '{"q":"안녕하세요","source":"ko","target":"en"}'
```

응답으로 번역된 텍스트를 확인할 수 있습니다.

**참고**: 변경사항이 바로 반영되지 않을 경우 브라우저 캐시를 삭제하고(`Ctrl+Shift+Delete`) 서버를 재시작(`npm run dev`)하세요.

**라이선스 / 용도**
교육 및 개인 학습용으로 제공됩니다. 상업적 사용 시 별도 검토하세요.

---
