/* ==========================================================================
   咲野奈奈 Sana — Asset Manifest & Canvas Renderers
   ========================================================================== */

window.SANA_ASSETS = {
  heroIdol: "assets/sana-hero-idol.jpg",
  streamNormal: "assets/sana-stream-normal.jpg",
  stickerCute: "assets/sana-sticker-cute.jpg",
  streamYandere: "assets/sana-stream-yandere.jpg",
  closeObsession: "assets/sana-close-obsession.jpg",
  climaxHorror: "assets/sana-climax-horror.jpg",
  stickerCrazy: "assets/sana-sticker-crazy.jpg"
};

(function () {
  class SanaCanvasScenes {
    constructor() {
      this.loadedImages = {};

      this.grainCanvas = null;
      this.grainCtx = null;
      this.noiseOff = document.createElement("canvas");
      this.noiseOff.width = 160;
      this.noiseOff.height = 90;
      this.noiseOffCtx = this.noiseOff.getContext("2d");

      this.streamCanvas = null;
      this.streamCtx = null;
      this.streamProgress = 0;

      this.corridorCanvas = null;
      this.corridorCtx = null;
      this.corridorProgress = 0;
      this.lastCorridorStep = -1;
      this.flickerTimer = 0;
      this.particles = Array.from({ length: 34 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.7 + Math.random() * 1.9,
        speed: 0.02 + Math.random() * 0.05
      }));

      this.climaxCanvas = null;
      this.climaxCtx = null;
      this.climaxActive = false;
      this.climaxStart = 0;

      this.dread = 0;
      this.mouseNorm = { x: 0.5, y: 0.5 };
      this.lastGrainDraw = 0;
      this.onFlicker = null;
      this.rafId = null;
    }

    preloadAssets() {
      const manifest = window.SANA_ASSETS || {};
      Object.keys(manifest).forEach((key) => {
        const src = manifest[key];
        if (!src) return;
        const img = new Image();
        img.onload = () => {
          this.loadedImages[key] = img;
        };
        img.src = src;
      });
    }

    getLoadedImage(key) {
      const img = this.loadedImages[key];
      return img && img.complete && img.naturalWidth > 0 ? img : null;
    }

    init(options = {}) {
      this.onFlicker = options.onFlicker || null;
      this.preloadAssets();

      this.grainCanvas = document.getElementById("grain-canvas");
      this.streamCanvas = document.getElementById("stream-canvas");
      this.corridorCanvas = document.getElementById("corridor-canvas");
      this.climaxCanvas = document.getElementById("climax-canvas");

      if (this.grainCanvas) this.grainCtx = this.grainCanvas.getContext("2d");
      if (this.streamCanvas) this.streamCtx = this.streamCanvas.getContext("2d");
      if (this.corridorCanvas) this.corridorCtx = this.corridorCanvas.getContext("2d");
      if (this.climaxCanvas) this.climaxCtx = this.climaxCanvas.getContext("2d");

      this.resizeAll();
      window.addEventListener("resize", () => this.resizeAll());

      const loop = (now) => {
        this.render(now);
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }

    resizeCanvas(canvas, maxDpr = 2) {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor((rect.width || window.innerWidth) * dpr));
      const h = Math.max(1, Math.floor((rect.height || window.innerHeight) * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    resizeAll() {
      this.resizeCanvas(this.grainCanvas, 1);
      this.resizeCanvas(this.streamCanvas, 1.5);
      this.resizeCanvas(this.corridorCanvas, 1.75);
      this.resizeCanvas(this.climaxCanvas, 1.75);
    }

    setState({ dread, streamProgress, corridorProgress, mouseNorm }) {
      if (typeof dread === "number") this.dread = dread;
      if (typeof streamProgress === "number") this.streamProgress = streamProgress;
      if (typeof corridorProgress === "number") {
        this.corridorProgress = corridorProgress;
        const step = Math.min(4, Math.floor(corridorProgress * 5));
        if (step !== this.lastCorridorStep && corridorProgress > 0.02 && corridorProgress < 0.99) {
          this.lastCorridorStep = step;
          this.flickerTimer = 14;
          if (this.onFlicker) this.onFlicker();
        }
      }
      if (mouseNorm) this.mouseNorm = mouseNorm;
    }

    startClimax() {
      this.climaxActive = true;
      this.climaxStart = performance.now();
      this.resizeCanvas(this.climaxCanvas, 1.75);
    }

    stopClimax() {
      this.climaxActive = false;
      this.lastCorridorStep = -1;
      if (this.climaxCtx && this.climaxCanvas) {
        this.climaxCtx.clearRect(0, 0, this.climaxCanvas.width, this.climaxCanvas.height);
      }
    }

    drawCoverImage(ctx, img, x, y, w, h) {
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const boxRatio = w / h;
      let sx = 0;
      let sy = 0;
      let sw = img.naturalWidth;
      let sh = img.naturalHeight;
      if (imgRatio > boxRatio) {
        sw = sh * boxRatio;
        sx = (img.naturalWidth - sw) * 0.5;
      } else {
        sh = sw / boxRatio;
        sy = (img.naturalHeight - sh) * 0.35;
      }
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    }

    drawPlaceholderBox(ctx, x, y, w, h, bgColor, borderColor, labelText) {
      ctx.save();
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(x + 10, y + 10, Math.max(10, w - 20), Math.max(10, h - 20));
      ctx.setLineDash([]);

      const fontSize = Math.max(13, Math.min(20, Math.floor(w * 0.026)));
      ctx.font = `600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.fillStyle = "rgba(249, 168, 212, 0.88)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labelText, x + w * 0.5, y + h * 0.5);
      ctx.restore();
    }

    render(now) {
      if (this.dread > 0.14 && now - this.lastGrainDraw > 52) {
        this.lastGrainDraw = now;
        this.drawGrain();
      }
      this.drawStream(now);
      this.drawCorridor(now);
      if (this.climaxActive) {
        this.drawClimax(now);
      }
    }

    drawGrain() {
      if (!this.grainCtx || !this.grainCanvas) return;
      const w = this.noiseOff.width;
      const h = this.noiseOff.height;
      const img = this.noiseOffCtx.createImageData(w, h);
      const data = img.data;
      const alpha = Math.floor(Math.min(1, this.dread) * 90);
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = alpha;
      }
      this.noiseOffCtx.putImageData(img, 0, 0);

      const cw = this.grainCanvas.width;
      const ch = this.grainCanvas.height;
      this.grainCtx.clearRect(0, 0, cw, ch);
      this.grainCtx.drawImage(this.noiseOff, 0, 0, cw, ch);
    }

    drawStream(now) {
      if (!this.streamCtx || !this.streamCanvas) return;
      const ctx = this.streamCtx;
      const w = this.streamCanvas.width;
      const h = this.streamCanvas.height;
      const p = Math.max(0, Math.min(1, this.streamProgress));
      const isYanderePhase = p >= 0.5;

      ctx.fillStyle = "#080207";
      ctx.fillRect(0, 0, w, h);

      if (!isYanderePhase) {
        const normalImg = this.getLoadedImage("streamNormal");
        if (normalImg) {
          this.drawCoverImage(ctx, normalImg, 0, 0, w, h);
        } else {
          this.drawPlaceholderBox(
            ctx,
            0,
            0,
            w,
            h,
            "#2a1421",
            "rgba(244,114,182,0.5)",
            "[ 加载中：sana-stream-normal.jpg ]"
          );
        }
      } else {
        const yandereImg = this.getLoadedImage("streamYandere");
        if (yandereImg) {
          this.drawCoverImage(ctx, yandereImg, 0, 0, w, h);
        } else {
          this.drawPlaceholderBox(
            ctx,
            0,
            0,
            w,
            h,
            "#1c0a16",
            "rgba(244, 63, 94, 0.62)",
            "[ 占位：sana-stream-yandere.jpg ]"
          );
        }
      }

      // Live audio equalizer bars in bottom-left of player
      const bars = 12;
      const barBaseX = 16;
      const barBaseY = h - 36;
      ctx.fillStyle = isYanderePhase ? "rgba(244, 63, 94, 0.72)" : "rgba(244, 114, 182, 0.8)";
      for (let i = 0; i < bars; i++) {
        const amp = isYanderePhase
          ? 4 + Math.random() * 18
          : 5 + Math.abs(Math.sin(now * 0.008 + i * 0.7)) * 14;
        ctx.fillRect(barBaseX + i * 7, barBaseY - amp, 4, amp);
      }

      // Glitch slice tearing during corruption
      if (p > 0.38) {
        const glitchProb = isYanderePhase ? 0.25 : (p - 0.38) * 1.4;
        if (Math.random() < glitchProb) {
          const sy = Math.random() * h * 0.85;
          const sh = 6 + Math.random() * 24;
          const dx = (Math.random() - 0.5) * 28;
          ctx.drawImage(this.streamCanvas, 0, sy, w, sh, dx, sy, w, sh);
          ctx.fillStyle = "rgba(244, 63, 94, 0.2)";
          ctx.fillRect(0, sy, w, 3);
        }
      }

      if (p > 0.35) {
        const scanY = ((now * 0.11) % (h + 32)) - 16;
        ctx.fillStyle = isYanderePhase ? "rgba(244, 63, 94, 0.12)" : "rgba(244, 114, 182, 0.08)";
        ctx.fillRect(0, scanY, w, 10);

        const vigAlpha = Math.min(0.75, (p - 0.35) * 1.1);
        const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.68);
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(1, `rgba(6, 1, 5, ${vigAlpha})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
      }
    }

    drawCorridor(now) {
      if (!this.corridorCtx || !this.corridorCanvas) return;
      const ctx = this.corridorCtx;
      const w = this.corridorCanvas.width;
      const h = this.corridorCanvas.height;
      const p = Math.max(0, Math.min(1, this.corridorProgress));

      let lightOn = 1;
      if (this.flickerTimer > 0) {
        this.flickerTimer--;
        lightOn = this.flickerTimer % 3 === 0 ? 0.08 : 0.78;
      } else if (p > 0.1 && Math.random() < 0.03) {
        lightOn = 0.22;
      }

      ctx.fillStyle = "#020103";
      ctx.fillRect(0, 0, w, h);

      const stepFraction = Math.min(1, Math.floor(p * 5) * 0.2 + p * 0.16);
      const scale = 0.44 + stepFraction * 0.64;
      const frameW = Math.min(w * 0.92, w * 0.52 * scale * 1.32);
      const frameH = frameW * (9 / 16);

      const parallaxX = (this.mouseNorm.x - 0.5) * -22;
      const parallaxY = (this.mouseNorm.y - 0.5) * -14;
      const fx = w * 0.5 - frameW * 0.5 + parallaxX;
      const fy = h * 0.48 - frameH * 0.5 + parallaxY;

      if (lightOn > 0.2) {
        const glow = ctx.createRadialGradient(
          w * 0.5,
          h * 0.48,
          frameW * 0.12,
          w * 0.5,
          h * 0.48,
          Math.max(w, h) * 0.65
        );
        glow.addColorStop(0, `rgba(219, 39, 119, ${0.22 * lightOn})`);
        glow.addColorStop(0.55, `rgba(120, 20, 60, ${0.08 * lightOn})`);
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.save();
      ctx.globalAlpha = 0.25 + 0.75 * lightOn;
      const closeImg = this.getLoadedImage("closeObsession");
      if (closeImg) {
        this.drawCoverImage(ctx, closeImg, fx, fy, frameW, frameH);
      } else {
        this.drawPlaceholderBox(
          ctx,
          fx,
          fy,
          frameW,
          frameH,
          "#140710",
          "rgba(236, 72, 153, 0.58)",
          "[ 占位：sana-close-obsession.jpg ]"
        );
      }
      ctx.restore();

      ctx.fillStyle = `rgba(249, 168, 212, ${0.24 * lightOn})`;
      this.particles.forEach((pt) => {
        pt.y -= pt.speed * 0.016;
        if (pt.y < 0) pt.y = 1;
        ctx.beginPath();
        ctx.arc(pt.x * w, pt.y * h, pt.r, 0, Math.PI * 2);
        ctx.fill();
      });

      const vig = ctx.createRadialGradient(
        w * 0.5,
        h * 0.48,
        Math.min(w, h) * 0.18,
        w * 0.5,
        h * 0.48,
        Math.max(w, h) * 0.68
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.92)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    }

    drawClimax(now) {
      if (!this.climaxCtx || !this.climaxCanvas) return;
      const ctx = this.climaxCtx;
      const w = this.climaxCanvas.width;
      const h = this.climaxCanvas.height;
      const elapsed = now - this.climaxStart;

      ctx.fillStyle = "#030102";
      ctx.fillRect(0, 0, w, h);

      const jitterX = elapsed < 3600 ? (Math.random() - 0.5) * 12 : (Math.random() - 0.5) * 2;
      const jitterY = elapsed < 3600 ? (Math.random() - 0.5) * 9 : (Math.random() - 0.5) * 2;

      const climaxImg = this.getLoadedImage("climaxHorror");
      if (climaxImg) {
        this.drawCoverImage(ctx, climaxImg, jitterX, jitterY, w, h);
      } else {
        const boxW = Math.min(w * 0.88, 960);
        const boxH = Math.min(h * 0.82, boxW * (9 / 16));
        this.drawPlaceholderBox(
          ctx,
          (w - boxW) * 0.5 + jitterX,
          (h - boxH) * 0.5 + jitterY,
          boxW,
          boxH,
          "#1e040b",
          "rgba(244, 63, 94, 0.72)",
          "[ 占位：sana-climax-horror.jpg ]"
        );
      }

      const pulse = 0.24 + Math.sin(now * 0.01) * 0.12;
      const bgGlow = ctx.createRadialGradient(
        w * 0.5,
        h * 0.48,
        20,
        w * 0.5,
        h * 0.48,
        Math.max(w, h) * 0.65
      );
      bgGlow.addColorStop(0, `rgba(190, 18, 60, ${pulse * 0.35})`);
      bgGlow.addColorStop(1, "rgba(0, 0, 0, 0.92)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      if (elapsed < 180) {
        ctx.fillStyle = `rgba(255, 240, 246, ${(1 - elapsed / 180) * 0.38})`;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.strokeStyle = "rgba(255, 220, 235, 0.2)";
      ctx.lineWidth = 1;
      for (let s = 0; s < 3; s++) {
        if (Math.random() < 0.42) {
          const sx = Math.random() * w;
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, h);
          ctx.stroke();
        }
      }
    }
  }

  window.SanaScenes = new SanaCanvasScenes();
})();
