import { createElement as h, useEffect, useState } from 'react';
import { fetchBrokerLeads } from './client.mjs';

export function BrokerDashboard({ token, fetchLeads = fetchBrokerLeads }) {
  const [state, setState] = useState({ status: 'idle', leads: [] });

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
        h('p', null, `Leads: ${state.leads.length}`),
        h('ul', null, ...state.leads.map((lead) =>
          h('li', { key: lead.id }, `${lead.insuranceType ?? 'Insurance'} — ${lead.status ?? 'received'}`),
        )),
      ),
  );
}
