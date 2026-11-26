// Zero-Backend WebRTC P2P Engine (PeerJS DataChannel + Real-Time Voice Chat)

const ROOM_PREFIX = 'duoverse-room-';

export class PeerEngine {
  constructor(callbacks = {}) {
    this.cb = callbacks;
    this.peer = null;
    this.conn = null;
    this.call = null;
    this.localStream = null;
    this.remoteAudio = null;
    this.roomCode = null;
    this.role = 'solo'; // 'host' | 'guest' | 'solo'
    this.myName = 'Player';
    this.partnerName = 'Partner';
    this.isMuted = false;
    this.voiceActive = false;
    this.pingInterval = null;
    this.audioCtx = null;
    this.analyser = null;
    this.meterRaf = null;
  }

  generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  _ensurePeerLib() {
    if (typeof window.Peer === 'undefined') {
      throw new Error('PeerJS library failed to load. Check internet connection.');
    }
  }

  destroy() {
    this.stopVoice(false);
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.conn) {
      try { this.conn.close(); } catch (_) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (_) {}
      this.peer = null;
    }
    this.role = 'solo';
    this.roomCode = null;
  }

  createRoom(nickname) {
    this._ensurePeerLib();
    this.destroy();
    this.myName = nickname || 'Host';
    this.role = 'host';
    this.roomCode = this.generateCode();
    const peerId = ROOM_PREFIX + this.roomCode;

    this.cb.onStatus?.('connecting', `Creating room ${this.roomCode}...`);

    this.peer = new window.Peer(peerId, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    this.peer.on('open', () => {
      this.cb.onRoomReady?.(this.roomCode, 'host');
      this.cb.onStatus?.('waiting', `Room ${this.roomCode} ready — waiting for partner`);
    });

    this.peer.on('connection', (conn) => {
      if (this.conn && this.conn.open) {
        conn.on('open', () => {
          conn.send({ type: 'room_full' });
          setTimeout(() => conn.close(), 200);
        });
        return;
      }
      this._bindConnection(conn);
    });

    this.peer.on('call', (incomingCall) => {
      this._handleIncomingCall(incomingCall);
    });

    this.peer.on('error', (err) => {
      this.cb.onError?.(err.message || 'Connection error');
    });
  }

  joinRoom(code, nickname) {
    this._ensurePeerLib();
    this.destroy();
    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanCode.length < 4) {
      this.cb.onError?.('Valid 6-character room code enter karo.');
      return;
    }

    this.myName = nickname || 'Guest';
    this.role = 'guest';
    this.roomCode = cleanCode;
    const hostPeerId = ROOM_PREFIX + cleanCode;

    this.cb.onStatus?.('connecting', `Joining room ${cleanCode}...`);

    this.peer = new window.Peer(undefined, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    this.peer.on('open', () => {
      this.cb.onRoomReady?.(this.roomCode, 'guest');
      const conn = this.peer.connect(hostPeerId, {
        reliable: true,
        metadata: { name: this.myName }
      });
      this._bindConnection(conn);
    });

    this.peer.on('call', (incomingCall) => {
      this._handleIncomingCall(incomingCall);
    });

    this.peer.on('error', (err) => {
      let msg = err.message || 'Room join failed';
      if (err.type === 'peer-unavailable') {
        msg = `Room "${cleanCode}" nahi mila. Check code ya host ko room open rakhne bolo.`;
      }
      this.cb.onError?.(msg);
      this.cb.onStatus?.('solo', 'Solo Mode');
    });
  }

  _bindConnection(conn) {
    this.conn = conn;

    conn.on('open', () => {
      this.send({ type: 'hello', name: this.myName, role: this.role });
      this.cb.onStatus?.('connected', 'Connected P2P');
      this._startPing();
    });

    conn.on('data', (data) => {
      if (!data || typeof data !== 'object') return;
      if (data.type === 'room_full') {
        this.cb.onError?.('Ye room already full hai (2 players max).');
        this.destroy();
        return;
      }
      if (data.type === 'hello') {
        this.partnerName = data.name || 'Partner';
        this.cb.onPartnerConnected?.(this.partnerName);
        return;
      }
      if (data.type === 'ping') {
        this.send({ type: 'pong', ts: data.ts });
        return;
      }
      if (data.type === 'pong') {
        const rtt = Math.max(1, Date.now() - data.ts);
        this.cb.onLatency?.(rtt);
        return;
      }
      if (data.type === 'voice_ended') {
        this.stopVoice(false);
        this.cb.onVoiceState?.(false, this.isMuted, 'Partner left voice chat');
        return;
      }
      this.cb.onMessage?.(data);
    });

    conn.on('close', () => {
      this.stopVoice(false);
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
      this.conn = null;
      this.cb.onPartnerDisconnected?.(this.partnerName);
      this.cb.onStatus?.(this.role === 'host' ? 'waiting' : 'solo',
        this.role === 'host' ? `Room ${this.roomCode} — waiting for partner` : 'Disconnected');
    });

    conn.on('error', (err) => {
      this.cb.onError?.(err.message || 'Data channel error');
    });
  }

  _startPing() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping', ts: Date.now() });
      }
    }, 4000);
  }

  isConnected() {
    return Boolean(this.conn && this.conn.open);
  }

  send(payload) {
    if (this.conn && this.conn.open) {
      this.conn.send(payload);
      return true;
    }
    return false;
  }

  // === WEBRTC VOICE CHAT ===
  async startVoice() {
    if (!this.isConnected() || !this.peer) {
      this.cb.onError?.('Voice chat ke liye pehle 2nd player ko room me connect karo.');
      return false;
    }
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      this.isMuted = false;
      this.voiceActive = true;
      this._startMicMeter(this.localStream);

      const remotePeerId = this.conn.peer;
      const call = this.peer.call(remotePeerId, this.localStream);
      this._bindCall(call);
      this.cb.onVoiceState?.(true, false, 'Voice connected');
      return true;
    } catch (err) {
      this.cb.onError?.('Microphone permission denied ya mic unavailable.');
      return false;
    }
  }

  async _handleIncomingCall(incomingCall) {
    try {
      if (!this.localStream) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });
      }
      this.isMuted = false;
      this.voiceActive = true;
      this._startMicMeter(this.localStream);
      incomingCall.answer(this.localStream);
      this._bindCall(incomingCall);
      this.cb.onVoiceState?.(true, false, 'Partner joined voice chat');
    } catch (_) {
      // Answer listen-only if user denies mic
      incomingCall.answer();
      this.voiceActive = true;
      this.isMuted = true;
      this._bindCall(incomingCall);
      this.cb.onVoiceState?.(true, true, 'Voice active (listen-only — mic blocked)');
    }
  }

  _bindCall(call) {
    if (this.call && this.call !== call) {
      try { this.call.close(); } catch (_) {}
    }
    this.call = call;

    call.on('stream', (remoteStream) => {
      if (!this.remoteAudio) {
        this.remoteAudio = document.createElement('audio');
        this.remoteAudio.autoplay = true;
        this.remoteAudio.playsInline = true;
        document.body.appendChild(this.remoteAudio);
      }
      this.remoteAudio.srcObject = remoteStream;
      this.remoteAudio.play().catch(() => {});
    });

    call.on('close', () => {
      this.stopVoice(false);
    });
  }

  toggleMute() {
    if (!this.localStream) return this.isMuted;
    this.isMuted = !this.isMuted;
    this.localStream.getAudioTracks().forEach((t) => {
      t.enabled = !this.isMuted;
    });
    this.cb.onVoiceState?.(this.voiceActive, this.isMuted);
    return this.isMuted;
  }

  setPartnerVolume(val) {
    if (this.remoteAudio) {
      this.remoteAudio.volume = Math.min(1, Math.max(0, Number(val)));
    }
  }

  stopVoice(notifyPeer = true) {
    if (notifyPeer && this.isConnected()) {
      this.send({ type: 'voice_ended' });
    }
    if (this.meterRaf) {
      cancelAnimationFrame(this.meterRaf);
      this.meterRaf = null;
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch (_) {}
      this.audioCtx = null;
    }
    if (this.call) {
      try { this.call.close(); } catch (_) {}
      this.call = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.remoteAudio) {
      this.remoteAudio.srcObject = null;
    }
    this.voiceActive = false;
    this.isMuted = false;
    this.cb.onMicLevel?.(0);
    this.cb.onVoiceState?.(false, false);
  }

  _startMicMeter(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);
      const data = new Uint8Array(this.analyser.frequencyBinCount);

      const tick = () => {
        if (!this.voiceActive || !this.analyser) return;
        this.analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = this.isMuted ? 0 : Math.min(100, Math.round((sum / data.length) * 1.4));
        this.cb.onMicLevel?.(avg);
        this.meterRaf = requestAnimationFrame(tick);
      };
      tick();
    } catch (_) {}
  }
}
