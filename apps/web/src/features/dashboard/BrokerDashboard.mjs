import { createElement as h, useEffect, useState } from 'react';
import { fetchBrokerLeads } from './client.mjs';
import { filterBrokerLeads } from './lead-filter.mjs';
import { nextLeadOffset, previousLeadOffset } from './pagination.mjs';
import { LeadDetails } from './LeadDetails.mjs';

const PAGE_SIZE = 20;

export function BrokerDashboard({ token, fetchLeads = fetchBrokerLeads, onSessionExpired }) {
  const [state, setState] = useState({ status: 'idle', leads: [] });
  const [statusFilter, setStatusFilter] = useState('all');
  const [offset, setOffset] = useState(0);
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  useEffect(() => {
    if (!token) {
      setState({ status: 'unauthenticated', leads: [] });
      return;
    }

    let active = true;
    setState({ status: 'loading', leads: [] });
    fetchLeads({ token, limit: PAGE_SIZE, offset }).then(
      (leads) => { if (active) setState({ status: 'success', leads }); },
      (error) => {
        if (!active) return;
        setState({ status: 'error', leads: [] });
        if (error?.status === 401) onSessionExpired?.();
      },
    );
    return () => { active = false; };
  }, [token, fetchLeads, offset, onSessionExpired]);

  return h('main', null,
    h('h1', null, 'Broker dashboard'),
    !token ? h('p', { role: 'status' }, 'Sign in to view your leads') :
      state.status === 'loading' || state.status === 'idle' ? h('p', { role: 'status' }, 'Loading leads...') :
      state.status === 'error' ? h('p', { role: 'alert' }, 'Unable to load leads') :
      h('section', { 'aria-label': 'Assigned leads' },
        h('label', { htmlFor: 'broker-lead-status' }, 'Filter by status'),
        h('select', { id: 'broker-lead-status', value: statusFilter, onChange: (event) => setStatusFilter(event.target.value) },
          ...['all', 'received', 'contacted', 'qualified', 'converted', 'closed'].map((status) => h('option', { key: status, value: status }, status))),
        h('p', null, `Leads on page: ${filterBrokerLeads(state.leads, statusFilter).length}`),
        h('nav', { 'aria-label': 'Lead pages' },
          h('button', { type: 'button', disabled: offset === 0, onClick: () => setOffset(previousLeadOffset(offset, PAGE_SIZE)) }, 'Previous page'),
          h('span', null, ` Page ${Math.floor(offset / PAGE_SIZE) + 1} `),
          h('button', { type: 'button', disabled: state.leads.length < PAGE_SIZE, onClick: () => setOffset(nextLeadOffset(offset, PAGE_SIZE, state.leads.length)) }, 'Next page')),

        h('ul', null, ...filterBrokerLeads(state.leads, statusFilter).map((lead) =>
          h('li', { key: lead.id }, `${lead.insuranceType ?? 'Insurance'} — ${lead.status ?? 'received'} `,
            h('button', { type: 'button', onClick: () => setSelectedLeadId(lead.id), 'aria-label': `View lead ${lead.id}` }, 'View details')),
        )),
        h(LeadDetails, { token, leadId: selectedLeadId, onClose: () => setSelectedLeadId(null) }),
      ),
  );
}
