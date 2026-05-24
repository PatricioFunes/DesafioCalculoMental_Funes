import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getHistory, getBestScores, clearHistory } from '../utils/storage';
import { GAME_MODES, DIFFICULTY } from '../constants/gameConfig';

// Pantalla de historial y mejores puntajes
export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [bestScores, setBestScores] = useState({});
  const [loading, setLoading] = useState(true);

  // Carga datos cada vez que entramos a esta pantalla
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    setLoading(true);
    const h = await getHistory();
    const b = await getBestScores();
    setHistory(h);
    setBestScores(b);
    setLoading(false);
  }

  function confirmClear() {
    Alert.alert(
      'Limpiar historial',
      '¿Estás seguro? Se borrarán todos los datos y puntajes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar todo',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            loadData();
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#e94560" size="large" />
      </View>
    );
  }

  const hasBestScores = Object.keys(bestScores).length > 0;

  return (
    <View style={styles.container}>

      {/* Mejores puntajes */}
      {hasBestScores && (
        <View style={styles.bestSection}>
          <Text style={styles.sectionTitle}>🏆 Mejores Puntajes</Text>
          {Object.entries(bestScores).map(([key, score]) => {
            const [modeKey, diffKey] = key.split('_');
            return (
              <View key={key} style={styles.bestRow}>
                <Text style={styles.bestKey}>
                  {GAME_MODES[modeKey]?.label ?? modeKey}  ·  {DIFFICULTY[diffKey]?.label ?? diffKey}
                </Text>
                <Text style={styles.bestScore}>{score} pts</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Encabezado del historial */}
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>📋 Partidas jugadas</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={confirmClear}>
            <Text style={styles.clearBtn}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista vacía */}
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎮</Text>
          <Text style={styles.emptyText}>Todavía no jugaste ninguna partida</Text>
          <Text style={styles.emptySubText}>¡Empezá una partida para ver tu historial acá!</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, i) => i.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyMode}>
                  {GAME_MODES[item.mode]?.label ?? item.mode}
                </Text>
                <Text style={styles.historyDiff}>
                  {DIFFICULTY[item.difficulty]?.label ?? item.difficulty}  ·  {item.rounds} preguntas
                </Text>
                <Text style={styles.historyStats}>
                  ✅ {item.correct}  ❌ {item.wrong}  ⏰ {item.timeouts}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(item.date).toLocaleString('es-AR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={[
                  styles.historyScore,
                  { color: item.totalScore >= 0 ? '#4ecca3' : '#e94560' },
                ]}>
                  {item.totalScore > 0 ? '+' : ''}{item.totalScore}
                </Text>
                <Text style={styles.historyScoreLabel}>pts</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  bestSection: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a3a5e',
  },
  sectionTitle: {
    color: '#4ecca3',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  bestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2e4e',
  },
  bestKey: { color: '#aaa', fontSize: 14 },
  bestScore: { color: '#f5a623', fontWeight: 'bold', fontSize: 16 },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearBtn: { color: '#e94560', fontSize: 14 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyText: { color: '#aaa', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  emptySubText: { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 6 },

  historyItem: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a3a5e',
  },
  historyLeft: { flex: 1 },
  historyMode: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  historyDiff: { color: '#888', fontSize: 12, marginTop: 2 },
  historyStats: { color: '#aaa', fontSize: 12, marginTop: 4 },
  historyDate: { color: '#555', fontSize: 11, marginTop: 4 },
  historyRight: { alignItems: 'flex-end' },
  historyScore: { fontSize: 26, fontWeight: 'bold' },
  historyScoreLabel: { color: '#666', fontSize: 11 },
});
