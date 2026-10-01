// Utility: format corpus text for display
function formatCorpusText(text) {
  const words = text.split(" ");
  let formatted = "";
  words.forEach((word) => {
    if (word === "EOS/eos") {
      formatted += word + " ";
    } else {
      const parts = word.split("/");
      if (parts.length === 2) {
        formatted += "<b>" + parts[0] + "</b>/" + parts[1] + " ";
      } else {
        formatted += word + " ";
      }
    }
  });
  return formatted;
}

// Parse exactly one probability value from a cell.
// Allowed formats: 0, 0.25, 1, 1.0, .5 (single value only, range 0..1).
function parseProbabilityInput(str) {
  const text = String(str ?? "").trim();
  if (!text) return null;

  const singleValuePattern = /^(?:0(?:\.\d+)?|1(?:\.0+)?|\.\d+)$/;
  if (!singleValuePattern.test(text)) return null;

  const value = Number(text);
  if (!Number.isFinite(value) || value < 0 || value > 1) return null;
  return value;
}

function attachInputGuards() {
  const inputs = document.querySelectorAll(
    ".emission-input, .transition-input",
  );
  const controlKeys = new Set([
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Tab",
    "Home",
    "End",
  ]);

  inputs.forEach((input) => {
    input.setAttribute("inputmode", "decimal");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("placeholder", "0-1");

    input.addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.metaKey) return;
      if (controlKeys.has(event.key)) return;

      if (event.key === ".") {
        if (input.value.includes(".")) {
          event.preventDefault();
        }
        return;
      }

      if (!/^[0-9]$/.test(event.key)) {
        event.preventDefault();
      }
    });

    input.addEventListener("paste", (event) => {
      const pasted = (event.clipboardData || window.clipboardData).getData(
        "text",
      );
      if (parseProbabilityInput(pasted) === null) {
        event.preventDefault();
      }
    });
  });
}

// HMM Experiment JavaScript Functions (Three-pane layout)

let currentCorpusKey = "corpus1";
let currentCorpus = null;
let userEmission = [];
let userTransition = [];

function parseTaggedTokens(corpusText) {
  return corpusText
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => {
      const slashIdx = token.lastIndexOf("/");
      if (slashIdx <= 0 || slashIdx >= token.length - 1) {
        return null;
      }
      return {
        word: token.slice(0, slashIdx),
        tag: token.slice(slashIdx + 1),
      };
    })
    .filter((item) => item !== null);
}

function buildProbabilityMatrices(corpus) {
  const tokens = parseTaggedTokens(corpus.text || "");
  const posIndex = {};
  const wordIndex = {};

  corpus.pos.forEach((tag, idx) => {
    posIndex[tag] = idx;
  });
  corpus.words.forEach((word, idx) => {
    wordIndex[word] = idx;
  });

  const emissionCounts = Array(corpus.pos.length * corpus.words.length).fill(0);
  const transitionCounts = Array(corpus.pos.length * corpus.pos.length).fill(0);
  const tagTotals = Array(corpus.pos.length).fill(0);
  const transitionFromTotals = Array(corpus.pos.length).fill(0);

  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    const row = posIndex[current.tag];
    const col = wordIndex[current.word];

    if (row !== undefined && col !== undefined) {
      emissionCounts[row * corpus.words.length + col] += 1;
      tagTotals[row] += 1;
    }

    if (i < tokens.length - 1) {
      const next = tokens[i + 1];
      const fromIdx = posIndex[current.tag];
      const toIdx = posIndex[next.tag];
      if (fromIdx !== undefined && toIdx !== undefined) {
        transitionCounts[fromIdx * corpus.pos.length + toIdx] += 1;
        transitionFromTotals[fromIdx] += 1;
      }
    }
  }

  const emissionProb = emissionCounts.map((count, idx) => {
    const row = Math.floor(idx / corpus.words.length);
    const denom = tagTotals[row];
    return denom > 0 ? count / denom : 0;
  });

  const transitionProb = transitionCounts.map((count, idx) => {
    const row = Math.floor(idx / corpus.pos.length);
    const denom = transitionFromTotals[row];
    return denom > 0 ? count / denom : 0;
  });

  return {
    ...corpus,
    emission_matrix: emissionProb,
    transition_matrix: transitionProb,
    tokens,
  };
}

