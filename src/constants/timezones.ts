/**
 * Common IANA timezone identifiers
 * This list includes the most commonly used timezones worldwide
 */
export const COMMON_TIMEZONES = [
	"UTC",
	"Africa/Cairo",
	"Africa/Johannesburg",
	"Africa/Lagos",
	"Africa/Nairobi",
	"America/Anchorage",
	"America/Argentina/Buenos_Aires",
	"America/Chicago",
	"America/Denver",
	"America/Los_Angeles",
	"America/Mexico_City",
	"America/New_York",
	"America/Phoenix",
	"America/Santiago",
	"America/Sao_Paulo",
	"America/Toronto",
	"America/Vancouver",
	"Asia/Bangkok",
	"Asia/Dhaka",
	"Asia/Dubai",
	"Asia/Hong_Kong",
	"Asia/Jakarta",
	"Asia/Karachi",
	"Asia/Kolkata",
	"Asia/Manila",
	"Asia/Seoul",
	"Asia/Shanghai",
	"Asia/Singapore",
	"Asia/Taipei",
	"Asia/Tokyo",
	"Australia/Brisbane",
	"Australia/Melbourne",
	"Australia/Perth",
	"Australia/Sydney",
	"Europe/Amsterdam",
	"Europe/Athens",
	"Europe/Berlin",
	"Europe/Brussels",
	"Europe/Istanbul",
	"Europe/London",
	"Europe/Madrid",
	"Europe/Moscow",
	"Europe/Paris",
	"Europe/Rome",
	"Europe/Stockholm",
	"Europe/Vienna",
	"Europe/Warsaw",
	"Europe/Zurich",
	"Pacific/Auckland",
	"Pacific/Honolulu",
] as const;

/**
 * Get the user's system timezone
 */
export function getSystemTimezone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Check if a timezone string is valid
 */
export function isValidTimezone(timezone: string): boolean {
	try {
		Intl.DateTimeFormat(undefined, { timeZone: timezone });
		return true;
	} catch {
		return false;
	}
}
