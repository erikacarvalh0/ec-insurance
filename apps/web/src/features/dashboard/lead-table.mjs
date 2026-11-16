function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderLeadTable(rows) {
  if (rows.length === 0) {
    return '<p role="status">No leads found</p>';
  }

  const body = rows.map((row) => (
    `<tr><td>${escapeHtml(row.id)}</td><td>${escapeHtml(row.insuranceType)}</td><td>${escapeHtml(row.status)}</td></tr>`
  )).join('');

  return `<table><caption>Insurance leads</caption><thead><tr><th scope="col">Lead ID</th><th scope="col">Insurance type</th><th scope="col">Status</th></tr></thead><tbody>${body}</tbody></table>`;
}
