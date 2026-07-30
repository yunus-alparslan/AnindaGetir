const STORAGE_KEY = 'anindagetir-site-content-v1';

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

async function loadSharedState() {
  try {
    const response = await fetch('/api/content');
    if (!response.ok) throw new Error();
    return await response.json();
  } catch {
    return loadState();
  }
}

export async function saveState(state) {
  const response = await fetch('/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'İçerik kaydedilemedi.');
  localStorage.removeItem(STORAGE_KEY);
}

export async function clearState() {
  const response = await fetch('/api/content', { method: 'DELETE' });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'İçerik sıfırlanamadı.');
  localStorage.removeItem(STORAGE_KEY);
}

export async function initializeEditableContent() {
  const state = await loadSharedState();
  const registry = new Map();
  const root = document.body;
  const seo = {
    'seo-title': state['seo-title'] || document.title,
    'seo-description': state['seo-description'] || document.querySelector('meta[name="description"]')?.content || '',
    'seo-keywords': state['seo-keywords'] || document.querySelector('meta[name="keywords"]')?.content || '',
    'seo-og-title': state['seo-og-title'] || document.querySelector('meta[property="og:title"]')?.content || '',
    'seo-og-description': state['seo-og-description'] || document.querySelector('meta[property="og:description"]')?.content || ''
  };

  document.title = seo['seo-title'];
  document.querySelector('meta[name="description"]')?.setAttribute('content', seo['seo-description']);
  document.querySelector('meta[name="keywords"]')?.setAttribute('content', seo['seo-keywords']);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', seo['seo-og-title']);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', seo['seo-og-description']);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', seo['seo-og-title']);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', seo['seo-og-description']);

  const schema = document.getElementById('local-business-schema');
  if (schema) {
    try {
      const schemaData = JSON.parse(schema.textContent);
      schemaData.description = seo['seo-description'];
      schema.textContent = JSON.stringify(schemaData);
    } catch {
      // Geçersiz şema, sayfanın geri kalanının yüklenmesini engellememelidir.
    }
  }
  let textIndex = 0;
  let imageIndex = 0;
  let linkIndex = 0;
  let fieldIndex = 0;
  let optionIndex = 0;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (
      !parent ||
      !node.nodeValue.trim() ||
      parent.closest('[data-admin-ui]') ||
      ['SCRIPT', 'STYLE', 'NOSCRIPT', 'OPTION', 'TEXTAREA'].includes(parent.tagName)
    ) {
      continue;
    }
    textNodes.push(node);
  }

  textNodes.forEach((node) => {
    const key = `text-${textIndex++}`;
    const span = document.createElement('span');
    span.dataset.editKey = key;
    span.dataset.editType = 'text';
    span.textContent = state[key] ?? node.nodeValue;
    node.replaceWith(span);
    registry.set(key, span);
  });

  document.querySelectorAll('img').forEach((image) => {
    const key = `image-${imageIndex++}`;
    image.dataset.editKey = key;
    image.dataset.editType = 'image';
    if (state[key]) image.src = state[key];
    registry.set(key, image);
  });

  document.querySelectorAll('a').forEach((link) => {
    const key = `link-${linkIndex++}`;
    link.dataset.linkEditKey = key;
    if (state[key]) link.href = state[key];
    registry.set(key, link);
  });

  document.querySelectorAll('input, textarea').forEach((field) => {
    const key = `field-${fieldIndex++}`;
    field.dataset.editKey = key;
    field.dataset.editType = 'field';
    if (state[key] !== undefined) field.placeholder = state[key];
    registry.set(key, field);
  });

  document.querySelectorAll('option').forEach((option) => {
    const key = `option-${optionIndex++}`;
    option.dataset.editKey = key;
    option.dataset.editType = 'option';
    if (state[key] !== undefined) option.textContent = state[key];
    registry.set(key, option);
  });

  return { registry, state, seo };
}
