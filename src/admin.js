import { clearState, saveState } from './content-store.js';

const styles = `
  *{box-sizing:border-box}body{margin:0;background:#f6f8f6;color:#17231b;font-family:Inter,sans-serif}
  .layout{min-height:100vh}.sidebar{position:fixed;inset:0 auto 0 0;width:240px;padding:22px 14px;background:#13251a;color:#fff;overflow-y:auto}
  .brand{display:flex;align-items:center;gap:10px;padding:0 8px 20px;border-bottom:1px solid #ffffff16}.brand-mark{display:grid;place-items:center;width:38px;height:38px;border-radius:10px;background:#22c55e;font-weight:800}.brand strong{display:block;font-size:16px}.brand small{color:#91a99a}
  .nav{display:grid;gap:4px;margin-top:18px}.nav button{width:100%;border:0;border-radius:9px;padding:10px 12px;background:transparent;color:#b8c8be;cursor:pointer;font:inherit;font-size:12px;text-align:left}.nav button:hover,.nav button.active{background:#22c55e1c;color:#fff}.nav button.active{box-shadow:inset 3px 0 #22c55e}
  .sidebar-link{display:block;margin-top:18px;border:1px solid #ffffff1c;border-radius:9px;padding:10px;color:#fff;font-size:11px;font-weight:700;text-align:center;text-decoration:none}
  .main{min-height:100vh;margin-left:240px}.topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;min-height:70px;padding:13px 28px;border-bottom:1px solid #e2e9e4;background:#fffffff2;backdrop-filter:blur(12px)}
  .topbar h1{margin:0;font-size:20px;letter-spacing:-.03em}.topbar p{margin:3px 0 0;color:#7a877f;font-size:11px}.actions{display:flex;gap:8px}.btn{border:0;border-radius:9px;padding:10px 15px;cursor:pointer;font:inherit;font-size:11px;font-weight:750;text-decoration:none}.btn-light{border:1px solid #dce5df;background:#fff;color:#314239}.btn-green{background:#178c44;color:#fff}.btn-red{background:#fff0f0;color:#b42323}
  .content{padding:26px}.page{display:none}.page.active{display:block}.intro{margin-bottom:18px}.intro h2{margin:0;font-size:23px;letter-spacing:-.035em}.intro p{margin:5px 0 0;color:#758279;font-size:12px}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:18px}.stat,.card,.preview{border:1px solid #e1e8e3;border-radius:13px;background:#fff;box-shadow:0 4px 16px #163c2410}.stat{padding:18px}.stat strong{display:block;font-size:25px}.stat span{color:#7a887f;font-size:11px}
  .preview{overflow:hidden}.preview-head{display:flex;justify-content:space-between;padding:13px 16px;border-bottom:1px solid #e5ebe7;font-size:12px;font-weight:700}.preview iframe{display:block;width:100%;height:610px;border:0}
  .group{margin-bottom:18px}.group-title{display:flex;align-items:center;gap:8px;margin:0 0 9px;font-size:13px}.group-title span{border-radius:20px;background:#eaf7ee;padding:3px 7px;color:#16833f;font-size:9px}
  .list{display:grid;gap:9px}.card{padding:14px}.card-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:7px}.card-head strong{overflow:hidden;color:#526158;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.key{color:#97a29b;font-size:9px}
  textarea,input[type=text],input[type=url]{width:100%;border:1px solid #dce5df;border-radius:9px;background:#fbfcfb;padding:10px 11px;color:#223128;outline:0;font:inherit;font-size:12px}textarea{min-height:62px;resize:vertical}textarea:focus,input:focus{border-color:#22c55e;background:#fff}
  .image-list{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.image-card{overflow:hidden;padding:0}.image-card img{width:100%;height:155px;background:#edf3ef;object-fit:cover}.image-body{padding:12px}.image-body input[type=file]{width:100%;margin-top:8px;color:#6f7d74;font-size:10px}
  .empty{border:1px dashed #d4dfd7;border-radius:12px;padding:30px;color:#7b8980;text-align:center}.toast{position:fixed;right:22px;bottom:22px;z-index:30;transform:translateY(15px);border-radius:9px;background:#13251a;padding:12px 16px;color:#fff;opacity:0;font-size:11px;transition:.2s}.toast.show{transform:none;opacity:1}
  .mobile-menu{display:none}@media(max-width:950px){.stats{grid-template-columns:repeat(2,1fr)}.image-list{grid-template-columns:repeat(2,1fr)}}@media(max-width:720px){.sidebar{transform:translateX(-100%);z-index:30;transition:.2s}.sidebar.open{transform:none}.main{margin-left:0}.mobile-menu{display:inline-block}.topbar{padding:12px 15px}.topbar p,.site-button{display:none}.content{padding:19px 14px}.stats,.image-list{grid-template-columns:1fr}.preview iframe{height:480px}}
`;

