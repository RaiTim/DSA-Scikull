// Floating math background for the calculator.
// Creates a layer of drifting symbols/formulas behind the calculator.

(function () {
    const SNIPPETS = [
        "π", "∞", "√x", "∛x", "x²", "x³", "eⁱᵖ = −1", "e^(iπ) + 1 = 0",
        "∑", "∫", "∂", "∇", "Δ", "θ", "λ", "φ", "σ", "μ", "≈", "≠", "≤", "≥",
        "sin(x)", "cos(x)", "tan(θ)", "log(x)", "ln(x)", "f(x)", "f′(x)",
        "n!", "a² + b² = c²", "E = mc²", "∫ x dx", "lim x→∞", "dy/dx",
        "⌈x⌉", "⌊x⌋", "%", "÷", "×", "±", "7", "42", "3.14159", "1.618", "2.718"
    ];

    // Blues that match the calculator theme
    const COLORS = [
        "70, 110, 185",
        "100, 140, 210",
        "120, 165, 220",
        "60, 95, 160",
        "150, 180, 230"
    ];

    const COUNT = 30;

    const rand = (min, max) => Math.random() * (max - min) + min;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Give an element a fresh random look and path
    function randomize(el, firstRun) {
        const depth = Math.random(); // 0 = far away, 1 = close
        const size = 16 + depth * 56;

        el.textContent = pick(SNIPPETS);
        el.style.setProperty("--x", rand(-2, 98).toFixed(1) + "%");
        el.style.setProperty("--y", rand(5, 95).toFixed(1) + "%"); // used for reduced motion
        el.style.setProperty("--size", size.toFixed(0) + "px");
        el.style.setProperty("--blur", (depth < 0.3 ? rand(1.5, 3) : 0).toFixed(1) + "px");
        el.style.setProperty("--alpha", (0.12 + depth * 0.25).toFixed(2));
        el.style.setProperty("--color", "rgb(" + pick(COLORS) + ")");
        el.style.setProperty("--drift", rand(-120, 120).toFixed(0) + "px");
        el.style.setProperty("--rot-a", rand(-25, 0).toFixed(0) + "deg");
        el.style.setProperty("--rot-b", rand(0, 25).toFixed(0) + "deg");
        // Far-away symbols move slower, close ones faster (parallax feel)
        el.style.setProperty("--dur", (32 - depth * 16 + rand(-3, 3)).toFixed(1) + "s");

        // Negative delay on the first run so the screen isn't empty at load
        if (firstRun) {
            el.style.setProperty("--delay", "-" + rand(0, 30).toFixed(1) + "s");
        }
    }

    function init() {
        const layer = document.createElement("div");
        layer.className = "math-bg";
        layer.setAttribute("aria-hidden", "true");

        for (let i = 0; i < COUNT; i++) {
            const el = document.createElement("span");
            el.className = "math-item";
            randomize(el, true);
            // After each loop, give it a new symbol, size and position
            el.addEventListener("animationiteration", () => randomize(el, false));
            layer.appendChild(el);
        }

        document.body.prepend(layer);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
