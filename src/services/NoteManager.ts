import { App, TFile, TFolder } from "obsidian";
import { NoteTemplate, RosaSettings } from "../types";

/**
 * Service for managing note creation, organization, and templating
 * Handles folder creation, template processing, and file naming conventions
 */
export class NoteManager {
	constructor(private app: App, private settings: RosaSettings) {}

	/**
	 * Create a new note from template with auto-folder creation
	 */
	async createNoteFromTemplate(
		templateName: string,
		fileName: string,
		folderPath: string,
		variables: Record<string, string> = {}
	): Promise<TFile | null> {
		try {
			// Ensure folder exists
			await this.ensureFolderExists(folderPath);

			// Load and process template
			const template = await this.loadTemplate(templateName);
			if (!template) {
				throw new Error(`Template ${templateName} not found`);
			}

			const processedContent = this.processTemplate(
				template.content,
				variables
			);
			const fullPath = `${folderPath}/${fileName}.md`;

			// Create the file
			return await this.app.vault.create(fullPath, processedContent);
		} catch (error) {
			console.error("Error creating note from template:", error);
			return null;
		}
	}

	/**
	 * Ensure folder exists, create if necessary
	 */
	async ensureFolderExists(folderPath: string): Promise<TFolder> {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);

		if (folder instanceof TFolder) {
			return folder;
		}

		// Create folder if it doesn't exist
		return await this.app.vault.createFolder(folderPath);
	}

	/**
	 * Generate filename with timestamp if enabled
	 */
	generateFileName(baseName: string, useTimestamp = true): string {
		if (!useTimestamp || !this.settings.useTimestamps) {
			return baseName;
		}

		const timestamp = new Date()
			.toISOString()
			.slice(0, 19)
			.replace(/[:.]/g, "-");
		return `${timestamp}-${baseName}`;
	}

	/**
	 * Load template from templates folder
	 */
	async loadTemplate(templateName: string): Promise<NoteTemplate | null> {
		const templatePath = `${this.settings.templatesFolder}/${templateName}.md`;
		const templateFile = this.app.vault.getAbstractFileByPath(templatePath);

		if (!(templateFile instanceof TFile)) {
			return null;
		}

		const content = await this.app.vault.read(templateFile);
		const variables = this.extractTemplateVariables(content);

		return {
			name: templateName,
			content,
			variables,
		};
	}

	/**
	 * Process template by replacing variables
	 */
	private processTemplate(
		template: string,
		variables: Record<string, string>
	): string {
		let processed = template;

		// Replace standard variables
		Object.entries(variables).forEach(([key, value]) => {
			const placeholder = `{{${key}}}`;
			processed = processed.replace(new RegExp(placeholder, "g"), value);
		});

		// Replace built-in variables
		processed = processed.replace(
			/{{date}}/g,
			new Date().toLocaleDateString()
		);
		processed = processed.replace(
			/{{time}}/g,
			new Date().toLocaleTimeString()
		);
		processed = processed.replace(
			/{{datetime}}/g,
			new Date().toLocaleString()
		);
		processed = processed.replace(
			/{{timestamp}}/g,
			new Date().toISOString()
		);

		return processed;
	}

	/**
	 * Extract template variables from content
	 */
	private extractTemplateVariables(content: string): string[] {
		const matches = content.match(/{{([^}]+)}}/g);
		if (!matches) return [];

		return matches
			.map((match) => match.slice(2, -2))
			.filter(
				(variable) =>
					!["date", "time", "datetime", "timestamp"].includes(
						variable
					)
			);
	}

	/**
	 * Auto-format note content according to processing rules
	 */
	async formatNote(file: TFile): Promise<void> {
		const content = await this.app.vault.read(file);
		const formatted = this.applyFormattingRules(content);

		if (formatted !== content) {
			await this.app.vault.modify(file, formatted);
		}
	}

	/**
	 * Apply formatting rules to content
	 */
	private applyFormattingRules(content: string): string {
		let formatted = content;

		// Standardize heading format
		formatted = formatted.replace(
			/^(\s*)#+\s*/gm,
			(match, spaces, hash) => {
				const level = match.trim().match(/#/g)?.length || 1;
				return spaces + "#".repeat(level) + " ";
			}
		);

		// Fix spacing around lists
		formatted = formatted.replace(/^(\s*[-*+]\s+)/gm, "$1");

		// Ensure blank line before headings
		formatted = formatted.replace(/\n(#+ )/g, "\n\n$1");

		return formatted;
	}
}
