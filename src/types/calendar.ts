export interface CalendarEvent {
	id: string;
	title: string;
	description?: string;
	location?: string;
	startTime: Date;
	endTime: Date;
	isAllDay: boolean;
	attendees?: string[];
	htmlLink?: string;
}

export interface ServiceAccountKey {
	type: "service_account";
	project_id: string;
	private_key_id: string;
	private_key: string;
	client_email: string;
	client_id: string;
	auth_uri: string;
	token_uri: string;
	auth_provider_x509_cert_url: string;
	client_x509_cert_url: string;
}
