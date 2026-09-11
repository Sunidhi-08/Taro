export type RequirementPriority = 'must' | 'nice';
export type RequirementKind = 'technical' | 'behavioural' | 'domain';

export type Requirement = {
  id: string;
  text: string;
  priority: RequirementPriority;
  kind: RequirementKind;
};

export type Question = {
  id: string;
  requirementIds: string[];
  prompt: string;
  difficulty: number;
  priority: RequirementPriority;
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
};

export type ScheduleDay = {
  day: number;
  focus: string;
  questions: Question[];
};

export type InterviewKit = {
  status: 'ready' | 'failed';
  companyBrief: { summary: string; whatTheyDo: string; note?: string };
  requirements: Requirement[];
  questions: Question[];
  flashcards: Flashcard[];
  schedule: ScheduleDay[];
};

export function extractRequirements(jobDescription: string): Requirement[] {
  const normalized = jobDescription
    .replace(/\r/g, '')
    .replace(/\n+/g, '\n')
    .trim();

  if (!normalized) {
    return [];
  }

  const lines = normalized
    .split('\n')
    .map((line) => line.replace(/[-•*]/g, '').trim())
    .filter(Boolean);

  const requirementLines = lines.filter((line) => {
    const l = line.toLowerCase();
    return (
      l.includes('requirement') ||
      l.includes('must have') ||
      l.includes('required') ||
      l.includes('preferred') ||
      l.includes('nice to have') ||
      l.includes('qualifications') ||
      l.includes('experience') ||
      l.includes('skills') ||
      /(react|typescript|aws|docker|python|sql|leadership|communication|design|agile|testing)/i.test(line)
    );
  });

  if (requirementLines.length === 0) {
    return [{
      id: 'r1',
      text: normalized.slice(0, 180) || 'General role understanding',
      priority: 'must',
      kind: 'technical',
    }];
  }

  return requirementLines.map((line, index) => {
    const lower = line.toLowerCase();
    const priority: RequirementPriority =
      lower.includes('nice to have') || lower.includes('preferred') || lower.includes('bonus') ? 'nice' : 'must';

    const kind: RequirementKind =
      /(react|typescript|javascript|python|sql|aws|docker|kubernetes|java|node|graphql|cloud|data)/i.test(line)
        ? 'technical'
        : /(leadership|communication|stakeholder|team|mentor|collaboration|ownership)/i.test(line)
          ? 'behavioural'
          : 'domain';

    return {
      id: `r${index + 1}`,
      text: line.replace(/^.*?:\s*/, '').trim(),
      priority,
      kind,
    };
  });
}

export function checkCoverage(requirements: Requirement[], questionRequirementIds: string[]): string[] {
  const requirementIds = new Set(requirements.filter((r) => r.priority === 'must').map((r) => r.id));
  const covered = new Set(questionRequirementIds);

  return [...requirementIds].filter((id) => !covered.has(id));
}

export function buildSchedule(questions: Question[], daysToInterview: number): ScheduleDay[] {
  const totalDays = Math.max(1, Math.min(60, daysToInterview));
  const mustFirst = [...questions].sort((a, b) => {
    if (a.priority === b.priority) return (b.difficulty ?? 1) - (a.difficulty ?? 1);
    return a.priority === 'must' ? -1 : 1;
  });

  const schedule: ScheduleDay[] = Array.from({ length: totalDays }, (_, index) => ({
    day: index + 1,
    focus: '',
    questions: [],
  }));

  mustFirst.forEach((question, index) => {
    const dayIndex = index % totalDays;
    schedule[dayIndex].questions.push(question);
  });

  schedule.forEach((day) => {
    if (!day.questions.length) {
      day.focus = 'Review fundamentals';
      return;
    }

    const focusQuestion = [...day.questions].sort((a, b) => {
      if (a.priority === b.priority) return (b.difficulty ?? 1) - (a.difficulty ?? 1);
      return a.priority === 'must' ? -1 : 1;
    })[0];

    day.focus = focusQuestion?.prompt || 'Review fundamentals';
  });

  return schedule;
}

export async function buildInterviewKit(input: {
  companyUrl: string;
  jobDescription: string;
  daysToInterview: number;
  companyHtml?: string;
}): Promise<InterviewKit> {
  const requirements = extractRequirements(input.jobDescription);

  const questions = requirements.map((requirement, index) => ({
    id: `q${index + 1}`,
    requirementIds: [requirement.id],
    prompt: `Tell me about your experience with ${requirement.text}.`,
    difficulty: requirement.priority === 'must' ? 2 : 1,
    priority: requirement.priority,
  }));

  const uncovered = checkCoverage(requirements, questions.map((q) => q.requirementIds).flat());
  const coverageQuestions = uncovered.map((requirementId, index) => ({
    id: `q${questions.length + index + 1}`,
    requirementIds: [requirementId],
    prompt: `Discuss how you have handled ${requirementId} in a past role.`,
    difficulty: 2,
    priority: 'must' as RequirementPriority,
  }));

  const allQuestions = [...questions, ...coverageQuestions];
  const flashcards = allQuestions.map((question, index) => ({
    id: `f${index + 1}`,
    front: question.prompt,
    back: `Answer by discussing concrete examples related to ${question.requirementIds.join(', ')}`,
  }));

  const schedule = buildSchedule(allQuestions, input.daysToInterview);

  return {
    status: 'ready',
    companyBrief: {
      summary: input.companyHtml
        ? `Company site indicates a technology-focused business with a hiring emphasis on ${requirements[0]?.text ?? 'core role skills'}.`
        : 'Company information could not be fetched, but the role brief is based on the provided job description.',
      whatTheyDo: `This role focuses on ${requirements.map((r) => r.text).slice(0, 3).join(', ') || 'key technical and collaboration skills'}.`,
      note: input.companyUrl ? `Research source: ${input.companyUrl}` : undefined,
    },
    requirements,
    questions: allQuestions,
    flashcards,
    schedule,
  };
}
