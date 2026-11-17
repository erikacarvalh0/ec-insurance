import { createElement as h, useEffect, useState } from 'react';
import { fetchBrokerLeads } from './client.mjs';
import { nextLeadOffset, previousLeadOffset } from './pagination.mjs';
import { LeadDetails } from './LeadDetails.mjs';

const PAGE_SIZE = 20;

export function BrokerDashboard({ token, fetchLeads = fetchBrokerLeads, onSessionExpired }) {
  const [state, setState] = useState({ status: 'idle', leads: [] });
  const [statusFilter, setStatusFilter] = useState('all');
  const [insuranceType, setInsuranceType] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  useEffect(() => {
    if (!token) {
      setState({ status: 'unauthenticated', leads: [] });
      return;
    }

    let active = true;
    setState({ status: 'loading', leads: [] });
    fetchLeads({ token, limit: PAGE_SIZE, offset, ...(statusFilter !== 'all' ? { status: statusFilter } : {}), ...(insuranceType !== 'all' ? { insuranceType } : {}), ...(search ? { search } : {}) }).then(
      (leads) => { if (active) setState({ status: 'success', leads }); },
      (error) => {
        if (!active) return;
        setState({ status: 'error', leads: [] });
        if (error?.status === 401) onSessionExpired?.();
      },
    );
    return () => { active = false; };
  }, [token, fetchLeads, offset, statusFilter, insuranceType, search, onSessionExpired]);

  return h('main', null,
    h('h1', null, 'Broker dashboard'),
    !token ? h('p', { role: 'status' }, 'Sign in to view your leads') :
      state.status === 'loading' || state.status === 'idle' ? h('p', { role: 'status' }, 'Loading leads...') :
      state.status === 'error' ? h('p', { role: 'alert' }, 'Unable to load leads') :
      h('section', { 'aria-label': 'Assigned leads' },
        h('label', { htmlFor: 'broker-lead-status' }, 'Filter by status'),
        h('select', { id: 'broker-lead-status', value: statusFilter, onChange: (event) => { setStatusFilter(event.target.value); setOffset(0); setSelectedLeadId(null); } },
          ...['all', 'received', 'processing', 'quoted', 'manual_review', 'contacted', 'completed', 'cancelled'].map((status) => h('option', { key: status, value: status }, status))),
        h('label', { htmlFor: 'broker-lead-type' }, 'Filter by insurance type'),
        h('select', { id: 'broker-lead-type', value: insuranceType, onChange: (event) => { setInsuranceType(event.target.value); setOffset(0); setSelectedLeadId(null); } },
          ...['all', 'auto', 'residential', 'life', 'health', 'business', 'travel'].map((type) => h('option', { key: type, value: type }, type))),
        h('form', { onSubmit: (event) => { event.preventDefault(); setSearch(searchInput.trim()); setOffset(0); setSelectedLeadId(null); } },
          h('label', { htmlFor: 'broker-lead-search' }, 'Lead ID prefix'),
          h('input', { id: 'broker-lead-search', value: searchInput, onChange: (event) => setSearchInput(event.target.value), pattern: '[A-Za-z0-9_\\-]{2,64}', maxLength: 64 }),
          h('button', { type: 'submit' }, 'Search')),
        h('p', null, `Leads on page: ${state.leads.length}`),
        h('nav', { 'aria-label': 'Lead pages' },
          h('button', { type: 'button', disabled: offset === 0, onClick: () => setOffset(previousLeadOffset(offset, PAGE_SIZE)) }, 'Previous page'),
          h('span', null, ` Page ${Math.floor(offset / PAGE_SIZE) + 1} `),
          h('button', { type: 'button', disabled: state.leads.length < PAGE_SIZE, onClick: () => setOffset(nextLeadOffset(offset, PAGE_SIZE, state.leads.length)) }, 'Next page')),

        h('ul', null, ...state.leads.map((lead) =>
          h('li', { key: lead.id }, `${lead.insuranceType ?? 'Insurance'} — ${lead.status ?? 'received'} `,
            h('button', { type: 'button', onClick: () => setSelectedLeadId(lead.id), 'aria-label': `View lead ${lead.id}` }, 'View details')),
        )),
        h(LeadDetails, { token, leadId: selectedLeadId, onClose: () => setSelectedLeadId(null) }),
      ),
  );
}
