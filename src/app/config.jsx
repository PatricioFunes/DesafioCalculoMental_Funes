import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { DIFFICULTY, GAME_MODES, ROUND_OPTIONS } from '../constants/gameConfig';

// Pantalla de configuración antes de empezar a jugar
export default function ConfigScreen() {
  const router = useRouter();

  // Estados: qué eligió el usuario
  const [selectedMode, setSelectedMode] = useState('classic');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [selectedRounds, setSelectedRounds] = useState(10);

  const startGame = () => {
    // Navegamos al juego pasando los parámetros elegidos
    router.push({
      pathname: '/game',
      params: {
        mode: selectedMode,
        difficulty: selectedDifficulty,
        rounds: selectedRounds,
      },
    });
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {/* SECCIÓN: Modo de juego */}
      <Text style={styles.sectionTitle}>Modo de Juego</Text>
      {Object.entries(GAME_MODES).map(([key, val]) => (
        <TouchableOpacity
          key={key}
          style={[styles.option, selectedMode === key && styles.optionSelected]}
          onPress={() => setSelectedMode(key)}
        >
          <Text style={styles.optionIcon}>{val.icon}</Text>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionLabel}>{val.label}</Text>
            <Text style={styles.optionDesc}>{val.description}</Text>
          </View>
          {selectedMode === key && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      ))}

      {/* SECCIÓN: Dificultad */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Dificultad</Text>
      {Object.entries(DIFFICULTY).map(([key, val]) => (
        <TouchableOpacity
          key={key}
          style={[styles.option, selectedDifficulty === key && styles.optionSelected]}
          onPress={() => setSelectedDifficulty(key)}
        >
          <Text style={styles.optionIcon}>
            {key === 'easy' ? '🟢' : key === 'medium' ? '🟡' : '🔴'}
          </Text>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionLabel}>{val.label}</Text>
            <Text style={styles.optionDesc}>
              {val.timePerQuestion}s por pregunta · Operaciones: {val.operations.join(' ')}
            </Text>
          </View>
          {selectedDifficulty === key && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      ))}

      {/* SECCIÓN: Cantidad de rondas (oculto en modo countdown) */}
      {selectedMode !== 'countdown' && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Cantidad de Preguntas</Text>
          <View style={styles.roundsRow}>
            {ROUND_OPTIONS.map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.roundBtn, selectedRounds === n && styles.roundSelected]}
                onPress={() => setSelectedRounds(n)}
              >
                <Text style={[styles.roundText, selectedRounds === n && styles.roundTextSelected]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Botón iniciar */}
      <TouchableOpacity style={styles.startBtn} onPress={startGame}>
        <Text style={styles.startText}>¡Empezar a jugar! ▶</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 48 },
  sectionTitle: {
    color: '#4ecca3',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  option: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#e94560',
    backgroundColor: '#1e1a2e',
  },
  optionIcon: { fontSize: 22, marginRight: 12 },
  optionTextContainer: { flex: 1 },
  optionLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  optionDesc: { color: '#888', fontSize: 12, marginTop: 2 },
  checkmark: { color: '#e94560', fontSize: 20, fontWeight: 'bold' },
  roundsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  roundBtn: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roundSelected: { borderColor: '#e94560', backgroundColor: '#1e1a2e' },
  roundText: { color: '#888', fontSize: 20, fontWeight: 'bold' },
  roundTextSelected: { color: '#fff' },
  startBtn: {
    backgroundColor: '#e94560',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  startText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
