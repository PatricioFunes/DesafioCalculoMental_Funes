import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GAME_MODES, DIFFICULTY } from '../constants/gameConfig';

// Pantalla de resultados al terminar una partida
export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const correct = parseInt(params.correct) || 0;
  const wrong = parseInt(params.wrong) || 0;
  const timeouts = parseInt(params.timeouts) || 0;
  const totalScore = parseInt(params.totalScore) || 0;
  const total = parseInt(params.total) || 1;
  const { mode, difficulty } = params;

  const accuracy = Math.round((correct / total) * 100);

  // Elegimos emoji según la precisión
  const emoji = accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🥇' : accuracy >= 50 ? '👍' : '💪';
  const message = accuracy >= 90 ? '¡Excelente!'
    : accuracy >= 70 ? '¡Muy bien!'
    : accuracy >= 50 ? '¡Buen intento!'
    : '¡Seguí practicando!';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {/* Encabezado */}
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.modeLine}>
        {GAME_MODES[mode]?.label}  ·  {DIFFICULTY[difficulty]?.label}  ·  {total} preguntas
      </Text>

      {/* Puntaje final */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>PUNTAJE FINAL</Text>
        <Text style={styles.scoreValue}>{totalScore}</Text>
        <Text style={styles.scoreSubLabel}>puntos</Text>
      </View>

      {/* Estadísticas de la ronda */}
      <View style={styles.statsGrid}>
        <StatBox label="Correctas" value={correct} color="#4ecca3" icon="✅" />
        <StatBox label="Incorrectas" value={wrong} color="#e94560" icon="❌" />
        <StatBox label="Timeouts" value={timeouts} color="#f5a623" icon="⏰" />
        <StatBox label="Precisión" value={`${accuracy}%`} color="#a78bfa" icon="🎯" />
      </View>

      {/* Barra de precisión */}
      <View style={styles.accuracySection}>
        <Text style={styles.accuracyLabel}>Precisión: {accuracy}%</Text>
        <View style={styles.accuracyBarBg}>
          <View style={[styles.accuracyBarFill, { width: `${accuracy}%` }]} />
        </View>
      </View>

      {/* Botones */}
      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={() => router.replace('/config')}
      >
        <Text style={styles.btnText}>▶  Jugar de nuevo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnSecondary}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.btnText}>🏠  Menú principal</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnTertiary}
        onPress={() => router.push('/history')}
      >
        <Text style={styles.btnTextTertiary}>📊  Ver historial completo</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// Componente de tarjeta de estadística individual
function StatBox({ label, value, color, icon }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: {
    padding: 24,
    alignItems: 'center',
    paddingBottom: 48,
  },
  emoji: { fontSize: 72, marginBottom: 8 },
  message: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modeLine: {
    color: '#888',
    fontSize: 13,
    marginBottom: 28,
  },
  scoreCard: {
    backgroundColor: '#e94560',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scoreValue: {
    color: '#fff',
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 72,
  },
  scoreSubLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a3a5e',
  },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 30, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },

  accuracySection: { width: '100%', marginBottom: 32 },
  accuracyLabel: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  accuracyBarBg: {
    height: 10,
    backgroundColor: '#1e1e2e',
    borderRadius: 5,
    overflow: 'hidden',
  },
  accuracyBarFill: {
    height: '100%',
    backgroundColor: '#a78bfa',
    borderRadius: 5,
  },

  btnPrimary: {
    width: '100%',
    backgroundColor: '#e94560',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a3a5e',
  },
  btnTertiary: {
    paddingVertical: 12,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  btnTextTertiary: { color: '#4ecca3', fontSize: 15 },
});
