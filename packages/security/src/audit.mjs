import { redactSensitiveData } from './redaction.mjs';

export function createAuditEvent(event, { now = () => new Date() } = {}) {
  if (!event?.action || !event?.actorId || !event?.resourceId) {
    throw new TypeError('Audit events require action, actorId and resourceId');
  }

  return {
    action: event.action,
    actorId: event.actorId,
    resourceId: event.resourceId,
    timestamp: now().toISOString(),
    metadata: redactSensitiveData(event.metadata ?? {}),
  };
}
