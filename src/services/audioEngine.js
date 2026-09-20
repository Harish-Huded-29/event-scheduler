/**
 * Event Scheduler — React Web Audio Tone Synthesizer Engine
 * 5 High-Quality melodic alarm chimes with looping support & live preview.
 */

export const SOUND_PRESETS = {
  golden_chime: {
    name: 'Golden Chime',
    desc: 'Soft dual bells in rich harmony',
    play: (ctx, dest, time) => {
      [587.33, 880, 1174.66, 1760].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time + idx * 0.12);
        gain.gain.setValueAtTime(0.35, time + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.12 + 1.8);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time + idx * 0.12);
        osc.stop(time + idx * 0.12 + 1.8);
      });
    }
  },
  digital_pulse: {
    name: 'Digital Pulse',
    desc: 'Modern electronic double pulse',
    play: (ctx, dest, time) => {
      [800, 1000, 1200, 1600].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time + idx * 0.08);
        gain.gain.setValueAtTime(0.4, time + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time + idx * 0.08);
        osc.stop(time + idx * 0.08 + 0.45);
      });
    }
  },
  radiant_sunrise: {
    name: 'Radiant Sunrise',
    desc: 'Warm ascending major triad chords',
    play: (ctx, dest, time) => {
      const chords = [523.25, 659.25, 783.99, 1046.50];
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time + idx * 0.18);
        gain.gain.setValueAtTime(0.3, time + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.18 + 2.2);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time + idx * 0.18);
        osc.stop(time + idx * 0.18 + 2.2);
      });
    }
  },
  cosmic_marimba: {
    name: 'Cosmic Marimba',
    desc: 'Vibrant wooden mallet tones',
    play: (ctx, dest, time) => {
      [440, 554.37, 659.25, 880, 1108.73].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time + idx * 0.1);
        gain.gain.setValueAtTime(0.45, time + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.1 + 0.8);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time + idx * 0.1);
        osc.stop(time + idx * 0.1 + 0.85);
      });
    }
  },
  zen_harmony: {
    name: 'Zen Harmony',
    desc: 'Calm Tibetan singing bowl chime',
    play: (ctx, dest, time) => {
      [432, 864, 1296].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.3 / (idx + 1), time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 2.8);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + 2.8);
      });
    }
  }
};

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.ringInterval = null;
    this.previewTimeout = null;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  playPreset(soundKey = 'golden_chime', customCtx = null) {
    const ctx = customCtx || this.getAudioContext();
    if (!ctx) return;

    const preset = SOUND_PRESETS[soundKey] || SOUND_PRESETS.golden_chime;
    try {
      preset.play(ctx, ctx.destination, ctx.currentTime);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  previewSound(soundKey = 'golden_chime') {
    this.stopPreview();
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.playPreset(soundKey, ctx);
  }

  stopPreview() {
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }
  }

  startRinging(soundKey = 'golden_chime') {
    this.stopRinging();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.playPreset(soundKey, ctx);
    this.ringInterval = setInterval(() => {
      this.playPreset(soundKey, ctx);
    }, 2800);
  }

  stopRinging() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }
}

export const audioEngine = new AudioEngine();
