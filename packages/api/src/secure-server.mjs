import { createProtectedLeadStatusHistoryHandler } from './lead-status-history-handler.mjs';
import { createServer } from 'node:http';
import { createNodeHttpAdapter } from './node-adapter.mjs';
import { createPersistentApiServer } from './persistent-server.mjs';
import { createProtectedLeadsHandler } from './leads-handler.mjs';
import { createHttpLoginHandler } from './http-login.mjs';
import { createProtectedLeadDetailHandler } from './lead-detail-handler.mjs';
import { createProtectedLeadStatusHandler } from './lead-status-handler.mjs';

export function createSecureApiServer({ leadRepository, checkDatabase, verifyToken, leadListRepository, leadDetailRepository, leadStatusRepository, leadStatusHistoryRepository, login, loginLimiter }) {
  const intakeServer = createPersistentApiServer({ leadRepository, checkDatabase });
  const leads = createProtectedLeadsHandler({ verifyToken, leadListRepository });

  const handleLeads = createNodeHttpAdapter(leads);
  const handleLeadStatusHistory = leadStatusHistoryRepository ? createNodeHttpAdapter(createProtectedLeadStatusHistoryHandler({ verifyToken, leadStatusHistoryRepository })) : null;
  const handleLeadStatus = leadStatusRepository ? createNodeHttpAdapter(createProtectedLeadStatusHandler({ verifyToken, leadStatusRepository })) : null;
  const handleLeadDetail = leadDetailRepository ? createNodeHttpAdapter(createProtectedLeadDetailHandler({ verifyToken, leadDetailRepository })) : null;
  const handleLogin = login ? createNodeHttpAdapter(createHttpLoginHandler({ login, limiter: loginLimiter })) : null;
  return createServer((request, response) => {
    if (/^\/api\/leads\/[^/]+\/status$/.test((request.url ?? '').split('?')[0]) && handleLeadStatus) {
      return handleLeadStatus(request, response);
    }
    if ((request.url ?? '').split('?')[0] === '/api/login' && handleLogin) {
      return handleLogin(request, response);
    }
    if ((request.url ?? '').split('?')[0] === '/api/leads') {
      return handleLeads(request, response);
    }
    if (/^\/api\/leads\/[^/]+$/.test((request.url ?? '').split('?')[0]) && handleLeadDetail) {
      return handleLeadDetail(request, response);
    }
    if (/^\/api\/leads\/[^/]+\/status-history$/.test((request.url ?? '').split('?')[0]) && handleLeadStatusHistory) {
      return handleLeadStatusHistory(request, response);
    }
    intakeServer.emit('request', request, response);
  });
}
