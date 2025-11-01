# Google Calendar Importer セットアップガイド

このガイドでは、Google Calendar Importerプラグインを使用するために必要なGoogle Cloud Consoleでの設定手順を詳しく説明します。

## 概要

Google Calendar APIを使用するには、以下の手順が必要です：

1. Google Cloud Projectの作成
2. Calendar APIの有効化
3. サービスアカウントの作成
4. JSONキーのダウンロード
5. カレンダーの共有設定

所要時間: 約10-15分

## 詳細手順

### ステップ1: Google Cloud Projectの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. Googleアカウントでログイン
3. 画面上部の「プロジェクトを選択」をクリック
4. 「新しいプロジェクト」をクリック
5. プロジェクト名を入力（例: `obsidian-calendar-import`）
6. 「作成」をクリック
7. プロジェクトの作成完了を待つ（数秒）

### ステップ2: Calendar APIの有効化

1. 作成したプロジェクトを選択
2. 左メニューから「APIとサービス」→「ライブラリ」を選択
3. 検索ボックスに「Calendar API」と入力
4. 「Google Calendar API」をクリック
5. 「有効にする」ボタンをクリック
6. APIが有効化されるまで待つ（数秒）

### ステップ3: サービスアカウントの作成

1. 左メニューから「APIとサービス」→「認証情報」を選択
2. 画面上部の「認証情報を作成」→「サービスアカウント」をクリック
3. サービスアカウント情報を入力：
   - **サービスアカウント名**: `obsidian-calendar-reader`（任意）
   - **サービスアカウントID**: 自動生成される
   - **説明**: `Obsidian用カレンダー読み取り`（任意）
4. 「作成して続行」をクリック
5. 「ロールを選択」は**スキップ**（権限不要）
6. 「続行」をクリック
7. 「完了」をクリック

### ステップ4: JSONキーのダウンロード

1. 「認証情報」ページで、作成したサービスアカウントをクリック
2. 「キー」タブをクリック
3. 「鍵を追加」→「新しい鍵を作成」をクリック
4. キーのタイプで「JSON」を選択
5. 「作成」をクリック
6. JSONファイルが自動的にダウンロードされます
7. **重要**: このファイルは安全な場所に保管してください

JSONファイルの内容は以下のような形式です：

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "obsidian-calendar-reader@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### ステップ5: カレンダーの共有設定

サービスアカウントがカレンダーにアクセスできるように、カレンダーを共有します。

#### Google Calendarでの設定

1. [Google Calendar](https://calendar.google.com/)を開く
2. 左サイドバーで対象のカレンダーを見つける
3. カレンダー名の右にある「︙」（3点メニュー）をクリック
4. 「設定と共有」を選択
5. 「特定のユーザーとの共有」セクションまでスクロール
6. 「ユーザーを追加」をクリック
7. サービスアカウントのメールアドレスを入力
   - 形式: `obsidian-calendar-reader@your-project.iam.gserviceaccount.com`
   - このアドレスはJSONファイルの`client_email`フィールドにあります
8. 権限を「予定の閲覧（すべての予定の詳細）」に設定
9. 「送信」をクリック

#### カレンダーIDの確認

1. 同じ「設定と共有」ページで「カレンダーの統合」セクションまでスクロール
2. 「カレンダーID」をコピー
   - 個人カレンダーの場合: 通常は`your-email@gmail.com`
   - 他のカレンダーの場合: `xxxxx@group.calendar.google.com`のような形式
3. このIDをObsidianプラグインの設定で使用します

### ステップ6: Obsidianプラグインでの設定

1. Obsidianを開く
2. 設定→コミュニティプラグイン→Google Calendar Importer
3. **Service Account Key**: ダウンロードしたJSONファイルの**内容全体**をコピー＆ペースト
4. **Calendar ID**: ステップ5で確認したカレンダーIDを入力
5. 設定を保存

## トラブルシューティング

### 「認証エラー」が表示される

**原因1: JSONキーが正しくない**
- JSONファイルの内容全体がコピーされているか確認
- `{`で始まり`}`で終わっていることを確認
- 余計な空白や改行がないか確認

**原因2: カレンダーが共有されていない**
- サービスアカウントのメールアドレスが正しいか確認
- カレンダーの共有設定で「予定の閲覧」権限があるか確認

### 「カレンダーが見つかりません」エラー

- カレンダーIDが正しいか確認
- カレンダーIDにタイポがないか確認
- カレンダーが削除されていないか確認

### 「API使用量の上限」エラー

- Google Calendar APIは1日100万リクエストまで無料です
- 通常の使用では上限に達することはありません
- もし達した場合は、翌日にリセットされます

### サービスアカウントのメールアドレスが見つからない

- JSONファイルを開いて`client_email`フィールドを確認
- または、Google Cloud Consoleの「IAMと管理」→「サービスアカウント」で確認

## セキュリティのベストプラクティス

### JSONキーファイルの管理

- ❌ **禁止**: GitHubなどの公開リポジトリにコミット
- ❌ **禁止**: 他人と共有
- ✅ **推奨**: ローカルの安全な場所に保管
- ✅ **推奨**: 定期的にキーをローテーション（年1回程度）

### 権限の最小化

- サービスアカウントには**閲覧権限のみ**を付与
- 編集権限は不要です
- 必要なカレンダーのみを共有

### キーが漏洩した場合

1. Google Cloud Consoleで該当するキーを削除
2. 新しいキーを作成
3. Obsidianプラグインの設定を更新

## よくある質問（FAQ）

### Q: 複数のカレンダーをインポートできますか？

A: 現在のバージョンでは1つのカレンダーのみサポートしています。複数のカレンダーをインポートする場合は、それぞれを個別にインポートする必要があります。

### Q: モバイル版Obsidianで使えますか？

A: いいえ、このプラグインはNode.jsモジュールを使用するため、デスクトップ版のみサポートしています。

### Q: プライベートカレンダーも使えますか？

A: はい、サービスアカウントと共有すれば、プライベートカレンダーも使用できます。

### Q: Google Workspace（旧G Suite）のカレンダーも使えますか？

A: はい、Google Workspaceのカレンダーでも同じ手順で設定できます。

### Q: サービスアカウントを使う理由は？

A: OAuth2認証に比べて、サービスアカウント認証は：
- セットアップが簡単
- トークンの期限切れがない
- ユーザーごとの認証フローが不要

という利点があります。

## さらなるサポート

問題が解決しない場合は、以下をご確認ください：

1. [README.md](./README.md)のトラブルシューティングセクション
2. [GitHub Issues](https://github.com/handlename/obsidian-plugin-google-calendar-importer/issues)で既存の問題を検索
3. 新しいIssueを作成して質問

---

**ドキュメントバージョン**: 1.0  
**最終更新**: 2025-11-01
