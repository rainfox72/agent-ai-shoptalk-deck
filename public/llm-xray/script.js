/**
 * LLM X-Ray — Interactive Transformer Visualization
 *
 * Simulates how an LLM processes a prompt and generates text.
 * Uses pre-canned examples with autoregressive token generation.
 * No real LLM — deterministic simulation for educational demos.
 */
(function () {
    "use strict";

    // ── Configuration ────────────────────────────────────────
    var CONFIG = {
        mode: "xray",
        MAX_OUTPUT_TOKENS: 20,
        LAYER_COUNT: 6,
        SUB_BLOCK_COUNT: 4,
        ATTENTION_SIZE: 6,
        TOP_K: 5,
        SEED_BASE: 42,

        TIMING: {
            TOKEN_STAGGER:      60,
            TOKEN_PHASE_WAIT:   300,
            SUB_BLOCK_SWEEP:    300,
            SUB_BLOCK_STAGGER:  100,
            LAYER_GAP:          50,
            LAYER_PHASE_WAIT:   200,
            ATTENTION_WAIT:     600,
            PROB_WAIT:          800,
            OUTPUT_CHAR_DELAY:  40,
            CYCLE_PAUSE:        300,
            FLOW_DOT_DURATION:  600,
            PULSE_DURATION:     300,
            QUICK_SUB_STAGGER:  40,
            QUICK_SWEEP:        150,
            QUICK_LAYER_GAP:    20,
            QUICK_PHASE_WAIT:   100
        }
    };

    // ── Pre-canned Examples ──────────────────────────────────
    var EXAMPLES = [
        {
            prompt: "What is intelligent transportation system?",
            response: ["An", "intelligent", "transportation", "system", "uses", "sensors", "data", "and", "communication", "technology", "to", "improve", "the", "safety", "and", "efficiency", "of", "road", "networks", "."]
        },
        {
            prompt: "Explain what a black hole is.",
            response: ["A", "black", "hole", "is", "a", "region", "in", "space", "where", "gravity", "is", "so", "strong", "that", "nothing", "can", "escape", "not", "even", "light"]
        },
        {
            prompt: "What is machine learning?",
            response: ["Machine", "learning", "is", "a", "type", "of", "artificial", "intelligence", "that", "enables", "systems", "to", "learn", "from", "data", "and", "make", "predictions", "or", "decisions"]
        },
        {
            prompt: "Why is the sky blue?",
            response: ["The", "sky", "appears", "blue", "because", "sunlight", "is", "scattered", "by", "molecules", "in", "the", "atmosphere", "and", "blue", "light", "scatters", "more", "than", "red"]
        }
    ];

    // Filler words for generating alternative probability candidates
    var FILLER_WORDS = [
        "the", "a", "is", "an", "of", "to", "in", "and", "that", "it",
        "for", "was", "on", "are", "with", "as", "at", "be", "this", "from",
        "or", "by", "not", "but", "what", "all", "were", "when", "we", "can",
        "there", "which", "their", "has", "had", "have", "each", "will",
        "very", "much", "also", "some", "about", "into", "most", "its",
        "then", "like", "more", "other", "could", "been", "now", "than",
        "these", "only", "new", "just", "may", "such", "many", "where",
        "through", "between", "over", "after", "under", "how", "they"
    ];

    // ── DOM References ───────────────────────────────────────
    var DOM = {
        promptSelect:    document.getElementById("prompt-select"),
        btnAuto:         document.getElementById("btn-auto"),
        btnNext:         document.getElementById("btn-next"),
        stepBadge:       document.getElementById("step-badge"),
        tokenContainer:  document.getElementById("token-container"),
        tokenCountBadge: document.getElementById("token-count-badge"),
        layerContainer:  document.getElementById("layer-container"),
        attentionGrid:   document.getElementById("attention-grid"),
        attnLabelsTop:   document.getElementById("attn-labels-top"),
        attnLabelsSide:  document.getElementById("attn-labels-side"),
        probContainer:   document.getElementById("prob-container"),
        outputText:      document.getElementById("output-text"),
        outputCursor:    document.getElementById("output-cursor"),
        outputStepBadge: document.getElementById("output-step-badge")
    };
    DOM.btnAutoText = DOM.btnAuto.querySelector(".btn-text");
    DOM.btnNextText = DOM.btnNext.querySelector(".btn-text");

    // ── State ────────────────────────────────────────────────
    var TOTAL_STEPS = 1 + CONFIG.MAX_OUTPUT_TOKENS * 3;

    var STATE = {
        isRunning: false,
        promptTokens: [],
        generatedTokens: [],
        currentStep: 0,
        rng: null,
        mode: null,       // "auto" or "next"
        exampleIndex: 0,
        pendingToken: null
    };

    // ── Seeded PRNG (mulberry32) ─────────────────────────────

    function createRNG(seed) {
        var s = seed | 0;
        return function () {
            s = (s + 0x6D2B79F5) | 0;
            var t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function hashString(str) {
        var hash = 5381;
        for (var i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
        }
        return hash;
    }

    // ── Tokenization ─────────────────────────────────────────

    function tokenizePrompt(text) {
        var raw = text.trim();
        if (!raw) return [];
        return raw.match(/[a-zA-Z0-9]+(?:'[a-zA-Z]+)?|[^\s]/g) || [];
    }

    // ── Simulation Functions ─────────────────────────────────

    function simulateAttention(rng) {
        var size = CONFIG.ATTENTION_SIZE;
        var matrix = [];
        var anchor = Math.floor(rng() * size);

        for (var row = 0; row < size; row++) {
            var rowData = [];
            for (var col = 0; col < size; col++) {
                var val = rng() * 0.3;
                if (row === col) val += 0.3 + rng() * 0.3;
                var dist = Math.abs(row - col);
                if (dist === 1) val += 0.15 + rng() * 0.15;
                if (col === anchor) val += 0.2 + rng() * 0.2;
                rowData.push(Math.min(1.0, Math.max(0.0, val)));
            }
            var rowSum = rowData.reduce(function (a, b) { return a + b; }, 0);
            if (rowSum > 0) {
                rowData = rowData.map(function (v) { return v / rowSum; });
            }
            matrix.push(rowData);
        }
        return matrix;
    }

    function generateNextToken(rng, correctToken) {
        // Build candidates: correct token + 4 unique fillers
        var candidates = [{ token: correctToken, prob: 0 }];
        var usedWords = new Set();
        usedWords.add(correctToken.toLowerCase());

        var attempts = 0;
        while (candidates.length < CONFIG.TOP_K && attempts < 50) {
            var idx = Math.floor(rng() * FILLER_WORDS.length);
            var word = FILLER_WORDS[idx];
            if (!usedWords.has(word)) {
                usedWords.add(word);
                candidates.push({ token: word, prob: 0 });
            }
            attempts++;
        }

        // Assign raw scores: correct token gets high score, fillers get lower
        var rawScores = candidates.map(function (c, i) {
            if (i === 0) return 2.5 + rng() * 1.5; // correct: 2.5-4.0
            return 0.3 + rng() * 1.2;               // fillers: 0.3-1.5
        });

        // Softmax with temperature 0.8
        var temperature = 0.8;
        var maxScore = Math.max.apply(null, rawScores);
        var expScores = rawScores.map(function (s) {
            return Math.exp((s - maxScore) / temperature);
        });
        var sumExp = expScores.reduce(function (a, b) { return a + b; }, 0);

        candidates.forEach(function (c, i) {
            c.prob = expScores[i] / sumExp;
        });

        // Sort descending by probability
        candidates.sort(function (a, b) { return b.prob - a.prob; });

        // Find chosen index (the correct token after sorting)
        var chosenIndex = 0;
        for (var i = 0; i < candidates.length; i++) {
            if (candidates[i].token === correctToken) {
                chosenIndex = i;
                break;
            }
        }

        return { candidates: candidates, chosenIndex: chosenIndex };
    }

    function getAttentionLabels(promptTokens, generatedTokens) {
        var all = promptTokens.concat(generatedTokens);
        var labels = [];
        var start = Math.max(0, all.length - CONFIG.ATTENTION_SIZE);
        for (var i = start; i < all.length; i++) {
            labels.push(all[i].substring(0, 6));
        }
        while (labels.length < CONFIG.ATTENTION_SIZE) {
            labels.unshift("...");
        }
        return labels;
    }

    // ── Color Utilities ──────────────────────────────────────

    var HEAT_STOPS = [
        { at: 0.0,  r: 0x11, g: 0x14, b: 0x25 },
        { at: 0.15, r: 0x1a, g: 0x1f, b: 0x4a },
        { at: 0.3,  r: 0x2d, g: 0x2b, b: 0x7c },
        { at: 0.5,  r: 0x6d, g: 0x3f, b: 0xba },
        { at: 0.7,  r: 0xa8, g: 0x55, b: 0xf7 },
        { at: 0.85, r: 0xe8, g: 0x79, b: 0xf9 },
        { at: 1.0,  r: 0xf0, g: 0xab, b: 0xfc }
    ];

    function heatColor(value) {
        var v = Math.max(0, Math.min(1, value));
        var lower = HEAT_STOPS[0];
        var upper = HEAT_STOPS[HEAT_STOPS.length - 1];
        for (var i = 0; i < HEAT_STOPS.length - 1; i++) {
            if (v >= HEAT_STOPS[i].at && v <= HEAT_STOPS[i + 1].at) {
                lower = HEAT_STOPS[i];
                upper = HEAT_STOPS[i + 1];
                break;
            }
        }
        var range = upper.at - lower.at;
        var t = range > 0 ? (v - lower.at) / range : 0;
        var r = Math.round(lower.r + (upper.r - lower.r) * t);
        var g = Math.round(lower.g + (upper.g - lower.g) * t);
        var b = Math.round(lower.b + (upper.b - lower.b) * t);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    // ── DOM Utilities ────────────────────────────────────────

    function clearChildren(el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }

    // ── Rendering Functions ──────────────────────────────────

    function renderTokens(tokens) {
        clearChildren(DOM.tokenContainer);
        tokens.forEach(function (t, i) {
            var span = document.createElement("span");
            span.className = "token-box";
            span.textContent = t;
            span.style.animationDelay = (i * CONFIG.TIMING.TOKEN_STAGGER) + "ms";
            DOM.tokenContainer.appendChild(span);
        });
        DOM.tokenCountBadge.textContent = tokens.length + " tokens";
    }

    function appendToken(word) {
        var span = document.createElement("span");
        span.className = "token-box generated";
        span.textContent = word;
        DOM.tokenContainer.appendChild(span);
        var totalTokens = STATE.promptTokens.length + STATE.generatedTokens.length;
        DOM.tokenCountBadge.textContent = totalTokens + " tokens";
    }

    function animateLayers() {
        return new Promise(function (resolve) {
            var rows = DOM.layerContainer.querySelectorAll(".layer-row");
            var globalDelay = 0;

            rows.forEach(function (row, layerIdx) {
                var subBlocks = row.querySelectorAll(".layer-sub-block");
                subBlocks.forEach(function (block, subIdx) {
                    var thisDelay = globalDelay + subIdx * CONFIG.TIMING.SUB_BLOCK_STAGGER;
                    setTimeout(function () {
                        var fill = block.querySelector(".layer-sub-fill");
                        fill.classList.add("active");
                        setTimeout(function () {
                            block.classList.add("completed");
                        }, CONFIG.TIMING.SUB_BLOCK_SWEEP);
                    }, thisDelay);
                });
                globalDelay += CONFIG.SUB_BLOCK_COUNT * CONFIG.TIMING.SUB_BLOCK_STAGGER
                             + CONFIG.TIMING.LAYER_GAP;
            });

            var totalTime = globalDelay + CONFIG.TIMING.SUB_BLOCK_SWEEP
                          + CONFIG.TIMING.LAYER_PHASE_WAIT;
            setTimeout(resolve, totalTime);
        });
    }

    function quickSweepLayers() {
        // Reset layers, then re-animate with fast timing to show
        // the new token going back through all transformer layers
        return new Promise(function (resolve) {
            // First reset all layer fills
            var rows = DOM.layerContainer.querySelectorAll(".layer-row");
            rows.forEach(function (row) {
                var subBlocks = row.querySelectorAll(".layer-sub-block");
                subBlocks.forEach(function (block) {
                    block.classList.remove("completed");
                    var fill = block.querySelector(".layer-sub-fill");
                    fill.classList.remove("active");
                    fill.style.width = "0";
                });
            });

            // Force reflow so the reset takes effect visually
            void DOM.layerContainer.offsetWidth;

            // Now re-animate with fast timing
            var globalDelay = 0;
            rows.forEach(function (row) {
                var subBlocks = row.querySelectorAll(".layer-sub-block");
                subBlocks.forEach(function (block, subIdx) {
                    var thisDelay = globalDelay + subIdx * CONFIG.TIMING.QUICK_SUB_STAGGER;
                    setTimeout(function () {
                        var fill = block.querySelector(".layer-sub-fill");
                        fill.classList.add("active", "quick");
                        setTimeout(function () {
                            block.classList.add("completed");
                        }, CONFIG.TIMING.QUICK_SWEEP);
                    }, thisDelay);
                });
                globalDelay += CONFIG.SUB_BLOCK_COUNT * CONFIG.TIMING.QUICK_SUB_STAGGER
                             + CONFIG.TIMING.QUICK_LAYER_GAP;
            });

            var totalTime = globalDelay + CONFIG.TIMING.QUICK_SWEEP
                          + CONFIG.TIMING.QUICK_PHASE_WAIT;
            setTimeout(resolve, totalTime);
        });
    }

    function renderAttention(matrix, labels) {
        clearChildren(DOM.attnLabelsTop);
        clearChildren(DOM.attnLabelsSide);
        labels.forEach(function (lbl) {
            var topSpan = document.createElement("span");
            topSpan.textContent = lbl;
            DOM.attnLabelsTop.appendChild(topSpan);
            var sideSpan = document.createElement("span");
            sideSpan.textContent = lbl;
            DOM.attnLabelsSide.appendChild(sideSpan);
        });

        var cells = DOM.attentionGrid.querySelectorAll(".attn-cell");
        for (var row = 0; row < CONFIG.ATTENTION_SIZE; row++) {
            for (var col = 0; col < CONFIG.ATTENTION_SIZE; col++) {
                var idx = row * CONFIG.ATTENTION_SIZE + col;
                var val = matrix[row][col];
                var cell = cells[idx];
                if (cell) {
                    cell.style.backgroundColor = heatColor(val);
                    if (val > 0.25) {
                        cell.style.boxShadow = "0 0 " + Math.round(val * 12) + "px " + heatColor(val);
                    } else {
                        cell.style.boxShadow = "none";
                    }
                }
            }
        }
    }

    function renderProbBars(candidates, chosenIndex) {
        clearChildren(DOM.probContainer);
        candidates.forEach(function (c, i) {
            var row = document.createElement("div");
            row.className = "prob-row" + (i === chosenIndex ? " chosen" : "");

            var tokenSpan = document.createElement("span");
            tokenSpan.className = "prob-token";
            tokenSpan.textContent = c.token;

            var trackDiv = document.createElement("div");
            trackDiv.className = "prob-bar-track";
            var fillDiv = document.createElement("div");
            fillDiv.className = "prob-bar-fill";
            trackDiv.appendChild(fillDiv);

            var valueSpan = document.createElement("span");
            valueSpan.className = "prob-value";
            valueSpan.textContent = (c.prob * 100).toFixed(1) + "%";

            row.appendChild(tokenSpan);
            row.appendChild(trackDiv);
            row.appendChild(valueSpan);
            DOM.probContainer.appendChild(row);

            // Double rAF to trigger CSS transition
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    fillDiv.style.width = (c.prob * 100) + "%";
                });
            });
        });
    }

    function typewriterAppend(word) {
        return new Promise(function (resolve) {
            var chars = word.split("");
            var i = 0;
            function typeNext() {
                if (i < chars.length) {
                    var textNode = document.createTextNode(chars[i]);
                    DOM.outputText.insertBefore(textNode, DOM.outputCursor);
                    i++;
                    setTimeout(typeNext, CONFIG.TIMING.OUTPUT_CHAR_DELAY);
                } else {
                    var space = document.createTextNode(" ");
                    DOM.outputText.insertBefore(space, DOM.outputCursor);
                    resolve();
                }
            }
            typeNext();
        });
    }

    // ── UI Helpers ───────────────────────────────────────────

    function activatePanel(panelId) {
        document.getElementById(panelId).classList.add("active");
    }

    function animateFlowConnector(index) {
        var connectors = document.querySelectorAll(".flow-connector");
        if (connectors[index]) {
            var dot = connectors[index].querySelector(".flow-dot");
            dot.classList.remove("active");
            void dot.offsetWidth;
            dot.classList.add("active");
        }
    }

    function setButtonStates(phase) {
        // phase: "idle" | "running-auto" | "running-next" | "animating" | "done"
        if (phase === "idle") {
            DOM.btnAuto.disabled = false;
            DOM.btnNext.disabled = false;
            DOM.btnAutoText.textContent = "Auto";
            DOM.btnNextText.textContent = "Next";
        } else if (phase === "running-auto") {
            DOM.btnAuto.disabled = true;
            DOM.btnNext.disabled = true;
            DOM.btnAutoText.textContent = "Running...";
        } else if (phase === "running-next") {
            DOM.btnAuto.disabled = false;
            DOM.btnNext.disabled = false;
            DOM.btnNextText.textContent = "Next";
        } else if (phase === "animating") {
            DOM.btnAuto.disabled = true;
            DOM.btnNext.disabled = true;
        } else if (phase === "done") {
            DOM.btnAuto.disabled = false;
            DOM.btnNext.disabled = false;
            DOM.btnAutoText.textContent = "Auto";
            DOM.btnNextText.textContent = "Next";
        }
    }

    function updateStepBadge(step) {
        DOM.stepBadge.textContent = "step " + step + "/" + TOTAL_STEPS;
    }

    function resetUI() {
        clearChildren(DOM.tokenContainer);
        DOM.tokenCountBadge.textContent = "0 tokens";
        clearChildren(DOM.probContainer);

        clearChildren(DOM.outputText);
        DOM.outputText.appendChild(DOM.outputCursor);
        DOM.outputCursor.style.display = "";

        DOM.outputStepBadge.textContent = "token 0/" + CONFIG.MAX_OUTPUT_TOKENS;
        updateStepBadge(0);
        resetLayers();
        resetAttention();
        document.querySelectorAll(".panel").forEach(function (p) {
            if (p.id !== "panel-input") {
                p.classList.remove("active");
            }
        });
    }

    function resetLayers() {
        var subBlocks = DOM.layerContainer.querySelectorAll(".layer-sub-block");
        subBlocks.forEach(function (block) {
            block.classList.remove("completed");
            var fill = block.querySelector(".layer-sub-fill");
            fill.classList.remove("active", "quick");
            fill.style.width = "0";
        });
    }

    function resetAttention() {
        var cells = DOM.attentionGrid.querySelectorAll(".attn-cell");
        cells.forEach(function (cell) {
            cell.style.backgroundColor = "";
            cell.style.boxShadow = "none";
        });
    }

    function delay(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    // ── Step Execution ────────────────────────────────────────

    function initSimulation() {
        STATE.exampleIndex = parseInt(DOM.promptSelect.value, 10);
        var example = EXAMPLES[STATE.exampleIndex];
        if (!example) return false;

        STATE.generatedTokens = [];
        STATE.pendingToken = null;
        var seed = hashString(example.prompt) ^ CONFIG.SEED_BASE;
        STATE.rng = createRNG(seed);
        STATE.promptTokens = tokenizePrompt(example.prompt);
        resetUI();
        return true;
    }

    async function executeStep(stepIndex) {
        var example = EXAMPLES[STATE.exampleIndex];
        updateStepBadge(stepIndex + 1);

        if (stepIndex === 0) {
            // Step 1: Tokenization
            activatePanel("panel-tokens");
            animateFlowConnector(0);
            renderTokens(STATE.promptTokens);
            await delay(
                STATE.promptTokens.length * CONFIG.TIMING.TOKEN_STAGGER
                + CONFIG.TIMING.TOKEN_PHASE_WAIT
            );
        } else {
            // Steps 1+: Token generation in 3 sub-steps per token
            var tokenIndex = Math.floor((stepIndex - 1) / 3);
            var subStep = (stepIndex - 1) % 3;

            if (subStep === 0) {
                // Sub-A: Transformer layers + Attention Map
                if (tokenIndex === 0) {
                    activatePanel("panel-layers");
                    activatePanel("panel-analysis");
                    animateFlowConnector(1);
                    animateFlowConnector(2);
                    await animateLayers();
                } else {
                    await quickSweepLayers();
                }

                DOM.outputStepBadge.textContent =
                    "token " + (tokenIndex + 1) + "/" + CONFIG.MAX_OUTPUT_TOKENS;

                var labels = getAttentionLabels(STATE.promptTokens, STATE.generatedTokens);
                var attnMatrix = simulateAttention(STATE.rng);
                renderAttention(attnMatrix, labels);
                await delay(CONFIG.TIMING.ATTENTION_WAIT);

            } else if (subStep === 1) {
                // Sub-B: Next Token Prediction + Generated Output
                if (tokenIndex === 0) {
                    activatePanel("panel-output");
                    animateFlowConnector(3);
                }

                var correctToken = example.response[tokenIndex];
                var result = generateNextToken(STATE.rng, correctToken);
                renderProbBars(result.candidates, result.chosenIndex);
                await delay(CONFIG.TIMING.PROB_WAIT);

                // Store pending token for Sub-C and show in output
                STATE.pendingToken = correctToken;
                await typewriterAppend(correctToken);
                await delay(CONFIG.TIMING.CYCLE_PAUSE);

            } else {
                // Sub-C: Append generated word back to Tokenization
                var token = STATE.pendingToken;
                STATE.generatedTokens.push(token);
                appendToken(token);
                STATE.pendingToken = null;
                await delay(CONFIG.TIMING.CYCLE_PAUSE);

                // Hide cursor on last token
                if (tokenIndex === CONFIG.MAX_OUTPUT_TOKENS - 1) {
                    DOM.outputCursor.style.display = "none";
                }
            }
        }
    }

    // ── Auto Mode ─────────────────────────────────────────────

    async function runAuto() {
        if (STATE.isRunning) return;

        // If mid-Next, continue from current step; otherwise start fresh
        var startStep = 0;
        if (STATE.mode === "next" && STATE.currentStep > 0 && STATE.currentStep < TOTAL_STEPS) {
            startStep = STATE.currentStep;
        } else {
            if (!initSimulation()) return;
        }

        STATE.isRunning = true;
        STATE.mode = "auto";
        STATE.currentStep = startStep;
        setButtonStates("running-auto");

        for (var i = startStep; i < TOTAL_STEPS; i++) {
            await executeStep(i);
        }

        STATE.isRunning = false;
        STATE.mode = null;
        STATE.currentStep = TOTAL_STEPS;
        setButtonStates("done");
    }

    // ── Next (Manual) Mode ────────────────────────────────────

    async function runNextStep() {
        // First click: reset and start
        if (STATE.mode !== "next") {
            if (!initSimulation()) return;
            STATE.mode = "next";
            STATE.currentStep = 0;
        }

        // All steps done
        if (STATE.currentStep >= TOTAL_STEPS) {
            STATE.isRunning = false;
            STATE.mode = null;
            setButtonStates("done");
            return;
        }

        STATE.isRunning = true;
        setButtonStates("animating");

        await executeStep(STATE.currentStep);
        STATE.currentStep++;

        if (STATE.currentStep >= TOTAL_STEPS) {
            STATE.isRunning = false;
            STATE.mode = null;
            setButtonStates("done");
        } else {
            STATE.isRunning = false;
            setButtonStates("running-next");
        }
    }

    // ── Event Listeners ──────────────────────────────────────

    DOM.btnAuto.addEventListener("click", function () {
        runAuto();
    });

    DOM.btnNext.addEventListener("click", function () {
        runNextStep();
    });

    // ── Init ─────────────────────────────────────────────────

    function init() {
        // Create attention grid cells
        clearChildren(DOM.attentionGrid);
        for (var i = 0; i < CONFIG.ATTENTION_SIZE * CONFIG.ATTENTION_SIZE; i++) {
            var cell = document.createElement("div");
            cell.className = "attn-cell";
            DOM.attentionGrid.appendChild(cell);
        }

        // Create placeholder probability rows
        clearChildren(DOM.probContainer);
        for (var j = 0; j < CONFIG.TOP_K; j++) {
            var row = document.createElement("div");
            row.className = "prob-row";

            var tokenSpan = document.createElement("span");
            tokenSpan.className = "prob-token";
            tokenSpan.textContent = "---";

            var trackDiv = document.createElement("div");
            trackDiv.className = "prob-bar-track";
            var fillDiv = document.createElement("div");
            fillDiv.className = "prob-bar-fill";
            trackDiv.appendChild(fillDiv);

            var valueSpan = document.createElement("span");
            valueSpan.className = "prob-value";
            valueSpan.textContent = "--";

            row.appendChild(tokenSpan);
            row.appendChild(trackDiv);
            row.appendChild(valueSpan);
            DOM.probContainer.appendChild(row);
        }

        // Empty attention labels
        var emptyLabels = [];
        for (var k = 0; k < CONFIG.ATTENTION_SIZE; k++) {
            emptyLabels.push("...");
        }
        renderAttention(
            Array.from({ length: 6 }, function () { return [0, 0, 0, 0, 0, 0]; }),
            emptyLabels
        );

        DOM.promptSelect.focus();
    }

    init();
})();
