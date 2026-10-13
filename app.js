(() => {
  'use strict';
  const TAPS_NEEDED = 16;
  const CARD_HOLD_MS = 3400;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const loot = [
    { src: "assets/card-kitty.webp", label: "Kitty แดงสดใส", alt: "การ์ดวันเกิดลายแมวคิตตี้" },
    { src: "assets/card-kitty-gift.webp", label: "กล่องของขวัญ Kitty", alt: "การ์ดคิตตี้กับกล่องของขวัญ" },
    { src: "assets/card-furina-1.webp", label: "Furina Cat มาอวยพร", alt: "การ์ดแมว Furina อวยพรวันเกิด" },
    { src: "assets/card-melody.webp", label: "My Melody สีสตรอว์เบอร์รี", alt: "การ์ดวันเกิด My Melody" },
    { src: "assets/card-kitty-party.webp", label: "Kitty Party!", alt: "การ์ดงานปาร์ตี้คิตตี้" },
    { src: "assets/card-furina-2.webp", label: "แมว Furina วิ้ง ๆ", alt: "การ์ดแมว Furina สีชมพู" },
    { src: "assets/card-kitty-pink-cake.webp", label: "เค้กชมพูของ Kitty", alt: "การ์ดคิตตี้กับเค้กวันเกิดสีชมพู" },
    { src: "assets/card-furina-3.webp", label: "Furina Cat อีกหนึ่งใบ", alt: "การ์ดแมว Furina ฉลองวันเกิด" },
    { src: "assets/card-furina-cake.webp", label: "Furina Cat & Strawberry Cake", alt: "การ์ดแมว Furina กับเค้กสตรอว์เบอร์รี" }
  ];
  const finale = {
    src: "assets/kitty-cake.webp",
    label: "เค้ก Kitty ชิ้นใหญ่ที่สุด!",
    alt: "เค้กคิตตี้สตรอว์เบอร์รีสำหรับวันเกิด"
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const els = {
    app: $('#app'), screens: [...document.querySelectorAll('.screen')],
    gift: $('#giftScreen'), reveal: $('#revealScreen'), gallery: $('#galleryScreen'),
    giftButton: $('#giftButton'), tapCopy: $('#tapCopy'), focus: $('#focusSlot'),
    physics: $('#physicsLayer'), flash: $('#flashLayer'), canvas: $('#fxCanvas'),
    template: $('#imageRevealTemplate'), grid: $('#galleryGrid'), replay: $('#replayButton'),
    announce: $('#announcer'), music: $('#backgroundMusic')
  };
  const machine = {state: 'charging', taps: 0, revealIndex: 0, revealToken: 0,
    timers: new Set(), sequenceTimers: new Set()};

  // Freeze the storyboard clock while the phone is locked or the tab is hidden.
  function schedule(task) {
    if (document.hidden) return;
    task.due = performance.now() + task.remaining;
    task.id = setTimeout(() => {
      task.id = 0;
      if (document.hidden) { task.remaining = 0; return; }
      task.bucket.delete(task);
      task.fn();
    }, task.remaining);
  }
  function later(fn, delay, sequence = false) {
    const bucket = sequence ? machine.sequenceTimers : machine.timers;
    const task = {fn, remaining: delay, due: 0, id: 0, bucket};
    bucket.add(task); schedule(task); return task;
  }
  function clearBucket(bucket) {
    bucket.forEach(task => clearTimeout(task.id)); bucket.clear();
  }
  function announce(message) { els.announce.textContent = message; }
  function setScreen(active, focusTarget) {
    els.screens.forEach(screen => {
      const on = screen === active;
      screen.classList.toggle('is-active', on);
      screen.setAttribute('aria-hidden', String(!on)); screen.inert = !on;
    });
    if (focusTarget) later(() => focusTarget.focus({preventScroll: true}), 430);
  }
  let musicStarted = false;
  let resumeMusic = false;
  els.music.volume = .7;
  function startMusic() {
    if (!els.music.paused) return;
    const play = els.music.play();
    if (play) play.then(() => { musicStarted = true; }).catch(() => {});
  }
  const preloadCache = [...loot, finale].map(item => {
    const image = new Image(); image.decoding = 'async'; image.src = item.src; return image;
  });
  const physics = {
    objects: [],
    raf: 0,
    last: 0,
    running: false,
    spawn(item, power = 1) {
      if (reduceMotion.matches) return;
      const node = document.createElement("div");
      node.className = "physics-object";
      node.innerHTML = `<div class="physics-card"><img src="${item.src}" alt="" draggable="false" data-fallback="${item.label}"></div>`;
      els.physics.append(node);
      const rect = els.physics.getBoundingClientRect();
      const w = node.offsetWidth || 82;
      const h = node.offsetHeight || 102;
      const angle = (Math.random() * .9 - .45);
      const speed = (310 + Math.random() * 160) * power;
      const obj = {
        node, x: rect.width / 2 - w / 2, y: rect.height * .54,
        vx: Math.sin(angle) * speed + (Math.random() - .5) * 110,
        vy: -Math.cos(angle) * speed * 1.25,
        rot: (Math.random() - .5) * 15, vr: (Math.random() - .5) * 190,
        w, h, dragging: false, pointerId: null, lastPointerX: 0, lastPointerY: 0, lastPointerAt: 0
      };
      this.bindDrag(obj);
      this.objects.push(obj);
      this.render(obj);
      this.start();
    },
    bindDrag(obj) {
      const node = obj.node;
      node.addEventListener("pointerdown", (event) => {
        if (machine.state === "gallery") return;
        event.preventDefault();
        obj.dragging = true;
        obj.pointerId = event.pointerId;
        obj.lastPointerX = event.clientX;
        obj.lastPointerY = event.clientY;
        obj.lastPointerAt = performance.now();
        obj.vx = obj.vy = 0;
        node.classList.add("is-dragging");
        node.setPointerCapture(event.pointerId);
      });
      node.addEventListener("pointermove", (event) => {
        if (!obj.dragging || event.pointerId !== obj.pointerId) return;
        const now = performance.now();
        const dt = Math.max(8, now - obj.lastPointerAt) / 1000;
        const dx = event.clientX - obj.lastPointerX;
        const dy = event.clientY - obj.lastPointerY;
        obj.x += dx; obj.y += dy;
        obj.vx = dx / dt; obj.vy = dy / dt;
        obj.lastPointerX = event.clientX; obj.lastPointerY = event.clientY; obj.lastPointerAt = now;
        this.render(obj);
      });
      const release = (event) => {
        if (!obj.dragging || event.pointerId !== obj.pointerId) return;
        obj.dragging = false;
        obj.pointerId = null;
        obj.vx = Math.max(-850, Math.min(850, obj.vx));
        obj.vy = Math.max(-900, Math.min(900, obj.vy));
        node.classList.remove("is-dragging");
      };
      node.addEventListener("pointerup", release);
      node.addEventListener("pointercancel", release);
    },
    start() {
      if (this.running || document.hidden) return;
      this.running = true; this.last = performance.now();
      this.raf = requestAnimationFrame((time) => this.tick(time));
    },
    tick(time) {
      if (!this.running) return;
      const dt = Math.min(.032, (time - this.last) / 1000 || .016);
      this.last = time;
      const bounds = els.physics.getBoundingClientRect();
      let moving = false;
      for (const obj of this.objects) {
        if (!obj.node.isConnected) continue;
        if (!obj.dragging) {
          obj.vy += 1080 * dt;
          obj.x += obj.vx * dt;
          obj.y += obj.vy * dt;
          obj.rot += obj.vr * dt;
          if (obj.x < 19) { obj.x = 19; obj.vx = Math.abs(obj.vx) * .68; obj.vr *= -.75; }
          if (obj.x + obj.w > bounds.width - 19) { obj.x = bounds.width - obj.w - 19; obj.vx = -Math.abs(obj.vx) * .68; obj.vr *= -.75; }
          if (obj.y < 18) { obj.y = 18; obj.vy = Math.abs(obj.vy) * .65; }
          const floor = bounds.height - obj.h - 24;
          if (obj.y > floor) {
            obj.y = floor;
            if (Math.abs(obj.vy) > 45) obj.vy = -Math.abs(obj.vy) * .52;
            else obj.vy = 0;
            obj.vx *= .87; obj.vr *= .82;
          }
          if (Math.abs(obj.vx) > 1 || Math.abs(obj.vy) > 1 || Math.abs(obj.vr) > 1) moving = true;
        } else moving = true;
        this.render(obj);
      }
      if (moving) this.raf = requestAnimationFrame((next) => this.tick(next));
      else this.running = false;
    },
    render(obj) { obj.node.style.transform = `translate3d(${obj.x}px,${obj.y}px,0) rotate(${obj.rot}deg)`; },
    clampAll() {
      const bounds = els.physics.getBoundingClientRect();
      this.objects.forEach((obj) => {
        obj.x = Math.max(18, Math.min(bounds.width - obj.w - 18, obj.x));
        obj.y = Math.max(18, Math.min(bounds.height - obj.h - 24, obj.y));
        this.render(obj);
      });
    },
    clear() {
      cancelAnimationFrame(this.raf); this.running = false; this.objects = [];
      els.physics.replaceChildren();
    }
  };

  const particles = (() => {
    const ctx = els.canvas.getContext("2d");
    let items = [], raf = 0, last = 0, width = 0, height = 0, dpr = 1, running = false;
    const palette = ["#fff8b3", "#ffffff", "#ff75a5", "#ff304f", "#c9184a", "#b9f2d1"];
    function resize() {
      width = window.innerWidth; height = window.innerHeight; dpr = Math.min(2, window.devicePixelRatio || 1);
      els.canvas.width = Math.round(width * dpr); els.canvas.height = Math.round(height * dpr);
      els.canvas.style.width = `${width}px`; els.canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function burst(x, y, count = 18, mode = "spark") {
      const max = reduceMotion.matches ? Math.min(8, count) : count;
      for (let i = 0; i < max; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = mode === "finale" ? 180 + Math.random() * 520 : 90 + Math.random() * 260;
        items.push({
          x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - (mode === "finale" ? 150 : 50),
          life: 1, decay: .55 + Math.random() * .75, size: 3 + Math.random() * (mode === "finale" ? 10 : 6),
          color: palette[(Math.random() * palette.length) | 0], rot: Math.random() * 6, vr: (Math.random() - .5) * 8,
          shape: mode === "tap" ? "dot" : (Math.random() > .6 ? "heart" : "rect")
        });
      }
      start();
    }
    function finaleRain() {
      const amount = reduceMotion.matches ? 30 : 110;
      for (let i = 0; i < amount; i++) {
        items.push({ x: Math.random() * width, y: -20 - Math.random() * height * .45, vx: (Math.random() - .5) * 100, vy: 90 + Math.random() * 220, life: 1, decay: .12 + Math.random() * .18, size: 4 + Math.random() * 9, color: palette[i % palette.length], rot: Math.random() * 6, vr: (Math.random() - .5) * 7, shape: Math.random() > .7 ? "heart" : "rect" });
      }
      start();
    }
    function drawHeart(x, y, size) {
      ctx.beginPath();
      ctx.moveTo(x, y + size * .28);
      ctx.bezierCurveTo(x - size, y - size * .35, x - size * .6, y - size, x, y - size * .42);
      ctx.bezierCurveTo(x + size * .6, y - size, x + size, y - size * .35, x, y + size * .28);
      ctx.fill();
    }
    function start() { if (!running && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); } }
    function tick(time) {
      const dt = Math.min(.032, (time - last) / 1000 || .016); last = time;
      ctx.clearRect(0, 0, width, height);
      items = items.filter((p) => {
        p.life -= p.decay * dt; if (p.life <= 0) return false;
        p.vy += 420 * dt; p.vx *= .995; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 1.8); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
        if (p.shape === "heart") drawHeart(0, 0, p.size);
        else if (p.shape === "dot") { ctx.beginPath(); ctx.arc(0, 0, p.size * .55, 0, 7); ctx.fill(); }
        else ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .55);
        ctx.restore();
        return p.y < height + 80;
      });
      if (items.length && !document.hidden) raf = requestAnimationFrame(tick);
      else { running = false; ctx.clearRect(0, 0, width, height); }
    }
    resize();
    return { burst, finaleRain, resize, resume: start, clear() { items = []; cancelAnimationFrame(raf); running = false; ctx.clearRect(0,0,width,height); } };
  })();


  function flash(kind = 'flash') {
    els.flash.classList.remove('flash', 'mega-flash');
    void els.flash.offsetWidth; els.flash.classList.add(kind);
  }
  function tapGift() {
    if (machine.state !== 'charging') return;
    startMusic();
    const progress = ++machine.taps / TAPS_NEEDED;
    els.giftButton.style.setProperty('--charge', progress);
    const hints = ['แตะรัว ๆ', 'อีกนิด', 'ใกล้เปิดแล้ว', 'เปิดแล้ว!'];
    els.tapCopy.textContent = hints[Math.min(3, Math.floor(progress * 4))];
    els.giftButton.classList.remove('is-hit');
    void els.giftButton.offsetWidth; els.giftButton.classList.add('is-hit');
    const rect = els.giftButton.getBoundingClientRect();
    particles.burst(rect.left + rect.width / 2, rect.top + rect.height * .6, 4 + Math.floor(progress * 8), 'tap');
    if (navigator.vibrate) navigator.vibrate(8);
    if (machine.taps === TAPS_NEEDED) openGift();
  }
  function openGift() {
    machine.state = 'opening'; els.giftButton.disabled = true;
    els.giftButton.classList.add('is-charged');
    later(() => { els.giftButton.classList.add('is-opening'); flash(); }, 600);
    later(() => {
      machine.state = 'revealing'; setScreen(els.reveal); announce('กล่องเปิดแล้ว');
      later(showNextCard, 200, true);
    }, 1550);
  }
  function showNextCard() {
    if (machine.state !== 'revealing') return;
    clearBucket(machine.sequenceTimers);
    if (machine.revealIndex >= loot.length) { showLetter(); return; }
    const item = loot[machine.revealIndex];
    const token = ++machine.revealToken;
    const fragment = els.template.content.cloneNode(true);
    const img = fragment.querySelector('img');
    img.src = item.src; img.alt = item.alt; img.dataset.fallback = item.label;
    fragment.querySelector('figcaption').textContent = item.label;
    els.focus.replaceChildren(fragment);
    const card = $('.focus-card', els.focus); card.dataset.index = machine.revealIndex;
    announce(item.label);
    const rect = els.app.getBoundingClientRect();
    particles.burst(rect.left + rect.width / 2, rect.top + rect.height * .48, 10 + machine.revealIndex * 3, 'spark');
    later(() => {
      if (machine.state !== 'revealing' || token !== machine.revealToken) return;
      card.classList.add('is-leaving');
      later(() => settleCard(token), 450, true);
    }, CARD_HOLD_MS, true);
  }
  function settleCard(token) {
    if (token !== machine.revealToken || machine.state !== 'revealing') return;
    ++machine.revealToken;
    physics.spawn(loot[machine.revealIndex], 1 + machine.revealIndex * .035);
    machine.revealIndex++; els.focus.replaceChildren();
    later(showNextCard, 250, true);
  }
  function showLetter() {
    machine.state = 'letter';
    els.focus.innerHTML = '<article class="letter-card" aria-label="จดหมายวันเกิด"><div class="letter-bow" aria-hidden="true">🎀</div><blockquote><span>happy birthday</span> <span>สูง เก่งง ^^</span></blockquote><button class="primary-button" id="letterNext" type="button">มีอีกชิ้น →</button></article>';
    flash(); particles.burst(innerWidth / 2, innerHeight / 2, 32, 'spark');
    announce('happy birthday สูง เก่งง ^^');
    const next = $('#letterNext'); next.addEventListener('click', beginFinale, {once:true});
    later(() => next.focus({preventScroll:true}), 850);
  }
  function beginFinale() {
    if (machine.state !== 'letter') return;
    machine.state = 'anticipation';
    physics.clear();
    els.app.classList.add('is-anticipating');
    els.focus.innerHTML = '<div class="final-countdown" aria-live="polite">3</div>';
    const count = $('.final-countdown');
    [0, 700, 1400].forEach((delay,index) => later(() => {
      count.textContent = String(3 - index);
      count.classList.remove('count-pop'); void count.offsetWidth; count.classList.add('count-pop');
      particles.burst(innerWidth/2,innerHeight*.48,14+index*14,'spark');
    }, delay));
    later(showFinale, 2300);
  }
  function showFinale() {
    if (machine.state !== 'anticipation') return;
    machine.state = 'finale'; els.app.classList.remove('is-anticipating'); els.app.classList.add('is-finale');
    els.focus.innerHTML = '<figure class="finale-card"><div class="image-frame"><img src="'+finale.src+'" alt="'+finale.alt+'" data-fallback="Kitty cake" draggable="false"></div><figcaption><h1 class="finale-title">HBD PAM!</h1><p class="finale-sub">HBD แม่</p><div class="ascii-cheer" aria-hidden="true"><span>✧</span> (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ <span>✧</span></div><button class="end-button" id="galleryButton" type="button" hidden>ดูทั้งหมด / ดูอีกครั้ง</button></figcaption></figure>';
    flash('mega-flash'); particles.burst(innerWidth/2,innerHeight*.43,120,'finale'); particles.finaleRain();
    if (navigator.vibrate) navigator.vibrate([40,30,70]);
    announce('HBD PAM! HBD แม่');
    later(() => {
      const button = $('#galleryButton'); button.hidden=false;
      button.addEventListener('click',showGallery,{once:true});
    }, 4500);
  }
  function fallbackData(label) {
    const safe = String(label || "Birthday surprise").replace(/[<>&]/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#ffd1e0"/><stop offset="1" stop-color="#ff5e8e"/></linearGradient></defs><rect width="800" height="1000" rx="45" fill="url(#g)"/><circle cx="400" cy="390" r="220" fill="#fff8ec" stroke="#9e163b" stroke-width="18"/><path d="M260 330L300 210l75 105M540 330L500 210l-75 105" fill="#fff8ec" stroke="#9e163b" stroke-width="18" stroke-linejoin="round"/><circle cx="330" cy="390" r="18" fill="#5b2338"/><circle cx="470" cy="390" r="18" fill="#5b2338"/><path d="M370 445q30 26 60 0" fill="none" stroke="#5b2338" stroke-width="12" stroke-linecap="round"/><text x="400" y="690" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="72" fill="#9e163b">HBD!</text><text x="400" y="775" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="34" fill="#5b2338">${safe}</text><text x="400" y="850" text-anchor="middle" font-family="Arial,sans-serif" font-size="45" fill="#fff">♥  ♥  ♥</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }


  function buildGallery() {
    els.grid.replaceChildren();
    [...loot,finale].forEach(item => {
      const button=document.createElement('button'); button.type='button'; button.className='gallery-item';
      button.setAttribute('aria-label','ดู '+item.label);
      const img=document.createElement('img'); img.src=item.src; img.alt=item.alt; img.dataset.fallback=item.label;
      button.append(img); button.addEventListener('click',()=>openGalleryModal(item,button));
      els.grid.append(button);
    });
  }
  let modalReturnFocus=null;
  function openGalleryModal(item,trigger) {
    closeGalleryModal(); modalReturnFocus=trigger; els.app.inert=true;
    const modal=document.createElement('div'); modal.id='galleryModal'; modal.className='gallery-modal';
    modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-label',item.label);
    modal.innerHTML='<figure class="gallery-modal-card"><button class="modal-close" type="button" aria-label="ปิด">×</button><img src="'+item.src+'" alt="'+item.alt+'" data-fallback="'+item.label+'"></figure>';
    document.body.append(modal);
    $('.modal-close',modal).addEventListener('click',closeGalleryModal);
    modal.addEventListener('pointerdown',event=>{if(event.target===modal)closeGalleryModal();});
    $('.modal-close',modal).focus();
  }
  function closeGalleryModal() {
    const modal=$('#galleryModal'); if(!modal)return;
    modal.remove(); els.app.inert=false; modalReturnFocus?.focus({preventScroll:true}); modalReturnFocus=null;
  }
  function showGallery() {
    if(machine.state!=='finale')return;
    machine.state='gallery'; clearBucket(machine.timers); clearBucket(machine.sequenceTimers);
    physics.clear(); particles.clear(); buildGallery(); setScreen(els.gallery,els.replay);
  }
  function replay() {
    if(machine.state!=='gallery')return;
    closeGalleryModal(); clearBucket(machine.timers); clearBucket(machine.sequenceTimers);
    machine.state='charging'; machine.taps=0; machine.revealIndex=0; machine.revealToken++;
    els.giftButton.disabled=false; els.giftButton.className='gift-button'; els.giftButton.style.setProperty('--charge',0);
    els.tapCopy.textContent='แตะกล่องรัว ๆ'; els.focus.replaceChildren(); physics.clear(); particles.clear();
    els.app.classList.remove('is-finale','is-anticipating'); setScreen(els.gift,els.giftButton);
  }
  els.giftButton.addEventListener('click',tapGift); els.replay.addEventListener('click',replay);
  document.addEventListener('error',event=>{
    const img=event.target;
    if(!(img instanceof HTMLImageElement)||img.dataset.didFallback)return;
    img.dataset.didFallback='true'; img.src=fallbackData(img.dataset.fallback||img.alt);
  },true);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')closeGalleryModal();
    const modal=$('#galleryModal');
    if(modal&&event.key==='Tab'){event.preventDefault();$('.modal-close',modal).focus();}
  });
  let resizeTimer;
  window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer); resizeTimer=setTimeout(()=>{particles.resize();physics.clampAll();},120);
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      els.app.classList.add('is-background');
      for(const bucket of [machine.timers,machine.sequenceTimers])bucket.forEach(task=>{
        if(task.id){clearTimeout(task.id);task.id=0;task.remaining=Math.max(0,task.due-performance.now());}
      });
      cancelAnimationFrame(physics.raf); physics.running=false;
      resumeMusic=musicStarted&&!els.music.paused; els.music.pause();
    }else{
      els.app.classList.remove('is-background');
      for(const bucket of [machine.timers,machine.sequenceTimers])bucket.forEach(schedule);
      physics.start(); particles.resume(); if(resumeMusic)startMusic();
    }
  });
  setScreen(els.gift);
})();
