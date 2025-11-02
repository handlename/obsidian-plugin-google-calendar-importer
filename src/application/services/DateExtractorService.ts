import type { App, TFile } from "obsidian";
import { Logger } from "../../utils/logger";
import { AppError, ErrorCode } from "../errors/AppError";

export class DateExtractorService {
	private logger: Logger;

	constructor(
		private app: App,
		private dailyNotePathFormat?: string,
	) {
		this.logger = new Logger("DateExtractorService");
	}

	extractDateFromFile(file: TFile): Date {
		const dailyNotesPlugin = this.app.plugins.plugins["daily-notes"];
		let format: string;

		if (this.dailyNotePathFormat) {
			format = this.dailyNotePathFormat;
			this.logger.info(`Using custom daily note path format: ${format}`);
		} else if (dailyNotesPlugin) {
			format = dailyNotesPlugin.options?.format || "YYYY-MM-DD";
			this.logger.info(`Using Daily Notes plugin format: ${format}`);
		} else {
			this.logger.warn("Daily Notes plugin not found, trying default format");
			format = "YYYY-MM-DD";
		}

		return this.parseFilePath(file, format);
	}

	private parseFilePath(file: TFile, format: string): Date {
		const pathWithoutExtension = file.path.replace(/\.md$/, "");
		this.logger.info(`Parsing file path: ${pathWithoutExtension} with format: ${format}`);

		try {
			const dateComponents = this.extractDateComponents(pathWithoutExtension, format);

			// Validate date components before creating Date object
			if (
				dateComponents.month < 1 ||
				dateComponents.month > 12 ||
				dateComponents.day < 1 ||
				dateComponents.day > 31
			) {
				throw new Error("Invalid date components");
			}

			const date = new Date(dateComponents.year, dateComponents.month - 1, dateComponents.day);

			if (Number.isNaN(date.getTime())) {
				throw new Error("Invalid date");
			}

			// Verify the date wasn't adjusted by JavaScript (e.g., Feb 30 -> Mar 2)
			if (
				date.getFullYear() !== dateComponents.year ||
				date.getMonth() !== dateComponents.month - 1 ||
				date.getDate() !== dateComponents.day
			) {
				throw new Error("Invalid date - date was adjusted");
			}

			this.logger.info(`Extracted date: ${date.toISOString()}`);
			return date;
		} catch (error) {
			this.logger.error("Failed to parse date from file path", error as Error);
			throw new AppError(
				`Failed to parse date from file path: ${pathWithoutExtension}`,
				ErrorCode.INVALID_DATE_FORMAT,
				error instanceof Error ? error : undefined,
			);
		}
	}

	private extractDateComponents(
		path: string,
		format: string,
	): { year: number; month: number; day: number } {
		// Create a regex pattern from the format string
		// Replace date tokens with capture groups
		let regexPattern = format
			.replace(/YYYY/g, "(\\d{4})")
			.replace(/MM/g, "(\\d{2})")
			.replace(/DD/g, "(\\d{2})")
			.replace(/M/g, "(\\d{1,2})")
			.replace(/D/g, "(\\d{1,2})");

		// Escape special regex characters that might be in the format
		regexPattern = regexPattern.replace(/\//g, "\\/");

		const regex = new RegExp(`^${regexPattern}$`);
		const match = path.match(regex);

		if (!match) {
			throw new Error(`Path does not match format. Path: ${path}, Format: ${format}`);
		}

		// Find which capture groups correspond to year, month, day
		const tokens: string[] = [];
		let remaining = format;
		while (remaining.length > 0) {
			if (remaining.startsWith("YYYY")) {
				tokens.push("YYYY");
				remaining = remaining.slice(4);
			} else if (remaining.startsWith("MM")) {
				tokens.push("MM");
				remaining = remaining.slice(2);
			} else if (remaining.startsWith("DD")) {
				tokens.push("DD");
				remaining = remaining.slice(2);
			} else if (remaining.startsWith("M")) {
				tokens.push("M");
				remaining = remaining.slice(1);
			} else if (remaining.startsWith("D")) {
				tokens.push("D");
				remaining = remaining.slice(1);
			} else {
				remaining = remaining.slice(1);
			}
		}

		// Extract year, month, day from the first occurrence of each token
		let year: number | undefined;
		let month: number | undefined;
		let day: number | undefined;
		let captureIndex = 1;

		for (const token of tokens) {
			if (token === "YYYY" && year === undefined) {
				year = Number.parseInt(match[captureIndex], 10);
				captureIndex++;
			} else if ((token === "MM" || token === "M") && month === undefined) {
				month = Number.parseInt(match[captureIndex], 10);
				captureIndex++;
			} else if ((token === "DD" || token === "D") && day === undefined) {
				day = Number.parseInt(match[captureIndex], 10);
				captureIndex++;
			} else {
				captureIndex++;
			}
		}

		if (year === undefined || month === undefined || day === undefined) {
			throw new Error(`Could not extract date components from path: ${path}`);
		}

		return { year, month, day };
	}
}
