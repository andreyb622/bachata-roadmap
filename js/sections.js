import { closestBySelector } from './dom.js';

export function initSectionToggles() {
  document.addEventListener('click', (event) => {
    const header = closestBySelector(event.target, '.section__header');
    if (!header) return;

    const section = closestBySelector(header, '.section');
    section?.classList.toggle('open');
  });
}
