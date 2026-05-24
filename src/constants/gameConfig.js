// Configuración de dificultades
export const DIFFICULTY = {
  easy: {
    label: 'Fácil',
    timePerQuestion: 10, // segundos por pregunta
    operations: ['+', '-'],
    maxNumber: 10,
    minNumber: 1,
  },
  medium: {
    label: 'Medio',
    timePerQuestion: 7,
    operations: ['+', '-', '*'],
    maxNumber: 20,
    minNumber: 1,
  },
  hard: {
    label: 'Difícil',
    timePerQuestion: 5,
    operations: ['+', '-', '*', '/'],
    maxNumber: 50,
    minNumber: 1,
  },
};

// Modos de juego disponibles
export const GAME_MODES = {
  classic: {
    label: 'Clásico',
    description: 'Ingresá el resultado de la operación',
    icon: '✏️',
  },
  truefalse: {
    label: 'Verdadero/Falso',
    description: '¿El resultado mostrado es correcto?',
    icon: '✓✗',
  },
  multiplechoice: {
    label: 'Múltiple Choice',
    description: 'Elegí la respuesta correcta entre 4 opciones',
    icon: '🔢',
  },
  countdown: {
    label: 'Contra Reloj',
    description: 'Respondé sin parar. Termina cuando errás una',
    icon: '🔥',
  },
};

// Sistema de puntaje
export const SCORE_RULES = {
  fastCorrect: 100,  // respondió en menos del 75% del tiempo
  normalCorrect: 70, // respondió en el tiempo restante
  wrong: -30,        // respuesta incorrecta
  timeout: -50,      // se acabó el tiempo sin responder
};

// Opciones de cantidad de rondas
export const ROUND_OPTIONS = [5, 10, 15, 20];
