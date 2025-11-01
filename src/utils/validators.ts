import type { ServiceAccountKey } from "../types/calendar";

export function validateServiceAccountKey(
	jsonString: string,
): ServiceAccountKey | null {
	try {
		const key = JSON.parse(jsonString) as ServiceAccountKey;

		if (
			key.type === "service_account" &&
			key.project_id &&
			key.private_key &&
			key.client_email
		) {
			return key;
		}
		return null;
	} catch {
		return null;
	}
}

export function validateCalendarId(calendarId: string): boolean {
	if (!calendarId || calendarId.trim() === "") {
		return false;
	}

	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailPattern.test(calendarId);
}

export function validateTemplateS

yntax(template: string): boolean {
	if (!template || template.trim() === "") {
		return false;
	}

	const openBraces = (template.match(/{{/g) || []).length;
	const closeBraces = (template.match(/}}/g) || []).length;

	return openBraces === closeBraces;
}
