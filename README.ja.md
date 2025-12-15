**プロジェクト: EMR (電子医療記録)**

これは簡易的な教育・開発向けの電子医療記録（EMR）ウェブアプリケーションのテンプレートです。リポジトリはExpressベースのNode.js APIと静的フロントエンド（`public/`）を提供します。ローカルで素早く実行してドメイン構造を学んだり、機能を拡張するのに適しています。

主な機能
- ExpressベースのREST API
- Sequelize ORMによるモデル管理
- MySQLまたはSQLiteのサポート（開発／テスト用）
- 静的フロントエンドを`public/`から提供
- 基本的なEMRモデル：患者（Patient）、受診（Encounter）、処方（Prescription）など

技術スタック
- 言語：JavaScript（Node.js）
- Webフレームワーク：Express
- ORM：Sequelize
- DB：MySQL（開発）、SQLite（テスト）
- フロントエンド：HTML / CSS / Vanilla JS（静的ファイル）

前提条件
- Node.js v16以上
- MySQL（ローカルテストにはSQLiteを使用可）

クイックスタート
1. 依存関係のインストール

```bash
npm install
```

2. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、必要な値を設定してください。

```bash
copy .env.example .env  # Windows (PowerShell / CMD)
```

ローカルテスト用の`.env`例

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

運用環境では平文パスワードやrootアカウントの使用を避け、シークレットマネージャーの使用を推奨します。

3. データベース準備（MySQL例）

```sql
CREATE DATABASE IF NOT EXISTS EMR
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

リポジトリの`create_database.sql`を使用することもできます。

4. サーバー起動

```bash
npm run dev
# または
npm start
```

サーバー起動後、http://localhost:3000/ にアクセスして静的フロントエンドを確認できます。

プロジェクト構成（主要ファイル）
- `server.js` — サーバーのエントリーポイント
- `app.js` — Expressアプリの設定
- `models/` — Sequelizeモデル定義（`patient.js`, `encounter.js`など）
- `routes/` — APIルート
- `public/` — 静的フロントエンドファイル
- `create_database.sql` — DB初期化SQL
- `.env.example` — 環境変数の例

APIの概要
- ヘルスチェック: GET `/api`

- Patients（患者）
  - GET  `/api/patients` — 患者一覧
  - POST `/api/patients` — 患者作成
  - GET  `/api/patients/:id` — 患者詳細（関連する受診を含む）

- Encounters（受診）
  - GET  `/api/encounters`
  - POST `/api/encounters`
  - GET  `/api/encounters/:id` — 受診詳細（医療記録/処方を含む）

詳細は`routes/`フォルダを確認してください。

開発および拡張の提案
- 認証：JWTベースのトークン認証を導入
- 入力検証：`Joi`または`express-validator`を使用
- エラーハンドリングミドルウェアの強化
- テスト：単体テストおよび統合テストを追加
- 本番DBの切替：PostgreSQLなどを検討
- 拡張：PACSシステムとの連携
- 権限管理：RBACの実装

トラブルシューティング
- サーバーログを確認
- `.env`の設定を確認
- DB接続情報とDBサーバーが起動しているか確認

翻訳機能（Translation）
- ヘッダー翻訳：ページ上部にGoogle Translateウィジェットを追加しています。利用可能な言語には韓国語、英語、日本語、簡体字/繁体字中国語、フランス語、スペイン語、ドイツ語などがあります。
- サーバープロキシ：クライアントが外部翻訳サービスを直接呼ばないように、LibreTranslateのプロキシエンドポイントをサーバーに追加しています：`POST /api/translate`。
  - リクエスト形式: `Content-Type: application/json` / body: `{ "q": "テキスト", "source": "ko", "target": "en" }`
  - 応答例: `{ "translatedText": "Hello" }`（公開インスタンスにより構造が異なる場合があります）

注意と推奨事項
- 公開LibreTranslateインスタンスはレート制限がある場合があります（例: 10 req/min）。大量のテキスト翻訳には自己ホストまたは有料APIを推奨します。
- Google Translateウィジェットは外部にテキストを送信するため、機密データの翻訳は注意してください。

翻訳プロキシのテスト

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"q":"안녕하세요","source":"ko","target":"en"}'
```

ライセンス / 利用
教育および個人学習目的で提供されています。商用利用時は別途確認してください。

---
