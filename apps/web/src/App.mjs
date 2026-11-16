import { createElement as h, useCallback, useEffect, useState } from 'react';
import { InteractiveIntakeForm } from './features/intake/InteractiveIntakeForm.mjs';
import { Navigation } from './Navigation.mjs';
import { BrokerDashboard } from './features/dashboard/BrokerDashboard.mjs';
import { LoginForm } from './features/auth/LoginForm.mjs';
import { loginBroker } from './features/auth/client.mjs';
import { isSessionTokenActive, watchSessionExpiration } from './features/auth/session.mjs';

const TYPES = ['auto', 'residential', 'life', 'health', 'business', 'travel'];

export function App({ pathname = typeof window === 'undefined' ? '/' : window.location.pathname, token }) {
  const [insuranceType, setInsuranceType] = useState('auto');
  const [sessionToken, setSessionToken] = useState(token && isSessionTokenActive(token) ? token : null);
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(credentials) {
    setSubmitting(true);
    setLoginError('');
    try {
      const session = await loginBroker(credentials);
      if (!isSessionTokenActive(session.token)) throw new Error('Invalid session');
      setSessionToken(session.token);
    } catch {
      setLoginError('Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  }

  const handleLogout = useCallback(() => {
    setSessionToken(null);
    setLoginError('');
  }, []);

  useEffect(() => {
    if (sessionToken) return watchSessionExpiration(sessionToken, handleLogout);
  }, [sessionToken, handleLogout]);

  const brokerView = pathname === '/broker';

  return h('main', null,
    h('header', null, h('h1', null, 'EC Insurance'), h(Navigation, { view: brokerView ? 'broker' : 'public' })),
    brokerView ? (sessionToken ? h('section', { 'aria-label': 'Broker workspace' },
      h('button', { type: 'button', onClick: handleLogout }, 'Sign out'),
      h(BrokerDashboard, { token: sessionToken, onSessionExpired: handleLogout })) : h(LoginForm, { onSubmit: handleLogin, error: loginError, submitting })) : h('nav', { 'aria-label': 'Insurance products' },
      h('label', { htmlFor: 'insurance-product' }, 'Choose your insurance'),
      h('select', {
        id: 'insurance-product',
        value: insuranceType,
        onChange: (event) => setInsuranceType(event.target.value),
      }, ...TYPES.map((type) => h('option', { key: type, value: type }, type))),
    ),
    !brokerView && h(InteractiveIntakeForm, { key: insuranceType, insuranceType }),
  );
}
