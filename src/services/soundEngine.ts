// SoundEngine: Web Audio API sound generator and custom audio player for Focus Mode

export type AlarmSoundType = 'digital_chime' | 'zen_bell' | 'classic_beep' | 'melodic_gong' | 'custom';
export type AmbientSoundType = 'none' | 'brown_noise' | 'gentle_rain' | 'binaural_40hz';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private alarmInterval: any = null;
  private audioElement: HTMLAudioElement | null = null;
  private previewAudioElement: HTMLAudioElement | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;

  private getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Synthesize Digital Chime (Pleasant 4-note ascending chord)
  private playDigitalChimeOnce(volume: number) {
    const ctx = this.getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.3 * volume, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.3);
    });
  }

  // Synthesize Zen Bell (Calming deep gong with rich overtone)
  private playZenBellOnce(volume: number) {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;
    const partials = [
      { freq: 432, gain: 0.35, decay: 2.8 },
      { freq: 864, gain: 0.18, decay: 2.2 },
      { freq: 1296, gain: 0.08, decay: 1.6 },
      { freq: 216, gain: 0.15, decay: 3.0 },
    ];

    partials.forEach(({ freq, gain: pGain, decay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(pGain * volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay);
    });
  }

  // Synthesize Classic Beep (Clear periodic alerts)
  private playClassicBeepOnce(volume: number) {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;

    const playBeep = (startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25 * volume, startTime + 0.01);
      gain.gain.setValueAtTime(0.25 * volume, startTime + 0.12);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    };

    playBeep(now);
    playBeep(now + 0.18);
    playBeep(now + 0.36);
  }

  // Synthesize Melodic Gong
  private playMelodicGongOnce(volume: number) {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;

    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const masterGain = ctx.createGain();

    carrier.frequency.setValueAtTime(330, now);
    modulator.frequency.setValueAtTime(110, now);

    modGain.gain.setValueAtTime(250, now);
    modGain.gain.exponentialRampToValueAtTime(0.1, now + 2.0);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.3 * volume, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

    carrier.connect(masterGain);
    masterGain.connect(ctx.destination);

    modulator.start(now);
    carrier.start(now);

    modulator.stop(now + 2.5);
    carrier.stop(now + 2.5);
  }

  // Play single instance of chosen sound
  private playSoundOnce(type: AlarmSoundType, customAudioUrl?: string, volume = 0.8) {
    if (type === 'custom' && customAudioUrl) {
      const audio = new Audio(customAudioUrl);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch((err) => console.warn('Custom audio playback error:', err));
      return audio;
    }

    switch (type) {
      case 'zen_bell':
        this.playZenBellOnce(volume);
        break;
      case 'classic_beep':
        this.playClassicBeepOnce(volume);
        break;
      case 'melodic_gong':
        this.playMelodicGongOnce(volume);
        break;
      case 'digital_chime':
      default:
        this.playDigitalChimeOnce(volume);
        break;
    }
    return null;
  }

  // -------------------------------------------------------------
  // PUBLIC CONTROLS
  // -------------------------------------------------------------

  // Start continuous alarm loop (repeats until stopAlarm is called)
  startAlarm(type: AlarmSoundType, customAudioUrl?: string, volume = 0.8) {
    this.stopAlarm();

    if (type === 'custom' && customAudioUrl) {
      try {
        const audio = new Audio(customAudioUrl);
        audio.loop = true;
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.play().catch((err) => console.warn('Custom alarm loop failed:', err));
        this.audioElement = audio;
      } catch (err) {
        console.warn('Error starting custom alarm:', err);
        this.playDigitalChimeOnce(volume);
      }
      return;
    }

    // Play immediately
    this.playSoundOnce(type, customAudioUrl, volume);

    // Repeat every 2.6 seconds
    this.alarmInterval = setInterval(() => {
      this.playSoundOnce(type, customAudioUrl, volume);
    }, 2600);
  }

  // Immediately stop all alarm sounds
  stopAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }

    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {}
      this.audioElement = null;
    }

    if (this.previewAudioElement) {
      try {
        this.previewAudioElement.pause();
        this.previewAudioElement.currentTime = 0;
      } catch {}
      this.previewAudioElement = null;
    }
  }

  // Preview a sound for 2.5 seconds
  previewSound(type: AlarmSoundType, customAudioUrl?: string, volume = 0.8) {
    this.stopAlarm();

    if (type === 'custom' && customAudioUrl) {
      try {
        const audio = new Audio(customAudioUrl);
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.play().catch(() => {});
        this.previewAudioElement = audio;
        setTimeout(() => {
          if (this.previewAudioElement === audio) {
            audio.pause();
            audio.currentTime = 0;
            this.previewAudioElement = null;
          }
        }, 3500);
      } catch {}
      return;
    }

    this.playSoundOnce(type, customAudioUrl, volume);
  }

  // -------------------------------------------------------------
  // AMBIENT BACKGROUND SOUNDS (Brown noise, Rain, Binaural)
  // -------------------------------------------------------------
  startAmbient(type: AmbientSoundType, volume = 0.3) {
    this.stopAmbient();
    if (type === 'none') return;

    try {
      const ctx = this.getAudioContext();
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume * 0.4)), ctx.currentTime);
      gainNode.connect(ctx.destination);
      this.ambientGain = gainNode;

      if (type === 'binaural_40hz') {
        // Binaural beat: 200Hz left, 240Hz right (40Hz gamma frequency)
        const merger = ctx.createChannelMerger(2);

        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(200, ctx.currentTime);

        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(240, ctx.currentTime);

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(gainNode);

        oscL.start();
        oscR.start();
        this.ambientSource = merger;
      } else {
        // Synthesize filtered noise (Brown noise or Rain)
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Brown noise integration
          lastOut = (lastOut + 0.02 * white) / 1.02;
          output[i] = lastOut * 3.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        if (type === 'gentle_rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(900, ctx.currentTime);
        } else {
          // Deep brown noise
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, ctx.currentTime);
        }

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        whiteNoise.start();
        this.ambientSource = whiteNoise;
      }
    } catch (err) {
      console.warn('Ambient sound synthesis error:', err);
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        if ('stop' in this.ambientSource && typeof (this.ambientSource as any).stop === 'function') {
          (this.ambientSource as any).stop();
        }
      } catch {}
      this.ambientSource = null;
    }
    this.ambientGain = null;
  }

  // Play Danger / Error buzzer sound when distraction is detected
  playDangerAlert(volume = 0.8) {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Two dissonant low frequencies for unmistakable error alert
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(160, now);
      osc1.frequency.linearRampToValueAtTime(110, now + 0.35);

      osc2.frequency.setValueAtTime(225, now);
      osc2.frequency.linearRampToValueAtTime(155, now + 0.35);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4 * volume, now + 0.02);
      gain.gain.setValueAtTime(0.4 * volume, now + 0.25);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.warn('Danger sound failed:', e);
    }
  }
}

export const soundEngine = new SoundEngine();
