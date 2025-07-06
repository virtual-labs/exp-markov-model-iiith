// HMM Experiment JavaScript Functions

// Global variables
let currentCorpus = null;
let flag_chk_emission = 1;
let flag_chk_transmission = 1;

// Calculator function to evaluate mathematical expressions
function calculator(str) {
    try {
        // Replace common mathematical operations
        str = str.replace(/\s/g, ''); // Remove spaces
        return eval(str);
    } catch (e) {
        return null;
    }
}

// Format corpus text for display
function formatCorpusText(text) {
    const words = text.split(' ');
    let formatted = '';
    words.forEach(word => {
        if (word === 'EOS/eos') {
            formatted += word + ' ';
        } else {
            const parts = word.split('/');
            if (parts.length === 2) {
                formatted += '<b>' + parts[0] + '</b>/' + parts[1] + ' ';
            } else {
                formatted += word + ' ';
            }
        }
    });
    return formatted;
}

// Generate corpus selection dropdown
function generateCorpusDropdown() {
    const select = document.querySelector('select[name="options"]');
    select.innerHTML = '<option selected="selected" value="null_null">---Select Corpus---</option>';
    
    let count = 'A';
    Object.keys(corpusData).forEach(corpusKey => {
        const corpus = corpusData[corpusKey];
        const formattedText = formatCorpusText(corpus.text);
        const option = document.createElement('option');
        option.value = formattedText + '_' + corpusKey;
        option.textContent = 'Corpus ' + count;
        select.appendChild(option);
        count = String.fromCharCode(count.charCodeAt(0) + 1);
    });
}

// Get option function (replaces PHP getOption)
function getOption(temp) {
    const temp1 = temp.split("_");
    const text = temp1[0];
    const corp = temp1[1];
    
    document.getElementById("corpus").innerHTML = "";
    document.getElementById("fldiv").innerHTML = "";
    
    if (text === 'null' && corp === 'null') {
        alert('Select corpus');
        return;
    }
    
    document.getElementById("corpus").innerHTML = "<br>" + text + "<br>";
    loadExperiment(corp);
}

// Load experiment matrices
function loadExperiment(corpusName) {
    if (!corpusData[corpusName]) {
        console.error('Corpus not found:', corpusName);
        return;
    }
    
    currentCorpus = corpusData[corpusName];
    const fldiv = document.getElementById('fldiv');
    
    // Generate emission matrix
    let emissionHTML = generateEmissionMatrix(currentCorpus, false);
    
    // Generate transition matrix
    let transitionHTML = generateTransitionMatrix(currentCorpus, false);
    
    // Add check button
    const checkButton = '<br/><br/><button onclick="checkValue(\'' + corpusName + '\',\'' + currentCorpus.words.length + '\',\'' + currentCorpus.pos.length + '\');">Check</button>';
    
    fldiv.innerHTML = emissionHTML + transitionHTML + checkButton;
}

// Generate emission matrix HTML
function generateEmissionMatrix(corpus, showAnswers = false) {
    let html = '<table style="background-color:#FFD4A8; padding:0px; margin:0px">';
    html += '<tr><th>Emission Matrix</th></tr><tr><td align="center">';
    html += '<table width="100%" style="padding:0px; margin:0px"><tr><td></td>';
    
    // Header row with words
    corpus.words.forEach(word => {
        html += '<td align="center"><b>' + word + '</b></td>';
    });
    html += '</tr>';
    
    // Matrix rows
    for (let i = 1; i < corpus.pos.length; i++) { // Skip 'eos' for emission matrix
        const pos = corpus.pos[i];
        html += '<tr><td align="center"><b>' + pos + '</b></td>';
        
        for (let j = 0; j < corpus.words.length; j++) {
            const index = (i - 1) * corpus.words.length + j;
            const correctValue = corpus.emission_matrix[index];
            
            if (showAnswers) {
                html += '<td align="center">' + correctValue + '</td>';
            } else {
                const inputId = 'e' + index;
                html += '<td align="center"><input type="text" name="' + inputId + '" id="' + inputId + '" onclick="change();" style="width:30px" value="0" align="center" /></td>';
            }
        }
        html += '</tr>';
    }
    
    html += '</table></td></tr></table><br/><br/><br/>';
    return html;
}

// Generate transition matrix HTML
function generateTransitionMatrix(corpus, showAnswers = false) {
    let html = '<table style="background-color:#FFD4A8; padding:0px; margin:0px">';
    html += '<tr><th>Transition Matrix</th></tr><tr><td align="center">';
    html += '<table width="100%" style="padding:0px; margin:0px"><tr><td></td>';
    
    // Header row with POS tags
    corpus.pos.forEach(pos => {
        html += '<td align="center"><b>' + pos + '</b></td>';
    });
    html += '</tr>';
    
    // Matrix rows
    for (let i = 0; i < corpus.pos.length; i++) {
        const pos = corpus.pos[i];
        html += '<tr><td align="center"><b>' + pos + '</b></td>';
        
        for (let j = 0; j < corpus.pos.length; j++) {
            const index = i * corpus.pos.length + j;
            const correctValue = corpus.transmission_matrix[index];
            
            if (showAnswers) {
                html += '<td align="center">' + correctValue + '</td>';
            } else {
                const inputId = 't' + index;
                html += '<td align="center"><input type="text" name="' + inputId + '" id="' + inputId + '" onclick="change();" style="width:30px" value="0" align="center" /></td>';
            }
        }
        html += '</tr>';
    }
    
    html += '</table></td></tr></table>';
    return html;
}

