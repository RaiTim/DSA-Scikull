// MATH RULES

const originalMod = math.mod; // Save the original mod function from math.js before overriding it

math.import({  //Change it so dividing by zero gives 0 instead of crashing or showing an error.
    mod: function (x, y) {
        if (y === 0) return 0;
        return originalMod(x, y);
    }
}, { override: true });

// SETUP MEMORY AND BUTTON NAMES

let raw = [];
let display = [];
let isOutputState = false; 


const operationLabels = {
    "AC": "Clear All",
    "C": "Clear All",
    "Del": "Delete Last Character",
    "←": "Delete Last Character",
    "%": "Modulo / Percentage",
    "-": "Subtraction",
    "+": "Addition",
    "÷": "Division",
    "×": "Multiplication",
    "√x": "Square Root",
    "√": "Square Root",
    "∛x": "Cube Root",
    "∛": "Cube Root",
    "x²": "Square (Power of 2)",
    "xʸ": "Exponentiation (Power of Y)",
    "⌈x⌉": "Ceiling Function (Round Up)",
    "⌊x⌋": "Floor Function (Round Down)",
    ",": "Value Separator",
    "Max": "Maximum of Values",
    "Min": "Minimum of Values",
    "R": "Round to Nearest Integer",
    "AV": "Absolute Value",
    "O": "Exit",
    "=": "Evaluate",
    "(": "Open Parenthesis",
    ")": "Close Parenthesis",
    ".": "Decimal Point"
};

// PAGE LOADS

document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-btn");
    const startScreen = document.getElementById("start-screen");
    const calcScreen = document.getElementById("calculator-screen");

    if (startButton) {  // When click the start button, hide the welcome screen and show the calculator
        startButton.addEventListener("click", () => {
            startScreen.classList.add("hidden");
            calcScreen.classList.remove("hidden");
        });
    }

    // Give every button a helpful tooltip name
    const buttons = document.querySelectorAll("button");  // Automatically add tooltips to all calculator buttons
    buttons.forEach((btn) => {
        const val = btn.value || btn.innerText || btn.textContent.trim();
        if (operationLabels[val]) {
            btn.title = operationLabels[val];
        } else if (!isNaN(val)) {
            btn.title = `Digit ${val}`;
        }
    });
});

function isOperator(char) {  // Check if a character is a math sign (+, -, *, /, %)
    return ["+", "-", "*", "/", "%"].includes(char);
}

function isSymbolOrFunction(token) {  // Check if a piece of text is a symbol or special math function
    if (!token) return false;
    return isOperator(token) || ["^", "^2", "sqrt(", "cbrt(", ",", "."].includes(token);
}

function cleanupLastToken() {  // Remove the last symbol if it doesn't belong, to prevent math errors
    if (raw.length > 0 && isSymbolOrFunction(raw[raw.length - 1])) {
        raw.pop();
        display.pop();
    }
}

// BUTTONS CLICKS 

function getNumber(event) {
    let isInvalid = false;
    const target = event.target;
    const num = target.value || target.innerText || target.textContent;

    if ("0123456789()".includes(num)) {
        if (isOutputState) {
            clear();  // Start fresh if we are showing an old answer
        }
        pushAdd(num, num);
    }

    const lastRaw = raw.length > 0 ? raw[raw.length - 1] : "";

    switch (num) {  // Handle all other buttons
        case ".":
            if (isOutputState) clear();
            const currentSegment = raw.join("").split(/[+\-*\/%^,()]/).pop();
            if (!currentSegment.includes(".")) {
                if (raw.length === 0 || isSymbolOrFunction(lastRaw)) {
                    pushAdd("0.", "0.");  // Add a zero before the dot if it's first
                } else {
                    pushAdd(".", ".");
                }
            }
            isOutputState = false;
            break;

        case ",":
            if (isOutputState) clear();
            if (lastRaw !== ",") {
                if (isOperator(lastRaw)) {
                    raw.pop();
                    display.pop();
                }
                pushAdd(",", ",");
            }
            isOutputState = false;
            break;

        case "+":
            if (isOutputState) isOutputState = false;
            cleanupLastToken();
            pushAdd("+", "+");
            break;

        case "-":
            if (isOutputState) isOutputState = false;
            if (lastRaw !== "sqrt(" && lastRaw !== "cbrt(") {
                cleanupLastToken();
            }
            pushAdd("-", "-");
            break;

        case "AC":
        case "C":
            clear();
            break;

        case "Del":
        case "←":
            if (raw.length > 0 && display.length > 0) {
                raw.pop();
                display.pop();
                isOutputState = false;
            }
            break;

        case "÷":
            if (isOperator(lastRaw)) {
                raw.pop();
                display.pop();
            }
            pushAdd("/", "÷");
            isOutputState = false;
            break;

        case "×":
            if (isOperator(lastRaw)) {
                raw.pop();
                display.pop();
            }
            pushAdd("*", "×");
            isOutputState = false;
            break;

        case "√x":
        case "√":
            if (lastRaw === "sqrt(" || lastRaw === "cbrt(") return;
            cleanupLastToken();
            pushAdd("sqrt(", "√");
            isOutputState = false;
            break;

        case "∛x":
        case "∛":
            if (lastRaw === "cbrt(" || lastRaw === "sqrt(") return;
            cleanupLastToken();
            pushAdd("cbrt(", "∛");
            isOutputState = false;
            break;

        case "x²":
            if (lastRaw === "^2" || lastRaw === "^") return;
            if (isOperator(lastRaw)) {
                raw.pop();
                display.pop();
            }
            pushAdd("^2", "²");
            isOutputState = false;
            break;

        case "xʸ":
        case "pow":
        case "^":
            if (lastRaw === "^" || lastRaw === "^2") return;
            if (isOperator(lastRaw)) {
                raw.pop();
                display.pop();
            }
            pushAdd("^", "^");
            isOutputState = false;
            break;

        case "⌈x⌉":
            ceilOrFloor("⌈x⌉");
            break;

        case "⌊x⌋":
            ceilOrFloor("⌊x⌋");
            break;

        case ",":
            if (lastRaw === "," || isOperator(lastRaw)) {
                if (isOperator(lastRaw)) {
                    raw.pop();
                    display.pop();
                } else {
                    return;
                }
            }
            pushAdd(",", ",");
            isOutputState = false;
            break;

        case "Max":
            maxOrMin("Max");
            break;

        case "Min":
            maxOrMin("Min");
            break;

        case "R":
            round();
            break;

        case "AV":
            absVal();
            break;

        case "O":  // Goes back to start screen
            clear();
            document.getElementById("calculator-screen").classList.add("hidden");
            document.getElementById("start-screen").classList.remove("hidden");
            return;

        case "=":  // math calculation
            let newNum = mathFunctionChecker();
            if (newNum !== null && (hasOperation() || isOutputState)) {
                clear();
                pushAdd(newNum, newNum);
                isOutputState = true;
            } else {
                isInvalid = true;
            }
            break;

        case "%":
            cleanupLastToken();
            pushAdd("%", "%");
            isOutputState = false;
            break;
    }

    if (!hasOperation() && raw.length > 0 && !isOutputState) {
        isInvalid = true;
    }

    let calculatedVal = isInvalid ? "-" : calculate();
    if (calculatedVal === null || calculatedVal === undefined) {
        calculatedVal = "-";
    }

    displayAll(calculatedVal, display.join("") || "0");
}

