import getUserMedia from "@/utils/UserMedia";
import {ElMessageBox} from "element-plus";

class VideoChatService {
	constructor(localVideo, remoteVideo, signalingServerUrl, userId) {
		this.localVideo = localVideo;
		this.remoteVideo = remoteVideo;
		this.signalingServerUrl = signalingServerUrl;
		this.userId = userId;
		this.rtcPeerConnection = null;
		this.ws = null;
		this.localStream = null;

		this.peerId = null;
		this.inChat = false;

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
	 * @description 开始视频聊天
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
					console.error(err.name + ': ' + err.message);
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

	/**
	 * @description 邀请对方进行视频聊天
	 * */
	invite(toId){
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

	hangup() {
		return this.endChat().then(() => {
			this.ws.send(JSON.stringify({
				type: 'video-end',
				toId: this.peerId,
			}));
		});
	}

	endChat(){
		return this.closeRtc()
			.then(() => {
				return this.closeLocalVideo();
			})
			.then(() => {
				this.peerId = null;
				this.inChat = false;
			});
	}

	/**
	 * @description 接受对方的视频聊天邀请
	 * */
	accept(toId){
		this.startLocalVideo()
			.then(() => {
				// 开启 WebRTC 连接
				return this.startRtc(toId);
			})
			.then(() => {
				// 发送 accept 给信令服务器
				this.ws.send(JSON.stringify({
					type: 'video-accept',
					toId: toId,
				}));
				this.peerId = toId;
				this.inChat = true;
			})
			.catch((err) => {
				console.error(err.name + ': ' + err.message);
				// todo 通知用户
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
			const onAccept = () => {
				this.accept(fromId);
			};
			const onReject = () => {
				this.reject(fromId);
			};
			// TODO 加入用户名的显示
			ElMessageBox.confirm('收到视频聊天邀请，是否接受？', '视频聊天邀请', {
				confirmButtonText: '接受',
				cancelButtonText: '拒绝',
				type: 'warning',
			}).then(onAccept).catch(onReject);
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
		} else {
			this.inChat = true;
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
		ElMessageBox.alert(msg, '提示', {
			confirmButtonText: '确定',
			type: 'warning',
		}).then(this.endChat.bind(this)).catch(this.endChat.bind(this));
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
		this.endChat().then();
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

export default VideoChatService;
