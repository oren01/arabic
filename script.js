let score = 0;
let round = 0;
const maxRounds = 10;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startRound() {
    if (round >= maxRounds) {
        document.getElementById('game').style.display = 'none';
        document.getElementById('game-over').style.display = 'block';
        document.getElementById('game-over').textContent = `המשחק נגמר! הציון הסופי שלך הוא ${score} מתוך ${maxRounds}.`;
        return;
    }

    document.getElementById('score').textContent = `${score} נקודות`;
    document.getElementById('rounds-left').textContent = `עוד ${maxRounds - round} סיבובים`;

    // Select a random word
    const wordIndex = Math.floor(Math.random() * wordList.length);
    const currentWord = wordList[wordIndex];
    document.getElementById('word').textContent = currentWord.word;
    document.getElementById('unit').textContent = `(מיחידה ${currentWord.unit})`;

    // Prepare descriptions: one correct + 9 random incorrect
    let descriptions = wordList.filter((_, i) => i !== wordIndex).map(item => item.description);
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
        score++;
    } else {
        selectedDiv.classList.add('wrong');
    }

    round++;

    setTimeout(() => {
        startRound();
    }, selectedDesc === correctDesc ? 500 : 3000);
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', startRound); 