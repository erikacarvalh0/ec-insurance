import { createElement as h } from 'react';

export function Navigation({ view = 'public' }) {
  const links = [
    { id: 'public', label: 'Insurance quotation', href: '/' },
    { id: 'broker', label: 'Broker dashboard', href: '/broker' },
  ];

  return h('nav', { 'aria-label': 'Primary navigation' },
    h('ul', null, ...links.map((link) =>
      h('li', { key: link.id },
        h('a', {
          href: link.href,
          ...(view === link.id ? { 'aria-current': 'page' } : {}),
        }, link.label),
      ),
    )),
  );
}
