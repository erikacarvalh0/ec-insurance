export function createRevocationRepository(prisma) {
  const model=prisma?.revokedSession;
  if(typeof model?.upsert!=='function'||typeof model?.findUnique!=='function')throw new TypeError('Revocation model required');
  return {
    async revoke({sessionId,expiresAt}={}) {
      if(typeof sessionId!=='string'||!sessionId||!Number.isSafeInteger(expiresAt)||expiresAt<0)throw new TypeError('Invalid session metadata');
      const expiry=new Date(expiresAt*1000);
      if(!Number.isFinite(expiry.getTime()))throw new TypeError('Invalid expiry');
      await model.upsert({where:{id:sessionId},create:{id:sessionId,expiresAt:expiry},update:{}});
    },
    async isRevoked(sessionId) {
      if(typeof sessionId!=='string'||!sessionId)throw new TypeError('Session identifier required');
      return Boolean(await model.findUnique({where:{id:sessionId},select:{id:true}}));
    },
  };
}
