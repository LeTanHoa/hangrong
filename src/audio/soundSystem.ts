/**
 * High-quality procedural Web Audio API sound & music synthesizer
 * Authentic Vietnamese Street Vibe: Folk Pentatonic, Lofi Acoustic & Chill Melodies.
 * Zero external dependencies or broken MP3 URLs!
 */

export interface BgmTrack {
  id: string;
  name: string;
  desc: string;
}

export const BGM_TRACKS: BgmTrack[] = [
  {
    id: 'saigon_chill',
    name: 'Sài Gòn Phố Chiều',
    desc: 'Ngũ cung Đàn Tranh & Lofi Acoustic êm dịu vỉa hè',
  },
  {
    id: 'pho_nhon_nhip',
    name: 'Phố Xá Nhộn Nhịp',
    desc: 'Giai điệu vui tươi, rộn ràng tiếng rao hàng rong',
  },
  {
    id: 'dem_sai_gon',
    name: 'Đêm Sài Gòn Chill',
    desc: 'Lofi Rhodes Jazz ấm cúng bên quán nước dưới đèn vàng',
  },
];

class SoundSystem {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = true;
  private soundVolume = 0.7;
  private musicVolume = 0.35;
  private bgmInterval: number | null = null;
  private currentTrackIndex = 0;
  private beatStep = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public get currentTrack(): BgmTrack {
    return BGM_TRACKS[this.currentTrackIndex] || BGM_TRACKS[0];
  }

  public nextTrack(): BgmTrack {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % BGM_TRACKS.length;
    this.beatStep = 0;
    if (this.musicEnabled) {
      this.stopBgm();
      this.startBgm();
    }
    return this.currentTrack;
  }

  public setTrack(trackId: string): BgmTrack {
    const idx = BGM_TRACKS.findIndex((t) => t.id === trackId);
    if (idx !== -1) {
      this.currentTrackIndex = idx;
      this.beatStep = 0;
      if (this.musicEnabled) {
        this.stopBgm();
        this.startBgm();
      }
    }
    return this.currentTrack;
  }

