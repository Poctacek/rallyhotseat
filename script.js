let drivers = [];
let rounds = [];
let currentRound = null;
let raceStarted = false;
let showOverallStandings = false;

const addDriverInput = document.getElementById('addDriverInput');
const addDriverButton = document.getElementById('addDriverButton');
const driversList = document.getElementById('driversList');
// const stageInput = document.getElementById('stageInput');
// const carInput = document.getElementById('carInput');
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


document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderDrivers();
    renderResults();
    
    document.getElementById('resetAllButton').addEventListener('click', () => {
        if (confirm('Reset everything? This will clear all drivers, rounds and data. \n This cannot be undone!')){
            drivers = [];
            resetRace();
            renderDrivers();
            saveToLocalStorage();
}
}
);
    







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

function removeDriver(name) {
    if (raceStarted) {
        alert('Cannot remove drivers after race has started');
        return;
    }
    
    drivers = drivers.filter(d => d !== name);
    renderDrivers();
    saveToLocalStorage();
}

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
    
    if (!raceStarted) {
        raceStarted = true;
        finishRaceSection.classList.remove('hidden');
    }
    
    currentRound = {
        stage,
        car,
        times: {}
    };
    
    stageInput.value = '';
    carInput.value = '';
    
    timesSection.classList.remove('hidden');
    
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
    
    renderTimeInputs();
    
    timesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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
    
    const firstInput = document.getElementById(`time-${drivers[0]}`);
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

function setDSQ(driver) {
    const input = document.getElementById(`time-${driver}`);
    input.value = 'DSQ';
    
    const allInputs = Array.from(timesList.querySelectorAll('input[type="text"]'));
    const currentIndex = allInputs.indexOf(input);
    if (currentIndex < allInputs.length - 1) {
        allInputs[currentIndex + 1].focus();
    }
}

function finishRound() {
    if (!currentRound) return;
    
    let hasValidTime = false;
    
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
    
    rounds.unshift(currentRound);
    currentRound = null;
    
    timesSection.classList.add('hidden');
    
    renderResults();
    saveToLocalStorage();
    
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteRound(index) {
    if (confirm('Are you sure you want to delete this round? This cannot be undone.')) {
        rounds.splice(index, 1);
        renderResults();
        saveToLocalStorage();
        
        if (rounds.length === 0) {
            raceStarted = false;
            finishRaceSection.classList.add('hidden');
        }
    }
}

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

function finishRace() {
    if (rounds.length === 0) {
        alert('No rounds completed yet');
        return;
    }
    
    const standings = calculateOverallStandings();
    
    showFinalResults(standings);
}

function continueRace() {
    finalResultsModal.classList.add('hidden');
}

function calculateOverallStandings() {
    const standings = {};
    const DSQ_PENALTY = 15 * 60 * 1000; // 15 minutes in milliseconds (900000)
    
    drivers.forEach(driver => {
        standings[driver] = { totalTime: 0, dsqCount: 0 };
    });
    
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
    
    const standingsArray = Object.keys(standings).map(driver => ({
        driver,
        totalTime: standings[driver].totalTime,
        dsqCount: standings[driver].dsqCount,
        formattedTime: formatTimeExtended(standings[driver].totalTime)
    }));
    
    standingsArray.sort((a, b) => a.totalTime - b.totalTime);
    
    return standingsArray;
}

function showFinalResults(standings) {
    finalResultsBody.innerHTML = '';
    
    const standingsDiv = document.createElement('div');
    standingsDiv.className = 'final-standings';
    standingsDiv.innerHTML = '<h3>Final Standings</h3>';
    
    const firstPlaceTime = standings[0].totalTime;
    
    standings.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = `final-result-row ${getRankClass(index)}`;
        
        let timeDiff = '';
        if (index === 0) {
            timeDiff = '(+00:00:000)';
        } else {
            const diffMs = entry.totalTime - firstPlaceTime;
            timeDiff = `(+${formatTimeExtended(diffMs)})`;
        }
        
        let dsqNotation = '';
        if (entry.dsqCount > 0) {
            dsqNotation = ` <span style="color: #ff4444; font-size: 0.95rem; font-weight: 600;">[${entry.dsqCount} DSQ]</span>`;
        }
        
        
        const isTop3 = index < 3;
        const textColor = isTop3 ? 'color: #000000 !important;' : 'color: #ffffff !important;';



            div.innerHTML = `
            <span class="final-result-position" style="${textColor}">${index + 1}.</span>
            <span class="final-result-name" style="${textColor}">${entry.driver}${dsqNotation}</span>
            <span class="final-result-time" style="${textColor}">
                <span class="final-result-total" style="${textColor}">${entry.formattedTime}</span>
                <span class="final-result-diff" style="${textColor} opacity: 0.8;">${timeDiff}</span>
            </span>
        `;
        
        standingsDiv.appendChild(div);
    });
    
    finalResultsBody.appendChild(standingsDiv);
    finalResultsModal.classList.remove('hidden');
}

