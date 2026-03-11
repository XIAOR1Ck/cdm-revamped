const container = document.getElementsByClassName('container')[0];
const formContainer = document.querySelector('.formContainer');
const currentSeason = 'CODML2026S1';
const scheduleRadio = document.getElementsByClassName('scheduleRadio')[0];
const searchForm = document.getElementById('searchForm');
const searchArea = document.getElementById('searchArea');
const season = document.getElementById('season');
const dataType = document.getElementById('dataType');
const gameMode = document.querySelector('input[name="gameModes"]:checked');


// Handle form Submit event

searchForm.addEventListener('submit', async function (e){
const gameMode = document.querySelector('input[name="gameModes"]:checked');
    e.preventDefault();
    switch (dataType.value) {
        case 'schedule':
            if(season.value === 'CODML2026S1') {
                window.location.href = "./";
            } else {
                container.innerHTML = `<div class="schedleRadio"></div> <div class="scheduleDiv"></div>`;
                await getSchedule(season.value);
            //    const schedulePrev = document.querySelectorAll('.schedulePrev');
            }
        break;

        case 'searchPlayer':
            const playerId = document.getElementById('playerId').value;
            await getPlayerData(playerId, season.value, gameMode.value);

        break;

        case 'teamData':
        break

        case 'mapData':
        break;

    }
});

dataType.addEventListener('change', function(){
    const seasonid = season.value;
    if (dataType.value === "searchPlayer") {
        searchArea.style.display = 'block';
        renderSearch(seasonid);
    } else {
    searchArea.style.display = 'none';
}
});

season.addEventListener('change', function (){
    if(dataType.value === "searchPlayer"){
        renderSearch(season.value);
    }
})

async function renderFront(seasonid) {
    const radioOptions = [
        { id: "past", value: "past", label: "Previous" },
        { id: "today", value: "today", label: "Today", checked: true },
        { id: "future", value: "future", label: "Upcoming" }
    ];
    const gropuName = 'schRadio';
    await getSchedule(seasonid);
    const schedulePrev = document.querySelectorAll('.schedulePrev');
    const scheduleToday = document.querySelectorAll('.scheduleToday');
    const scheduleFut = document.querySelectorAll('.scheduleFut');
    schedulePrev.forEach(option => {
        option.style.display = 'none';
    })
    radioOptions.forEach((option, index) => {
        // create Input Element for radio Boxes
        const input = document.createElement("input");
        input.type = 'radio';
        input.name = gropuName;
        input.id = option.id;
        input.value = option.value;

        // Check if the option was checked 
        input.checked = option.checked || index === 0;


        // Add event Listeners to input Boxes
        input.addEventListener('change', (event) => {
            if (event.target.checked) {
                const targetLabel = event.target.labels[0].textContent;
                switch (targetLabel) {
                    case "Today":
                        if (scheduleToday) {
                            scheduleToday.forEach(option => {
                                option.style.display = 'flex';
                            });
                        };
                        if (scheduleFut) {
                            scheduleFut.forEach(option => {
                                option.style.display = 'none';
                            });
                        };
                        if (schedulePrev) {
                            schedulePrev.forEach(option => {
                                option.style.display = 'none';
                            });
                        };
                        break;
                    case "Previous":
                        if (scheduleToday) {
                            scheduleToday.forEach(option => {
                                option.style.display = 'none';
                            });
                        };
                        if (scheduleFut) {
                            scheduleFut.forEach(option => {
                                option.style.display = 'none';
                            });
                        };
                        if (schedulePrev) {
                            schedulePrev.forEach(option => {
                                option.style.display = 'flex';
                            });
                        };
                        break;
                    case "Upcoming": 
                        if (scheduleToday) {
                        scheduleToday.forEach(option => {
                            option.style.display = 'none';
                        });
                    };
                        if (scheduleFut) {
                            scheduleFut.forEach(option => {
                                option.style.display = 'flex';
                            });
                        };
                        if (schedulePrev) {
                            schedulePrev.forEach(option => {
                                option.style.display = 'none';
                            });
                        };


                        break;
                }
            }
        })

        // Create label for the radio boxes
        const label = document.createElement("label");
        label.htmlFor = option.id;
        label.textContent = option.label;
        const wrapper = document.createElement('div');
        wrapper.className = 'radioDiv';
        wrapper.appendChild(input);
        wrapper.appendChild(label);
        scheduleRadio.appendChild(wrapper);
    });



}