// Check values function
function checkValue(corpus, wordSize, posSize) {
    if (!currentCorpus) {
        alert('Please select a corpus first');
        return false;
    }
    
    flag_chk_emission = 1;
    flag_chk_transmission = 1;
    
    // Check emission matrix
    for (let i = 0; i < wordSize * (posSize - 1); i++) {
        const input = document.getElementById('e' + i);
        if (input) {
            const userValue = input.value.replace(/\s/g, '');
            const correctValue = currentCorpus.emission_matrix[i];
            
            const calculatedValue = calculator(userValue);
            if (calculatedValue === null || Math.abs(calculatedValue - correctValue) > 0.01) {
                input.style.backgroundColor = '#FF0000';
                flag_chk_emission = 0;
            } else {
                input.style.backgroundColor = '';
                input.value = calculatedValue.toFixed(2);
            }
        }
    }
    
    // Check transition matrix
    for (let i = 0; i < posSize * posSize; i++) {
        const input = document.getElementById('t' + i);
        if (input) {
            const userValue = input.value.replace(/\s/g, '');
            const correctValue = currentCorpus.transmission_matrix[i];
            
            const calculatedValue = calculator(userValue);
            if (calculatedValue === null || Math.abs(calculatedValue - correctValue) > 0.01) {
                input.style.backgroundColor = '#FF0000';
                flag_chk_transmission = 0;
            } else {
                input.style.backgroundColor = '';
                input.value = calculatedValue.toFixed(2);
            }
        }
    }
    
    // Display results
    displayResults();
    
    return false;
}

// Display validation results
function displayResults() {
    const rightWrongDiv = document.getElementById('right_wrong');
    const getHideDiv = document.getElementById('get_hide');
    const answerDiv = document.getElementById('answer');
    
    if (!rightWrongDiv) {
        // Create result elements if they don't exist
        const fldiv = document.getElementById('fldiv');
        fldiv.innerHTML += '<br/><br/><p id="right_wrong" style="text-align:center;font-size:30px;"></p>';
        fldiv.innerHTML += '<br/><br/><div id="get_hide"></div>';
        fldiv.innerHTML += '<br/><br/><div align="center" id="answer"></div>';
    }
    
    if (flag_chk_emission === 1 && flag_chk_transmission === 1) {
        document.getElementById('right_wrong').innerHTML = '<span style="color:#008000">Right answer!!!</span>';
        document.getElementById('get_hide').innerHTML = '';
        document.getElementById('answer').innerHTML = '';
    } else if (flag_chk_emission === 0 && flag_chk_transmission === 0) {
        document.getElementById('right_wrong').innerHTML = '<span style="color:#FF0000">Wrong Emission and Transition Matrix!!!</span>';
        document.getElementById('get_hide').innerHTML = '<button onclick="getAnswer(\'0\',\'0\');">Get Answers</button>';
    } else if (flag_chk_emission === 0) {
        document.getElementById('right_wrong').innerHTML = '<span style="color:#FF0000">Wrong Emission Matrix!!!</span>';
        document.getElementById('get_hide').innerHTML = '<button onclick="getAnswer(\'0\',\'1\');">Get Answers</button>';
    } else if (flag_chk_transmission === 0) {
        document.getElementById('right_wrong').innerHTML = '<span style="color:#FF0000">Wrong Transition Matrix!!!</span>';
        document.getElementById('get_hide').innerHTML = '<button onclick="getAnswer(\'1\',\'0\');">Get Answers</button>';
    }
}

// Get answer function
function getAnswer(flag_emission, flag_transmission) {
    document.getElementById("get_hide").innerHTML = '<button onclick="hideAnswer(\'' + flag_emission + '\',\'' + flag_transmission + '\');">Hide Answers</button>';
    
    let answerHTML = '';
    
    if (flag_emission === '0') {
        answerHTML += generateEmissionMatrix(currentCorpus, true);
    }
    
    if (flag_transmission === '0') {
        answerHTML += generateTransitionMatrix(currentCorpus, true);
    }
    
    document.getElementById('answer').innerHTML = answerHTML;
}

// Hide answer function
function hideAnswer(flag_emission, flag_transmission) {
    document.getElementById("get_hide").innerHTML = '<button onclick="getAnswer(\'' + flag_emission + '\',\'' + flag_transmission + '\');">Get Answers</button>';
    document.getElementById("answer").innerHTML = "";
}

// Change function to clear previous results
function change() {
    const rightWrong = document.getElementById('right_wrong');
    const getHide = document.getElementById('get_hide');
    const answer = document.getElementById('answer');
    
    if (rightWrong) rightWrong.innerHTML = "";
    if (getHide) getHide.innerHTML = "";
    if (answer) answer.innerHTML = "";
}

// Initialize the experiment when page loads
document.addEventListener('DOMContentLoaded', function() {
    generateCorpusDropdown();
});
