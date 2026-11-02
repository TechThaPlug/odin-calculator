const display = document.querySelector("#display");
const decimalButton = document.querySelector("#decimal");

let firstNumber = null;
let operator = null;
let currentInput = "0";
let waitingForSecond = false;
let showingResult = false;

// 1. The four math functions
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

// 2. operate: picks the right function
function operate(op, a, b) {
  switch (op) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return divide(a, b);
  }
}

// 3. Display and reset helpers
function updateDisplay() {
  display.textContent = currentInput;
  decimalButton.disabled =
    !showingResult && !waitingForSecond && currentInput.includes(".");
}

function resetState() {
  firstNumber = null;
  operator = null;
  currentInput = "0";
  waitingForSecond = false;
  showingResult = false;
}

function clearAll() {
  resetState();
  updateDisplay();
}

function showError(message) {
  resetState();
  showingResult = true;
  updateDisplay();
  display.textContent = message;
}

// 4. The calculation (with rounding and divide-by-zero protection)
function calculate(a, op, b) {
  if (op === "/" && b === 0) {
    showError("Nice try! No dividing by zero.");
    return null;
  }

  const result = operate(op, a, b);
  return parseFloat(result.toFixed(8));
}

// 5. Button actions
function inputDigit(digit) {
  if (showingResult || waitingForSecond) {
    currentInput = digit;
    showingResult = false;
    waitingForSecond = false;
  } else {
    currentInput = currentInput === "0" ? digit : currentInput + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (showingResult || waitingForSecond) {
    currentInput = "0.";
    showingResult = false;
    waitingForSecond = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }
  updateDisplay();
}

function chooseOperator(nextOperator) {
  // Two operators in a row: just swap the operator, do not calculate
  if (operator !== null && waitingForSecond) {
    operator = nextOperator;
    return;
  }

  const inputValue = parseFloat(currentInput);

  if (firstNumber === null) {
    firstNumber = inputValue;
  } else if (operator !== null) {
    const result = calculate(firstNumber, operator, inputValue);
    if (result === null) {
      return;
    }
    firstNumber = result;
    currentInput = String(result);
    updateDisplay();
  }

  operator = nextOperator;
  waitingForSecond = true;
  showingResult = false;
}

function evaluate() {
  // Ignore "=" until we have a number, an operator, and a second number
  if (operator === null || waitingForSecond) {
    return;
  }

  const result = calculate(firstNumber, operator, parseFloat(currentInput));
  if (result === null) {
    return;
  }

  currentInput = String(result);
  firstNumber = null;
  operator = null;
  showingResult = true;
  updateDisplay();
}

function backspace() {
  if (showingResult || waitingForSecond) {
    return;
  }

  let next = currentInput.slice(0, -1);
  if (next === "" || next === "-") {
    next = "0";
  }
  currentInput = next;
  updateDisplay();
}

// 6. Connect the buttons
document.querySelectorAll("[data-digit]").forEach((button) => {
  button.addEventListener("click", () => inputDigit(button.dataset.digit));
});

document.querySelectorAll("[data-operator]").forEach((button) => {
  button.addEventListener("click", () => chooseOperator(button.dataset.operator));
});

document.querySelector("#equals").addEventListener("click", evaluate);
document.querySelector("#clear").addEventListener("click", clearAll);
document.querySelector("#backspace").addEventListener("click", backspace);
decimalButton.addEventListener("click", inputDecimal);

// 7. Keyboard support
document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) {
    inputDigit(event.key);
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    chooseOperator(event.key);
  } else if (event.key === ".") {
    inputDecimal();
  } else if (event.key === "=" || event.key === "Enter") {
    event.preventDefault();
    evaluate();
  } else if (event.key === "Backspace") {
    backspace();
  } else if (event.key === "Escape") {
    clearAll();
  }
});

updateDisplay();