// MATH AND UPDATING THE SCREEN

function hasOperation() { // Check if there is an active math operation
    const rawStr = raw.join("");
    return /[+\-*\/%^,]/.test(rawStr) || rawStr.includes("sqrt") || rawStr.includes("cbrt");
}

function displayAll(upper, lower) { // Show text on the calculator screen
    const myInput = document.getElementById("myInput");
    const output = document.getElementById("output");

    if (myInput) myInput.textContent = lower;
    if (output) output.textContent = upper;
}

function calculate() {
    try {
        if (raw.length === 0) return "-";
        let expr = raw.join("");
        let res = math.evaluate(expr);
        return (res !== undefined && !Number.isNaN(res)) ? res : "-";
    } catch (err) {
        return "-";
    }
}

function clear() {  // Reset everything back to zero
    raw = [];
    display = [];
    isOutputState = false;
    const myInput = document.getElementById("myInput");
    const output = document.getElementById("output");
    if (myInput) myInput.textContent = "0";
    if (output) output.textContent = "-";
}

function pushAdd(r, d) { // Add items to both memory arrays at the same time
    raw.push(r);
    display.push(d);
}

function mathFunctionChecker() {  // Make sure the math result is a real number
    let cal = calculate();
    if (cal !== "-" && cal !== null && !Number.isNaN(cal)) return cal;
    return null;
}

// ADVANCED MATH BUTTONS

function ceilOrFloor(num) {
    let cal = mathFunctionChecker();
    if (cal !== null) {
        let converted = (num === "⌈x⌉") ? Math.ceil(cal) : Math.floor(cal);
        clear();
        pushAdd(converted, converted);
        isOutputState = true;
    }
}

function maxOrMin(func) {  // Find the biggest or smallest number in a list
    try {
        let rawStr = raw.join("");
        let values = rawStr.split(",").map(val => math.evaluate(val));

        if (values.length >= 2 && values.every(v => typeof v === "number" && !isNaN(v))) {
            let newVal = (func === "Max") ? Math.max(...values) : Math.min(...values);
            clear();
            pushAdd(newVal, newVal);
            isOutputState = true;
        }
    } catch (err) {
        console.log("Max or Min evaluation failed.");
    }
}

function round() {  // Round to the closest whole number
    let cal = mathFunctionChecker();
    if (cal !== null) {
        let r = Math.round(cal);
        clear();
        pushAdd(r, r);
        isOutputState = true;
    }
}

function absVal() {  // Turn negative numbers into positive numbers
    let newNum = mathFunctionChecker();
    if (newNum !== null) {
        let absRes = Math.abs(newNum);
        clear();
        pushAdd(absRes, absRes);
        isOutputState = true;
    }
}

function isMathNegative() {  // Check if the final answer is a negative number
    try {
        if (raw.length === 0) return false;
        const val = math.evaluate(raw.join(""));
        if (typeof val !== "number") return true;
        return Number.isNaN(val) || val < 0;
    } catch {
        return true;
    }
}

