import { createElement as h } from 'react';

export function Dashboard({ summary }) {
  return h('main', { 'aria-labelledby': 'dashboard-heading' },
    h('h1', { id: 'dashboard-heading' }, 'Insurance dashboard'),
    h('section', { 'aria-label': 'Lead summary' },
      h('p', null, `Total leads: ${summary.total}`),
      h('p', null, `Received: ${summary.received}`),
      h('p', null, `Quoted: ${summary.quoted}`),
      h('p', null, `Manual review: ${summary.manualReview}`),
    ),
    summary.total === 0 ? h('p', { role: 'status' }, 'No leads found') : null,
  );
}