  private initContext() {
    if (typeof window === 'undefined') return;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSettings(sound: boolean, music: boolean, sVol = 0.7, mVol = 0.35) {
    this.soundEnabled = sound;
    this.musicEnabled = music;
    this.soundVolume = sVol;
    this.musicVolume = mVol;

    if (!this.musicEnabled) {
      this.stopBgm();
    } else if (this.musicEnabled && !this.bgmInterval) {
      this.startBgm();
    }
  }

  // =================== SFX (HIỆU ỨNG ÂM THANH) ===================

  public playClick() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.25 * this.soundVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playCash() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.35 * this.soundVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  public playBell() {
    // Đã loại bỏ tiếng chuông theo yêu cầu: chỉ giữ lại mỗi tiếng nhạc nền
    return;
  }

  public playAlert() {
    // Đã loại bỏ chuông cảnh báo âm lượng cao
    return;
  }

  public playChop() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.5 * this.soundVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playSizzle() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.7));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3 * this.soundVolume, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  public playCheer() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25 * this.soundVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  public playAngry() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.2 * this.soundVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playLevelUp() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3 * this.soundVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.55);
    });
  }

  // =================== ADVANCED BGM COMPOSER ENGINE ===================

  /** Play a warm filtered chord pad */
  private playChord(frequencies: number[], duration: number, gainLevel = 0.04) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    frequencies.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainLevel * this.musicVolume, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    });
  }

  /** Play an expressive lead melody note with warm vibrato */
  private playLeadNote(frequency: number, duration: number, isVibrato = true) {
    if (!this.ctx || frequency <= 0) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    // Warm Dan Tranh / Flute vibrato
    if (isVibrato) {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(5.5, now);
      lfoGain.gain.setValueAtTime(2.5, now);
      lfo.connect(osc.frequency);
      lfo.start(now + 0.15);
      lfo.stop(now + duration);
    }

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09 * this.musicVolume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  /** Play a warm sub bass note */
  private playBass(frequency: number, duration: number) {
    if (!this.ctx || frequency <= 0) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12 * this.musicVolume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  public startBgm() {
    if (typeof window === 'undefined' || this.bgmInterval) return;
    this.initContext();

    // 16-step musical sequences for 3 distinct authentic tracks
    // TRACK 1: "Sài Gòn Phố Chiều" (Vietnamese Folk Pentatonic & Lofi Street)
    // Am7 -> Fmaj7 -> C -> G
    const track1Chords = [
      [220, 261.63, 329.63, 440], // Am (steps 0..3)
      [174.61, 261.63, 329.63, 440], // Fmaj7 (steps 4..7)
      [130.81, 196.0, 261.63, 329.63], // C (steps 8..11)
      [196.0, 246.94, 293.66, 392.0], // G (steps 12..15)
    ];
    const track1Basses = [110.0, 87.31, 65.41, 98.0];
    const track1Melody = [
      659.25, 587.33, 523.25, 440.0, // E5, D5, C5, A4
      392.0, 440.0, 523.25, 587.33, // G4, A4, C5, D5
      659.25, 783.99, 659.25, 587.33, // E5, G5, E5, D5
      523.25, 587.33, 440.0, 0, // C5, D5, A4, rest
    ];

    // TRACK 2: "Phố Xá Nhộn Nhịp" (Breezy Folk Street Acoustic)
    // C -> G -> Am -> F (Vui tươi, rộn rã)
    const track2Chords = [
      [130.81, 261.63, 329.63, 392.0], // C
      [196.0, 246.94, 293.66, 392.0], // G
      [220.0, 261.63, 329.63, 440.0], // Am
      [174.61, 261.63, 349.23, 440.0], // F
    ];
    const track2Basses = [130.81, 98.0, 110.0, 87.31];
    const track2Melody = [
      523.25, 659.25, 783.99, 659.25, // C5, E5, G5, E5
      587.33, 493.88, 392.0, 493.88, // D5, B4, G4, B4
      440.0, 523.25, 659.25, 523.25, // A4, C5, E5, C5
      698.46, 659.25, 587.33, 523.25, // F5, E5, D5, C5
    ];

    // TRACK 3: "Đêm Sài Gòn Chill" (Late Night Rhodes & Jazz Street)
    // Dm7 -> G7 -> Cmaj7 -> A7 (Ấm cúng, thư thái)
    const track3Chords = [
      [146.83, 220.0, 261.63, 349.23], // Dm7
      [196.0, 246.94, 293.66, 349.23], // G7
      [130.81, 246.94, 261.63, 329.63], // Cmaj7
      [220.0, 277.18, 329.63, 392.0], // A7
    ];
    const track3Basses = [73.42, 98.0, 65.41, 110.0];
    const track3Melody = [
      587.33, 0, 523.25, 440.0, // D5, rest, C5, A4
      392.0, 440.0, 493.88, 0, // G4, A4, B4, rest
      523.25, 659.25, 587.33, 523.25, // C5, E5, D5, C5
      440.0, 0, 392.0, 440.0, // A4, rest, G4, A4
    ];

    // Beat step interval: 680ms per beat (~88 BPM)
    this.bgmInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;

      const track = this.currentTrackIndex;
      const step = this.beatStep % 16;
      const bar = Math.floor(step / 4);
      const isDownbeat = step % 4 === 0;

      let chords = track1Chords;
      let basses = track1Basses;
      let melody = track1Melody;

      if (track === 1) {
        chords = track2Chords;
        basses = track2Basses;
        melody = track2Melody;
      } else if (track === 2) {
        chords = track3Chords;
        basses = track3Basses;
        melody = track3Melody;
      }

      // 1. Play warm harmonic pad on every chord change (every 4 steps)
      if (isDownbeat) {
        this.playChord(chords[bar], 2.8, 0.04);
        this.playBass(basses[bar], 2.2);
      }

      // 2. Play lead melody note
      const melNote = melody[step];
      if (melNote > 0) {
        this.playLeadNote(melNote, 0.65, true);
      }

      this.beatStep++;
    }, 680);
  }

  public stopBgm() {
    if (typeof window !== 'undefined' && this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const sounds = new SoundSystem();
