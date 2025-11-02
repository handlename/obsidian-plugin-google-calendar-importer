import type { App, TFile } from "obsidian";
import { beforeEach, describe, expect, it } from "vitest";
import { ErrorCode } from "../errors/AppError";
import { DateExtractorService } from "./DateExtractorService";

describe("DateExtractorService", () => {
	let service: DateExtractorService;
	let mockApp: App;

	beforeEach(() => {
		mockApp = {
			plugins: {
				plugins: {},
			},
		} as unknown as App;
	});

	function assertDateEquals(actual: Date, year: number, month: number, day: number) {
		expect(actual.getFullYear()).toBe(year);
		expect(actual.getMonth() + 1).toBe(month); // Convert 0-indexed to 1-indexed
		expect(actual.getDate()).toBe(day);
	}

	describe("extractDateFromFile", () => {
		describe("with custom dailyNotePathFormat", () => {
			it("should extract date from simple YYYY-MM-DD format", () => {
				service = new DateExtractorService(mockApp, "YYYY-MM-DD");
				const mockFile = {
					path: "2025-10-28.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});

			it("should extract date from YYYY/MM/YYYY-MM-DD format", () => {
				service = new DateExtractorService(mockApp, "YYYY/MM/YYYY-MM-DD");
				const mockFile = {
					path: "2025/10/2025-10-28.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});

			it("should extract date from YYYY/MM/YYYYMMDD format", () => {
				service = new DateExtractorService(mockApp, "YYYY/MM/YYYYMMDD");
				const mockFile = {
					path: "2025/10/20251028.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});

			it("should extract date from YYYY/MM/YYYY-MM-DD format with different month", () => {
				service = new DateExtractorService(mockApp, "YYYY/MM/YYYY-MM-DD");
				const mockFile = {
					path: "2025/11/2025-11-15.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 11, 15);
			});

			it("should extract date from YYYY/MM/DD format", () => {
				service = new DateExtractorService(mockApp, "YYYY/MM/DD");
				const mockFile = {
					path: "2025/10/28.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});

			it("should extract date from YYYY/M/D format with single digit month and day", () => {
				service = new DateExtractorService(mockApp, "YYYY/M/D");
				const mockFile = {
					path: "2025/3/5.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 3, 5);
			});

			it("should extract date from YYYYMMDD format (no separators)", () => {
				service = new DateExtractorService(mockApp, "YYYYMMDD");
				const mockFile = {
					path: "20251028.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});

			it("should extract date from YYYY.MM.DD format (dot separator)", () => {
				service = new DateExtractorService(mockApp, "YYYY.MM.DD");
				const mockFile = {
					path: "2025.10.28.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});

			it("should extract date from YYYY/YYYYMMDD format", () => {
				service = new DateExtractorService(mockApp, "YYYY/YYYYMMDD");
				const mockFile = {
					path: "2025/20251028.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});

			it("should extract date from DD-MM-YYYY format", () => {
				service = new DateExtractorService(mockApp, "DD-MM-YYYY");
				const mockFile = {
					path: "28-10-2025.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});

			it("should extract date from YYYY/MM/DD-YYYY-MM-DD format", () => {
				service = new DateExtractorService(mockApp, "YYYY/MM/DD-YYYY-MM-DD");
				const mockFile = {
					path: "2025/10/28-2025-10-28.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});

			it("should extract date from M/D/YYYY format with single digits", () => {
				service = new DateExtractorService(mockApp, "M/D/YYYY");
				const mockFile = {
					path: "3/5/2025.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 3, 5);
			});

			it("should extract date from YYYY-MM/DD format (mixed separators)", () => {
				service = new DateExtractorService(mockApp, "YYYY-MM/DD");
				const mockFile = {
					path: "2025-10/28.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});

			it("should handle paths without .md extension", () => {
				service = new DateExtractorService(mockApp, "YYYY-MM-DD");
				const mockFile = {
					path: "2025-10-28",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});
		});

		describe("with Daily Notes plugin format", () => {
			it("should use Daily Notes plugin format when available", () => {
				mockApp.plugins.plugins["daily-notes"] = {
					options: {
						format: "YYYY-MM-DD",
						folder: "",
					},
				};
				service = new DateExtractorService(mockApp);
				const mockFile = {
					path: "2025-10-28.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});

			it("should use default format when Daily Notes plugin format is not set", () => {
				mockApp.plugins.plugins["daily-notes"] = {
					options: {
						format: "",
						folder: "",
					},
				};
				service = new DateExtractorService(mockApp);
				const mockFile = {
					path: "2025-10-28.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});
		});

		describe("without Daily Notes plugin", () => {
			it("should use default YYYY-MM-DD format", () => {
				service = new DateExtractorService(mockApp);
				const mockFile = {
					path: "2025-10-28.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 10, 28);
			});
		});

		describe("error handling", () => {
			it("should throw AppError when path does not match format", () => {
				service = new DateExtractorService(mockApp, "YYYY-MM-DD");
				const mockFile = {
					path: "invalid-path.md",
				} as TFile;

				expect(() => service.extractDateFromFile(mockFile)).toThrow();
			});

			it("should throw AppError with INVALID_DATE_FORMAT code", () => {
				service = new DateExtractorService(mockApp, "YYYY-MM-DD");
				const mockFile = {
					path: "invalid-path.md",
				} as TFile;

				try {
					service.extractDateFromFile(mockFile);
					expect.fail("Should have thrown an error");
				} catch (error: unknown) {
					expect((error as { code: string }).code).toBe(ErrorCode.INVALID_DATE_FORMAT);
				}
			});

			it("should throw AppError when date is invalid (invalid month)", () => {
				service = new DateExtractorService(mockApp, "YYYY-MM-DD");
				const mockFile = {
					path: "2025-13-15.md", // Invalid month
				} as TFile;

				expect(() => service.extractDateFromFile(mockFile)).toThrow();
			});

			it("should throw AppError when date is invalid (Feb 30)", () => {
				service = new DateExtractorService(mockApp, "YYYY-MM-DD");
				const mockFile = {
					path: "2025-02-30.md", // Feb doesn't have 30 days
				} as TFile;

				expect(() => service.extractDateFromFile(mockFile)).toThrow();
			});
		});

		describe("edge cases", () => {
			it("should handle leap year dates", () => {
				service = new DateExtractorService(mockApp, "YYYY-MM-DD");
				const mockFile = {
					path: "2024-02-29.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2024, 2, 29);
			});

			it("should reject invalid leap year date", () => {
				service = new DateExtractorService(mockApp, "YYYY-MM-DD");
				const mockFile = {
					path: "2025-02-29.md", // 2025 is not a leap year
				} as TFile;

				expect(() => service.extractDateFromFile(mockFile)).toThrow();
			});

			it("should handle year boundaries", () => {
				service = new DateExtractorService(mockApp, "YYYY-MM-DD");
				const mockFile = {
					path: "2025-01-01.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 1, 1);
			});

			it("should handle end of year", () => {
				service = new DateExtractorService(mockApp, "YYYY-MM-DD");
				const mockFile = {
					path: "2025-12-31.md",
				} as TFile;

				const result = service.extractDateFromFile(mockFile);

				assertDateEquals(result, 2025, 12, 31);
			});
		});
	});
});