function renderCorpusSelection() {
  const select = document.createElement("select");
  select.name = "corpus-select";
  select.id = "corpus-select";
  select.className = "markov-dropdown";
  select.innerHTML =
    '<option value="corpus1">Corpus A</option>' +
    '<option value="corpus2">Corpus B</option>' +
    '<option value="corpus3">Corpus C</option>';
  select.value = currentCorpusKey;
  select.onchange = function () {
    currentCorpusKey = this.value;
    loadCorpus(currentCorpusKey);
  };

  const container = document.getElementById("corpus-selection");
  container.innerHTML =
    '<div class="markov-section-title">Corpus Selection:</div>';
  container.appendChild(select);
}

function renderCorpusInfo() {
  const infoDiv = document.getElementById("corpus-info");
  const corpus = corpusData[currentCorpusKey];
  const sentence = parseTaggedTokens(corpus.text || "")
    .map((token) => token.word)
    .join(" ");
  infoDiv.innerHTML =
    '<div class="markov-section-title">Training Sentence:</div>' +
    '<div class="markov-sentence">' +
    sentence +
    "</div>";
}

function renderSimulation() {
  //console.log("renderSimulation called");
  //console.log("corpusData:", typeof corpusData, corpusData);
  //console.log("currentCorpusKey:", currentCorpusKey); // or whatever variable you use to select the corpus
  const corpus = buildProbabilityMatrices(corpusData[currentCorpusKey]);
  //console.log("corpus:", corpus);
  if (!corpus) {
    console.error("Corpus not found for name:", currentCorpusKey);
    return;
  }
  //console.log("emission_matrix:", corpus.emission_matrix);
  //console.log("emission_matrix.length:", corpus.emission_matrix ? corpus.emission_matrix.length : "undefined");
  //console.log("pos:", corpus.pos);
  //console.log("pos.length:", corpus.pos ? corpus.pos.length : "undefined");
  //console.log("words:", corpus.words);
  //console.log("words.length:",corpus.words ? corpus.words.length : "undefined");
  //console.log("Should be:",corpus.pos && corpus.words? corpus.pos.length * corpus.words.length: "undefined");
  //console.log("transition_matrix:", corpus.transition_matrix);
  //console.log("transition_matrix.length:",corpus.transition_matrix ? corpus.transition_matrix.length : "undefined");
  //console.log("Should be:",corpus.pos ? corpus.pos.length * corpus.pos.length : "undefined");

  const matricesContainer = document.getElementById("markov-matrices");
  currentCorpus = corpus;
  // Reset user input
  userEmission = Array(corpus.emission_matrix.length).fill("");
  userTransition = Array(corpus.transition_matrix.length).fill("");
  // Render matrices and controls in the right pane
  let html = "";
  html +=
    '<div class="markov-section-title">Fill the Emission and Transition Matrices:</div>';

  html += '<div class="emission-matrix-container">';
  html += '<div class="markov-table-container">';
  html += generateEditableEmissionMatrix(corpus);
  html += "</div>";
  html += "</div>";

  html += '<div class="transition-matrix-container">';
  html += '<div class="markov-table-container">';
  html += generateEditableTransitionMatrix(corpus);
  html += "</div>";
  html += "</div>";

  html +=
    '<div class="markov-controls">' +
    '<button id="check-btn" class="sim-button">Check</button>' +
    '<button id="show-answer-btn" class="sim-button">Show Answer</button>' +
    '<button id="show-hint-btn" class="sim-button">Show Hint</button>' +
    '<button id="reset-btn" class="sim-button">Reset</button>' +
    "</div>";
  matricesContainer.innerHTML = html;

  // Clear feedback and answers sections
  const feedbackDiv = document.getElementById("markov-feedback");
  const answersDiv = document.getElementById("markov-answers");
  if (feedbackDiv) {
    feedbackDiv.innerHTML = "";
    feedbackDiv.style.display = "none"; // Hide feedback section
  }
  if (answersDiv) {
    answersDiv.innerHTML = "";
    answersDiv.style.display = "none"; // Hide answers section
  }
  // Button handlers
  document.getElementById("check-btn").onclick = checkMatrices;
  document.getElementById("show-answer-btn").onclick = showAnswer;
  document.getElementById("show-hint-btn").onclick = showHint;
  document.getElementById("reset-btn").onclick = resetSimulation;

  // Adjust layout based on table width
  onTableUpdate();
}

