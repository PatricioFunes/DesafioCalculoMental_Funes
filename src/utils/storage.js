import AsyncStorage from '@react-native-async-storage/async-storage';

// Claves que usamos para guardar datos
const KEYS = {
  history: 'game_history',
  bestScores: 'best_scores',
};

// Guarda el resultado de una partida
export async function saveGameResult(result) {
  try {
    const existing = await getHistory();
    const newEntry = { ...result, date: new Date().toISOString() };
    // Guardamos las últimas 50 partidas
    const updated = [newEntry, ...existing].slice(0, 50);
    await AsyncStorage.setItem(KEYS.history, JSON.stringify(updated));
    await updateBestScore(result);
  } catch (e) {
    console.error('Error guardando resultado:', e);
  }
}

// Actualiza el mejor puntaje si corresponde
async function updateBestScore(result) {
  try {
    const best = await getBestScores();
    const key = `${result.mode}_${result.difficulty}`;
    if (!best[key] || result.totalScore > best[key]) {
      best[key] = result.totalScore;
      await AsyncStorage.setItem(KEYS.bestScores, JSON.stringify(best));
    }
  } catch (e) {
    console.error('Error actualizando mejor puntaje:', e);
  }
}

// Obtiene el historial completo
export async function getHistory() {
  try {
    const data = await AsyncStorage.getItem(KEYS.history);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// Obtiene los mejores puntajes
export async function getBestScores() {
  try {
    const data = await AsyncStorage.getItem(KEYS.bestScores);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

// Borra todo el historial
export async function clearHistory() {
  try {
    await AsyncStorage.multiRemove([KEYS.history, KEYS.bestScores]);
  } catch (e) {
    console.error('Error borrando historial:', e);
  }
}
