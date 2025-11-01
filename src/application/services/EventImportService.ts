import type { Editor, TFile } from "obsidian";
import type { GoogleCalendarClient } from "../../infrastructure/google/GoogleCalendarClient";
import type { DateExtractorService } from "./DateExtractorService";
import type { TemplateFormatterService } from "./TemplateFormatterService";
import type { GoogleCalendarImporterSettings } from "../../types/settings";
import { AppError, ErrorCode } from "../errors/AppError";
import { Logger } from "../../utils/logger";

export class EventImportService {
	private logger: Logger;

	constructor(
		private googleCalendarClient: GoogleCalendarClient,
		private dateExtractor: DateExtractorService,
		private templateFormatter: TemplateFormatterService,
	) {
		this.logger = new Logger("EventImportService");
	}

	async importEvents(
		editor: Editor,
		file: TFile,
		settings: GoogleCalendarImporterSettings,
	): Promise<number> {
		try {
			this.logger.info("Starting event import process");

			const date = this.dateExtractor.extractDateFromFile(file);
			this.logger.info(`Target date: ${date.toISOString()}`);

			this.logger.info(`Fetching events from calendar: ${settings.calendarId}`);
			const events = await this.googleCalendarClient.getEventsForDate(
				settings.calendarId,
				date,
			);

			if (events.length === 0) {
				this.logger.info("No events found for the specified date");
				return 0;
			}

			this.logger.info(`Formatting ${events.length} events`);
			const formattedText = this.templateFormatter.formatEvents(
				events,
				settings,
			);

			editor.replaceSelection(formattedText);
			this.logger.info("Events inserted successfully");

			return events.length;
		} catch (error) {
			if (error instanceof AppError) {
				this.logger.error(`Import failed: ${error.code}`, error);
				throw error;
			}

			this.logger.error("Unexpected error during import", error as Error);
			throw new AppError(
				"Unexpected error during import",
				ErrorCode.UNEXPECTED_ERROR,
				error instanceof Error ? error : undefined,
			);
		}
	}
}
