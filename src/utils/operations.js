import { DIFFICULTY } from '../constants/gameConfig';

// Genera un número entero aleatorio entre min y max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Genera una operación matemática según la dificultad
export function generateOperation(difficulty) {
  const config = DIFFICULTY[difficulty];
  const op = config.operations[Math.floor(Math.random() * config.operations.length)];

  let a, b, result;

  if (op === '/') {
    // Para división, generamos un resultado limpio (sin decimales)
    result = randomInt(1, 10);
    b = randomInt(1, 10);
    a = result * b;
  } else {
    a = randomInt(config.minNumber, config.maxNumber);
    b = randomInt(config.minNumber, config.maxNumber);

    // Para resta, evitamos resultados negativos
    if (op === '-' && b > a) {
      [a, b] = [b, a];
    }

    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
    }
  }

  return {
    a,
    b,
    op,
    result,
    expression: `${a} ${op} ${b}`,
  };
}

// Genera respuestas incorrectas para el modo múltiple choice
export function generateWrongAnswers(correctResult, count = 3) {
  const wrongs = new Set();
  let attempts = 0;

  while (wrongs.size < count && attempts < 50) {
    attempts++;
    const offset = randomInt(1, 15) * (Math.random() > 0.5 ? 1 : -1);
    const wrong = correctResult + offset;
    if (wrong !== correctResult && wrong >= 0) {
      wrongs.add(wrong);
    }
  }

  return [...wrongs];
}

// Genera una pregunta de Verdadero/Falso
export function generateTrueFalseQuestion(difficulty) {
  const op = generateOperation(difficulty);
  const showWrong = Math.random() > 0.5;

  if (showWrong) {
    const [wrongAnswer] = generateWrongAnswers(op.result, 1);
    return {
      ...op,
      displayResult: wrongAnswer,
      isTrue: false,
    };
  }

  return {
    ...op,
    displayResult: op.result,
    isTrue: true,
  };
}

// Genera una pregunta de Múltiple Choice con 4 opciones
export function generateMultipleChoice(difficulty) {
  const op = generateOperation(difficulty);
  const wrongs = generateWrongAnswers(op.result, 3);

  // Mezclamos la respuesta correcta con las incorrectas
  const options = [...wrongs, op.result].sort(() => Math.random() - 0.5);

  return { ...op, options };
}
