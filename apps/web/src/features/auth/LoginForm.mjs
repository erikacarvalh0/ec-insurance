import { createElement as h, useState } from 'react';

export function LoginForm({ onSubmit = () => {}, submitting = false, error = '' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function submit(event) {
    event.preventDefault();
    if (!submitting) onSubmit({ email, password });
  }

  return h('form', { onSubmit: submit, 'aria-label': 'Broker sign in' },
    h('label', { htmlFor: 'broker-email' }, 'Email'),
    h('input', { id: 'broker-email', name: 'email', type: 'email', autoComplete: 'username', required: true,
      value: email, onChange: (event) => setEmail(event.target.value) }),
    h('label', { htmlFor: 'broker-password' }, 'Password'),
    h('input', { id: 'broker-password', name: 'password', type: 'password', autoComplete: 'current-password', required: true,
      value: password, onChange: (event) => setPassword(event.target.value) }),
    error ? h('p', { role: 'alert' }, error) : null,
    h('button', { type: 'submit', disabled: submitting }, submitting ? 'Signing in...' : 'Sign in'),
  );
}
