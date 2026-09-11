# Taro Interview Kit

Taro is a full-stack interview preparation application. A user supplies a company or job URL, pastes a job description, and chooses the number of days before the interview. Taro turns that input into a structured preparation kit containing requirements, interview questions, flashcards, and a daily study schedule.

## What I Built

- Registration, login, logout, and cookie-based sessions
- MongoDB Atlas persistence for users and interview kits
- Dashboard showing a user's saved kits
- Custom kit creation form with URL, job description, and selectable preparation days
- Requirement extraction with must-have and nice-to-have priorities
- Company research through the supplied URL
- Deterministic interview question and flashcard generation
- Must-have coverage checking and fallback questions
- Day-by-day preparation schedule
- Interactive practice mode with flashcard scoring
- Kit builder view with requirements, questions, schedule, and practice links
- Health endpoint for checking MongoDB connectivity
- Automated tests and batch evaluation script

## Technology

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- MongoDB Atlas with Mongoose/MongoDB driver
- bcryptjs for password hashing
- Cheerio for company-page text extraction
- Optional Gemini integration through `GEMINI_API_KEY`

## Project Structure

```text
app/
  api/                 Authentication, health, and kit API routes
  dashboard/           User dashboard and kit creation form
  kit/[id]/            Kit builder and study schedule
  practice/[id]/       Interactive flashcard practice
  login/               Login page
  register/            Registration page
lib/
  auth.ts              Session and current-user helpers
  interview-kit.ts     Requirement, question, coverage, and schedule logic
  llm.ts               Optional AI brief generation with fallback
  mongo.ts             MongoDB connection helper
  pipeline.ts           Scraping and kit-generation pipeline
  scraper.ts            Company-site text extraction
  store.ts              MongoDB-first persistence with local fallback
tests/                 Automated interview-kit tests
scripts/evaluate.ts     Batch evaluator
```

## Run Locally

Use the project directory, not its parent folder:

```powershell
cd "D:\Downloads\Taro\taro"
npm install
```

Create `.env.local`:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/Taro?retryWrites=true&w=majority
SESSION_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=
NODE_ENV=development
```

If the MongoDB password contains special characters, URL-encode them. For example, `@` becomes `%40`.

Start the application:

```powershell
npm run dev
```

Open http://localhost:3000.

## User Flow

1. Open `/register` and create an account.
2. The account is saved in MongoDB Atlas under `Taro.users`.
3. Open the dashboard and choose **Add interview kit**.
4. Enter a company URL and paste the full job description.
5. Select the number of preparation days.
6. Create the kit.
7. Open the kit builder to review requirements, questions, and the study plan.
8. Open practice mode and score flashcards from 1 to 5.
9. The kit and practice scores are saved in MongoDB under `Taro.kits`.

## Verify MongoDB

With the development server running, visit:

```text
http://localhost:3000/api/health
```

Successful response:

```json
{
  "status": "ok",
  "database": "connected",
  "environment": "development"
}
```

If the database is disconnected, check the Atlas database user password and Network Access allowlist.

## Automated Verification

```powershell
cd "D:\Downloads\Taro\taro"
npm run build
npm test
npm run evaluate -- cases.json kits.json
```

The current test suite covers requirement extraction, must-have coverage, schedule distribution, and complete kit generation.

## Batch Evaluation

Run the evaluator with the included sample cases:

```powershell
npm run evaluate -- cases.json kits.json
```

Example case:

```json
[
  {
    "companyUrl": "https://example.com",
    "jobDescription": "Must have React and TypeScript experience. Nice to have leadership.",
    "daysToInterview": 7
  }
]
```

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. Import the repository into Vercel.
3. Add these Vercel environment variables:

```env
MONGODB_URI=your-mongodb-atlas-connection-string
SESSION_SECRET=your-production-secret
GEMINI_API_KEY=optional-gemini-key
NODE_ENV=production
```

4. In MongoDB Atlas, add the required Vercel network access rule.
5. Deploy and test registration, kit creation, and practice mode on the live URL.

Never commit `.env.local`, database passwords, or API keys. Use `.env.example` as the safe configuration template.

## Assignment Submission Checklist

- GitHub repository URL
- Hosted Vercel project URL
- Frontend repository URL
- Backend repository URL, or the same full-stack repository if frontend and backend are combined
- GitHub profile URL
- LinkedIn profile URL
- Public resume link
- Public or unlisted demo video link

For the demo video, show registration, dashboard, custom kit creation, selectable preparation days, generated questions, schedule, and practice scoring.
