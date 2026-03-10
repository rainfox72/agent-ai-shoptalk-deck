/**
 * Agent X-Ray — Interactive Agent Workflow Visualization
 *
 * Simulates how an AI agent orchestrates a multi-step task:
 * "Plan an optimal bus route for downtown". Shows memory, LLM reasoning,
 * sub-agent dispatch, MCP tool calls, and skill formatting.
 * No real agent — deterministic simulation for educational demos.
 *
 * Two modes: Auto (runs all steps with delays) or Next (step-by-step on click).
 */
(function () {
    "use strict";

    // ── Timing Configuration ──────────────────────────────────

    var TIMING = {
        STEP_DELAY: 800,
        TYPEWRITER_CHAR: 25,
        SUBAGENT_STAGGER: 400,
        OUTPUT_CHAR: 30
    };

    // ── Pre-canned Scenario ───────────────────────────────────

    var SCENARIO = {
        userPrompt: "Plan an optimal bus route for downtown",
        steps: [
            {
                id: "agent",
                label: "Receiving request...",
                content: "Analyzing user intent: transit route planning task detected"
            },
            {
                id: "memory",
                label: "Retrieving context (RAG)...",
                content: "Query: \"downtown transit demand\"\nRetrieved: Peak ridership 7-9am & 4-6pm. Key corridors: Main St, Broadway, 5th Ave. Current route covers 60% of demand.\nAugmenting prompt with retrieved context..."
            },
            {
                id: "llm",
                label: "Reasoning...",
                content: "Plan: 1) Collect ridership + GIS data  2) Identify underserved zones  3) Optimize route with stops  4) Build timetable"
            },
            {
                id: "subagents",
                label: "Dispatching sub-agents...",
                content: {
                    search: "Querying: ridership counts, traffic volumes, demographic data...\nFound: 3 underserved zones, 12 high-demand stops, 2 transfer points",
                    booking: "Building timetable for 15 stops, 6am-10pm...\nPeak: 10-min headway  Off-peak: 20-min headway  Coverage: 94%"
                }
            },
            {
                id: "mcp",
                label: "Connecting tools via MCP...",
                content: "\u2192 GIS API: getRouteGeometry({corridor: \"Main-Broadway\", stops: 15})\n\u2192 GTFS API: publishSchedule({route: \"DT-Express\", headway: {peak: 10, offpeak: 20}})"
            },
            {
                id: "skills",
                label: "Formatting response...",
                content: "Applying: route-report-formatter skill\nTemplate: transit-route-proposal\nFields: route, stops, headway, coverage, map"
            },
            {
                id: "output",
                label: "Generating response...",
                content: "Route planned! DT-Express: 15 stops along Main St & Broadway, 10-min peak / 20-min off-peak headway. Covers 94% of downtown demand. GTFS published."
            }
        ]
    };

    // ── DOM References ────────────────────────────────────────

    var DOM = {
        btnAuto: document.getElementById("btn-auto"),
        btnNext: document.getElementById("btn-next"),
        btnAutoText: null,
        btnNextText: null,
        stepBadge: document.getElementById("step-badge"),
        outputText: document.getElementById("output-text"),
        outputCursor: document.getElementById("output-cursor"),
        panels: {
            agent: document.getElementById("panel-agent"),
            memory: document.getElementById("panel-memory"),
            llm: document.getElementById("panel-llm"),
            searchAgent: document.getElementById("panel-search-agent"),
            bookingAgent: document.getElementById("panel-booking-agent"),
            mcp: document.getElementById("panel-mcp"),
            skills: document.getElementById("panel-skills")
        },
        content: {
            agent: document.getElementById("agent-content"),
            memory: document.getElementById("memory-content"),
            llm: document.getElementById("llm-content"),
            searchAgent: document.getElementById("search-agent-content"),
            bookingAgent: document.getElementById("booking-agent-content"),
            mcp: document.getElementById("mcp-content"),
            skills: document.getElementById("skills-content")
        }
    };
    DOM.btnAutoText = DOM.btnAuto.querySelector(".btn-text");
    DOM.btnNextText = DOM.btnNext.querySelector(".btn-text");

    // ── State ─────────────────────────────────────────────────

    var STATE = {
        currentStep: 0,
        isRunning: false,
        mode: null  // "auto" or "next"
    };

    // ── Helper Functions ──────────────────────────────────────

    function clearChildren(el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }

    function sleep(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    function typewriterFill(element, text, charDelay) {
        return new Promise(function (resolve) {
            var chars = text.split("");
            var i = 0;
            var textNode = document.createTextNode("");
            element.appendChild(textNode);

            function typeNext() {
                if (i < chars.length) {
                    textNode.nodeValue += chars[i];
                    i++;
                    setTimeout(typeNext, charDelay);
                } else {
                    resolve();
                }
            }

            typeNext();
        });
    }

    function activatePanel(panelKey) {
        var panel = DOM.panels[panelKey];
        if (panel) {
            panel.classList.add("active");
        }
    }

    function completePanel(panelKey) {
        var panel = DOM.panels[panelKey];
        if (panel) {
            panel.classList.remove("active");
            panel.classList.add("completed");
        }
    }

    function resetUI() {
        var panelKeys = Object.keys(DOM.panels);
        for (var i = 0; i < panelKeys.length; i++) {
            var panel = DOM.panels[panelKeys[i]];
            if (panel) {
                panel.classList.remove("active", "completed");
            }
        }

        var contentKeys = Object.keys(DOM.content);
        for (var j = 0; j < contentKeys.length; j++) {
            var contentEl = DOM.content[contentKeys[j]];
            if (contentEl) {
                clearChildren(contentEl);
            }
        }

        clearChildren(DOM.outputText);
        DOM.outputText.appendChild(DOM.outputCursor);
        DOM.outputCursor.style.display = "";

        updateStepBadge(0);
        STATE.currentStep = 0;
        STATE.isRunning = false;
        STATE.mode = null;
    }

    function updateStepBadge(step) {
        DOM.stepBadge.textContent = "step " + step + "/" + SCENARIO.steps.length;
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

    // ── Step Execution ────────────────────────────────────────

    var STEP_FUNCTIONS = [
        // Step 1: Agent receives request
        async function stepAgent() {
            var steps = SCENARIO.steps;
            updateStepBadge(1);
            activatePanel("agent");
            await typewriterFill(DOM.content.agent, steps[0].content, TIMING.TYPEWRITER_CHAR);
            completePanel("agent");
        },
        // Step 2: Memory (RAG) retrieval
        async function stepMemory() {
            var steps = SCENARIO.steps;
            updateStepBadge(2);
            activatePanel("memory");
            await typewriterFill(DOM.content.memory, steps[1].content, TIMING.TYPEWRITER_CHAR);
            completePanel("memory");
        },
        // Step 3: LLM reasoning
        async function stepLLM() {
            var steps = SCENARIO.steps;
            updateStepBadge(3);
            activatePanel("llm");
            await typewriterFill(DOM.content.llm, steps[2].content, TIMING.TYPEWRITER_CHAR);
            completePanel("llm");
        },
        // Step 4: Sub-agents dispatched (staggered)
        async function stepSubAgents() {
            var steps = SCENARIO.steps;
            updateStepBadge(4);
            activatePanel("searchAgent");
            await typewriterFill(DOM.content.searchAgent, steps[3].content.search, TIMING.TYPEWRITER_CHAR);
            await sleep(TIMING.SUBAGENT_STAGGER);
            activatePanel("bookingAgent");
            await typewriterFill(DOM.content.bookingAgent, steps[3].content.booking, TIMING.TYPEWRITER_CHAR);
            completePanel("searchAgent");
            completePanel("bookingAgent");
        },
        // Step 5: MCP tool connections
        async function stepMCP() {
            var steps = SCENARIO.steps;
            updateStepBadge(5);
            activatePanel("mcp");
            await typewriterFill(DOM.content.mcp, steps[4].content, TIMING.TYPEWRITER_CHAR);
            completePanel("mcp");
        },
        // Step 6: Skills formatting
        async function stepSkills() {
            var steps = SCENARIO.steps;
            updateStepBadge(6);
            activatePanel("skills");
            await typewriterFill(DOM.content.skills, steps[5].content, TIMING.TYPEWRITER_CHAR);
            completePanel("skills");
        },
        // Step 7: Final output
        async function stepOutput() {
            var steps = SCENARIO.steps;
            updateStepBadge(7);
            var outputContent = steps[6].content;
            var chars = outputContent.split("");
            var outputTextNode = document.createTextNode("");
            DOM.outputText.insertBefore(outputTextNode, DOM.outputCursor);

            for (var c = 0; c < chars.length; c++) {
                outputTextNode.nodeValue += chars[c];
                await sleep(TIMING.OUTPUT_CHAR);
            }

            DOM.outputCursor.style.display = "none";
        }
    ];

    // ── Auto Mode ─────────────────────────────────────────────

    async function runAuto() {
        if (STATE.isRunning) return;

        // If mid-Next, continue from current step; otherwise start fresh
        var startStep = 0;
        if (STATE.mode === "next" && STATE.currentStep > 0 && STATE.currentStep < STEP_FUNCTIONS.length) {
            startStep = STATE.currentStep;
        } else {
            resetUI();
        }

        STATE.isRunning = true;
        STATE.mode = "auto";
        setButtonStates("running-auto");

        for (var i = startStep; i < STEP_FUNCTIONS.length; i++) {
            await STEP_FUNCTIONS[i]();
            if (i < STEP_FUNCTIONS.length - 1) {
                await sleep(TIMING.STEP_DELAY);
            }
        }

        STATE.isRunning = false;
        STATE.mode = null;
        STATE.currentStep = STEP_FUNCTIONS.length;
        setButtonStates("done");
    }

    // ── Next (Manual) Mode ────────────────────────────────────

    async function runNextStep() {
        // First click: reset and start
        if (STATE.mode !== "next") {
            resetUI();
            STATE.mode = "next";
            STATE.currentStep = 0;
        }

        // All steps done
        if (STATE.currentStep >= STEP_FUNCTIONS.length) {
            STATE.isRunning = false;
            STATE.mode = null;
            setButtonStates("done");
            return;
        }

        STATE.isRunning = true;
        setButtonStates("animating");

        await STEP_FUNCTIONS[STATE.currentStep]();
        STATE.currentStep++;

        if (STATE.currentStep >= STEP_FUNCTIONS.length) {
            // All done
            STATE.isRunning = false;
            STATE.mode = null;
            setButtonStates("done");
        } else {
            STATE.isRunning = false;
            setButtonStates("running-next");
        }
    }

    // ── Event Listeners ───────────────────────────────────────

    DOM.btnAuto.addEventListener("click", function () {
        runAuto();
    });

    DOM.btnNext.addEventListener("click", function () {
        runNextStep();
    });

})();
