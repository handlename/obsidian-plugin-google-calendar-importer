import { Plugin } from "obsidian";
import type { GoogleCalendarImporterSettings } from "./types/settings";
import { SettingsRepository } from "./infrastructure/repositories/SettingsRepository";
import { AuthService } from "./infrastructure/google/AuthService";
import { GoogleCalendarClient } from "./infrastructure/google/GoogleCalendarClient";
import { DateExtractorService } from "./application/services/DateExtractorService";
import { TemplateFormatterService } from "./application/services/TemplateFormatterService";
import { EventImportService } from "./application/services/EventImportService";
import { NotificationService } from "./presentation/notices/NotificationService";
import { SettingsTab } from "./presentation/settings/SettingsTab";
import { ImportEventsCommand } from "./presentation/commands/ImportEventsCommand";
import { Logger } from "./utils/logger";

export default class GoogleCalendarImporterPlugin extends Plugin {
	settings!: GoogleCalendarImporterSettings;
	private logger: Logger;
	private settingsRepository!: SettingsRepository;
	private authService!: AuthService;
	private googleCalendarClient!: GoogleCalendarClient;
	private notificationService!: NotificationService;

	constructor(app: typeof Plugin.prototype.app, manifest: typeof Plugin.prototype.manifest) {
		super(app, manifest);
		this.logger = new Logger("GoogleCalendarImporterPlugin");
	}

	async onload(): Promise<void> {
		this.logger.info("Loading Google Calendar Importer plugin");

		this.settingsRepository = new SettingsRepository(this);
		this.settings = await this.settingsRepository.load();

		this.authService = new AuthService();
		this.googleCalendarClient = new GoogleCalendarClient(this.authService);
		this.notificationService = new NotificationService();

		if (this.settings.serviceAccountKey) {
			try {
				this.authService.initialize(this.settings.serviceAccountKey);
				await this.googleCalendarClient.initialize();
				this.logger.info("Google Calendar client initialized");
			} catch (error) {
				this.logger.warn(
					"Failed to initialize Google Calendar client. Please check settings.",
					error as Error,
				);
			}
		}

		const dateExtractor = new DateExtractorService(this.app);
		const templateFormatter = new TemplateFormatterService();
		const eventImportService = new EventImportService(
			this.googleCalendarClient,
			dateExtractor,
			templateFormatter,
		);

		const importCommand = new ImportEventsCommand(
			eventImportService,
			this.notificationService,
		);

		this.addCommand(importCommand.getCommandDefinition(this.settings));

		this.addSettingTab(
			new SettingsTab(
				this.app,
				this,
				this.settings,
				this.saveSettings.bind(this),
			),
		);

		this.logger.info("Google Calendar Importer plugin loaded");
	}

	async onunload(): Promise<void> {
		this.logger.info("Unloading Google Calendar Importer plugin");
	}

	async saveSettings(): Promise<void> {
		await this.settingsRepository.save(this.settings);

		if (this.settings.serviceAccountKey) {
			try {
				this.authService.initialize(this.settings.serviceAccountKey);
				await this.googleCalendarClient.initialize();
				this.logger.info("Google Calendar client reinitialized after settings change");
			} catch (error) {
				this.logger.error(
					"Failed to reinitialize Google Calendar client",
					error as Error,
				);
			}
		}
	}
}