function closeModal() {
    finalResultsModal.classList.add('hidden');
    
    if (confirm('Start a new race? This will clear all current data.')) {
        resetRace();
    }
}

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

function renderResults() {
    results.innerHTML = '';
    
    if (rounds.length === 0) {
        results.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No rounds completed yet. Start a round to see results!</p>';
        return;
    }
    
    rounds.forEach((round, index) => {
        const div = document.createElement('div');
        
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
        
        const sortedTimes = Object.keys(round.times)
            .map(driver => ({
                driver,
                time: round.times[driver],
                timeValue: round.times[driver] === 'DSQ' ? Infinity : parseTime(round.times[driver])
            }))
            .sort((a, b) => a.timeValue - b.timeValue);
        
        let resultsHTML = '';
        sortedTimes.forEach((entry, idx) => {
            const rankClass = getRankClass(idx);
            resultsHTML += `
                <div class="result-row ${rankClass}">
                    ${idx + 1}. ${entry.driver} - ${entry.time}
                </div>
            `;
        });
        
        const deleteButton = `
            <button class="delete-round-btn" onclick="deleteRound(${index})">
                Delete This Round
            </button>
        `;
        
        div.innerHTML = headerHTML + resultsHTML + deleteButton;
        results.appendChild(div);
    });
    
    if (rounds.length > 1) {
        const overallDiv = document.createElement('div');
        overallDiv.className = 'overall-standings-container' + (showOverallStandings ? '' : ' hidden');
        overallDiv.style.marginTop = '24px';
        overallDiv.style.border = '3px solid var(--highlight)';
        
        const standings = calculateOverallStandings();
        const firstPlaceTime = standings[0].totalTime;
        
        let overallHTML = '<h3 style="color: #FFF; font-size: 1.5rem; margin-bottom: 16px;">Overall Standings</h3>';
        
        standings.forEach((entry, index) => {
            const rankClass = getRankClass(index);
            
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
        
        const toggleButton = document.createElement('button');
        toggleButton.className = 'toggle-standings-btn';
        toggleButton.textContent = showOverallStandings ? 'Hide Overall Standings' : 'Show Overall Standings';
        toggleButton.onclick = toggleOverallStandings;
        results.appendChild(toggleButton);
    }
}

function getRankClass(index) {
    if (index === 0) return 'first';
    if (index === 1) return 'second';
    if (index === 2) return 'third';
    return '';
}
function parseTime(timeStr) {
    if (timeStr === 'DSQ') return Infinity;
    
    const parts = timeStr.split(':');
    if (parts.length === 3) {
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        const milliseconds = parseInt(parts[2]) || 0;
        return (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
    } else if (parts.length === 2) {
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseFloat(parts[1]) || 0;
        return (minutes * 60 + seconds) * 1000;
    }
    
    return parseFloat(timeStr) * 1000 || 0;
}

function formatTimeExtended(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor(ms % 1000);
    
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
}

function formatTime(ms) {
    return formatTimeExtended(ms);
}

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





// ============================================================
// GAME DATA
// Each game has: stages (array of { group, items[] })
//                cars   (array of { group, items[] })
// ============================================================
const GAME_DATA = {
    dr2: {
        stages: [
            {
                group: "Argentina",
                items: ["Las Juntas, Camino a La Puerto", "Camino de acantilados y rocas", "Camino de acantilados y rocas inverso", "El Rodeo", "La Merced", "Valle de los puentes", "Valle de los puentes a la inversa", "Miraflores", "Huillaprima", "San Isidro", "Camino a Coneta"]
            },
            {
                group: "Australia",
                items: ["Mount Kaye Pass", "Mount Kaye Pass Reverse", "Rockton Plains", "Rockton Plains Reverse", "Yambulla Mountain Descent", "Yambulla Mountain Ascent", "Chandlers Creek", "Chandlers Creek Reverse", "Noorinbee Ridge Ascent", "Noorinbee Ridge Descent", "Taylor Farm Sprint", "Bondi Forest"]
            },
            {
                group: "Finland",
                items: ["Kontinjärvi", "Hämelahti", "Käilajärvi", "Jyrkysjärvi", "Naarajärvi", "Paskuri", "Kakaristo", "Pitkäjärvi", "Iso Oksjärvi", "Oksala", "Järvenkylä", "Kotajärvi"]
            },
            {
                group: "Germany",
                items: ["Oberstein","Frauenberg","Waldaufstieg","Waldaubstieg","Kreuzungsring","Kreuzungsring Reverse","Hammerstein","Ruschberg","Verbundsring","Verbundsring Reverse","Inneren Feld-Sprint","Inneren Feld-Sprint (umgekehrt)"]
            },
            {
                group: "Greece",
                items: ["Anodou Farmakas", "Kathodo Leontiou","Pomona Ekrixi","Ampelonas Ormi","Fourketa Kourva","Koryfi Dafni","Persama Platani","Tsiristra Thea","Ourea Spevsi","Ypsona tou Dasos","Pedines Epidaxi","Abies Koilada"]
            },
            {
                group: "Monaco",
                items: ["Pra d'Alart","Col de Turini Depart","Gordolon - courte montee","Col de Turini - Sprint en descente","Col de Turini sprint en Montee","Col de Turini - Descente","Vallee descendante","Route de Turini","Col de Turini - Depart en descente","Approche du Col de Turini - Montee","Route de Turini Descente","Route de Turini Montee"]
            },
            {
                group: "New zealand",
                items: ["Te Awanga Forward","Ocean Beach","Te Awanga Sprint Forward","Ocean Beach Sprint Forward","Ocean Beach Sprint Reverse","Te Awanga Sprint Reverse","Waimarama Point Forward","Waimarama Point Reverse","Elsthorpe Sprint Forward","Waimarama Sprint Forward","Waimarama Sprint Reverse","Elsthorpe Sprint Reverse"]
            },
            {
                group: "Poland",
                items: ["Zarobka","Zagorze","Kopina","Marynka","Borysik","Jozefin","Jezioro Rotcze","Zienki","Czarny Las","Lejno","Jagodno","Jezioro Lukie"]
            },            
            {
                group: "Spain",
                items: ["Comienzo De Bellriu","Final de Bellriu","Ascenso por valle el Gualet","Vinedos dentro del valle Parra","Ascenso bosque Montverd","Salida desce Montverd","Centenera","Camino a Centenera","Descenso por carretrera","Vinedos Dardenya","Vinedos Dardenya inversa","Subida por carretera"]
            },            
            {
                group: "Sweden",
                items: ["Ransbysater","Norraskoga","Algsjon Sprint","Stor-jangen Sprint Reverse","Stor-jangen Sprint","Skogsrallyt","Hamra","Lysvik","Elgsjon","Bjorklangen","Ostra Hinnsjon","Algsjon"]
            },            
            {
                group: "USA",
                items: ["North Fork Pass","North Fork Pass Reverse","Hancock Creek Burst","Fuller Mountain Descent","Fuller Mountain Ascent","Fury Lake Depart","Beaver Creek Trail Forward","Beaver Creek Trail Reverse","Hancock Hill Sprint Forward","Tolt Valley Sprint Reverse","Tolt Valley Sprint Forward","Hancock Hill Sprint Reverse"]
            },            
            {
                group: "Wales",
                items: ["Sweet Lamb","Geufron Forest","Pant Mawr","Bidno Moorland Reverse","Bindo Moorland","Pant Mawr Reverse","River Severn Valley","Bronfelen","Fferm Wynt","Dyffryn Afon Reverse","Dyffryn Afon","Fferm Wynt Reverse"]
            },           
            {
                group: "Scotland",
                items: ["South Morningside","South Morningside Reverse","Old Butterstone Muir","Rosebank Farm","Rosebank Farm Reverse","Old Butterstone Muir Reverse","Newhouse Bridge","Newhouse Bridge Reverse","Glencastle Farm","Annbank Station","Annbank Station Reverse","Glencastle Farm Reverse"]
            },

        ],
        cars: [
            {
                group: "H1 FWD",
                items: ["Mini Cooper S","DS Automobies DS 21","Lancia Fulva HF"]
            },
            {
                group: "H2 FWD",
                items: ["Volkswagen Golf GTI 16V","Peugeot 205 GTI"]
            },
            {
                group: "H2 RWD",
                items: ["Ford Escord MK II","Alpine Renault A110 1600 S","Fiat 131 Abarth Rally","Opel Kadett C GTE"]
            },
            {
                group: "H3 RWD",
                items: ["BMW E30 M3 EVO Rally","Opel Ascona 400","Lancia Stratos","Datsun 240Z","Renault 5 Turbo","Ford Sierra Cosworth RS500"]
            },
            {
                group: "F2 Kit Car",
                items: ["Peugeot 306 Maxi","Seat Ibiya Kit Car","Volkswagen Golf Kitcar"]
            },
            {
                group: "Group B RWD",
                items: ["Lancia 037 EVO 2","Opel Manta 400","BMW M1 Procar Rally","Porsche 911 SC RS"]
            },
            {
                group: "Group B 4WD",
                items: ["Audi Sport Quattro S1 E2","Peugeot 205 T16 EVO 2","Lancia Delta S4","Ford RS200","MG Metro 6R4"]
            },
            {
                group: "R2",
                items: ["Ford Fiesta R2","Opel Adam R2","Peugeot 208 R2"]
            },
            {
                group: "Group A",
                items: ["Mitsubishi Lancer Evolution VI","Subaru Impreza (1995)","Subaru Legacy RS","Lancia Delta HF integrale","Ford Escort RS Cosworth"]
            },
            {
                group: "NR4/R4",
                items: ["Subaru WRX STI NR4","Mitsubishi Lancer Evolution X"]
            },
            {
                group: "4WD 2000cc",
                items: ["Škoda Fabia Rally","Citroen C4 Rally","Ford Focus RS Rally (2001)","Subaru Impreza S4 Rally","Subaru Impreza (2001)","Ford Focus RS Rally (2007)","Subaru Impreza","Peugeot 206 Rally"]
            },
            {
                group: "R5",
                items: ["Ford Fiesta R5","Peugeot 208 R5 T16","Vokswagen Polo GTI R5","Mitsubishi Space Star R5","Škoda Fabia R5","Citroen C4 R5","Ford Fiesta R5 MKII"]
            },
            {
                group: "Rally GT",
                items: ["BMW M2 Competition","Chevrolet Camaro GT4.R","Porsche 911 RGT Rally Spec","Aston Martin V8 Vantage GT4","Ford Mustang GT4"]
            },


            // I'm not adding the rallycross cars cuz rallycross is shit xdd
        ]
    },
    wrc: {
        stages: [
            {
                group: "Rallye Monte-Carlo",
                items: ["Ancelle","Baisse de Patronel","Briançonnet - Entrevaux","Entrevaux - Briançonnet","La Bâtie-Neuve - Saint-Léger-les-Mélèzes","La Bollène-Vésubie - Col de Turini","La Bollène-Vésubie - Peïra Cava","La Maïris","Le Champ","Les Borels","Les Vénières","Moissière","Parbiou","Peïra Cava - La Bollène-Vésubie","Pertus","Pra d'Alart","Ravin de Coste Belle","Saint-Léger-les-Mélèzes - La Bâtie-Neuve"]
            },
            {
                group: "Rally Sweden",
                items: ["Älgsjön","Åslia","Åsnes","Ekshärad","Ersboda","Ersmark","Haga","Hof-Finnskog","Knapptjernet","Lauksjøen","Lövstaholm","Sandbacka","Spikbrenna","Stora Jangen","Sunne","Umeå","Umeå Sprint","Vargasen"]
            },
            {
                group: "Guanajuato Rally México",
                items: ["Alfaro","Derramadero","El Brinco","El Chocolate","El Mosquito","Guanajuatito","Ibarrilla","Las Minas","Mesa Cuata","Ortega","Otates","San Diego"]
            },
            {
                group: "Croatia Rally",
                items: ["Bliznec","Grdanjci","Hartje","Kostanjevac","Krašić","Kumrovec","Mali Lipovec","Petruš Vrh","Stojdraga","Trakošćan","Vrbno","Zagorska Sela"]
            },
            {
                group: "Vodafone Rally de Portugal",
                items: ["Anjos","Baião","Barbosa","Caminha","Carrazedo","Celeiro","Ervideiro","Fafe","Fridão","Marão","Moreira do Rei","Passos","Ponte de Lima","Ruivães","Touca","Viana do Castelo","Vila Boa","Vila Pouca"]
            },
            {
                group: "Rally Italia Sardegna",
                items: ["Alà del Sardi","Bassacutena","Bortigiadas","Li Pinnenti","Littichedda","Malti","Mamone","Monte Acuto","Monte Muvri","Monte Olia","Rena Majore","Sa Mela"]
            },
            {
                group: "Safari Rally Kenya",
                items: ["Kanyawa"," Kanyawa - Nakura","Kingono","Malewa","Marula","Mbaruk","Moi North","Nakuru","Soysambu","Sugunoi","Tarambete","Wileli"]
            },
            {
                group: "Rally Estonia",
                items: ["Elva","Koigu","Kooraste","Külaaseme","Metsalaane","Nüpli","Otepää","Rebaste","Truuta","Vahessaare","Vellavere","Vissi"]
            },
            {
                group: "Secto Rally Finland",
                items: ["Hatanpää","Honkanen","Lahdenkylä","Leustu","Maahi","Päijälä","Painaa","Peltola","Ruokolahti","Saakoski","Vehmas","Venkajärvi"]
            },
            {
                group: "EKO Acropolis Rally Greece",
                items: ["Amfissa","Bauxites","Delphi","Drosochori","Drosopigi - Aghia Triada","Eptalofos","Gravia","Harvati","Irini - Schinos","Karoutes","Lilea","Mariolata","Parnassós","Perachora","Pisia","Posidonia","Prosilio","Viniani"]
            },
            {
                group: "Bio Bío Rally Chile",
                items: ["Bio Bío","Chivilingo","El Poñen","Hualqui","Laja","Las Pataguas","María Las Cruces","Pulpería","Rere","Río Claro","Río Lía","Yumbel"]
            },
            {
                group: "Formum8 Rally Japan",
                items: ["Habucho","Habu Dam","Higashino","Hokono Lake","Kudarisawa","Lake Mikawa","Nakatsugawa","Nenoue Highlands","Nenoue Plateau","Okuwacho","Oninotaria","Tegano"]
            },
            {
                group: "Agon by AOC Rally Pacifico",
                items: ["Abai","Batukangkung","Bidaralam","Gunung Tujuh","Kebun Raya Solok","Loeboekmalaka","Moearaikoer","Sangir Balai Janggo","South Solok","Sungai Kunit","Talanghilirair","Talao"]
            },
            {
                group: "Fanatec Rally Oceania",
                items: ["Brynderwyn","Doctors Hill","Makarau","Mangapai","Mareretu","Noakes Hill","Oakleigh","Orewa","Tahekeroa","Tahekeroa - Orewa","Taipuha","Waiwera"]
            },
            {
                group: "Rally Scandia",
                items: ["Bergsøytjønn","Dagtrolltjønn","Fordol","Fyresdal","Fyresvatn","Hengeltjønn","Holtjønn","Kottjønn","Ljosdalstjønn","Russvatn","Tovsli","Tovslioytjorn"]
            },
            {
                group: "Rally Iberia",
                items: ["Aiguamúrcia","Alforja","Botareli","Campdasens","L'Argentera","Les Irles","Les Voltes","Montagut","Montclar","Pontils","Santes Creus","Valldossera"]
            },
            {
                group: "Cental European Rally",
                items: ["Brusné","Chvalčov","Libosváry","Lukoveček","Osíčko","Příkazy","Provodovice","Raztoka","Rouské","Rusava","Vítová","Žabárna"]
            },
            {
                group: "ORLEN 80th Rally Poland",
                items: ["Chełchy","Czerwonki","Dybowo","Gajrowskie","Gmina Mragowo","Jelonek","Kosewo","Mikolajki","Pietrasze","Probark","Swietajno","Zawada"]
            },
            {
                group: "Rally Mediterraneo",
                items: ["Albarello","Asco","Cabanella","Capannace","Maririe","Moltifao","Monte Alloradu","Monte Cinto","Poggiola","Ponte","Ravin de Finelio","Serra Di Cuzzioli"]
            },
            {
                group: "Tet Rally Latvia",
                items: ["Baznica","Cerpi","Dinsdurbe","Kaģene","Kaleti","Kalvene","Kirsits","Krote","Mazilmaja","Podnieki","Strokacs","Vecpils"]
            },


        ],
        cars: [
            {
                group: "Not yet completed - please use the 'Other' tab to add custom cars for now",
                items: [""]
            },
            /*{
                group: "WRC2",
                items: ["Skoda Fabia RS Rally2", "Citroen C3 Rally2"]
            },*/
            // add more...
        ]
    }
};

let selectedStage = '';
let selectedCar = '';
let currentGame = 'dr2';

const openSelectorButton = document.getElementById('openSelectorButton');
const stageSelectorModal = document.getElementById('stageSelectorModal');
const cancelSelectorButton = document.getElementById('cancelSelectorButton');
const confirmSelectorButton = document.getElementById('confirmSelectorButton');
const stageGroups = document.getElementById('stageGroups');
const carGroups = document.getElementById('carGroups');
const selectorBody = document.getElementById('selectorBody');
const otherBody = document.getElementById('otherBody');
const previewStage = document.getElementById('previewStage');
const previewCar = document.getElementById('previewCar');
const stageDisplayValue = document.getElementById('stageDisplayValue');
const carDisplayValue = document.getElementById('carDisplayValue');
const gameTabs = document.querySelectorAll('.game-tab');

openSelectorButton.addEventListener('click', () => {
    stageSelectorModal.classList.remove('hidden');
    renderGameData(currentGame);
});

openSelectorButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openSelectorButton.click();
});

cancelSelectorButton.addEventListener('click', () => {
    stageSelectorModal.classList.add('hidden');
});

stageSelectorModal.addEventListener('click', (e) => {
    if (e.target === stageSelectorModal) stageSelectorModal.classList.add('hidden');
});

gameTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        gameTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentGame = tab.dataset.game;

        selectedStage = '';
        selectedCar = '';
        updatePreview();

        const selectorPreview = document.querySelector('.selector-preview');

if (currentGame === 'other') {
    selectorBody.classList.add('hidden');
    otherBody.classList.remove('hidden');
    selectorPreview.classList.add('hidden');
} else {
    selectorBody.classList.remove('hidden');
    otherBody.classList.add('hidden');
    selectorPreview.classList.remove('hidden');
    renderGameData(currentGame);
}
    });
});

