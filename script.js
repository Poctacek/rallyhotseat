 // data
let drivers = [];
let rounds = [];
let currentRound = null;

const driverInput = document.getElementById("addDriverInput");
const driversList = document.getElementById("driversList");
const stageInput = document.getElementById("stageInput");
const carInput = document.getElementById("carInput");
const startRoundButton = document.getElementById("startRoundButton");
const timesSection = document.getElementById("timesSection");
const timesList = document.getElementById("timesList");
const finishRoundButton = document.getElementById("finishRoundButton");
const finishRaceButton = document.getElementById("finishRaceButton");
const resultsDiv = document.getElementById("results");

// Add driver
driverInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && driverInput.value.trim() !== "") {
        drivers.push({ name: driverInput.value.trim(), totalTime: 0});
        driverInput.value = "";
        renderDrivers();
    }
});



function renderDrivers() {
    driversList.innerHTML = "";
    drivers.forEach((driver, i) => {
        const li= document.createElement("li");
        li.innerHTML = `${driver.name} <button onclick="removeDriver(${i})">Remove</button>`;
        driversList.appendChild(li);
    });
}

function removeDriver(i) {
    drivers.splice(i, 1);
    renderDrivers();
}

// Start round
startRoundButton.addEventListener("click", () => {
    if(!stageInput.value || !carInput.value || drivers.length === 0) return;

    currentRound = { stage: stageInput.value, car: carInput.value, times: [] };
    stageInput.value = ""; carInput.value = "";
    renderTimeInputs();
    timesSection.classList.remove("hidden");
});


function renderTimeInputs() {
    timesList.innerHTML = "";
    drivers.forEach(driver=>{
        const div = document.createElement("div");
        div.innerHTML = `
        <strong>${driver.name}</strong>
        <input type="text" placeholder="00:00:000" data-driver="${driver.name}" value="00:00:000">
        <button class="dsq-btn" data-driver="${driver.name}">DSQ</button>
        `;
        const input = div.querySelector("input");
        const dsqBtn = div.querySelector(".dsq-btn");

        input. addEventListener("keydown", ev => {
            if(ev.key==="Enter") addTime(driver.name, input);
        });

        dsqBtn.addEventListener("click", () => input.value="15:00:000");
        timesList.appendChild(div);
    });
}

function addTime(name, input) {
    let raw = input.value.trim();
    let parsed = raw === "15:00:000" ? 15 * 60000 : parseTime(raw);
    let time = (typeof parsed === 'number' && !isNaN(parsed)) ? parsed : 0;

    currentRound.times = currentRound.times.filter(e => e.name !== name);
    currentRound.times.push({ name, time, raw });
}

// Finish round

finishRoundButton.addEventListener("click", () => {
    if(!currentRound) return;
    const inputs = Array.from(timesList.querySelectorAll("input[data-driver]"));
    inputs.forEach(input => {
        const name = input.getAttribute("data-driver");
        addTime(name, input);
    });

    currentRound.times.sort((a,b) => a.time - b.time);
    rounds.unshift(currentRound);
    renderRounds();
    timesSection.classList.add("hidden");
    currentRound = null;
});

 // render rounds
function renderRounds() {
    resultsDiv.innerHTML = "";
    rounds.forEach(round => {
        const block = document.createElement("div");
        block.innerHTML = `<h3>${round.stage} - ${round.car}</h3>`;
        round.times.forEach((entry, index) => {
            const div = document.createElement("div");
            div.className = `result-row ${["first", "second", "third"][index] || ""}`;
            div.textContent = `${index+1}. ${entry.name} (${entry.time===15*60000 ? "DSQ" : entry.raw})`;
            block.appendChild(div);
        });
        resultsDiv.appendChild(block);
    });
}


// finish race
finishRaceButton.addEventListener("click", () => {
    const finalResults = drivers.map(driver => {
        const total = rounds.reduce((sum, round) => {
            const e = round.times.find(t => t.name === driver.name);
            return sum + (e ? e.time : 0);
        }, 0);
        return { name: driver.name, totalTime: total };
    });

    finalResults.sort((a, b) => a.totalTime - b.totalTime);
    const block = document.createElement("div");
    block.innerHTML = `<h2>Final Results</h2>`;
    finalResults.forEach((entry, index) => {
        const div = document.createElement("div");
        div.className = `result-row ${["first", "second", "third"][index] || ""}`;
        div.textContent = `${index+1}. ${entry.name} (${formatTime(entry.totalTime)})`;
        block.appendChild(div);
    });
    resultsDiv.prepend(block);
});

// utils

function parseTime(input) {
    const parts = input.split(":");
    if(parts.length !== 3) return null;
    const [m, s, ms] = parts.map(Number);
    return m*60000 + s*1000 + ms;
}


function formatTime(ms) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const milli = ms % 1000;
    return `${m}:${s.toString().padStart(2,"0")}:${milli.toString().padStart(3,"0")}`;
}