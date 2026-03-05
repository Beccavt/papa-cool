document.addEventListener("DOMContentLoaded", () => {

  const board = document.getElementById("board");
  const avatar = document.getElementById("avatar");

  const musicBtn = document.getElementById("musicBtn");
  const bgMusic = document.getElementById("bgMusic");
  const letterMusic = document.getElementById("letterMusic");

  const sfxMove = document.getElementById("sfxMove");
  const sfxOpen = document.getElementById("sfxOpen");
  const sfxEnvelope = document.getElementById("sfxEnvelope");
  const sfxWin = document.getElementById("sfxWin");

  // volume
  if(bgMusic) bgMusic.volume = 0.03;
  if(letterMusic) letterMusic.volume = 0.04;

  if(sfxMove) sfxMove.volume = 0.48;
  if(sfxOpen) sfxOpen.volume = 0.32;
  if(sfxEnvelope) sfxEnvelope.volume = 0.48;
  if(sfxWin) sfxWin.volume = 0.48;

  // start music after first click (iphone safe)
  function startBG(){
    safePlay(bgMusic);
  }

  window.addEventListener("pointerdown", startBG, { once:true });

  // music toggle
  if(musicBtn){
    musicBtn.addEventListener("click", () => {

      if(bgMusic && bgMusic.paused){
        safePlay(bgMusic);
        musicBtn.textContent = "🔊";
      }else{
        if(bgMusic) bgMusic.pause();
        if(letterMusic) letterMusic.pause();
        musicBtn.textContent = "🔈";
      }

    });
  }

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
    m1:{type:"video",src:"media/memory01.mp4",caption:"Dad's B-Day surprise"},
    m2:{type:"video",src:"media/memory02.mp4",caption:"New Orleans Trip"},
    m3:{type:"video",src:"media/memory03.mp4",caption:"Throwback"},
    m4:{type:"video",src:"media/memory04.mp4",caption:"Beautiful days"},
    m5:{type:"video",src:"media/memory05.mp4",caption:"HI DAD"},
    m6:{type:"video",src:"media/memory06.mp4",caption:"Good memories"},
    m7:{type:"video",src:"media/memory07.mp4",caption:"Love from us"}
  };

  const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,"m1",1,0,0,"m2",0,0,1],
    [1,0,0,1,0,1,1,0,1,1],
    [1,"m3",0,0,0,0,0,"m4",0,1],
    [1,1,1,0,1,1,0,1,0,1],
    [1,"m5",0,0,0,"m6",0,0,0,1],
    [1,0,1,1,0,1,0,"m7","end",1],
    [1,1,1,1,1,1,1,1,1,1],
  ];

  const ROWS = map.length;
  const COLS = map[0].length;

  const start = {x:1,y:1};
  let player = {x:start.x,y:start.y};

  board.style.gridTemplateColumns = `repeat(${COLS}, var(--tile))`;
  board.style.gridTemplateRows = `repeat(${ROWS}, var(--tile))`;

  drawTiles();
  placeAvatar();

  function drawTiles(){

    const colors=["g1","g2","g3","g4","g5"];
    let c=0;

    for(let y=0;y<ROWS;y++){
      for(let x=0;x<COLS;x++){

        const v=map[y][x];
        const tile=document.createElement("div");
        tile.className="tile";

        if(v===1){
          tile.classList.add("wall");
        }
        else if(v==="end"){
          tile.classList.add("end");
          tile.textContent="⭐";
        }
        else if(typeof v==="string"){
          tile.classList.add("memory",colors[c%colors.length]);
          tile.dataset.memory=v;
          c++;
        }

        board.insertBefore(tile,avatar);
      }
    }
  }

  window.addEventListener("keydown",(e)=>{

    const k=e.key.toLowerCase();

    if(e.key==="ArrowUp"||k==="w")move(0,-1);
    if(e.key==="ArrowDown"||k==="s")move(0,1);
    if(e.key==="ArrowLeft"||k==="a")move(-1,0);
    if(e.key==="ArrowRight"||k==="d")move(1,0);

    if(k==="e")interact();

  });

  document.querySelectorAll(".ctrl-btn[data-move]").forEach(btn=>{
    btn.addEventListener("click",()=>{

      const dir=btn.dataset.move;

      if(dir==="up")move(0,-1);
      if(dir==="down")move(0,1);
      if(dir==="left")move(-1,0);
      if(dir==="right")move(1,0);

    });
  });

  const interactBtn=document.getElementById("interactBtn");
  if(interactBtn)interactBtn.addEventListener("click",interact);

  function move(dx,dy){

    const nx=player.x+dx;
    const ny=player.y+dy;

    if(nx<0||nx>=COLS||ny<0||ny>=ROWS)return;
    if(map[ny][nx]===1)return;

    player.x=nx;
    player.y=ny;

    placeAvatar();
    play(sfxMove);

    if(map[player.y][player.x]==="end"){
      play(sfxWin);
      setTimeout(reset,350);
    }

  }

  function reset(){
    player.x=start.x;
    player.y=start.y;
    placeAvatar();
  }

  function interact(){

    const v=map[player.y][player.x];

    if(typeof v==="string"){
      openMemory(v);
    }

  }

  function placeAvatar(){

    const tilePx=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tile"));
    const gapPx=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gap"));

    const tx=player.x*(tilePx+gapPx)+tilePx/2;
    const ty=player.y*(tilePx+gapPx)+tilePx/2;

    avatar.style.left=tx+"px";
    avatar.style.top=ty+"px";

  }

  function openMemory(key){
    confettiEffect();


    const mem=memories[key];
    if(!mem)return;

    modalMedia.innerHTML="";
    modalCaption.textContent=mem.caption;

    if(mem.type==="video"){

      const v=document.createElement("video");
      v.controls=true;
      v.src=mem.src;
      v.style.width="100%";

      modalMedia.appendChild(v);

    }else{

      const img=document.createElement("img");
      img.src=mem.src;

      modalMedia.appendChild(img);

    }

    show(memoryModal,modalBackdrop);
    play(sfxOpen);

  }

  function closeMemory(){
    hide(memoryModal,modalBackdrop);
  }

  function openLetter(){
    confettiEffect();

    play(sfxEnvelope);

    if(bgMusic)bgMusic.pause();

    if(letterMusic){
      letterMusic.currentTime=0;
      safePlay(letterMusic);
    }

    show(letterModal,letterBackdrop);

  }

  function closeLetter(){

    hide(letterModal,letterBackdrop);

    if(letterMusic)letterMusic.pause();
    safePlay(bgMusic);

  }

  if(envelopeBtn)envelopeBtn.addEventListener("click",openLetter);

  modalClose.addEventListener("click",closeMemory);
  modalBackdrop.addEventListener("click",closeMemory);
  letterClose.addEventListener("click",closeLetter);
  letterBackdrop.addEventListener("click",closeLetter);

  function show(m,b){
    m.classList.add("show");
    b.classList.add("show");
  }

  function hide(m,b){
    m.classList.remove("show");
    b.classList.remove("show");
  }

  function play(a){
    if(!a)return;
    a.currentTime=0;
    safePlay(a);
  }

  function safePlay(a){
    if(!a)return;
    const p=a.play();
    if(p&&p.catch)p.catch(()=>{});
  }

});
function confettiEffect(){

  const colors = ["#ff66cc","#66ccff","#66ff99","#ffd800","#ff6666"];

  for(let i=0;i<200;i++){

    const confetti = document.createElement("div");
    confetti.className = "confetti";

    confetti.style.left = Math.random()*100 + "vw";
    confetti.style.top = "-20px";
    confetti.style.background = colors[Math.floor(Math.random()*colors.length)];

    const size = 12 + Math.random()*28; // 12–40px
    confetti.style.width = size + "px";
    confetti.style.height = size + "px";

    const dur = 2 + Math.random()*4; // 2–6s
    confetti.style.animation = `confettiFall ${dur}s linear forwards`;

    document.body.appendChild(confetti);

    setTimeout(()=> confetti.remove(), (dur*1000) + 200);
  }
}