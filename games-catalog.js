// 50+ Curated Games: 8 Zero-Lag Native P2P Synced Duo Games + 42 Verified Embeddable HTML5 Arcade Games
// Embedded games use verified Famobi (play.famobi.com) & HTMLGames (cdn.htmlgames.com) iframe-ready URLs.

export const GAME_CATEGORIES = [
  { id: 'all', label: 'All Games', icon: '🎮' },
  { id: 'p2p', label: 'Live P2P Duo', icon: '⚡' },
  { id: 'sports', label: 'Sports & Pool', icon: '🎱' },
  { id: 'arcade', label: 'Arcade & 3D', icon: '🚀' },
  { id: 'puzzle', label: 'Puzzle & Brain', icon: '🧩' },
  { id: 'racing', label: 'Racing & Action', icon: '🏎️' },
  { id: 'board', label: 'Board & Cards', icon: '🃏' }
];

export const GAMES_CATALOG = [
  // === 8 NATIVE ZERO-LAG WEBRTC P2P SYNCED DUO GAMES ===
  {
    id: 'p2p-ttt',
    title: 'Tic-Tac-Toe Neon',
    category: 'p2p',
    type: 'native',
    badge: 'Live P2P',
    emoji: '❌',
    accent: 'from-cyan-500/30 to-blue-600/30',
    desc: 'Classic 3x3 synced live over WebRTC with instant rematch.'
  },
  {
    id: 'p2p-connect4',
    title: 'Connect 4 Cyber',
    category: 'p2p',
    type: 'native',
    badge: 'Live P2P',
    emoji: '🔴',
    accent: 'from-pink-500/30 to-violet-600/30',
    desc: 'Drop neon discs to connect 4 in a row before your partner.'
  },
  {
    id: 'p2p-rps',
    title: 'Rock Paper Scissors',
    category: 'p2p',
    type: 'native',
    badge: 'Live P2P',
    emoji: '✊',
    accent: 'from-amber-500/30 to-orange-600/30',
    desc: 'Simultaneous secret lock-in & reveal showdown.'
  },
  {
    id: 'p2p-memory',
    title: 'Memory Flip Duel',
    category: 'p2p',
    type: 'native',
    badge: 'Live P2P',
    emoji: '🧠',
    accent: 'from-emerald-500/30 to-teal-600/30',
    desc: 'Synced 4x4 card board — match pairs to steal turns.'
  },
  {
    id: 'p2p-draw',
    title: 'Draw & Guess Live',
    category: 'p2p',
    type: 'native',
    badge: 'Live P2P',
    emoji: '🎨',
    accent: 'from-fuchsia-500/30 to-purple-600/30',
    desc: 'Real-time synced canvas! Draw secret words while your friend guesses.'
  },
  {
    id: 'p2p-reaction',
    title: 'Reflex Duel (ms)',
    category: 'p2p',
    type: 'native',
    badge: 'Live P2P',
    emoji: '⚡',
    accent: 'from-yellow-500/30 to-rose-500/30',
    desc: 'Wait for green and tap fastest — millisecond P2P battle.'
  },
  {
    id: 'p2p-dots',
    title: 'Dots & Boxes',
    category: 'p2p',
    type: 'native',
    badge: 'Live P2P',
    emoji: '🟦',
    accent: 'from-indigo-500/30 to-cyan-500/30',
    desc: 'Claim lines & complete boxes in this addictive 2-player classic.'
  },
  {
    id: 'p2p-number',
    title: 'Code Breaker 99',
    category: 'p2p',
    type: 'native',
    badge: 'Live P2P',
    emoji: '🔐',
    accent: 'from-sky-500/30 to-emerald-500/30',
    desc: 'Race to crack the synced hidden number using High/Low clues.'
  },

  // === 42 EMBEDDABLE HTML5 ARCADE GAMES (SYNCED LAUNCH FOR BOTH PLAYERS) ===
  // Sports & Pool
  {
    id: 'fam-8ball',
    title: '8 Ball Billiards Classic',
    category: 'sports',
    type: 'embed',
    badge: '2P / Arcade',
    emoji: '🎱',
    accent: 'from-emerald-600/30 to-green-900/40',
    url: 'https://play.famobi.com/8-ball-billiards-classic',
    desc: 'Realistic 8-ball pool with 2-player pass & play or score battle.'
  },
  {
    id: 'fam-table-tennis',
    title: 'Table Tennis World Tour',
    category: 'sports',
    type: 'embed',
    badge: 'Sports',
    emoji: '🏓',
    accent: 'from-blue-500/30 to-indigo-700/30',
    url: 'https://play.famobi.com/table-tennis-world-tour',
    desc: 'Fast-paced ping pong tournament with spin physics.'
  },
  {
    id: 'fam-archery',
    title: 'Archery World Tour',
    category: 'sports',
    type: 'embed',
    badge: 'Sports',
    emoji: '🏹',
    accent: 'from-amber-500/30 to-emerald-600/30',
    url: 'https://play.famobi.com/archery-world-tour',
    desc: 'Precision bow & arrow challenge with live wind physics.'
  },
  {
    id: 'fam-freekick',
    title: '3D Free Kick',
    category: 'sports',
    type: 'embed',
    badge: 'Sports',
    emoji: '⚽',
    accent: 'from-green-500/30 to-lime-600/30',
    url: 'https://play.famobi.com/3d-free-kick',
    desc: 'Curve free kicks past the keeper and compare high scores.'
  },
  {
    id: 'fam-basketball',
    title: 'Basketball Superstars',
    category: 'sports',
    type: 'embed',
    badge: 'Sports',
    emoji: '🏀',
    accent: 'from-orange-500/30 to-red-600/30',
    url: 'https://play.famobi.com/basketball-superstars',
    desc: 'Dunk and shoot hoops in quick head-to-head score rounds.'
  },
  {
    id: 'fam-penalty',
    title: '3D Penalty',
    category: 'sports',
    type: 'embed',
    badge: 'Sports',
    emoji: '🥅',
    accent: 'from-teal-500/30 to-emerald-700/30',
    url: 'https://play.famobi.com/3d-penalty',
    desc: 'High-pressure penalty shootout challenge.'
  },
  {
    id: 'fam-bowling',
    title: '3D Bowling',
    category: 'sports',
    type: 'embed',
    badge: 'Sports',
    emoji: '🎳',
    accent: 'from-cyan-600/30 to-slate-700/40',
    url: 'https://play.famobi.com/3d-bowling',
    desc: 'Bowl strikes and spares in smooth 3D lanes.'
  },
  {
    id: 'fam-airhockey',
    title: '3D Air Hockey',
    category: 'sports',
    type: 'embed',
    badge: '2P / Arcade',
    emoji: '🏒',
    accent: 'from-sky-500/30 to-blue-700/30',
    url: 'https://play.famobi.com/3d-air-hockey',
    desc: 'Neon glow air hockey with slick puck physics.'
  },

  // Arcade & 3D
  {
    id: 'fam-omnom',
    title: 'Om Nom Run',
    category: 'arcade',
    type: 'embed',
    badge: '3D Runner',
    emoji: '🏃',
    accent: 'from-lime-500/30 to-green-600/30',
    url: 'https://play.famobi.com/om-nom-run',
    desc: 'Endless street runner — see who survives longer!'
  },
  {
    id: 'fam-tower-crash',
    title: 'Tower Crash 3D',
    category: 'arcade',
    type: 'embed',
    badge: '3D Physics',
    emoji: '🗼',
    accent: 'from-violet-500/30 to-fuchsia-600/30',
    url: 'https://play.famobi.com/tower-crash-3d',
    desc: 'Match colors and collapse giant 3D block towers.'
  },
  {
    id: 'fam-cannon-balls',
    title: 'Cannon Balls 3D',
    category: 'arcade',
    type: 'embed',
    badge: '3D Physics',
    emoji: '💣',
    accent: 'from-red-500/30 to-amber-600/30',
    url: 'https://play.famobi.com/cannon-balls-3d',
    desc: 'Demolish structures with limited cannon shots.'
  },
  {
    id: 'fam-bubble-tower',
    title: 'Bubble Tower 3D',
    category: 'arcade',
    type: 'embed',
    badge: '3D Arcade',
    emoji: '🫧',
    accent: 'from-cyan-500/30 to-indigo-600/30',
    url: 'https://play.famobi.com/bubble-tower-3d',
    desc: 'Aztec-themed 3D rotating bubble shooter.'
  },
  {
    id: 'fam-bubble-woods',
    title: 'Bubble Woods',
    category: 'arcade',
    type: 'embed',
    badge: 'Arcade',
    emoji: '🌲',
    accent: 'from-emerald-500/30 to-cyan-600/30',
    url: 'https://play.famobi.com/bubble-woods',
    desc: '60-second high-score bubble popping sprint.'
  },
  {
    id: 'fam-tnt-bomb',
    title: 'TNT Bomb',
    category: 'arcade',
    type: 'embed',
    badge: 'Arcade',
    emoji: '🧨',
    accent: 'from-orange-600/30 to-rose-700/30',
    url: 'https://play.famobi.com/tnt-bomb',
    desc: 'Place dynamite strategically to blast buildings down.'
  },
  {
    id: 'fam-gun-spin',
    title: 'Gun Spin',
    category: 'arcade',
    type: 'embed',
    badge: 'Physics',
    emoji: '🎯',
    accent: 'from-yellow-500/30 to-orange-600/30',
    url: 'https://play.famobi.com/gun-spin',
    desc: 'Use recoil physics to flip across the stage.'
  },
  {
    id: 'fam-bottle-flip',
    title: 'Bottle Flip',
    category: 'arcade',
    type: 'embed',
    badge: 'Skill',
    emoji: '🍾',
    accent: 'from-sky-400/30 to-cyan-600/30',
    url: 'https://play.famobi.com/bottle-flip',
    desc: 'Land impossible bottle flips across furniture.'
  },
  {
    id: 'fam-totemia',
    title: 'Totemia: Cursed Marbles',
    category: 'arcade',
    type: 'embed',
    badge: 'Zuma Style',
    emoji: '🔮',
    accent: 'from-purple-600/30 to-pink-600/30',
    url: 'https://play.famobi.com/totemia-cursed-marbles',
    desc: 'Classic marble chain shooter with power-ups.'
  },
  {
    id: 'fam-diamond-rush',
    title: 'Diamond Rush 2',
    category: 'arcade',
    type: 'embed',
    badge: 'Match-3',
    emoji: '💎',
    accent: 'from-cyan-400/30 to-blue-600/30',
    url: 'https://play.famobi.com/diamond-rush-2',
    desc: '60-second gem matching frenzy.'
  },
  {
    id: 'fam-zoo-boom',
    title: 'Zoo Boom',
    category: 'arcade',
    type: 'embed',
    badge: 'Match',
    emoji: '🦁',
    accent: 'from-amber-400/30 to-yellow-600/30',
    url: 'https://play.famobi.com/zoo-boom',
    desc: 'Tap matching cute animal cubes for explosive combos.'
  },
  {
    id: 'fam-garden-bloom',
    title: 'Garden Bloom',
    category: 'arcade',
    type: 'embed',
    badge: 'Match-3',
    emoji: '🌸',
    accent: 'from-pink-400/30 to-rose-600/30',
    url: 'https://play.famobi.com/garden-bloom',
    desc: 'Chill flower match-3 while chatting & listening to radio.'
  },

  // Racing & Action
  {
    id: 'fam-moto-x3m',
    title: 'Moto X3M Pool Party',
    category: 'racing',
    type: 'embed',
    badge: 'Stunts',
    emoji: '🏍️',
    accent: 'from-cyan-500/30 to-blue-600/30',
    url: 'https://play.famobi.com/moto-x3m-pool-party',
    desc: 'Wild bike stunt tracks — beat your friend’s best time.'
  },
  {
    id: 'fam-asphalt',
    title: 'Asphalt Speed Racing 3D',
    category: 'racing',
    type: 'embed',
    badge: '3D Racing',
    emoji: '🏎️',
    accent: 'from-red-500/30 to-violet-600/30',
    url: 'https://play.famobi.com/asphalt-speed-racing-3d',
    desc: 'High-speed street racing in 3D.'
  },
  {
    id: 'fam-fun-race',
    title: 'Fun Race 3D',
    category: 'racing',
    type: 'embed',
    badge: 'Parkour',
    emoji: '🏁',
    accent: 'from-rose-500/30 to-orange-500/30',
    url: 'https://play.famobi.com/fun-race-3d',
    desc: 'Dodge obstacles and race to the finish line.'
  },
  {
    id: 'fam-drift-boss',
    title: 'Drift Cup Racing',
    category: 'racing',
    type: 'embed',
    badge: 'Drift',
    emoji: '🚗',
    accent: 'from-indigo-500/30 to-purple-600/30',
    url: 'https://play.famobi.com/drift-cup-racing',
    desc: 'Top-down drift racing around tight corners.'
  },
  {
    id: 'fam-street-pursuit',
    title: 'Street Pursuit',
    category: 'racing',
    type: 'embed',
    badge: 'Action',
    emoji: '🚔',
    accent: 'from-blue-600/30 to-red-600/30',
    url: 'https://play.famobi.com/street-pursuit',
    desc: 'Outrun police chases and grab cash drops.'
  },
  {
    id: 'fam-merge-fight',
    title: 'Merge & Fight',
    category: 'racing',
    type: 'embed',
    badge: 'Action',
    emoji: '⚔️',
    accent: 'from-amber-500/30 to-red-600/30',
    url: 'https://play.famobi.com/merge-and-fight',
    desc: 'Merge warriors and battle waves of enemies.'
  },
  {
    id: 'fam-cooking-blast',
    title: 'Cooking Blast',
    category: 'racing',
    type: 'embed',
    badge: 'Fast Pace',
    emoji: '🍳',
    accent: 'from-orange-400/30 to-amber-600/30',
    url: 'https://play.famobi.com/cooking-blast',
    desc: 'Serve dishes fast in a bustling kitchen.'
  },
  {
    id: 'fam-cooking-rage',
    title: 'Cooking Rage',
    category: 'racing',
    type: 'embed',
    badge: 'Time Mgmt',
    emoji: '🍔',
    accent: 'from-red-500/30 to-yellow-600/30',
    url: 'https://play.famobi.com/cooking-rage',
    desc: 'Cook burgers and combos against the clock.'
  },
  {
    id: 'fam-hero-tycoon',
    title: 'Hero Making Tycoon',
    category: 'racing',
    type: 'embed',
    badge: 'Tycoon',
    emoji: '🦸',
    accent: 'from-violet-500/30 to-cyan-500/30',
    url: 'https://play.famobi.com/hero-making-tycoon',
    desc: 'Build a factory of tiny heroes and defeat bosses.'
  },
  {
    id: 'fam-kebab-world',
    title: 'Kebab World',
    category: 'racing',
    type: 'embed',
    badge: 'Chill Sim',
    emoji: '🥙',
    accent: 'from-amber-500/30 to-orange-700/30',
    url: 'https://play.famobi.com/kebab-world',
    desc: 'Grill and serve kebabs to hungry customers.'
  },

  // Puzzle & Brain
  {
    id: 'fam-element-blocks',
    title: 'Element Blocks',
    category: 'puzzle',
    type: 'embed',
    badge: 'Tetris-like',
    emoji: '🧱',
    accent: 'from-cyan-500/30 to-teal-600/30',
    url: 'https://play.famobi.com/element-blocks',
    desc: 'Drop blocks to clear rows and rack up mega combos.'
  },
  {
    id: 'fam-temple-blocks',
    title: 'Temple Blocks',
    category: 'puzzle',
    type: 'embed',
    badge: 'Block Puzzle',
    emoji: '🗿',
    accent: 'from-amber-600/30 to-stone-700/40',
    url: 'https://play.famobi.com/temple-blocks',
    desc: 'Ancient temple grid puzzle with clean combos.'
  },
  {
    id: 'fam-onet-connect',
    title: 'Onet Connect Classic',
    category: 'puzzle',
    type: 'embed',
    badge: 'Tile Match',
    emoji: '🀄',
    accent: 'from-rose-500/30 to-pink-600/30',
    url: 'https://play.famobi.com/onet-connect-classic',
    desc: 'Connect identical tiles before the timer runs out.'
  },
  {
    id: 'fam-123-puzzle',
    title: '123 Puzzle',
    category: 'puzzle',
    type: 'embed',
    badge: 'Brain',
    emoji: '🔢',
    accent: 'from-blue-500/30 to-cyan-600/30',
    url: 'https://play.famobi.com/123-puzzle',
    desc: 'Quick logic and math brain teasers.'
  },
  {
    id: 'fam-jigsaw',
    title: 'Jigsaw Puzzle Classic',
    category: 'puzzle',
    type: 'embed',
    badge: 'Relaxing',
    emoji: '🧩',
    accent: 'from-indigo-500/30 to-sky-500/30',
    url: 'https://play.famobi.com/jigsaw-puzzle-classic',
    desc: 'Chill 25, 49, or 100-piece scenic jigsaw puzzles.'
  },
  {
    id: 'fam-word-run',
    title: 'Word Run',
    category: 'puzzle',
    type: 'embed',
    badge: 'Word',
    emoji: '🔤',
    accent: 'from-emerald-500/30 to-cyan-600/30',
    url: 'https://play.famobi.com/word-run',
    desc: 'Build words quickly to keep your streak alive.'
  },
  {
    id: 'fam-daily-words',
    title: 'Daily Words',
    category: 'puzzle',
    type: 'embed',
    badge: 'Wordle-like',
    emoji: '📝',
    accent: 'from-violet-500/30 to-indigo-600/30',
    url: 'https://play.famobi.com/daily-words',
    desc: 'Guess the hidden word and compare guesses with your friend.'
  },
  {
    id: 'fam-thread-fever',
    title: 'Thread Fever',
    category: 'puzzle',
    type: 'embed',
    badge: 'Color Sort',
    emoji: '🧵',
    accent: 'from-fuchsia-500/30 to-pink-600/30',
    url: 'https://play.famobi.com/thread-fever',
    desc: 'Satisfying color sorting and untangling puzzles.'
  },
  {
    id: 'htmlg-tangrams',
    title: 'Tangrams Classic',
    category: 'puzzle',
    type: 'embed',
    badge: 'Geometry',
    emoji: '📐',
    accent: 'from-amber-500/30 to-teal-600/30',
    url: 'https://cdn.htmlgames.com/Tangrams/index.html',
    desc: 'Fit geometric pieces cleanly into target silhouettes.'
  },
  {
    id: 'fam-2048',
    title: '2048 Lines',
    category: 'puzzle',
    type: 'embed',
    badge: 'Numbers',
    emoji: '🔟',
    accent: 'from-yellow-500/30 to-amber-600/30',
    url: 'https://play.famobi.com/2048',
    desc: 'Merge tiles to reach 2048 — race your partner!'
  },
  {
    id: 'fam-sudoku',
    title: 'Sudoku Classic',
    category: 'puzzle',
    type: 'embed',
    badge: 'Logic',
    emoji: '🧮',
    accent: 'from-slate-500/30 to-blue-600/30',
    url: 'https://play.famobi.com/sudoku-classic',
    desc: 'Clean Sudoku grids from easy to expert.'
  },

  // Board & Cards
  {
    id: 'fam-solitaire',
    title: 'Solitaire Klondike',
    category: 'board',
    type: 'embed',
    badge: 'Cards',
    emoji: '🃏',
    accent: 'from-emerald-600/30 to-teal-800/40',
    url: 'https://play.famobi.com/solitaire-klondike',
    desc: 'Timeless Klondike solitaire while vibing to synced radio.'
  },
  {
    id: 'fam-word-solitaire',
    title: 'Word Solitaire',
    category: 'board',
    type: 'embed',
    badge: 'Cards + Word',
    emoji: '🎴',
    accent: 'from-purple-500/30 to-indigo-700/30',
    url: 'https://play.famobi.com/word-solitaire',
    desc: 'Clever mashup of solitaire stacks and word building.'
  },
  {
    id: 'fam-chess',
    title: 'Chess Classic',
    category: 'board',
    type: 'embed',
    badge: '2P / Board',
    emoji: '♟️',
    accent: 'from-zinc-500/30 to-slate-700/40',
    url: 'https://play.famobi.com/chess-classic',
    desc: 'Classic chess with AI or local 2-player mode.'
  },
  {
    id: 'fam-checkers',
    title: 'Checkers Classic',
    category: 'board',
    type: 'embed',
    badge: '2P / Board',
    emoji: '⚫',
    accent: 'from-red-600/30 to-stone-700/40',
    url: 'https://play.famobi.com/checkers-classic',
    desc: 'Fast-paced classic checkers board.'
  },
  {
    id: 'fam-ludo',
    title: 'Ludo Hero',
    category: 'board',
    type: 'embed',
    badge: 'Board',
    emoji: '🎲',
    accent: 'from-yellow-500/30 to-red-600/30',
    url: 'https://play.famobi.com/ludo-hero',
    desc: 'Classic Indian-favorite Ludo board game.'
  },
  {
    id: 'fam-domino',
    title: 'Dominoes Classic',
    category: 'board',
    type: 'embed',
    badge: 'Board',
    emoji: '🁣',
    accent: 'from-cyan-600/30 to-indigo-800/30',
    url: 'https://play.famobi.com/dominoes-classic',
    desc: 'Strategic tile-matching dominoes.'
  },
  {
    id: 'fam-mahjong',
    title: 'Mahjong Classic',
    category: 'board',
    type: 'embed',
    badge: 'Board',
    emoji: '🀅',
    accent: 'from-emerald-500/30 to-amber-600/30',
    url: 'https://play.famobi.com/mahjong-classic',
    desc: 'Relaxing Mahjong tile matching.'
  },
  {
    id: 'fam-uno',
    title: 'Duo Cards',
    category: 'board',
    type: 'embed',
    badge: 'Cards',
    emoji: '🌈',
    accent: 'from-pink-500/30 to-amber-500/30',
    url: 'https://play.famobi.com/duo-cards',
    desc: 'UNO-style color & number card battles.'
  },
  {
    id: 'fam-backgammon',
    title: 'Backgammon Classic',
    category: 'board',
    type: 'embed',
    badge: 'Board',
    emoji: '🎯',
    accent: 'from-amber-700/30 to-orange-900/40',
    url: 'https://play.famobi.com/backgammon-classic',
    desc: 'Timeless dice & strategy board game.'
  }
];
