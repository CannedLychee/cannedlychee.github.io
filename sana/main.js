/* ==========================================================================
   咲野奈奈 Sana｜STARBERRY™ — Scroll State Machine & SANA_OS Takeover
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;

  // Fixed atmospheric refs
  const grainCanvas = document.getElementById("grain-canvas");
  const scanlines = document.getElementById("scanlines-overlay");
  const flashlight = document.getElementById("flashlight-overlay");
  const vignette = document.getElementById("vignette-overlay");
  const peripheralLayer = document.getElementById("peripheral-layer");
  const pushStack = document.getElementById("push-stack");
  const exitWarning = document.getElementById("exit-warning");
  const taintedToast = document.getElementById("tainted-toast");

  const audioPill = document.getElementById("audio-pill");
  const audioPillLabel = document.getElementById("audio-pill-label");
  const heroAudioBtn = document.getElementById("hero-audio-btn");
  const aftermathAudioBtn = document.getElementById("aftermath-audio-btn");

  const marqueeTrack = document.getElementById("marquee-track");
  const navBrandText = document.querySelector("#nav-brand .brand-text");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));

  // Act 1 refs
  const heroKicker = document.getElementById("hero-kicker");
  const heroTitle = document.getElementById("hero-title");
  const heroSubtitle = document.getElementById("hero-subtitle");
  const heroIdolImg = document.getElementById("hero-idol-img");
  const heroTaintedPlaceholder = document.getElementById("hero-tainted-placeholder");
  const heroRibbon = document.getElementById("hero-ribbon");
  const cheerBtn = document.getElementById("cheer-btn");
  const cheerCount = document.getElementById("cheer-count");
  const cheerReaction = document.getElementById("cheer-reaction");
  const dashTime = document.getElementById("dash-time");
  const schedItems = Array.from(document.querySelectorAll(".sched-item[data-tainted]"));
  const schedStatus = document.getElementById("sched-status");
  const schedViewers = document.getElementById("sched-viewers");

  // Act 2 refs
  const previewBtns = Array.from(document.querySelectorAll(".preview-btn"));
  const glitchWord = document.querySelector(".glitch-word");
  const goodsKeyCard = document.getElementById("goods-key-card");
  const keyTitle = document.getElementById("key-title");
  const keyDesc = document.getElementById("key-desc");
  const keyPrice = document.getElementById("key-price");
  const keyStatus = document.getElementById("key-status");
  const bbsBadge = document.getElementById("bbs-badge");
  const bbsLiveClock = document.getElementById("bbs-live-clock");
  const bbsObserverText = document.getElementById("bbs-observer-text");

  // Act 3 refs
  const actStream = document.getElementById("act-stream");
  const streamLivePill = document.getElementById("stream-live-pill");
  const streamTitle = document.getElementById("stream-title");
  const streamViewerCount = document.getElementById("stream-viewer-count");
  const streamClock = document.getElementById("stream-clock");
  const streamHudMode = document.getElementById("stream-hud-mode");
  const streamStatusBar = document.getElementById("stream-status-bar");
  const streamStatusText = document.getElementById("stream-status-text");
  const liveChatBadge = document.getElementById("live-chat-badge");
  const liveChatList = document.getElementById("live-chat-list");
  const liveChatForm = document.getElementById("live-chat-form");
  const liveChatInput = document.getElementById("live-chat-input");
  const scChips = [
    { el: document.getElementById("sc-1"), name: document.getElementById("sc-1-name"), msg: document.getElementById("sc-1-msg") },
    { el: document.getElementById("sc-2"), name: document.getElementById("sc-2-name"), msg: document.getElementById("sc-2-msg") },
    { el: document.getElementById("sc-3"), name: document.getElementById("sc-3-name"), msg: document.getElementById("sc-3-msg") }
  ];

  // Act 4 SANA_OS 98 refs
  const jineLog = document.getElementById("jine-log");
  const jineLoveBtn = document.getElementById("jine-love-btn");
  const jineSleepBtn = document.getElementById("jine-sleep-btn");
  const sleepArena = document.getElementById("sleep-arena");
  const jineCrazySlot = document.getElementById("jine-crazy-slot");
  const contractChecks = Array.from(document.querySelectorAll(".contract-check"));
  const contractFeedback = document.getElementById("contract-feedback");
  const sysViewport = document.getElementById("sys-viewport");
  const sysDuration = document.getElementById("sys-duration");
  const sysIdle = document.getElementById("sys-idle");
  const osClock = document.getElementById("os-clock");

  // Act 5 & 6 refs
  const actCorridor = document.getElementById("act-corridor");
  const corridorCaption = document.getElementById("corridor-caption");
  const acceptCallBtn = document.getElementById("accept-call-btn");
  const declineCallBtn = document.getElementById("decline-call-btn");
  const callNote = document.getElementById("call-note");
  const climaxStage = document.getElementById("climax-stage");
  const climaxText = document.getElementById("climax-text");
  const aftermathScreen = document.getElementById("aftermath-screen");
  const aftermathTime = document.getElementById("aftermath-time");
  const resetBtn = document.getElementById("reset-btn");

  const assets = window.SANA_ASSETS || {};

  // Runtime state
  const sessionStart = performance.now();
  let targetScroll = 0;
  let smoothScroll = 0;
  let dread = 0;
  let tainted = false;
  let taintedToastShown = false;
  let climaxTriggered = false;
  let climaxTimers = [];
  let lastMouseMoveAt = performance.now();
  let mouse = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
  let cheerClicks = 0;
  let cheersTotal = 520131;
  let sleepDodges = 0;
  let streamCorrupted = false;
  let chatStreamTimer = null;
  let activeApparition = null;
  let lastApparitionAt = 0;
  let exitWarnTimer = null;

  const NORMAL_MARQUEE =
    "★ 祝贺咲野奈奈出道三周年 ★ 周五 20:00 草莓蛋糕歌回 ★ 三周年限定弹唱专辑发售中 ♡ ★ 祝贺咲野奈奈出道三周年 ★ 周五 20:00 草莓蛋糕歌回 ★ 三周年限定弹唱专辑发售中 ♡";
  const TAINTED_MARQUEE =
    "† 不要关掉这个网页 † 你只准看咲野奈奈一个人 † 门已经反锁了哦♡ † 不要关掉这个网页 † 你只准看咲野奈奈一个人 † 门已经反锁了哦♡ †";

  const pushMilestones = [
    { at: 0.22, sent: false, creepy: false, text: "刚发现你一直在逛奈奈的主页，好开心♡" },
    { at: 0.44, sent: false, creepy: true, text: "为什么停下来了？你刚刚切出去看别的主播了吗？" },
    { at: 0.68, sent: false, creepy: true, text: "我已经把你的退路锁死了哦♡ 不准关掉网页。" }
  ];

  const sleepLabels = ["【我要去睡了】", "【不准睡】", "【陪着奈奈♡】", "【门已经锁了】", "【留下来】"];
  const forcedDanmaku = [
    "我发誓永远只喜欢咲野奈奈一个人♡",
    "我绝对不会离开这间直播间",
    "请一直盯着我看吧，奈奈♡"
  ];

  // Store original schedule text for clean reset
  schedItems.forEach((el) => {
    el.dataset.orig = el.textContent;
  });

  // Render real stickerCrazy in Act 4 JINE window if present later
  function renderCrazyStickerSlot() {
    if (!jineCrazySlot) return;
    if (assets.stickerCrazy) {
      jineCrazySlot.innerHTML = `<img src="${assets.stickerCrazy}" alt="病娇贴纸" class="jine-sticker-img" />`;
    } else {
      jineCrazySlot.innerHTML =
        `<div class="placeholder-box placeholder-sticker">[ 占位：sana-sticker-crazy.jpg ]</div>`;
    }
  }
  renderCrazyStickerSlot();

  // Initialize Canvas Scenes
  if (window.SanaScenes) {
    window.SanaScenes.init({
      onFlicker: () => {
        if (window.SanaAudio) window.SanaAudio.triggerFlicker();
      }
    });
  }

  // ==================== Audio UI Helpers ====================
  function syncAudioLabels(isPlaying) {
    if (isPlaying) {
      audioPill.setAttribute("aria-pressed", "true");
      audioPillLabel.textContent = dread > 0.55 ? "🔊 琴弦正在黑暗中走音" : "🔊 八音盒 BGM 播放中♡";
      if (heroAudioBtn) heroAudioBtn.textContent = "🔇 暂停八音盒 BGM";
      if (aftermathAudioBtn) aftermathAudioBtn.textContent = "静音";
    } else {
      audioPill.setAttribute("aria-pressed", "false");
      audioPillLabel.textContent = dread > 0.55 ? "🔇 静音也逃不掉的哦" : "🎵 播放奈奈的八音盒 BGM";
      if (heroAudioBtn) heroAudioBtn.textContent = "🎵 播放八音盒 BGM";
      if (aftermathAudioBtn) aftermathAudioBtn.textContent = "开启声音";
    }
  }

  async function toggleAudio() {
    if (!window.SanaAudio) return;
    const playing = await window.SanaAudio.initAndToggle();
    syncAudioLabels(playing);
  }

  audioPill.addEventListener("click", toggleAudio);
  if (heroAudioBtn) heroAudioBtn.addEventListener("click", toggleAudio);
  if (aftermathAudioBtn) aftermathAudioBtn.addEventListener("click", toggleAudio);

  // ==================== Clocks ====================
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function updateClock() {
    const now = new Date();
    const hm = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    const hms = `${hm}:${pad2(now.getSeconds())}`;
    const ymd = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${hms}`;
    if (dashTime) dashTime.textContent = hms;
    if (bbsLiveClock) bbsLiveClock.textContent = hms;
    if (streamClock) streamClock.textContent = ymd;
    if (osClock) osClock.textContent = hm;
    if (aftermathTime) {
      const staySec = Math.floor((performance.now() - sessionStart) / 1000);
      aftermathTime.textContent = `记录已永久绑定 (${hms} · 已停留 ${staySec}s) · 当前房间人数：2（你与咲野奈奈）`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ==================== Pointer, Flashlight & Exit-Intent ====================
  function updatePointer(clientX, clientY) {
    mouse.x = clientX;
    mouse.y = clientY;
    lastMouseMoveAt = performance.now();
    root.style.setProperty("--mx", `${clientX}px`);
    root.style.setProperty("--my", `${clientY}px`);

    if (dread > 0.55 && !climaxTriggered && clientY <= 26) {
      exitWarning.classList.add("show");
      clearTimeout(exitWarnTimer);
      exitWarnTimer = setTimeout(() => exitWarning.classList.remove("show"), 1800);
    }

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

  // ==================== Act 1 Cheer Interaction ====================
  if (cheerBtn) {
    cheerBtn.addEventListener("click", () => {
      cheerClicks++;
      cheersTotal++;
      cheerCount.textContent = cheersTotal.toLocaleString();
      if (cheerClicks <= 2) {
        cheerReaction.textContent = "收到你的心意啦♡ 最喜欢你了！";
      } else if (cheerClicks <= 4) {
        cheerReaction.textContent = "点了这么多次……以后就不许再去应援别的女孩子了哦♡";
      } else {
        cheerReaction.textContent = "手别停。你的视线和手指现在都归奈奈管了♡";
      }
      if (window.SanaAudio) window.SanaAudio.triggerMessagePing(cheerClicks > 3);
    });
  }

  // ==================== Act 2 Goods Voice Preview & Glitch Word ====================
  previewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isCreepy = btn.dataset.preview === "creepy";
      const card = btn.closest(".goods-meta");
      const sub = card ? card.querySelector(".preview-sub") : null;
      if (sub) {
        sub.hidden = false;
        sub.textContent = isCreepy
          ? "「♪ 别关掉播放器……这首歌，你不许唱给别人听♡」"
          : "「♪ 无论多晚，奈奈都会抱着吉他为你唱下去哦♡」";
      }
      if (window.SanaAudio) window.SanaAudio.playVoicePreview(isCreepy);
    });
  });

  if (glitchWord) {
    const orig = glitchWord.textContent;
    const alt = glitchWord.dataset.alt || orig;
    glitchWord.addEventListener("mouseenter", () => {
      glitchWord.textContent = alt;
      glitchWord.classList.add("swapped");
    });
    glitchWord.addEventListener("mouseleave", () => {
      if (dread < 0.42) {
        glitchWord.textContent = orig;
        glitchWord.classList.remove("swapped");
      }
    });
  }

  // ==================== Act 3 Live Chat Stream & Hijacked Input ====================
  function appendLiveChat(name, msg, opts = {}) {
    if (!liveChatList) return;
    const row = document.createElement("div");
    row.className = `lc-item${opts.creepy ? " creepy" : ""}${opts.mine ? " mine" : ""}`;
    const nameSpan = document.createElement("span");
    nameSpan.className = "lc-name";
    nameSpan.textContent = `${name}：`;
    const msgSpan = document.createElement("span");
    msgSpan.textContent = msg;
    row.appendChild(nameSpan);
    row.appendChild(msgSpan);
    liveChatList.appendChild(row);
    while (liveChatList.children.length > 18) {
      liveChatList.removeChild(liveChatList.firstChild);
    }
    liveChatList.scrollTop = liveChatList.scrollHeight;
  }

  const cuteChatPool = [
    ["糖心莓子", "奈奈声音好治愈♡"],
    ["小奶糕", "88888888"],
    ["kksk", "小狗耳朵抖得好萌"],
    ["星光粉", "今天也来报到了！"]
  ];
  const creepyChatPool = [
    ["咲野奈奈", "只准看着我"],
    ["咲野奈奈", "不要关掉直播间"],
    ["SYSTEM", "已屏蔽其他所有关注频道"],
    ["咲野奈奈", "你刚才切出去看谁了？♡"]
  ];

  chatStreamTimer = setInterval(() => {
    const pool = streamCorrupted ? creepyChatPool : cuteChatPool;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    appendLiveChat(pick[0], pick[1], { creepy: streamCorrupted });
  }, 2400);

  if (liveChatForm && liveChatInput) {
    liveChatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = liveChatInput.value.trim();
      if (!raw) return;
      if (streamCorrupted) {
        const hijacked = forcedDanmaku[Math.floor(Math.random() * forcedDanmaku.length)];
        appendLiveChat("你（已被接管）", hijacked, { creepy: true, mine: true });
        if (window.SanaAudio) window.SanaAudio.triggerMessagePing(true);
      } else {
        appendLiveChat("你", raw, { mine: true });
        if (window.SanaAudio) window.SanaAudio.triggerMessagePing(false);
      }
      liveChatInput.value = "";
    });
  }

  // ==================== Top-Right Push Notifications ====================
  function pushNotification(text, creepy) {
    if (!pushStack) return;
    const card = document.createElement("div");
    card.className = `push-toast${creepy ? " creepy" : ""}`;

    const avatar = document.createElement("div");
    avatar.className = "push-avatar";
    const avatarSrc = creepy ? assets.streamYandere : assets.heroIdol;
    if (avatarSrc) {
      const img = document.createElement("img");
      img.src = avatarSrc;
      img.alt = "";
      avatar.appendChild(img);
    }

    const content = document.createElement("div");
    content.className = "push-content";
    const head = document.createElement("div");
    head.className = "push-head";
    head.innerHTML = `<strong>咲野奈奈 Sana</strong><span>刚刚</span>`;
    const msg = document.createElement("p");
    msg.className = "push-msg";
    msg.textContent = text;
    content.appendChild(head);
    content.appendChild(msg);

    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "push-dismiss";
    dismiss.textContent = "×";
    dismiss.addEventListener("click", () => card.remove());

    card.appendChild(avatar);
    card.appendChild(content);
    card.appendChild(dismiss);
    pushStack.appendChild(card);

    while (pushStack.children.length > 3) {
      pushStack.removeChild(pushStack.firstChild);
    }
    if (window.SanaAudio) window.SanaAudio.triggerMessagePing(creepy);
    setTimeout(() => {
      if (card.parentNode) card.remove();
    }, 6500);
  }

  // ==================== Act 4 SANA_OS 98 Interactions ====================
  if (jineLoveBtn && jineLog) {
    jineLoveBtn.addEventListener("click", () => {
      const u = document.createElement("div");
      u.className = "jine-msg user";
      u.textContent = "我只喜欢奈奈♡";
      jineLog.appendChild(u);

      const r = document.createElement("div");
      r.className = "jine-msg alert";
      r.textContent = "嗯♡ 记住你现在说的话哦，反悔的话门外会响起来的。";
      jineLog.appendChild(r);
      jineLog.scrollTop = jineLog.scrollHeight;
      if (window.SanaAudio) window.SanaAudio.triggerMessagePing(true);
    });
  }

  function dodgeSleepBtn() {
    if (!sleepArena || !jineSleepBtn) return;
    sleepDodges++;
    jineSleepBtn.textContent = sleepLabels[Math.min(sleepLabels.length - 1, sleepDodges)];
    jineSleepBtn.style.width = "auto";
    const maxX = Math.max(18, sleepArena.clientWidth - jineSleepBtn.offsetWidth - 6);
    const maxY = Math.max(4, sleepArena.clientHeight - jineSleepBtn.offsetHeight - 4);
    jineSleepBtn.style.left = `${Math.floor(Math.random() * maxX)}px`;
    jineSleepBtn.style.top = `${Math.floor(Math.random() * maxY)}px`;
  }

  if (jineSleepBtn) {
    jineSleepBtn.addEventListener("mouseenter", dodgeSleepBtn);
    jineSleepBtn.addEventListener("click", (e) => {
      e.preventDefault();
      dodgeSleepBtn();
    });
  }

  contractChecks.forEach((box) => {
    box.addEventListener("change", () => {
      if (!box.checked && dread >= Number(box.dataset.threshold || 0.58)) {
        contractFeedback.textContent = "奈奈会哭的哦，不许取消♡";
        setTimeout(() => {
          box.checked = true;
        }, 480);
      }
    });
  });

  // ==================== Peripheral Apparitions ====================
  function maybeSpawnApparition(now) {
    if (dread < 0.45 || dread > 0.88 || activeApparition || now - lastApparitionAt < 9500) return;
    if (Math.random() > 0.02) return;

    lastApparitionAt = now;
    const el = document.createElement("div");
    el.className = "apparition";
    const onLeft = Math.random() < 0.5;
    el.style.left = onLeft ? "14px" : "auto";
    el.style.right = onLeft ? "auto" : "14px";
    el.style.top = `${18 + Math.random() * 52}vh`;
    el.innerHTML = `
      <svg viewBox="0 0 70 150" width="92" height="180" aria-hidden="true">
        <ellipse cx="21" cy="21" rx="6" ry="11" transform="rotate(-18 21 21)" fill="#0d0309" />
        <ellipse cx="49" cy="21" rx="6" ry="11" transform="rotate(18 49 21)" fill="#0d0309" />
        <ellipse cx="35" cy="34" rx="14" ry="18" fill="#0d0309" />
        <path d="M14,58 Q35,44 56,58 L62,148 L8,148 Z" fill="#0d0309" />
        <circle cx="29" cy="32" r="2.2" fill="rgba(251, 113, 133, 0.85)" />
        <circle cx="41" cy="32" r="2.2" fill="rgba(251, 113, 133, 0.85)" />
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
    }, 3500);
  }

  // ==================== Act 6 Climax & Full Reset ====================
  function triggerClimax() {
    if (climaxTriggered) return;
    climaxTriggered = true;
    document.title = "找 到 你 了 ♡";
    flashlight.style.opacity = "0";
    exitWarning.classList.remove("show");

    if (window.SanaAudio) window.SanaAudio.triggerClimaxStinger();

    climaxStage.removeAttribute("hidden");
    climaxText.textContent = "";
    aftermathScreen.setAttribute("hidden", "");

    const t1 = setTimeout(() => {
      body.classList.add("climax-active", "climax-shake");
      if (window.SanaScenes) window.SanaScenes.startClimax();

      const chars = ["找", "到", "你", "了", "♡"];
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
    }, 4100);
    climaxTimers.push(t2);
  }

  if (acceptCallBtn) {
    acceptCallBtn.addEventListener("click", triggerClimax);
  }

  if (declineCallBtn) {
    declineCallBtn.addEventListener("click", () => {
      if (callNote) callNote.textContent = "拒绝失败：她已经自己接通了。";
      setTimeout(triggerClimax, 420);
    });
  }

  function resetExperience() {
    climaxTimers.forEach((id) => clearTimeout(id));
    climaxTimers = [];
    climaxTriggered = false;
    tainted = false;
    taintedToastShown = false;
    streamCorrupted = false;
    cheerClicks = 0;
    cheersTotal = 520131;
    sleepDodges = 0;

    body.classList.remove("climax-active", "climax-shake", "tainted", "dread-dark", "dread-horror");
    climaxStage.setAttribute("hidden", "");
    aftermathScreen.setAttribute("hidden", "");
    climaxText.textContent = "";
    taintedToast.classList.remove("show");
    exitWarning.classList.remove("show");
    if (pushStack) pushStack.innerHTML = "";

    if (window.SanaScenes) window.SanaScenes.stopClimax();
    if (window.SanaAudio) window.SanaAudio.resetToCalm();

    // Restore Marquee & Act 1
    if (marqueeTrack) marqueeTrack.innerHTML = `<span>${NORMAL_MARQUEE}</span>`;
    heroKicker.textContent = "STARBERRY™ // 1ST GEN · 3RD ANNIVERSARY";
    heroTitle.textContent = "咲野奈奈 Sana";
    heroSubtitle.textContent =
      "草莓奶茶系小狗天使主播♡ 每天用温暖的吉他弹唱与轻甜歌回，把你的夜晚填得满满当当。只要你还愿意听她唱歌，奈奈就永远不会离开。";
    cheerCount.textContent = "520,131";
    cheerReaction.textContent = "点击应援按钮，奈奈会收到你的心意哦♡";
    heroIdolImg.src = assets.heroIdol || "assets/sana-hero-idol.jpg";
    heroIdolImg.hidden = false;
    heroTaintedPlaceholder.hidden = true;
    heroRibbon.textContent = "OFFICIAL KEY VISUAL ♡";
    schedStatus.textContent = "● 心情超好♡";
    schedViewers.textContent = "预约人数：128,492";
    schedItems.forEach((el) => {
      if (el.dataset.orig) el.textContent = el.dataset.orig;
    });

    // Restore Act 2
    document.querySelectorAll(".preview-sub").forEach((el) => {
      el.hidden = true;
      el.textContent = "";
    });
    if (glitchWord) {
      glitchWord.textContent = "轻声为你弹唱";
      glitchWord.classList.remove("swapped");
    }
    if (goodsKeyCard) goodsKeyCard.classList.remove("corrupted");
    keyTitle.textContent = "「奈奈的房间钥匙」";
    keyDesc.textContent = "连续观看直播 100 小时即可自动解锁的神秘礼物。";
    keyPrice.textContent = "非卖品";
    keyStatus.textContent = "已为你预留";
    bbsBadge.textContent = "在线讨论 412";

    // Restore Act 3
    streamLivePill.textContent = "● LIVE";
    streamTitle.textContent = "【三周年】和大家一起切草莓蛋糕♡";
    streamViewerCount.textContent = "128,492";
    streamStatusBar.classList.remove("intrusion");
    streamStatusText.textContent = "房间信号极佳 · 欢迎发送弹幕与奈奈互动♡";
    streamHudMode.textContent = "1080P 60FPS · SANA♡LIVE";
    liveChatBadge.textContent = "弹幕正常";
    liveChatList.innerHTML = `
      <div class="lc-item"><span class="lc-name">莓果派：</span><span>奈奈今天超甜！！</span></div>
      <div class="lc-item"><span class="lc-name">小雪：</span><span>小狗耳朵动起来好可爱呜呜</span></div>
      <div class="lc-item"><span class="lc-name">晚安曲：</span><span>草莓蛋糕看起来好好吃</span></div>
      <div class="lc-item"><span class="lc-name">单推bot：</span><span>永远喜欢咲野奈奈♡</span></div>`;
    scChips[0].name.textContent = "糖心莓子";
    scChips[0].msg.textContent = "¥50 奈奈永远最可爱！";
    scChips[1].name.textContent = "星光骑士";
    scChips[1].msg.textContent = "¥198 祝三周年快乐♡";
    scChips[2].name.textContent = "Kuro_09";
    scChips[2].msg.textContent = "¥500 明天也能见到你吗";
    scChips.forEach((c) => c.el.classList.remove("corrupted"));

    // Restore Act 4 & 6
    pushMilestones.forEach((m) => (m.sent = false));
    contractChecks.forEach((c) => (c.checked = false));
    contractFeedback.textContent = "正在等待你的确认……♡";
    if (jineSleepBtn) {
      jineSleepBtn.textContent = "【我要去睡了】";
      jineSleepBtn.style.left = "0";
      jineSleepBtn.style.top = "2px";
      jineSleepBtn.style.width = "100%";
    }
    if (callNote) callNote.textContent = "正在请求接通你的屏幕与麦克风……";

    targetScroll = 0;
    smoothScroll = 0;
    dread = 0;
    window.scrollTo({ top: 0, behavior: "instant" });
    syncAudioLabels(window.SanaAudio && !window.SanaAudio.isMuted());
  }

  if (resetBtn) resetBtn.addEventListener("click", resetExperience);

  // ==================== Scroll & Frame Update Loop ====================
  function computeProgress() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    targetScroll = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  }
  window.addEventListener("scroll", computeProgress, { passive: true });
  computeProgress();

  function computeStreamProgress(el) {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const span = Math.max(1, rect.height - window.innerHeight * 0.85);
    return Math.max(0, Math.min(1, (-rect.top + window.innerHeight * 0.05) / span));
  }

  function updateNavLabels(p) {
    const mode = tainted && p < 0.3 ? "tainted" : p > 0.7 ? "horror" : p > 0.32 ? "uncanny" : "normal";
    [navBrandText, ...navLinks].forEach((el) => {
      if (!el) return;
      const next = el.dataset[mode];
      if (next && el.textContent !== next) el.textContent = next;
    });
  }

  function frame(now) {
    smoothScroll += (targetScroll - smoothScroll) * 0.14;
    const p = smoothScroll;
    dread = Math.max(0, Math.min(1, (p - 0.14) / 0.82));

    root.style.setProperty("--progress", p.toFixed(4));
    root.style.setProperty("--dread", dread.toFixed(4));

    grainCanvas.style.opacity = dread > 0.14 ? Math.min(0.65, (dread - 0.14) * 0.72).toFixed(3) : "0";
    scanlines.style.opacity = dread > 0.32 ? Math.min(0.48, (dread - 0.32) * 0.58).toFixed(3) : "0";
    vignette.style.opacity = dread > 0.2 ? Math.min(0.92, (dread - 0.2) * 1.05).toFixed(3) : "0";

    // Spotlight reserved for Act 5 deep void (past 74%)
    if (!climaxTriggered && p > 0.74) {
      const flashAlpha = Math.min(0.95, ((p - 0.74) / 0.08) * 0.95);
      flashlight.style.opacity = flashAlpha.toFixed(3);
    } else {
      flashlight.style.opacity = "0";
    }

    body.classList.toggle("dread-dark", p > 0.36 || tainted);
    body.classList.toggle("dread-horror", p > 0.64 || tainted);

    // Tainted irreversible state past 62%
    if (p >= 0.62 && !tainted) {
      tainted = true;
      body.classList.add("tainted");
      if (marqueeTrack) marqueeTrack.innerHTML = `<span>${TAINTED_MARQUEE}</span>`;
      heroKicker.textContent = "SANA_LOCK // 单推契约已不可逆生效";
      heroTitle.textContent = "想逃回上面吗？已经晚了哦♡";
      heroSubtitle.textContent =
        "不要再想着点右上角的关闭按钮了。这间卧室的灯光、日程表与直播机位，现在永远只对准你一个人。";
      if (assets.streamYandere) {
        heroIdolImg.src = assets.streamYandere;
        heroIdolImg.hidden = false;
        heroTaintedPlaceholder.hidden = true;
      } else {
        heroIdolImg.hidden = true;
        heroTaintedPlaceholder.hidden = false;
      }
      heroRibbon.textContent = "● LOCKED · 只有你和奈奈";
      schedStatus.textContent = "● 正在看着你";
      schedViewers.textContent = "当前观看：1 人";
      schedItems.forEach((el) => {
        el.textContent = el.dataset.tainted;
      });
    }

    if (tainted && p < 0.2 && !taintedToastShown) {
      taintedToastShown = true;
      taintedToast.classList.add("show");
      setTimeout(() => taintedToast.classList.remove("show"), 4200);
    }

    // Tab title mutations
    if (!climaxTriggered) {
      if (tainted && p < 0.26) document.title = "想逃回上面吗？门已经锁死了哦♡";
      else if (p < 0.22) document.title = "咲野奈奈 Sana｜STARBERRY™ 官方主页";
      else if (p < 0.45) document.title = "奈奈一直在等你哦♡";
      else if (p < 0.7) document.title = "你刚才切出去看谁了？";
      else if (p < 0.94) document.title = "它在屏幕玻璃后面";
      else document.title = "无法挂断的视频来电";
    }

    updateNavLabels(p);

    // Act 2 mutations
    if (p > 0.25) {
      if (glitchWord) {
        glitchWord.textContent = glitchWord.dataset.alt;
        glitchWord.classList.add("swapped");
      }
      if (goodsKeyCard) goodsKeyCard.classList.add("corrupted");
      keyTitle.textContent = "「你已经进来了」";
      keyDesc.textContent = "不用付钱。把你的全部注意力留在这里就够了。";
      keyPrice.textContent = "已生效";
      keyStatus.textContent = "不可退货";
      bbsBadge.textContent = "仅剩 1 人在线";
    }

    const staySec = Math.floor((now - sessionStart) / 1000);
    const idleSec = Math.floor((now - lastMouseMoveAt) / 1000);
    if (bbsObserverText) {
      bbsObserverText.textContent = `背地里说奈奈坏话是不对的哦♡ 正在看这条帖子的那位（视窗 ${window.innerWidth}×${window.innerHeight} · 已停留 ${staySec}s），不要偷偷划走嘛。`;
    }
    if (sysViewport) sysViewport.textContent = `${window.innerWidth} × ${window.innerHeight}`;
    if (sysDuration) sysDuration.textContent = `${staySec}s`;
    if (sysIdle) sysIdle.textContent = `${idleSec}s`;

    // Act 3 stream mutations
    const streamP = computeStreamProgress(actStream);
    if (streamP >= 0.5 && !streamCorrupted) {
      streamCorrupted = true;
      streamLivePill.textContent = "● NO ESCAPE";
      streamTitle.textContent = "【深夜封锁回】把其他人都踢出去了，现在只剩你一个♡";
      streamViewerCount.textContent = "1 (ONLY YOU)";
      streamStatusBar.classList.add("intrusion");
      streamStatusText.textContent = "弹幕发送权已被接管 · 她现在只对你一个人说话♡";
      streamHudMode.textContent = "IR NIGHT CAM · LOCKED";
      liveChatBadge.textContent = "弹幕已被接管";
      scChips[0].name.textContent = "¥99999 咲野奈奈";
      scChips[0].msg.textContent = "你为什么不说话？";
      scChips[1].name.textContent = "¥99999 咲野奈奈";
      scChips[1].msg.textContent = "不许看别的地方♡";
      scChips[2].name.textContent = "¥99999 咲野奈奈";
      scChips[2].msg.textContent = "永远只推我好不好";
      scChips.forEach((c) => c.el.classList.add("corrupted"));
    } else if (!streamCorrupted && streamP > 0.34) {
      const drop = Math.max(24, Math.floor(128492 * (1 - (streamP - 0.34) * 5.2)));
      streamViewerCount.textContent = drop.toLocaleString();
    }

    // Act 4 auto-checking checkboxes
    contractChecks.forEach((box) => {
      const threshold = Number(box.dataset.threshold || 0.65);
      if (p >= threshold && !box.checked) {
        box.checked = true;
        contractFeedback.textContent = "奈奈替你勾好了哦♡ 现在你只属于我了。";
      }
    });

    // Act 5 sticky captions
    let corridorP = 0;
    if (actCorridor) {
      const rect = actCorridor.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      corridorP = Math.max(0, Math.min(1, -rect.top / span));
      if (corridorCaption) {
        if (corridorP < 0.22) corridorCaption.textContent = "可爱的小狗耳朵和声音……你喜欢的只是这层皮囊吗？";
        else if (corridorP < 0.48) corridorCaption.textContent = "我把 Live2D 滤镜关掉了哦。";
        else if (corridorP < 0.74) corridorCaption.textContent = "别闭眼。不要躲开她的眼睛。";
        else corridorCaption.textContent = "再贴近一点，她就能穿过玻璃碰到你了。";
      }
    }

    // Push notifications
    pushMilestones.forEach((m) => {
      if (!m.sent && p >= m.at) {
        m.sent = true;
        pushNotification(m.text, m.creepy);
      }
    });

    maybeSpawnApparition(now);

    if (window.SanaAudio) window.SanaAudio.setDread(dread);
    if (window.SanaScenes) {
      window.SanaScenes.setState({
        dread,
        streamProgress: streamP,
        corridorProgress: corridorP,
        mouseNorm: {
          x: mouse.x / Math.max(1, window.innerWidth),
          y: mouse.y / Math.max(1, window.innerHeight)
        }
      });
    }

    if (p >= 0.985 && !climaxTriggered) {
      triggerClimax();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
});
