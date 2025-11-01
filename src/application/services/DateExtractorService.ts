import { parse } from "date-fns";
import type { App, TFile } from "obsidian";
import { Logger } from "../../utils/logger";
import { AppError, ErrorCode } from "../errors/AppError";

export class DateExtractorService {
	private logger: Logger;

	constructor(private app: App) {
		this.logger = new Logger("DateExtractorService");
	}

	extractDateFromFile(file: TFile): Date {
		const dailyNotesPlugin = this.app.plugins.plugins["daily-notes"];

		if (!dailyNotesPlugin) {
			this.logger.warn("Daily Notes plugin not found, trying default format");
			return this.parseFileNameWithDefaultFormat(file);
		}

		const format = dailyNotesPlugin.options?.format || "YYYY-MM-DD";
		return this.parseFileName(file, format);
	}

	private parseFileName(file: TFile, format: string): Date {
		const fileName = file.basename;
		this.logger.info(`Parsing file name: ${fileName} with format: ${format}`);

		try {
			const dateFnsFormat = this.convertMomentFormatToDateFns(format);
			const date = parse(fileName, dateFnsFormat, new Date());

			if (Number.isNaN(date.getTime())) {
				throw new Error("Invalid date");
			}

			this.logger.info(`Extracted date: ${date.toISOString()}`);
			return date;
		} catch (error) {
			this.logger.error("Failed to parse date from file name", error as Error);
			throw new AppError(
				`Failed to parse date from file name: ${fileName}`,
				ErrorCode.INVALID_DATE_FORMAT,
				error instanceof Error ? error : undefined,
			);
		}
	}

	private parseFileNameWithDefaultFormat(file: TFile): Date {
		return this.parseFileName(file, "YYYY-MM-DD");
	}

	private convertMomentFormatToDateFns(momentFormat: string): string {
		return momentFormat
			.replace(/YYYY/g, "yyyy")
			.replace(/DD/g, "dd")
			.replace(/D/g, "d")
			.replace(/M{4}/g, "MMMM")
			.replace(/M{3}/g, "MMM")
			.replace(/MM/g, "MM")
			.replace(/M/g, "M");
	}
}
