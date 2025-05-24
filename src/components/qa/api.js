export const fetchQuestions = async () => {
  const response = await fetch('http://127.0.0.1:5000/api/questions');
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch questions');
  }
  return response.json();
};

export const submitAnswer = async (questionId, answer) => {
  const response = await fetch('http://127.0.0.1:5000/api/submit_answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_id: questionId, answer })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to submit answer');
  }
  return response.json();
};