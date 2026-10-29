// ---- Recreated brand mark: heart-topped waffle cone standing in for the apostrophe/"i" ----
let logoInstanceCount = 0;
function heartConeSVG(){
  logoInstanceCount++;
  const pid = "waffle-" + logoInstanceCount;
  return `
<svg viewBox="0 0 176 266" aria-hidden="true">
  <defs>
    <pattern id="${pid}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="9" height="9" fill="#1c1815"/>
      <rect width="9" height="9" fill="none" stroke="#f4efe4" stroke-width="1.8"/>
    </pattern>
  </defs>
  <path d="M92,34 C98,10 122,-2 146,8 C172,20 182,58 166,88 C158,118 120,146 88,156 C56,146 18,118 8,84 C-6,52 14,8 50,6 C72,4 86,14 92,34 Z" fill="var(--heart)"/>
  <path d="M44,126 L132,126 L88,266 Z" fill="url(#${pid})" stroke="#1c1815" stroke-width="2"/>
</svg>`;
}

function buildBrandLockup(){
  const wrap = el("div","brand-lockup");
  const word = el("span","chris-word");
  word.appendChild(document.createTextNode("CHR"));
  word.appendChild(el("span","icon-slot", heartConeSVG()));
  word.appendChild(document.createTextNode("S’"));
  wrap.appendChild(word);
  const right = el("span","right-block");
  right.appendChild(el("span","word-icecream","ice cream"));
  right.appendChild(el("span","brand-line2",'<span class="mex">MEXICAN</span> <span class="food">FOOD</span>'));
  wrap.appendChild(right);
  return wrap;
}

// ---- Fixed interface wording (menu content itself lives in /data/*.json, edited through the admin) ----
const UI = {
  icecream:{en:"Ice Cream",es:"Helados"}, smoothies:{en:"Smoothies",es:"Licuados"},
  icePrices:{en:"ICE CREAM PRICES",es:"PRECIOS DE HELADO"},
  flavors:{en:"CHRIS' FLAVORS",es:"SABORES DE CHRIS'"},
  smoothieHead:{en:"CHRIS' SMOOTHIES",es:"LICUADOS DE CHRIS'"},
  soldOut:{en:"Sold out",es:"Agotado"},
  closed:{en:"Closed",es:"Cerrado"}, notice:{en:"Notice",es:"Aviso"},
  daily:{en:"daily",es:"todos los días"},
  callNote:{en:"Ready to order? Call {phone} or visit us in store.", es:"¿Listo para ordenar? Llame al {phone} o visítenos en la tienda."},
  loadError:{en:"The menu couldn't load right now. Please call us at (317) 255-2156.", es:"No se pudo cargar el menú. Llámenos al (317) 255-2156."},
};

let lang = "en";
let DATA = null;

