import getUserMedia from "@/utils/UserMedia";
import videoChatEventEmitter, { VIDEO_CHAT_EVENTS } from "@/event/VideoChatEventEmitter";
import store from "@/store";

class VideoChatService {
	constructor() {
		this.localVideo = null;
		this.remoteVideo = null;

		this.signalingServerUrl = process.env.VUE_APP_VIDEO_CHAT_WEBSOCKET_BASE_URL;
		this.userId = store.getUserId();
		this.rtcPeerConnection = null;
		this.ws = null;
		this.localStream = null;

		this.peerId = null;

		this.messageHandlers = {
			'video-invite': this.handleInvite.bind(this),
			'video-accept': this.handleAccept.bind(this),
			'video-reject': this.handleReject.bind(this),
			'video-processing': this.handleProcessing.bind(this),
			'video-end': this.handleEnd.bind(this),
		};

		this.onMessage = this.onMessage.bind(this);
		this.handleIceCandidate = this.handleIceCandidate.bind(this);
		this.handleRemoteStream = this.handleRemoteStream.bind(this);

		this.webSocketInit();
	}

	webSocketInit(){
		const url = `${this.signalingServerUrl}/${this.userId}`;
		// const url = 'ws://localhost:3000';
		this.ws = new WebSocket(url);

		this.ws.addEventListener('open', () => {
			console.log('Connected to the signaling server');
			this.ws.addEventListener('message', this.onMessage);
		});

		this.ws.addEventListener('close', () => {
			console.log('Disconnected from the signaling server');
		});

		this.ws.addEventListener('error', (err) => {
			console.error(err.name + ': ' + err.message);
		});
	}

	/**
	 * @description 邀请对方进行视频聊天
	 * */
	invite(toId, localVideo, remoteVideo){
		if (this.peerId) {
			console.error('Already in a video chat');
			return;
		}
		if (!toId) {
			console.error('toId is not provided');
			return;
		}
		if (!localVideo) {
			console.error('localVideo is not provided');
			return;
		}
		if (!remoteVideo) {
			console.error('remoteVideo is not provided');
			return;
		}
		this.localVideo = localVideo;
		this.remoteVideo = remoteVideo;
		this.startLocalVideo()
			.then(() => {
				return this.startRtc(toId);
			}).then(() => {
				this.ws.send(JSON.stringify({
					type: 'video-invite',
					toId: toId,
				}));
				this.peerId = toId;
			})
			.catch((err) => {
				console.error(err.name + ': ' + err.message);
				// todo 通知用户
			});
	}

	/**
	 * 处理 自己 结束视频聊天
	 * */
	hangup() {
		this.ws.send(JSON.stringify({
			type: 'video-end',
			toId: this.peerId,
		}));
		return this.endChat().then(() => {
			videoChatEventEmitter.emit(VIDEO_CHAT_EVENTS.END);
		});
	}
	
	/**
	 * @description 开启本地视频
	 * @return Promise
	 * */
	startLocalVideo(){
		return new Promise((resolve, reject) => {
			getUserMedia({ video: true, audio: true })
				.then(stream => {
					this.localStream = stream;
					// 处理成功获取用户媒体流的逻辑
					if ('srcObject' in this.localVideo) {
						console.log('srcObject in localVideo');
						this.localVideo.srcObject = stream;
					} else {
						console.warn('srcObject not in localVideo');
						this.localVideo.src = window.URL.createObjectURL(stream);
					}
					this.localVideo.play();
					resolve();
				})
				.catch((err) => {
					reject(err);
				});
		});
	}

