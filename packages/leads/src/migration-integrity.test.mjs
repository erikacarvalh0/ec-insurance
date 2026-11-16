import assert from 'node:assert/strict';
import test from 'node:test';
import { readdir, readFile } from 'node:fs/promises';

const root=new URL('../../../prisma/migrations/',import.meta.url);

test('all migration directories contain SQL and have unique ordered names',async()=>{
 const names=(await readdir(root,{withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>x.name);
 assert.ok(names.length>=1);
 assert.equal(new Set(names).size,names.length);
 assert.equal(new Set(names.map(x=>x.slice(0,14))).size,names.length);
 for(const name of names){assert.match(name,/^\d{14}_[a-z0-9_]+$/);assert.ok((await readFile(new URL(`${name}/migration.sql`,root),'utf8')).trim().length>0);}
});

test('lead assignment and notification lease migrations are represented in schema',async()=>{
 const schema=await readFile(new URL('../../../prisma/schema.prisma',import.meta.url),'utf8');
 const names=(await readdir(root)).filter(x=>/notification|assignment/.test(x));
 assert.ok(names.some(x=>x.includes('notification_jobs')));
 assert.ok(names.some(x=>x.includes('notification_job_lease')));
 assert.ok(names.some(x=>x.includes('lead_assignment_history')));
 assert.match(schema,/model NotificationJob \{/);
 assert.match(schema,/leaseExpiresAt DateTime\?/);
 assert.match(schema,/model LeadAssignmentHistory \{/);
});
