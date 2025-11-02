// SPA simple sin fetch: lee JSON embebido en <script id="APP_DATA">
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const App = {
  data: null,
  routes: {},
  init(){
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    // Lee datos embebidos
    try {
      const raw = document.getElementById('APP_DATA').textContent;
      this.data = JSON.parse(raw);
    } catch (e) {
      console.error('No se pudo leer APP_DATA', e);
      $('#app').innerHTML = '<div class="container" style="padding:40px">No se pudo cargar el contenido.</div>';
      return;
    }

    this.defineRoutes();
    this.router();
    window.addEventListener('hashchange', () => this.router());
  },
  defineRoutes(){
    this.routes = {
      '/': () => this.renderHome(),
      '/habitaciones': () => this.renderRooms(),
      '/servicios': () => this.renderServices(),
      '/galeria': () => this.renderGallery(),
      '/ubicacion': () => this.renderMap(),
      '/contacto': () => this.renderContact(),
    };
  },
  matchRoute(){
    const hash = location.hash.slice(1) || '/';
    if (hash.startsWith('/habitaciones')) return '/habitaciones';
    return this.routes[hash] ? hash : '/';
  },
  router(){
    const route = this.matchRoute();
    this.routes[route]?.();
    window.scrollTo({top:0, behavior:'smooth'});
  },
  renderHome(){
    $('#app').innerHTML = `
      <section class="hero">
        <div class="container">
          <h1>Descanso con estilo en Cangallo</h1>
          <p>Confort, modernidad y <b>cochera 24 horas</b> en el centro. Wi‑Fi rápido, agua caliente 24/7 y atención amable.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin:8px 0 6px">
            <span class="chip" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.5);padding:6px 12px;border-radius:999px;font-weight:700">🕐 Atención 24/7</span>
            <span class="chip" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.5);padding:6px 12px;border-radius:999px;font-weight:700">🚗 Cochera 24 horas</span>
          </div>
          <div>
            <a class="btn primary" href="#/habitaciones">Ver habitaciones</a>
            <a class="btn ghost" href="https://wa.me/51925771480?text=Hola%2C%20quiero%20reservar" target="_blank" rel="noopener">Reservar por WhatsApp</a>
          </div>
        </div>
        <div class="container" style="display:none"></div>
      </section>
      <section class="container" style="padding:36px 0">
        <h2 class="section-title">Servicios destacados</h2>
        <p class="section-sub">Lo esencial para una estadía perfecta</p>
        <div class="grid grid-3">
          ${this.data.services.slice(0,6).map(s => `
            <article class="card">
              <div class="body">
                <div style="font-size:28px">${s.icon}</div>
                <h3>${s.title}</h3>
                <p style="opacity:.8">${s.desc}</p>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  },
  renderRooms(){
    const idxFromHash = (() => {
      const h = location.hash.split('#')[2];
      const i = parseInt(h, 10);
      return Number.isFinite(i) ? i : 0;
    })();

    $('#app').innerHTML = `
      <section class="container" style="padding-top:32px">
        <h2 class="section-title">Nuestras habitaciones</h2>
        <p class="section-sub">Selecciona un tipo — enlace directo con #/habitaciones#0, #1 o #2</p>
        <div class="grid grid-3" id="room-cards"></div>
      </section>
      <section class="container" id="room-view" style="padding-bottom:42px"></section>
    `;

    const cards = $('#room-cards');
    this.data.rooms.forEach((r, i) => {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `
        <div class="media"><img src="${r.images[0]}" alt="${r.name}"></div>
        <div class="body">
          <h3>${r.name}</h3>
          <p>${r.features.slice(0,3).join(' · ')}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
            <div><small>Desde</small><div style="font-weight:800;color:var(--primary)">S/ ${r.price}</div></div>
            <a class="btn primary" href="#/habitaciones#${i}">Ver</a>
          </div>
        </div>
      `;
      cards.appendChild(el);
    });

    const renderDetail = (i) => {
      const r = this.data.rooms[i] || this.data.rooms[0];
      const view = $('#room-view');
      view.innerHTML = `
        <h3 class="section-title" style="margin-top:22px">${r.name}</h3>
        <div class="slider" data-slider>
          <div class="slides">${r.images.map(src => `<img src="${src}" alt="${r.name}">`).join('')}</div>
          <button class="prev" data-prev>&lsaquo;</button>
          <button class="next" data-next>&rsaquo;</button>
          <div class="dots" data-dots></div>
        </div>
        <ul class="list">
          ${r.features.map(f => `<li>• ${f}</li>`).join('')}
        </ul>
        <div style="display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:10px">
          <div><small>Desde</small><div class="price" style="font-weight:900;color:var(--primary)">S/ ${r.price}</div></div>
          <a class="btn primary" target="_blank" rel="noopener"
            href="https://wa.me/51925771480?text=Hola%2C%20quiero%20reservar%20${encodeURIComponent(r.name)}%20(%23%20${i})%20para%20%5Bfechas%5D">
            Reservar por WhatsApp
          </a>
        </div>
      `;
      initSlider($('.slider', view));
    };

    renderDetail(idxFromHash);
    window.addEventListener('hashchange', () => {
      const i = (() => {
        const h = location.hash.split('#')[2];
        const n = parseInt(h, 10);
        return Number.isFinite(n) ? n : 0;
      })();
      renderDetail(i);
    });
  },
  renderServices(){
    $('#app').innerHTML = `
      <section class="container" style="padding:32px 0">
        <h2 class="section-title">Servicios</h2>
        <p class="section-sub">Todo lo que necesitas durante tu estadía</p>
        <div class="grid grid-3">
          ${this.data.services.map(s => `
            <article class="card">
              <div class="body">
                <div style="font-size:30px">${s.icon}</div>
                <h3>${s.title}</h3>
                <p style="opacity:.8">${s.desc}</p>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  },
  renderGallery(){
    $('#app').innerHTML = `
      <section class="container" style="padding:32px 0">
        <h2 class="section-title">Galería</h2>
        <p class="section-sub">Una mirada a nuestras instalaciones</p>
        <div class="grid grid-3" id="gal"></div>
      </section>
    `;
    const gal = $('#gal');
    const imgs = [...new Set(this.data.rooms.flatMap(r => r.images))];
    imgs.forEach(src => {
      const c = document.createElement('article');
      c.className = 'card';
      c.innerHTML = `<div class="media"><img src="${src}" alt="Galería"></div>`;
      gal.appendChild(c);
    });
  },
  renderMap(){
    $('#app').innerHTML = `
      <section class="container" style="padding:32px 0">
        <h2 class="section-title">¿Cómo llegar?</h2>
        <p class="section-sub">Estamos en Av. Argentina 427, Cangallo 05401 — <b>Atención y cochera 24/7</b></p>
        <iframe class="map" title="Mapa Hospedaje Buenos Aires"
          src="https://www.google.com/maps?q=Av.%20Argentina%20427,%20Cangallo%2005401&output=embed"
          loading="lazy" allowfullscreen></iframe>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
          <a class="btn primary" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=Av.+Argentina+427%2C+Cangallo+05401">Cómo llegar (GPS)</a>
          <a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/maps?q=Av.+Argentina+427,+Cangallo+05401">Abrir en Google Maps</a>
        </div>
      </section>
    `;
  },
  renderContact(){
    $('#app').innerHTML = `
      <section class="container" style="padding:32px 0">
        <h2 class="section-title">Contacto</h2>
        <p class="section-sub">Atención y <b>cochera 24/7</b> — Respuesta inmediata por WhatsApp</p>
        <div class="grid" style="grid-template-columns:1.1fr .9fr">
          <form id="form" class="card body" style="padding:18px">
            <label>Nombre<br><input name="name" required placeholder="Tu nombre"></label><br><br>
            <label>Fecha de llegada<br><input type="date" name="in" required></label><br><br>
            <label>Fecha de salida<br><input type="date" name="out" required></label><br><br>
            <label>Tipo de habitación<br>
              <select name="room">
                ${this.data.rooms.map((r,i)=>`<option value="${r.name}">${r.name}</option>`).join('')}
              </select>
            </label><br><br>
            <button class="btn primary" type="submit">Solicitar por WhatsApp</button>
          </form>
          <div>
            <ul class="list">
              <li>📱 WhatsApp: <a target="_blank" rel="noopener" href="https://wa.me/51925771480">+51 925 771 480</a></li>
              <li>📍 Dirección: <a target="_blank" rel="noopener" href="https://www.google.com/maps?q=Av.+Argentina+427,+Cangallo+05401">Av. Argentina 427, Cangallo 05401</a></li>
              <li>🕐 Atención: 24/7 (recepción)</li>
              <li>🚗 Cochera: <b>24 horas</b> (coordinar por WhatsApp)</li>
              <li>📶 Wi‑Fi: alta velocidad</li>
              <li>🚿 Agua caliente: 24/7</li>
            </ul>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
              <a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/maps?q=Av.+Argentina+427,+Cangallo+05401">Abrir en Google Maps</a>
              <a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=Av.+Argentina+427%2C+Cangallo+05401">Cómo llegar ahora</a>
            </div>
          </div>
        </div>
      </section>
    `;
    $('#form').addEventListener('submit', (e)=>{
      e.preventDefault();
      const f = new FormData(e.target);
      const msg = `Hola, soy ${f.get('name')}. Quiero reservar ${f.get('room')} del ${f.get('in')} al ${f.get('out')}.`;
      const url = 'https://wa.me/51925771480?text=' + encodeURIComponent(msg);
      window.open(url, '_blank');
    });
  }
};

