export type MultipleChoiceOptionKey = 'A' | 'B' | 'C' | 'D';

export type Question = {
  id?: string;
  question: string;
  options: Record<MultipleChoiceOptionKey, string>;
  correctAnswer: MultipleChoiceOptionKey;
  explanation: string;
  category?: string;
  subcategory?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  nclexCategory?: string;
};

export const questions: Question[] = [
  {
    question:
      'A client with heart failure is prescribed furosemide (Lasix). Which assessment finding should the nurse prioritize monitoring in this client?',
    options: {
      A: 'Blood glucose levels',
      B: 'Potassium levels',
      C: 'White blood cell count',
      D: 'Thyroid function tests',
    },
    correctAnswer: 'B',
    explanation:
      'The correct answer is B: Potassium levels. Furosemide is a loop diuretic that can cause potassium depletion, leading to hypokalemia. Monitoring potassium levels is crucial to prevent potential complications such as cardiac dysrhythmias. Blood glucose levels, white blood cell count, and thyroid function tests are not directly impacted by furosemide administration in the context of heart failure.',
    category: 'Pharmacology',
    subcategory: 'Diuretics',
    difficulty: 'medium',
    nclexCategory: 'Safe and Effective Care Environment',
  },
];


