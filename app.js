import { GAME_CATEGORIES, GAMES_CATALOG } from './games-catalog.js';
import { NativeGameManager } from './native-games.js';
import { PeerEngine } from './peer-engine.js';
import { PRESET_STATIONS, SyncedRadio } from './radio.js';

const $ = (id) => document.getElementById(id);

const state = {
  myName: localStorage.getItem('duoverse_name') || 'Player' + Math.floor(10 + Math.random() * 89),
  partnerName: 'Partner',
  scores: { P1: 0, P2: 0 },
  activeCategory: 'all',
  searchQuery: '',
  activeGame: null,
  activeSideTab: 'chat', // 'chat' | 'radio'
  deferredInstallPrompt: null
};

// === TOAST NOTIFICATIONS ===
function toast(message, type = 'info') {
  const host = $('toast-container');
  const el = document.createElement('div');
  const colors = {
    info: 'border-cyan-400/40 bg-slate-900/95 text-cyan-100',
    success: 'border-emerald-400/40 bg-emerald-950/95 text-emerald-100',
    error: 'border-rose-400/40 bg-rose-950/95 text-rose-100'
  };
  el.className = `toast-enter px-4 py-2.5 rounded-xl border text-xs font-medium shadow-xl backdrop-blur-md ${colors[type] || colors.info}`;
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.25s ease';
    setTimeout(() => el.remove(), 260);
  }, 3200);
}

// === CHAT RENDERER ===
function appendChat({ sender, text, isMe = false, isSystem = false }) {
  const list = $('chat-messages');
  const div = document.createElement('div');
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isSystem) {
    div.className = 'text-center my-1.5';
    div.innerHTML = `<span class="inline-block px-3 py-1 rounded-full text-[11px] bg-white/5 text-slate-400 border border-white/5">${escapeHtml(text)}</span>`;
  } else {
    div.className = `flex flex-col ${isMe ? 'items-end' : 'items-start'}`;
    div.innerHTML = `
      <div class="text-[10px] text-slate-400 mb-0.5 px-1">${escapeHtml(sender)} · ${time}</div>
      <div class="max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words ${
        isMe
          ? 'bg-gradient-to-r from-cyan-500/85 to-violet-600/85 text-white rounded-br-sm'
          : 'bg-white/10 text-slate-100 border border-white/10 rounded-bl-sm'
      }">${escapeHtml(text)}</div>
    `;
  }

  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// === SCOREBOARD ===
function updateScoreboard() {
  const p1Name = peer.role === 'guest' ? state.partnerName : state.myName;
  const p2Name = peer.role === 'guest' ? state.myName : (peer.isConnected() ? state.partnerName : 'Player 2');
  $('score-p1-name').textContent = p1Name;
  $('score-p2-name').textContent = p2Name;
  $('score-p1-val').textContent = state.scores.P1;
  $('score-p2-val').textContent = state.scores.P2;
}

// === SYNCED RADIO ===
const radio = new SyncedRadio({
  onStateChange(rs) {
    $('radio-now-title').textContent = rs.station.name;
    $('radio-now-genre').textContent = rs.station.genre;
    $('radio-play-btn').textContent = rs.isPlaying ? '⏸ Pause' : '▶ Play';
    $('radio-eq').classList.toggle('playing', rs.isPlaying);
    $('radio-mini-status').textContent = rs.isPlaying ? `🎵 ${rs.station.name}` : 'Radio Off';
    $('radio-unlock-bar').classList.toggle('hidden', !rs.autoplayBlocked);
  },
  onSyncBroadcast(payload) {
    if (peer.isConnected()) {
      peer.send(payload);
    }
  },
  onError(msg) {
    toast(msg, 'error');
  }
});