//toggle Search Form
function showForm() {
    if (formContainer.style.display === 'none' || formContainer.style.display === '') {
        formContainer.style.display = 'block'; // Show the element
    } else {
        formContainer.style.display = 'none'; // Hide the element
    }
}

function toggleVod(element) {
    const parent = element.parentNode;
    const hiddenDiv = parent.querySelector('.vodHidden');
    hiddenDiv.style.display = hiddenDiv.style.display === "flex" ? "none" : "flex";
    element.style.display = 'none';
}

async function getSchedule(seasonid) {
    const endpoint = `/getCodmSSchedule?seasonid=${seasonid}`;
    const data = await fetchData(endpoint, "GET");
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize time
    if (!data) {
        alert("Data fetch Failed!!!");
    } else {
        const { schedule } = data;
        schedule.forEach(elements => {
            const { match_date, glogo, gname, guest_logo, guest_score, host_score, hname, hlogo, vid_list } = elements;
            const matchDate = new Date(match_date.replace(' ', 'T'));
            let dateStatus = '';
            matchDate.setHours(0, 0, 0, 0);
            if (matchDate.getTime() < today.getTime()) {
                dateStatus = "past";
                createScheduleCard(Object.entries({ match_date, glogo, gname, guest_logo, guest_score, host_score, hname, hlogo, vid_list }), dateStatus);
            } else if (matchDate.getTime() === today.getTime()) {
                dateStatus = "today";
                createScheduleCard(Object.entries({ match_date, glogo, gname, guest_logo, guest_score, host_score, hname, hlogo }), dateStatus);

            } else {
                dateStatus = "future";
                createScheduleCard(Object.entries({ match_date, glogo, gname, guest_logo, guest_score, host_score, hname, hlogo }), dateStatus);
            }
            // const objArray = Object.entries({ match_date, glogo, gname, guest_logo, guest_score, host_score, hname, hlogo, vid_list });
            //createScheduleCard(objArray, dateStatus);
        });
    }
}

function createScheduleCard(dataList, dateStatus) {

    const schDiv = document.getElementsByClassName('scheduleDiv')[0];
    //const {match_date, glogo, gname, guest_logo, guest_score, host_score, hname, hlogo, vid_list} = data;
    //const objArray = Object.entries({match_date, glogo, gname, guest_logo, guest_score, host_score, hname, hlogo, vid_list});
    let divName = '';

    if (dateStatus === "today") {
        divName = "scheduleToday";
    } else if (dateStatus === "future") {
        divName = "scheduleFut";
    } else {
        divName = "schedulePrev";
    }

    const scheduleDiv = document.createElement("div");
    scheduleDiv.setAttribute("class", divName);
    dataList.forEach(([key, value]) => {
        let elDiv = document.createElement("div");
        switch (key) {
            case "glogo":
            case "hlogo":
                elDiv.setAttribute("class", "logo");
                let img = document.createElement("img");
                img.src = value;
                img.alt = 'team Logo';
                elDiv.appendChild(img);
                break;
            case "match_date":
                let zhDate = new Date(value.replace(' ', 'T') + '+08:00');
                elDiv.setAttribute("class", "matchDate");
                elDiv.textContent = zhDate.toLocaleString();
                break;
            case "gname":
            case "hname":
                elDiv.setAttribute("class", "name");
                elDiv.textContent = value;
                break;
            case "guest_score":
            case "host_score":
                elDiv.setAttribute("class", "score");
                elDiv.textContent = value;
                break;
            case "vid_list":
                elDiv.setAttribute("class", "vodList");
                const titleDiv = document.createElement("div");
                titleDiv.setAttribute("class", "vodText");
                titleDiv.setAttribute("onclick", "toggleVod(this)");
                titleDiv.textContent = "Map Vods";
                const vodDiv = document.createElement("div");
                vodDiv.style.display = 'none';
                vodDiv.setAttribute("class", "vodHidden");
                value.forEach(elements => {
                    let vodLink = document.createElement("div");
                    vodLink.setAttribute("class", "vodLink");
                    vodLink.setAttribute("onclick", `openVideoModal("${elements}")`);
                    vodLink.textContent = `Map${value.indexOf(elements) + 1}`;
                    vodDiv.appendChild(vodLink);
                });
                elDiv.appendChild(titleDiv);
                elDiv.appendChild(vodDiv);
                break;
        }
        scheduleDiv.appendChild(elDiv);
    });
    schDiv.appendChild(scheduleDiv);
}


