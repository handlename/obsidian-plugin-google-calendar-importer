import { type Editor, MarkdownView, type MarkdownFileInfo } from "obsidian";
import type { EventImportService } from "../../application/services/EventImportService";
import type { GoogleCalendarImporterSettings } from "../../types/settings";
import type { NotificationService } from "../notices/NotificationService";
import { AppError, ErrorCode } from "../../application/errors/AppError";
import { Logger } from "../../utils/logger";

export class ImportEventsCommand {
	private logger: Logger;

	constructor(
		private eventImportService: EventImportService,
		private notificationService: NotificationService,
	) {
		this.logger = new Logger("ImportEventsCommand");
	}

	async execute(
		editor: Editor,
		view: MarkdownView,
		settings: GoogleCalendarImporterSettings,
	): Promise<void> {
		try {
			const file = view.file;
			if (!file) {
				throw AppError.fromCode(ErrorCode.NO_ACTIVE_FILE);
			}

			this.notificationService.showImportStart();

			const eventCount = await this.eventImportService.importEvents(
				editor,
				file,
				settings,
			);

			if (eventCount === 0) {
				this.notificationService.showWarning("イベントが見つかりませんでした");
			} else {
				this.notificationService.showImportSuccess(eventCount);
			}

			editor.focus();
		} catch (error) {
			this.logger.error("Command execution failed", error as Error);

			if (error instanceof AppError) {
				this.notificationService.showErrorFromCode(error.code);
			} else {
				this.notificationService.showError(
					"予期しないエラーが発生しました",
				);
			}
		}
	}

	getCommandDefinition(settings: GoogleCalendarImporterSettings) {
		return {
			id: "import-google-calendar-events",
			name: "Import Google Calendar events",
			editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
				if (ctx instanceof MarkdownView) {
					this.execute(editor, ctx, settings);
				}
			},
		};
	}
}