	closeLocalVideo() {
		return new Promise((resolve, reject) => {
			try {
				if (this.localStream) {
					console.log('closeLocalVideo');
					this.localStream.getTracks().forEach(track => {
						track.stop();
					});
					this.localStream = null;
				}
				if (this.localVideo) {
					console.log('closeLocalVideo');
					this.localVideo.srcObject = null;
				}
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * @description 开始WecRTC连接
	 * @param peerId 对方的用户ID
	 * */
	startRtc(peerId) {
		return new Promise((resolve, reject) => {
			this.rtcPeerConnection = new RTCPeerConnection();
			this.localStream.getTracks().forEach(track => this.rtcPeerConnection.addTrack(track, this.localStream));

			this.rtcPeerConnection.onicecandidate = (event) => {
				this.handleIceCandidate(peerId, event);
			};
			this.rtcPeerConnection.ontrack = this.handleRemoteStream;

			this.rtcPeerConnection.createOffer()
				.then(offer => {
					return this.rtcPeerConnection.setLocalDescription(offer);
				})
				.then(() => {
					// 发送 offer 给信令服务器
					this.processing(peerId, { offer: this.rtcPeerConnection.localDescription });
					resolve(); // 操作成功时调用 resolve
				})
				.catch(error => {
					reject(error); // 发生错误时调用 reject
				});
		});
	}

	closeRtc() {
		return new Promise((resolve, reject) => {
			try {
				if (this.rtcPeerConnection) {
					this.rtcPeerConnection.close();
					this.rtcPeerConnection = null;
				}
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	endChat(){
		return this.closeRtc()
			.then(() => {
				return this.closeLocalVideo();
			});
	}

	/**
	 * @description 接受对方的视频聊天邀请
	 * */
	accept(toId, localVideo, remoteVideo){
		if (!toId) {
			console.error('Already in a video chat');
			return;
		}
		if (!localVideo) {
			console.error('localVideo is not provided');
			return;
		}
		if (!remoteVideo) {
			console.error('remoteVideo is not provided');
			return;
		}
		// 发送 accept 给信令服务器
		this.ws.send(JSON.stringify({
			type: 'video-accept',
			toId: toId,
		}));
		this.peerId = toId;
		this.startLocalVideo()
			.then(() => {
				// 开启 WebRTC 连接
				return this.startRtc(toId);
			})
			.catch((err) => {
				console.error(err.name + ': ' + err.message);
			});
	}

	/**
	 * @description 拒绝对方的视频聊天邀请
	 * */
	reject(toId){
		this.ws.send(JSON.stringify({
			type: 'video-reject',
			toId: toId,
		}));
		videoChatEventEmitter.emit(VIDEO_CHAT_EVENTS.REJECTED);
	}

	processing(toId, forwardData){
		const msg = JSON.stringify({
			type: 'video-processing',
			toId: toId,
			forwardData: forwardData,
		});
		this.ws.send(msg);
	}

	/**
	 * 处理来自他人的视频聊天邀请
	 * */
	handleInvite(data){
		const fromId = data.fromId;
		if (fromId) {
			videoChatEventEmitter.emit(VIDEO_CHAT_EVENTS.INVITE, fromId);
		} else {
			console.error('fromId is not provided');
		}
	}

	/**
	 * @description 对方接受了视频聊天，我方进行处理
	 * */
	handleAccept(data) {
		const fromId = data.fromId;
		if (!fromId) {
			console.error('fromId is not provided');
		}
	}

	/**
	 * @description 对方拒绝了视频聊天邀请
	 * */
	handleReject(data) {
		console.log('对方拒绝了视频聊天邀请' + data.fromId);
		const reason = data.reason;
		let msg= '对方拒绝了视频聊天邀请';
		if(reason === 'busy'){
			msg = '对方正忙，请稍后再试';
		} else if(reason === 'offline'){
			msg = '对方不在线';
		}
		this.endChat().then(() => {
			videoChatEventEmitter.emit(VIDEO_CHAT_EVENTS.REJECTED, msg);
		}).catch((error) => {
			console.error(error);
			videoChatEventEmitter.emit(VIDEO_CHAT_EVENTS.REJECTED, msg);
		});
	}

	handleProcessing(data) {
		try {
			console.log('handleProcessing' + " fromId:" + data.fromId + " toId:" + data.toId);
			const parsedData = data.forwardData;
			const fromId = data.fromId;
			if (fromId === null || fromId === undefined) {
				console.error('fromId is not provided');
				return;
			}
			if (fromId === this.userId){
				return;
			}
			if (parsedData.offer) {
				// 处理来自另一端的 offer
				this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(parsedData.offer))
					.then(() => {
						return this.rtcPeerConnection.createAnswer();
					})
					.then(answer => {
						return this.rtcPeerConnection.setLocalDescription(answer);
					})
					.then(() => {
						// 发送 answer 给信令服务器
						this.processing(fromId, { answer: this.rtcPeerConnection.localDescription });
					})
					.catch(error => {
						console.error('Failed to handle offer: ', error);
					});
			} else if (parsedData.answer) {
				// 检查信令状态是否为 have-local-offer
				if (this.rtcPeerConnection.signalingState === 'have-local-offer') {
					// 处理来自另一端的 answer
					this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(parsedData.answer))
						.catch(error => {
							console.error('Failed to handle answer: ', error);
						});
				} else {
					console.error('Invalid signaling state for setting remote answer: ', this.rtcPeerConnection.signalingState);
				}
			} else if (parsedData.iceCandidate) {
				// 处理来自另一端的 ICE candidates
				this.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(parsedData.iceCandidate))
					.catch(error => {
						console.error('Failed to add ICE Candidate: ', error);
					});
			}
		} catch (error) {
			console.error('Failed to parse signaling data: ', error);
		}
	}

	/**
	 * @description 对方结束了视频聊天
	 * */
	handleEnd(data) {
		console.log('对方结束了视频聊天' + data.fromId);
		this.endChat().then(() => {
			videoChatEventEmitter.emit(VIDEO_CHAT_EVENTS.END);
		}).catch((error) => {
			console.error(error);
			videoChatEventEmitter.emit(VIDEO_CHAT_EVENTS.END);
		});
	}

	handleIceCandidate(toId, event) {
		if (event.candidate) {
			// 发送 ICE candidate 给信令服务器
			this.processing(toId,{ iceCandidate: event.candidate });
		}
	}

	handleRemoteStream(event) {
		this.remoteVideo.srcObject = event.streams[0];
	}

	onMessage(event) {
		const data = JSON.parse(event.data);
		const type = data.type;
		const handler = this.messageHandlers[type];
		if (handler) {
			handler(data);
		}
	}
}

export default new VideoChatService();
