### 1. Ambiguity in POS Tagging

**Sentence:**

> They can fish in the can.

- **Task:** Identify ambiguous words and list all possible POS tags for each.
- **Explain:** How does context help determine the correct POS sequence?

---

### 2. Emission and Transition Probabilities

**Training Corpus:**

| Sentence                                  |
| ----------------------------------------- |
| The/DET dog/NOUN barks/VERB loudly/ADV    |
| A/DET cat/NOUN sleeps/VERB peacefully/ADV |
| The/DET cat/NOUN barks/VERB               |
| Dogs/NOUN sleep/VERB                      |

**Questions:**

**A.** Calculate:

- P(dog | NOUN)
- P(cat | NOUN)

**B.** Calculate:

- P(VERB | NOUN)
- P(ADV | VERB)

**C.** Which transition is more likely:

- NOUN → VERB
- VERB → ADV?

---

### 3. Viterbi Algorithm Application

**Sentence:**

> The dog sleeps

**Probability Matrices:**

**Transition Probabilities:**

- P(NOUN | DET) = 0.8
- P(VERB | NOUN) = 0.6
- P(END | VERB) = 0.9

**Emission Probabilities:**

- P(the | DET) = 0.7
- P(dog | NOUN) = 0.4
- P(sleeps | VERB) = 0.5

**Task:**  
Show your step-by-step calculations to find the most likely POS tag sequence using the Viterbi algorithm.

---

### 4. POS Tag Ambiguity

**POS-tagged Sentences:**

<pre>
Sentence 1: I/PRON will/AUX park/VERB the/DET car/NOUN
Sentence 2: The/DET park/NOUN is/VERB beautiful/ADJ
Sentence 3: Park/PROPN Avenue/PROPN is/VERB busy/ADJ
</pre>

- **Task:** Are there any words that appear with different POS tags?
- **Explain:** How does an HMM handle such ambiguities?

---

### 5. HMM Design and Probability Calculation

**Mini Tagset:**  
{DET, NOUN, VERB}

**Training Sentences:**

- The/DET boy/NOUN runs/VERB
- A/DET girl/NOUN walks/VERB
- The/DET dog/NOUN sleeps/VERB
- The/DET cat/NOUN jumps/VERB

**Tasks:**

- Calculate all transition probabilities:  
  A = {a<sub>i,j</sub>}
- Calculate all emission probabilities for the word "the"
- Calculate initial state probabilities:  
  π = {π<sub>i</sub>}

---
