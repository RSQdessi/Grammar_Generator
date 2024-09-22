let ans = [];
let G = {};

const defaultData = {
    VT: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "-"],
    VN: ["S", "T", "F"],
    P: {
        "S": ["T", "+T", "-T"],
        "T": ["F", "TF"],
        "F": ["0", "1", "2"]
    },
    S: "S"
};

document.getElementById("leftBorder").addEventListener("input", function () {
    document.getElementById("leftValue").textContent = this.value;
});

document.getElementById("rightBorder").addEventListener("input", function () {
    document.getElementById("rightValue").textContent = this.value;
});

function parseInputData() {
    const terminals = document.getElementById("terminals").value.trim().split(/\s+/).filter(Boolean);
    const nonterminals = document.getElementById("nonterminals").value.trim().split(/\s+/).filter(Boolean);
    const rulesInput = document.getElementById("rules").value.split("\n").map(rule => rule.trim()).filter(Boolean);
    const startSymbol = document.getElementById("startSymbol").value.trim();

    if (!terminals.length || !nonterminals.length || !rulesInput.length || !startSymbol) {
        throw new Error("All fields must be filled in!");
    }

    const P = {};
    rulesInput.forEach(rule => {
        const parts = rule.split("->");
        if (parts.length !== 2) {
            throw new Error("Invalid rule format. Use 'A -> B, C'");
        }

        const left = parts[0].trim();
        const right = parts[1].trim().split(",").map(r => r.trim());

        if (!nonterminals.includes(left)) {
            throw new Error(`Non-terminal '${left}' is not defined in non-terminals`);
        }

        if (!right || right.length === 0) {
            throw new Error(`Invalid rule for non-terminal '${left}'`);
        }

        P[left] = right;
    });

    if (!nonterminals.includes(startSymbol)) {
        throw new Error("Start symbol is not a valid non-terminal");
    }

    return { VT: terminals, VN: nonterminals, P: P, S: startSymbol };
}

function makeChains(G, leftBorder, rightBorder) {
const stack = [[G.S, []]]; 
const wasInStack = new Set();
let ans = [];

console.log("Starting with initial stack:", stack);

while (stack.length > 0) {
    let [sequence, path] = stack.pop();
    if (sequence === undefined) {
        continue;
    }

    if (wasInStack.has(sequence)) {
        continue;
    }
    wasInStack.add(sequence);

    let onlyTerm = true;
    for (let i = 0; i < sequence.length; i++) {
        const symbol = sequence[i];

        if (!G.VN.includes(symbol)) continue;

        onlyTerm = false;

        for (const elem of G.P[symbol]) {
            const newSeq = sequence.slice(0, i) + elem + sequence.slice(i + 1);
            const newPath = [...path, sequence]; 
            if (newSeq.length <= rightBorder + 3) {
                stack.push([newSeq, newPath]);
            }
        }
    }

    if (onlyTerm) {
        if (leftBorder <= sequence.length && sequence.length <= rightBorder) {
            ans.push([...path, sequence].join(" -> ")); 
        }
    }
}

console.log("Final sequences:", ans);

return ans;
}

function useDefaultGrammar() {
    const leftBorder = parseInt(document.getElementById("leftBorder").value);
    const rightBorder = parseInt(document.getElementById("rightBorder").value);
    G = defaultData; 

    try {
        ans = makeChains(G, leftBorder, rightBorder);
        document.getElementById("output").textContent = ans.join("\n");
        populateChainSelect(); 
    } catch (error) {
        document.getElementById("output").textContent = error.message;
    }
}

function useInputGrammar() {
    const leftBorder = parseInt(document.getElementById("leftBorder").value);
    const rightBorder = parseInt(document.getElementById("rightBorder").value);

    try {
        G = parseInputData(); 
        ans = makeChains(G, leftBorder, rightBorder);
        document.getElementById("output").textContent = ans.join("\n");
        populateChainSelect(); 
    } catch (error) {
        document.getElementById("output").textContent = error.message;
    }
}


document.getElementById('generateTree').addEventListener('click', () => {
const select = document.getElementById('chainSelect');
const selectedChainIndex = parseInt(select.value);
const selectedChain = ans[selectedChainIndex];


const treeOutput = document.getElementById('treeOutput');
treeOutput.innerHTML = ''; 

if (selectedChain) {
    const path = selectedChain.split(" -> ");
    const parseTree = buildParseTree(path, G); 
    drawTree(parseTree); 
} else {
    console.error("Выбранная цепочка не существует.");
}
});



function buildParseTree(sequence, G) {
const tree = [];

for (const step of sequence) {
    const stepInfo = [];

    for (const symbol of step) {
        if (G.VN.includes(symbol)) { 
            const possibleRules = G.P[symbol]; 
            const appliedRule = step; 
            stepInfo.push({ symbol, appliedRule, possibleRules });
        } else {
            stepInfo.push({ symbol, appliedRule: "", possibleRules: [] }); 
        }
    }

    tree.push(stepInfo);
}

return tree;
}

function drawTree(tree) {
const treeOutput = document.getElementById('treeOutput');
treeOutput.innerHTML = ''; 

tree.forEach((step, i) => {
    step.forEach(({ symbol, appliedRule, possibleRules }) => {
        if (appliedRule) {
            const rulesText = possibleRules.join(', ');
            treeOutput.innerHTML += `<div>Шаг ${i + 1}: ${symbol} -> ${appliedRule}. Возможные правила: ${rulesText}</div>`;
        } else {
            treeOutput.innerHTML += `<div>Шаг ${i + 1}: ${symbol}</div>`;
        }
    });
});
}

function populateChainSelect() {
    const select = document.getElementById('chainSelect');
    select.innerHTML = ''; 
    ans.forEach((chain, index) => {
        const option = document.createElement('option');
        option.value = index; 
        option.textContent = chain; 
        select.appendChild(option);
    });
}