function generateEditableEmissionMatrix(corpus) {
  let html =
    '<div class="emission-matrix-header">' +
    '<div class="markov-section-title">' +
    "Emission Matrix " +
    '<span class="info-icon" tabindex="0" onclick="showEmissionDetails()" title="Click to see emission matrix explanation">' +
    '<i class="fas fa-info-circle"></i>' +
    "</span>" +
    "</div>" +
    "</div>" +
    '<table class="emission-matrix-table" data-corpus="' +
    currentCorpusKey +
    '">';
  html += "<tr><td></td>";
  corpus.words.forEach((word) => {
    html += "<td><b>" + word + "</b></td>";
  });
  html += "</tr>";
  for (let i = 0; i < corpus.pos.length; i++) {
    html += "<tr><td><b>" + corpus.pos[i] + "</b></td>";
    for (let j = 0; j < corpus.words.length; j++) {
      const idx = i * corpus.words.length + j;
      html +=
        '<td><input type="text" id="e' +
        idx +
        '" class="emission-input" data-row="' +
        i +
        '" data-col="' +
        j +
        '" maxlength="6" value="" /></td>';
    }
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

function generateEditableTransitionMatrix(corpus) {
  let html =
    '<div class="transition-matrix-header">' +
    '<div class="markov-section-title">' +
    "Transition Matrix " +
    '<span class="info-icon" tabindex="0" onclick="showPOSDetails()" title="Click to see detailed POS tag explanations">' +
    '<i class="fas fa-info-circle"></i>' +
    "</span>" +
    "</div>" +
    "</div>" +
    '<table class="transition-matrix-table" data-corpus="' +
    currentCorpusKey +
    '">';
  html += "<tr><td></td>";
  corpus.pos.forEach((pos) => {
    html += "<td><b>" + pos + "</b></td>";
  });
  html += "</tr>";
  for (let i = 0; i < corpus.pos.length; i++) {
    html += "<tr><td><b>" + corpus.pos[i] + "</b></td>";
    for (let j = 0; j < corpus.pos.length; j++) {
      const idx = i * corpus.pos.length + j;
      html +=
        '<td><input type="text" id="t' +
        idx +
        '" class="transition-input" data-row="' +
        i +
        '" data-col="' +
        j +
        '" maxlength="6" value="" /></td>';

      // Enforce one numeric probability per cell by input design.
      attachInputGuards();
    }
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

// Helper function to hide all output sections for mutual exclusivity
function hideAllOutputSections() {
  const feedbackDiv = document.getElementById("markov-feedback");
  const answersDiv = document.getElementById("markov-answers");

  if (feedbackDiv) {
    feedbackDiv.style.display = "none";
    feedbackDiv.innerHTML = "";
  }
  if (answersDiv) {
    answersDiv.style.display = "none";
    answersDiv.innerHTML = "";
  }
}

function checkMatrices() {
  // Hide other sections first to ensure mutual exclusivity
  hideAllOutputSections();

  const corpus = currentCorpus;
  let emissionOk = true,
    transitionOk = true;
  // Check all emission rows
  for (let i = 0; i < corpus.pos.length; i++) {
    for (let j = 0; j < corpus.words.length; j++) {
      const idx = i * corpus.words.length + j;
      const input = document.getElementById("e" + idx);
      if (!input) {
        console.error("Element not found: e" + idx);
        continue;
      }
      const val = input.value.trim();
      userEmission[idx] = val;
      const correct = corpus.emission_matrix[i * corpus.words.length + j];
      const calc = parseProbabilityInput(val);
      if (calc === null || isNaN(calc) || Math.abs(calc - correct) > 0.01) {
        input.style.backgroundColor = "#FFB3B3";
        emissionOk = false;
      } else {
        input.style.backgroundColor = "#B3FFB3";
        if (!isNaN(calc)) input.value = Number(calc).toFixed(2);
      }
    }
  }
  // Check transition
  for (let i = 0; i < corpus.transition_matrix.length; i++) {
    const input = document.getElementById("t" + i);
    const val = input.value.trim();
    userTransition[i] = val;
    const correct = corpus.transition_matrix[i];
    const calc = parseProbabilityInput(val);
    if (calc === null || isNaN(calc) || Math.abs(calc - correct) > 0.01) {
      input.style.backgroundColor = "#FFB3B3";
      transitionOk = false;
    } else {
      input.style.backgroundColor = "#B3FFB3";
      if (!isNaN(calc)) input.value = Number(calc).toFixed(2);
    }
  }
  // Feedback
  let msg = "";
  if (emissionOk && transitionOk) {
    msg =
      '<div class="success-message">✓ Excellent! All matrices are correct!</div>';
  } else if (!emissionOk && !transitionOk) {
    msg =
      '<div class="error-message">✗ Both Emission and Transition matrices need correction.</div>';
  } else if (!emissionOk) {
    msg =
      '<div class="error-message">✗ Emission Matrix needs correction. Transition Matrix is correct.</div>';
  } else if (!transitionOk) {
    msg =
      '<div class="error-message">✗ Transition Matrix needs correction. Emission Matrix is correct.</div>';
  }
  const feedbackDiv = document.getElementById("markov-feedback");
  feedbackDiv.innerHTML = msg;
  feedbackDiv.style.display = "block"; // Show only feedback section
}

function showAnswer() {
  // Hide other sections first to ensure mutual exclusivity
  hideAllOutputSections();

  const corpus = currentCorpus;
  const hasAnyInput =
    userEmission.some((value) => String(value).trim() !== "") ||
    userTransition.some((value) => String(value).trim() !== "");

  if (!hasAnyInput) {
    const feedbackDiv = document.getElementById("markov-feedback");
    feedbackDiv.innerHTML =
      '<div class="error-message">Enter at least one value before using Show Answer.</div>';
    feedbackDiv.style.display = "block";
    return;
  }

  let html = "";
  html += '<div class="emission-matrix-container">';
  html += '<div class="markov-section-title">Correct Emission Matrix</div>';
  html += generateStaticMatrix(
    corpus.emission_matrix,
    corpus.pos,
    corpus.words,
    "emission-answer",
  );
  html += "</div>";

  html += '<div class="transition-matrix-container">';
  html += '<div class="markov-section-title">Correct Transition Matrix</div>';
  html += generateStaticMatrix(
    corpus.transition_matrix,
    corpus.pos,
    corpus.pos,
    "transition-answer",
  );
  html += "</div>";

  document.getElementById("markov-answers").innerHTML = html;
  document.getElementById("markov-answers").style.display = "block"; // Show only answers section

  // Adjust layout based on table width
  onTableUpdate();
}

function showHint() {
  // Hide other sections first to ensure mutual exclusivity
  hideAllOutputSections();

  let hint = "";
  const sentence =
    currentCorpus && currentCorpus.tokens
      ? currentCorpus.tokens.map((token) => token.word).join(" ")
      : "";

  if (currentCorpusKey === "corpus1") {
    hint = `<div class="markov-hint">
        <div class="markov-section-title">Hint for: ${sentence}</div>
        <ul>
          <li>Count how many times each word appears with each POS tag in the sentence.</li>
          <li>For emission: P(word | POS) = count(word, POS) / count(POS) in this sentence.</li>
          <li>For transition: P(POS<sub>i</sub> | POS<sub>i-1</sub>) = count(POS<sub>i-1</sub>, POS<sub>i</sub>) / count(POS<sub>i-1</sub>).</li>
          <li>Example: How often does 'fox' appear as a noun? How often does 'the' precede an adjective?</li>
        </ul>
        </div>`;
  } else if (currentCorpusKey === "corpus2") {
    hint = `<div class="markov-hint">
        <div class="markov-section-title">Hint for: ${sentence}</div>
        <ul>
          <li>Identify the POS tags for each word in the sentence.</li>
          <li>Emission: For each POS, count the words it generates.</li>
          <li>Transition: For each POS, count what POS comes next.</li>
          <li>Example: How often does 'reading' appear as a verb? What POS follows 'are'?</li>
        </ul>
        </div>`;
  } else if (currentCorpusKey === "corpus3") {
    hint = `<div class="markov-hint">
        <div class="markov-section-title">Hint for: ${sentence}</div>
        <ul>
          <li>Break the sentence into words and assign POS tags.</li>
          <li>Emission: Calculate the probability of each word given its POS.</li>
          <li>Transition: Calculate the probability of each POS following another.</li>
          <li>Example: How often does 'children' appear as a noun? What POS follows 'every'?</li>
        </ul>
        </div>`;
  }
  document.getElementById("markov-answers").innerHTML = hint;
  document.getElementById("markov-answers").style.display = "block"; // Show only answers section for hint
}

function resetSimulation() {
  // Hide all output sections when resetting
  hideAllOutputSections();

  currentCorpusKey = "corpus1";
  loadCorpus(currentCorpusKey);
}

function generateStaticMatrix(flatMatrix, rowLabels, colLabels, type) {
  let tableClass = type.includes("emission")
    ? "emission-matrix-table"
    : "transition-matrix-table";
  let html = `<table class="${tableClass}">`;
  html += "<tr><td></td>";
  colLabels.forEach((col) => {
    html += "<td><b>" + col + "</b></td>";
  });
  html += "</tr>";
  for (let i = 0; i < rowLabels.length; i++) {
    html += "<tr><td><b>" + rowLabels[i] + "</b></td>";
    for (let j = 0; j < colLabels.length; j++) {
      const idx = i * colLabels.length + j;
      const val = flatMatrix[idx];
      html +=
        "<td>" + (typeof val === "number" ? val.toFixed(2) : val) + "</td>";
    }
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

// Responsive layout adjustment - simplified since we removed dynamic layout classes
function adjustLayoutForTableWidth() {
  // Only apply on desktop (>900px)
  if (window.innerWidth <= 900) {
    return;
  }

  const container = document.getElementById("main-2pane-container");
  const rightPane = document.getElementById("right-pane");
  const leftPane = document.getElementById("left-pane");

  if (!container || !leftPane || !rightPane) {
    return;
  }

  // Simple layout adjustment without overriding CSS flexbox values
  setTimeout(() => {
    // Don't override the CSS flex settings, just ensure overflow is handled
    rightPane.style.overflow = "visible";

    // Log dimensions for debugging
    //console.log("Container width:", container.offsetWidth);
    //console.log("Left pane width:", leftPane.offsetWidth);
    //console.log("Right pane width:", rightPane.offsetWidth);
    //console.log("Right pane scroll width:", rightPane.scrollWidth);
  }, 50);
}

// Force right pane to stay within bounds
function ensureRightPaneContainment() {
  const rightPane = document.getElementById("right-pane");
  const container = document.getElementById("main-2pane-container");

  if (!rightPane || !container || window.innerWidth <= 900) {
    return;
  }

  // Find all matrix containers within right pane
  const matrixContainers = rightPane.querySelectorAll(
    ".emission-matrix-container, .transition-matrix-container",
  );

  // Ensure each matrix container fits within available space
  matrixContainers.forEach((matrixContainer) => {
    const table = matrixContainer.querySelector("table");
    if (table) {
      // Force containers to fit within right pane bounds
      matrixContainer.style.maxWidth = "100%";
      matrixContainer.style.overflow = "visible";

      // Log container dimensions for debugging
      //console.log("Matrix container width:", matrixContainer.offsetWidth);
      //console.log("Matrix container scroll width:",matrixContainer.scrollWidth);
      //console.log("Table width:", table.offsetWidth);
      //console.log("Table scroll width:", table.scrollWidth);
    }
  });

  // Don't override CSS flexbox values, just ensure overflow is handled
  rightPane.style.overflow = "visible";

  //console.log("Right pane computed width:",window.getComputedStyle(rightPane).width);
  //console.log("Right pane max-width:",window.getComputedStyle(rightPane).maxWidth);
}

// Call layout adjustment when tables are updated
function onTableUpdate() {
  // Small delay to ensure DOM is updated
  setTimeout(() => {
    if (window.innerWidth > 900) {
      // Desktop: apply dynamic layout and containment
      adjustLayoutForTableWidth();
      ensureRightPaneContainment();
    } else {
      // Mobile/Tablet: reset any desktop-specific styles
      resetMobileTabletStyles();
    }
  }, 100);
}

// Add event listener for window resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    // Desktop: apply dynamic layout and containment
    adjustLayoutForTableWidth();
    ensureRightPaneContainment();
  } else {
    // Mobile/Tablet: reset any desktop-specific styles
    resetMobileTabletStyles();
  }
});

// Reset desktop-specific styles for mobile/tablet
function resetMobileTabletStyles() {
  // Only apply on mobile/tablet (≤900px)
  if (window.innerWidth > 900) {
    return;
  }

  const rightPane = document.getElementById("right-pane");
  const matrixContainers = document.querySelectorAll(
    ".emission-matrix-container, .transition-matrix-container",
  );

  // Reset right pane styles for mobile/tablet
  if (rightPane) {
    rightPane.style.minWidth = "";
    rightPane.style.overflowX = "";
  }

  // Reset matrix container styles for mobile/tablet
  matrixContainers.forEach((matrixContainer) => {
    matrixContainer.style.minWidth = "";
    matrixContainer.style.width = "";
    matrixContainer.style.overflowX = "";
  });
}

// Show POS tag details in a modal popup
function showPOSDetails() {
  const posGlossary = {
    DET: "Determiner (the, a, an, this, that) - Words that introduce and specify nouns",
    ADJ: "Adjective (quick, brown, lazy, good) - Words that describe or modify nouns",
    NOUN: "Noun (fox, dog, park, students, books) - Words that name people, places, things, or ideas",
    VERB: "Verb (jumps, are, reading, play) - Words that express actions, states, or occurrences",
    ADP: "Adposition/Preposition (over, in, near, of) - Words that show relationships between other words",
    ADV: "Adverb (quickly, quietly, every) - Words that modify verbs, adjectives, or other adverbs",
    PRON: "Pronoun (they, it, that) - Words that replace or refer to nouns",
    CONJ: "Conjunction (and, or, but) - Words that connect words, phrases, or clauses",
    NUM: "Number (one, two, first) - Words that express quantity or order",
    PRT: "Particle (up, down, over) - Words that combine with verbs to form phrasal verbs",
    X: "Other/Unknown - Words that don't fit into standard categories",
    eos: "End of Sentence marker - Special symbol indicating sentence boundaries",
  };

  // Get the current corpus to show only relevant POS tags
  const corpus = currentCorpus;
  let modalContent = '<div class="pos-modal-content">';
  modalContent += '<div class="pos-modal-header">';
  modalContent += "<h3>POS Tags Used in This Corpus</h3>";
  modalContent +=
    '<span class="pos-modal-close" onclick="closePOSModal()">&times;</span>';
  modalContent += "</div>";
  modalContent += '<div class="pos-modal-body">';

  if (corpus && corpus.pos) {
    corpus.pos.forEach((pos) => {
      if (posGlossary[pos]) {
        modalContent += `<div class="pos-detail-item">`;
        modalContent += `<div class="pos-detail-tag">${pos}</div>`;
        modalContent += `<div class="pos-detail-description">${posGlossary[pos]}</div>`;
        modalContent += `</div>`;
      }
    });
  }

  modalContent += "</div>";
  modalContent += "</div>";

  // Create or update the modal
  let modal = document.getElementById("pos-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "pos-modal";
    modal.className = "pos-modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = modalContent;
  modal.style.display = "block";

  // Close modal when clicking outside
  modal.onclick = function (event) {
    if (event.target === modal) {
      closePOSModal();
    }
  };
}

// Close POS details modal
function closePOSModal() {
  const modal = document.getElementById("pos-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Close modals with Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closePOSModal();
    closeEmissionModal();
  }
});

// Main entry point
function loadCorpus(corpusKey) {
  currentCorpusKey = corpusKey;
  renderCorpusSelection();
  renderCorpusInfo();
  renderSimulation();
  // Clear the answers section instead of the old right-pane-content
  const answersSection = document.getElementById("markov-answers");
  if (answersSection) {
    answersSection.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize instructions bar to be collapsed by default (hidden)
  const instructionsContent = document.getElementById("instructions-content");
  const instructionsArrow = document.getElementById("instructions-arrow");
  const instructionsBar = document.getElementById("instructions-bar");

  // Always start collapsed (hidden) and arrow down
  if (instructionsContent) instructionsContent.style.display = "none";

  if (instructionsBar && instructionsArrow && instructionsContent) {
    instructionsBar.onclick = function () {
      if (
        instructionsContent.style.display === "none" ||
        instructionsContent.style.display === ""
      ) {
        instructionsContent.style.display = "block";
        instructionsArrow.classList.remove("rotated"); // Arrow up (expanded)
      } else {
        instructionsContent.style.display = "none";
        instructionsArrow.classList.add("rotated"); // Arrow down (collapsed)
      }
    };
    instructionsArrow.onclick = instructionsBar.onclick;
  }
  loadCorpus(currentCorpusKey);
});

// Show Emission Matrix details in a modal popup
function showEmissionDetails() {
  let modalContent = '<div class="pos-modal-content">';
  modalContent += '<div class="pos-modal-header">';
  modalContent += "<h3>Emission Matrix Explanation</h3>";
  modalContent +=
    '<span class="pos-modal-close" onclick="closeEmissionModal()">&times;</span>';
  modalContent += "</div>";
  modalContent += '<div class="pos-modal-body">';

  modalContent += `<div class="pos-detail-item">`;
  modalContent += `<div class="pos-detail-tag">ROWS</div>`;
  modalContent += `<div class="pos-detail-description">Each row represents a <strong>POS tag (grammatical state)</strong> that can emit (produce) words. The emission matrix shows the probability of each POS tag generating specific words.</div>`;
  modalContent += `</div>`;

  modalContent += `<div class="pos-detail-item">`;
  modalContent += `<div class="pos-detail-tag">COLS</div>`;
  modalContent += `<div class="pos-detail-description">Each column represents a <strong>word in the vocabulary</strong>. The values show how likely each POS tag is to produce that particular word.</div>`;
  modalContent += `</div>`;

  modalContent += `<div class="pos-detail-item">`;
  modalContent += `<div class="pos-detail-tag">VALUES</div>`;
  modalContent += `<div class="pos-detail-description">Each cell contains the <strong>emission probability P(word|POS)</strong> - the likelihood that a particular POS tag will generate a specific word. Values range from 0 to 1, with higher values indicating stronger associations.</div>`;
  modalContent += `</div>`;

  modalContent += `<div class="pos-detail-item">`;
  modalContent += `<div class="pos-detail-tag">EXAMPLE</div>`;
  modalContent += `<div class="pos-detail-description">If P(dog|NOUN) = 0.8, it means there's an 80% chance that when we see a NOUN tag, it will generate the word "dog". Each row should sum to 1.0 across all possible words.</div>`;
  modalContent += `</div>`;

  modalContent += "</div>";
  modalContent += "</div>";

  // Create or update the modal
  let modal = document.getElementById("emission-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "emission-modal";
    modal.className = "pos-modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = modalContent;
  modal.style.display = "block";

  // Close modal when clicking outside
  modal.onclick = function (event) {
    if (event.target === modal) {
      closeEmissionModal();
    }
  };
}

// Close Emission details modal
function closeEmissionModal() {
  const modal = document.getElementById("emission-modal");
  if (modal) {
    modal.style.display = "none";
  }
}
