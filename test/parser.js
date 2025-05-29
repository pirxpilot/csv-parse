const test = require('node:test');
const assert = require('node:assert/strict');

const { pipeThrough } = require('..');

test('empty', async () => {
  const from = ReadableStream.from([]);
  const lines = pipeThrough(from);
  let counter = 0;
  for await (const line of lines) {
    assert.fail(`${line} should not be emitted`);
    counter += 1;
  }
  assert.equal(counter, 0);
});

test('single field', async () => {
  const csv = ['abc'];
  const expected = [csv];
  await testParser(csv, expected);
});

test('multiple fields', async () => {
  const csv = ['abc,def,egf', 'ijk,lmno'];
  const expected = [['abc', 'def', 'egfijk', 'lmno']];
  await testParser(csv, expected);
});

test('multiple lines', async () => {
  const csv = ['abc,def,egf', 'ijk,lm\nno', '111,222,333\n', 'pp ,, qq😅🤗\n😜🇨🇴🇬🇭q'];
  const expected = [['abc', 'def', 'egfijk', 'lm'], ['no111', '222', '333'], ['pp ', '', ' qq😅🤗'], ['😜🇨🇴🇬🇭q']];
  await testParser(csv, expected);
});

test('trim fields', async () => {
  const csv = ['abc,def,egf', 'ijk,lm\nno', '111,222,333\n', 'pp ,, qq😅🤗\n😜🇨🇴🇬🇭q'];
  const expected = [['abc', 'def', 'egfijk', 'lm'], ['no111', '222', '333'], ['pp', '', 'qq😅🤗'], ['😜🇨🇴🇬🇭q']];
  await testParser(csv, expected, { trim: true });
});

test('quoted fields', async () => {
  const csv = ['abc,"def","eg,f', 'ijk",lm\nno', '111,222,333'];
  const expected = [
    ['abc', 'def', 'eg,fijk', 'lm'],
    ['no111', '222', '333']
  ];
  await testParser(csv, expected);
});

test('quoted fields with escaped quotes', async () => {
  const csv = ['abc,"d\\"ef","eg,f', 'ijk",lm\nno', '1"11,2\\"22,333'];
  const expected = [
    ['abc', 'd"ef', 'eg,fijk', 'lm'],
    ['no1"11', '2\\"22', '333']
  ];
  await testParser(csv, expected);
});

async function testParser(csv, expected, opts) {
  const from = ReadableStream.from(csv);
  const lines = pipeThrough(from, opts);
  let counter = 0;
  for await (const line of lines) {
    assert.deepEqual(line, expected[counter], `line ${counter} should be equal`);
    counter += 1;
  }
  assert.equal(counter, expected.length);
}
