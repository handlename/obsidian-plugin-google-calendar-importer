# 技術設計書：Google Calendar Importer Plugin for Obsidian

## 1. 設計概要

### 1.1 目的
本文書は、Obsidian用Google Calendar Importerプラグインの技術設計を定義する。REQUIREMENTS.mdで定義された要件を実現するための技術的アプローチ、アーキテクチャ、モジュール構成、データフロー、およびエラーハンドリング戦略を明記する。

### 1.2 前提条件
- REQUIREMENTS.md v1.2に基づく設計
- Obsidian Plugin APIの仕様に準拠
- Google Calendar API v3を使用
- デスクトップ環境（Windows、macOS、Linux）での動作を保証

## 2. 技術スタック

### 2.1 コア技術

#### TypeScript 5.9.3
- **選定理由**:
  - 最新の安定版で、型安全性とDX（開発者体験）が向上
  - Obsidian Plugin APIの型定義との互換性が高い
  - `satisfies`演算子、`const` type parametersなど最新機能が利用可能
- **採用**: 現在のプロジェクトで使用中

#### Node.js v24
- **選定理由**:
  - LTS（Long Term Support）サポート対象
  - パフォーマンスとセキュリティの改善
  - 最新のV8エンジンによるJavaScript実行速度の向上
  - googleapis等のライブラリとの互換性が確保されている
- **採用**: 開発環境で使用中（本番ではObsidianの組み込みNode.js環境を使用）

### 2.2 ビルド＆開発ツール

#### esbuild
- **選定理由**:
  - Obsidian公式プラグインテンプレートで標準採用
  - 高速なバンドル処理（Webpack比で10-100倍高速）
  - TypeScriptのトランスパイルを直接サポート
  - プラグイン開発の開発体験向上
- **継続採用**

#### Biome
- **選定理由**:
  - フォーマッターとリンターを統合した高速ツール（Rust製）
  - ESLint + Prettierの代替として、設定がシンプル
  - TypeScript 5.9.3の最新構文を完全サポート
  - パフォーマンスが優れている（Prettier比で最大20倍高速）
  - ゼロコンフィグで動作可能
- **採用**: Biome 2.3.2を使用中
- **移行理由**: ESLintから移行し、開発体験とパフォーマンスを向上

### 2.3 外部ライブラリ

#### googleapis (Google Calendar API Client)
- **選定理由**:
  - Google公式のNode.js用APIクライアント
  - TypeScript型定義が完備
  - サービスアカウント認証をサポート
  - Calendar API v3の完全なサポート
  - アクティブなメンテナンス
- **バージョン**: 最新の安定版（v140以降）
- **不採用技術**: 
  - **gapi-script**: ブラウザ専用でNode.js環境で動作しない
  - **gcal-api**: メンテナンスが停止している

#### date-fns (日付処理)
- **選定理由**:
  - モダンで軽量な日付処理ライブラリ
  - Tree-shakingに対応（未使用コードの削除）
  - イミュータブルな設計
  - TypeScript型定義が完備
  - タイムゾーン処理をサポート（date-fns-tz）
- **バージョン**: v4.x（最新）
- **不採用技術**:
  - **Moment.js**: 大きなバンドルサイズ、ミュータブルな設計
  - **Day.js**: 機能がやや限定的、タイムゾーン処理のサポートが弱い
  - **Luxon**: バンドルサイズが大きい

#### mustache (テンプレートエンジン)
- **選定理由**:
  - シンプルで軽量なロジックレステンプレートエンジン
  - セキュリティリスクが低い（サンドボックス化不要）
  - ユーザーが理解しやすいシンプルな構文（`{{variable}}`）
  - TypeScript型定義が利用可能
- **バージョン**: v4.x
- **不採用技術**:
  - **Handlebars**: Mustacheより重量、複雑なロジックが可能だが今回は不要
  - **EJS**: HTMLテンプレート向けで、Markdown用途には過剰
  - **テンプレートリテラル**: ユーザーが設定画面で編集しにくい

