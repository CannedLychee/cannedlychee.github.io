/* ==========================================================================
   Solace™ 栖境 — Scroll Choreography, Psychological Gaslighting & State Machine
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;

  // Core DOM refs
  const grainCanvas = document.getElementById("grain-canvas");
  const scanlines = document.getElementById("scanlines-overlay");
  const flashlight = document.getElementById("flashlight-overlay");
  const vignette = document.getElementById("vignette-overlay");
  const peripheralLayer = document.getElementById("peripheral-layer");
  const taintedToast = document.getElementById("tainted-toast");

  const audioPill = document.getElementById("audio-pill");
  const audioPillLabel = document.getElementById("audio-pill-label");
  const heroAudioBtn = document.getElementById("hero-audio-btn");
  const aftermathAudioBtn = document.getElementById("aftermath-audio-btn");

  const dashTime = document.getElementById("dash-time");
  const dashStatus = document.getElementById("dash-status");
  const dashHr = document.getElementById("dash-hr");
  const dashLock = document.getElementById("dash-lock");
  const dashOccupants = document.getElementById("dash-occupants");
  const dashCamNote = document.getElementById("dash-cam-note");
  const heroTitle = document.getElementById("hero-title");
  const heroSubtitle = document.getElementById("hero-subtitle");

  const navBrandText = document.querySelector("#nav-brand .brand-text");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const navCta = document.getElementById("nav-cta");

  // Act 2 telemetry refs
  const telBadge = document.getElementById("telemetry-badge");
  const telLight = document.getElementById("tel-light");
  const telLock = document.getElementById("tel-lock");
  const telCorridor = document.getElementById("tel-corridor");
  const telMic = document.getElementById("tel-mic");
  const telObserver = document.getElementById("tel-observer");
  const telIdle = document.getElementById("tel-idle");
  const telTimes = Array.from(document.querySelectorAll(".tel-time[data-later]"));
  const glitchWord = document.querySelector(".glitch-word");

  // Act 3 CCTV & eyes
  const cctvClock = document.getElementById("cctv-clock");
  const cctvStatusBar = document.getElementById("cctv-status-bar");
  const cctvStatusText = document.getElementById("cctv-status-text");
  const cctvSignal = document.getElementById("cctv-signal");
  const eyePupils = Array.from(document.querySelectorAll(".eye-pupil"));

  // Act 4 Contract & runaway
  const contractChecks = Array.from(document.querySelectorAll(".contract-check"));
  const contractFeedback = document.getElementById("contract-feedback");
  const runawayBtn = document.getElementById("runaway-btn");
  const runawayArena = document.getElementById("runaway-arena");

  // Act 5 & 6
  const actCorridor = document.getElementById("act-corridor");
  const actStories = document.getElementById("act-stories");
  const corridorCaption = document.getElementById("corridor-caption");
  const openDoorBtn = document.getElementById("open-door-btn");
  const climaxStage = document.getElementById("climax-stage");
  const climaxText = document.getElementById("climax-text");
  const aftermathScreen = document.getElementById("aftermath-screen");
  const aftermathTime = document.getElementById("aftermath-time");
  const resetBtn = document.getElementById("reset-btn");

  // Chat widget refs
  const chatToggle = document.getElementById("chat-toggle");
  const chatPanel = document.getElementById("chat-panel");
  const chatClose = document.getElementById("chat-close");
  const chatMessages = document.getElementById("chat-messages");
  const chatTyping = document.getElementById("chat-typing");
  const chatStatus = document.getElementById("chat-status");
  const chatBadge = document.getElementById("chat-badge");

  // Runtime state
  let targetScroll = 0;
  let smoothScroll = 0;
  let dread = 0;
  let tainted = false;
  let taintedToastShown = false;
  let climaxTriggered = false;
  let climaxTimers = [];
  let lastMouseMoveAt = performance.now();
  let mouse = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
  let runawayDodges = 0;
  let activeApparition = null;
  let lastApparitionAt = 0;

  const chatMilestones = [
    { at: 0.3, sent: false, creepy: false, text: "你好，我是 Solace 专属顾问。很高兴认识你。" },
    { at: 0.52, sent: false, creepy: true, text: "你滑得太深了。上面的功能介绍不好看吗？" },
    { at: 0.7, sent: false, creepy: true, text: "别急着关掉页面。关掉之前，先看一眼你身后。" },
    { at: 0.84, sent: false, creepy: true, text: "我听见你移动鼠标的声音了。" }
  ];

  const runawayLabels = [
    "取消并离开",
    "你确定吗？",
    "你关不掉的",
    "别想走",
    "已经太晚了",
    "留下来"
  ];

  // Initialize Canvas Scenes
  if (window.SolaceScenes) {
    window.SolaceScenes.init({
      onFlicker: () => {
        if (window.SolaceAudio) window.SolaceAudio.triggerFlicker();
      }
    });
  }

  // ==================== Audio UI Helpers ====================
  function syncAudioLabels(isPlaying) {
    if (isPlaying) {
      audioPill.setAttribute("aria-pressed", "true");
      audioPillLabel.textContent = dread > 0.55 ? "🔊 监听开启中" : "🔊 白噪音播放中";
      if (heroAudioBtn) heroAudioBtn.textContent = "🔇 暂停白噪音";
      if (aftermathAudioBtn) aftermathAudioBtn.textContent = "静音";
    } else {
      audioPill.setAttribute("aria-pressed", "false");
      audioPillLabel.textContent = dread > 0.55 ? "🔇 声音已切断" : "🔊 开启专注白噪音";
      if (heroAudioBtn) heroAudioBtn.textContent = "🎧 开启 Solace 专注白噪音";
      if (aftermathAudioBtn) aftermathAudioBtn.textContent = "开启声音";
    }
  }

  async function toggleAudio() {
    if (!window.SolaceAudio) return;
    const playing = await window.SolaceAudio.initAndToggle();
    syncAudioLabels(playing);
  }

  audioPill.addEventListener("click", toggleAudio);
  if (heroAudioBtn) heroAudioBtn.addEventListener("click", toggleAudio);
  if (aftermathAudioBtn) aftermathAudioBtn.addEventListener("click", toggleAudio);

  // ==================== Real-time Clock & Telemetry ====================
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function updateClock() {
    const now = new Date();
    const hms = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
    const ymd = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${hms}`;
    if (dashTime) dashTime.textContent = hms;
    if (cctvClock) cctvClock.textContent = ymd;
    if (aftermathTime) {
      aftermathTime.textContent = `记录已保存 (${hms}) · 房间内人数：2`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ==================== Pointer & Eye Tracking ====================
  function updatePointer(clientX, clientY) {
    mouse.x = clientX;
    mouse.y = clientY;
    lastMouseMoveAt = performance.now();
    root.style.setProperty("--mx", `${clientX}px`);
    root.style.setProperty("--my", `${clientY}px`);

    // Subtle eye pupil tracking on testimonials
    eyePupils.forEach((group) => {
      const svg = group.closest("svg");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.44;
      const dx = Math.max(-1.9, Math.min(1.9, (clientX - cx) / 140));
      const dy = Math.max(-1.4, Math.min(1.4, (clientY - cy) / 140));
      group.setAttribute("transform", `translate(${dx.toFixed(2)}, ${dy.toFixed(2)})`);
    });

    // Vanish peripheral apparition if cursor approaches
    if (activeApparition && !activeApparition.classList.contains("vanished")) {
      const r = activeApparition.getBoundingClientRect();
      const dist = Math.hypot(clientX - (r.left + r.width / 2), clientY - (r.top + r.height / 2));
      if (dist < 260) {
        activeApparition.classList.add("vanished");
        setTimeout(() => {
          if (activeApparition && activeApparition.parentNode) {
            activeApparition.parentNode.removeChild(activeApparition);
          }
          activeApparition = null;
        }, 220);
      }
    }
  }

  window.addEventListener("mousemove", (e) => updatePointer(e.clientX, e.clientY), { passive: true });
  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  // ==================== Support Chat Logic ====================
  chatToggle.addEventListener("click", () => {
    const isHidden = chatPanel.hasAttribute("hidden");
    if (isHidden) {
      chatPanel.removeAttribute("hidden");
      chatToggle.setAttribute("aria-expanded", "true");
      chatBadge.setAttribute("hidden", "");
    } else {
      chatPanel.setAttribute("hidden", "");
      chatToggle.setAttribute("aria-expanded", "false");
    }
  });

  chatClose.addEventListener("click", () => {
    chatPanel.setAttribute("hidden", "");
    chatToggle.setAttribute("aria-expanded", "false");
  });

  function pushBotMessage(text, isCreepy) {
    if (chatPanel.hasAttribute("hidden")) {
      chatPanel.removeAttribute("hidden");
      chatToggle.setAttribute("aria-expanded", "true");
    }
    chatTyping.removeAttribute("hidden");

    setTimeout(() => {
      chatTyping.setAttribute("hidden", "");
      const msg = document.createElement("div");
      msg.className = `chat-msg bot${isCreepy ? " creepy" : ""}`;
      const p = document.createElement("p");
      p.textContent = text;
      msg.appendChild(p);
      chatMessages.appendChild(msg);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      if (isCreepy && chatStatus) {
        chatStatus.textContent = "● 正在看着你";
      }
      if (window.SolaceAudio) {
        window.SolaceAudio.triggerMessagePing(isCreepy);
      }
    }, 1050);
  }

  // ==================== Peripheral Apparition Spawner ====================
  function maybeSpawnApparition(now) {
    if (dread < 0.45 || dread > 0.88 || activeApparition || now - lastApparitionAt < 9000) return;
    if (Math.random() > 0.02) return;

    lastApparitionAt = now;
    const el = document.createElement("div");
    el.className = "apparition";
    const onLeft = Math.random() < 0.5;
    el.style.left = onLeft ? "14px" : "auto";
    el.style.right = onLeft ? "auto" : "14px";
    el.style.top = `${18 + Math.random() * 52}vh`;
    el.innerHTML = `
      <svg viewBox="0 0 60 140" width="78" height="170" aria-hidden="true">
        <ellipse cx="30" cy="24" rx="13" ry="17" fill="#060408" />
        <path d="M12,48 Q30,36 48,48 L52,138 L8,138 Z" fill="#060408" />
        <circle cx="24" cy="22" r="2" fill="rgba(248, 250, 252, 0.72)" />
        <circle cx="36" cy="22" r="2" fill="rgba(248, 250, 252, 0.72)" />
      </svg>`;
    peripheralLayer.appendChild(el);
    activeApparition = el;
    requestAnimationFrame(() => el.classList.add("visible"));

    setTimeout(() => {
      if (activeApparition === el) {
        el.classList.add("vanished");
        setTimeout(() => {
          if (el.parentNode) el.parentNode.removeChild(el);
          if (activeApparition === el) activeApparition = null;
        }, 240);
      }
    }, 3600);
  }

  // ==================== Act 4 Contract & Runaway Button ====================
  contractChecks.forEach((box) => {
    box.addEventListener("change", () => {
      if (!box.checked && dread >= Number(box.dataset.threshold || 0.6)) {
        contractFeedback.textContent = "你无权撤回已经同意的条款。";
        setTimeout(() => {
          box.checked = true;
        }, 550);
      }
    });
  });

  function dodgeRunaway() {
    if (!runawayArena || !runawayBtn) return;
    runawayDodges++;
    const label = runawayLabels[Math.min(runawayLabels.length - 1, runawayDodges)];
    runawayBtn.textContent = label;
    runawayBtn.style.width = "auto";
    runawayBtn.style.color = "#f87171";

    const maxX = Math.max(20, runawayArena.clientWidth - runawayBtn.offsetWidth - 8);
    const maxY = Math.max(6, runawayArena.clientHeight - runawayBtn.offsetHeight - 4);
    runawayBtn.style.left = `${Math.floor(Math.random() * maxX)}px`;
    runawayBtn.style.top = `${Math.floor(Math.random() * maxY)}px`;
  }

  if (runawayBtn) {
    runawayBtn.addEventListener("mouseenter", dodgeRunaway);
    runawayBtn.addEventListener("click", (e) => {
      e.preventDefault();
      dodgeRunaway();
    });
  }

  // ==================== Glitch Word Hover Swap ====================
  if (glitchWord) {
    const orig = glitchWord.textContent;
    const alt = glitchWord.dataset.alt || orig;
    glitchWord.addEventListener("mouseenter", () => {
      glitchWord.textContent = alt;
      glitchWord.classList.add("swapped");
    });
    glitchWord.addEventListener("mouseleave", () => {
      if (dread < 0.45) {
        glitchWord.textContent = orig;
        glitchWord.classList.remove("swapped");
      }
    });
  }

  // ==================== Act 6 Climax Sequence & Reset ====================
  function triggerClimax() {
    if (climaxTriggered) return;
    climaxTriggered = true;
    document.title = "找 到 你 了";
    flashlight.style.opacity = "0";

    if (window.SolaceAudio) {
      window.SolaceAudio.triggerClimaxStinger();
    }

    // 550ms dead-air blackout before reveal
    climaxStage.removeAttribute("hidden");
    climaxText.textContent = "";
    aftermathScreen.setAttribute("hidden", "");

    const t1 = setTimeout(() => {
      body.classList.add("climax-active", "climax-shake");
      if (window.SolaceScenes) window.SolaceScenes.startClimax();

      const chars = ["找", "到", "你", "了"];
      chars.forEach((ch, idx) => {
        const tc = setTimeout(() => {
          climaxText.textContent = chars.slice(0, idx + 1).join(" ");
        }, idx * 140);
        climaxTimers.push(tc);
      });
    }, 550);
    climaxTimers.push(t1);

    const t2 = setTimeout(() => {
      body.classList.remove("climax-shake");
      climaxText.textContent = "";
      aftermathScreen.removeAttribute("hidden");
    }, 4200);
    climaxTimers.push(t2);
  }

  if (openDoorBtn) {
    openDoorBtn.addEventListener("click", triggerClimax);
  }

  function resetExperience() {
    climaxTimers.forEach((id) => clearTimeout(id));
    climaxTimers = [];
    climaxTriggered = false;
    tainted = false;
    taintedToastShown = false;
    runawayDodges = 0;

    body.classList.remove("climax-active", "climax-shake", "tainted", "dread-dark", "dread-horror");
    climaxStage.setAttribute("hidden", "");
    aftermathScreen.setAttribute("hidden", "");
    climaxText.textContent = "";
    taintedToast.classList.remove("show");

    if (window.SolaceScenes) window.SolaceScenes.stopClimax();
    if (window.SolaceAudio) window.SolaceAudio.resetToCalm();

    // Restore Hero & Dashboard
    heroTitle.textContent = "让家懂你的每一次呼吸";
    heroSubtitle.textContent =
      "Solace™ 将无感环境调控、声学白噪音与非接触式睡眠监测融为一体。无需繁琐设置，让每一寸光线、温度与静谧都恰到好处，温柔承接你疲惫归家的每个夜晚。";
    dashStatus.textContent = "● 运行平稳";
    dashStatus.className = "status-pill safe";
    dashOccupants.textContent = "1 人";
    dashHr.textContent = "68 BPM · 平稳";
    dashLock.textContent = "已落锁 · 安全";
    dashCamNote.textContent = "白噪音助眠中";

    // Restore Telemetry
    telBadge.textContent = "● 同步正常";
    telBadge.classList.remove("alert");
    telLight.textContent = "已开启 · 暖光 2700K";
    telLight.classList.remove("warn");
    telLock.textContent = "已关闭 · 正常";
    telLock.classList.remove("warn");
    telCorridor.textContent = "无异常移动";
    telCorridor.classList.remove("warn");
    telMic.textContent = "待机降噪";
    telMic.classList.remove("warn");
    telTimes.forEach((el) => {
      if (el.dataset.orig) el.textContent = el.dataset.orig;
    });

    // Restore glitch word
    if (glitchWord) {
      glitchWord.textContent = "灯关着我们也看得清";
      glitchWord.classList.remove("swapped");
    }

    // Restore Contract & Runaway
    contractChecks.forEach((c) => (c.checked = false));
    contractFeedback.textContent = "正在等待你的确认……";
    if (runawayBtn) {
      runawayBtn.textContent = "取消并离开";
      runawayBtn.style.left = "0";
      runawayBtn.style.top = "4px";
      runawayBtn.style.width = "100%";
      runawayBtn.style.color = "";
    }

    // Restore Chat
    chatMilestones.forEach((m) => (m.sent = false));
    chatMessages.innerHTML =
      '<div class="chat-msg bot"><p>你好，欢迎来到 Solace™ 栖境。有任何关于智能居家与睡眠陪伴的问题，都可以随时问我。</p></div>';
    chatStatus.textContent = "● 在线 · 秒级响应";
    chatPanel.setAttribute("hidden", "");
    chatToggle.setAttribute("aria-expanded", "false");

    // Scroll back cleanly
    targetScroll = 0;
    smoothScroll = 0;
    dread = 0;
    window.scrollTo({ top: 0, behavior: "instant" });
    syncAudioLabels(window.SolaceAudio && !window.SolaceAudio.isMuted());
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetExperience);
  }

  // Save original telemetry timestamps for clean reset
  telTimes.forEach((el) => {
    el.dataset.orig = el.textContent;
  });

  // ==================== Scroll & Frame Update Loop ====================
  function computeProgress() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    targetScroll = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  }

  window.addEventListener("scroll", computeProgress, { passive: true });
  computeProgress();

  function updateSectionProgress(el) {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const total = Math.max(1, rect.height - window.innerHeight * 0.4);
    return Math.max(0, Math.min(1, (-rect.top + window.innerHeight * 0.5) / total));
  }

  function updateNavLabels(p) {
    const mode = tainted && p < 0.35 ? "tainted" : p > 0.72 ? "horror" : p > 0.32 ? "uncanny" : "normal";
    const items = [navBrandText, navCta, ...navLinks];
    items.forEach((el) => {
      if (!el) return;
      const nextText = el.dataset[mode];
      if (nextText && el.textContent !== nextText) {
        el.textContent = nextText;
      }
    });
  }

  function frame(now) {
    smoothScroll += (targetScroll - smoothScroll) * 0.14;
    const p = smoothScroll;

    // Dread curve: calm 0..0.15, escalating smoothly to 1.0 by 0.96
    dread = Math.max(0, Math.min(1, (p - 0.14) / 0.82));
    root.style.setProperty("--progress", p.toFixed(4));
    root.style.setProperty("--dread", dread.toFixed(4));

    const tilt = p > 0.58 && p < 0.84 ? -0.65 * Math.min(1, (p - 0.58) / 0.16) : 0;
    root.style.setProperty("--tilt", `${tilt.toFixed(3)}deg`);

    // Atmospheric overlays
    grainCanvas.style.opacity = dread > 0.14 ? Math.min(0.65, (dread - 0.14) * 0.72).toFixed(3) : "0";
    scanlines.style.opacity = dread > 0.32 ? Math.min(0.45, (dread - 0.32) * 0.55).toFixed(3) : "0";
    vignette.style.opacity = dread > 0.2 ? Math.min(0.92, (dread - 0.2) * 1.05).toFixed(3) : "0";

    if (!climaxTriggered && p > 0.58) {
      const flashAlpha = Math.min(0.95, ((p - 0.58) / 0.12) * 0.95);
      flashlight.style.opacity = flashAlpha.toFixed(3);
    } else {
      flashlight.style.opacity = "0";
    }

    // Body theme classes
    body.classList.toggle("dread-dark", p > 0.38 || tainted);
    body.classList.toggle("dread-horror", p > 0.66 || tainted);

    // Tainted state once user passes 65%
    if (p >= 0.65 && !tainted) {
      tainted = true;
      body.classList.add("tainted");
      dashStatus.textContent = "● 外部侵入";
      dashStatus.className = "status-pill danger";
      dashOccupants.textContent = "2 人";
      dashHr.textContent = "134 BPM · 惊恐";
      dashLock.textContent = "已从外部打开";
      dashCamNote.textContent = "镜头正在注视你";
      heroTitle.textContent = "回不去了 — 你已经看到了";
      heroSubtitle.textContent =
        "你刚才停下来太久了。房间里的灯光、门锁与传感器，现在都不再由你控制。";
    }

    // Tainted toast if user flees back up to Act 1
    if (tainted && p < 0.22 && !taintedToastShown) {
      taintedToastShown = true;
      taintedToast.classList.add("show");
      setTimeout(() => taintedToast.classList.remove("show"), 4200);
    }

    // Tab title mutations
    if (!climaxTriggered) {
      if (tainted && p < 0.28) document.title = "回不去了 — 门已经关上了";
      else if (p < 0.24) document.title = "Solace™ 栖境 — 让家懂你的每一次呼吸";
      else if (p < 0.48) document.title = "Solace™ — 你的门锁好了吗？";
      else if (p < 0.74) document.title = "不要再往下滑了";
      else if (p < 0.95) document.title = "它在走廊尽头";
      else document.title = "推开最后一扇门";
    }

    updateNavLabels(p);

    // Act 2 Telemetry mutation
    if (p > 0.26) {
      telBadge.textContent = "● 检测到异常信号";
      telBadge.classList.add("alert");
      telLight.textContent = "已熄灭 · 无人回应";
      telLight.classList.add("warn");
      telLock.textContent = "门把手被轻触";
      telLock.classList.add("warn");
      telCorridor.textContent = p > 0.4 ? "检测到静止人形 · 距离 1.8 米" : "微弱热源停留在门外";
      telCorridor.classList.add("warn");
      telMic.textContent = "正在监听你的呼吸声";
      telMic.classList.add("warn");
      telTimes.forEach((el) => {
        el.textContent = el.dataset.later;
      });
      if (glitchWord) {
        glitchWord.textContent = glitchWord.dataset.alt;
        glitchWord.classList.add("swapped");
      }
    }

    if (telObserver && telIdle) {
      const idleSec = Math.floor((now - lastMouseMoveAt) / 1000);
      telObserver.textContent = `视窗 ${window.innerWidth}×${window.innerHeight} · 前方人员注视中`;
      telIdle.textContent = idleSec >= 2 ? `静止 ${idleSec}s` : "移动中";
    }

    // Act 3 CCTV status & progress
    const cctvP = updateSectionProgress(actStories);
    if (cctvStatusBar && cctvStatusText && cctvSignal) {
      if (cctvP > 0.62) {
        cctvStatusBar.classList.add("intrusion");
        cctvStatusText.textContent = "信号干扰 · 走廊内检测到未识别对象";
        cctvSignal.textContent = `SIGNAL: ${Math.max(12, Math.floor(92 - cctvP * 75))}%`;
      } else {
        cctvStatusBar.classList.remove("intrusion");
        cctvStatusText.textContent = "连接稳定 · 画面清晰";
        cctvSignal.textContent = "SIGNAL: 98%";
      }
    }

    // Act 4 Auto-checking contract boxes
    contractChecks.forEach((box) => {
      const threshold = Number(box.dataset.threshold || 0.7);
      if (p >= threshold && !box.checked) {
        box.checked = true;
        contractFeedback.textContent = "条款已自动确认。你无法撤销。";
      }
    });

    // Act 5 Sticky corridor progress & captions
    let corridorP = 0;
    if (actCorridor) {
      const rect = actCorridor.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      corridorP = Math.max(0, Math.min(1, -rect.top / span));
      if (corridorCaption) {
        if (corridorP < 0.2) corridorCaption.textContent = "走廊的灯又在闪了。";
        else if (corridorP < 0.42) corridorCaption.textContent = "尽头好像站着一个人。";
        else if (corridorP < 0.64) corridorCaption.textContent = "每一次灯灭，它都离你更近一步。";
        else if (corridorP < 0.86) corridorCaption.textContent = "别动。它在看你。";
        else corridorCaption.textContent = "它在屏幕后面。";
      }
    }

    // Chat milestones
    chatMilestones.forEach((m) => {
      if (!m.sent && p >= m.at) {
        m.sent = true;
        pushBotMessage(m.text, m.creepy);
      }
    });

    // Peripheral apparitions
    maybeSpawnApparition(now);

    // Sync audio & canvas renderers
    if (window.SolaceAudio) {
      window.SolaceAudio.setDread(dread);
    }
    if (window.SolaceScenes) {
      window.SolaceScenes.setState({
        dread,
        cctvProgress: cctvP,
        corridorProgress: corridorP,
        mouseNorm: {
          x: mouse.x / Math.max(1, window.innerWidth),
          y: mouse.y / Math.max(1, window.innerHeight)
        }
      });
    }

    // Auto-trigger climax if user reaches bottom
    if (p >= 0.985 && !climaxTriggered) {
      triggerClimax();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
});