// === PEER ENGINE ===
const peer = new PeerEngine({
  onStatus(kind, label) {
    const badge = $('conn-badge');
    const dot = $('conn-dot');
    $('conn-label').textContent = label;
    const styles = {
      connected: ['border-emerald-400/40 text-emerald-300 bg-emerald-500/10', 'bg-emerald-400'],
      waiting: ['border-amber-400/40 text-amber-300 bg-amber-500/10', 'bg-amber-400 animate-pulse'],
      connecting: ['border-cyan-400/40 text-cyan-300 bg-cyan-500/10', 'bg-cyan-400 animate-pulse'],
      solo: ['border-white/15 text-slate-300 bg-white/5', 'bg-slate-400']
    };
    const [bCls, dCls] = styles[kind] || styles.solo;
    badge.className = `flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${bCls}`;
    dot.className = `w-2 h-2 rounded-full ${dCls}`;
  },
  onRoomReady(code) {
    $('room-code-display').textContent = code;
    $('room-active-bar').classList.remove('hidden');
    $('room-modal').classList.add('hidden');
    const url = new URL(window.location.href);
    url.searchParams.set('room', code);
    window.history.replaceState({}, '', url.toString());
    toast(`Room ${code} ready! Invite link copy karke friend ko bhejo.`, 'success');
    updateScoreboard();
  },
  onPartnerConnected(name) {
    state.partnerName = name;
    appendChat({ isSystem: true, text: `⚡ ${name} joined the room!` });
    toast(`${name} connected! Ab games, voice aur radio dono sync honge.`, 'success');
    updateScoreboard();
    // Sync current game & radio if host
    if (peer.role === 'host') {
      if (state.activeGame) {
        peer.send({ type: 'switch_game', game: state.activeGame });
      }
      if (radio.isPlaying) {
        peer.send({ type: 'radio_sync', action: 'play', station: radio.currentStation });
      }
    }
  },
  onPartnerDisconnected(name) {
    appendChat({ isSystem: true, text: `👋 ${name || 'Partner'} disconnected.` });
    toast('Partner disconnected.', 'info');
    updateScoreboard();
  },
  onLatency(ms) {
    $('ping-badge').textContent = `${ms} ms`;
    $('ping-badge').classList.remove('hidden');
  },
  onVoiceState(active, muted, note) {
    $('voice-join-btn').classList.toggle('hidden', active);
    $('voice-controls').classList.toggle('hidden', !active);
    $('voice-mute-btn').textContent = muted ? '🔇 Unmute' : '🎙️ Mute';
    $('voice-mute-btn').className = muted
      ? 'px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/25 text-rose-200 border border-rose-400/40'
      : 'px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30';
    if (note) {
      appendChat({ isSystem: true, text: `🎙️ ${note}` });
      toast(note, 'info');
    }
  },
  onMicLevel(level) {
    $('mic-meter-fill').style.width = `${level}%`;
  },
  onMessage(msg) {
    if (msg.type === 'chat') {
      appendChat({ sender: msg.sender || state.partnerName, text: msg.text, isMe: false });
    } else if (msg.type === 'reaction') {
      appendChat({ isSystem: true, text: `${msg.sender || state.partnerName} reacted ${msg.emoji}` });
    } else if (msg.type === 'switch_game' && msg.game) {
      launchGame(msg.game, false);
      appendChat({ isSystem: true, text: `🎮 ${state.partnerName} launched ${msg.game.title}` });
    } else if (msg.type === 'game_event') {
      nativeGames.handleRemote(msg);
    } else if (msg.type === 'radio_sync') {
      radio.handleRemoteSync(msg);
      appendChat({
        isSystem: true,
        text: msg.action === 'play'
          ? `📻 ${state.partnerName} tuned Radio to ${msg.station.name}`
          : `📻 ${state.partnerName} paused Radio`
      });
    }
  },
  onError(errMsg) {
    toast(errMsg, 'error');
  }
});

