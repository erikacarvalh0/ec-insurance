import { spawnSync } from 'node:child_process';
const url=process.env.TEST_DATABASE_URL;
if(!url)throw new Error('TEST_DATABASE_URL is required');
const parsed=new URL(url);
if(!['postgres:','postgresql:'].includes(parsed.protocol)||!/^ec_insurance_test(?:_[a-z0-9]+)?$/.test(parsed.pathname.slice(1)))throw new Error('Use a dedicated ec_insurance_test database');
if(process.env.DATABASE_URL&&process.env.DATABASE_URL===url)throw new Error('Test and application databases must differ');
const env={...process.env,DATABASE_URL:url,TEST_DATABASE_URL:url};
for(const args of [['run','db:generate'],['run','db:migrate'],['run','test:domain']]){
 const result=spawnSync('npm',args,{env,stdio:'inherit',shell:false});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status??1);
}
