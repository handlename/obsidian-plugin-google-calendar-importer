import type { Plugin } from "obsidian";
import { type App, PluginSettingTab, Setting } from "obsidian";
import { COMMON_TIMEZONES, getSystemTimezone } from "../../constants/timezones";
import type { GoogleCalendarImporterSettings } from "../../types/settings";
import { DEFAULT_SETTINGS } from "../../types/settings";
import {
	validateCalendarId,
	validateServiceAccountKey,
	validateTemplateSyntax,
} from "../../utils/validators";

export class SettingsTab extends PluginSettingTab {
	constructor(
		app: App,
		plugin: Plugin,
		private settings: GoogleCalendarImporterSettings,
		private onSettingsChange: (settings: GoogleCalendarImporterSettings) => Promise<void>,
	) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Google Calendar Importer Settings" });

		new Setting(containerEl)
			.setName("Service Account Key")
			.setDesc("Google Cloud service account JSON key (paste the entire JSON content)")
			.addTextArea((text) =>
				text
					.setPlaceholder("Paste service account JSON key here")
					.setValue(this.settings.serviceAccountKey)
					.onChange(async (value) => {
						this.settings.serviceAccountKey = value;
						await this.onSettingsChange(this.settings);
					})
					.then((textArea) => {
						textArea.inputEl.rows = 8;
						textArea.inputEl.cols = 50;
					}),
			);

		new Setting(containerEl)
			.setName("Calendar ID")
			.setDesc("Google Calendar ID (e.g., your-email@gmail.com)")
			.addText((text) =>
				text
					.setPlaceholder("calendar-id@gmail.com")
					.setValue(this.settings.calendarId)
					.onChange(async (value) => {
						this.settings.calendarId = value;
						await this.onSettingsChange(this.settings);
					}),
			);

		containerEl.createEl("h3", { text: "Event Templates" });

		new Setting(containerEl)
			.setName("Normal Event Template")
			.setDesc(
				"Template for regular events. Available variables: {{title}}, {{startTime}}, {{endTime}}, {{description}}, {{location}}, {{attendees}}",
			)
			.addTextArea((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.templates.normalEvent)
					.setValue(this.settings.templates.normalEvent)
					.onChange(async (value) => {
						this.settings.templates.normalEvent = value;
						await this.onSettingsChange(this.settings);
					})
					.then((textArea) => {
						textArea.inputEl.rows = 3;
						textArea.inputEl.cols = 50;
					}),
			);

		new Setting(containerEl)
			.setName("All-Day Event Template")
			.setDesc(
				"Template for all-day events. Available variables: {{title}}, {{description}}, {{location}}, {{attendees}}",
			)
			.addTextArea((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.templates.allDayEvent)
					.setValue(this.settings.templates.allDayEvent)
					.onChange(async (value) => {
						this.settings.templates.allDayEvent = value;
						await this.onSettingsChange(this.settings);
					})
					.then((textArea) => {
						textArea.inputEl.rows = 3;
						textArea.inputEl.cols = 50;
					}),
			);

		new Setting(containerEl)
			.setName("Timezone")
			.setDesc("Timezone for displaying event times")
			.addDropdown((dropdown) => {
				// Add system timezone as the first option
				const systemTz = getSystemTimezone();
				dropdown.addOption(systemTz, `System (${systemTz})`);

				// Add separator
				dropdown.addOption("---", "---");

				// Add common timezones
				for (const tz of COMMON_TIMEZONES) {
					if (tz !== systemTz) {
						dropdown.addOption(tz, tz);
					}
				}

				// Set current value
				dropdown.setValue(this.settings.timezone);

				// Handle change
				dropdown.onChange(async (value) => {
					// Skip separator
					if (value === "---") {
						return;
					}
					this.settings.timezone = value;
					await this.onSettingsChange(this.settings);
				});
			});

		new Setting(containerEl)
			.setName("Reset to Defaults")
			.setDesc("Reset all settings to default values")
			.addButton((button) =>
				button
					.setButtonText("Reset")
					.setWarning()
					.onClick(async () => {
						Object.assign(this.settings, DEFAULT_SETTINGS);
						await this.onSettingsChange(this.settings);
						this.display();
					}),
			);

		containerEl.createEl("h3", { text: "Validation" });
		this.displayValidationStatus(containerEl);
	}

	private displayValidationStatus(containerEl: HTMLElement): void {
		const validationEl = containerEl.createDiv({ cls: "setting-item-description" });

		const serviceAccountValid = validateServiceAccountKey(this.settings.serviceAccountKey);
		const calendarIdValid = validateCalendarId(this.settings.calendarId);
		const normalTemplateValid = validateTemplateSyntax(this.settings.templates.normalEvent);
		const allDayTemplateValid = validateTemplateSyntax(this.settings.templates.allDayEvent);

		const statusItems = [
			{ name: "Service Account Key", valid: serviceAccountValid !== null },
			{ name: "Calendar ID", valid: calendarIdValid },
			{ name: "Normal Event Template", valid: normalTemplateValid },
			{ name: "All-Day Event Template", valid: allDayTemplateValid },
		];

		for (const item of statusItems) {
			const statusText = item.valid ? "✓" : "✗";
			const statusClass = item.valid ? "valid" : "invalid";
			validationEl.createEl("div", {
				text: `${statusText} ${item.name}`,
				cls: statusClass,
			});
		}
	}
}
