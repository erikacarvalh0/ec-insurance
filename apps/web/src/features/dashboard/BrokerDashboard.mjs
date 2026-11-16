import { createElement as h, useEffect, useState } from 'react';
import { fetchBrokerLeads } from './client.mjs';
import { filterBrokerLeads } from './lead-filter.mjs';

export function BrokerDashboard({ token, fetchLeads = fetchBrokerLeads }) {
  const [state, setState] = useState({ status: 'idle', leads: [] });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!token) {
      setState({ status: 'unauthenticated', leads: [] });
      return;
    }

    let active = true;
    setState({ status: 'loading', leads: [] });
    fetchLeads({ token }).then(
      (leads) => { if (active) setState({ status: 'success', leads }); },
      () => { if (active) setState({ status: 'error', leads: [] }); },
    );
    return () => { active = false; };
  }, [token, fetchLeads]);

  return h('main', null,
    h('h1', null, 'Broker dashboard'),
    !token ? h('p', { role: 'status' }, 'Sign in to view your leads') :
      state.status === 'loading' || state.status === 'idle' ? h('p', { role: 'status' }, 'Loading leads...') :
      state.status === 'error' ? h('p', { role: 'alert' }, 'Unable to load leads') :
      h('section', { 'aria-label': 'Assigned leads' },
        h('label', { htmlFor: 'broker-lead-status' }, 'Filter by status'),
        h('select', { id: 'broker-lead-status', value: statusFilter, onChange: (event) => setStatusFilter(event.target.value) },
          ...['all', 'received', 'contacted', 'qualified', 'converted', 'closed'].map((status) => h('option', { key: status, value: status }, status))),
        h('p', null, `Leads: ${filterBrokerLeads(state.leads, statusFilter).length}`),
        h('ul', null, ...filterBrokerLeads(state.leads, statusFilter).map((lead) =>
          h('li', { key: lead.id }, `${lead.insuranceType ?? 'Insurance'} — ${lead.status ?? 'received'}`),
        )),
      ),
  );
}
