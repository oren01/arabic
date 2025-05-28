let score = 0;
let round = 0;
let maxRounds = 10;
let failedWords = [];
let isExtraRound = false;
let extraRoundScore = 0;
let finalFailedWords = [];
let showDescriptionsTimeout = null;
let skipWaitingListener = null;

function getEnabledUnits() {
    const enabledUnits = [];
    if (document.getElementById('unit1Toggle').checked) enabledUnits.push(1);
    if (document.getElementById('unit2Toggle').checked) enabledUnits.push(2);
    if (document.getElementById('unit3Toggle').checked) enabledUnits.push(3);
    if (document.getElementById('unit4Toggle').checked) enabledUnits.push(4);
    if (document.getElementById('unit5Toggle').checked) enabledUnits.push(5);
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

function animateProgressBar(duration) {
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const secondsLeft = document.getElementById('seconds-left');
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    let start = null;
    function step(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const percent = Math.min((elapsed / duration) * 100, 100);
        progressBar.style.width = percent + '%';
        
        // Update seconds display
        const remainingSeconds = Math.ceil((duration - elapsed) / 1000);
        secondsLeft.textContent = `${remainingSeconds} שניות`;
        
        if (elapsed < duration) {
            requestAnimationFrame(step);
        } else {
            progressBar.style.width = '100%';
            secondsLeft.textContent = '0 שניות';
        }
    }
    requestAnimationFrame(step);
}

function hideProgressBar() {
    const progressContainer = document.getElementById('progress-container');
    const secondsLeft = document.getElementById('seconds-left');
    progressContainer.style.display = 'none';
    secondsLeft.textContent = '';
}

function showDescriptionsImmediately(descriptionsDiv) {
    if (showDescriptionsTimeout) {
        clearTimeout(showDescriptionsTimeout);
        showDescriptionsTimeout = null;
    }
    hideProgressBar();
    const descriptionElements = descriptionsDiv.getElementsByClassName('description');
    for (let element of descriptionElements) {
        element.classList.add('visible');
    }
    if (skipWaitingListener) {
        document.removeEventListener('click', skipWaitingListener, true);
        skipWaitingListener = null;
    }
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
    document.getElementById('unit').textContent = `(יחידה ${currentWord.unit})`;

    // Get number of answers from settings
    const numAnswers = parseInt(document.getElementById('numAnswers').value);
    
    // Prepare descriptions: one correct + (numAnswers-1) random incorrect
    let descriptions = filteredWordList.filter((_, i) => i !== wordIndex).map(item => item.description);
    descriptions = shuffle(descriptions).slice(0, numAnswers - 1);
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

    // Show descriptions based on delay setting
    const delaySeconds = parseFloat(document.getElementById('delaySeconds').value) * 1000;
    if (delaySeconds > 0) {
        animateProgressBar(delaySeconds);
        skipWaitingListener = (e) => {
            e.stopPropagation();
            showDescriptionsImmediately(descriptionsDiv);
        };
        document.addEventListener('click', skipWaitingListener, true);
        showDescriptionsTimeout = setTimeout(() => {
            showDescriptionsImmediately(descriptionsDiv);
        }, delaySeconds);
    } else {
        hideProgressBar();
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
    
    // Get number of answers from settings
    const numAnswers = parseInt(document.getElementById('numAnswers').value);
    
    // Prepare descriptions: one correct + (numAnswers-1) random incorrect
    let descriptions = filteredWordList.filter(item => item.word !== currentWord.word).map(item => item.description);
    descriptions = shuffle(descriptions).slice(0, numAnswers - 1);
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

    // Show descriptions based on delay setting
    const delaySeconds = parseFloat(document.getElementById('delaySeconds').value) * 1000;
    if (delaySeconds > 0) {
        animateProgressBar(delaySeconds);
        skipWaitingListener = (e) => {
            e.stopPropagation();
            showDescriptionsImmediately(descriptionsDiv);
        };
        document.addEventListener('click', skipWaitingListener, true);
        showDescriptionsTimeout = setTimeout(() => {
            showDescriptionsImmediately(descriptionsDiv);
        }, delaySeconds);
    } else {
        hideProgressBar();
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

function startGame() {
    // Get the number of rounds from the input
    const roundsInput = document.getElementById('rounds');
    maxRounds = parseInt(roundsInput.value);
    
    // Validate input
    if (isNaN(maxRounds) || maxRounds < 1 || maxRounds > 100) {
        alert('אנא הכנס מספר סיבובים תקין (1-100)');
        return;
    }

    // Reset game state
    score = 0;
    round = 0;
    failedWords = [];
    isExtraRound = false;
    extraRoundScore = 0;
    finalFailedWords = [];

    // Hide start page and show game
    document.getElementById('start-page').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('game-over').style.display = 'none';

    // Start the first round
    startRound();
}

function restartGame() {
    // Show start page and hide game/game over
    document.getElementById('start-page').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
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

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for unit toggles
    const unitToggles = ['unit1Toggle', 'unit2Toggle', 'unit3Toggle', 'unit4Toggle', 'unit5Toggle'];
    unitToggles.forEach(toggleId => {
        document.getElementById(toggleId).addEventListener('change', handleUnitToggle);
    });
    
    // Add event listener for start button
    document.getElementById('start-game').addEventListener('click', startGame);
    
    // Add event listener for restart button in game over screen
    const gameOverDiv = document.getElementById('game-over');
    const restartButton = document.createElement('button');
    restartButton.textContent = 'משחק חדש';
    restartButton.className = 'start-button';
    restartButton.onclick = restartGame;
    gameOverDiv.appendChild(restartButton);
});

function handleUnitToggle(event) {
    const enabledUnits = getEnabledUnits();
    if (enabledUnits.length === 0) {
        // Prevent disabling the last unit
        event.target.checked = true;
        alert('חובה לבחור לפחות יחידה אחת');
    }
} 