/* ==========================================================================
   咲野奈奈 Sana — Procedural Web Audio Engine (window.SanaAudio)
   Zero external audio assets. Works offline and via file://.
   ========================================================================== */
(function () {
  class SanaAudioEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.compressor = null;
      this.initialized = false;
      this.muted = false;
      this.dread = 0;

      // Layer 1: Sweet music-box / idol arpeggio
      this.boxFilter = null;
      this.boxGain = null;
      this.arpeggioNotes = [523.25, 659.25, 783.99, 987.77, 783.99, 659.25, 587.33, 698.46];
      this.stepIndex = 0;
      this.arpeggioTimer = null;

      // Layer 2: Beating tritone dread drone
      this.droneGain = null;
      this.droneOscs = [];

      // Layer 3: CRT static & hiss
      this.staticGain = null;
      this.staticFilter = null;

      // Layer 4: Procedural heartbeat
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
        this.master.gain.value = this.muted ? 0 : 0.34;
        this.master.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);

        this.buildMusicBoxLayer();
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

    buildMusicBoxLayer() {
      this.boxFilter = this.ctx.createBiquadFilter();
      this.boxFilter.type = "lowpass";
      this.boxFilter.frequency.value = 2800;

      this.boxGain = this.ctx.createGain();
      this.boxGain.gain.value = 0.22;

      this.boxFilter.connect(this.boxGain);
      this.boxGain.connect(this.master);

      const tick = () => {
        if (!this.initialized) return;
        const canPlay = !this.muted && this.ctx.state === "running" && this.dread < 0.62;
        if (canPlay) {
          const stutterChance = Math.max(0, (this.dread - 0.22) * 0.85);
          if (Math.random() > stutterChance) {
            this.playMusicBoxNote(this.arpeggioNotes[this.stepIndex % this.arpeggioNotes.length]);
            this.stepIndex++;
          } else {
            this.playMusicBoxNote(this.arpeggioNotes[this.stepIndex % this.arpeggioNotes.length]);
          }
        }
        const tempoMs = 340 + this.dread * 240;
        this.arpeggioTimer = setTimeout(tick, tempoMs);
      };
      tick();
    }

    playMusicBoxNote(baseFreq) {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = this.dread > 0.35 ? "triangle" : "sine";
      const warp = Math.max(0, this.dread - 0.12);
      const detuneCents = -warp * (160 + (this.stepIndex % 3) * 85);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.detune.setValueAtTime(detuneCents, now);
      if (warp > 0.15) {
        osc.detune.linearRampToValueAtTime(detuneCents - 55, now + 0.35);
      }

      g.gain.setValueAtTime(0.001, now);
      g.gain.exponentialRampToValueAtTime(0.18, now + 0.018);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      osc.connect(g);
      g.connect(this.boxFilter);
      osc.start(now);
      osc.stop(now + 0.45);
    }

    buildDroneLayer() {
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.value = 0;

      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = "lowpass";
      droneFilter.frequency.value = 185;

      this.droneGain.connect(droneFilter);
      droneFilter.connect(this.master);

      const freqs = [41.0, 42.6, 58.0];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = idx === 2 ? "sawtooth" : "sine";
        osc.frequency.value = freq;
        const g = this.ctx.createGain();
        g.gain.value = idx === 2 ? 0.15 : 0.42;
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
      this.staticFilter.frequency.value = 2200;
      this.staticFilter.Q.value = 1.5;

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
          const bpm = 58 + t * 84;
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
      thump(0, 94, strength);
      thump(0.17, 74, strength * 0.65);
    }

    applyMix() {
      if (!this.initialized) return;
      const now = this.ctx.currentTime;
      const d = this.dread;

      const boxVol = Math.max(0, 1 - Math.max(0, d - 0.15) / 0.43) * 0.24;
      this.boxGain.gain.setTargetAtTime(boxVol, now, 0.18);
      this.boxFilter.frequency.setTargetAtTime(2800 - d * 2100, now, 0.2);

      const droneVol = Math.max(0, (d - 0.26) / 0.7) * 0.44;
      this.droneGain.gain.setTargetAtTime(droneVol, now, 0.2);

      const staticVol = Math.max(0, (d - 0.45) / 0.55) * 0.19;
      this.staticGain.gain.setTargetAtTime(staticVol, now, 0.2);
      this.staticFilter.frequency.setTargetAtTime(1500 + d * 1900, now, 0.3);
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
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.34, this.ctx.currentTime, 0.08);
      return !this.muted;
    }

    isMuted() {
      return !this.initialized || this.muted || (this.ctx && this.ctx.state === "suspended");
    }

    setDread(val) {
      this.dread = Math.max(0, Math.min(1, Number(val) || 0));
      this.applyMix();
    }

    async playVoicePreview(isCreepy) {
      if (!this.ensureContext()) return;
      if (this.ctx.state === "suspended" && !this.muted) {
        await this.ctx.resume();
      }
      if (this.muted || this.ctx.state !== "running") return;
      const now = this.ctx.currentTime;
      const freqs = isCreepy ? [440, 415, 293] : [659.25, 783.99, 1046.5];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = isCreepy ? "triangle" : "sine";
        osc.frequency.setValueAtTime(f, now + idx * 0.12);
        if (isCreepy) {
          osc.detune.linearRampToValueAtTime(-160, now + idx * 0.12 + 0.28);
        }
        g.gain.setValueAtTime(0.001, now + idx * 0.12);
        g.gain.exponentialRampToValueAtTime(0.11, now + idx * 0.12 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.32);
        osc.connect(g);
        g.connect(this.master);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    }

    triggerFlicker() {
      if (!this.initialized || this.muted || this.ctx.state !== "running") return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(125, now);
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
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1174, now + 0.07);
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(311, now);
        osc.frequency.linearRampToValueAtTime(280, now + 0.22);
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

      this.master.gain.setValueAtTime(0.01, now);
      this.master.gain.setValueAtTime(0.42, now + 0.55);

      const impactTime = now + 0.55;

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

      [880, 932.3, 1318.5, 1396.9].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, impactTime);
        osc.frequency.linearRampToValueAtTime(freq * 0.93, impactTime + 1.8);
        g.gain.setValueAtTime(0.11, impactTime);
        g.gain.exponentialRampToValueAtTime(0.0001, impactTime + 2.3);
        osc.connect(g);
        g.connect(this.master);
        osc.start(impactTime);
        osc.stop(impactTime + 2.4);
      });

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
        this.master.gain.setTargetAtTime(0.34, this.ctx.currentTime, 0.2);
      }
    }
  }

  window.SanaAudio = new SanaAudioEngine();
})();
