# Google Calendar Importer for Obsidian

Google Calendarの予定をObsidianのDaily Notesにインポートするプラグインです。

## 機能

- 📅 Google Calendarの予定を1日分取得してDaily Noteに挿入
- 🎨 カスタマイズ可能なテンプレート（通常予定・終日予定で別フォーマット）
- 🌍 タイムゾーン対応
- 🔒 サービスアカウント認証によるセキュアなアクセス

## インストール

### 前提条件

- Obsidian v0.15.0以降
- Node.js v24以降（開発時のみ）
- デスクトップ版Obsidian（Windows、macOS、Linux）

### BRATを使用したインストール（推奨）

[BRAT (Beta Reviewers Auto-update Tool)](https://github.com/TfTHacker/obsidian42-brat)を使用すると、GitHubリポジトリから直接プラグインをインストールし、自動更新を受け取ることができます。

1. BRATプラグインをインストール（まだの場合）
   - Obsidianの設定→コミュニティプラグイン→閲覧から「BRAT」を検索
   - インストールして有効化
2. BRATの設定を開く
   - 設定→BRAT→Add Beta Plugin
3. リポジトリURLを入力
   ```
   handlename/obsidian-plugin-google-calendar-importer
   ```
4. 「Add Plugin」をクリック
5. プラグインが自動的にインストールされます
6. 設定→コミュニティプラグイン で「Google Calendar Importer」を有効化

BRATを使用すると、新しいバージョンがリリースされた際に自動的に更新されます。

### 手動インストール

1. [最新のリリース](https://github.com/handlename/obsidian-plugin-google-calendar-importer/releases)から`main.js`、`manifest.json`、`styles.css`をダウンロード
2. Obsidianのvaultフォルダ内の`.obsidian/plugins/google-calendar-importer/`ディレクトリにファイルを配置
3. Obsidianを再起動
4. 設定→コミュニティプラグイン で「Google Calendar Importer」を有効化

## セットアップ

### 1. Google Cloud Consoleでサービスアカウントを作成

詳細は[SETUP_GUIDE.md](./SETUP_GUIDE.md)を参照してください。

概要：
1. Google Cloud Consoleでプロジェクトを作成
2. Calendar APIを有効化
3. サービスアカウントを作成してJSONキーをダウンロード
4. 対象のカレンダーをサービスアカウントと共有

### 2. プラグイン設定

1. Obsidianの設定→Google Calendar Importer を開く
2. **Service Account Key**: ダウンロードしたJSONキーの内容を貼り付け
3. **Calendar ID**: カレンダーID（通常は`your-email@gmail.com`形式）を入力
4. **Templates**: 必要に応じてテンプレートをカスタマイズ
5. **Timezone**: タイムゾーンを設定（デフォルト: システムのタイムゾーン）

## 使い方

1. Daily Noteを開く
2. コマンドパレット（Ctrl/Cmd + P）を開く
3. 「Import Google Calendar events」を選択
4. カーソル位置に予定が挿入されます

## テンプレートのカスタマイズ

### 利用可能な変数

- `{{title}}`: 予定のタイトル
- `{{startTime}}`: 開始時刻（通常予定のみ）
- `{{endTime}}`: 終了時刻（通常予定のみ）
- `{{description}}`: 予定の説明
- `{{location}}`: 場所
- `{{attendees}}`: 参加者（カンマ区切り）

### テンプレートを空にする

テンプレートを空にすることで、該当する種類の予定を出力から除外できます：

- **通常予定のテンプレートを空にする**: 終日予定のみが出力されます
- **終日予定のテンプレートを空にする**: 通常予定のみが出力されます
- **両方とも空にする**: 何も出力されません

### デフォルトテンプレート

**通常予定:**
```
- {{startTime}}-{{endTime}}: {{title}}
```

**終日予定:**
```
- [終日] {{title}}
```

### カスタマイズ例

```
## {{startTime}} - {{title}}
**場所:** {{location}}
**説明:** {{description}}
**参加者:** {{attendees}}
```

## トラブルシューティング

### 認証エラーが発生する

- サービスアカウントのJSONキーが正しく貼り付けられているか確認
- カレンダーがサービスアカウントと共有されているか確認
- JSONキーの形式が正しいか確認（`{`で始まり`}`で終わる）

### イベントが見つからない

- カレンダーIDが正しいか確認
- 対象の日付に予定が存在するか確認
- Daily Notesプラグインが有効になっているか確認

### API使用量の上限に達した

- Google Calendar APIの無料枠は1日100万リクエストです
- しばらく待ってから再試行してください

### ネットワークエラー

- インターネット接続を確認
- ファイアウォールやプロキシ設定を確認

## セキュリティ

- サービスアカウントキーはローカルに保存されます（`.obsidian/plugins/google-calendar-importer/data.json`）
- APIアクセスは読み取り専用です（`calendar.readonly`スコープ）
- 予定の編集・削除はできません

## 開発

### 前提条件
- Node.js v24以降
- TypeScript 5.9.3
- Biome 2.3.2（リンター・フォーマッター）

### 開発コマンド

```bash
# 依存関係のインストール
npm install

# 開発モード（watch）
npm run dev

# ビルド
npm run build

# リント
npm run lint

# リント（自動修正）
npm run lint:fix

# フォーマット
npm run format

# リリースファイルの準備
npm run release
```

### リリースワークフロー

このプロジェクトは[tagpr](https://github.com/Songmu/tagpr)を使用した自動リリースワークフローを採用しています。

1. PRにラベルを付与してバージョンを指定:
   - `major`: メジャーバージョンアップ
   - `minor`: マイナーバージョンアップ
   - ラベルなし: パッチバージョンアップ

2. PRがmainにマージされると、tagprが自動的に:
   - バージョン番号を更新（manifest.json, package.json, versions.json）
   - CHANGELOGを生成
   - リリース用PRを作成

3. リリースPRがマージされると、GitHub Actionsが:
   - プラグインをビルド
   - リリースアセット（main.js, manifest.json, styles.css）をアップロード
   - ドラフトリリースを公開

## ライセンス

MIT License

## サポート

問題や要望は[GitHub Issues](https://github.com/handlename/obsidian-plugin-google-calendar-importer/issues)で報告してください。

## クレジット

- [Obsidian](https://obsidian.md) - 知識ベースアプリ
- [Google Calendar API](https://developers.google.com/calendar) - カレンダーデータソース
