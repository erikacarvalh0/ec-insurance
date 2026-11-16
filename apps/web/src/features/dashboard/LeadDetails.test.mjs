import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LeadDetails } from './LeadDetails.mjs';

test('shows selected lead loading state without leaking bearer token',()=>{
 const html=renderToStaticMarkup(createElement(LeadDetails,{token:'secret',leadId:'lead-1'}));
 assert.match(html,/Loading lead details/);assert.doesNotMatch(html,/secret/);
});

test('does not fetch or render private details without selection',()=>{
 const html=renderToStaticMarkup(createElement(LeadDetails,{token:'secret'}));
 assert.match(html,/Select a lead/);
});
