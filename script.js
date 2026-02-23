// State management
let drivers = [];
let rounds = [];
let currentRound = null;
let raceStarted = false;
let showOverallStandings = false;

// DOM Elements
const addDriverInput = document.getElementById('addDriverInput');
const addDriverButton = document.getElementById('addDriverButton');
const driversList = document.getElementById('driversList');
const stageInput = document.getElementById('stageInput');
const carInput = document.getElementById('carInput');
const startRoundButton = document.getElementById('startRoundButton');
const finishRaceSection = document.getElementById('finishRaceSection');
const finishRaceButton = document.getElementById('finishRaceButton');
const timesSection = document.getElementById('timesSection');
const roundInfo = document.getElementById('roundInfo');
const timesList = document.getElementById('timesList');
const finishRoundButton = document.getElementById('finishRoundButton');
const results = document.getElementById('results');
const finalResultsModal = document.getElementById('finalResultsModal');
const finalResultsBody = document.getElementById('finalResultsBody');
const continueRaceButton = document.getElementById('continueRaceButton');
const closeModalButton = document.getElementById('closeModalButton');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderDrivers();
    renderResults();
    
    // Event listeners
    addDriverButton.addEventListener('click', addDriver);
    addDriverInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addDriver();
        }
    });
    
    startRoundButton.addEventListener('click', startRound);
    finishRoundButton.addEventListener('click', finishRound);
    finishRaceButton.addEventListener('click', finishRace);
    continueRaceButton.addEventListener('click', continueRace);
    closeModalButton.addEventListener('click', closeModal);
    
    // Allow Enter key on stage and car inputs to start round
    stageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            carInput.focus();
        }
    });
    
    carInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startRound();
        }
    });
});

// Add driver
function addDriver() {
    const name = addDriverInput.value.trim();
    
    if (name === '') {
        alert('Please enter a driver name');
        return;
    }
    
    if (drivers.includes(name)) {
        alert('Driver already exists');
        return;
    }
    
    drivers.push(name);
    addDriverInput.value = '';
    addDriverInput.focus();
    
    renderDrivers();
    saveToLocalStorage();
}

// Remove driver
function removeDriver(name) {
    if (raceStarted) {
        alert('Cannot remove drivers after race has started');
        return;
    }
    
    drivers = drivers.filter(d => d !== name);
    renderDrivers();
    saveToLocalStorage();
}

