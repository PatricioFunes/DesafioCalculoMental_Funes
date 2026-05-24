import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Este archivo define la navegación principal de la app
// Stack = navegación tipo "pila de pantallas" (una encima de la otra)
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f0f1a' },
          headerTintColor: '#ffffff',
          contentStyle: { backgroundColor: '#0f0f1a' },
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="index" options={{ title: '🧠 Desafío Mental' }} />
        <Stack.Screen name="config" options={{ title: '⚙️ Configurar Partida' }} />
        <Stack.Screen name="game" options={{ title: 'Jugando...', headerBackVisible: false }} />
        <Stack.Screen name="results" options={{ title: '🏁 Resultados', headerBackVisible: false }} />
        <Stack.Screen name="history" options={{ title: '📊 Historial' }} />
      </Stack>
    </>
  );
}