const sections = [
  { id: 'dashboard', label: 'Genel Bakış' },
  { id: 'header', label: 'Üst Menü' },
  { id: 'hero', label: 'Ana Sayfa' },
  { id: 'services', label: 'Hizmetler' },
  { id: 'process', label: 'Nasıl Çalışır' },
  { id: 'about', label: 'Hakkımızda' },
  { id: 'reviews', label: 'Müşteri Yorumları' },
  { id: 'gallery', label: 'Galeri' },
  { id: 'contact', label: 'İletişim' },
  { id: 'footer', label: 'Alt Bilgi' }
];

function renderLogin(context, message = '') {
  document.title = 'Admin Girişi | AnındaGetir';
  document.head.querySelectorAll('style').forEach((item) => item.remove());
  const style = document.createElement('style');
  style.textContent = `
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f7f4;color:#17231b;font-family:Inter,sans-serif}
    .login{width:min(420px,calc(100% - 32px));border:1px solid #dfe8e2;border-radius:18px;background:#fff;padding:32px;box-shadow:0 24px 65px #163c2418}
    .login-brand{display:flex;align-items:center;gap:11px;margin-bottom:27px}.login-mark{display:grid;place-items:center;width:42px;height:42px;border-radius:11px;background:#22c55e;color:#fff;font-weight:800}
    .login h1{margin:0;font-size:23px;letter-spacing:-.04em}.login p{margin:6px 0 23px;color:#77847c;font-size:12px;line-height:1.5}
    .login label{display:block;margin:14px 0 6px;font-size:11px;font-weight:700}.login input{width:100%;border:1px solid #d8e3dc;border-radius:10px;padding:12px;color:#1f3025;outline:0;font:inherit;font-size:13px}.login input:focus{border-color:#22c55e;box-shadow:0 0 0 3px #22c55e17}
    .login button{width:100%;margin-top:20px;border:0;border-radius:10px;background:#178c44;padding:12px;color:#fff;cursor:pointer;font:inherit;font-size:12px;font-weight:800}.login button:disabled{opacity:.6}
    .login-error{min-height:18px;margin:12px 0 0!important;color:#b42323!important}.back{display:block;margin-top:18px;color:#627269;font-size:11px;text-align:center;text-decoration:none}
  `;
  document.head.appendChild(style);
  document.body.className = '';
  document.body.innerHTML = `
    <form class="login" id="login-form">
      <div class="login-brand"><div class="login-mark">AG</div><div><strong>AnındaGetir</strong><div style="color:#7d8b82;font-size:11px">Yönetim Paneli</div></div></div>
      <h1>Admin Girişi</h1>
      <p>Site içeriklerini yönetmek için hesabınızla giriş yapın.</p>
      <label for="username">Kullanıcı adı</label>
      <input id="username" name="username" autocomplete="username" required>
      <label for="password">Şifre</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required>
      <button type="submit">Giriş Yap</button>
      <p class="login-error" id="login-error">${message}</p>
      <a class="back" href="/">Siteye dön</a>
    </form>
  `;
  document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button');
    const error = document.getElementById('login-error');
    button.disabled = true;
    error.textContent = '';
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: document.getElementById('username').value,
          password: document.getElementById('password').value
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      renderDashboard(context, result.username);
    } catch (errorMessage) {
      error.textContent = errorMessage.message || 'Giriş yapılamadı.';
      button.disabled = false;
    }
  });
}

