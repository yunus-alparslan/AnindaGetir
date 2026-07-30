const STORAGE_KEY = 'anindagetir-site-content-v1';

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function initializeEditableContent() {
  const state = loadState();
  const registry = new Map();
  const root = document.body;
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

  return { registry, state };
}
