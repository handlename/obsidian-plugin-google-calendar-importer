import type { GoogleAuth } from "google-auth-library";
import { google } from "googleapis";
import { AppError, ErrorCode } from "../../application/errors/AppError";
import { GOOGLE_CALENDAR_SCOPES } from "../../constants/defaults";
import type { ServiceAccountKey } from "../../types/calendar";
import { validateServiceAccountKey } from "../../utils/validators";

export class AuthService {
	private auth: GoogleAuth | null = null;

	initialize(serviceAccountKeyJson: string): void {
		const key = validateServiceAccountKey(serviceAccountKeyJson);
		if (!key) {
			throw AppError.fromCode(ErrorCode.AUTHENTICATION_ERROR);
		}

		try {
			this.auth = new google.auth.GoogleAuth({
				credentials: key as ServiceAccountKey,
				scopes: GOOGLE_CALENDAR_SCOPES,
			});
		} catch (error) {
			throw new AppError(
				"Failed to initialize Google Auth",
				ErrorCode.AUTHENTICATION_ERROR,
				error instanceof Error ? error : undefined,
			);
		}
	}

	getAuthClient(): GoogleAuth {
		if (!this.auth) {
			throw AppError.fromCode(ErrorCode.AUTHENTICATION_ERROR);
		}
		return this.auth;
	}

	isInitialized(): boolean {
		return this.auth !== null;
	}
}
