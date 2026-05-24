import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DIFFICULTY, SCORE_RULES } from '../constants/gameConfig';
import {
  generateMultipleChoice,
  generateOperation,
  generateTrueFalseQuestion,
} from '../utils/operations';
import { calculateScore } from '../utils/scoring';
import { saveGameResult } from '../utils/storage';

export default function GameScreen() {
  // Recibimos los parámetros de la pantalla de configuración
  const { mode, difficulty, rounds } = useLocalSearchParams();
  const router = useRouter();

  const totalRounds = parseInt(rounds) || 99999;
  const isCountdown = mode === 'countdown';
  // En countdown no hay timer: usamos un valor alto solo para el cálculo de puntaje
  const timePerQuestion = isCountdown ? 9999 : DIFFICULTY[difficulty].timePerQuestion;

  // Estados del juego
  const [currentRound, setCurrentRound] = useState(0); // índice actual
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [totalScore, setTotalScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | 'timeout'
  const [isAnswering, setIsAnswering] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const answersRef = useRef([]); // copia de respuestas para funciones async

  // Valores de animación
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // escala de la tarjeta
  const shakeAnim = useRef(new Animated.Value(0)).current;   // movimiento horizontal (shake)

  // Genera la pregunta según el modo
  const generateQuestion = useCallback(() => {
    if (mode === 'truefalse') return generateTrueFalseQuestion(difficulty);
    if (mode === 'multiplechoice') return generateMultipleChoice(difficulty);
    return generateOperation(difficulty); // classic y countdown
  }, [mode, difficulty]);

  // Arranca una nueva pregunta
  const startNewQuestion = useCallback(() => {
    clearInterval(timerRef.current);
    setQuestion(generateQuestion());
    setTextInput('');
    setFeedback(null);
    setTimeLeft(timePerQuestion);
    setIsAnswering(true);
    startTimeRef.current = Date.now();

    // Animación de entrada de la tarjeta (scale up)
    scaleAnim.setValue(0.85);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [generateQuestion, timePerQuestion]);

  // Empieza la primera pregunta al montar el componente
  useEffect(() => {
    startNewQuestion();
    return () => clearInterval(timerRef.current);
  }, []);

  // Timer: solo corre si NO es modo countdown
  useEffect(() => {
    if (!isAnswering || isCountdown) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isAnswering, currentRound]);

  // Dispara animación según el resultado (sin flash de color)
  const triggerFlash = useCallback((type) => {
    if (type === 'wrong' || type === 'timeout') {
      // Shake: mueve la tarjeta de izquierda a derecha
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [shakeAnim]);

  // Se acabó el tiempo sin responder
  const handleTimeout = useCallback(() => {
    clearInterval(timerRef.current);
    setIsAnswering(false);
    setFeedback('timeout');
    triggerFlash('timeout');

    const answerRecord = {
      expression: question?.expression,
      correctResult: question?.result,
      userAnswer: null,
      isCorrect: null,
      score: SCORE_RULES.timeout,
      timeUsed: timePerQuestion,
    };

    setTotalScore(prev => prev + SCORE_RULES.timeout);

    setTimeout(() => proceedToNext(answerRecord), 1400);
  });

  // El usuario respondió (cualquier modo)
  const handleAnswer = useCallback((answer) => {
    if (!isAnswering) return;
    clearInterval(timerRef.current);
    setIsAnswering(false);

    const timeUsed = (Date.now() - startTimeRef.current) / 1000;

    // Verificamos si la respuesta es correcta según el modo
    let isCorrect = false;
    if (mode === 'classic' || mode === 'countdown') {
      isCorrect = parseInt(answer, 10) === question.result;
    } else if (mode === 'truefalse') {
      isCorrect = answer === question.isTrue;
    } else if (mode === 'multiplechoice') {
      isCorrect = answer === question.result;
    }

    const score = calculateScore(isCorrect, timeUsed, timePerQuestion);
    setTotalScore(prev => prev + score);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    triggerFlash(isCorrect ? 'correct' : 'wrong');

    const answerRecord = {
      expression: question.expression,
      correctResult: question.result,
      userAnswer: answer,
      isCorrect,
      score,
      timeUsed,
    };

    // En modo countdown, si falla termina la partida
    if (mode === 'countdown' && !isCorrect) {
      setTimeout(() => finishGame([...answersRef.current, answerRecord]), 1400);
      return;
    }

    setTimeout(() => proceedToNext(answerRecord), 1400);
  }, [isAnswering, mode, question, timePerQuestion]);

  // Avanza a la siguiente pregunta o termina el juego
  const proceedToNext = useCallback((answerRecord) => {
    const updatedAnswers = [...answersRef.current, answerRecord];
    answersRef.current = updatedAnswers;
    setAnswers(updatedAnswers);

    const nextRound = currentRound + 1;

    if (mode !== 'countdown' && nextRound >= totalRounds) {
      finishGame(updatedAnswers);
    } else {
      setCurrentRound(nextRound);
      startNewQuestion();
    }
  }, [currentRound, totalRounds, mode, startNewQuestion]);

  // Termina la partida y guarda el resultado
  const finishGame = useCallback(async (finalAnswers) => {
    clearInterval(timerRef.current);
    const correct = finalAnswers.filter(a => a.isCorrect === true).length;
    const wrong = finalAnswers.filter(a => a.isCorrect === false).length;
    const timeouts = finalAnswers.filter(a => a.isCorrect === null).length;
    const score = finalAnswers.reduce((s, a) => s + a.score, 0);

    await saveGameResult({
      mode,
      difficulty,
      rounds: finalAnswers.length,
      correct,
      wrong,
      timeouts,
      totalScore: score,
    });

    router.replace({
      pathname: '/results',
      params: {
        correct,
        wrong,
        timeouts,
        totalScore: score,
        total: finalAnswers.length,
        mode,
        difficulty,
      },
    });
  }, [mode, difficulty, router]);

  if (!question) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Color del timer según el tiempo restante
  const timerRatio = timeLeft / timePerQuestion;
  const timerColor = timerRatio > 0.5 ? '#4ecca3' : timerRatio > 0.25 ? '#f5a623' : '#e94560';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Cabecera: ronda, puntaje y botón salir */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitBtn} onPress={() => router.replace('/')}>
          <Text style={styles.exitText}>✕ Salir</Text>
        </TouchableOpacity>
        <Text style={styles.roundText}>
          {mode === 'countdown' ? `Pregunta ${currentRound + 1}` : `${currentRound + 1} / ${totalRounds}`}
        </Text>
        <Text style={styles.scoreText}>🏆 {totalScore} pts</Text>
      </View>

      {/* Timer: solo se muestra si NO es modo countdown */}
      {!isCountdown && (
        <View style={styles.timerContainer}>
          <Text style={[styles.timerNumber, { color: timerColor }]}>{timeLeft}s</Text>
          <View style={styles.timerBarBg}>
            <View
              style={[
                styles.timerBarFill,
                {
                  width: `${(timeLeft / timePerQuestion) * 100}%`,
                  backgroundColor: timerColor,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* En modo countdown mostramos racha en vez de timer */}
      {isCountdown && (
        <View style={styles.streakContainer}>
          <Text style={styles.streakText}>🔥 Racha: {currentRound} correctas seguidas</Text>
        </View>
      )}

      {/* Feedback (correcto / incorrecto / timeout) */}
      {feedback && (
        <View style={[
          styles.feedbackBanner,
          feedback === 'correct' ? styles.feedbackCorrect
          : feedback === 'timeout' ? styles.feedbackTimeout
          : styles.feedbackWrong,
        ]}>
          <Text style={styles.feedbackText}>
            {feedback === 'correct' ? '✅  ¡Correcto!'
            : feedback === 'timeout' ? '⏰  ¡Tiempo!'
            : '❌  Incorrecto'}
          </Text>
          {feedback !== 'correct' && question && (
            <Text style={styles.feedbackCorrectAnswer}>
              La respuesta era: {question.result}
            </Text>
          )}
        </View>
      )}

      {/* Tarjeta de la pregunta - con animación de escala y shake */}
      <Animated.View style={{
        transform: [{ scale: scaleAnim }, { translateX: shakeAnim }]
      }}>
      <View style={styles.questionCard}>
        {mode === 'truefalse' ? (
          <>
            <Text style={styles.expression}>
              {question.expression} = {question.displayResult}
            </Text>
            <Text style={styles.questionHint}>¿Es correcto?</Text>
          </>
        ) : (
          <Text style={styles.expression}>{question.expression} = ?</Text>
        )}
      </View>
      </Animated.View>

      {/* Área de respuesta según el modo */}

      {/* MODO CLÁSICO y CONTRA RELOJ: campo de texto */}
      {(mode === 'classic' || mode === 'countdown') && (
        <View style={styles.inputArea}>
          <TextInput
            style={styles.textInput}
            value={textInput}
            onChangeText={setTextInput}
            keyboardType="numeric"
            placeholder="Tu respuesta..."
            placeholderTextColor="#555"
            editable={isAnswering}
            autoFocus
            onSubmitEditing={() => handleAnswer(textInput)}
          />
          <TouchableOpacity
            style={[styles.confirmBtn, !isAnswering && styles.btnDisabled]}
            onPress={() => handleAnswer(textInput)}
            disabled={!isAnswering}
          >
            <Text style={styles.confirmBtnText}>Confirmar ✓</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODO VERDADERO / FALSO */}
      {mode === 'truefalse' && (
        <View style={styles.tfArea}>
          <TouchableOpacity
            style={[styles.tfBtn, styles.trueBtn, !isAnswering && styles.btnDisabled]}
            onPress={() => handleAnswer(true)}
            disabled={!isAnswering}
          >
            <Text style={styles.tfText}>✓  VERDADERO</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tfBtn, styles.falseBtn, !isAnswering && styles.btnDisabled]}
            onPress={() => handleAnswer(false)}
            disabled={!isAnswering}
          >
            <Text style={styles.tfText}>✗  FALSO</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODO MÚLTIPLE CHOICE */}
      {mode === 'multiplechoice' && (
        <View style={styles.optionsGrid}>
          {question.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.optionBtn, !isAnswering && styles.btnDisabled]}
              onPress={() => handleAnswer(opt)}
              disabled={!isAnswering}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  loadingText: { color: '#fff', textAlign: 'center', marginTop: 40 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  exitBtn: {
    backgroundColor: '#2a1a2e',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  exitText: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: 'bold',
  },
  roundText: { color: '#888', fontSize: 16 },
  scoreText: { color: '#4ecca3', fontSize: 16, fontWeight: 'bold' },

  timerContainer: { marginBottom: 20 },
  streakContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f5a623',
  },
  streakText: {
    color: '#f5a623',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerNumber: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  timerBarBg: {
    height: 8,
    backgroundColor: '#1e1e2e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  feedbackBanner: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  feedbackCorrect: { backgroundColor: '#0d3b24' },
  feedbackWrong: { backgroundColor: '#3b0d0d' },
  feedbackTimeout: { backgroundColor: '#3b2a0d' },
  feedbackText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  feedbackCorrectAnswer: { color: '#aaa', fontSize: 13, marginTop: 4 },

  questionCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2a3a5e',
  },
  expression: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  questionHint: { color: '#888', fontSize: 14, marginTop: 10 },

  // Clásico / Countdown
  inputArea: { gap: 12 },
  textInput: {
    backgroundColor: '#16213e',
    color: '#fff',
    fontSize: 28,
    borderRadius: 14,
    padding: 16,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#2a3a5e',
  },
  confirmBtn: {
    backgroundColor: '#e94560',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Verdadero / Falso
  tfArea: { gap: 14 },
  tfBtn: {
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: 'center',
  },
  trueBtn: { backgroundColor: '#0d4a2a' },
  falseBtn: { backgroundColor: '#4a0d0d' },
  tfText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  // Múltiple choice
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#16213e',
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a3a5e',
  },
  optionText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },

  btnDisabled: { opacity: 0.4 },
});
