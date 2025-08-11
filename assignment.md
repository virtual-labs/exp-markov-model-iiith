**1.** Consider the sentence "They can fish in the can." Identify the ambiguous words and list all possible POS tags for each ambiguous word. Explain how context helps determine the correct POS sequence.

**2.** Given the following training corpus, calculate the emission and transition probabilities:

| Sentence                                  |
| ----------------------------------------- |
| The/DET dog/NOUN barks/VERB loudly/ADV    |
| A/DET cat/NOUN sleeps/VERB peacefully/ADV |
| The/DET cat/NOUN barks/VERB               |
| Dogs/NOUN sleep/VERB                      |

A. Calculate P(dog | NOUN) and P(cat | NOUN)

B. Calculate P(VERB | NOUN) and P(ADV | VERB)

C. Which transition is more likely: NOUN → VERB or VERB → ADV?

**3.** Apply the Viterbi algorithm to find the most likely POS tag sequence for the sentence "The dog sleeps" using these probability matrices:

**Transition Probabilities:**

- P(NOUN | DET) = 0.8
- P(VERB | NOUN) = 0.6
- P(END | VERB) = 0.9

**Emission Probabilities:**

- P(the | DET) = 0.7
- P(dog | NOUN) = 0.4
- P(sleeps | VERB) = 0.5

Show your step-by-step calculations.

**4.** Refer to the following POS-tagged sentences and answer the questions below:

    Sentence 1: I/PRON will/AUX park/VERB the/DET car/NOUN

    Sentence 2: The/DET park/NOUN is/VERB beautiful/ADJ

    Sentence 3: Park/PROPN Avenue/PROPN is/VERB busy/ADJ

Are there any words that appear with different POS tags? How does an HMM handle such ambiguities?

**5.** Design a simple HMM for the following mini-tagset and calculate the required probabilities from this training data:

**Tagset:** {DET, NOUN, VERB}

**Training sentences:**

- The/DET boy/NOUN runs/VERB
- A/DET girl/NOUN walks/VERB
- The/DET dog/NOUN sleeps/VERB
- The/DET cat/NOUN jumps/VERB

Calculate:

- All transition probabilities A = {a<sub>i,j</sub>}
- All emission probabilities for the word "the"
- Initial state probabilities π = {π<sub>i</sub>}
