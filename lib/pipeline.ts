import { buildInterviewKit, type InterviewKit, type Requirement, type Question, type ScheduleDay } from './interview-kit';
import { crawlCompanySite } from './scraper';
import { generateCompanyBrief } from './llm';

export async function generateKitPipeline(input: {
  companyUrl: string;
  jobDescription: string;
  daysToInterview: number;
}): Promise<InterviewKit> {
  const base = await buildInterviewKit(input);

  const scraped = await crawlCompanySite(input.companyUrl);
  const companyBrief = await generateCompanyBrief(scraped.companyText || input.companyUrl, input.jobDescription);

  const updatedRequirements = base.requirements.map((requirement, index) => ({
    ...requirement,
    text: requirement.text || `Core competency ${index + 1}`,
  }));

  const enrichedQuestions = base.questions.map((question, index) => ({
    ...question,
    prompt: question.prompt || `Discuss your experience with requirement ${index + 1}.`,
  }));

  const schedule = base.schedule.map((day: ScheduleDay) => ({
    ...day,
    focus: day.focus || `Review priority focus ${day.day}`,
  }));

  return {
    ...base,
    companyBrief: {
      summary: companyBrief.summary || base.companyBrief.summary,
      whatTheyDo: companyBrief.whatTheyDo || base.companyBrief.whatTheyDo,
      note: scraped.bestPage ? `Candidate pages reviewed: ${scraped.pages.length}. Best match: ${scraped.bestPage.title}` : base.companyBrief.note,
    },
    requirements: updatedRequirements,
    questions: enrichedQuestions,
    schedule,
  };
}
