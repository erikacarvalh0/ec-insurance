import { createServer } from 'node:http';
import { createNodeHttpAdapter } from './node-adapter.mjs';
import { createPersistentApiServer } from './persistent-server.mjs';
import { createProtectedLeadsHandler } from './leads-handler.mjs';
import { createHttpLoginHandler } from './http-login.mjs';

export function createSecureApiServer({ leadRepository, checkDatabase, verifyToken, leadListRepository, login, loginLimiter }) {
  const intakeServer = createPersistentApiServer({ leadRepository, checkDatabase });
  const leads = createProtectedLeadsHandler({ verifyToken, leadListRepository });

  const handleLeads = createNodeHttpAdapter(leads);
  const handleLogin = login ? createNodeHttpAdapter(createHttpLoginHandler({ login, limiter: loginLimiter })) : null;
  return createServer((request, response) => {
    if ((request.url ?? '').split('?')[0] === '/api/login' && handleLogin) {
      return handleLogin(request, response);
    }
    if ((request.url ?? '').split('?')[0] === '/api/leads') {
      return handleLeads(request, response);
    }
    intakeServer.emit('request', request, response);
  });
}
