if (navigator.mediaDevices === undefined) {
	navigator.mediaDevices = {};
}

// 检查是否存在 getUserMedia
if (!navigator.mediaDevices.getUserMedia) {
	navigator.mediaDevices.getUserMedia = function(params) {
		return new Promise((resolve, reject) => {
			const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

			if (!getUserMedia) {
				reject(new Error('getUserMedia is not implemented in this browser'));
			} else {
				getUserMedia.call(navigator, params, resolve, reject);
			}
		});
	};
}

class VideoChat {
	constructor(localVideo, remoteVideo, signalingServerUrl, userId) {
		this.localVideo = localVideo;
		this.remoteVideo = remoteVideo;
		this.signalingServerUrl = signalingServerUrl;
		this.userId = userId;
		this.rtcPeerConnection = null;
		this.ws = null;
	}

	start() {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true })
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
				this.ws = new WebSocket(url);

				this.ws.addEventListener('open', () => {
					console.log('Connected to the signaling server');
					this.ws.addEventListener('message', this.handleSignalingData);

					this.rtcPeerConnection.createOffer()
						.then(offer => {
							this.rtcPeerConnection.setLocalDescription(offer);
							// Send the offer to the signaling server
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
			// Send the ICE candidate to the signaling server
			this.ws.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
		}
	}

	handleRemoteStream(event) {
		this.remoteVideo.srcObject = event.streams[0];
	}

	handleSignalingData(data) {
		const parsedData = JSON.parse(data.data);

		if (parsedData.offer) {
			// Handle the offer from the other peer
			// Set the remote description and create an answer
			this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(parsedData.offer));
			this.rtcPeerConnection.createAnswer()
				.then(answer => this.rtcPeerConnection.setLocalDescription(answer))
				.then(() => {
					// Send the answer to the signaling server
					this.ws.send(JSON.stringify({ answer: this.rtcPeerConnection.localDescription }));
				});
		} else if (parsedData.answer) {
			// Handle the answer from the other peer
			this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(parsedData.answer));
		} else if (parsedData.iceCandidate) {
			// Handle ICE candidates from the other peer
			this.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(parsedData.iceCandidate));
		}
	}
}

export default VideoChat;