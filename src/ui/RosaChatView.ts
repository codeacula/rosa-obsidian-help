import { ItemView, WorkspaceLeaf } from "obsidian";

export const ROSA_CHAT_VIEW_TYPE = "rosa-chat-view";

export class RosaChatView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return ROSA_CHAT_VIEW_TYPE;
	}

	getDisplayText() {
		return "Rosa Chat";
	}

	getIcon() {
		return "message-circle";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Rosa Chat View" });
		// The Vue app will be mounted here later
	}

	async onClose() {
		// Any cleanup, like unmounting the Vue app, will go here
	}
}
