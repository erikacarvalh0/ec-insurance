import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequestLogger } from './request-logging.mjs';

test('emits JSON logs with request ID, method, path and status but no secrets', () => {
  const entries=[];
  const log=createRequestLogger({write:(line)=>entries.push(JSON.parse(line))});
  log({id:'abc',method:'GET',url:'/api/leads?token=secret&email=private@example.com',status:200,durationMs:12});
  assert.deepEqual(entries[0],{event:'http_request',requestId:'abc',method:'GET',path:'/api/leads',status:200,durationMs:12});
  assert.doesNotMatch(JSON.stringify(entries),/secret|private@example.com/);
});
