import { beforeEach, describe, expect, it } from "vitest";
import type { CalendarEvent } from "../../types/calendar";
import type { GoogleCalendarImporterSettings } from "../../types/settings";
import { TemplateFormatterService } from "./TemplateFormatterService";

describe("TemplateFormatterService", () => {
	let service: TemplateFormatterService;
	let mockSettings: GoogleCalendarImporterSettings;

	beforeEach(() => {
		service = new TemplateFormatterService();
		mockSettings = {
			serviceAccountKey: "",
			calendarId: "test@example.com",
			timezone: "Asia/Tokyo",
			dailyNotePathFormat: "YYYY-MM-DD",
			templates: {
				normalEvent: "- {{startTime}}-{{endTime}} {{title}}",
				allDayEvent: "- {{title}}",
			},
		};
	});

	describe("formatEvents", () => {
		it("should not escape special characters like forward slashes", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "Meeting at Company A/B",
					startTime: new Date("2025-11-02T10:00:00+09:00"),
					endTime: new Date("2025-11-02T11:00:00+09:00"),
					isAllDay: false,
					description: "Discussion about A/B testing",
					location: "Room 1/2",
					attendees: ["user@example.com"],
				},
			];

			const result = service.formatEvents(events, mockSettings);

			expect(result).toContain("Company A/B");
			expect(result).not.toContain("&#x2F;");
			expect(result).not.toContain("&amp;");
		});

		it("should not escape HTML entities in event titles", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "Test & Review <Meeting>",
					startTime: new Date("2025-11-02T10:00:00+09:00"),
					endTime: new Date("2025-11-02T11:00:00+09:00"),
					isAllDay: false,
				},
			];

			const result = service.formatEvents(events, mockSettings);

			expect(result).toContain("Test & Review <Meeting>");
			expect(result).not.toContain("&amp;");
			expect(result).not.toContain("&lt;");
			expect(result).not.toContain("&gt;");
		});

		it("should format events with special characters in description", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "Meeting",
					startTime: new Date("2025-11-02T10:00:00+09:00"),
					endTime: new Date("2025-11-02T11:00:00+09:00"),
					isAllDay: false,
					description: "URL: https://example.com/path?param=value&other=test",
				},
			];

			mockSettings.templates.normalEvent = "- {{title}}: {{description}}";

			const result = service.formatEvents(events, mockSettings);

			expect(result).toContain("https://example.com/path?param=value&other=test");
			expect(result).not.toContain("&#x2F;");
			expect(result).not.toContain("&amp;");
		});

		it("should handle empty events array", () => {
			const result = service.formatEvents([], mockSettings);
			expect(result).toBe("");
		});

		it("should format normal events correctly", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "Test Event",
					startTime: new Date("2025-11-02T10:00:00+09:00"),
					endTime: new Date("2025-11-02T11:00:00+09:00"),
					isAllDay: false,
				},
			];

			const result = service.formatEvents(events, mockSettings);

			expect(result).toContain("10:00-11:00 Test Event");
		});

		it("should format all-day events correctly", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "All Day Event",
					startTime: new Date("2025-11-02T00:00:00+09:00"),
					endTime: new Date("2025-11-03T00:00:00+09:00"),
					isAllDay: true,
				},
			];

			const result = service.formatEvents(events, mockSettings);

			expect(result).toContain("All Day Event");
			expect(result).not.toContain("00:00");
		});
	});
});
