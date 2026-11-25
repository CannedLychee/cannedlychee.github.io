/* ==========================================================================
   Solace™ 栖境 — Canvas Horror Renderers (window.SolaceScenes)
   1. Film Grain & Scratches
   2. Live CCTV Hallway Feed
   3. Sticky Horror Corridor Descent
   4. Climax Chiaroscuro Horror Face
   ========================================================================== */
(function () {
  class SolaceCanvasScenes {
    constructor() {
      this.grainCanvas = null;
      this.grainCtx = null;
      this.noiseOff = document.createElement("canvas");
      this.noiseOff.width = 160;
      this.noiseOff.height = 90;
      this.noiseOffCtx = this.noiseOff.getContext("2d");

      this.cctvCanvas = null;
      this.cctvCtx = null;
      this.cctvProgress = 0;

      this.corridorCanvas = null;
      this.corridorCtx = null;
      this.corridorProgress = 0;
      this.lastCorridorStep = -1;
      this.flickerTimer = 0;
      this.particles = Array.from({ length: 34 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.6 + Math.random() * 1.8,
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

    init(options = {}) {
      this.onFlicker = options.onFlicker || null;
      this.grainCanvas = document.getElementById("grain-canvas");
      this.cctvCanvas = document.getElementById("cctv-canvas");
      this.corridorCanvas = document.getElementById("corridor-canvas");
      this.climaxCanvas = document.getElementById("climax-canvas");

      if (this.grainCanvas) this.grainCtx = this.grainCanvas.getContext("2d");
      if (this.cctvCanvas) this.cctvCtx = this.cctvCanvas.getContext("2d");
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
      this.resizeCanvas(this.cctvCanvas, 1.5);
      this.resizeCanvas(this.corridorCanvas, 1.75);
      this.resizeCanvas(this.climaxCanvas, 1.75);
    }

    setState({ dread, cctvProgress, corridorProgress, mouseNorm }) {
      if (typeof dread === "number") this.dread = dread;
      if (typeof cctvProgress === "number") this.cctvProgress = cctvProgress;
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

    render(now) {
      if (this.dread > 0.14 && now - this.lastGrainDraw > 52) {
        this.lastGrainDraw = now;
        this.drawGrain();
      }
      this.drawCCTV(now);
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
      const alpha = Math.floor(Math.min(1, this.dread) * 95);
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

      if (this.dread > 0.55 && Math.random() < 0.35) {
        this.grainCtx.strokeStyle = "rgba(255,255,255,0.12)";
        this.grainCtx.lineWidth = 1;
        const sx = Math.random() * cw;
        this.grainCtx.beginPath();
        this.grainCtx.moveTo(sx, 0);
        this.grainCtx.lineTo(sx + (Math.random() - 0.5) * 8, ch);
        this.grainCtx.stroke();
      }
    }

    drawCCTV(now) {
      if (!this.cctvCtx || !this.cctvCanvas) return;
      const ctx = this.cctvCtx;
      const w = this.cctvCanvas.width;
      const h = this.cctvCanvas.height;
      const p = Math.max(0, Math.min(1, this.cctvProgress));

      // Night-vision background
      ctx.fillStyle = "#040806";
      ctx.fillRect(0, 0, w, h);

      // Perspective hallway geometry
      const vx = w * 0.5;
      const vy = h * 0.44;
      const endW = w * 0.14;
      const endH = h * 0.22;

      ctx.strokeStyle = "rgba(120, 190, 145, 0.24)";
      ctx.lineWidth = 1.4;
      // Outer to inner corner lines
      [
        [0, 0, vx - endW / 2, vy - endH / 2],
        [w, 0, vx + endW / 2, vy - endH / 2],
        [0, h, vx - endW / 2, vy + endH / 2],
        [w, h, vx + endW / 2, vy + endH / 2]
      ].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Far end frame & dim doorway
      ctx.fillStyle = "#08120c";
      ctx.fillRect(vx - endW / 2, vy - endH / 2, endW, endH);
      ctx.strokeRect(vx - endW / 2, vy - endH / 2, endW, endH);

      // Side doors
      ctx.fillStyle = "rgba(30, 55, 40, 0.25)";
      ctx.beginPath();
      ctx.moveTo(w * 0.14, h * 0.16);
      ctx.lineTo(w * 0.27, h * 0.26);
      ctx.lineTo(w * 0.27, h * 0.72);
      ctx.lineTo(w * 0.14, h * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Overhead dim IR sconce glow
      const glow = ctx.createRadialGradient(vx, vy - endH * 0.3, 4, vx, vy, w * 0.48);
      glow.addColorStop(0, "rgba(155, 230, 175, 0.16)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Approaching intruder silhouette based on p
      if (p > 0.28) {
        const approach = Math.min(1, (p - 0.28) / 0.68);
        const scale = 0.22 + approach * 1.15;
        const figH = h * 0.26 * scale;
        const figW = figH * 0.34;
        const fx = vx + Math.sin(now * 0.0018) * (2 + approach * 3);
        const fy = vy + endH * 0.48 + approach * (h * 0.28);

        // Shadow figure
        ctx.fillStyle = "rgba(2, 4, 3, 0.94)";
        ctx.beginPath();
        ctx.ellipse(fx, fy - figH * 0.86, figW * 0.36, figW * 0.44, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(fx - figW * 0.55, fy - figH * 0.66);
        ctx.quadraticCurveTo(fx, fy - figH * 0.78, fx + figW * 0.55, fy - figH * 0.66);
        ctx.lineTo(fx + figW * 0.45, fy);
        ctx.lineTo(fx - figW * 0.45, fy);
        ctx.closePath();
        ctx.fill();

        // Glinting pale eyes when closer
        if (approach > 0.45) {
          const eyeAlpha = Math.min(0.95, (approach - 0.45) * 1.8);
          ctx.fillStyle = `rgba(220, 255, 225, ${eyeAlpha})`;
          const er = Math.max(1.5, figW * 0.07);
          ctx.beginPath();
          ctx.arc(fx - figW * 0.13, fy - figH * 0.88, er, 0, Math.PI * 2);
          ctx.arc(fx + figW * 0.13, fy - figH * 0.88, er, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // VHS tracking scan bar & scanlines
      const scanY = ((now * 0.09) % (h + 40)) - 20;
      ctx.fillStyle = "rgba(180, 255, 200, 0.07)";
      ctx.fillRect(0, scanY, w, 12);

      if (p > 0.72 && Math.random() < 0.14) {
        ctx.fillStyle = "rgba(210, 255, 225, 0.18)";
        ctx.fillRect(0, Math.random() * h, w, 2 + Math.random() * 5);
      }

      // Subtle vignette
      const vig = ctx.createRadialGradient(vx, h * 0.5, w * 0.2, vx, h * 0.5, w * 0.65);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.72)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    }

    drawCorridor(now) {
      if (!this.corridorCtx || !this.corridorCanvas) return;
      const ctx = this.corridorCtx;
      const w = this.corridorCanvas.width;
      const h = this.corridorCanvas.height;
      const p = Math.max(0, Math.min(1, this.corridorProgress));

      // Fluorescent flicker envelope
      let lightOn = 1;
      if (this.flickerTimer > 0) {
        this.flickerTimer--;
        lightOn = this.flickerTimer % 3 === 0 ? 0.08 : 0.72;
      } else if (p > 0.1 && Math.random() < 0.025) {
        lightOn = 0.25;
      }

      ctx.fillStyle = "#020103";
      ctx.fillRect(0, 0, w, h);

      const vx = w * 0.5 + (this.mouseNorm.x - 0.5) * -18;
      const vy = h * 0.46 + (this.mouseNorm.y - 0.5) * -12;
      const zoom = 1 + p * 0.45;
      const endW = w * 0.16 * zoom;
      const endH = h * 0.28 * zoom;

      // Walls & floor shading
      const wallLight = 0.07 + 0.12 * lightOn;
      ctx.fillStyle = `rgba(42, 38, 46, ${wallLight})`;
      // Left wall
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(vx - endW / 2, vy - endH / 2);
      ctx.lineTo(vx - endW / 2, vy + endH / 2);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Right wall
      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(vx + endW / 2, vy - endH / 2);
      ctx.lineTo(vx + endW / 2, vy + endH / 2);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Wet floor reflection gradient
      const floorGrad = ctx.createLinearGradient(vx, vy + endH / 2, vx, h);
      floorGrad.addColorStop(0, `rgba(28, 22, 28, ${0.28 * lightOn})`);
      floorGrad.addColorStop(1, "rgba(4, 3, 6, 0.95)");
      ctx.fillStyle = floorGrad;
      ctx.beginPath();
      ctx.moveTo(vx - endW / 2, vy + endH / 2);
      ctx.lineTo(vx + endW / 2, vy + endH / 2);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Structural perspective lines
      ctx.strokeStyle = `rgba(120, 110, 125, ${0.18 * lightOn})`;
      ctx.lineWidth = 1.5;
      [
        [0, 0, vx - endW / 2, vy - endH / 2],
        [w, 0, vx + endW / 2, vy - endH / 2],
        [0, h, vx - endW / 2, vy + endH / 2],
        [w, h, vx + endW / 2, vy + endH / 2]
      ].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Far end doorway
      ctx.fillStyle = "#010002";
      ctx.fillRect(vx - endW / 2, vy - endH / 2, endW, endH);
      ctx.strokeStyle = `rgba(160, 40, 45, ${0.26 * lightOn})`;
      ctx.strokeRect(vx - endW / 2, vy - endH / 2, endW, endH);

      // Overhead flickering fluorescent tube + volumetric cone
      if (lightOn > 0.2) {
        const tubeY = vy - endH * 0.74;
        const tubeW = endW * 0.72;
        const cone = ctx.createRadialGradient(vx, tubeY, 4, vx, vy + endH * 0.2, h * 0.56);
        cone.addColorStop(0, `rgba(215, 225, 235, ${0.24 * lightOn})`);
        cone.addColorStop(0.55, `rgba(120, 130, 145, ${0.07 * lightOn})`);
        cone.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = cone;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = `rgba(235, 245, 255, ${0.85 * lightOn})`;
        ctx.fillRect(vx - tubeW / 2, tubeY, tubeW, 4);
      }

      // Entity stepping closer in discrete bursts + zoom
      const stepFraction = Math.min(1, Math.floor(p * 5) * 0.22 + p * 0.12);
      const figScale = 0.35 + stepFraction * 1.95;
      const figH = endH * 0.72 * figScale;
      const figW = figH * 0.32;
      const sway = Math.sin(now * 0.0022) * (2 + stepFraction * 4);
      const fx = vx + sway;
      const fy = vy + endH * 0.5 + stepFraction * (h * 0.32);

      // Floor reflection silhouette
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.ellipse(fx, fy + 8, figW * 0.65, figH * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main dark entity
      ctx.fillStyle = "#030205";
      ctx.beginPath();
      ctx.ellipse(fx, fy - figH * 0.87, figW * 0.34, figW * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Elongated arms & torso
      ctx.beginPath();
      ctx.moveTo(fx - figW * 0.62, fy - figH * 0.68);
      ctx.quadraticCurveTo(fx, fy - figH * 0.8, fx + figW * 0.62, fy - figH * 0.68);
      ctx.lineTo(fx + figW * 0.72, fy - figH * 0.14);
      ctx.lineTo(fx + figW * 0.38, fy - figH * 0.12);
      ctx.lineTo(fx + figW * 0.32, fy);
      ctx.lineTo(fx - figW * 0.32, fy);
      ctx.lineTo(fx - figW * 0.38, fy - figH * 0.12);
      ctx.lineTo(fx - figW * 0.72, fy - figH * 0.14);
      ctx.closePath();
      ctx.fill();

      // Wet specular eyes tracking cursor
      const eyeIntensity = Math.min(1, 0.25 + stepFraction * 0.9);
      const lookX = (this.mouseNorm.x - 0.5) * figW * 0.08;
      const lookY = (this.mouseNorm.y - 0.5) * figW * 0.06;
      ctx.fillStyle = `rgba(245, 248, 255, ${eyeIntensity})`;
      const er = Math.max(1.6, figW * 0.065);
      ctx.beginPath();
      ctx.arc(fx - figW * 0.13 + lookX, fy - figH * 0.89 + lookY, er, 0, Math.PI * 2);
      ctx.arc(fx + figW * 0.13 + lookX, fy - figH * 0.89 + lookY, er, 0, Math.PI * 2);
      ctx.fill();

      // Floating dust / ash particles
      ctx.fillStyle = `rgba(210, 210, 220, ${0.22 * lightOn})`;
      this.particles.forEach((pt) => {
        pt.y -= pt.speed * 0.016;
        if (pt.y < 0) pt.y = 1;
        ctx.beginPath();
        ctx.arc(pt.x * w, pt.y * h, pt.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Heavy radial darkness around edges
      const vig = ctx.createRadialGradient(vx, vy, Math.min(w, h) * 0.15, vx, vy, Math.max(w, h) * 0.65);
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

      // Dark crimson-black void
      ctx.fillStyle = "#020102";
      ctx.fillRect(0, 0, w, h);

      // Slow pulsing crimson backlight
      const pulse = 0.22 + Math.sin(now * 0.008) * 0.12;
      const bgGlow = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.45, Math.max(w, h) * 0.6);
      bgGlow.addColorStop(0, `rgba(130, 12, 18, ${pulse})`);
      bgGlow.addColorStop(1, "rgba(0, 0, 0, 0.96)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      // Brief cinematic flash in first 180ms (safe single pulse)
      if (elapsed < 180) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(1 - elapsed / 180) * 0.38})`;
        ctx.fillRect(0, 0, w, h);
      }

      const jitterX = elapsed < 3600 ? (Math.random() - 0.5) * 10 : (Math.random() - 0.5) * 2;
      const jitterY = elapsed < 3600 ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * 2;
      const cx = w * 0.5 + jitterX;
      const cy = h * 0.46 + jitterY;
      const faceScale = Math.min(w, h) * 0.42;

      // Ink hair / shadow tendrils framing face
      ctx.fillStyle = "#040305";
      for (let i = 0; i < 18; i++) {
        const ang = (i / 18) * Math.PI * 2;
        const len = faceScale * (1.25 + Math.sin(now * 0.004 + i) * 0.16);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang - 0.14) * len, cy + Math.sin(ang - 0.14) * len * 1.15);
        ctx.lineTo(cx + Math.cos(ang + 0.14) * len, cy + Math.sin(ang + 0.14) * len * 1.15);
        ctx.closePath();
        ctx.fill();
      }

      //Stark blown-out pale grey-white skull/face contour
      const faceGrad = ctx.createRadialGradient(
        cx,
        cy - faceScale * 0.1,
        faceScale * 0.08,
        cx,
        cy,
        faceScale * 0.95
      );
      faceGrad.addColorStop(0, "#e5e7eb");
      faceGrad.addColorStop(0.55, "#9ca3af");
      faceGrad.addColorStop(0.88, "#27272a");
      faceGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, faceScale * 0.64, faceScale * 0.88, 0, 0, Math.PI * 2);
      ctx.fill();

      // Deep sunken cavernous eye sockets
      const eyeY = cy - faceScale * 0.16;
      const eyeOffset = faceScale * 0.24;
      [-1, 1].forEach((dir) => {
        const ex = cx + dir * eyeOffset;
        const socketGrad = ctx.createRadialGradient(ex, eyeY, 2, ex, eyeY, faceScale * 0.19);
        socketGrad.addColorStop(0, "#000000");
        socketGrad.addColorStop(0.7, "#070305");
        socketGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = socketGrad;
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, faceScale * 0.16, faceScale * 0.18, dir * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Pinpoint pale + crimson specular pupils locked onto cursor
        const px = ex + (this.mouseNorm.x - 0.5) * faceScale * 0.06;
        const py = eyeY + (this.mouseNorm.y - 0.5) * faceScale * 0.06;

        ctx.fillStyle = "rgba(220, 38, 38, 0.7)";
        ctx.beginPath();
        ctx.arc(px, py, Math.max(4, faceScale * 0.028), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(px, py, Math.max(2, faceScale * 0.013), 0, Math.PI * 2);
        ctx.fill();
      });

      // Unnaturally stretched trembling hollow mouth
      const mouthY = cy + faceScale * 0.34;
      const mouthOpen = faceScale * (0.28 + Math.sin(now * 0.03) * 0.025);
      ctx.fillStyle = "#020102";
      ctx.beginPath();
      ctx.ellipse(cx, mouthY, faceScale * 0.19, mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();

      // Faint vertical teeth / jaw streaks
      ctx.strokeStyle = "rgba(180, 180, 190, 0.25)";
      ctx.lineWidth = 1.6;
      for (let t = -3; t <= 3; t++) {
        const tx = cx + t * faceScale * 0.042;
        ctx.beginPath();
        ctx.moveTo(tx, mouthY - mouthOpen * 0.85);
        ctx.lineTo(tx, mouthY - mouthOpen * 0.55);
        ctx.stroke();
      }

      // Film scratches & heavy edge vignette
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 1;
      for (let s = 0; s < 3; s++) {
        if (Math.random() < 0.4) {
          const sx = Math.random() * w;
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, h);
          ctx.stroke();
        }
      }

      const vig = ctx.createRadialGradient(cx, cy, faceScale * 0.55, cx, cy, Math.max(w, h) * 0.68);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.95)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    }
  }

  window.SolaceScenes = new SolaceCanvasScenes();
})();
