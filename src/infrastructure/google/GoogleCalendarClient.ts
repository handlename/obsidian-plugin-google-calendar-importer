import type { calendar_v3 } from "googleapis";
import { google } from "googleapis";
import { AppError, ErrorCode } from "../../application/errors/AppError";
import { MAX_EVENTS } from "../../constants/defaults";
import type { CalendarEvent } from "../../types/calendar";
import { Logger } from "../../utils/logger";
import type { AuthService } from "./AuthService";

export class GoogleCalendarClient {
	private logger: Logger;
	private calendar: calendar_v3.Calendar | null = null;

	constructor(private authService: AuthService) {
		this.logger = new Logger("GoogleCalendarClient");
	}

	async initialize(): Promise<void> {
		if (!this.authService.isInitialized()) {
			throw AppError.fromCode(ErrorCode.AUTHENTICATION_ERROR);
		}

		try {
			const auth = this.authService.getAuthClient();
			this.calendar = google.calendar({ version: "v3", auth });
		} catch (error) {
			this.logger.error("Failed to initialize calendar client", error as Error);
			throw new AppError(
				"Failed to initialize Calendar API client",
				ErrorCode.AUTHENTICATION_ERROR,
				error instanceof Error ? error : undefined,
			);
		}
	}

	async getEventsForDate(calendarId: string, date: Date): Promise<CalendarEvent[]> {
		if (!this.calendar) {
			throw AppError.fromCode(ErrorCode.AUTHENTICATION_ERROR);
		}

		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		try {
			this.logger.info(`Fetching events for ${calendarId} on ${date.toISOString()}`);

			const response = await this.calendar.events.list({
				calendarId,
				timeMin: startOfDay.toISOString(),
				timeMax: endOfDay.toISOString(),
				maxResults: MAX_EVENTS,
				singleEvents: true,
				orderBy: "startTime",
			});

			const events = response.data.items || [];
			this.logger.info(`Retrieved ${events.length} events`);

			return events.map((event) => this.convertToCalendarEvent(event));
		} catch (error) {
			return this.handleApiError(error);
		}
	}

	private convertToCalendarEvent(event: calendar_v3.Schema$Event): CalendarEvent {
		const isAllDay = Boolean(event.start?.date);

		const startTime = isAllDay
			? new Date(event.start?.date || "")
			: new Date(event.start?.dateTime || "");

		const endTime = isAllDay
			? new Date(event.end?.date || "")
			: new Date(event.end?.dateTime || "");

		const attendees = event.attendees?.map((a) => a.email || "") || [];

		return {
			id: event.id || "",
			title: event.summary || "(タイトルなし)",
			description: event.description || undefined,
			location: event.location || undefined,
			startTime,
			endTime,
			isAllDay,
			attendees,
			htmlLink: event.htmlLink || undefined,
		};
	}

	private handleApiError(error: unknown): never {
		this.logger.error("API error occurred", error as Error);

		if (typeof error === "object" && error !== null && "code" in error) {
			const apiError = error as { code: number; message?: string };

			switch (apiError.code) {
				case 401:
					throw new AppError(
						"Authentication failed",
						ErrorCode.AUTHENTICATION_ERROR,
						error instanceof Error ? error : undefined,
					);
				case 403:
					throw new AppError(
						"Access forbidden",
						ErrorCode.AUTHORIZATION_ERROR,
						error instanceof Error ? error : undefined,
					);
				case 404:
					throw new AppError(
						"Calendar not found",
						ErrorCode.CALENDAR_NOT_FOUND,
						error instanceof Error ? error : undefined,
					);
				case 429:
					throw new AppError(
						"API quota exceeded",
						ErrorCode.API_QUOTA_ERROR,
						error instanceof Error ? error : undefined,
					);
			}
		}

		if (error instanceof Error && error.message.includes("ENOTFOUND")) {
			throw new AppError("Network error", ErrorCode.NETWORK_ERROR, error);
		}

		throw new AppError(
			"Unexpected API error",
			ErrorCode.UNEXPECTED_ERROR,
			error instanceof Error ? error : undefined,
		);
	}
}