function renderGameData(game) {
    const data = GAME_DATA[game];
    if (!data) return;

    renderGroups(stageGroups, data.stages, 'stage');
    renderGroups(carGroups, data.cars, 'car');
}

// ill be making this so its a roll down :)
function renderGroups(container, groups, type) {
    container.innerHTML = '';
    groups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'item-group';

        const label = document.createElement('div');
        label.className = 'group-label';
        label.textContent = group.group;
        groupDiv.appendChild(label);

        group.items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'select-item';
            btn.textContent = item;

            if (type === 'stage' && item === selectedStage) btn.classList.add('selected');
            if (type === 'car' && item === selectedCar) btn.classList.add('selected');

            btn.addEventListener('click', () => {
                container.querySelectorAll('.select-item').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                if (type === 'stage') selectedStage = item;
                else selectedCar = item;

                updatePreview();
            });

            groupDiv.appendChild(btn);
        });

        container.appendChild(groupDiv);
    });
}

function updatePreview() {
    previewStage.textContent = selectedStage || 'No stage selected';
    previewStage.classList.toggle('has-value', !!selectedStage);

    previewCar.textContent = selectedCar || 'No car selected';
    previewCar.classList.toggle('has-value', !!selectedCar);

    confirmSelectorButton.disabled = !selectedStage || !selectedCar;
}

