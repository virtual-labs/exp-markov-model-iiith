// Corpus data for HMM experiment
const corpusData = {
    corpus1: {
        text: "EOS/eos Book/verb a/determiner car/noun EOS/eos Park/verb the/determiner car/noun EOS/eos The/determiner book/noun is/verb in/preposition the/determiner car/noun EOS/eos The/determiner car/noun is/verb in/preposition a/determiner park/noun EOS/eos",
        words: ["book", "park", "car", "is", "in", "a", "the"],
        pos: ["eos", "determiner", "noun", "verb", "preposition"],
        emission_matrix: [
            0, 0, 0, 0, 0, 1, 1,
            0.5, 0.5, 1, 0, 0, 0, 0,
            0.5, 0.5, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0
        ],
        transmission_matrix: [
            0, 0.33, 0, 0.5, 0,
            0, 0, 1, 0, 0,
            1, 0, 0, 0.5, 0,
            0, 0.33, 0, 0, 1,
            0, 0.33, 0, 0, 0
        ]
    },
    corpus2: {
        text: "EOS/eos Book/verb a/determiner car/noun EOS/eos Park/verb a/determiner car/noun EOS/eos The/determiner book/noun is/verb in/preposition the/determiner car/noun EOS/eos The/determiner car/noun is/verb in/preposition a/determiner park/noun EOS/eos",
        words: ["book", "park", "car", "is", "in", "a", "the"],
        pos: ["eos", "determiner", "noun", "verb", "preposition"],
        emission_matrix: [
            0, 0, 0, 0, 0, 1, 1,
            0.5, 0.5, 1, 0, 0, 0, 0,
            0.5, 0.5, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0
        ],
        transmission_matrix: [
            0, 0.33, 0, 0.5, 0,
            0, 0, 1, 0, 0,
            1, 0, 0, 0.5, 0,
            0, 0.33, 0, 0, 1,
            0, 0.33, 0, 0, 0
        ]
    },
    corpus3: {
        text: "EOS/eos Book/verb the/determiner car/noun EOS/eos Park/verb the/determiner car/noun EOS/eos The/determiner book/noun is/verb in/preposition the/determiner car/noun EOS/eos The/determiner car/noun is/verb in/preposition a/determiner park/noun EOS/eos",
        words: ["book", "park", "car", "is", "in", "a", "the"],
        pos: ["eos", "determiner", "noun", "verb", "preposition"],
        emission_matrix: [
            0, 0, 0, 0, 0, 1, 1,
            0.5, 0.5, 1, 0, 0, 0, 0,
            0.5, 0.5, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0
        ],
        transmission_matrix: [
            0, 0.33, 0, 0.5, 0,
            0, 0, 1, 0, 0,
            1, 0, 0, 0.5, 0,
            0, 0.33, 0, 0, 1,
            0, 0.33, 0, 0, 0
        ]
    }
}; 