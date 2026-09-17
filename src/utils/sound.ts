// Web Audio API Synthesizer & Speech Synthesis for Class of Champions sound effects

export function formatPointsToIndonesian(pts: number): string {
  if (pts <= 0) return 'nol';
  if (pts === 50) return 'lima puluh';
  if (pts === 100) return 'seratus';
  if (pts === 150) return 'seratus lima puluh';
  if (pts === 200) return 'dua ratus';
  if (pts === 250) return 'dua ratus lima puluh';
  if (pts === 300) return 'tiga ratus';
  if (pts === 350) return 'tiga ratus lima puluh';
  if (pts === 400) return 'empat ratus';
  if (pts === 500) return 'lima ratus';
  if (pts === 1000) return 'seribu';

  const hundreds = Math.floor(pts / 100);
  const remainder = pts % 100;
  const unitNames = [
    '',
    'seratus',
    'dua ratus',
    'tiga ratus',
    'empat ratus',
    'lima ratus',
    'enam ratus',
    'tujuh ratus',
    'delapan ratus',
    'sembilan ratus',
  ];
  if (hundreds >= 1 && hundreds <= 9 && remainder === 0) {
    return unitNames[hundreds];
  }
  return pts.toString();
}

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Click or select sound
  playClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Timer Tick
  playTick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  // Buzzer / Time's up
  playBuzzer() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.4);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  // Voice Cheer "Hore!" using SpeechSynthesis API
  private speakCheer(phrase: string = 'Horeee! Mantap!') {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'id-ID';
      utterance.rate = 1.15; // enthusiastic energetic tempo
      utterance.pitch = 1.35; // high cheerful pitch
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  // Voice Say Wrong using SpeechSynthesis API
  private speakWrong(phrase: string = 'Yah, jawaban belum tepat!') {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'id-ID';
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      utterance.volume = 0.75;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  // Synthesize crowd clapping / cheering noise
  private playCheerNoise(duration: number = 1.0) {
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate bursty noise simulating crowd cheering & claps
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        const envelope = Math.sin((i / bufferSize) * Math.PI);
        const clapModulation = Math.sin((i / 800) * Math.PI) > 0.3 ? 1.2 : 0.6;
        data[i] = white * envelope * clapModulation * 0.15;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 1.5;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {}
  }

  // Correct answer fanfare with points speech and coin arpeggio
  playCorrect(points?: number) {
    if (!this.enabled) return;
    this.initCtx();

    // 1. Spoken feedback: "Horeee! Jawaban benar! Point bertambah 100" (or 200, 300, etc.)
    const pts = points && points > 0 ? points : 100;
    const ptsWord = formatPointsToIndonesian(pts);
    const spokenCheer = `Horeee! Jawaban benar! Point bertambah ${ptsWord}!`;
    this.speakCheer(spokenCheer);

    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 2. Play acoustic rising point/coin pickup chime effect
      // 100 pts -> 1 bright ding chime; 200 pts -> 2 rising dings; 300 pts -> 3 rising dings
      const dingCount = pts >= 300 ? 3 : pts >= 200 ? 2 : 1;
      for (let i = 0; i < dingCount; i++) {
        const dingOsc = this.ctx.createOscillator();
        const dingGain = this.ctx.createGain();
        dingOsc.type = 'sine';
        // Base frequency 1046.5Hz (C6), stepping up
        const freq = 1046.5 * Math.pow(1.22, i);
        dingOsc.frequency.setValueAtTime(freq, now + i * 0.1);
        dingGain.gain.setValueAtTime(0.28, now + i * 0.1);
        dingGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.18);

        dingOsc.connect(dingGain);
        dingGain.connect(this.ctx.destination);
        dingOsc.start(now + i * 0.1);
        dingOsc.stop(now + i * 0.1 + 0.2);
      }

      // 3. Play crowd cheer noise in background
      this.playCheerNoise(1.3);

      // 4. Bright triumphant fanfare chord arpeggio scaled with points
      const pitchMultiplier = pts >= 300 ? 1.25 : pts >= 200 ? 1.12 : 1.0;
      const notes = [
        { f: 523.25 * pitchMultiplier, t: 0.08, d: 0.18 }, // C5
        { f: 659.25 * pitchMultiplier, t: 0.16, d: 0.18 }, // E5
        { f: 783.99 * pitchMultiplier, t: 0.24, d: 0.18 }, // G5
        { f: 1046.5 * pitchMultiplier, t: 0.32, d: 0.3 },  // C6
        { f: 1318.51 * pitchMultiplier, t: 0.40, d: 0.35 },// E6
        { f: 1567.98 * pitchMultiplier, t: 0.48, d: 0.6 }, // G6 High Celebration!
      ];

      notes.forEach(({ f, t, d }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.26, now + t);
        gain.gain.exponentialRampToValueAtTime(0.01, now + t + d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + d + 0.05);
      });

      // Shimmering high sparkle bell
      const sparkleOsc = this.ctx.createOscillator();
      const sparkleGain = this.ctx.createGain();
      sparkleOsc.type = 'sine';
      sparkleOsc.frequency.setValueAtTime(2093 * pitchMultiplier, now + 0.45);
      sparkleOsc.frequency.exponentialRampToValueAtTime(3135 * pitchMultiplier, now + 0.95);
      sparkleGain.gain.setValueAtTime(0.18, now + 0.45);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

      sparkleOsc.connect(sparkleGain);
      sparkleGain.connect(this.ctx.destination);
      sparkleOsc.start(now + 0.45);
      sparkleOsc.stop(now + 1.2);
    } catch {}
  }

  // Wrong answer tone: Dramatic game-show buzzer + comical descending "wah-wah" + speech
  playWrong() {
    if (!this.enabled) return;
    this.initCtx();

    // 1. Spoken feedback
    this.speakWrong('Yah, salah!');

    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Dissonant dual-tone buzzer
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      // Harsh dissonant frequencies
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.linearRampToValueAtTime(160, now + 0.25);

      osc2.frequency.setValueAtTime(233, now); // Minor second dissonance
      osc2.frequency.linearRampToValueAtTime(169, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.36);
      osc2.stop(now + 0.36);

      // Descending comical "wah-wah" slide
      const wahOsc = this.ctx.createOscillator();
      const wahGain = this.ctx.createGain();
      wahOsc.type = 'triangle';
      wahOsc.frequency.setValueAtTime(180, now + 0.35);
      wahOsc.frequency.exponentialRampToValueAtTime(80, now + 0.75);

      wahGain.gain.setValueAtTime(0.2, now + 0.35);
      wahGain.gain.linearRampToValueAtTime(0.01, now + 0.78);

      wahOsc.connect(wahGain);
      wahGain.connect(this.ctx.destination);

      wahOsc.start(now + 0.35);
      wahOsc.stop(now + 0.8);
    } catch {}
  }

  // Card flip / open question sound
  playCardOpen() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  // Victory fanfare
  playVictory() {
    if (!this.enabled) return;
    this.initCtx();
    this.speakCheer('Selamat kepada para juara Class of Champions!');
    if (!this.ctx) return;

    try {
      this.playCheerNoise(2.0);
      const notes = [
        { f: 523.25, d: 0.15 },
        { f: 659.25, d: 0.15 },
        { f: 783.99, d: 0.15 },
        { f: 1046.5, d: 0.5 },
        { f: 880.0, d: 0.2 },
        { f: 1046.5, d: 0.7 },
      ];
      let t = this.ctx.currentTime;
      notes.forEach(({ f, d }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + d);
        t += d * 0.85;
      });
    } catch {}
  }

  // Reset sound effect
  playReset() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.35);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }
}

export const sound = new SoundManager();
