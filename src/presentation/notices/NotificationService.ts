import { Notice } from "obsidian";
import { ErrorCode } from "../../application/errors/AppError";

export class NotificationService {
	showSuccess(message: string, duration = 5000): void {
		new Notice(message, duration);
	}

	showWarning(message: string, duration = 5000): void {
		new Notice(message, duration);
	}

	showError(message: string, duration = 8000): void {
		new Notice(message, duration);
	}

	showErrorFromCode(code: ErrorCode, duration = 8000): void {
		const message = this.getErrorMessage(code);
		this.showError(message, duration);
	}

	showImportSuccess(eventCount: number): void {
		this.showSuccess(`${eventCount}件のイベントをインポートしました`);
	}

	showImportStart(): void {
		this.showSuccess("イベントを取得中...", 3000);
	}

	private getErrorMessage(code: ErrorCode): string {
		const messages: Record<ErrorCode, string> = {
			[ErrorCode.NETWORK_ERROR]: "ネットワーク接続を確認してください",
			[ErrorCode.AUTHENTICATION_ERROR]: "サービスアカウントキーを確認してください",
			[ErrorCode.AUTHORIZATION_ERROR]: "カレンダーへのアクセス権限がありません",
			[ErrorCode.API_QUOTA_ERROR]:
				"API使用量の上限に達しました。しばらく待ってから再試行してください",
			[ErrorCode.INVALID_DATE_FORMAT]: "Daily Noteの日付形式が不正です",
			[ErrorCode.INVALID_SETTINGS]: "設定が不正です。設定画面を確認してください",
			[ErrorCode.CALENDAR_NOT_FOUND]: "指定されたカレンダーが見つかりません",
			[ErrorCode.NO_ACTIVE_FILE]: "ファイルを開いてください",
			[ErrorCode.NOT_DAILY_NOTE]: "Daily Noteではありません",
			[ErrorCode.TEMPLATE_ERROR]: "テンプレートの形式が不正です",
			[ErrorCode.UNEXPECTED_ERROR]: "予期しないエラーが発生しました",
		};

		return messages[code] || messages[ErrorCode.UNEXPECTED_ERROR];
	}
}
