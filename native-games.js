// 8 Built-In Zero-Lag Real-Time WebRTC P2P Duo Games (Works in both P2P Room & Solo Practice Mode)

const DRAW_WORDS = [
  'Rocket', 'Pizza', 'Guitar', 'Dragon', 'Headphones', 'Robot', 'Taj Mahal',
  'Controller', 'Bicycle', 'Sunglasses', 'Volcano', 'Astronaut', 'Cactus', 'Crown',
  'Skateboard', 'Butterfly', 'Lighthouse', 'Spaceship', 'Ice Cream', 'Ninja'
];

export class NativeGameManager {
  constructor(container, ctx) {
    this.container = container;
    this.ctx = ctx; // { send, getRole, isConnected, getNames, addScore, toast }
    this.activeGameId = null;
    this.state = null;
    this.cleanup = null;
  }

  getMySymbol() {
    const role = this.ctx.getRole();
    return role === 'guest' ? 'P2' : 'P1';
  }

  isSolo() {
    return !this.ctx.isConnected();
  }

  mount(gameId) {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    this.activeGameId = gameId;
    switch (gameId) {
      case 'p2p-ttt': this._initTTT(); break;
      case 'p2p-connect4': this._initConnect4(); break;
      case 'p2p-rps': this._initRPS(); break;
      case 'p2p-memory': this._initMemory(); break;
      case 'p2p-draw': this._initDraw(); break;
      case 'p2p-reaction': this._initReaction(); break;
      case 'p2p-dots': this._initDots(); break;
      case 'p2p-number': this._initNumber(); break;
      default: break;
    }
  }

  handleRemote(msg) {
    if (!msg || msg.gameId !== this.activeGameId) return;
    if (this._onRemote) this._onRemote(msg);
  }

  _sendMove(payload) {
    this.ctx.send({ type: 'game_event', gameId: this.activeGameId, ...payload });
  }

