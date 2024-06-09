<script>
import Markdown from 'vue3-markdown-it';
import userAvatar from '@/assets/avatar/1.jpg';
import aiAvatar from '@/assets/avatar/AI.jpg';
import { chatWithAI } from '@/api/ai.js';
import STORAGE from "@/store";

export default {
	name: "AIChatDialog",
	components: {
		Markdown
	},
	data() {
		return {
			messages: [],
			inputMessage: "",

			userAvatar: userAvatar,
			aiAvatar: aiAvatar,

			visible: this.dialogVisible,
		};
	},
	props: {
		dialogVisible: {
			type: Boolean,
			required: true
		}
	},
	watch: {
		dialogVisible(newValue) {
			this.visible = newValue;
		},
		messages: {
			handler() {
				this.$nextTick(() => {
					this.scrollToBottom();
					// console.log("scroll", "scrolled");
				});
			},
			deep: true,
		},
	},
	mounted() {
		this.messages.push({
			ifSelf: false,
			message: "你好，我是复旦校园智能助手。请问你想了解哪些关于复旦的问题？",
		});
		// 清除历史聊天记录
		STORAGE.clearAIHistory();
	},
	methods: {
		getAIResponse(question) {
			// 支持多轮对话（同时发送历史聊天记录）
			chatWithAI(question, STORAGE.getAIHistory()).then((data) => {
				if (data.status === 200) {
					this.messages.push({
						ifSelf: false,
						message: data.data.answer,
					});
					// 存储历史聊天记录，用于多轮对话
					STORAGE.addAIHistoryMessage({
						"role": "user",
						"content": question
					});
					STORAGE.addAIHistoryMessage({
						"role": "assistant",
						"content": data.data.answer
					});
					console.log('接收到当前回答后的历史消息记录：', STORAGE.getAIHistory());
					// STORAGE.clearAIHistory();
				}
			}).catch((err) => {
				console.error(err);
			});
		},
		sendMessage() {
			console.log('发送消息前的历史消息记录：', STORAGE.getAIHistory());
			this.messages.push({
				ifSelf: true,
				message: this.inputMessage,
			});
			this.getAIResponse(this.inputMessage);
			this.inputMessage = "";
		},
		scrollToBottom() {
			const scroller = this.$refs.scroller;
			if (scroller) {
				scroller.scrollTop = scroller.scrollHeight;
				// console.log("scroll", "here");
				// TODO 
			}
		},
	}
};
</script>

<template>
  <el-dialog v-model="visible" @before-close="this.$emit('close')">
    <div class="chat-box">
      <el-scrollbar ref="scroller" class="messages">
        <div v-for="(message, index) in messages" :key="index"
             :class="['message-item', { 'my-message': message.ifSelf, 'ai-message': !message.ifSelf }]">
          <el-avatar :src="message.ifSelf ? userAvatar : aiAvatar" class="message-avatar"></el-avatar>
          <div class="message-content">
<!--            {{ message.message }}-->
            <Markdown :source="message.message" />
          </div>
        </div>
      </el-scrollbar>
      <div class="message-input">
        <el-input v-model="inputMessage" placeholder="Type a message..." @keyup.enter="sendMessage"></el-input>
        <el-button type="primary" @click="sendMessage">Send</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.chat-box {
	display: flex;
	flex-direction: column;
	/* height: 100%; */
	height: 400px;
	/* Adjust the height as needed */
}

.messages {
	flex-grow: 1;
	max-height: 80%;
	overflow-y: auto;
	padding: 10px;
	display: flex;
	flex-direction: column;
}

.message-group {
	margin-bottom: 20px;
}

.date-divider {
	text-align: center;
	margin: 10px 0;
	color: #999;
}

.message-item {
	display: flex;
	align-items: flex-start;
	margin-bottom: 10px;
	max-width: 70%;
	word-wrap: break-word;
	overflow-wrap: break-word;
	/* Ensures words break properly */
}

.my-message {
	margin-left: auto;
	flex-direction: row-reverse;
}

.other-message {
	margin-right: auto;
}

.message-content {
	padding: 10px 20px;
	border-radius: 20px;
	color: #333;
	font-size: 14px;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	/* background-color: #dcf8c6; */
	/* Default background color */
	max-width: calc(100% - 90px);
	/* Ensures the message content stays within the container */
	word-wrap: break-word;
	overflow-wrap: break-word;
}

.my-message .message-content {
	background-color: #dcf8c6;
	/* User's message background color */
}

.other-message .message-content {
	background-color: #f0f0f0;
	/* Other user's message background color */
}

.message-avatar {
	margin-right: 10px;
}

.my-message .message-avatar {
	margin-right: 0;
	margin-left: 10px;
}

.message-input {
	display: flex;
	padding: 10px;
	background: #f1f1f1;
}

.message-input .el-input {
	flex-grow: 1;
}

.message-input .el-button {
	margin-left: 10px;
}
</style>
