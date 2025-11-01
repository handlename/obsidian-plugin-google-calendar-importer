import type { Plugin } from "obsidian";
import type { GoogleCalendarImporterSettings } from "../../types/settings";
import { DEFAULT_SETTINGS } from "../../types/settings";
import { Logger } from "../../utils/logger";

export class SettingsRepository {
	private logger: Logger;

	constructor(private plugin: Plugin) {
		this.logger = new Logger("SettingsRepository");
	}

	async load(): Promise<GoogleCalendarImporterSettings> {
		try {
			const data = await this.plugin.loadData();
			const settings = Object.assign({}, DEFAULT_SETTINGS, data || {});
			this.logger.info("Settings loaded successfully");
			return settings;
		} catch (error) {
			this.logger.error("Failed to load settings", error as Error);
			return DEFAULT_SETTINGS;
		}
	}

	async save(settings: GoogleCalendarImporterSettings): Promise<void> {
		try {
			await this.plugin.saveData(settings);
			this.logger.info("Settings saved successfully");
		} catch (error) {
			this.logger.error("Failed to save settings", error as Error);
			throw error;
		}
	}
}
