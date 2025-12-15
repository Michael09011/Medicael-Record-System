EMR (Electronic Medical Record)

간단한 교육·개발용 EMR(전자 의무 기록) 웹 애플리케이션 템플릿입니다.
Node.js 기반의 백엔드 API와 정적 프론트엔드(public/)를 하나의 저장소에서 함께 제공합니다.

로컬 환경에서 빠르게 실행할 수 있도록 구성되어 있으며,
EMR 도메인 구조 학습 및 기능 확장을 목적으로 합니다.

주요 특징

백엔드 + 프론트엔드 통합 저장소

Express 기반 REST API

Sequelize ORM 사용

MySQL / SQLite 지원

정적 프론트엔드(HTML / CSS / JavaScript) 제공

환자(Patient) / 방문(Encounter) / 처방(Prescription) 기본 EMR 모델 포함

기술 스택

언어: JavaScript (Node.js)
백엔드: Express
ORM: Sequelize
DB: MySQL (개발용), SQLite (테스트용)
프론트엔드: HTML / CSS / JavaScript (정적 파일)

프로젝트 구조

EMR/

server.js : 서버 엔트리포인트

app.js : Express 앱 설정

models/ : Sequelize 모델 정의

patient.js

encounter.js

prescription.js

routes/ : API 라우트

patients.js

encounters.js

prescriptions.js

auth.js

public/ : 정적 프론트엔드 파일

index.html

create_database.sql : DB 초기화용 SQL (선택)

.env.example : 환경 변수 예시

README.md

사전 요구 사항

Node.js v16 이상

MySQL
또는

로컬 테스트용 SQLite

설치 및 실행 (로컬)

의존성 설치

cd EMR
npm install

환경 변수 설정

.env.example 파일을 복사하여 .env 파일을 생성한 후 DB 정보를 입력합니다.

cp .env.example .env

.env 예시:

PORT=3000
NODE_ENV=development

DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=EMR
DB_USER=root
DB_PASS=0000

※ 주의
운영 환경에서는 root 계정과 평문 비밀번호 사용을 피하고,
환경 변수 또는 시크릿 매니저를 사용하세요.
(위 설정은 로컬 테스트용입니다)

데이터베이스 생성 (MySQL 사용 시)

CREATE DATABASE IF NOT EXISTS EMR
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

또는 create_database.sql 파일을 실행해도 됩니다.

서버 실행

npm run dev
또는
npm start

프론트엔드 접속

서버 실행 후 브라우저에서 아래 주소로 접속합니다.

http://localhost:3000/

프론트엔드는 public/ 폴더의 정적 파일로 제공됩니다.
Bootstrap + Vanilla JavaScript 기반의 간단한 UI 예제가 포함되어 있습니다.

API 요약

헬스 체크
GET /api

환자(Patient)
GET /api/patients : 환자 목록
POST /api/patients : 환자 생성
GET /api/patients/:id : 환자 상세 (방문 포함)

방문(Encounter)
GET /api/encounters
POST /api/encounters
GET /api/encounters/:id : 방문 상세 (의료기록 / 처방 / 물리치료 포함)

※ 자세한 엔드포인트는 routes/ 폴더를 참고하세요.

개발 및 확장 제안

토큰 기반 인증 (JWT)

입력값 검증 (Joi / express-validator)

에러 처리 미들웨어 강화

단위 / 통합 테스트 추가

PostgreSQL 등 배포용 DB 전환

역할 기반 권한 관리 (의사 / 치료사 / 관리자)

문제 발생 시 체크 사항

서버 로그 확인

.env 설정 값 확인

DB 호스트 / 포트 / 계정 정보 확인

MySQL 실행 여부 확인

라이선스 / 용도

교육 및 개인 학습용

상업적 사용 시 별도 검토 권장
