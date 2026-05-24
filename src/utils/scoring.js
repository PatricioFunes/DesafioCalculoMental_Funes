import { SCORE_RULES } from '../constants/gameConfig';

// Calcula el puntaje de una respuesta
// isCorrect: true/false/null (null = timeout)
// timeUsed: segundos que tardó en responder
// totalTime: tiempo máximo permitido
export function calculateScore(isCorrect, timeUsed, totalTime) {
  if (isCorrect === null) return SCORE_RULES.timeout;  // Se acabó el tiempo
  if (!isCorrect) return SCORE_RULES.wrong;            // Respuesta incorrecta

  // Respuesta correcta: diferenciamos si fue rápida o no
  const timeRatio = timeUsed / totalTime;
  if (timeRatio < 0.75) return SCORE_RULES.fastCorrect; // Menos del 75% del tiempo
  return SCORE_RULES.normalCorrect;                      // En el tiempo restante
}

// Calcula las estadísticas de una ronda completa
export function buildRoundStats(answers) {
  const correct = answers.filter(a => a.isCorrect === true).length;
  const wrong = answers.filter(a => a.isCorrect === false).length;
  const timeouts = answers.filter(a => a.isCorrect === null).length;
  const totalScore = answers.reduce((sum, a) => sum + a.score, 0);

  const answeredTimes = answers.filter(a => a.timeUsed != null).map(a => a.timeUsed);
  const avgTime = answeredTimes.length > 0
    ? answeredTimes.reduce((s, t) => s + t, 0) / answeredTimes.length
    : 0;

  return {
    correct,
    wrong,
    timeouts,
    totalScore,
    avgTime: avgTime.toFixed(1),
    total: answers.length,
    accuracy: answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0,
  };
}