function classify(element, siteSections) {
  if (element.closest('nav')) return 'header';
  if (element.closest('footer')) return 'footer';
  const section = element.closest('section');
  const index = siteSections.indexOf(section);
  return ['hero', 'services', 'process', 'about', 'reviews', 'gallery', 'contact', 'contact'][index] || 'hero';
}

function node(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.innerHTML = content;
  return element;
}

function renderDashboard({ registry, state }, username) {
  document.title = 'AnındaGetir Yönetim Paneli';
  const siteSections = [...document.querySelectorAll('section')];
  const grouped = Object.fromEntries(sections.slice(1).map((section) => [section.id, []]));

  [...registry.entries()].forEach(([key, element]) => {
    grouped[classify(element, siteSections)].push({ key, element });
  });

  document.head.querySelectorAll('style').forEach((item) => item.remove());
  const style = document.createElement('style');
  style.textContent = styles;
  document.head.appendChild(style);
  document.body.className = '';
  document.body.innerHTML = `
    <div class="layout">
      <aside class="sidebar" id="sidebar">
        <div class="brand"><div class="brand-mark">AG</div><div><strong>AnındaGetir</strong><small>Yönetim Paneli</small></div></div>
        <nav class="nav">${sections.map((section, index) => `<button class="${index === 0 ? 'active' : ''}" data-page="${section.id}">${section.label}</button>`).join('')}</nav>
        <a class="sidebar-link" href="/" target="_blank">Siteyi Aç</a>
        <button class="sidebar-link" id="logout" style="width:100%;background:transparent;cursor:pointer">Çıkış Yap (${username})</button>
      </aside>
      <main class="main">
        <header class="topbar">
          <div style="display:flex;align-items:center;gap:10px"><button class="btn btn-light mobile-menu" id="menu">Menü</button><div><h1 id="title">Genel Bakış</h1><p>Site içeriğini bölüm bölüm düzenleyin.</p></div></div>
          <div class="actions"><a class="btn btn-light site-button" href="/" target="_blank">Siteyi Gör</a><button class="btn btn-green" id="save">Kaydet</button></div>
        </header>
        <div class="content">
          <section class="page active" id="page-dashboard">
            <div class="intro"><h2>Genel Bakış</h2><p>Düzenlemek istediğiniz site bölümünü sol menüden seçin.</p></div>
            <div class="stats">
              <div class="stat"><strong>${registry.size}</strong><span>Toplam içerik alanı</span></div>
              <div class="stat"><strong>${[...registry.keys()].filter((key) => key.startsWith('text-')).length}</strong><span>Metin</span></div>
              <div class="stat"><strong>${[...registry.keys()].filter((key) => key.startsWith('link-')).length}</strong><span>Bağlantı</span></div>
              <div class="stat"><strong>${[...registry.keys()].filter((key) => key.startsWith('image-')).length}</strong><span>Görsel</span></div>
            </div>
            <div class="preview"><div class="preview-head"><span>Canlı Site Önizlemesi</span><span>anindagetir.com</span></div><iframe id="preview" src="/"></iframe></div>
          </section>
          ${sections.slice(1).map((section) => `<section class="page" id="page-${section.id}"><div class="intro"><h2>${section.label}</h2><p>Bu bölüme ait metinleri, bağlantıları ve görselleri düzenleyin.</p></div><div id="fields-${section.id}"></div></section>`).join('')}
        </div>
      </main>
    </div>
    <div class="toast" id="toast">Değişiklikler kaydedildi.</div>
  `;

  const setState = (key, value) => { state[key] = value; };

  sections.slice(1).forEach((section) => {
    const target = document.getElementById(`fields-${section.id}`);
    const items = grouped[section.id];
    const types = {
      text: items.filter(({ key }) => key.startsWith('text-')),
      link: items.filter(({ key }) => key.startsWith('link-')),
      image: items.filter(({ key }) => key.startsWith('image-')),
      form: items.filter(({ key }) => key.startsWith('field-') || key.startsWith('option-'))
    };

    const addGroup = (title, list, type) => {
      if (!list.length) return;
      const group = node('div', 'group', `<h3 class="group-title">${title}<span>${list.length}</span></h3>`);
      const holder = node('div', type === 'image' ? 'image-list' : 'list');

      list.forEach(({ key, element }, index) => {
        if (type === 'image') {
          const card = node('div', 'card image-card');
          const preview = node('img');
          preview.src = element.currentSrc || element.src;
          const body = node('div', 'image-body', `<div class="card-head"><strong>Görsel ${index + 1}</strong><span class="key">${key}</span></div>`);
          const input = node('input');
          input.type = 'text';
          input.value = element.getAttribute('src') || '';
          input.addEventListener('input', () => { preview.src = input.value; setState(key, input.value); });
          const file = node('input');
          file.type = 'file';
          file.accept = 'image/*';
          file.addEventListener('change', () => {
            const selected = file.files?.[0];
            if (!selected) return;
            const reader = new FileReader();
            reader.addEventListener('load', () => { preview.src = reader.result; input.value = reader.result; setState(key, reader.result); });
            reader.readAsDataURL(selected);
          });
          body.append(input, file);
          card.append(preview, body);
          holder.appendChild(card);
          return;
        }

        const current = type === 'text' || key.startsWith('option-') ? element.textContent : type === 'link' ? element.getAttribute('href') : element.placeholder;
        const label = type === 'link' ? (element.textContent.trim() || element.getAttribute('aria-label') || `Bağlantı ${index + 1}`) : (current?.trim() || `${title} ${index + 1}`);
        const card = node('div', 'card', `<div class="card-head"><strong>${label}</strong><span class="key">${key}</span></div>`);
        const input = type === 'text' ? node('textarea') : node('input');
        if (type !== 'text') input.type = 'text';
        input.value = current || '';
        input.addEventListener('input', () => setState(key, input.value));
        card.appendChild(input);
        holder.appendChild(card);
      });
      group.appendChild(holder);
      target.appendChild(group);
    };

    addGroup('Metinler', types.text, 'text');
    addGroup('Bağlantılar ve Telefonlar', types.link, 'link');
    addGroup('Görseller', types.image, 'image');
    addGroup('Form Alanları', types.form, 'form');
    if (!items.length) target.innerHTML = '<div class="empty">Bu bölümde düzenlenebilir içerik bulunmuyor.</div>';
  });

  const toast = document.getElementById('toast');
  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2200);
  };

  document.querySelectorAll('.nav button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav button,.page').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(`page-${button.dataset.page}`).classList.add('active');
      document.getElementById('title').textContent = sections.find((item) => item.id === button.dataset.page).label;
      document.getElementById('sidebar').classList.remove('open');
      window.scrollTo(0, 0);
    });
  });

  document.getElementById('menu').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
  document.getElementById('logout').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  });
  document.getElementById('save').addEventListener('click', () => {
    try {
      saveState(state);
      document.getElementById('preview').src = `/?refresh=${Date.now()}`;
      showToast('Değişiklikler kaydedildi.');
    } catch {
      showToast('Görsel dosyası çok büyük.');
    }
  });

  const reset = node('button', 'btn btn-red', 'Tüm Değişiklikleri Sıfırla');
  reset.addEventListener('click', () => {
    if (!window.confirm('Kaydedilen tüm değişiklikler silinsin mi?')) return;
    clearState();
    window.location.reload();
  });
  document.getElementById('fields-footer').appendChild(reset);
}

export async function initializeAdmin(context) {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) return renderLogin(context);
    const result = await response.json();
    renderDashboard(context, result.username);
  } catch {
    renderLogin(context, 'Giriş sunucusuna ulaşılamadı.');
  }
}
