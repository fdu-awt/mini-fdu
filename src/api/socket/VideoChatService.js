import getUserMedia from "@/utils/UserMedia";

class VideoChatService {
	constructor(localVideo, remoteVideo, signalingServerUrl, userId) {
		this.localVideo = localVideo;
		this.remoteVideo = remoteVideo;
		this.signalingServerUrl = signalingServerUrl;
		this.userId = userId;
		this.rtcPeerConnection = null;
		this.ws = null;

		this.handleIceCandidate = this.handleIceCandidate.bind(this);
		this.handleRemoteStream = this.handleRemoteStream.bind(this);
		this.handleSignalingData = this.handleSignalingData.bind(this);
	}

	start() {
		getUserMedia({ video: true, audio: true })
			.then(stream => {
				// 处理成功获取用户媒体流的逻辑
				if ('srcObject' in this.localVideo) {
					console.log('srcObject in localVideo');
					this.localVideo.srcObject = stream;
				} else {
					console.log('srcObject not in localVideo');
					this.localVideo.src = window.URL.createObjectURL(stream);
				}
				this.localVideo.play();

				this.rtcPeerConnection = new RTCPeerConnection();
				stream.getTracks().forEach(track => this.rtcPeerConnection.addTrack(track, stream));

				this.rtcPeerConnection.onicecandidate = this.handleIceCandidate;
				this.rtcPeerConnection.ontrack = this.handleRemoteStream;

				const url = `${this.signalingServerUrl}/${this.userId}`;
				// const url = 'ws://localhost:3000';
				this.ws = new WebSocket(url);

				this.ws.addEventListener('open', () => {
					console.log('Connected to the signaling server');
					this.ws.addEventListener('message', this.handleSignalingData);

					this.rtcPeerConnection.createOffer()
						.then(offer => {
							this.rtcPeerConnection.setLocalDescription(offer).then();
							// 发送 offer 给信令服务器
							this.ws.send(JSON.stringify({ offer: offer }));
						});
				});

				this.ws.addEventListener('close', () => {
					console.log('Disconnected from the signaling server');
				});

				this.ws.addEventListener('error', (err) => {
					console.error(err.name + ': ' + err.message);
				});
			})
			.catch((err) => {
				console.error(err.name + ': ' + err.message);
			});
	}

	handleIceCandidate(event) {
		if (event.candidate) {
			// 发送 ICE candidate 给信令服务器
			this.ws.send(JSON.stringify({ iceCandidate: event.candidate }));
		}
	}

	handleRemoteStream(event) {
		this.remoteVideo.srcObject = event.streams[0];
	}

	handleSignalingData(event) {
		try {
			const parsedData = JSON.parse(event.data);

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
						this.ws.send(JSON.stringify({ answer: this.rtcPeerConnection.localDescription }));
					})
					.catch(error => {
						console.error('Failed to handle offer: ', error);
					});
			} else if (parsedData.answer) {
				// 处理来自另一端的 answer
				this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(parsedData.answer))
					.catch(error => {
						console.error('Failed to handle answer: ', error);
					});
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
}

export default VideoChatService;
