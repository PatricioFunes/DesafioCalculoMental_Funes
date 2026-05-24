import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// Pantalla principal / menú
export default function HomeScreen() {
  const router = useRouter(); // hook para navegar entre pantallas

  return (
    <View style={styles.container}>
      {/* Logo / título */}
      <Text style={styles.emoji}>🧠</Text>
      <Text style={styles.title}>Desafío de{'\n'}Cálculo Mental</Text>
      <Text style={styles.subtitle}>
        Ponete a prueba con operaciones matemáticas bajo presión de tiempo
      </Text>

      {/* Botón nueva partida */}
      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={() => router.push('/config')}
      >
        <Text style={styles.btnText}>▶  Nueva Partida</Text>
      </TouchableOpacity>

      {/* Botón historial */}
      <TouchableOpacity
        style={styles.btnSecondary}
        onPress={() => router.push('/history')}
      >
        <Text style={styles.btnText}>📊  Historial y Puntajes</Text>
      </TouchableOpacity>

      {/* Info del sistema de puntaje */}
      <View style={styles.scoreInfo}>
        <Text style={styles.scoreInfoTitle}>Sistema de Puntaje</Text>
        <Text style={styles.scoreInfoText}>⚡ Rápida y correcta: +100 pts</Text>
        <Text style={styles.scoreInfoText}>✅ Correcta en tiempo: +70 pts</Text>
        <Text style={styles.scoreInfoText}>❌ Incorrecta: -30 pts</Text>
        <Text style={styles.scoreInfoText}>⏰ Sin responder: -50 pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 20,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#e94560',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 14,
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
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2a3a5e',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreInfo: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#2a3a5e',
  },
  scoreInfoTitle: {
    color: '#4ecca3',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreInfoText: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 4,
  },
});