// === NATIVE GAMES ENGINE ===
const nativeGames = new NativeGameManager($('native-game-stage'), {
  send: (payload) => peer.send(payload),
  getRole: () => peer.role,
  isConnected: () => peer.isConnected(),
  getNames: () => ({
    p1: peer.role === 'guest' ? state.partnerName : state.myName,
    p2: peer.role === 'guest' ? state.myName : (peer.isConnected() ? state.partnerName : 'Player 2')
  }),
  addScore: (winner) => {
    if (winner === 'P1' || winner === 'P2') {
      state.scores[winner]++;
      updateScoreboard();
    }
  },
  toast
});

// === GAME HUB & LAUNCHER ===
function renderCategories() {
  $('category-pills').innerHTML = GAME_CATEGORIES.map((cat) => {
    const active = state.activeCategory === cat.id;
    const count = cat.id === 'all'
      ? GAMES_CATALOG.length
      : GAMES_CATALOG.filter((g) => g.category === cat.id).length;
    return `
      <button data-cat="${cat.id}" class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
        active
          ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-md shadow-cyan-500/20'
          : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
      }">${cat.icon} ${cat.label} <span class="opacity-70">(${count})</span></button>
    `;
  }).join('');

  $('category-pills').querySelectorAll('[data-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeCategory = btn.dataset.cat;
      renderCategories();
      renderGameGrid();
    });
  });
}

function renderGameGrid() {
  const q = state.searchQuery.trim().toLowerCase();
  const filtered = GAMES_CATALOG.filter((g) => {
    const matchCat = state.activeCategory === 'all' || g.category === state.activeCategory;
    const matchQ = !q || g.title.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q) || g.badge.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  $('games-count-label').textContent = `${filtered.length} of ${GAMES_CATALOG.length} games`;
  $('games-grid').innerHTML = filtered.map((g) => `
    <button data-game-id="${g.id}" class="glass-card rounded-2xl p-3.5 text-left flex flex-col gap-2 group relative overflow-hidden">
      <div class="w-full h-20 rounded-xl bg-gradient-to-br ${g.accent} flex items-center justify-between px-3.5 border border-white/10">
        <span class="text-4xl group-hover:scale-110 transition-transform">${g.emoji}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          g.type === 'native' ? 'bg-cyan-400/25 text-cyan-200 border border-cyan-400/40' : 'bg-black/35 text-slate-200 border border-white/10'
        }">${g.badge}</span>
      </div>
      <div>
        <div class="font-display font-bold text-sm text-white truncate">${escapeHtml(g.title)}</div>
        <div class="text-[11px] text-slate-400 line-clamp-2 mt-0.5">${escapeHtml(g.desc)}</div>
      </div>
    </button>
  `).join('') || `<div class="col-span-full text-center py-12 text-slate-400 text-sm">Koi game match nahi hua — dusra keyword try karo.</div>`;

  $('games-grid').querySelectorAll('[data-game-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const game = GAMES_CATALOG.find((x) => x.id === card.dataset.gameId);
      if (game) launchGame(game, true);
    });
  });
}

function launchGame(game, broadcast = true) {
  state.activeGame = game;
  $('hub-view').classList.add('hidden');
  $('play-view').classList.remove('hidden');
  $('active-game-title').textContent = `${game.emoji || '🎮'} ${game.title}`;
  $('active-game-badge').textContent = game.type === 'native' ? 'Live P2P Sync' : 'HTML5 Arcade';

  const nativeStage = $('native-game-stage');
  const iframeStage = $('iframe-game-stage');
  const extLink = $('open-external-btn');

  if (game.type === 'native') {
    iframeStage.classList.add('hidden');
    $('game-iframe').src = 'about:blank';
    nativeStage.classList.remove('hidden');
    extLink.classList.add('hidden');
    nativeGames.mount(game.id);
  } else {
    nativeStage.classList.add('hidden');
    nativeStage.innerHTML = '';
    iframeStage.classList.remove('hidden');
    $('game-iframe').src = game.url;
    extLink.href = game.url;
    extLink.classList.remove('hidden');
  }

  if (broadcast && peer.isConnected()) {
    peer.send({ type: 'switch_game', game });
    appendChat({ isSystem: true, text: `🎮 You launched ${game.title} for both players` });
  }
}

