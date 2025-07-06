// Corpus data for HMM experiment
const corpusData = {
    corpus1: {
        text: "The/DET quick/ADJ brown/ADJ fox/NOUN jumps/VERB over/ADP the/DET lazy/ADJ dog/NOUN in/ADP the/DET park/NOUN ./.",
        words: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog", "in", "park", "."],
        pos: ["DET", "ADJ", "NOUN", "VERB", "ADP", "."],
       // Emission: ADJ, NOUN, VERB, ADP, .
emission_matrix: [
    // DET
    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
    // ADJ
    0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0,
    // NOUN
    0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0,
    // VERB
    0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
    // ADP
    0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0,
    // .
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1
  ],
  // Transition: 6x6 (DET, ADJ, NOUN, VERB, ADP, .)
  transition_matrix: [
    // From DET
    0, 1, 0, 0, 0, 0,
    // From ADJ
    0, 0, 1, 0, 0, 0,
    // From NOUN
    0, 0, 0, 1, 0, 0,
    // From VERB
    0, 0, 0, 0, 1, 0,
    // From ADP
    1, 0, 0, 0, 0, 0,
    // From .
    0, 0, 0, 0, 0, 1
  ],
    },
    corpus2: {
        text: "A/DET group/NOUN of/ADP students/NOUN are/VERB reading/VERB books/NOUN quietly/ADV in/ADP the/DET library/NOUN ./.",
        words: ["A", "group", "of", "students", "are", "reading", "books", "quietly", "in", "the", "library", "."],
        pos: ["DET", "NOUN", "ADP", "VERB", "ADV", "."],
        // Emission: NOUN, ADP, VERB, ADV, .
emission_matrix: [
    // DET
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
    // NOUN
    0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0,
    // ADP
    0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0,
    // VERB
    0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0,
    // ADV
    0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
    // .
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1
  ],
  // Transition: 6x6 (DET, NOUN, ADP, VERB, ADV, .)
  transition_matrix: [
    // From DET
    0, 1, 0, 0, 0, 0,
    // From NOUN
    0, 0, 1, 0, 0, 0,
    // From ADP
    0, 1, 0, 0, 0, 0,
    // From VERB
    0, 0, 0, 0, 1, 0,
    // From ADV
    0, 0, 0, 0, 0, 1,
    // From .
    0, 0, 0, 1, 0, 0
  ],
    },
    corpus3: {
        text: "During/ADP the/DET summer/NOUN holidays/NOUN ,/, children/NOUN play/VERB football/NOUN every/DET evening/NOUN near/ADP the/DET river/NOUN ./.",
        words: ["During", "the", "summer", "holidays", ",", "children", "play", "football", "every", "evening", "near", "river", "."],
        pos: ["ADP", "DET", "NOUN", "VERB", ",", "."],
        // Emission: DET, NOUN, VERB, ,, .
emission_matrix: [
    // ADP
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
    // DET
    0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
    // NOUN
    0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
    // VERB
    0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
    // ,
    0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    // .
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1
  ],
  // Transition: 6x6 (ADP, DET, NOUN, VERB, ,, .)
  transition_matrix: [
    // From ADP
    0, 1, 0, 0, 0, 0,
    // From DET
    0, 0, 1, 0, 0, 0,
    // From NOUN
    0, 0, 0, 1, 1, 0,
    // From VERB
    0, 0, 0, 0, 0, 1,
    // From ,
    0, 1, 0, 0, 0, 0,
    // From .
    0, 0, 1, 0, 0, 0
  ],
    }
};