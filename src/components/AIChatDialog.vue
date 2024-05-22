<template>
  <el-dialog v-model="visible" @before-close="this.$emit('close')">
    <div class="chat-box">
      <!-- <el-scrollbar class="messages">
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
        ></el-input>
        <el-button type="primary" @click="sendMessage">Send</el-button>
        <el-button icon="el-icon-phone" @click="startVideoCall"></el-button>
      </div> -->
		Hello world
    </div>
  </el-dialog>
</template>

<script>

export default {
	name: "AIChatDialog",
	data() {
		return {
			messages: [],
			newMessage: "",
			groupedMessages:[],

			visible: this.dialogVisible,
		};
	},
	props:{
		dialogVisible:{
			type: Boolean,
			required: true
		}
	},
	watch:{
		dialogVisible(newValue, old) {
			console.log(newValue);
			console.log(old);
			this.visible = newValue;
		}
	}
};
</script>

<style scoped>
.chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 50vw;
  max-height: 500px; /* Adjust the height as needed */
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
