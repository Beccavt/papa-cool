document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const avatar = document.getElementById("avatar");

  const musicBtn = document.getElementById("musicBtn");
  const bgMusic = document.getElementById("bgMusic");
  const letterMusic = document.getElementById("letterMusic");
  const bgVolume = document.getElementById("bgVolume");

  const sfxMove = document.getElementById("sfxMove");
  const sfxOpen = document.getElementById("sfxOpen");
  const sfxEnvelope = document.getElementById("sfxEnvelope");
  const sfxWin = document.getElementById("sfxWin");
  const sfxTap = document.getElementById("sfxTap");

  const modalBackdrop = document.getElementById("modalBackdrop");
  const memoryModal = document.getElementById("memoryModal");
  const modalClose = document.getElementById("modalClose");
  const modalCaption = document.getElementById("modalCaption");
  const modalMedia = document.getElementById("modalMedia");

  const letterBackdrop = document.getElementById("letterBackdrop");
  const letterModal = document.getElementById("letterModal");
  const letterClose = document.getElementById("letterClose");
  const envelopeBtn = document.getElementById("envelopeBtn");

  const memories = {
    m1: { type: "video", src: "media/memory01.mp4", caption: "Dad's B-Day surprise 2024" },
    m2: { type: "video", src: "media/memory02.mp4", caption: "Mirror MAZEEE" },
    m3: { type: "video", src: "media/memory03.mp4", caption: "Throwback of the Zoo" },
    m4: { type: "video", src: "media/memory04.mp4", caption: "Beautiful days" },
    m5: { type: "video", src: "media/memory05.mp4", caption: "B-Day 2024 memories" },
    m6: { type: "video", src: "media/memory06.mp4", caption: "HI DADDDD" },
    m7: { type: "video", src: "media/memory07.mp4", caption: "New Orleans Trip of 2025" }
  };

  const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,"m1",1,0,0,"m2",0,0,1],
    [1,0,0,1,0,1,1,0,1,1],
    [1,"m3",0,0,0,0,0,"m4",0,1],
    [1,1,1,0,1,1,0,1,0,1],
    [1,"m5",0,0,0,"m6",0,0,0,1],
    [1,0,1,1,0,1,0,"m7","end",1],
    [1,1,1,1,1,1,1,1,1,1]
  ];

  const ROWS = map.length;
  const COLS = map[0].length;

  const start = { x: 1, y: 1 };
  let player = { x: start.x, y: start.y };
  let bgStarted = false;

  function safePlay(audio) {
    if (!audio) return Promise.resolve();
    const p = audio.play();
    if (p && p.catch) {
      return p.catch(() => {});
    }
    return Promise.resolve();
  }

  function setAudioVolumes() {
    if (bgMusic && bgVolume) bgMusic.volume = parseFloat(bgVolume.value) * 0.5;
    if (letterMusic) letterMusic.volume = 0.04;
    if (sfxMove) sfxMove.volume = 1.0;
    if (sfxOpen) sfxOpen.volume = 0.32;
    if (sfxEnvelope) sfxEnvelope.volume = 0.48;
    if (sfxWin) sfxWin.volume = 0.48;
  }

  async function startBG() {
    if (!bgMusic) return;

    setAudioVolumes();

    try {
      await bgMusic.play();
      bgStarted = true;
      if (musicBtn) musicBtn.textContent = "🔊";
    } catch (err) {
      bgStarted = false;
    }
  }

  function tryStartBG() {
    if (!bgStarted) {
      startBG();
    }
  }

  window.addEventListener("pointerdown", tryStartBG);
  window.addEventListener("touchstart", tryStartBG, { passive: true });
  window.addEventListener("keydown", tryStartBG);

  if (musicBtn) {
    musicBtn.addEventListener("click", async () => {
      if (!bgMusic) return;

      setAudioVolumes();

      if (bgMusic.paused) {
        try {
          await bgMusic.play();
          bgStarted = true;
          musicBtn.textContent = "🔊";
        } catch (err) {
          bgStarted = false;
        }
      } else {
        bgMusic.pause();
        if (letterMusic) letterMusic.pause();
        musicBtn.textContent = "🔈";
      }
    });
  }

  if (bgVolume && bgMusic) {
    bgMusic.volume = parseFloat(bgVolume.value);

    bgVolume.addEventListener("input", () => {
      bgMusic.volume = parseFloat(bgVolume.value);
    });
  }

  board.style.gridTemplateColumns = `repeat(${COLS}, var(--tile))`;
  board.style.gridTemplateRows = `repeat(${ROWS}, var(--tile))`;

  drawTiles();
  placeAvatar();

  function drawTiles() {
    const colors = ["g1", "g2", "g3", "g4", "g5"];
    let c = 0;

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const v = map[y][x];
        const tile = document.createElement("div");
        tile.className = "tile";

        if (v === 1) {
          tile.classList.add("wall");
        } else if (v === "end") {
          tile.classList.add("end");
          tile.textContent = "⭐";
        } else if (typeof v === "string") {
          tile.classList.add("memory", colors[c % colors.length]);
          tile.dataset.memory = v;
          c++;
        }

        board.insertBefore(tile, avatar);
      }
    }
  }

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();

    if (e.key === "ArrowUp" || k === "w") move(0, -1);
    if (e.key === "ArrowDown" || k === "s") move(0, 1);
    if (e.key === "ArrowLeft" || k === "a") move(-1, 0);
    if (e.key === "ArrowRight" || k === "d") move(1, 0);

    if (k === "e") interact();
  });

  document.querySelectorAll(".ctrl-btn[data-move]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.move;

      if (dir === "up") move(0, -1);
      if (dir === "down") move(0, 1);
      if (dir === "left") move(-1, 0);
      if (dir === "right") move(1, 0);
    });
  });

  const interactBtn = document.getElementById("interactBtn");
  if (interactBtn) interactBtn.addEventListener("click", interact);

  function move(dx, dy) {
    const nx = player.x + dx;
    const ny = player.y + dy;

    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return;
    if (map[ny][nx] === 1) return;

    player.x = nx;
    player.y = ny;

    placeAvatar();
    play(sfxMove);

    if (map[player.y][player.x] === "end") {
      play(sfxWin);
      setTimeout(reset, 350);
    }
  }

  function reset() {
    player.x = start.x;
    player.y = start.y;
    placeAvatar();
  }

  function interact() {
    const v = map[player.y][player.x];

    if (typeof v === "string") {
      openMemory(v);
    }
  }

  function placeAvatar() {
    const tilePx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tile"));
    const gapPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gap"));

    const tx = player.x * (tilePx + gapPx) + tilePx / 2;
    const ty = player.y * (tilePx + gapPx) + tilePx / 2;

    avatar.style.left = tx + "px";
    avatar.style.top = ty + "px";
  }

  function openMemory(key) {
    confettiEffect();

    const mem = memories[key];
    if (!mem) return;

    if (bgMusic) bgMusic.pause();
    if (letterMusic) letterMusic.pause();

    modalMedia.innerHTML = "";
    modalCaption.textContent = mem.caption;

    if (mem.type === "video") {
      const v = document.createElement("video");
      v.controls = true;
      v.src = mem.src;
      v.style.width = "100%";
      v.playsInline = true;
      modalMedia.appendChild(v);
    } else {
      const img = document.createElement("img");
      img.src = mem.src;
      modalMedia.appendChild(img);
    }

    show(memoryModal, modalBackdrop);
    play(sfxOpen);
  }

  function closeMemory() {
    hide(memoryModal, modalBackdrop);

    const video = modalMedia.querySelector("video");
    if (video) video.pause();

    if (bgMusic) {
      setAudioVolumes();
      safePlay(bgMusic);
      if (musicBtn) musicBtn.textContent = "🔊";
    }
  }

  function openLetter() {
    confettiEffect();
    play(sfxEnvelope);

    if (bgMusic) bgMusic.pause();

    if (letterMusic) {
      letterMusic.currentTime = 0;
      safePlay(letterMusic);
    }

    show(letterModal, letterBackdrop);
  }

  function closeLetter() {
    hide(letterModal, letterBackdrop);

    if (letterMusic) letterMusic.pause();

    if (bgMusic) {
      setAudioVolumes();
      safePlay(bgMusic);
      if (musicBtn) musicBtn.textContent = "🔊";
    }
  }

  if (envelopeBtn) envelopeBtn.addEventListener("click", openLetter);

  if (modalClose) modalClose.addEventListener("click", closeMemory);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeMemory);
  if (letterClose) letterClose.addEventListener("click", closeLetter);
  if (letterBackdrop) letterBackdrop.addEventListener("click", closeLetter);

  function show(modal, backdrop) {
    modal.classList.add("show");
    backdrop.classList.add("show");
  }

  function hide(modal, backdrop) {
    modal.classList.remove("show");
    backdrop.classList.remove("show");
  }

  function play(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    safePlay(audio);
  }

/* KEY BUTTON PULSE + TAP SOUND */
const keyButtons = document.querySelectorAll(".key");

keyButtons.forEach((key) => {
  key.addEventListener("click", () => {

    key.classList.add("active");

    if (sfxTap) {
      sfxTap.currentTime = 0;
      safePlay(sfxTap);
    }

    setTimeout(() => {
      key.classList.remove("active");
    }, 250);

    });
  });
  
});

function confettiEffect() {
  const colors = ["#ff66cc", "#66ccff", "#66ff99", "#ffd800", "#ff6666"];

  for (let i = 0; i < 200; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = "-20px";
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];

    const size = 12 + Math.random() * 28;
    confetti.style.width = size + "px";
    confetti.style.height = size + "px";

    const dur = 2 + Math.random() * 4;
    confetti.style.animation = `confettiFall ${dur}s linear forwards`;

    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), dur * 1000 + 200);
  }
}