<template>
	<div class="rosa-chat-app">
		<div class="messages">
			<div v-for="(msg, idx) in messages" :key="idx" class="message">
				{{ msg }}
			</div>
		</div>
		<div class="input-row">
			<textarea
				class="input-box"
				v-model="input"
				placeholder="Type a message..."
				@keydown.enter.prevent="sendMessage"
			/>
			<button class="send-btn" @click="sendMessage">Send</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const messages = ref<string[]>([]);
const input = ref("");

function sendMessage() {
	const text = input.value.trim();
	if (!text) return;
	messages.value.push(`You: ${text}`);
	input.value = "";
	setTimeout(() => {
		messages.value.push(`Rosa: Echo - ${text}`);
	}, 500);
}
</script>

<style scoped>
.rosa-chat-app {
	display: flex;
	flex-direction: column;
	height: 100%;
}
.messages {
	flex: 1;
	overflow-y: auto;
	padding: 8px;
}
.message {
	margin-bottom: 4px;
}
.input-row {
	display: flex;
	padding: 8px;
}
.input-box {
	flex: 1;
	resize: none;
	padding: 6px;
}
.send-btn {
	margin-left: 8px;
}
</style>