// Slider
function initSlider(root){
  if(!root) return;
  const track = root.querySelector('.slides');
  const imgs = [...track.children];
  const prev = root.querySelector('[data-prev]');
  const next = root.querySelector('[data-next]');
  const dotsWrap = root.querySelector('[data-dots]');
  let i = 0;
  imgs.forEach((_im,idx)=>{
    const b = document.createElement('button');
    if(idx===0) b.classList.add('active');
    b.addEventListener('click', ()=>go(idx));
    dotsWrap.appendChild(b);
  });
  function go(n){
    i = (n+imgs.length)%imgs.length;
    track.style.transform = `translateX(${-100*i}%)`;
    dotsWrap.querySelectorAll('button').forEach((b,bi)=>b.classList.toggle('active', bi===i));
  }
  prev.addEventListener('click', ()=>go(i-1));
  next.addEventListener('click', ()=>go(i+1));
  // swipe
  let x0=null;
  root.addEventListener('pointerdown', e=>x0=e.clientX);
  root.addEventListener('pointerup', e=>{
    if(x0===null) return;
    const dx = e.clientX - x0;
    if(Math.abs(dx)>40) go(i + (dx<0?1:-1));
    x0=null;
  });
}

// Inicia app al cargar
document.addEventListener('DOMContentLoaded', ()=> App.init());
