### Hidden Markov Models for POS Tagging

A Hidden Markov Model (HMM) is a statistical Markov model in which the system being modeled is assumed to be a Markov process with unobserved (hidden) states. In a regular Markov model, the state is directly visible to the observer, and therefore the state transition probabilities are the only parameters. In a hidden Markov model, the state is not directly visible, but output, dependent on the state, is visible.

<img src="images/hmm.jpg">

### Components of HMM for POS Tagging

In the context of POS tagging, an HMM consists of:

- **Hidden States**: The POS tags (noun, verb, adjective, determiner, etc.)
- **Observations**: The words in the sentence
- **Transition Probabilities**: The likelihood of moving from one POS tag to another
- **Emission Probabilities**: The likelihood of observing a particular word given a POS tag

### Key Components of HMM

**1. Transition Probabilities (A)**
The one-step transition probability is the probability of transitioning from one state to another in a single step. For POS tagging, this represents the probability of one POS tag following another.

A = {a<sub>i,j</sub> = P(q<sub>j</sub> | q<sub>i</sub>)}

**2. Emission Probabilities (B)**
The output probabilities for an observation from state. Emission probabilities B = {b<sub>i,k</sub> = b<sub>i</sub>(o<sub>k</sub>) = P(o<sub>k</sub> | q<sub>i</sub>)}, where o<sub>k</sub> is an observation. Informally, B is the probability that the output is o<sub>k</sub> given that the current state is q<sub>i</sub>.

**3. Initial State Distribution (π)**
The probability distribution over the initial states: π = {π<sub>i</sub> = P(q<sub>1</sub> = i)}

### Fundamental Assumptions

For POS tagging using HMMs, we make several key assumptions:

**1. First-order (bigram) Markov assumptions:**

- **Limited Horizon**: Tag depends only on previous tag

  P(t<sub>i+1</sub> = t<sub>k</sub> | t<sub>1</sub>=t<sub>j1</sub>,.....,t<sub>i</sub>=t<sub>ji</sub>) = P(t<sub>i+1</sub> = t<sub>k</sub> | t<sub>i</sub> = t<sub>j</sub>)

- **Time invariance**: No change over time

  P(t<sub>i+1</sub> = t<sub>k</sub> | t<sub>i</sub> = t<sub>j</sub>) = P(t<sub>2</sub> = t<sub>k</sub> | t<sub>1</sub> = t<sub>j</sub>) = P(t<sub>j</sub> -> t<sub>k</sub>)

**2. Output probabilities:**

- Probability of getting word w<sub>k</sub> for tag t<sub>j</sub>: P(w<sub>k</sub> | t<sub>j</sub>) is independent of other tags or words!

### Training the HMM: Calculating Probabilities

#### Consider the given toy corpus

<pre>
EOS/eos
They/pronoun
cut/verb
the/determiner
paper/noun
EOS/eos He/pronoun
asked/verb
for/preposition
his/pronoun
cut/noun.
EOS/eos
Put/verb
the/determiner
paper/noun
in/preposition
the/determiner
cut/noun
EOS/eos
</pre>

### Calculating Emission Probability Matrix

Count the number of times a specific word occurs with a specific POS tag in the corpus.

Here, for example with **"cut"**:

<pre>
count(cut,verb) = 1
count(cut,noun) = 2
count(cut,determiner) = 0
</pre>

and so on zero for other tags too.

<pre>
count(cut) = total count of cut = 3
</pre>

**Calculating the probability:**
Probability to be filled in the matrix cell at the intersection of cut and verb:

<pre>
P(cut|verb) = count(cut,verb)/count(verb) = 1/3 = 0.33
</pre>

Similarly, probability to be filled in the cell at the intersection of cut and determiner:

<pre>
P(cut|determiner) = count(cut,determiner)/count(determiner) = 0/3 = 0
</pre>

Repeat the same for all word-tag combinations and fill the emission matrix.

### Calculating Transition Probability Matrix

Count the number of times a specific tag comes after other POS tags in the corpus.

Here, for example with **"determiner"**:

<pre>
count(verb,determiner) = 2
count(preposition,determiner) = 1
count(determiner,determiner) = 0
count(eos,determiner) = 0
count(noun,determiner) = 0
</pre>

and so on zero for other tags too.

<pre>
count(determiner) = total count of tag 'determiner' = 3
</pre>

**Calculating the probability:**
Probability to be filled in the cell at the intersection of determiner(in the column) and verb(in the row):

<pre>
P(determiner|verb) = count(verb,determiner)/count(verb) = 2/3 = 0.66
</pre>

Similarly, probability to be filled in the cell at the intersection of determiner(in the column) and noun(in the row):

<pre>
P(determiner|noun) = count(noun,determiner)/count(noun) = 0/3 = 0
</pre>

Repeat the same for all the tags.

### The Viterbi Algorithm

The Viterbi algorithm is used to find the most likely sequence of POS tags for a given sentence. It uses dynamic programming to efficiently compute the best path through the HMM.

**Algorithm Steps:**

1. **Initialization**: For each state i, calculate the probability of being in state i and observing the first word
2. **Recursion**: For each subsequent word, calculate the most likely path to each state
3. **Termination**: Find the state with the highest probability at the end
4. **Backtracking**: Trace back the most likely path to get the complete tag sequence

**Mathematical Formulation:**

Let δ<sub>t</sub>(i) be the probability of the most likely path ending in state i at time t.

<pre>
δ₁(i) = πᵢ × bᵢ(o₁)
δₜ(j) = max[δₜ₋₁(i) × aᵢ,ⱼ] × bⱼ(oₜ)
</pre>

### Applications and Limitations

**Applications:**

- POS tagging in various languages
- Named Entity Recognition
- Speech recognition
- Bioinformatics sequence analysis

**Limitations:**

- Independence assumption may not hold in practice
- Limited to first-order dependencies
- Requires large amounts of training data
- Difficulty handling out-of-vocabulary words

**Note:** **EOS**/eos is a special marker which represents **_End Of Sentence_**.
