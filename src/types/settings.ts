export interface GoogleCalendarImporterSettings {
	serviceAccountKey: string;
	calendarId: string;
	templates: {
		normalEvent: string;
		allDayEvent: string;
	};
	timezone: string;
}

export const DEFAULT_SETTINGS: GoogleCalendarImporterSettings = {
	serviceAccountKey: "",
	calendarId: "",
	templates: {
		normalEvent: "- {{startTime}}-{{endTime}}: {{title}}",
		allDayEvent: "- [終日] {{title}}",
	},
	timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};
