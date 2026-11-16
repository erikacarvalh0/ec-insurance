import assert from 'node:assert/strict';
import test from 'node:test';
import { IntakeForm } from './IntakeForm.mjs';
import { readFileSync } from 'node:fs';

test('attaches interactive submit handler to the form itself', () => {
  const onSubmit = () => {};
  const section = IntakeForm({ insuranceType: 'auto', onSubmit });
  const form = section.props.children.find((child) => child?.type === 'form');
  assert.equal(form.props.onSubmit, onSubmit);
});

test('interactive form forwards its submit handler to IntakeForm', () => {
  const source = readFileSync(new URL('./InteractiveIntakeForm.mjs', import.meta.url), 'utf8');
  assert.match(source, /h\(IntakeForm,\s*\{\s*insuranceType,\s*onSubmit:\s*handleSubmit\s*\}\)/);
});