  // ==================== 1. TIC-TAC-TOE NEON ====================
  _initTTT() {
    this.state = { board: Array(9).fill(null), turn: 'P1', winner: null, winLine: [] };
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    const checkWin = (b) => {
      for (const line of wins) {
        const [a, c, d] = line;
        if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a], line };
      }
      if (b.every(Boolean)) return { winner: 'DRAW', line: [] };
      return null;
    };

    const render = () => {
      const me = this.getMySymbol();
      const { p1, p2 } = this.ctx.getNames();
      const s = this.state;
      const myTurn = this.isSolo() || s.turn === me;
      let status = s.winner === 'DRAW'
        ? '🤝 Match Draw!'
        : s.winner
          ? `🏆 ${s.winner === 'P1' ? p1 : p2} Wins!`
          : `${s.turn === 'P1' ? p1 + ' (X)' : p2 + ' (O)'}'s Turn`;

      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-4 gap-5">
          <div class="flex items-center gap-3">
            <span class="px-4 py-1.5 rounded-full text-sm font-semibold glass-card ${s.winner ? 'text-emerald-300 border-emerald-400/40' : 'text-cyan-300'}">${status}</span>
            <button id="ttt-reset" class="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 transition">Rematch</button>
          </div>
          <div class="grid grid-cols-3 gap-3 w-full max-w-[320px]">
            ${s.board.map((cell, i) => {
              const isWin = s.winLine.includes(i);
              const label = cell === 'P1' ? 'X' : cell === 'P2' ? 'O' : '';
              const color = cell === 'P1' ? 'text-cyan-400' : 'text-pink-400';
              return `<button data-idx="${i}" class="ttt-cell ${color} ${isWin ? 'ring-2 ring-emerald-400 bg-emerald-500/20' : ''}" ${cell || s.winner || !myTurn ? 'disabled' : ''}>${label}</button>`;
            }).join('')}
          </div>
          <p class="text-xs text-slate-400">${this.isSolo() ? 'Solo Practice Mode — Invite a friend for live P2P!' : `You are ${me === 'P1' ? 'X (Cyan)' : 'O (Pink)'}`}</p>
        </div>
      `;

      this.container.querySelectorAll('[data-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.idx);
          applyMove(idx, true);
        });
      });
      this.container.querySelector('#ttt-reset').addEventListener('click', () => {
        resetGame(true);
      });
    };

    const applyMove = (idx, local) => {
      if (this.state.board[idx] || this.state.winner) return;
      this.state.board[idx] = this.state.turn;
      const res = checkWin(this.state.board);
      if (res) {
        this.state.winner = res.winner;
        this.state.winLine = res.line;
        if (res.winner === 'P1' || res.winner === 'P2') this.ctx.addScore(res.winner);
      } else {
        this.state.turn = this.state.turn === 'P1' ? 'P2' : 'P1';
      }
      if (local) this._sendMove({ action: 'move', idx });
      render();
    };

    const resetGame = (local) => {
      this.state = { board: Array(9).fill(null), turn: 'P1', winner: null, winLine: [] };
      if (local) this._sendMove({ action: 'reset' });
      render();
    };

    this._onRemote = (msg) => {
      if (msg.action === 'move') applyMove(msg.idx, false);
      if (msg.action === 'reset') resetGame(false);
    };
    render();
  }

  // ==================== 2. CONNECT 4 CYBER ====================
  _initConnect4() {
    const ROWS = 6, COLS = 7;
    const empty = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.state = { grid: empty(), turn: 'P1', winner: null };

    const checkWin = (g, r, c, p) => {
      const dirs = [[0,1],[1,0],[1,1],[1,-1]];
      for (const [dr, dc] of dirs) {
        let count = 1;
        for (const sign of [1, -1]) {
          let nr = r + dr * sign, nc = c + dc * sign;
          while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && g[nr][nc] === p) {
            count++;
            nr += dr * sign;
            nc += dc * sign;
          }
        }
        if (count >= 4) return true;
      }
      return false;
    };

    const drop = (col, local) => {
      if (this.state.winner) return;
      let row = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (!this.state.grid[r][col]) { row = r; break; }
      }
      if (row === -1) return;
      const p = this.state.turn;
      this.state.grid[row][col] = p;
      if (checkWin(this.state.grid, row, col, p)) {
        this.state.winner = p;
        this.ctx.addScore(p);
      } else if (this.state.grid[0].every(Boolean)) {
        this.state.winner = 'DRAW';
      } else {
        this.state.turn = p === 'P1' ? 'P2' : 'P1';
      }
      if (local) this._sendMove({ action: 'drop', col });
      render();
    };

    const render = () => {
      const me = this.getMySymbol();
      const { p1, p2 } = this.ctx.getNames();
      const s = this.state;
      const myTurn = this.isSolo() || s.turn === me;
      const status = s.winner === 'DRAW'
        ? '🤝 Draw!'
        : s.winner
          ? `🏆 ${s.winner === 'P1' ? p1 : p2} Connected 4!`
          : `${s.turn === 'P1' ? p1 + ' (Cyan)' : p2 + ' (Pink)'}'s Turn`;

      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-3 gap-4">
          <div class="flex items-center gap-3">
            <span class="px-4 py-1.5 rounded-full text-sm font-semibold glass-card text-cyan-300">${status}</span>
            <button id="c4-reset" class="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20">Reset</button>
          </div>
          <div class="p-3 rounded-2xl glass-panel border border-cyan-500/20 w-full max-w-[390px]">
            <div class="grid grid-cols-7 gap-2 mb-2">
              ${Array.from({ length: COLS }, (_, c) => `
                <button data-col="${c}" ${s.winner || !myTurn ? 'disabled' : ''} class="py-1 rounded-lg text-xs font-bold bg-white/10 hover:bg-cyan-500/30 disabled:opacity-30 transition">▼</button>
              `).join('')}
            </div>
            <div class="grid grid-cols-7 gap-2">
              ${s.grid.flatMap((row, r) => row.map((cell, c) => `
                <div data-col-click="${c}" class="c4-cell cursor-pointer ${cell === 'P1' ? 'c4-p1' : cell === 'P2' ? 'c4-p2' : ''}"></div>
              `)).join('')}
            </div>
          </div>
        </div>
      `;

      this.container.querySelectorAll('[data-col],[data-col-click]').forEach((el) => {
        el.addEventListener('click', () => {
          if (!myTurn || s.winner) return;
          const col = Number(el.dataset.col ?? el.dataset.colClick);
          drop(col, true);
        });
      });
      this.container.querySelector('#c4-reset').addEventListener('click', () => {
        this.state = { grid: empty(), turn: 'P1', winner: null };
        this._sendMove({ action: 'reset' });
        render();
      });
    };

    this._onRemote = (msg) => {
      if (msg.action === 'drop') drop(msg.col, false);
      if (msg.action === 'reset') {
        this.state = { grid: empty(), turn: 'P1', winner: null };
        render();
      }
    };
    render();
  }

  // ==================== 3. ROCK PAPER SCISSORS ====================
  _initRPS() {
    this.state = { picks: { P1: null, P2: null }, result: null };
    const moves = [
      { id: 'rock', label: 'Rock', emoji: '✊' },
      { id: 'paper', label: 'Paper', emoji: '✋' },
      { id: 'scissors', label: 'Scissors', emoji: '✌️' }
    ];

    const resolve = () => {
      const { P1, P2 } = this.state.picks;
      if (!P1 || !P2) return;
      if (P1 === P2) {
        this.state.result = 'DRAW';
      } else if (
        (P1 === 'rock' && P2 === 'scissors') ||
        (P1 === 'paper' && P2 === 'rock') ||
        (P1 === 'scissors' && P2 === 'paper')
      ) {
        this.state.result = 'P1';
        this.ctx.addScore('P1');
      } else {
        this.state.result = 'P2';
        this.ctx.addScore('P2');
      }
    };

    const render = () => {
      const me = this.getMySymbol();
      const other = me === 'P1' ? 'P2' : 'P1';
      const { p1, p2 } = this.ctx.getNames();
      const s = this.state;
      const revealed = Boolean(s.picks.P1 && s.picks.P2);
      const getEmoji = (id) => moves.find((m) => m.id === id)?.emoji || '❔';

      let banner = 'Choose your move!';
      if (revealed) {
        banner = s.result === 'DRAW' ? '🤝 Tie Round!' : `🏆 ${s.result === 'P1' ? p1 : p2} Wins!`;
      } else if (s.picks[me]) {
        banner = 'Locked in! Waiting for partner...';
      }

      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-4 gap-6">
          <div class="px-5 py-2 rounded-full glass-card text-sm font-semibold text-amber-300">${banner}</div>
          <div class="grid grid-cols-2 gap-6 w-full max-w-md">
            <div class="glass-card rounded-2xl p-5 text-center">
              <div class="text-xs text-slate-400 mb-2">${p1}</div>
              <div class="text-5xl">${revealed ? getEmoji(s.picks.P1) : (s.picks.P1 ? '🔒' : '⏳')}</div>
            </div>
            <div class="glass-card rounded-2xl p-5 text-center">
              <div class="text-xs text-slate-400 mb-2">${this.isSolo() ? 'CPU Bot' : p2}</div>
              <div class="text-5xl">${revealed ? getEmoji(s.picks.P2) : (s.picks.P2 ? '🔒' : '⏳')}</div>
            </div>
          </div>
          <div class="flex gap-3">
            ${moves.map((m) => `
              <button data-rps="${m.id}" ${s.picks[me] && !revealed ? 'disabled' : ''} class="px-5 py-3 rounded-2xl glass-card hover:border-amber-400/60 flex flex-col items-center gap-1 disabled:opacity-40">
                <span class="text-3xl">${m.emoji}</span>
                <span class="text-xs font-medium">${m.label}</span>
              </button>
            `).join('')}
          </div>
          ${revealed ? `<button id="rps-next" class="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-sm font-bold shadow-lg">Next Round</button>` : ''}
        </div>
      `;

      this.container.querySelectorAll('[data-rps]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (revealed) {
            this.state = { picks: { P1: null, P2: null }, result: null };
          }
          const pick = btn.dataset.rps;
          this.state.picks[me] = pick;
          if (this.isSolo()) {
            this.state.picks[other] = moves[Math.floor(Math.random() * 3)].id;
            resolve();
          } else {
            this._sendMove({ action: 'pick', player: me, pick });
            resolve();
          }
          render();
        });
      });

      const nextBtn = this.container.querySelector('#rps-next');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          this.state = { picks: { P1: null, P2: null }, result: null };
          this._sendMove({ action: 'reset' });
          render();
        });
      }
    };

    this._onRemote = (msg) => {
      if (msg.action === 'pick') {
        this.state.picks[msg.player] = msg.pick;
        resolve();
        render();
      }
      if (msg.action === 'reset') {
        this.state = { picks: { P1: null, P2: null }, result: null };
        render();
      }
    };
    render();
  }

  // ==================== 4. MEMORY FLIP DUEL ====================
  _initMemory() {
    const icons = ['🚀','🎧','🔥','💎','🎮','🌙','⚡','🎯'];
    const makeDeck = () => [...icons, ...icons].sort(() => Math.random() - 0.5);
    this.state = { deck: makeDeck(), flipped: [], matched: [], turn: 'P1', pairs: { P1: 0, P2: 0 }, lock: false };

    if (!this.isSolo() && this.getMySymbol() === 'P1') {
      this._sendMove({ action: 'sync_deck', deck: this.state.deck });
    }

    const flipCard = (idx, local) => {
      const s = this.state;
      if (s.lock || s.flipped.includes(idx) || s.matched.includes(idx)) return;
      s.flipped.push(idx);
      if (local) this._sendMove({ action: 'flip', idx });
      render();

      if (s.flipped.length === 2) {
        s.lock = true;
        const [a, b] = s.flipped;
        setTimeout(() => {
          if (s.deck[a] === s.deck[b]) {
            s.matched.push(a, b);
            s.pairs[s.turn]++;
            if (s.matched.length === s.deck.length) {
              if (s.pairs.P1 > s.pairs.P2) this.ctx.addScore('P1');
              else if (s.pairs.P2 > s.pairs.P1) this.ctx.addScore('P2');
            }
          } else {
            s.turn = s.turn === 'P1' ? 'P2' : 'P1';
          }
          s.flipped = [];
          s.lock = false;
          render();
        }, 700);
      }
    };

    const render = () => {
      const me = this.getMySymbol();
      const { p1, p2 } = this.ctx.getNames();
      const s = this.state;
      const myTurn = this.isSolo() || s.turn === me;
      const done = s.matched.length === s.deck.length;

      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-4 gap-4">
          <div class="flex items-center gap-3 flex-wrap justify-center">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300">${p1}: ${s.pairs.P1}</span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold glass-card">${done ? '🏆 Game Over!' : `${s.turn === 'P1' ? p1 : p2}'s Turn`}</span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300">${p2}: ${s.pairs.P2}</span>
            <button id="mem-reset" class="px-3 py-1 rounded-full text-xs bg-white/10 hover:bg-white/20">New Deck</button>
          </div>
          <div class="grid grid-cols-4 gap-2.5 w-full max-w-[330px]">
            ${s.deck.map((emoji, i) => {
              const isMatched = s.matched.includes(i);
              const isOpen = isMatched || s.flipped.includes(i);
              return `<button data-mem="${i}" ${!myTurn || isOpen || s.lock ? 'disabled' : ''} class="mem-card ${isMatched ? 'matched' : isOpen ? 'revealed' : 'hidden-face'}">${isOpen ? emoji : '✦'}</button>`;
            }).join('')}
          </div>
        </div>
      `;

      this.container.querySelectorAll('[data-mem]').forEach((btn) => {
        btn.addEventListener('click', () => flipCard(Number(btn.dataset.mem), true));
      });
      this.container.querySelector('#mem-reset').addEventListener('click', () => {
        const deck = makeDeck();
        this.state = { deck, flipped: [], matched: [], turn: 'P1', pairs: { P1: 0, P2: 0 }, lock: false };
        this._sendMove({ action: 'sync_deck', deck });
        render();
      });
    };

    this._onRemote = (msg) => {
      if (msg.action === 'sync_deck') {
        this.state = { deck: msg.deck, flipped: [], matched: [], turn: 'P1', pairs: { P1: 0, P2: 0 }, lock: false };
        render();
      }
      if (msg.action === 'flip') flipCard(msg.idx, false);
    };
    render();
  }

  // ==================== 5. LIVE DRAW & GUESS (PICTIONARY) ====================
  _initDraw() {
    this.state = { color: '#22d3ee', size: 4, word: DRAW_WORDS[Math.floor(Math.random() * DRAW_WORDS.length)] };
    this.container.innerHTML = `
      <div class="flex flex-col h-full p-3 gap-2">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">Prompt: <strong id="draw-word">${this.state.word}</strong></span>
            <button id="draw-new-word" class="px-2.5 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/20">New Word</button>
          </div>
          <div class="flex items-center gap-1.5">
            ${['#22d3ee','#ec4899','#a855f7','#facc15','#4ade80','#ffffff'].map((c) => `
              <button data-color="${c}" class="w-5 h-5 rounded-full border border-white/30" style="background:${c}"></button>
            `).join('')}
            <button id="draw-clear" class="ml-2 px-2.5 py-1 rounded-lg text-xs bg-rose-500/20 text-rose-300 hover:bg-rose-500/30">Clear</button>
          </div>
        </div>
        <div class="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-[#0b0d18] relative min-h-[280px]">
          <canvas id="draw-canvas" class="w-full h-full block"></canvas>
        </div>
        <p class="text-[11px] text-slate-400 text-center">Both players can draw live together — guess the secret word in chat!</p>
      </div>
    `;

    const canvas = this.container.querySelector('#draw-canvas');
    const ctx2d = canvas.getContext('2d');
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.max(300, Math.floor(rect.width));
      canvas.height = Math.max(260, Math.floor(rect.height));
    };
    resize();

    let drawing = false;
    let last = null;

    const drawSeg = (x0, y0, x1, y1, color, size) => {
      ctx2d.strokeStyle = color;
      ctx2d.lineWidth = size;
      ctx2d.lineCap = 'round';
      ctx2d.beginPath();
      ctx2d.moveTo(x0 * canvas.width, y0 * canvas.height);
      ctx2d.lineTo(x1 * canvas.width, y1 * canvas.height);
      ctx2d.stroke();
    };

    const getNorm = (e) => {
      const rect = canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      return {
        x: (pt.clientX - rect.left) / rect.width,
        y: (pt.clientY - rect.top) / rect.height
      };
    };

    const start = (e) => { drawing = true; last = getNorm(e); };
    const move = (e) => {
      if (!drawing || !last) return;
      e.preventDefault();
      const cur = getNorm(e);
      drawSeg(last.x, last.y, cur.x, cur.y, this.state.color, this.state.size);
      this._sendMove({ action: 'seg', x0: last.x, y0: last.y, x1: cur.x, y1: cur.y, color: this.state.color, size: this.state.size });
      last = cur;
    };
    const end = () => { drawing = false; last = null; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);

    this.container.querySelectorAll('[data-color]').forEach((b) => {
      b.addEventListener('click', () => { this.state.color = b.dataset.color; });
    });
    this.container.querySelector('#draw-clear').addEventListener('click', () => {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      this._sendMove({ action: 'clear' });
    });
    this.container.querySelector('#draw-new-word').addEventListener('click', () => {
      this.state.word = DRAW_WORDS[Math.floor(Math.random() * DRAW_WORDS.length)];
      this.container.querySelector('#draw-word').textContent = this.state.word;
    });

    this._onRemote = (msg) => {
      if (msg.action === 'seg') drawSeg(msg.x0, msg.y0, msg.x1, msg.y1, msg.color, msg.size);
      if (msg.action === 'clear') ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    };
    this.cleanup = () => { window.removeEventListener('mouseup', end); };
  }

  // ==================== 6. REFLEX DUEL (MS) ====================
  _initReaction() {
    this.state = { phase: 'idle', startAt: 0, times: { P1: null, P2: null }, timer: null };

    const startRound = (delayMs, local) => {
      if (this.state.timer) clearTimeout(this.state.timer);
      this.state = { phase: 'waiting', startAt: 0, times: { P1: null, P2: null }, timer: null };
      if (local) this._sendMove({ action: 'start', delayMs });
      render();
      this.state.timer = setTimeout(() => {
        this.state.phase = 'go';
        this.state.startAt = performance.now();
        render();
      }, delayMs);
    };

    const render = () => {
      const me = this.getMySymbol();
      const { p1, p2 } = this.ctx.getNames();
      const s = this.state;
      const bg = s.phase === 'go'
        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
        : s.phase === 'waiting'
          ? 'bg-rose-500/20 border-rose-400/50 text-rose-200'
          : 'glass-card text-slate-200';

      const msg = s.phase === 'idle'
        ? 'Click Start Round to begin!'
        : s.phase === 'waiting'
          ? 'WAIT FOR GREEN...'
          : s.phase === 'go'
            ? '⚡ TAP NOW!!'
            : 'Round Complete!';

      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-4 gap-5">
          <div class="flex gap-4 text-xs">
            <span class="px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300">${p1}: ${s.times.P1 ? s.times.P1 + ' ms' : '--'}</span>
            <span class="px-3 py-1.5 rounded-full bg-pink-500/20 text-pink-300">${p2}: ${s.times.P2 ? s.times.P2 + ' ms' : '--'}</span>
          </div>
          <button id="react-pad" class="w-full max-w-sm h-52 rounded-3xl border-2 font-display text-2xl font-bold transition ${bg}">${msg}</button>
          <button id="react-start" class="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-sm font-bold">Start Synced Round</button>
        </div>
      `;

      this.container.querySelector('#react-start').addEventListener('click', () => {
        const delay = 1500 + Math.floor(Math.random() * 2500);
        startRound(delay, true);
      });

      this.container.querySelector('#react-pad').addEventListener('click', () => {
        if (s.phase !== 'go' || s.times[me]) return;
        const ms = Math.max(1, Math.round(performance.now() - s.startAt));
        s.times[me] = ms;
        this._sendMove({ action: 'tap', player: me, ms });
        if (this.isSolo() || (s.times.P1 && s.times.P2)) {
          s.phase = 'done';
          if (s.times.P1 && s.times.P2) {
            this.ctx.addScore(s.times.P1 <= s.times.P2 ? 'P1' : 'P2');
          }
        }
        render();
      });
    };

    this._onRemote = (msg) => {
      if (msg.action === 'start') startRound(msg.delayMs, false);
      if (msg.action === 'tap') {
        this.state.times[msg.player] = msg.ms;
        if (this.state.times.P1 && this.state.times.P2) {
          this.state.phase = 'done';
          this.ctx.addScore(this.state.times.P1 <= this.state.times.P2 ? 'P1' : 'P2');
        }
        render();
      }
    };
    this.cleanup = () => { if (this.state.timer) clearTimeout(this.state.timer); };
    render();
  }

  // ==================== 7. DOTS & BOXES (3x3 BOXES) ====================
  _initDots() {
    const N = 3; // 3x3 boxes => 4x4 dots
    const fresh = () => ({
      h: Array.from({ length: N + 1 }, () => Array(N).fill(null)),
      v: Array.from({ length: N }, () => Array(N + 1).fill(null)),
      boxes: Array.from({ length: N }, () => Array(N).fill(null)),
      turn: 'P1',
      scores: { P1: 0, P2: 0 },
      done: false
    });
    this.state = fresh();

    const claim = (orient, r, c, local) => {
      const s = this.state;
      if (s.done) return;
      if (orient === 'h' && s.h[r][c]) return;
      if (orient === 'v' && s.v[r][c]) return;
      if (orient === 'h') s.h[r][c] = s.turn;
      else s.v[r][c] = s.turn;

      let scored = false;
      for (let br = 0; br < N; br++) {
        for (let bc = 0; bc < N; bc++) {
          if (!s.boxes[br][bc] && s.h[br][bc] && s.h[br + 1][bc] && s.v[br][bc] && s.v[br][bc + 1]) {
            s.boxes[br][bc] = s.turn;
            s.scores[s.turn]++;
            scored = true;
          }
        }
      }
      if (s.scores.P1 + s.scores.P2 === N * N) {
        s.done = true;
        if (s.scores.P1 > s.scores.P2) this.ctx.addScore('P1');
        else if (s.scores.P2 > s.scores.P1) this.ctx.addScore('P2');
      } else if (!scored) {
        s.turn = s.turn === 'P1' ? 'P2' : 'P1';
      }
      if (local) this._sendMove({ action: 'claim', orient, r, c });
      render();
    };

    const render = () => {
      const me = this.getMySymbol();
      const { p1, p2 } = this.ctx.getNames();
      const s = this.state;
      const myTurn = this.isSolo() || s.turn === me;

      let gridHtml = '';
      for (let r = 0; r <= N; r++) {
        // Dot + H-edge row
        gridHtml += `<div class="flex items-center">`;
        for (let c = 0; c <= N; c++) {
          gridHtml += `<div class="w-3.5 h-3.5 rounded-full bg-slate-200 shrink-0"></div>`;
          if (c < N) {
            const owner = s.h[r][c];
            const cls = owner === 'P1' ? 'bg-cyan-400' : owner === 'P2' ? 'bg-pink-400' : 'bg-white/10 hover:bg-cyan-400/50';
            gridHtml += `<button data-edge="h-${r}-${c}" ${owner || !myTurn ? 'disabled' : ''} class="w-14 h-2.5 mx-1 rounded-full transition ${cls}"></button>`;
          }
        }
        gridHtml += `</div>`;
        // V-edge + Box row
        if (r < N) {
          gridHtml += `<div class="flex items-center">`;
          for (let c = 0; c <= N; c++) {
            const owner = s.v[r][c];
            const cls = owner === 'P1' ? 'bg-cyan-400' : owner === 'P2' ? 'bg-pink-400' : 'bg-white/10 hover:bg-cyan-400/50';
            gridHtml += `<button data-edge="v-${r}-${c}" ${owner || !myTurn ? 'disabled' : ''} class="w-2.5 h-14 mx-0.5 rounded-full transition ${cls}"></button>`;
            if (c < N) {
              const bOwner = s.boxes[r][c];
              const bCls = bOwner === 'P1' ? 'bg-cyan-500/30 text-cyan-200' : bOwner === 'P2' ? 'bg-pink-500/30 text-pink-200' : 'bg-transparent';
              gridHtml += `<div class="w-14 h-14 mx-1 rounded-lg flex items-center justify-center font-bold text-sm ${bCls}">${bOwner ? (bOwner === 'P1' ? 'P1' : 'P2') : ''}</div>`;
            }
          }
          gridHtml += `</div>`;
        }
      }

      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-4 gap-4">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300">${p1}: ${s.scores.P1}</span>
            <span class="px-3 py-1 rounded-full text-xs glass-card">${s.done ? '🏆 Finished!' : `${s.turn === 'P1' ? p1 : p2}'s Turn`}</span>
            <span class="px-3 py-1 rounded-full text-xs bg-pink-500/20 text-pink-300">${p2}: ${s.scores.P2}</span>
            <button id="dots-reset" class="px-3 py-1 rounded-full text-xs bg-white/10 hover:bg-white/20">Reset</button>
          </div>
          <div class="p-4 rounded-2xl glass-panel">${gridHtml}</div>
        </div>
      `;

      this.container.querySelectorAll('[data-edge]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const [orient, r, c] = btn.dataset.edge.split('-');
          claim(orient, Number(r), Number(c), true);
        });
      });
      this.container.querySelector('#dots-reset').addEventListener('click', () => {
        this.state = fresh();
        this._sendMove({ action: 'reset' });
        render();
      });
    };

    this._onRemote = (msg) => {
      if (msg.action === 'claim') claim(msg.orient, msg.r, msg.c, false);
      if (msg.action === 'reset') { this.state = fresh(); render(); }
    };
    render();
  }

  // ==================== 8. CODE BREAKER 99 ====================
  _initNumber() {
    const newSecret = () => 1 + Math.floor(Math.random() * 99);
    this.state = { secret: newSecret(), history: [], winner: null };
    if (!this.isSolo() && this.getMySymbol() === 'P1') {
      this._sendMove({ action: 'sync_secret', secret: this.state.secret });
    }

    const submitGuess = (player, num, local) => {
      const s = this.state;
      if (s.winner || isNaN(num) || num < 1 || num > 99) return;
      let clue = '🎯 EXACT!';
      if (num < s.secret) clue = '⬆️ Too Low';
      else if (num > s.secret) clue = '⬇️ Too High';
      else {
        s.winner = player;
        this.ctx.addScore(player);
      }
      s.history.unshift({ player, num, clue });
      if (local) this._sendMove({ action: 'guess', player, num });
      render();
    };

    const render = () => {
      const me = this.getMySymbol();
      const { p1, p2 } = this.ctx.getNames();
      const s = this.state;

      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-4 gap-4 max-w-md mx-auto">
          <div class="text-center">
            <h3 class="font-display text-lg font-bold text-cyan-300">Crack the Secret Number (1–99)</h3>
            <p class="text-xs text-slate-400">${s.winner ? `🏆 ${s.winner === 'P1' ? p1 : p2} cracked ${s.secret}!` : 'Race your partner — clues appear live for both!'}</p>
          </div>
          <form id="num-form" class="flex gap-2 w-full">
            <input id="num-input" type="number" min="1" max="99" placeholder="Enter 1-99..." ${s.winner ? 'disabled' : ''} class="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:outline-none focus:border-cyan-400 text-sm" />
            <button type="submit" ${s.winner ? 'disabled' : ''} class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-sm font-bold">Guess</button>
            <button type="button" id="num-reset" class="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold">New</button>
          </form>
          <div class="w-full flex-1 max-h-56 overflow-y-auto space-y-1.5 pr-1">
            ${s.history.map((h) => `
              <div class="flex items-center justify-between px-3 py-2 rounded-xl glass-card text-xs">
                <span class="${h.player === 'P1' ? 'text-cyan-300' : 'text-pink-300'} font-semibold">${h.player === 'P1' ? p1 : p2}</span>
                <span class="font-mono text-sm font-bold">${h.num}</span>
                <span class="text-slate-300">${h.clue}</span>
              </div>
            `).join('') || '<p class="text-center text-xs text-slate-500 py-8">No guesses yet — take the first shot!</p>'}
          </div>
        </div>
      `;

      this.container.querySelector('#num-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const inp = this.container.querySelector('#num-input');
        submitGuess(me, Number(inp.value), true);
      });
      this.container.querySelector('#num-reset').addEventListener('click', () => {
        const secret = newSecret();
        this.state = { secret, history: [], winner: null };
        this._sendMove({ action: 'sync_secret', secret });
        render();
      });
    };

    this._onRemote = (msg) => {
      if (msg.action === 'sync_secret') {
        this.state = { secret: msg.secret, history: [], winner: null };
        render();
      }
      if (msg.action === 'guess') submitGuess(msg.player, msg.num, false);
    };
    render();
  }
}
