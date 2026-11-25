/* ==========================================================================
   Solace™ 栖境 — Procedural Web Audio Horror Engine (window.SolaceAudio)
   Zero external audio assets. Works offline and via file://.
   ========================================================================== */
(function () {
  class SolaceAudioEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.compressor = null;
      this.initialized = false;
      this.muted = false;
      this.dread = 0;

      // Layer 1: Warm wellness chord + soft rain
      this.padGain = null;
      this.padFilter = null;
      this.padOscs = [];
      this.padBaseFreqs = [261.63, 329.63, 392.0, 493.88, 587.33]; // Cmaj9
      this.padDetuneRatios = [-1.0, -1.6, -0.7, -2.2, -1.3];
      this.rainGain = null;

      // Layer 2: Sub-bass dread drone
      this.droneGain = null;
      this.droneOscs = [];

      // Layer 3: Static & whisper hiss
      this.staticGain = null;
      this.staticFilter = null;

      // Layer 4: Procedural heartbeat timer
      this.heartbeatTimer = null;
      this.lastBeatAt = 0;
    }

    ensureContext() {
      if (this.initialized) return true;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;

      try {
        this.ctx = new AudioCtx();
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -16;
        this.compressor.ratio.value = 6;

        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.36;
        this.master.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);

        this.buildPadLayer();
        this.buildDroneLayer();
        this.buildStaticLayer();
        this.startHeartbeatLoop();

        this.initialized = true;
        this.applyMix();
        return true;
      } catch (err) {
        return false;
      }
    }

    createNoiseBuffer(seconds = 3) {
      const rate = this.ctx.sampleRate;
      const length = rate * seconds;
      const buf = this.ctx.createBuffer(1, length, rate);
      const data = buf.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.099046;
        b1 = 0.963 * b1 + white * 0.2965164;
        b2 = 0.57 * b2 + white * 1.0526913;
        data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.14;
      }
      return buf;
    }

    buildPadLayer() {
      this.padFilter = this.ctx.createBiquadFilter();
      this.padFilter.type = "lowpass";
      this.padFilter.frequency.value = 920;

      this.padGain = this.ctx.createGain();
      this.padGain.gain.value = 0.24;

      this.padFilter.connect(this.padGain);
      this.padGain.connect(this.master);

      this.padBaseFreqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.value = freq;
        const g = this.ctx.createGain();
        g.gain.value = 0.14 / (1 + idx * 0.2);
        osc.connect(g);
        g.connect(this.padFilter);
        osc.start();
        this.padOscs.push(osc);
      });

      const noiseSrc = this.ctx.createBufferSource();
      noiseSrc.buffer = this.createNoiseBuffer(3);
      noiseSrc.loop = true;

      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = "bandpass";
      rainFilter.frequency.value = 1100;
      rainFilter.Q.value = 0.5;

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.value = 0.1;

      noiseSrc.connect(rainFilter);
      rainFilter.connect(this.rainGain);
      this.rainGain.connect(this.master);
      noiseSrc.start();
    }

    buildDroneLayer() {
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.value = 0;

      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = "lowpass";
      droneFilter.frequency.value = 180;

      this.droneGain.connect(droneFilter);
      droneFilter.connect(this.master);

      const freqs = [42.0, 43.4, 59.4]; // Beating sub + tritone
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = idx === 2 ? "sawtooth" : "sine";
        osc.frequency.value = freq;
        const g = this.ctx.createGain();
        g.gain.value = idx === 2 ? 0.16 : 0.42;
        osc.connect(g);
        g.connect(this.droneGain);
        osc.start();
        this.droneOscs.push(osc);
      });
    }

    buildStaticLayer() {
      const noiseSrc = this.ctx.createBufferSource();
      noiseSrc.buffer = this.createNoiseBuffer(3);
      noiseSrc.loop = true;

      this.staticFilter = this.ctx.createBiquadFilter();
      this.staticFilter.type = "bandpass";
      this.staticFilter.frequency.value = 2400;
      this.staticFilter.Q.value = 1.6;

      this.staticGain = this.ctx.createGain();
      this.staticGain.gain.value = 0;

      noiseSrc.connect(this.staticFilter);
      this.staticFilter.connect(this.staticGain);
      this.staticGain.connect(this.master);
      noiseSrc.start();
    }

    startHeartbeatLoop() {
      const tick = () => {
        if (!this.initialized) return;
        const now = performance.now();
        if (!this.muted && this.ctx.state === "running" && this.dread >= 0.48 && this.dread <= 0.995) {
          const t = Math.min(1, Math.max(0, (this.dread - 0.48) / 0.5));
          const bpm = 54 + t * 82;
          const intervalMs = 60000 / bpm;
          if (now - this.lastBeatAt >= intervalMs) {
            this.lastBeatAt = now;
            this.playHeartbeat(0.18 + t * 0.28);
          }
        }
        this.heartbeatTimer = setTimeout(tick, 90);
      };
      tick();
    }

    playHeartbeat(strength) {
      if (!this.initialized || this.muted) return;
      const t = this.ctx.currentTime;
      const thump = (offset, peakFreq, vol) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(peakFreq, t + offset);
        osc.frequency.exponentialRampToValueAtTime(32, t + offset + 0.16);
        g.gain.setValueAtTime(0.001, t + offset);
        g.gain.exponentialRampToValueAtTime(vol, t + offset + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.22);
        osc.connect(g);
        g.connect(this.master);
        osc.start(t + offset);
        osc.stop(t + offset + 0.24);
      };
      thump(0, 92, strength);
      thump(0.17, 74, strength * 0.65);
    }

    applyMix() {
      if (!this.initialized) return;
      const now = this.ctx.currentTime;
      const d = this.dread;

      // Pad fades out between dread 0.20 -> 0.58 and detunes sickeningly
      const padVol = Math.max(0, 1 - Math.max(0, d - 0.14) / 0.44) * 0.26;
      const rainVol = Math.max(0, 1 - Math.max(0, d - 0.18) / 0.4) * 0.12;
      this.padGain.gain.setTargetAtTime(padVol, now, 0.18);
      this.rainGain.gain.setTargetAtTime(rainVol, now, 0.18);
      this.padFilter.frequency.setTargetAtTime(940 - d * 680, now, 0.2);

      const warp = Math.max(0, d - 0.12);
      this.padOscs.forEach((osc, i) => {
        const detuneCents = warp * this.padDetuneRatios[i] * 140;
        osc.detune.setTargetAtTime(detuneCents, now, 0.25);
      });

      // Drone fades in between dread 0.24 -> 0.95
      const droneVol = Math.max(0, (d - 0.24) / 0.76) * 0.42;
      this.droneGain.gain.setTargetAtTime(droneVol, now, 0.2);

      // Static hiss fades in between dread 0.48 -> 1.0
      const staticVol = Math.max(0, (d - 0.48) / 0.52) * 0.18;
      this.staticGain.gain.setTargetAtTime(staticVol, now, 0.2);
      this.staticFilter.frequency.setTargetAtTime(1600 + d * 1800, now, 0.3);
    }

    async initAndToggle() {
      const ok = this.ensureContext();
      if (!ok) return false;
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
        this.muted = false;
      } else {
        this.muted = !this.muted;
      }
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.36, this.ctx.currentTime, 0.08);
      return !this.muted;
    }

    async unlockIfIdle() {
      const ok = this.ensureContext();
      if (!ok) return false;
      if (this.ctx.state === "suspended" && !this.muted) {
        try {
          await this.ctx.resume();
        } catch (err) {
          return false;
        }
      }
      return !this.muted && this.ctx.state === "running";
    }

    setMuted(flag) {
      this.muted = !!flag;
      if (this.initialized) {
        this.master.gain.setTargetAtTime(this.muted ? 0 : 0.36, this.ctx.currentTime, 0.08);
      }
    }

    isMuted() {
      return !this.initialized || this.muted || (this.ctx && this.ctx.state === "suspended");
    }

    setDread(val) {
      this.dread = Math.max(0, Math.min(1, Number(val) || 0));
      this.applyMix();
    }

    triggerFlicker() {
      if (!this.initialized || this.muted || this.ctx.state !== "running") return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      osc.connect(g);
      g.connect(this.master);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    triggerMessagePing(isCreepy) {
      if (!this.initialized || this.muted || this.ctx.state !== "running") return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      if (!isCreepy) {
        osc.type = "sine";
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(311, now);
        osc.frequency.linearRampToValueAtTime(293, now + 0.18);
        g.gain.setValueAtTime(0.11, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      }
      osc.connect(g);
      g.connect(this.master);
      osc.start(now);
      osc.stop(now + 0.48);
    }

    triggerClimaxStinger() {
      if (!this.initialized || this.muted || this.ctx.state !== "running") return;
      const now = this.ctx.currentTime;

      // Brief dead-air drop before the slam
      this.master.gain.setValueAtTime(0.01, now);
      this.master.gain.setValueAtTime(0.42, now + 0.55);

      const impactTime = now + 0.55;

      // Sub-bass impact slam
      const sub = this.ctx.createOscillator();
      const subG = this.ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(115, impactTime);
      sub.frequency.exponentialRampToValueAtTime(26, impactTime + 1.4);
      subG.gain.setValueAtTime(0.75, impactTime);
      subG.gain.exponentialRampToValueAtTime(0.001, impactTime + 2.1);
      sub.connect(subG);
      subG.connect(this.master);
      sub.start(impactTime);
      sub.stop(impactTime + 2.2);

      // Dissonant metallic screech cluster
      [880, 932.3, 1318.5, 1396.9].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, impactTime);
        osc.frequency.linearRampToValueAtTime(freq * 0.94, impactTime + 1.8);
        g.gain.setValueAtTime(0.12, impactTime);
        g.gain.exponentialRampToValueAtTime(0.0001, impactTime + 2.3);
        osc.connect(g);
        g.connect(this.master);
        osc.start(impactTime);
        osc.stop(impactTime + 2.4);
      });

      // Burst of static
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(2);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.45, impactTime);
      nGain.gain.exponentialRampToValueAtTime(0.02, impactTime + 2.2);
      noise.connect(nGain);
      nGain.connect(this.master);
      noise.start(impactTime);
      noise.stop(impactTime + 2.3);
    }

    resetToCalm() {
      this.dread = 0;
      this.applyMix();
      if (this.initialized && !this.muted) {
        this.master.gain.setTargetAtTime(0.36, this.ctx.currentTime, 0.2);
      }
    }
  }

  window.SolaceAudio = new SolaceAudioEngine();
})();
