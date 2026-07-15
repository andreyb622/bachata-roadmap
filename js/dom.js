export function matchesSelector(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  const fn = el.matches
    ?? el.webkitMatchesSelector
    ?? el.msMatchesSelector
    ?? el.mozMatchesSelector;
  return fn ? fn.call(el, selector) : false;
}

export function closestBySelector(el, selector) {
  let node = el;
  while (node && node !== document) {
    if (matchesSelector(node, selector)) return node;
    node = node.parentNode;
  }
  return null;
}

export function escapeHtml(str) {
  if (str == null) return '';

  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function setBodyScrollLocked(locked) {
  document.body.style.overflow = locked ? 'hidden' : '';
}
