main.js// CONFIG - replace with your worker origin
const API_ORIGIN = 'https://YOUR_WORKER_DOMAIN_OR_SUBDOMAIN'; // e.g. https://api.yourdomain.com or https://<workers>.workers.dev

// DOM
const menuBtn = document.getElementById('hamburger');
const menuPanel = document.getElementById('menuPanel');
const openAdminBtn = document.getElementById('openAdmin');
const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');
const loginBtn = document.getElementById('loginBtn');
const adminPass = document.getElementById('adminPass');
const loginMsg = document.getElementById('loginMsg');
const gallery = document.getElementById('gallery');
const animOverlay = document.getElementById('anim-overlay');
const heroCanvas = document.getElementById('heroCanvas');

menuBtn.addEventListener('click', ()=> menuPanel.classList.toggle('hidden'));
openAdminBtn.addEventListener('click', ()=> { loginModal.classList.remove('hidden'); menuPanel.classList.add('hidden'); });
closeLogin.addEventListener('click', ()=> loginModal.classList.add('hidden'));

// Login: we store pass in localStorage (used for admin endpoints). Not highly secure — see README for better options.
loginBtn.addEventListener('click', async ()=>{
  const pass = adminPass.value.trim();
  if(!pass){ loginMsg.textContent='enter password'; return; }
  // test login
  try {
    const res = await fetch(API_ORIGIN + '/api/ping', {
      method: 'POST',
      headers: { 'x-admin-password': pass }
    });
    const j = await res.json();
    if(j.ok){
      localStorage.setItem('amaze_admin_pass', pass);
      loginModal.classList.add('hidden');
      // open admin dashboard in new page
      window.location.href = 'admin.html';
    } else {
      loginMsg.textContent = 'wrong password';
    }
  } catch(e){
    loginMsg.textContent = 'server error';
  }
});

// Load gallery by requesting /api/list
async function loadGallery(prefix = ''){
  gallery.innerHTML = '<div>Loading…</div>';
  try {
    const r = await fetch(API_ORIGIN + '/api/list?prefix=' + encodeURIComponent(prefix));
    const data = await r.json();
    gallery.innerHTML = '';
    if(!data.objects || data.objects.length === 0){
      gallery.innerHTML = '<div>No files</div>';
      return;
    }
    data.objects.forEach(obj=>{
      // show only common image/video types; you can change
      const el = document.createElement('div');
      el.className = 'card';
      if(/\.(jpe?g|png|webp|gif)$/i.test(obj.key)){
        el.innerHTML = `<img src="${obj.url}" alt="${obj.key}">`;
      } else if(/\.(mp4|webm)$/i.test(obj.key)){
        el.innerHTML = `<video controls src="${obj.url}" style="width:100%;height:140px;object-fit:cover;border-radius:6px"></video>`;
      } else {
        el.innerHTML = `<div style="padding:18px;font-size:13px">${obj.key}</div>`;
      }
      gallery.appendChild(el);
    });
  } catch(e){
    gallery.innerHTML = '<div>Failed to load gallery</div>';
    console.error(e);
  }
}

// Canvas animation (2 seconds)
function runCanvasAnimation(){
  const c = heroCanvas;
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const ctx = c.getContext('2d');

  let start = null;
  const duration = 2000;

  function draw(t){
    if(!start) start = t;
    const p = Math.min(1, (t - start)/duration);
    ctx.clearRect(0,0,c.width,c.height);

    // fade background subtle
    ctx.fillStyle = `rgba(255,255,255,${0.0})`;
    ctx.fillRect(0,0,c.width,c.height);

    // draw animated lines
    ctx.strokeStyle = '#F1C40F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const midY = c.height*0.35;
    ctx.moveTo(c.width*0.2, midY);
    ctx.lineTo(c.width*0.2 + (c.width*0.6)*p, midY);
    ctx.stroke();

    // star doodle (simple)
    ctx.save();
    ctx.translate(c.width*0.5, midY - 30);
    ctx.globalAlpha = p;
    ctx.fillStyle = '#F1C40F';
    ctx.beginPath();
    for(let i=0;i<5;i++){
      const a = i * Math.PI*2/5 - Math.PI/2;
      const r = (i%2===0) ? 26 : 12;
      ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // text
    ctx.save();
    ctx.globalAlpha = p;
    ctx.fillStyle = '#153e7a';
    ctx.font = `${Math.floor(48 + 18*p)}px "Segoe UI", Roboto, Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('AmazeHeads', c.width/2, midY + 60);
    ctx.restore();

    if(p < 1){
      window.requestAnimationFrame(draw);
    } else {
      // hide overlay after short delay
      setTimeout(()=> animOverlay.style.display = 'none', 300);
    }
  }
  window.requestAnimationFrame(draw);
}

window.addEventListener('load', ()=>{
  runCanvasAnimation();
  // load gallery root
  loadGallery('');
});
