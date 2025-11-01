export enum ErrorCode {
	NETWORK_ERROR = "NETWORK_ERROR",
	AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
	AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
	API_QUOTA_ERROR = "API_QUOTA_ERROR",
	INVALID_DATE_FORMAT = "INVALID_DATE_FORMAT",
	INVALID_SETTINGS = "INVALID_SETTINGS",
	CALENDAR_NOT_FOUND = "CALENDAR_NOT_FOUND",
	NO_ACTIVE_FILE = "NO_ACTIVE_FILE",
	NOT_DAILY_NOTE = "NOT_DAILY_NOTE",
	TEMPLATE_ERROR = "TEMPLATE_ERROR",
	UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
}

const ERROR_MESSAGES: Record<ErrorCode, string> = {
	[ErrorCode.NETWORK_ERROR]: "ネットワーク接続を確認してください",
	[ErrorCode.AUTHENTICATION_ERROR]:
		"サービスアカウントキーを確認してください",
	[ErrorCode.AUTHORIZATION_ERROR]:
		"カレンダーへのアクセス権限がありません",
	[ErrorCode.API_QUOTA_ERROR]: "API使用量の上限に達しました",
	[ErrorCode.INVALID_DATE_FORMAT]: "Daily Noteの日付形式が不正です",
	[ErrorCode.INVALID_SETTINGS]: "設定が不正です",
	[ErrorCode.CALENDAR_NOT_FOUND]:
		"指定されたカレンダーが見つかりません",
	[ErrorCode.NO_ACTIVE_FILE]: "ファイルを開いてください",
	[ErrorCode.NOT_DAILY_NOTE]: "Daily Noteではありません",
	[ErrorCode.TEMPLATE_ERROR]: "テンプレートの形式が不正です",
	[ErrorCode.UNEXPECTED_ERROR]: "予期しないエラーが発生しました",
};

export class AppError extends Error {
	constructor(
		message: string,
		public code: ErrorCode,
		public originalError?: Error,
	) {
		super(message);
		this.name = "AppError";
	}

	getUserMessage(): string {
		return ERROR_MESSAGES[this.code] || ERROR_MESSAGES[ErrorCode.UNEXPECTED_ERROR];
	}

	static fromCode(code: ErrorCode, originalError?: Error): AppError {
		return new AppError(ERROR_MESSAGES[code], code, originalError);
	}
}