//async function fetchData(endpoint, requestType, data) {
//    let apiBase = 'https://cdm-worker.sureshach-off.workers.dev/web/codm';
//    let response;
//    let requestUrl = apiBase + endpoint;

//    if (requestType === "GET") {
//        try {
//            response = await fetch(requestUrl);
//        } catch (error) {
//            console.error(error);
//        }
//    } else if (requestType === "POST") {
//
//    console.log(JSON.stringify(data), endpoint,requestType);
//        try {
//            response = await fetch(requestUrl, {
//                method: "POST",
//                headers: {
 //       "Content-Type": "application/json"
  //  },
//                data: JSON.stringify(data),
//            });
//        } catch (error) {
//            console.error(error);
//        }
//    }
//    let jsonData = await response.json();
//    return jsonData;
//}
async function fetchData(endpoint, method = "GET", data = null) {

    const apiBase = 'https://cdm-worker.sureshach-off.workers.dev/web/codm';
    const url = apiBase + endpoint;

    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();
}


function openVideoModal(videoId) {
    const videoUrl = `https://v.qq.com/txp/iframe/player.html?vid=${videoId}`;
    console.log(videoUrl);
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoFrame');

    // Set the source. 
    // Note: Add '?autoplay=1' to your URL if you want it to start immediately.
    iframe.src = videoUrl;

    // Display the modal using Flexbox to center it
    modal.style.display = 'flex';
}




/**
 * Closes the video modal and stops the video.
 */
function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoFrame');

    // Hide the modal
    modal.style.display = 'none';

    // CRITICAL: Clear the src to stop the video audio from playing in background
    iframe.src = '';
}

// Optional: Close modal if user clicks outside the video content
window.onclick = function (event) {
    const modal = document.getElementById('videoModal');
    if (event.target == modal) {
        closeVideoModal();
    }
}

// Render Form Search Bar for Player Search
function renderSearch(seasonid){
    searchArea.innerHTML = ' ';
    fetch(`data/players_${seasonid}.json`)
    .then(response => {
            if (!response.ok){
                throw new Error('Failed fetching Players list:', response.statusText);
            }
            return response.json();
        })
    .then(data => {
            const dataOptions = data.map((values) => `<option value="${values.player_name}" data-id="${values.player_id}"></option>`).join('');
            //const searchArea = document.getElementById("_searchArea");
            searchArea.innerHTML = `
            <input type="text" id="playerInput" list="playerList" placeholder="Search Player...">
            <datalist id="playerList">
                ${dataOptions}
            </datalist>
            <input type="hidden" id="playerId">
`;
            attachDatalistMapping('playerInput','playerId')
        })
    .catch (error => console.error (error));
}

// Generate Combolist for player Search
function attachDatalistMapping(inputId, hiddenId) {
  const input = document.getElementById(inputId);
  const hidden = document.getElementById(hiddenId);
  const datalist = document.getElementById(input.getAttribute('list'));

  input.addEventListener('input', function () {
    const match = Array.from(datalist.options)
      .find(option => option.value === input.value);

    hidden.value = match ? match.dataset.id : '';
  });
}

async function getPlayerData(playerid, seasonid, gamemode) {
    const endpoint = '/getPlayerRanking';
    const data = {seasonid: seasonid,
    game_mode: gamemode};
    console.log("i'm here",playerid, seasonid,gamemode);
    console.log(data);
    const playerJson = await fetchData(endpoint, "POST", data);
    const {data: {rank}} = playerJson;
    let player;
    
    for (const option of rank) {
        if (option.player_id === playerid){
            player = option;
            break;
        }
    }
    console.log(player);
    let playerRank = rank.indexOf(player);
    createPlayerCard(player, gamemode, playerRank);

    

}

