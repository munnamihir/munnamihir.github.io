'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const quest=require('../voxa-studio/proof-quest/quest-core.js');
test('classic route preserves original four case IDs',()=>{
 assert.equal(quest.CASES.length,4);
 assert.deepEqual(quest.getCases('classic').map(x=>x.id),quest.CASES.map(x=>x.id));
});
test('daily and expert select the specified number of unique cases',()=>{
 for(const [mode,count] of [['daily',3],['expert',6]]){
   const cases=quest.getCases(mode,'2026-11-19');
   assert.equal(cases.length,count);
   assert.equal(new Set(cases.map(x=>x.id)).size,count);
 }
});
test('all 8 scenarios have three unique artifacts and valid outcomes',()=>{
 assert.equal(quest.ALL_CASES.length,8);
 assert.equal(new Set(quest.ALL_CASES.map(c=>c.id)).size,8);
 for(const c of quest.ALL_CASES){
   assert.equal(c.evidence.length,3);
   assert.equal(new Set(c.evidence.map(x=>x.id)).size,3);
   assert.ok(['supported','insufficient','contradicted'].includes(c.answer));
   assert.equal(quest.evaluate(c.id,c.answer,false).points,25);
   assert.equal(quest.evaluate(c.id,c.answer,true).points,20);
   const wrong=quest.VERDICTS.find(v=>v.id!==c.answer);
   assert.equal(quest.evaluate(c.id,wrong.id,false).points,0);
 }
});
test('daily selection and challenge code are stable and date-specific',()=>{
 assert.deepEqual(quest.getCases('daily','2026-11-19'),quest.getCases('daily','2026-11-19'));
 assert.match(quest.challengeCode('2026-11-19'),/^VX-20261119-[0-9A-F]{6}$/);
 const ids=Array.from({length:6},(_,i)=>quest.getCases('daily','2026-11-'+String(19+i)).map(x=>x.id).join(','));
 assert.ok(new Set(ids).size>1);
});
test('invalid date, unknown mode, and impossible score rejected',()=>{
 for(const date of ['2026-02-30','2025-1-1','2026-13-10','__proto__']){
   assert.equal(quest.validDate(date),false);
   assert.throws(()=>quest.getCases('daily',date));
 }
 assert.throws(()=>quest.getCases('__proto__'));
 assert.throws(()=>quest.rank(101,100));
 assert.equal(quest.rank(75,75).title,'Signal Architect');
 assert.equal(quest.rank(100,150).title,'Trace Operator');
});
test('SVG badge marks achievement as game-only and escapes markup',()=>{
 const svg=quest.badgeSvg('<script>hello</script>',65,75,'Daily <mode>');
 assert.ok(!svg.includes('<script>'));
 assert.ok(!svg.includes('<mode>'));
 assert.ok(svg.includes('GAME RESULT'));
 assert.ok(svg.includes(' / 75'));
 assert.ok(svg.includes('DAILY &lt;MODE&gt;'));
});
