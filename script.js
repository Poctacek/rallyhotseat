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
    if (e.key === "Enter" && driverInput.ariaValueMax.trim() !== "") {
        drivers.push({ name: driverInput.ariaValueMax.trim(), totalTime: 0});
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
        <button class="dsq-btn" dataj-driver="${driver.name}">DSQ</button>
        `;
        const input = div.querySelector("input");
        const dsqBtn = div.querySelector(".dsq-btn");

        input. addEventListener("keydown", ev => {
            if(ev.key==="Enter") addTime(driver.name, input);
        });

        dsqBtn.addEventListener("click", () => input.value="15:00?000");
        timesList.appendChild(div);
    });
}

function addTime(name, input) {
    let raw = input.value.trim();
    let time = raw==="15:00:000" ? 15*60000 : parseTime(raw);

    currentRound.times = currentRound.times.filter(e=>e.name!==name);
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