## 3. アーキテクチャ設計

### 3.1 レイヤー構成

```
┌─────────────────────────────────────────┐
│        Presentation Layer               │
│  (Obsidian Plugin Interface)            │
│  - Commands                             │
│  - Settings Tab                         │
│  - Notices                              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Application Layer                │
│  (Business Logic)                       │
│  - EventImportService                   │
│  - DateExtractorService                 │
│  - TemplateFormatterService             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Infrastructure Layer             │
│  (External API & Data Access)           │
│  - GoogleCalendarClient                 │
│  - SettingsRepository                   │
└─────────────────────────────────────────┘
```

### 3.2 モジュール構成

```
src/
├── main.ts                           # プラグインエントリーポイント
├── types/
│   ├── settings.ts                   # 設定型定義
│   ├── calendar.ts                   # カレンダーイベント型定義
│   └── obsidian-daily-notes.d.ts    # Daily Notes API型定義（拡張）
├── presentation/
│   ├── commands/
│   │   └── ImportEventsCommand.ts   # イベントインポートコマンド
│   ├── settings/
│   │   └── SettingsTab.ts            # 設定タブUI
│   └── notices/
│       └── NotificationService.ts    # 通知サービス
├── application/
│   ├── services/
│   │   ├── EventImportService.ts     # イベントインポート統括
│   │   ├── DateExtractorService.ts   # 日付抽出ロジック
│   │   └── TemplateFormatterService.ts # テンプレートフォーマット
│   └── errors/
│       └── AppError.ts               # アプリケーションエラー
├── infrastructure/
│   ├── google/
│   │   ├── GoogleCalendarClient.ts   # Google Calendar API Client
│   │   └── AuthService.ts            # 認証サービス
│   └── repositories/
│       └── SettingsRepository.ts     # 設定永続化
├── utils/
│   ├── logger.ts                     # ロギングユーティリティ
│   └── validators.ts                 # バリデーション
└── constants/
    └── defaults.ts                   # デフォルト値定義
```

### 3.3 主要モジュールの責務

#### 3.3.1 Presentation Layer

**ImportEventsCommand.ts**
- コマンドパレットからの実行エントリーポイント
- 現在開いているファイルの検証
- EventImportServiceの呼び出し
- 結果通知の表示

**SettingsTab.ts**
- 設定UIの構築（Obsidian Setting API使用）
- サービスアカウントキーの入力フォーム
- カレンダーID入力
- テンプレートフォーマット編集（通常予定/終日予定）
- タイムゾーン選択
- 設定の検証とエラー表示

**NotificationService.ts**
- Obsidian Noticeを使用した通知表示
- 成功/エラーメッセージの統一フォーマット
- 進捗表示

#### 3.3.2 Application Layer

**EventImportService.ts**
- イベントインポートの統括ロジック
- 以下のフローを調整:
  1. DateExtractorServiceで日付を抽出
  2. GoogleCalendarClientでイベント取得
  3. TemplateFormatterServiceでフォーマット
  4. エディタへの挿入
- エラーハンドリングと通知

**DateExtractorService.ts**
- Daily Noteファイル名から日付を抽出
- Daily Notesプラグインの設定を読み取り
- 日付フォーマットのパース（date-fns使用）
- タイムゾーン考慮

**TemplateFormatterService.ts**
- Mustacheを使用したテンプレート処理
- 通常予定と終日予定の判定
- テンプレート変数の展開:
  - `{{title}}`
  - `{{startTime}}`
  - `{{endTime}}`
  - `{{description}}`
  - `{{location}}`
  - `{{attendees}}`
- 日時フォーマット（date-fns使用）

#### 3.3.3 Infrastructure Layer

**GoogleCalendarClient.ts**
- googleapis ライブラリのラッパー
- サービスアカウント認証の初期化
- Calendar API v3の呼び出し
- イベント一覧の取得（指定日の0:00-23:59）
- APIエラーのハンドリングと変換

