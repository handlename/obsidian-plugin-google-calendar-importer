import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Mustache from "mustache";
import type { CalendarEvent } from "../../types/calendar";
import type { GoogleCalendarImporterSettings } from "../../types/settings";
import { Logger } from "../../utils/logger";
import { AppError, ErrorCode } from "../errors/AppError";

interface TemplateData {
	title: string;
	startTime: string;
	endTime: string;
	description: string;
	location: string;
	attendees: string;
}

export class TemplateFormatterService {
	private logger: Logger;

	constructor() {
		this.logger = new Logger("TemplateFormatterService");
	}

	formatEvents(events: CalendarEvent[], settings: GoogleCalendarImporterSettings): string {
		if (events.length === 0) {
			return "";
		}

		const formattedEvents = events
			.filter((event) => {
				const template = event.isAllDay
					? settings.templates.allDayEvent
					: settings.templates.normalEvent;
				return template.trim() !== "";
			})
			.map((event) => this.formatSingleEvent(event, settings));

		return formattedEvents.join("\n");
	}

	private formatSingleEvent(
		event: CalendarEvent,
		settings: GoogleCalendarImporterSettings,
	): string {
		const template = event.isAllDay
			? settings.templates.allDayEvent
			: settings.templates.normalEvent;

		const data = this.buildTemplateData(event, settings.timezone);

		try {
			return Mustache.render(template, data);
		} catch (error) {
			this.logger.error("Template rendering failed", error as Error);
			throw new AppError(
				"Template rendering failed",
				ErrorCode.TEMPLATE_ERROR,
				error instanceof Error ? error : undefined,
			);
		}
	}

	private buildTemplateData(event: CalendarEvent, timezone: string): TemplateData {
		const startTimeZoned = toZonedTime(event.startTime, timezone);
		const endTimeZoned = toZonedTime(event.endTime, timezone);

		return {
			title: event.title,
			startTime: event.isAllDay ? "" : format(startTimeZoned, "HH:mm"),
			endTime: event.isAllDay ? "" : format(endTimeZoned, "HH:mm"),
			description: event.description || "",
			location: event.location || "",
			attendees: event.attendees?.join(", ") || "",
		};
	}
}
