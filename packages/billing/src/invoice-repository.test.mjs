import test from 'node:test';
import assert from 'node:assert/strict';
import { createInvoiceRepository } from './invoice-repository.mjs';

test('restricts invoice listing to admins and serializes bigint cents', async () => {
  let calls=0;
  const repository=createInvoiceRepository({invoice:{findMany:async (query)=>{
    calls++; assert.equal(query.take,20); assert.equal(query.skip,0);
    return [{id:'i1',amountCents:100n,currency:'BRL',status:'OPEN',createdAt:new Date(0)}];
  }}});
  await assert.rejects(repository.list({role:'broker',userId:'b'}),/Forbidden/);
  assert.equal(calls,0);
  assert.equal((await repository.list({role:'admin',userId:'a'}))[0].amountCents,'100');
  await assert.rejects(repository.list({role:'admin',userId:'a'},{limit:101}),/pagination/);
});
