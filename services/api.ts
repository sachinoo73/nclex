import type { Question } from '@/data/questions';

const baseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || '').trim();

function getApiBase(): string {
  const fallback = 'http://localhost:3000';
  if (!baseUrl) return fallback;
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

export async function fetchRandomQuestion(excludeIds?: string[]): Promise<Question | null> {
  const query = excludeIds && excludeIds.length > 0 ? `?exclude=${encodeURIComponent(excludeIds.join(','))}` : '';
  const url = `${getApiBase()}/questions/random${query}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  if (response.status === 204) {
    return null; // exhausted
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch question (${response.status})`);
  }
  const data = (await response.json()) as Question;
  return data;
}


