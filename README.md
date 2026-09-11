# Taro Interview Kit

> Turn a job description into a focused interview plan.

Taro is a full-stack interview preparation workspace for candidates who want more structure than a collection of browser tabs and scattered notes. Add a job description, research source, and interview date. Taro organizes the role into requirements, questions, flashcards, and a daily preparation schedule.

## Product Preview

```text
Job description + company URL
              |
              v
       Research and extraction
              |
              v
 Requirements -> Questions -> Flashcards
              |
              v
       Personal study schedule
```

## Highlights

| Experience | What it does |
| --- | --- |
| Personal workspace | Create an account and keep interview kits private to your profile. |
| Kit builder | Review extracted requirements, interview questions, and source context in one place. |
| Preparation timeline | Select the number of days available and receive a day-by-day plan. |
| Practice mode | Review flashcards, reveal answers, and save confidence scores from 1 to 5. |
| Coverage checks | Prioritize must-have requirements and generate fallback questions when coverage is incomplete. |
| Research pipeline | Extract useful company context from the supplied website with a deterministic fallback. |

## Built With

- **Next.js** App Router and server API routes
- **TypeScript** across the application and core generation logic
- **React** client experiences for the dashboard and practice mode
- **Tailwind CSS** for the interface
- **MongoDB Atlas** for users, kits, and practice progress
- **Mongoose and MongoDB driver** for connection and persistence
- **Cheerio** for lightweight company-page extraction
- **bcryptjs** for password hashing
- Optional **Gemini** integration for company brief generation

## How It Works

1. A candidate registers and signs in.
2. They add a company or job URL and paste the job description.
3. They choose how many days remain before the interview.
4. Taro extracts technical, domain, and behavioural requirements.
5. The generation pipeline builds questions and checks must-have coverage.
6. Questions become flashcards and are distributed across the selected days.
7. The candidate studies, scores cards, and returns to the kit when needed.

## Project Structure

```text
app/
  api/                 Auth, health, and interview-kit API routes
  dashboard/           Personal workspace and kit creation
  kit/[id]/            Kit builder and study schedule
  practice/[id]/       Interactive flashcard practice
  login/               Login experience
  register/            Registration experience
lib/
  auth.ts              Session and current-user helpers
  interview-kit.ts     Extraction, coverage, questions, and scheduling
  llm.ts               Optional AI brief generation with fallback
  mongo.ts             MongoDB connection management
  pipeline.ts          Research and kit-generation orchestration
  scraper.ts           Company-site text extraction
  store.ts              MongoDB-first persistence layer
tests/                 Core generation tests
scripts/evaluate.ts     Batch evaluation utility
```

## Run Locally

```powershell
cd "D:\Downloads\Taro\taro"
npm install
```

Create `.env.local` from `.env.example`:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/Taro?retryWrites=true&w=majority
SESSION_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=
NODE_ENV=development
```

If the password contains special characters, URL-encode them. For example, `@` becomes `%40`.

Start the app:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data and Health Check

With the app running, open `/api/health`. A healthy connection returns:

```json
{
  "status": "ok",
  "database": "connected",
  "environment": "development"
}
```

MongoDB stores users in `Taro.users` and interview kits in `Taro.kits`. The application keeps a local JSON fallback for development environments where MongoDB is not configured.

Never commit `.env.local`, database passwords, or API keys.

## Testing

Run the core test suite:

```powershell
npm test
```

Run a production build:

```powershell
npm run build
```

Run the batch evaluator:

```powershell
npm run evaluate -- cases.json kits.json
```

The tests cover requirement extraction, must-have coverage, schedule distribution, and complete kit generation.

## Example Input

```json
[
  {
    "companyUrl": "https://example.com",
    "jobDescription": "Must have React and TypeScript experience. Nice to have leadership.",
    "daysToInterview": 7
  }
]
```

## Design Direction

Taro uses a calm, focused workspace aesthetic: dark surfaces reduce visual noise during study sessions, cyan accents identify actions and progress, and compact cards keep requirements scannable. The dashboard is designed around the repeated candidate workflow: create a kit, compare priorities, open practice, and return to the schedule.

## Status

Taro is an active portfolio project with a working authentication flow, MongoDB persistence, generation pipeline, dashboard, kit builder, and practice experience.
