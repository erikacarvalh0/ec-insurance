import { renderLeadTable } from './lead-table.mjs';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderDashboardPage({ summary, rows }) {
  return `<main aria-labelledby="dashboard-title">
    <h1 id="dashboard-title">Insurance dashboard</h1>
    <section aria-label="Lead summary">
      <p>Total leads: ${escapeHtml(summary.total)}</p>
      <p>Received: ${escapeHtml(summary.received)}</p>
      <p>Quoted: ${escapeHtml(summary.quoted)}</p>
      <p>Manual review: ${escapeHtml(summary.manualReview)}</p>
    </section>
    <section aria-label="Lead list">
      ${renderLeadTable(rows)}
    </section>
  </main>`;
}