function backToHub() {
  $('play-view').classList.add('hidden');
  $('hub-view').classList.remove('hidden');
  $('game-iframe').src = 'about:blank';
}

// === RADIO UI ===
function renderRadioStations(stations, targetId) {
  const el = $(targetId);
  el.innerHTML = stations.map((st, idx) => `
    <button data-st-idx="${idx}" class="w-full glass-card rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-left">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="text-lg shrink-0">${st.emoji || '📻'}</span>
        <div class="min-w-0">
          <div class="text-xs font-semibold text-white truncate">${escapeHtml(st.name)}</div>
          <div class="text-[10px] text-slate-400 truncate">${escapeHtml(st.genre)}</div>
        </div>
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold shrink-0">Play</span>
    </button>
  `).join('');

  el.querySelectorAll('[data-st-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const st = stations[Number(btn.dataset.stIdx)];
      radio.playStation(st, true);
      if (peer.isConnected()) {
        appendChat({ isSystem: true, text: `📻 You tuned Radio to ${st.name}` });
      }
    });
  });
}

// === PWA INSTALL HANDLER ===
function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredInstallPrompt = e;
    $('pwa-install-btn').classList.remove('hidden');
  });

  window.addEventListener('appinstalled', () => {
    state.deferredInstallPrompt = null;
    $('pwa-install-btn').classList.add('hidden');
    toast('DuoVerse App install ho gaya! 🎉', 'success');
  });

  $('pwa-install-btn').addEventListener('click', async () => {
    if (state.deferredInstallPrompt) {
      state.deferredInstallPrompt.prompt();
      await state.deferredInstallPrompt.userChoice;
      state.deferredInstallPrompt = null;
    } else {
      toast('Browser menu -> "Install App" ya "Add to Home Screen" click karo!', 'info');
    }
  });
}

