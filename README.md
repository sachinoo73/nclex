# NCLEX RN Practice (Expo + MongoDB)

An iOS-first NCLEX RN practice app built with Expo Router. It presents multiple choice questions, validates answers, shows rationales in a modal, and supports remote questions from MongoDB. A green theme provides consistent feedback for correct/incorrect responses.

## Features
- Question flow (MCQ) with tap-to-answer
- Wrong answer -> rationale modal with "Next Question"
- Correct answer -> brief highlight then auto-advance (configurable)
- Pull questions from MongoDB via a small Express API
- Duplicate-avoidance when fetching random questions
- Persistent progress: answered, correct, streak, best streak, accuracy bar, reset

## Project structure
- `app/(tabs)/index.tsx`: Home screen quiz UI and logic
- `data/questions.ts`: Local fallback sample question type and seed
- `services/api.ts`: Client for API (`/questions/random`)
- `server/`: Minimal Express API (MongoDB-backed)
- `hooks/useProgress.ts`: AsyncStorage-powered progress tracking
- `constants/Colors.ts`: Green theme

## Prerequisites
- Node 18+
- Xcode (for iOS simulator) or Expo Go on device
- MongoDB Atlas or a MongoDB instance

## Setup
1) Install dependencies
```bash
npm install
```

2) Start the API server (MongoDB)
```bash
cd server
cp .env.example .env  # if you created one, or edit .env directly
# .env values:
# MONGODB_URI=your_connection_string
# MONGODB_DB_NAME=nclex
# MONGODB_COLLECTION=questions
# PORT=4000

npm install
npm start
```
The API should log: `Connected to MongoDB` and `API listening on http://localhost:4000`.

3) Configure the app to reach the API
Create `.env` in project root:
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```
If testing on a physical iPhone, use your machine’s LAN IP (e.g. `http://192.168.1.23:4000`).

4) Run the app
```bash
npx expo start
```
Then open iOS simulator or Expo Go.

## MongoDB document shape
Each question should resemble:
```json
{
  "question": "string",
  "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
  "correctAnswer": "A|B|C|D",
  "explanation": "string",
  "category": "string?",
  "subcategory": "string?",
  "difficulty": "easy|medium|hard?",
  "nclexCategory": "string?"
}
```
The API normalizes `_id` to `id` and supports duplicate-avoidance via `GET /questions/random?exclude=id1,id2`.

## Progress tracking
Stored in AsyncStorage under `progress:v1` and shown on the Home screen:
- Answered, Correct, Streak chips
- Accuracy bar (percentage of correct answers)
- Reset button clears progress

## Customization
- Theme colors: `constants/Colors.ts`
- Auto-advance on correct answers: adjust delay or switch to manual
- Rationale modal: tweak copy or add a secondary action

## Scripts
```bash
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web preview
npm run lint    # Lint
```

## Notes
- On physical device, ensure your phone and computer are on the same network.
- If simulator launch fails due to Xcode, set the developer tools path:
  ```bash
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  ```