// Create Player Card
function createPlayerCard(data, gamemode, rank) {
    let cardDiv = document.createElement("div");
    cardDiv.setAttribute('class', 'playerCard');
    cardDiv.innerHTML =` <div class="playerInfo">
            <div class="playerImage">
              <img
                src="${data.player_logo}"
                alt=""
              />
            </div>

            <h2>${data.player_name}</h2>
          </div>
          <div class="playerDetails">
            <div class="playerMain">
              <div id="rating">Rating: ${Number(data.rating.toFixed(2)
              )}</div>
              <div id="rank">Rank: ${rank}</div>
              <div id="mvp">MPV: ${data.mvp}</div>
              <div id="teamInfo">
                <img
                  src="${data.team_logo}"
                  alt=""
                />
                <p>${data.team_name}</p>
              </div>
            </div>
            <div class="playerStats">
              
            </div>
          </div>
    `;
    let statsDiv = cardDiv.querySelector('.playerStats');
    switch (gamemode){
        case "Hotspot":
            const min = Math.floor(data.hp_time / 60);
            const sec = Math.floor(data.hp_time % 60);
            statsDiv.innerHTML = `
              <div class="statField">Avg Kills: ${Number(data.k.toFixed(2))}</div>
              <div class="statField">Avg Deaths: ${Number(data.d.toFixed(2))}</div>
              <div class="statField">KD: ${data.kd}</div>
              <div class="statField">Max Kills: ${data.max_k}</div>
              <div class="statField">5 Kill Spree: ${data.times5accu_kill}</div>
              <div class="statField">Avg Operator Kills: ${Number(data.times_ult_kill.toFixed(2))}</div>
              <div class="statField">Max Hill Time: ${min}'${sec}"</div>
              <div class="statField">Games Played: ${data.rounds}</div>
`;
        break;
        case "Control":
            const mins = Math.floor(data.hp_time / 60);
            const secs = Math.floor(data.hp_time % 60);
            statsDiv.innerHTML = `
              <div class="statField">Avg Kills: ${Number(data.k.toFixed())}</div>
              <div class="statField">Avg Death: ${Number(data.d.toFixed(2))}</div>
              <div class="statField">Avg Assists: ${Number(data.a.toFixed(2))}</div>
              <div class="statField">KD: ${data.kd}</div>
              <div class="statField">Max Kills: ${data.max_k}</div>
              <div class="statField">5 Kill Spree: ${data.times5accu_kill}</div>
              <div class="statField">Avg Operator Kills: ${Number(data.times_ult_kill.toFixed(2))}</div>
              <div class="statField">Max Hill Time: ${mins}'${secs}"</div>
`;

        break;
        case "Blast":
            statsDiv.innerHTML = `
              <div class="statField">First Bloods: ${data.first_blood}</div>
              <div class="statField">First Blood Rate: ${Number((data.first_blood_rate * 100).toFixed(2))}%</div>
              <div class="statField">SR KillsPerRound: ${data.sniper_kill_per_round}</div>
              <div class="statField">Max Kills: ${data.max_k}</div>
              <div class="statField">Avg Deaths: ${Number(data.d.toFixed(2))}</div>
              <div class="statField">SR KillRate: ${Number(data.times_sniper_kill.toFixed(2))}</div>
              <div class="statField">Ace: ${data.times5accu_kill}</div>
              <div class="statField">KD: ${data.kd}</div>
`;

        break;
        case "FULL":
            statsDiv.innerHTML = `
              <div class="statField">Kills: ${data.k}</div>
              <div class="statField">Deaths: ${data.d}</div>
              <div class="statField">Assists: ${data.a}</div>
              <div class="statField">KD: ${data.kd}</div>
              <div class="statField">Max Kills: ${data.max_k}</div>
              <div class="statField">5 Kill Sprees: ${data.times5accu_kill}</div>
`;

        break;
    }
container.innerHTML = '';
container.appendChild(cardDiv);

}

//getPlayerData('329450884', 'CODML2025S2', 'Control');
renderFront(currentSeason);
//
//getSchedule('CODML2025S2');