// === BIND ALL EVENTS ===
function init() {
  $('nickname-input').value = state.myName;
  renderCategories();
  renderGameGrid();
  renderRadioStations(PRESET_STATIONS, 'radio-presets-list');
  updateScoreboard();
  setupPWA();

  // Search games
  $('game-search-input').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderGameGrid();
  });

  // Back to 50-game hub
  $('back-hub-btn').addEventListener('click', backToHub);

  // Fullscreen stage
  $('fullscreen-btn').addEventListener('click', () => {
    const stage = $('play-view');
    if (!document.fullscreenElement) stage.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  });

  // Custom Game URL launcher
  $('custom-game-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = $('custom-game-url').value.trim();
    if (!raw.startsWith('https://')) {
      toast('Valid https:// embeddable game URL paste karo.', 'error');
      return;
    }
    launchGame({
      id: 'custom-' + Date.now(),
      title: 'Custom Web Game',
      category: 'arcade',
      type: 'embed',
      emoji: '🌐',
      url: raw
    }, true);
    $('custom-game-url').value = '';
  });

  // Room Modal
  $('open-room-modal-btn').addEventListener('click', () => $('room-modal').classList.remove('hidden'));
  $('close-room-modal-btn').addEventListener('click', () => $('room-modal').classList.add('hidden'));

  $('create-room-btn').addEventListener('click', () => {
    state.myName = $('nickname-input').value.trim() || state.myName;
    localStorage.setItem('duoverse_name', state.myName);
    peer.createRoom(state.myName);
  });

  $('join-room-btn').addEventListener('click', () => {
    state.myName = $('nickname-input').value.trim() || state.myName;
    localStorage.setItem('duoverse_name', state.myName);
    const code = $('join-code-input').value.trim();
    peer.joinRoom(code, state.myName);
  });

  $('copy-invite-btn').addEventListener('click', async () => {
    if (!peer.roomCode) return;
    const url = new URL(window.location.href);
    url.searchParams.set('room', peer.roomCode);
    try {
      await navigator.clipboard.writeText(url.toString());
      toast('Invite link copy ho gaya! WhatsApp/Telegram pe friend ko bhej do.', 'success');
    } catch (_) {
      toast(`Room Code: ${peer.roomCode}`, 'info');
    }
  });

  // Sidebar Tabs (Chat vs Radio)
  const setTab = (tab) => {
    state.activeSideTab = tab;
    $('panel-chat').classList.toggle('hidden', tab !== 'chat');
    $('panel-radio').classList.toggle('hidden', tab !== 'radio');
    $('tab-chat-btn').className = tab === 'chat'
      ? 'flex-1 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500/30 to-violet-500/30 text-white border border-cyan-400/30'
      : 'flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white';
    $('tab-radio-btn').className = tab === 'radio'
      ? 'flex-1 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500/30 to-violet-500/30 text-white border border-pink-400/30'
      : 'flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white';
  };
  $('tab-chat-btn').addEventListener('click', () => setTab('chat'));
  $('tab-radio-btn').addEventListener('click', () => setTab('radio'));
  $('radio-mini-btn').addEventListener('click', () => setTab('radio'));

  // Chat submit
  $('chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = $('chat-input');
    const text = inp.value.trim();
    if (!text) return;
    appendChat({ sender: state.myName, text, isMe: true });
    peer.send({ type: 'chat', sender: state.myName, text });
    inp.value = '';
  });

  // Quick reactions
  document.querySelectorAll('[data-react]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const emoji = btn.dataset.react;
      appendChat({ isSystem: true, text: `You reacted ${emoji}` });
      peer.send({ type: 'reaction', sender: state.myName, emoji });
    });
  });

  // Voice Controls
  $('voice-join-btn').addEventListener('click', () => peer.startVoice());
  $('voice-mute-btn').addEventListener('click', () => peer.toggleMute());
  $('voice-leave-btn').addEventListener('click', () => peer.stopVoice(true));
  $('voice-vol-slider').addEventListener('input', (e) => peer.setPartnerVolume(e.target.value));

  // Radio Controls
  $('radio-play-btn').addEventListener('click', () => radio.togglePlay());
  $('radio-vol-slider').addEventListener('input', (e) => radio.setVolume(e.target.value));
  $('radio-unlock-btn').addEventListener('click', () => radio.unlockAutoplay());

  $('radio-search-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = $('radio-search-input').value.trim();
    if (!q) return;
    $('radio-search-results').innerHTML = `<div class="text-xs text-slate-400 text-center py-3">Searching global FM stations for "${escapeHtml(q)}"...</div>`;
    const found = await radio.searchGlobalStations(q);
    if (!found.length) {
      $('radio-search-results').innerHTML = `<div class="text-xs text-slate-500 text-center py-3">Koi HTTPS stream nahi mila. "Bollywood", "Hindi", "Lofi", ya "Pop" try karo.</div>`;
    } else {
      renderRadioStations(found, 'radio-search-results');
    }
  });

  // Quick radio genre chips
  document.querySelectorAll('[data-radio-q]').forEach((chip) => {
    chip.addEventListener('click', () => {
      $('radio-search-input').value = chip.dataset.radioQ;
      $('radio-search-form').dispatchEvent(new Event('submit'));
    });
  });

  // Auto-join from invite URL (?room=XXXXXX)
  const params = new URLSearchParams(window.location.search);
  const inviteRoom = params.get('room');
  if (inviteRoom) {
    $('join-code-input').value = inviteRoom.toUpperCase();
    $('room-modal').classList.remove('hidden');
    toast(`Invite room "${inviteRoom.toUpperCase()}" detected — Join Room click karo!`, 'info');
  } else {
    appendChat({ isSystem: true, text: 'Welcome to DuoVerse! Play solo right now or create a P2P Room for 2-player games, Voice & Synced Radio.' });
  }
}

init();