**AuthService.ts**
- サービスアカウントJSONキーのパース
- google.auth.GoogleAuth の初期化
- 認証クライアントの生成
- スコープ: `https://www.googleapis.com/auth/calendar.readonly`

**SettingsRepository.ts**
- Obsidian Plugin Data APIを使用した永続化
- 設定の読み込み・保存
- デフォルト値のマージ
- JSONシリアライゼーション

### 3.4 依存性注入

依存性の注入には、コンストラクタインジェクションパターンを採用する。これにより、テストが容易になり、モジュール間の疎結合を実現する。

```typescript
// 例: EventImportService
export class EventImportService {
  constructor(
    private googleCalendarClient: GoogleCalendarClient,
    private dateExtractor: DateExtractorService,
    private templateFormatter: TemplateFormatterService,
    private notificationService: NotificationService,
    private logger: Logger
  ) {}
  
  async importEvents(editor: Editor, file: TFile): Promise<void> {
    // 実装
  }
}
```

## 4. データフロー設計

### 4.1 イベントインポートフロー

```
┌─────────────────┐
│  User Action    │
│ (Command exec)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  ImportEventsCommand                    │
│  1. 現在のファイル取得                    │
│  2. Daily Noteか検証                     │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  EventImportService.importEvents()      │
└────────┬────────────────────────────────┘
         │
         ├──────────────────────────────────┐
         │                                  │
         ▼                                  ▼
┌─────────────────────┐        ┌─────────────────────┐
│ DateExtractorService│        │SettingsRepository   │
│ - ファイル名解析      │        │ - 設定読み込み        │
│ - 日付抽出          │        │                     │
└────────┬────────────┘        └──────────┬──────────┘
         │                                  │
         └──────────────┬───────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────┐
         │  GoogleCalendarClient           │
         │  - 認証                          │
         │  - APIコール                     │
         │  - イベント取得                  │
         └────────┬────────────────────────┘
                  │
                  ▼
         ┌─────────────────────────────────┐
         │  TemplateFormatterService       │
         │  - 終日判定                      │
         │  - テンプレート適用              │
         │  - フォーマット                  │
         └────────┬────────────────────────┘
                  │
                  ▼
         ┌─────────────────────────────────┐
         │  Editor.replaceSelection()      │
         │  - カーソル位置に挿入            │
         └────────┬────────────────────────┘
                  │
                  ▼
         ┌─────────────────────────────────┐
         │  NotificationService            │
         │  - 成功通知表示                  │
         └─────────────────────────────────┘
```

### 4.2 設定保存フロー

```
┌──────────────────┐
│  Settings Tab    │
│  - ユーザー入力   │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Validation                         │
│  - JSONキー検証                      │
│  - カレンダーID検証                  │
│  - テンプレート構文検証              │
└────────┬────────────────────────────┘
         │
         ▼ (検証OK)
┌─────────────────────────────────────┐
│  SettingsRepository.save()          │
│  - JSONシリアライズ                  │
│  - Plugin.saveData()                │
└─────────────────────────────────────┘
```

### 4.3 エラーハンドリングフロー

```
┌─────────────────────────────────────┐
│  Any Layer                          │
│  - エラー発生                        │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Error Classification               │
│  - NetworkError                     │
│  - AuthenticationError              │
│  - ValidationError                  │
│  - ApiQuotaError                    │
│  - UnexpectedError                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Logger                             │
│  - コンソールログ出力                │
│  - エラー詳細記録                    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  NotificationService                │
│  - ユーザーフレンドリーなメッセージ  │
│  - エラー種別に応じた通知            │
└─────────────────────────────────────┘
```

## 5. データモデル設計

### 5.1 Settings型

