import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractRequirements,
  checkCoverage,
  buildSchedule,
  buildInterviewKit,
} from '../lib/interview-kit';

test('extractRequirements identifies must-have and nice-to-have requirements', () => {
  const jd = `
  Responsibilities
  - Own the frontend roadmap
  Requirements
  - Must have React and TypeScript experience
  - Experience with AWS and Docker is required
  - Nice to have: GraphQL and mentoring
  `;

  const requirements = extractRequirements(jd);
  assert.equal(requirements.length, 4);
  assert.deepEqual(requirements.map((r) => r.priority), ['must', 'must', 'must', 'nice']);
  assert.ok(requirements.every((r) => r.id));
});

test('checkCoverage detects missing must-have questions', () => {
  const requirements: Array<{ id: string; text: string; priority: 'must'; kind: 'technical' | 'behavioural' }> = [
    { id: 'r1', text: 'React', priority: 'must', kind: 'technical' },
    { id: 'r2', text: 'Leadership', priority: 'must', kind: 'behavioural' },
  ];

  const uncovered = checkCoverage(requirements, ['r1']);
  assert.deepEqual(uncovered, ['r2']);
});

test('buildSchedule distributes questions across the requested number of days', () => {
  const questions: Array<{ id: string; requirementIds: string[]; prompt: string; difficulty: number; priority: 'must' | 'nice' }> = [
    { id: 'q1', requirementIds: ['r1'], prompt: 'Discuss React proficiency', difficulty: 3, priority: 'must' },
    { id: 'q2', requirementIds: ['r2'], prompt: 'Describe a leadership example', difficulty: 2, priority: 'must' },
    { id: 'q3', requirementIds: ['r3'], prompt: 'Discuss a nice-to-have skill', difficulty: 1, priority: 'nice' },
  ];

  const schedule = buildSchedule(questions, 2);
  assert.equal(schedule.length, 2);
  assert.ok(schedule.every((day) => Array.isArray(day.questions)));
  assert.ok(schedule.some((day) => day.questions.some((q) => q.id === 'q1')));
});

test('buildInterviewKit produces a structured kit with coverage and schedule', async () => {
  const kit = await buildInterviewKit({
    companyUrl: 'https://example.com',
    jobDescription: 'Must have React, TypeScript, and leadership experience. Nice to have AWS.',
    daysToInterview: 3,
    companyHtml: '<html><body><h1>Example Corp</h1><p>We build software.</p></body></html>',
  });

  assert.equal(kit.status, 'ready');
  assert.ok(Array.isArray(kit.requirements));
  assert.ok(Array.isArray(kit.questions));
  assert.ok(Array.isArray(kit.flashcards));
  assert.ok(Array.isArray(kit.schedule));
  assert.ok(kit.companyBrief.summary.length > 10);
});
