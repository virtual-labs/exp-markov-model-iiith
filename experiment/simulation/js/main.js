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

// Utility: calculator function to evaluate mathematical expressions
function calculator(str) {
  try {
    str = str.replace(/\s/g, ""); // Remove spaces
    return eval(str);
  } catch (e) {
    return null;
  }
}

// HMM Experiment JavaScript Functions (Three-pane layout)

let currentCorpusKey = "corpus1";
let currentCorpus = null;
let userEmission = [];
let userTransition = [];

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
  // Use distinct, longer, and more natural example sentences for each corpus
  let sentence = "";
  if (currentCorpusKey === "corpus1") {
    sentence = "The quick brown fox jumps over the lazy dog in the park.";
  } else if (currentCorpusKey === "corpus2") {
    sentence = "A group of students are reading books quietly in the library.";
  } else if (currentCorpusKey === "corpus3") {
    sentence =
      "During the summer holidays, children play football every evening near the river.";
  }
  infoDiv.innerHTML =
    '<div class="markov-section-title">Training Sentence:</div>' +
    '<div class="markov-sentence">' +
    sentence +
    "</div>";
}

function renderSimulation() {
  console.log("renderSimulation called");
  console.log("corpusData:", typeof corpusData, corpusData);
  console.log("currentCorpusKey:", currentCorpusKey); // or whatever variable you use to select the corpus
  const corpus = corpusData[currentCorpusKey];
  console.log("corpus:", corpus);
  if (!corpus) {
    console.error("Corpus not found for name:", currentCorpusKey);
    return;
  }
  console.log("emission_matrix:", corpus.emission_matrix);
  console.log(
    "emission_matrix.length:",
    corpus.emission_matrix ? corpus.emission_matrix.length : "undefined"
  );
  console.log("pos:", corpus.pos);
  console.log("pos.length:", corpus.pos ? corpus.pos.length : "undefined");
  console.log("words:", corpus.words);
  console.log(
    "words.length:",
    corpus.words ? corpus.words.length : "undefined"
  );
  console.log(
    "Should be:",
    corpus.pos && corpus.words
      ? corpus.pos.length * corpus.words.length
      : "undefined"
  );
  console.log("transition_matrix:", corpus.transition_matrix);
  console.log(
    "transition_matrix.length:",
    corpus.transition_matrix ? corpus.transition_matrix.length : "undefined"
  );
  console.log(
    "Should be:",
    corpus.pos ? corpus.pos.length * corpus.pos.length : "undefined"
  );
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
  document.getElementById("markov-feedback").innerHTML = "";
  document.getElementById("markov-answers").innerHTML = "";
  // Button handlers
  document.getElementById("check-btn").onclick = checkMatrices;
  document.getElementById("show-answer-btn").onclick = showAnswer;
  document.getElementById("show-hint-btn").onclick = showHint;
  document.getElementById("reset-btn").onclick = resetSimulation;
}

function generateEditableEmissionMatrix(corpus) {
  let html =
    '<div class="markov-section-title">Emission Matrix</div>' +
    '<table class="emission-matrix-table">';
  html += "<tr><td></td>";
  corpus.words.forEach((word) => {
    html += "<td><b>" + word + "</b></td>";
  });
  html += "</tr>";
  for (let i = 1; i < corpus.pos.length; i++) {
    // skip 'eos'
    html += "<tr><td><b>" + corpus.pos[i] + "</b></td>";
    for (let j = 0; j < corpus.words.length; j++) {
      const idx = (i - 1) * corpus.words.length + j;
      html +=
        '<td><input type="text" id="e' +
        idx +
        '" class="emission-input" data-row="' +
        (i - 1) +
        '" data-col="' +
        j +
        '" value="" /></td>';
    }
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

function generateEditableTransitionMatrix(corpus) {
  let html =
    '<div class="markov-section-title">Transition Matrix</div>' +
    '<table class="transition-matrix-table">';
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
        '" value="" /></td>';
    }
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

function checkMatrices() {
  const corpus = currentCorpus;
  let emissionOk = true,
    transitionOk = true;
  // Check emission (skip first POS tag like in generation)
  for (let i = 1; i < corpus.pos.length; i++) {
    for (let j = 0; j < corpus.words.length; j++) {
      const idx = (i - 1) * corpus.words.length + j;
      const input = document.getElementById("e" + idx);
      if (!input) {
        console.error("Element not found: e" + idx);
        continue;
      }
      const val = input.value.trim();
      userEmission[i * corpus.words.length + j] = val;
      const correct = corpus.emission_matrix[i * corpus.words.length + j];
      const calc = calculator(val);
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
    const calc = calculator(val);
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
  document.getElementById("markov-feedback").innerHTML = msg;
}

function showAnswer() {
  const corpus = corpusData[currentCorpusKey];
  let html = '<div class="markov-section-title">Correct Matrices</div>';

  html += '<div class="emission-matrix-container">';
  html += '<div class="markov-section-title">Correct Emission Matrix</div>';
  // Skip the first POS tag's data (first corpus.words.length elements)
  const emissionSubMatrix = corpus.emission_matrix.slice(corpus.words.length);
  html += generateStaticMatrix(
    emissionSubMatrix,
    corpus.pos.slice(1),
    corpus.words,
    "emission-answer"
  );
  html += "</div>";

  html += '<div class="transition-matrix-container">';
  html += '<div class="markov-section-title">Correct Transition Matrix</div>';
  html += generateStaticMatrix(
    corpus.transition_matrix,
    corpus.pos,
    corpus.pos,
    "transition-answer"
  );
  html += "</div>";

  document.getElementById("markov-answers").innerHTML = html;
}

function showHint() {
  let hint = "";
  if (currentCorpusKey === "corpus1") {
    hint = `<div class="markov-hint">
        <div class="markov-section-title">Hint for: The quick brown fox jumps over the lazy dog in the park.</div>
        <ul>
          <li>Count how many times each word appears with each POS tag in the sentence.</li>
          <li>For emission: P(word | POS) = count(word, POS) / count(POS) in this sentence.</li>
          <li>For transition: P(POS<sub>i</sub> | POS<sub>i-1</sub>) = count(POS<sub>i-1</sub>, POS<sub>i</sub>) / count(POS<sub>i-1</sub>).</li>
          <li>Example: How often does 'fox' appear as a noun? How often does 'the' precede an adjective?</li>
        </ul>
        </div>`;
  } else if (currentCorpusKey === "corpus2") {
    hint = `<div class="markov-hint">
        <div class="markov-section-title">Hint for: A group of students are reading books quietly in the library.</div>
        <ul>
          <li>Identify the POS tags for each word in the sentence.</li>
          <li>Emission: For each POS, count the words it generates.</li>
          <li>Transition: For each POS, count what POS comes next.</li>
          <li>Example: How often does 'reading' appear as a verb? What POS follows 'are'?</li>
        </ul>
        </div>`;
  } else if (currentCorpusKey === "corpus3") {
    hint = `<div class="markov-hint">
        <div class="markov-section-title">Hint for: During the summer holidays, children play football every evening near the river.</div>
        <ul>
          <li>Break the sentence into words and assign POS tags.</li>
          <li>Emission: Calculate the probability of each word given its POS.</li>
          <li>Transition: Calculate the probability of each POS following another.</li>
          <li>Example: How often does 'children' appear as a noun? What POS follows 'every'?</li>
        </ul>
        </div>`;
  }
  document.getElementById("markov-answers").innerHTML = hint;
}

function resetSimulation() {
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
  loadCorpus(currentCorpusKey);
});
