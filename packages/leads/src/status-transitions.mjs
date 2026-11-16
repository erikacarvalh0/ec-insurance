const ALLOWED = Object.freeze({
  RECEIVED: ['PROCESSING', 'CONTACTED', 'CANCELLED', 'MANUAL_REVIEW'],
  PROCESSING: ['QUOTED', 'MANUAL_REVIEW', 'CANCELLED'],
  QUOTED: ['CONTACTED', 'COMPLETED', 'CANCELLED'],
  MANUAL_REVIEW: ['PROCESSING', 'CONTACTED', 'CANCELLED'],
  CONTACTED: ['PROCESSING', 'QUOTED', 'COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
});

export function canTransitionLeadStatus(from, to) {
  return Object.hasOwn(ALLOWED, from) && ALLOWED[from].includes(to);
}
