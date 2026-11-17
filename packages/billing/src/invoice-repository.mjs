export function createInvoiceRepository(prisma) {
  if(typeof prisma?.invoice?.findMany!=='function')throw new TypeError('Invoice model required');
  return {
    async list(actor,{limit=20,offset=0}={}) {
      if(actor?.role!=='admin'||!actor.userId)throw new Error('Forbidden');
      if(!Number.isSafeInteger(limit)||limit<1||limit>100||!Number.isSafeInteger(offset)||offset<0||offset>100000)throw new RangeError('Invalid pagination');
      const rows=await prisma.invoice.findMany({select:{id:true,amountCents:true,currency:true,status:true,createdAt:true},orderBy:[{createdAt:'desc'},{id:'desc'}],take:limit,skip:offset});
      return rows.map(({id,amountCents,currency,status,createdAt})=>({id,amountCents:amountCents.toString(),currency,status,createdAt}));
    },
  };
}
