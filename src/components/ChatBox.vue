<template>
  <el-dialog v-model="dialogVisible">
    <div class="chat-box">
      <el-scrollbar class="messages">
        <div v-for="(group, index) in groupedMessages" :key="index" class="message-group">
          <div class="date-divider">{{ group.date }}</div>
          <div
              v-for="(message, index) in group.messages"
              :key="index"
              :class="['message-item', { 'my-message': message.ifSelf, 'other-message': !message.ifSelf }]"
          >
            <el-avatar :src="message.ifSelf ? userAvatar : remoteAvatar" class="message-avatar"></el-avatar>
            <div class="message-content">{{ message.message }}</div>
          </div>
        </div>
      </el-scrollbar>
      <div class="message-input">
        <el-input
            v-model="newMessage"
            placeholder="Type a message..."
            @keyup.enter="sendMessage"
        ></el-input>
        <el-button type="primary" @click="sendMessage">Send</el-button>
        <el-button type="primary" @click="startVideoCall">Call</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { getMessageInfo } from "@/api/chat";
import moment from "moment";
import userAvatar from '@/assets/avatar/1.jpg';
import remoteAvatar from '@/assets/avatar/2.jpg';
import eventBus from "@/eventbus/eventBus";
import videoChatEventEmitter, { VIDEO_CHAT_EVENTS } from "@/event/VideoChatEventEmitter";

export default {
	name: "ChatBox",
	props: {
		localId: {
			type: Number,
			required: true
		},
		remoteId: {
			type: Number,
			required: true
		},
		socket: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			messages: [],
			newMessage: "",
			dialogVisible: true,
			userAvatar: userAvatar,
			remoteAvatar: remoteAvatar,
		};
	},
	computed: {
		groupedMessages() {
			const grouped = this.messages.reduce((acc, message) => {
				const date = moment(message.timestamp).format("YYYY-MM-DD");
				if (!acc[date]) {
					acc[date] = [];
				}
				acc[date].push(message);
				return acc;
			}, {});
			return Object.keys(grouped).map(date => ({
				date,
				messages: grouped[date]
			}));
		}
	},
	mounted() {
		this.fetchMessages();
		this.socketInstance = this.socket;
		console.log(this.socketInstance);
		this.socketInstance.onmessage = (event) => {
			console.log(event);

			eventBus.emit('newMessage', {
				localId: this.localId,
				remoteId: this.remoteId,
				socket: this.socket
			});
			const data = JSON.parse(event.data);

			// 从解析后的对象中获取消息内容和ifSelf字段
			const message = data.message;
			// 构建 messageShow 对象
			const messageShow = {
				ifSelf: data.ifSelf!=="false",
				message: message,
				timestamp: new Date().toISOString(),
				type: "text"
			};

			// 将消息添加到 messages 数组
			this.messages.push(messageShow);
		};
		videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.END, () => {
			this.fetchMessages();
		});
		videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.REJECTED, () => {
			this.fetchMessages();
		});
		videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.SELF_END, () => {
			console.log("我是自己挂断的");
			this.fetchMessages();
		});
	},
	methods: {
		async fetchMessages() {
			try {
				console.log(this.localId);
				const response = await getMessageInfo(this.localId, this.remoteId);
				this.messages = response.object.map(msg => ({
					...msg,
					avatar: msg.ifSelf ? this.userAvatar : this.remoteAvatar
				}));
			} catch (error) {
				// ElMessage.error("Error fetching messages: " + error);
			}
		},
		async sendMessage() {
			if (this.newMessage.trim() !== "") {
				const message = {
					type: "chat",
					remoteId: this.remoteId,
					message: this.newMessage
				};
				this.newMessage = "";
				this.socketInstance.send(JSON.stringify(message));
			}
		},
		startVideoCall() {
			videoChatEventEmitter.emit(VIDEO_CHAT_EVENTS.START, this.remoteId);
		},
	}
};
</script>

<style scoped>
.chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 500px; /* Adjust the height as needed */
  height: 400px;
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
  overflow-wrap: break-word; /* Ensures words break properly */
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
  background-color: #dcf8c6; /* Default background color */
  max-width: calc(100% - 90px); /* Ensures the message content stays within the container */
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.my-message .message-content {
  background-color: #dcf8c6; /* User's message background color */
}

.other-message .message-content {
  background-color: #f0f0f0; /* Other user's message background color */
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
