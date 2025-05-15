let score = 0;
let round = 0;
const maxRounds = 10;
let failedWords = [];
let isExtraRound = false;
let extraRoundScore = 0;
let finalFailedWords = [];

function getEnabledUnits() {
    const enabledUnits = [];
    if (document.getElementById('unit1Toggle').checked) enabledUnits.push(1);
    if (document.getElementById('unit2Toggle').checked) enabledUnits.push(2);
    if (document.getElementById('unit3Toggle').checked) enabledUnits.push(3);
    return enabledUnits;
}

function getFilteredWordList() {
    const enabledUnits = getEnabledUnits();
    return wordList.filter(word => enabledUnits.includes(word.unit));
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startRound() {
    if (round >= maxRounds) {
        if (!isExtraRound && failedWords.length > 0) {
            // Start extra rounds with failed words
            isExtraRound = true;
            round = 0;
            document.getElementById('game').style.display = 'block';
            document.getElementById('game-over').style.display = 'none';
            startExtraRound();
            return;
        } else {
            document.getElementById('game').style.display = 'none';
            document.getElementById('game-over').style.display = 'block';
            displayFinalScore();
            return;
        }
    }

    document.getElementById('score').textContent = `${score} נקודות`;
    document.getElementById('rounds-left').textContent = `עוד ${maxRounds - round} סיבובים`;

    // Get filtered word list based on enabled units
    const filteredWordList = getFilteredWordList();
    /*
    if (filteredWordList.length === 0) {
        alert('אנא בחר לפחות יחידה אחת');
        return;
    }
    */

    // Select a random word from filtered list
    const wordIndex = Math.floor(Math.random() * filteredWordList.length);
    const currentWord = filteredWordList[wordIndex];
    document.getElementById('word').textContent = currentWord.word;
    document.getElementById('unit').textContent = `(מיחידה ${currentWord.unit})`;

    // Prepare descriptions: one correct + 9 random incorrect
    let descriptions = filteredWordList.filter((_, i) => i !== wordIndex).map(item => item.description);
    descriptions = shuffle(descriptions).slice(0, 9);
    descriptions.push(currentWord.description);
    descriptions = shuffle(descriptions);

    const descriptionsDiv = document.getElementById('descriptions');
    descriptionsDiv.innerHTML = '';

    descriptions.forEach(desc => {
        const div = document.createElement('div');
        div.textContent = desc;
        div.className = 'description';
        div.onclick = () => handleClick(div, desc, currentWord.description);
        descriptionsDiv.appendChild(div);
    });

    // Show descriptions based on toggle state
    const delayToggle = document.getElementById('delayToggle');
    if (delayToggle.checked) {
        setTimeout(() => {
            const descriptionElements = descriptionsDiv.getElementsByClassName('description');
            for (let element of descriptionElements) {
                element.classList.add('visible');
            }
        }, 3000);
    } else {
        const descriptionElements = descriptionsDiv.getElementsByClassName('description');
        for (let element of descriptionElements) {
            element.classList.add('visible');
        }
    }
}

function startExtraRound() {
    if (round >= failedWords.length) {
        document.getElementById('game').style.display = 'none';
        document.getElementById('game-over').style.display = 'block';
        displayFinalScore();
        return;
    }

    document.getElementById('score').textContent = `${extraRoundScore} נקודות (סיבובי תיקון)`;
    document.getElementById('rounds-left').textContent = `עוד ${failedWords.length - round} סיבובים`;

    const currentWord = failedWords[round];
    document.getElementById('word').textContent = currentWord.word;
    document.getElementById('unit').textContent = `(מיחידה ${currentWord.unit})`;

    // Get filtered word list for incorrect options
    const filteredWordList = getFilteredWordList();
    
    // Prepare descriptions: one correct + 9 random incorrect
    let descriptions = filteredWordList.filter(item => item.word !== currentWord.word).map(item => item.description);
    descriptions = shuffle(descriptions).slice(0, 9);
    descriptions.push(currentWord.description);
    descriptions = shuffle(descriptions);

    const descriptionsDiv = document.getElementById('descriptions');
    descriptionsDiv.innerHTML = '';

    descriptions.forEach(desc => {
        const div = document.createElement('div');
        div.textContent = desc;
        div.className = 'description';
        div.onclick = () => handleExtraRoundClick(div, desc, currentWord.description);
        descriptionsDiv.appendChild(div);
    });

    // Show descriptions based on toggle state
    const delayToggle = document.getElementById('delayToggle');
    if (delayToggle.checked) {
        setTimeout(() => {
            const descriptionElements = descriptionsDiv.getElementsByClassName('description');
            for (let element of descriptionElements) {
                element.classList.add('visible');
            }
        }, 3000);
    } else {
        const descriptionElements = descriptionsDiv.getElementsByClassName('description');
        for (let element of descriptionElements) {
            element.classList.add('visible');
        }
    }
}

function handleClick(selectedDiv, selectedDesc, correctDesc) {
    const descriptionsDiv = document.getElementById('descriptions');
    const children = descriptionsDiv.children;

    // Disable further clicks
    for (let child of children) {
        child.onclick = null;
        if (child.textContent === correctDesc) {
            child.classList.add('correct');
        }
    }

    if (selectedDesc === correctDesc) {
        score += 2; // Regular rounds are worth 2 points
    } else {
        selectedDiv.classList.add('wrong');
        // Add the failed word to the collection
        const currentWord = wordList.find(word => word.description === correctDesc);
        if (currentWord && !failedWords.some(word => word.word === currentWord.word)) {
            failedWords.push(currentWord);
        }
    }

    round++;

    setTimeout(() => {
        startRound();
    }, selectedDesc === correctDesc ? 500 : 3000);
}

function handleExtraRoundClick(selectedDiv, selectedDesc, correctDesc) {
    const descriptionsDiv = document.getElementById('descriptions');
    const children = descriptionsDiv.children;

    // Disable further clicks
    for (let child of children) {
        child.onclick = null;
        if (child.textContent === correctDesc) {
            child.classList.add('correct');
        }
    }

    if (selectedDesc === correctDesc) {
        extraRoundScore += 1; // Extra rounds are worth 1 point
    } else {
        selectedDiv.classList.add('wrong');
        // Add to final failed words if failed in extra round
        const currentWord = failedWords[round];
        if (currentWord && !finalFailedWords.some(word => word.word === currentWord.word)) {
            finalFailedWords.push(currentWord);
        }
    }

    round++;

    setTimeout(() => {
        startExtraRound();
    }, selectedDesc === correctDesc ? 500 : 3000);
}

function displayFinalScore() {
    let failedWords = ``;
        
    if (finalFailedWords.length > 0) {
        finalFailedWords.forEach(word => {
            failedWords += `<tr><td>${word.word}</td><td>${word.description}</td></tr>`;
        });
    }

    document.getElementById('game-over-good-score').textContent = score;
    document.getElementById('game-over-extra-score').textContent = extraRoundScore;
    document.getElementById('game-over-total-score').textContent = score + extraRoundScore;
    document.getElementById('game-over-failed-words').innerHTML = failedWords;
    document.getElementById('game-over').style.display = 'block';
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for unit toggles
    const unitToggles = ['unit1Toggle', 'unit2Toggle', 'unit3Toggle'];
    unitToggles.forEach(toggleId => {
        document.getElementById(toggleId).addEventListener('change', handleUnitToggle);
    });
    
    startRound();
});

function handleUnitToggle(event) {
    const enabledUnits = getEnabledUnits();
    if (enabledUnits.length === 0) {
        // Prevent disabling the last unit
        event.target.checked = true;
        alert('חובה לבחור לפחות יחידה אחת');
    }
} 