```typescript
interface GoogleCalendarImporterSettings {
  // サービスアカウント認証情報（JSON文字列）
  serviceAccountKey: string;
  
  // カレンダーID
  calendarId: string;
  
  // テンプレートフォーマット
  templates: {
    normalEvent: string;    // 通常予定用
    allDayEvent: string;    // 終日予定用
  };
  
  // タイムゾーン（IANA形式: "Asia/Tokyo"）
  timezone: string;
}

// デフォルト値
const DEFAULT_SETTINGS: GoogleCalendarImporterSettings = {
  serviceAccountKey: '',
  calendarId: '',
  templates: {
    normalEvent: '- {{startTime}}-{{endTime}}: {{title}}',
    allDayEvent: '- [終日] {{title}}'
  },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};
```

### 5.2 CalendarEvent型

```typescript
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  attendees?: string[];
  htmlLink?: string;
}
```

### 5.3 ServiceAccountKey型

```typescript
interface ServiceAccountKey {
  type: 'service_account';
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}
```

### 5.4 AppError型

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  API_QUOTA_ERROR = 'API_QUOTA_ERROR',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  INVALID_SETTINGS = 'INVALID_SETTINGS',
  CALENDAR_NOT_FOUND = 'CALENDAR_NOT_FOUND',
  NO_ACTIVE_FILE = 'NO_ACTIVE_FILE',
  NOT_DAILY_NOTE = 'NOT_DAILY_NOTE',
  TEMPLATE_ERROR = 'TEMPLATE_ERROR',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR'
}
```

## 6. エラーハンドリング戦略

### 6.1 エラー分類と対処

| エラー種別 | 発生箇所 | ユーザーメッセージ | ログレベル | 復旧方法 |
|-----------|---------|-------------------|-----------|---------|
| NETWORK_ERROR | GoogleCalendarClient | ネットワーク接続を確認してください | ERROR | 再試行を促す |
| AUTHENTICATION_ERROR | AuthService | サービスアカウントキーを確認してください | ERROR | 設定画面へ誘導 |
| AUTHORIZATION_ERROR | GoogleCalendarClient | カレンダーへのアクセス権限がありません | ERROR | 権限設定の説明 |
| API_QUOTA_ERROR | GoogleCalendarClient | API使用量の上限に達しました | WARN | 時間を置いて再試行 |
| INVALID_DATE_FORMAT | DateExtractorService | Daily Noteの日付形式が不正です | ERROR | 設定確認を促す |
| INVALID_SETTINGS | SettingsRepository | 設定が不正です | ERROR | 設定画面へ誘導 |
| CALENDAR_NOT_FOUND | GoogleCalendarClient | 指定されたカレンダーが見つかりません | ERROR | カレンダーID確認 |
| NO_ACTIVE_FILE | ImportEventsCommand | ファイルを開いてください | WARN | - |
| NOT_DAILY_NOTE | DateExtractorService | Daily Noteではありません | WARN | - |
| TEMPLATE_ERROR | TemplateFormatterService | テンプレートの形式が不正です | ERROR | テンプレート修正 |
| UNEXPECTED_ERROR | Any | 予期しないエラーが発生しました | ERROR | 詳細をログで確認 |

### 6.2 非同期エラーハンドリング

すべての非同期処理は`try-catch`で囲み、適切にエラーを変換する：

```typescript
async importEvents(editor: Editor, file: TFile): Promise<void> {
  try {
    // 処理
  } catch (error) {
    if (error instanceof AppError) {
      this.handleAppError(error);
    } else if (error.code === 'ENOTFOUND') {
      this.handleNetworkError(error);
    } else if (error.code === 401) {
      this.handleAuthError(error);
    } else {
      this.handleUnexpectedError(error);
    }
  }
}
```

### 6.3 ユーザー通知戦略

- **成功**: 緑色の通知で「○件のイベントをインポートしました」
- **警告**: 黄色の通知で操作を促す
- **エラー**: 赤色の通知で問題と対処法を簡潔に表示
- **詳細ログ**: 開発者コンソールに詳細なスタックトレースを出力

## 7. パフォーマンス考慮事項

### 7.1 非同期処理

- すべてのAPI呼び出しは非同期で実行
- UI フリーズを防ぐため、Notice表示で進行状況を通知
- Promise.allを使用して並列処理可能な部分を最適化（将来の拡張時）

### 7.2 バンドルサイズ最適化

- esbuildのTree-shakingを活用
- date-fnsは必要な関数のみインポート（`import { format } from 'date-fns'`）
- googleapis は calendar v3 のみを使用

### 7.3 メモリ管理

- イベント一覧取得時に maxResults を設定（デフォルト100件）
- 大量イベント時のメモリリークを防ぐ

## 8. セキュリティ考慮事項

### 8.1 認証情報の保護

- サービスアカウントキーはローカルVaultのプラグインデータ領域に保存
- 暗号化は行わない（ローカルファイルシステムのセキュリティに依存）
- `.gitignore`にプラグインデータディレクトリを追加するよう文書化
- README.mdで認証情報の取り扱いに関する注意喚起

### 8.2 API権限の最小化

- スコープ: `https://www.googleapis.com/auth/calendar.readonly`
- 読み取り専用アクセスのみを要求
- カレンダーの編集・削除権限は付与しない

