export function nextLeadOffset(offset, pageSize, receivedCount) {
  return receivedCount === pageSize ? offset + pageSize : offset;
}

export function previousLeadOffset(offset, pageSize) {
  return Math.max(0, offset - pageSize);
}
