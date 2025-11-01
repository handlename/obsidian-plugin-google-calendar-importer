import "obsidian";

declare module "obsidian" {
	interface App {
		plugins: {
			enabledPlugins: Set<string>;
			plugins: {
				"daily-notes"?: {
					options: {
						format: string;
						folder: string;
					};
				};
			};
		};
	}
}
