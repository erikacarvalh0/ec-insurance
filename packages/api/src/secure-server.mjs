import { createServer } from 'node:http';
import { createNodeHttpAdapter } from './node-adapter.mjs';
import { createPersistentApiServer } from './persistent-server.mjs';
import { createProtectedLeadsHandler } from './leads-handler.mjs';

export function createSecureApiServer({ leadRepository, checkDatabase, verifyToken, leadListRepository }) {
  const intakeServer = createPersistentApiServer({ leadRepository, checkDatabase });
  const leads = createProtectedLeadsHandler({ verifyToken, leadListRepository });

  const handleLeads = createNodeHttpAdapter(leads);
  return createServer((request, response) => {
    if ((request.url ?? '').split('?')[0] === '/api/leads') {
      return handleLeads(request, response);
    }
    intakeServer.emit('request', request, response);
  });
}