### 8.3 入力検証

- サービスアカウントキーのJSON妥当性検証
- カレンダーIDの形式検証（メールアドレス形式）
- テンプレート構文の検証（Mustache構文チェック）

### 8.4 XSS対策

- Mustacheのデフォルトエスケープ機能を活用
- ユーザー入力（カレンダーイベントのタイトルなど）をサニタイズ不要
  - Markdown挿入のため、HTMLエスケープは不要
  - Obsidian側でレンダリング時に処理される

## 9. テスト戦略

### 9.1 単体テスト

各モジュールに対して単体テストを実装（将来の拡張として）：

- **対象モジュール**:
  - DateExtractorService
  - TemplateFormatterService
  - Validators
- **テストフレームワーク**: Vitest（高速、ESM対応）
- **モック**: vi.mock()を使用

### 9.2 統合テスト

主要なフローに対する統合テスト（将来の拡張として）：

- EventImportService のエンドツーエンドテスト
- GoogleCalendarClient のモックを使用したテスト

### 9.3 手動テスト

初回リリースでは手動テストを中心に実施：

- 各種エラーケースの動作確認
- 異なる日付フォーマットでの動作確認
- タイムゾーン変換の確認
- 終日予定と通常予定のフォーマット確認

## 10. ビルド＆デプロイ設定

### 10.1 package.json scripts

```json
{
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "release": "npm run build && node scripts/prepare-release.mjs"
  }
}
```

**変更点:**
- `version`スクリプトを削除（tagprによる自動バージョン管理に移行）
- `release`スクリプトを追加（リリースファイルの準備を自動化）
- `type-check`スクリプトを削除（`build`に統合）

### 10.2 biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "include": ["src/**/*.ts", "*.ts", "*.mjs"],
    "ignore": ["node_modules", "main.js", "*.d.ts"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "complexity": {
        "noForEach": "off"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5"
    }
  },
  "overrides": [
    {
      "include": ["*.mjs"],
      "linter": {
        "rules": {
          "style": {
            "useNodejsImportProtocol": "off"
          }
        }
      }
    }
  ]
}
```

### 10.3 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM"],
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 10.4 esbuild.config.mjs

既存の設定を維持しつつ、以下を考慮：

- `platform: 'node'`（Node.jsモジュール使用のため）
- `format: 'cjs'`（Obsidian要件）
- `external: ['obsidian']`
- `bundle: true`
- `minify: production`

### 10.5 .gitignore

```
node_modules/
main.js
*.map
.obsidian/
data.json
.DS_Store
```

## 11. 依存パッケージ一覧

### 11.1 dependencies

```json
{
  "googleapis": "^140.0.0",
  "date-fns": "^4.1.0",
  "date-fns-tz": "^3.2.0",
  "mustache": "^4.2.0"
}
```

### 11.2 devDependencies

```json
{
  "@biomejs/biome": "^1.9.4",
  "@types/mustache": "^4.2.5",
  "@types/node": "^24.0.0",
  "builtin-modules": "^4.0.0",
  "esbuild": "^0.24.0",
  "obsidian": "latest",
  "typescript": "5.9.3"
}
```

## 12. マイグレーション計画

### 12.1 既存プロジェクトからの変更

1. **Node.js v24へのアップグレード**
   - `.nvmrc` ファイルを追加: `24`
   - CI/CD環境の更新

2. **TypeScript 5.9.3へのアップグレード**
   - `package.json`の更新
   - `tsconfig.json`の最適化
   - 新しい型機能の活用

3. **ESLintからBiomeへの移行**
   - ESLint関連パッケージの削除
   - `.eslintrc`、`.eslintignore`の削除
   - `biome.json`の追加
   - npm scriptsの更新

4. **新規依存パッケージの追加**
   - googleapis
   - date-fns、date-fns-tz
   - mustache

### 12.2 移行手順

**注意**: このセクションは歴史的な参考情報です。現在のプロジェクトは既に以下の変更が適用済みです。

```bash
# 1. Node.jsバージョン切り替え（完了済み）
nvm use 24

