Part-of-Speech (POS) tagging is a fundamental task in Natural Language Processing that assigns grammatical categories to words in a sentence. Hidden Markov Models provide a probabilistic framework for this sequential labeling problem.

---

#### 1. Part-of-Speech Tagging

POS tagging involves assigning grammatical labels (noun, verb, adjective, etc.) to words based on their context and usage in a sentence.

#### Example: Contextual Ambiguity

The word "park" can have different POS tags depending on context:

- **"The boy is playing in the **park**."** → park/NOUN
- **"**Park** the car here."** → park/VERB
- **"We visited **Park** Avenue."** → Park/PROPER_NOUN

---

#### 2. Hidden Markov Model Framework

An HMM for POS tagging treats the problem as a sequence labeling task where:

- **Hidden States**: POS tags (NOUN, VERB, ADJ, DET, etc.)
- **Observations**: Words in the sentence
- **Goal**: Find the most likely sequence of tags for a given sentence

---

#### 3. HMM Components

#### **Transition Probabilities (A)**

The probability of moving from one POS tag to another:

**A = {a<sub>i,j</sub> = P(tag<sub>j</sub> | tag<sub>i</sub>)}**

Example: P(NOUN | DET) = 0.7 (high probability that a noun follows a determiner)

#### **Emission Probabilities (B)**

The probability of observing a word given a POS tag:

**B = {b<sub>i,k</sub> = P(word<sub>k</sub> | tag<sub>i</sub>)}**

Example: P("the" | DET) = 0.6 (high probability that "the" is a determiner)

#### **Initial State Distribution (π)**

The probability distribution over starting POS tags:

**π = {π<sub>i</sub> = P(tag<sub>1</sub> = i)}**

---

#### 4. Training the HMM

#### **From Annotated Corpus**

Given a corpus with words tagged with their POS labels:

<pre>
They/PRON cut/VERB the/DET paper/NOUN ./PUNCT
He/PRON asked/VERB for/PREP his/PRON cut/NOUN ./PUNCT
</pre>

#### **Calculating Emission Probabilities**

For word "cut":

- count(cut, VERB) = 1
- count(cut, NOUN) = 1
- count(VERB) = 2

**P(cut | VERB) = count(cut, VERB) / count(VERB) = 1/2 = 0.5**

#### **Calculating Transition Probabilities**

For tag sequence "VERB → DET":

- count(VERB, DET) = 1
- count(VERB) = 2

**P(DET | VERB) = count(VERB, DET) / count(VERB) = 1/2 = 0.5**

---

#### 5. The Viterbi Algorithm

The Viterbi algorithm finds the most likely sequence of POS tags using dynamic programming.

#### **Algorithm Steps**

1. **Initialization**: Calculate initial probabilities for first word
2. **Forward Pass**: For each word, find best path to each possible tag
3. **Backtracking**: Trace back the optimal path

#### **Mathematical Formulation**

**δ<sub>t</sub>(i)** = probability of best path ending in state i at time t

<pre>
δ₁(i) = π(i) × P(word₁ | tag_i)
δₜ(j) = max[δₜ₋₁(i) × P(tag_j | tag_i)] × P(wordₜ | tag_j)
</pre>

---

#### 6. Key Assumptions

#### **Markov Assumption**

Current tag depends only on the previous tag, not the entire history.

#### **Independence Assumption**

Word emission depends only on the current tag, not on other words or tags.

---

#### 7. Practical Applications

- **Text Processing**: Preprocessing for parsing and information extraction
- **Machine Translation**: Understanding grammatical structure for translation
- **Information Retrieval**: Improving search through grammatical analysis
- **Speech Recognition**: Disambiguating spoken words with multiple meanings

---

#### 8. Advantages and Limitations

#### **Advantages**

- Handles ambiguous words through context
- Trainable from annotated data
- Efficient computation with Viterbi algorithm

#### **Limitations**

- Limited to bigram dependencies
- Assumes independence of word emissions
- Requires sufficient training data for accuracy
