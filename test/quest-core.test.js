'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const quest = require('../voxa-studio/proof-quest/quest-core.js');

test('has four unique, well-formed cases with distinguishable evidence', () => {
  assert.equal(quest.CASES.length, 4);
  assert.equal(new Set(quest.CASES.map(c => c.id)).size, 4);
  for (const c of quest.CASES) {
    assert.ok(c.claim && c.title && c.rationale && c.lesson);
    assert.equal(c.evidence.length, 3);
    assert.equal(new Set(c.evidence.map(e => e.id)).size, 3);
    assert.ok(quest.VERDICTS.find(v => v.id === c.answer));
  }
});
test('scores all correct answers and hint penalty', () => {
  let score = 0;
  for (const c of quest.CASES) {
    const result = quest.evaluate(c.id, c.answer, false);
    assert.equal(result.correct, true);
    assert.equal(result.points, 25);
    score += result.points;
    assert.equal(quest.evaluate(c.id, c.answer, true).points, 20);
  }
  assert.equal(score, 100);
  assert.equal(quest.MAX_POINTS, 100);
});
test('incorrect answers do not earn points', () => {
  for (const c of quest.CASES) {
    const wrong = quest.VERDICTS.find(v => v.id !== c.answer);
    assert.deepEqual(quest.evaluate(c.id, wrong.id, false).points, 0);
  }
});
test('rejects unknown cases, verdicts, invalid scores', () => {
  assert.throws(() => quest.evaluate('missing', 'supported', false));
  assert.throws(() => quest.evaluate('model', 'unsupported', false));
  assert.throws(() => quest.rank(-1));
  assert.throws(() => quest.rank(101));
});
test('rank thresholds and badge labeling are explicit', () => {
  assert.equal(quest.rank(100).title, 'Signal Architect');
  assert.equal(quest.rank(65).title, 'Trace Operator');
  assert.equal(quest.rank(0).title, 'Evidence Cadet');
  const malicious = '<script>alert("hi")</script>';
  const svg = quest.badgeSvg(malicious, 75);
  assert.ok(svg.includes('GAME RESULT'));
  assert.ok(!svg.includes('<script>'));
  assert.ok(!svg.includes('alert("hi")'));
  assert.match(svg,/75/);
});