# 2. 既存の依存関係削除（完了済み）
rm -rf node_modules package-lock.json

# 3. パッケージ更新（完了済み）
npm install

# 4. ESLint関連削除（完了済み）
npm uninstall eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
rm .eslintrc .eslintignore

# 5. Biomeインストールと設定（完了済み）
npm install --save-dev @biomejs/biome
# biome.json を作成済み

# 6. 新規依存追加（完了済み）
npm install googleapis date-fns date-fns-tz mustache
npm install --save-dev @types/mustache @types/node

# 7. リリースワークフローの改善（完了済み）
# - scripts/prepare-release.mjs を追加
# - .tagpr 設定を更新
# - version-bump.mjs を削除（tagprに統合）

# 8. ビルド確認
npm run build

# 9. Lint/Format確認
npm run lint
npm run format

# 10. リリース準備確認
npm run release
```

**現在の状態**: 
- ESLintからBiomeへの移行完了
- tagprによる自動リリースワークフロー導入済み
- Node.js v24、TypeScript 5.9.3、Biome 2.3.2を使用中

## 13. 今後の拡張可能性

### 13.1 FR-008: 複数カレンダー対応

将来的な実装時の考慮事項：

- `calendarId`を`calendarIds: string[]`に変更
- 複数カレンダーからのイベント取得を並列実行（Promise.all）
- イベントのマージとソート（時系列順）
- カレンダー別の色分け表示（任意）

### 13.2 モバイル対応

- OAuth 2.0認証への切り替えが必要
- ブラウザベースの認証フロー実装
- googleapis のブラウザ互換バージョンの検討
- または、代替APIクライアントの選定

### 13.3 キャッシュ機能

- IndexedDB または LocalStorage を使用
- イベントデータのキャッシュ期間設定
- キャッシュ無効化ロジック

## 14. 開発環境セットアップ

### 14.1 必要な環境

- Node.js v24.x
- npm v10.x
- Git
- Obsidian（テスト用）

### 14.2 開発開始手順

```bash
# 1. リポジトリクローン
git clone https://github.com/[username]/obsidian-plugin-google-calendar-importer.git
cd obsidian-plugin-google-calendar-importer

# 2. Node.jsバージョン確認・切り替え
nvm use 24

# 3. 依存関係インストール
npm install

# 4. 開発ビルド起動
npm run dev

# 5. Obsidianテストvaultへシンボリックリンク作成
ln -s $(pwd) /path/to/vault/.obsidian/plugins/google-calendar-importer
```

### 14.3 推奨VSCode拡張機能

- Biome (biomejs.biome)
- TypeScript + JavaScript (ms-vscode.vscode-typescript-next)
- EditorConfig (editorconfig.editorconfig)

---

**文書バージョン**: 1.0  
**作成日**: 2025-11-01  
**最終更新日**: 2025-11-01  
**ステータス**: 初版  
**関連文書**: REQUIREMENTS.md v1.2
