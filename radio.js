// Synced Duo Radio Engine — Verified HTTPS MP3 Streams + Live 30,000+ Station Search (Radio Browser API)

export const PRESET_STATIONS = [
  {
    id: 'somafm-goa',
    name: 'Suburbs of Goa',
    genre: 'Desi Beats & Chill',
    emoji: '🪷',
    url: 'https://ice1.somafm.com/suburbsofgoa-128-mp3'
  },
  {
    id: 'somafm-groove',
    name: 'Groove Salad',
    genre: 'Lo-Fi & Downtempo',
    emoji: '🎧',
    url: 'https://ice1.somafm.com/groovesalad-128-mp3'
  },
  {
    id: 'somafm-vapor',
    name: 'Vaporwaves',
    genre: 'Synthwave & Retro',
    emoji: '🌆',
    url: 'https://ice1.somafm.com/vaporwaves-128-mp3'
  },
  {
    id: 'somafm-beat',
    name: 'Beat Blender',
    genre: 'Deep House & Chill',
    emoji: '🪩',
    url: 'https://ice1.somafm.com/beatblender-128-mp3'
  },
  {
    id: 'somafm-indie',
    name: 'Indie Pop Rocks',
    genre: 'Indie & Pop',
    emoji: '🎸',
    url: 'https://ice1.somafm.com/indiepop-128-mp3'
  },
  {
    id: 'somafm-lush',
    name: 'Lush Vocals',
    genre: 'Mellow & Dreamy',
    emoji: '🌙',
    url: 'https://ice1.somafm.com/lush-128-mp3'
  },
  {
    id: 'somafm-poptron',
    name: 'PopTron!',
    genre: 'Electropop Gaming',
    emoji: '⚡',
    url: 'https://ice1.somafm.com/poptron-128-mp3'
  },
  {
    id: 'somafm-defcon',
    name: 'DEF CON Radio',
    genre: 'Cyberpunk Hacker Beats',
    emoji: '👾',
    url: 'https://ice1.somafm.com/defcon-128-mp3'
  }
];

export class SyncedRadio {
  constructor(callbacks = {}) {
    this.cb = callbacks;
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'none';
    this.audio.volume = 0.55;
    this.currentStation = PRESET_STATIONS[0];
    this.isPlaying = false;
    this.autoplayBlocked = false;

    this.audio.addEventListener('playing', () => {
      this.isPlaying = true;
      this.autoplayBlocked = false;
      this.cb.onStateChange?.(this.getState());
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.cb.onStateChange?.(this.getState());
    });

    this.audio.addEventListener('error', () => {
      this.isPlaying = false;
      this.cb.onError?.(`Stream "${this.currentStation.name}" load nahi hua — koi dusra station try karo.`);
      this.cb.onStateChange?.(this.getState());
    });
  }

  getState() {
    return {
      station: this.currentStation,
      isPlaying: this.isPlaying,
      volume: this.audio.volume,
      autoplayBlocked: this.autoplayBlocked
    };
  }

  async playStation(station, broadcast = true) {
    this.currentStation = station;
    this.audio.src = station.url;
    try {
      await this.audio.play();
      this.isPlaying = true;
      this.autoplayBlocked = false;
    } catch (_) {
      this.autoplayBlocked = true;
      this.isPlaying = false;
    }
    this.cb.onStateChange?.(this.getState());
    if (broadcast) {
      this.cb.onSyncBroadcast?.({
        type: 'radio_sync',
        action: 'play',
        station: this.currentStation
      });
    }
  }

  pause(broadcast = true) {
    this.audio.pause();
    this.isPlaying = false;
    this.autoplayBlocked = false;
    this.cb.onStateChange?.(this.getState());
    if (broadcast) {
      this.cb.onSyncBroadcast?.({
        type: 'radio_sync',
        action: 'pause',
        station: this.currentStation
      });
    }
  }

  async togglePlay() {
    if (this.isPlaying) {
      this.pause(true);
    } else {
      await this.playStation(this.currentStation, true);
    }
  }

  async unlockAutoplay() {
    if (!this.currentStation) return;
    await this.playStation(this.currentStation, false);
  }

  setVolume(val) {
    this.audio.volume = Math.min(1, Math.max(0, Number(val)));
    this.cb.onStateChange?.(this.getState());
  }

  async handleRemoteSync(msg) {
    if (!msg || !msg.station) return;
    if (msg.action === 'play') {
      await this.playStation(msg.station, false);
    } else if (msg.action === 'pause') {
      this.currentStation = msg.station;
      this.pause(false);
    }
  }

  // Live search 30,000+ global / Bollywood / Hindi / Lo-Fi stations via open Radio Browser API
  async searchGlobalStations(query) {
    const q = encodeURIComponent(query.trim());
    if (!q) return [];
    const endpoints = [
      `https://de1.api.radio-browser.info/json/stations/search?name=${q}&limit=16&hidebroken=true&order=clickcount&reverse=true&is_https=true`,
      `https://at1.api.radio-browser.info/json/stations/search?name=${q}&limit=16&hidebroken=true&order=clickcount&reverse=true&is_https=true`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const rows = await res.json();
        return rows
          .filter((r) => r.url_resolved && r.url_resolved.startsWith('https://'))
          .slice(0, 12)
          .map((r) => ({
            id: 'rb-' + r.stationuuid,
            name: (r.name || 'Live Radio').trim().slice(0, 34),
            genre: (r.tags || r.country || 'Live FM').split(',').slice(0, 2).join(' · ') || 'Live FM',
            emoji: '📻',
            url: r.url_resolved
          }));
      } catch (_) {
        // try fallback mirror
      }
    }
    return [];
  }
}