// Pick the field for the current language; fall back to English if the Spanish field was left blank.
function t(obj, base){
  if(!obj) return "";
  const v = obj[base + "_" + lang];
  return (v && String(v).trim()) ? v : (obj[base + "_en"] || "");
}
function esc(str){
  return String(str == null ? "" : str).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function slug(str){ return String(str||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "section"; }
function visible(list){ return (list||[]).filter(x=>x && !x.hidden); }

function el(tag, cls, html){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  if(html !== undefined) e.innerHTML = html;
  return e;
}

async function loadData(){
  const bust = "?v=" + Date.now();   // always fetch the latest saved version, not a cached copy
  const get = name => fetch("data/" + name + ".json" + bust).then(r=>{ if(!r.ok) throw new Error(name); return r.json(); });
  const [menu, icecream, info, notice] = await Promise.all([get("menu"), get("ice-cream"), get("info"), get("notice")]);
  return {menu, icecream, info, notice};
}

// ---------- notice banner ----------
function noticeIsActive(n){
  if(!n || !n.show) return false;
  if(n.show_until){
    // Hide automatically after the end of the chosen day.
    const end = new Date(String(n.show_until).slice(0,10) + "T23:59:59");
    if(!isNaN(end) && Date.now() > end.getTime()) return false;
  }
  return !!(n.message_en || n.message_es);
}
function renderNotice(){
  const box = document.getElementById("site-notice");
  const n = DATA.notice;
  box.className = "site-notice";
  box.innerHTML = "";
  if(!noticeIsActive(n)) return;
  const closed = (n.style || "Closed") === "Closed";
  box.classList.add("show", closed ? "style-closed" : "style-info");
  box.appendChild(el("span","notice-label", esc((closed ? UI.closed : UI.notice)[lang])));
  box.appendChild(el("span","notice-text", esc(t(n,"message"))));
}

// ---------- contact details ----------
function renderInfo(){
  const i = DATA.info;
  const digits = String(i.phone||"").replace(/[^0-9+]/g,"");
  document.querySelectorAll(".js-tel").forEach(a=> a.href = "tel:" + digits);
  document.querySelectorAll(".js-phone").forEach(e=> e.textContent = i.phone);
  const handle = String(i.instagram||"").replace(/^@/,"");
  document.querySelectorAll(".js-ig").forEach(a=> a.href = "https://instagram.com/" + encodeURIComponent(handle));
  document.querySelectorAll(".js-ig-handle").forEach(e=> e.textContent = "@" + handle);
  const city = String(i.city||"").split(",")[0];
  document.getElementById("hours-short").textContent = t(i,"hours") + " · " + t(i,"closed_days");
  document.getElementById("address-short").textContent = [i.street, String(i.shopping_center||"").replace(/ Shopping Center$/,""), city].filter(Boolean).join(", ");
  document.getElementById("address-full").innerHTML = [i.street, i.shopping_center, i.city].filter(Boolean).map(esc).join("<br>");
  document.getElementById("hours-full").innerHTML = esc(t(i,"hours") + " " + UI.daily[lang]) + "<br>" + esc(t(i,"closed_days"));
  document.getElementById("call-note").textContent = UI.callNote[lang].replace("{phone}", i.phone);
}

// ---------- menu ----------
function renderDish(it){
  const d = el("div","dish" + (it.sold_out ? " is-sold-out" : ""));
  const row = el("div","dish-row");
  const nameSpan = el("span", null, esc(t(it,"name")));
  if(it.label === "Spicy") nameSpan.innerHTML += ' <span class="badge-spicy" aria-label="spicy">🌶</span>';
  if(it.label === "Veggie") nameSpan.innerHTML += ' <span class="badge-veg" aria-label="vegetarian">🌱</span>';
  if(it.sold_out) nameSpan.innerHTML += ' <span class="sold-out-badge">' + esc(UI.soldOut[lang]) + '</span>';
  row.appendChild(nameSpan);
  if(it.price) row.appendChild(el("span","price", esc(it.price)));
  d.appendChild(row);
  const desc = t(it,"description");
  if(desc) d.appendChild(el("p","desc", esc(desc)));
  return d;
}

function renderGroup(sec){
  const g = el("div","food-group");
  g.id = sec._id;
  g.appendChild(el("h2", null, esc(t(sec,"title"))));
  if(sec.price_line){
    const parts = String(sec.price_line).trim().split(/\s{2,}|\s*\|\s*/).filter(Boolean);
    g.appendChild(el("div","enchilada-prices", parts.map(p=>{
      const m = p.match(/^(.*?)(\$[\d.,]+)\s*$/);
      return m ? '<span>' + esc(m[1]) + '<span class="price">' + esc(m[2]) + '</span></span>' : '<span>' + esc(p) + '</span>';
    }).join("")));
  }
  visible(sec.items).forEach(it=> g.appendChild(renderDish(it)));
  const note = t(sec,"note");
  if(note) g.appendChild(el("p","addon-note", esc(note)));
  return g;
}

function sheetFooterHTML(withInstagram){
  const i = DATA.info;
  const digits = String(i.phone||"").replace(/[^0-9+]/g,"");
  const handle = String(i.instagram||"").replace(/^@/,"");
  let h = '<span class="meta-item"><svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg> ' + esc([i.street, i.shopping_center, i.city].filter(Boolean).join(", ")) + '</span>' +
    '<a class="meta-item" href="tel:' + esc(digits) + '"><svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg> ' + esc(i.phone) + '</a>';
  if(withInstagram) h += '<a href="https://instagram.com/' + encodeURIComponent(handle) + '" target="_blank" rel="noopener">@' + esc(handle) + '</a>';
  return h;
}

function menuSheets(){
  // Group sections into sheets (Sheet 1, Sheet 2, ...) and left/right columns, in the order managers listed them.
  const sheets = {};
  const order = [];
  const used = {};
  visible(DATA.menu.sections).forEach(sec=>{
    let id = slug(sec.title_en); while(used[id]) id += "-2"; used[id] = true; sec._id = id;
    const key = sec.sheet || "Sheet 1";
    if(!sheets[key]){ sheets[key] = {left:[], right:[]}; order.push(key); }
    (sec.column === "Right" ? sheets[key].right : sheets[key].left).push(sec);
  });
  order.sort();
  return order.map(k=>sheets[k]);
}

function renderPageSheet(page){
  const sheet = el("div","sheet");
  sheet.appendChild(el("div","tape l"));
  sheet.appendChild(el("div","tape r"));
  sheet.appendChild(el("div","rule-double sheet-top-rule"));
  const body = el("div","sheet-body");
  const colA = el("div","col"); page.left.forEach(sec=> colA.appendChild(renderGroup(sec)));
  const colB = el("div","col"); page.right.forEach(sec=> colB.appendChild(renderGroup(sec)));
  body.appendChild(colA); body.appendChild(colB);
  sheet.appendChild(body);
  sheet.appendChild(el("div","sheet-footer", sheetFooterHTML(true)));
  return sheet;
}

function renderIceSheet(){
  const ic = DATA.icecream;
  const sheet = el("div","sheet");
  sheet.id = "icecream";
  sheet.appendChild(el("div","tape l"));
  sheet.appendChild(el("div","tape r"));

  const sizes = visible(ic.sizes);
  if(sizes.length){
    sheet.appendChild(el("div","ice-title", esc(UI.icePrices[lang])));
    const priceGrid = el("div","ice-price-grid");
    priceGrid.style.gridTemplateRows = "repeat(" + Math.ceil(sizes.length/2) + ",auto)";
    sizes.forEach(p=>{
      const row = el("div","row");
      row.appendChild(el("span", null, esc(t(p,"name"))));
      row.appendChild(el("span", null, esc(p.price)));
      priceGrid.appendChild(row);
    });
    sheet.appendChild(priceGrid);
  }

  const wrap = el("div","flavor-smoothie-wrap");
  const board = el("div","flavor-board");
  board.appendChild(el("h3", null, esc(UI.flavors[lang])));
  const fgrid = el("div","flavor-grid");
  visible(ic.flavors).forEach(f=>{
    const tag = el("div","flavor-tag" + (f.sold_out ? " is-sold-out" : ""), esc(t(f,"name")));
    if(f.sold_out) tag.setAttribute("data-sold", UI.soldOut[lang]);
    fgrid.appendChild(tag);
  });
  board.appendChild(fgrid);
  wrap.appendChild(board);

  const smList = el("div","smoothie-list");
  smList.id = "smoothies";
  smList.appendChild(el("h3", null, esc(UI.smoothieHead[lang])));
  visible(ic.smoothies).forEach(item=>{
    const card = el("div","smoothie-card" + (item.sold_out ? " is-sold-out" : ""));
    card.appendChild(el("h4", null, esc(t(item,"name")) + (item.sold_out ? ' <span class="sold-out-badge">' + esc(UI.soldOut[lang]) + '</span>' : "")));
    card.appendChild(el("p", null, esc(t(item,"description"))));
    smList.appendChild(card);
  });
  wrap.appendChild(smList);
  sheet.appendChild(wrap);
  sheet.appendChild(el("div","sheet-footer", sheetFooterHTML(false)));
  return sheet;
}

let SHEETS = [];

function renderNav(){
  const nav = document.getElementById("menu-nav");
  nav.innerHTML = "";
  const items = [];
  SHEETS.forEach(p=> [...p.left, ...p.right].forEach(sec=> items.push({id:sec._id, title:t(sec,"title")})));
  items.push({id:"icecream", title:UI.icecream[lang]});
  items.push({id:"smoothies", title:UI.smoothies[lang]});
  items.forEach(s=>{
    const a = el("a", null, esc(s.title));
    a.href = "#"+s.id;
    a.addEventListener("click", (ev)=>{
      const target = document.getElementById(s.id);
      if(!target) return;
      ev.preventDefault();
      const navH = document.getElementById("menu-nav").offsetHeight + 12;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navH;
      window.scrollTo({top, behavior:"smooth"});
    });
    nav.appendChild(a);
  });
}

function renderSheets(){
  const container = document.getElementById("sheets");
  container.innerHTML = "";
  SHEETS.forEach(p=> container.appendChild(renderPageSheet(p)));
  container.appendChild(renderIceSheet());
}

function applyStaticText(){
  document.querySelectorAll("[data-en]").forEach(node=>{
    node.textContent = node.getAttribute(lang === "en" ? "data-en" : "data-es");
  });
  document.documentElement.lang = lang;
  document.getElementById("btn-en").setAttribute("aria-pressed", String(lang==="en"));
  document.getElementById("btn-es").setAttribute("aria-pressed", String(lang==="es"));
}

function observeSheets(){
  if(!("IntersectionObserver" in window)){ document.querySelectorAll(".sheet").forEach(s=>s.classList.add("in-view")); return; }
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      }
    });
  }, {threshold:0});
  document.querySelectorAll(".sheet").forEach(s=>obs.observe(s));
}

function renderMastheadLogo(){
  const slot = document.getElementById("masthead-logo");
  slot.innerHTML = "";
  slot.appendChild(buildBrandLockup());
}

function renderAll(){
  applyStaticText();
  renderMastheadLogo();
  if(!DATA) return;
  renderNotice();
  renderInfo();
  SHEETS = menuSheets();
  renderNav();
  renderSheets();
  observeSheets();
}

document.getElementById("btn-en").addEventListener("click", ()=>{ lang="en"; renderAll(); });
document.getElementById("btn-es").addEventListener("click", ()=>{ lang="es"; renderAll(); });

renderAll();   // logo and fixed text appear immediately
loadData().then(d=>{ DATA = d; renderAll(); }).catch(err=>{
  console.error(err);
  const c = document.getElementById("sheets");
  c.innerHTML = "";
  c.appendChild(el("div","load-error", esc(UI.loadError[lang])));
});