// Render drivers list
function renderDrivers() {
    driversList.innerHTML = '';
    
    drivers.forEach(driver => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${driver}</span>
            <button class="remove-btn" onclick="removeDriver('${driver}')">Remove</button>
        `;
        driversList.appendChild(li);
    });
}

// Start round
function startRound() {
    const stage = stageInput.value.trim();
    const car = carInput.value.trim();
    
    if (drivers.length === 0) {
        alert('Please add at least one driver');
        return;
    }
    
    if (stage === '' || car === '') {
        alert('Please enter both stage name and car name');
        return;
    }
    
    // Mark race as started and show finish race section
    if (!raceStarted) {
        raceStarted = true;
        finishRaceSection.classList.remove('hidden');
    }
    
    currentRound = {
        stage,
        car,
        times: {}
    };
    
    // Clear inputs
    stageInput.value = '';
    carInput.value = '';
    
    // Show times section
    timesSection.classList.remove('hidden');
    
    // Render round info
    roundInfo.innerHTML = `
        <div class="info-box">
            <div class="info-box-label">Stage</div>
            <div class="info-box-value">${stage}</div>
        </div>
        <div class="info-box">
            <div class="info-box-label">Car</div>
            <div class="info-box-value">${car}</div>
        </div>
    `;
    
    // Render time inputs
    renderTimeInputs();
    
    // Scroll to times section
    timesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Render time inputs
function renderTimeInputs() {
    timesList.innerHTML = '';
    
    drivers.forEach(driver => {
        const div = document.createElement('div');
        div.innerHTML = `
            <strong>${driver}</strong>
            <input type="text" id="time-${driver}" placeholder="00:00:000">
            <button class="dsq-btn" onclick="setDSQ('${driver}')">DSQ</button>
        `;
        timesList.appendChild(div);
        
        // Add Enter key listener to move to next input
        const input = document.getElementById(`time-${driver}`);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const allInputs = Array.from(timesList.querySelectorAll('input[type="text"]'));
                const currentIndex = allInputs.indexOf(input);
                if (currentIndex < allInputs.length - 1) {
                    allInputs[currentIndex + 1].focus();
                } else {
                    finishRound();
                }
            }
        });
    });
    
    // Focus first input
    const firstInput = document.getElementById(`time-${drivers[0]}`);
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

// Set DSQ for a driver
function setDSQ(driver) {
    const input = document.getElementById(`time-${driver}`);
    input.value = 'DSQ';
    
    // Move to next input
    const allInputs = Array.from(timesList.querySelectorAll('input[type="text"]'));
    const currentIndex = allInputs.indexOf(input);
    if (currentIndex < allInputs.length - 1) {
        allInputs[currentIndex + 1].focus();
    }
}

// Finish round
function finishRound() {
    if (!currentRound) return;
    
    let hasValidTime = false;
    
    // Collect times
    drivers.forEach(driver => {
        const input = document.getElementById(`time-${driver}`);
        const timeValue = input.value.trim();
        
        if (timeValue !== '') {
            currentRound.times[driver] = timeValue;
            hasValidTime = true;
        }
    });
    
    if (!hasValidTime) {
        alert('Please enter at least one valid time');
        return;
    }
    
    // Add round to beginning of rounds array (most recent first)
    rounds.unshift(currentRound);
    currentRound = null;
    
    // Hide times section
    timesSection.classList.add('hidden');
    
    // Render results
    renderResults();
    saveToLocalStorage();
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Delete a specific round
function deleteRound(index) {
    if (confirm('Are you sure you want to delete this round? This cannot be undone.')) {
        rounds.splice(index, 1);
        renderResults();
        saveToLocalStorage();
        
        // If no rounds left, hide finish race section
        if (rounds.length === 0) {
            raceStarted = false;
            finishRaceSection.classList.add('hidden');
        }
    }
}

// Toggle overall standings visibility
function toggleOverallStandings() {
    showOverallStandings = !showOverallStandings;
    const container = document.querySelector('.overall-standings-container');
    const button = document.querySelector('.toggle-standings-btn');
    
    if (container) {
        if (showOverallStandings) {
            container.classList.remove('hidden');
            button.textContent = 'Hide Overall Standings';
        } else {
            container.classList.add('hidden');
            button.textContent = 'Show Overall Standings';
        }
    }
}

// Finish race
function finishRace() {
    if (rounds.length === 0) {
        alert('No rounds completed yet');
        return;
    }
    
    // Calculate overall standings
    const standings = calculateOverallStandings();
    
    // Show modal with final results
    showFinalResults(standings);
}

// Continue race (close modal without resetting)
function continueRace() {
    finalResultsModal.classList.add('hidden');
}

// Calculate overall standings (DSQ = +15 minutes penalty)
function calculateOverallStandings() {
    const standings = {};
    const DSQ_PENALTY = 15 * 60 * 1000; // 15 minutes in milliseconds (900000)
    
    // Initialize standings
    drivers.forEach(driver => {
        standings[driver] = { totalTime: 0, dsqCount: 0 };
    });
    
    // Calculate total times
    rounds.forEach(round => {
        Object.keys(round.times).forEach(driver => {
            const time = round.times[driver];
            if (time === 'DSQ') {
                standings[driver].dsqCount++;
                standings[driver].totalTime += DSQ_PENALTY; // Add 15 minutes per DSQ
            } else {
                standings[driver].totalTime += parseTime(time);
            }
        });
    });
    
    // Convert to array and sort
    const standingsArray = Object.keys(standings).map(driver => ({
        driver,
        totalTime: standings[driver].totalTime,
        dsqCount: standings[driver].dsqCount,
        formattedTime: formatTimeExtended(standings[driver].totalTime)
    }));
    
    // Sort by total time (DSQ penalties already included)
    standingsArray.sort((a, b) => a.totalTime - b.totalTime);
    
    return standingsArray;
}

// Show final results modal with time differences
function showFinalResults(standings) {
    finalResultsBody.innerHTML = '';
    
    const standingsDiv = document.createElement('div');
    standingsDiv.className = 'final-standings';
    standingsDiv.innerHTML = '<h3>Final Standings</h3>';
    
    // Get first place time for calculating differences
    const firstPlaceTime = standings[0].totalTime;
    
    standings.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = `final-result-row ${getRankClass(index)}`;
        
        // Calculate time difference from first place
        let timeDiff = '';
        if (index === 0) {
            timeDiff = '(+00:00:000)';
        } else {
            const diffMs = entry.totalTime - firstPlaceTime;
            timeDiff = `(+${formatTimeExtended(diffMs)})`;
        }
        
        // Add DSQ notation if applicable
        let dsqNotation = '';
        if (entry.dsqCount > 0) {
            dsqNotation = ` <span style="color: var(--error); font-size: 0.95rem; font-weight: 600;">[${entry.dsqCount} DSQ]</span>`;
        }
        
        div.innerHTML = `
            <span class="final-result-position">${index + 1}.</span>
            <span class="final-result-name">${entry.driver}${dsqNotation}</span>
            <span class="final-result-time">
                <span class="final-result-total">${entry.formattedTime}</span>
                <span class="final-result-diff">${timeDiff}</span>
            </span>
        `;
        standingsDiv.appendChild(div);
    });
    
    finalResultsBody.appendChild(standingsDiv);
    finalResultsModal.classList.remove('hidden');
}

// Close modal and reset
function closeModal() {
    finalResultsModal.classList.add('hidden');
    
    if (confirm('Start a new race? This will clear all current data.')) {
        resetRace();
    }
}

// Reset race
function resetRace() {
    rounds = [];
    raceStarted = false;
    currentRound = null;
    showOverallStandings = false;
    timesSection.classList.add('hidden');
    finishRaceSection.classList.add('hidden');
    renderResults();
    saveToLocalStorage();
}

// Render results
function renderResults() {
    results.innerHTML = '';
    
    if (rounds.length === 0) {
        results.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No rounds completed yet. Start a round to see results!</p>';
        return;
    }
    
    // Render rounds (most recent first)
    rounds.forEach((round, index) => {
        const div = document.createElement('div');
        
        // Create round header with stage and car info
        const headerHTML = `
            <div class="round-header">
                <div class="stage-box">
                    <div class="stage-box-label">Stage</div>
                    <div class="stage-box-value">${round.stage}</div>
                </div>
                <div class="car-box">
                    <div class="car-box-label">Car</div>
                    <div class="car-box-value">${round.car}</div>
                </div>
            </div>
        `;
        
        // Sort times
        const sortedTimes = Object.keys(round.times)
            .map(driver => ({
                driver,
                time: round.times[driver],
                timeValue: round.times[driver] === 'DSQ' ? Infinity : parseTime(round.times[driver])
            }))
            .sort((a, b) => a.timeValue - b.timeValue);
        
        // Create results HTML
        let resultsHTML = '';
        sortedTimes.forEach((entry, idx) => {
            const rankClass = getRankClass(idx);
            resultsHTML += `
                <div class="result-row ${rankClass}">
                    ${idx + 1}. ${entry.driver} - ${entry.time}
                </div>
            `;
        });
        
        // Add delete button
        const deleteButton = `
            <button class="delete-round-btn" onclick="deleteRound(${index})">
                Delete This Round
            </button>
        `;
        
        div.innerHTML = headerHTML + resultsHTML + deleteButton;
        results.appendChild(div);
    });
    
    // Show overall standings (hidden by default during race)
    if (rounds.length > 1) {
        const overallDiv = document.createElement('div');
        overallDiv.className = 'overall-standings-container' + (showOverallStandings ? '' : ' hidden');
        overallDiv.style.marginTop = '24px';
        overallDiv.style.border = '3px solid var(--highlight)';
        
        const standings = calculateOverallStandings();
        const firstPlaceTime = standings[0].totalTime;
        
        let overallHTML = '<h3 style="color: var(--highlight); font-size: 1.5rem; margin-bottom: 16px;">Overall Standings</h3>';
        
        standings.forEach((entry, index) => {
            const rankClass = getRankClass(index);
            
            // Calculate time difference
            let timeDiff = '';
            if (index === 0) {
                timeDiff = ' (+00:00:000)';
            } else {
                const diffMs = entry.totalTime - firstPlaceTime;
                timeDiff = ` (+${formatTimeExtended(diffMs)})`;
            }
            
            let dsqNotation = '';
            if (entry.dsqCount > 0) {
                dsqNotation = ` <span style="color: var(--error); font-size: 0.9rem; font-weight: 600;">[${entry.dsqCount} DSQ]</span>`;
            }
            
            overallHTML += `
                <div class="results-row ${rankClass}">
                    ${index + 1}. ${entry.driver} - ${entry.formattedTime}${timeDiff}${dsqNotation}
                </div>
            `;
        });
        
        overallDiv.innerHTML = overallHTML;
        results.appendChild(overallDiv);
        
        // Add toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'toggle-standings-btn';
        toggleButton.textContent = showOverallStandings ? 'Hide Overall Standings' : 'Show Overall Standings';
        toggleButton.onclick = toggleOverallStandings;
        results.appendChild(toggleButton);
    }
}

// Get rank class for styling
function getRankClass(index) {
    if (index === 0) return 'first';
    if (index === 1) return 'second';
    if (index === 2) return 'third';
    return '';
}

// Parse time string to milliseconds (supports 00:00:000 format)
function parseTime(timeStr) {
    if (timeStr === 'DSQ') return Infinity;
    
    const parts = timeStr.split(':');
    if (parts.length === 3) {
        // Format: MM:SS:mmm
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        const milliseconds = parseInt(parts[2]) || 0;
        return (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
    } else if (parts.length === 2) {
        // Legacy format: MM:SS.ms
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseFloat(parts[1]) || 0;
        return (minutes * 60 + seconds) * 1000;
    }
    
    return parseFloat(timeStr) * 1000 || 0;
}

// Format time from milliseconds to 00:00:000
function formatTimeExtended(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor(ms % 1000);
    
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
}

// Format time from milliseconds (shorter version for display)
function formatTime(ms) {
    return formatTimeExtended(ms);
}

// Local storage
function saveToLocalStorage() {
    localStorage.setItem('rallyDrivers', JSON.stringify(drivers));
    localStorage.setItem('rallyRounds', JSON.stringify(rounds));
    localStorage.setItem('rallyRaceStarted', JSON.stringify(raceStarted));
}

function loadFromLocalStorage() {
    const savedDrivers = localStorage.getItem('rallyDrivers');
    const savedRounds = localStorage.getItem('rallyRounds');
    const savedRaceStarted = localStorage.getItem('rallyRaceStarted');
    
    if (savedDrivers) {
        drivers = JSON.parse(savedDrivers);
    }
    
    if (savedRounds) {
        rounds = JSON.parse(savedRounds);
    }
    
    if (savedRaceStarted) {
        raceStarted = JSON.parse(savedRaceStarted);
        if (raceStarted) {
            finishRaceSection.classList.remove('hidden');
        }
    }
}