confirmSelectorButton.addEventListener('click', () => {
    if (currentGame === 'other') {
        const otherStage = document.getElementById('otherStageInput').value.trim();
        const otherCar = document.getElementById('otherCarInput').value.trim();
        if (!otherStage || !otherCar) {
            alert('Please enter both stage and car name');
            return;
        }
        selectedStage = otherStage;
        selectedCar = otherCar;
    }

    if (!selectedStage || !selectedCar) {
        alert('Please select both a stage and a car');
        return;
    }

    document.getElementById('stageInput').value = selectedStage;
    document.getElementById('carInput').value = selectedCar;

    stageDisplayValue.textContent = selectedStage;
    stageDisplayValue.classList.remove('placeholder');
    carDisplayValue.textContent = selectedCar;
    carDisplayValue.classList.remove('placeholder');

    stageSelectorModal.classList.add('hidden');
});



function updateConfirmButton() {
    if (currentGame === 'other') {
        const otherStage = document.getElementById('otherStageInput').value.trim();
        const otherCar = document.getElementById('otherCarInput').value.trim();
        confirmSelectorButton.disabled = !otherStage || !otherCar;
    } else {
        confirmSelectorButton.disabled = !selectedStage || !selectedCar;
    }
}

document.getElementById('otherStageInput').addEventListener('input', updateConfirmButton);
document.getElementById('otherCarInput').addEventListener('input', updateConfirmButton);

updatePreview();
updateConfirmButton();