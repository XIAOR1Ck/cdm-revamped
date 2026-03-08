const container = document.getElementsByClassName('container')[0];
const schDiv = document.getElementsByClassName('scheduleDiv')[0];
const currentSeason = 'CODML2026S1';
const scheduleRadio = document.getElementsByClassName('scheduleRadio')[0];

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
                    case "Upcoming": if (scheduleToday) {
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
                createCard(Object.entries({ match_date, glogo, gname, guest_logo, guest_score, host_score, hname, hlogo, vid_list }), dateStatus);
            } else if (matchDate.getTime() === today.getTime()) {
                dateStatus = "today";
                createCard(Object.entries({ match_date, glogo, gname, guest_logo, guest_score, host_score, hname, hlogo }), dateStatus);

            } else {
                dateStatus = "future";
                createCard(Object.entries({ match_date, glogo, gname, guest_logo, guest_score, host_score, hname, hlogo }), dateStatus);
            }
            // const objArray = Object.entries({ match_date, glogo, gname, guest_logo, guest_score, host_score, hname, hlogo, vid_list });
            //createCard(objArray, dateStatus);
        });
    }
}

function createCard(dataList, dateStatus) {
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
                elDiv.setAttribute("class", "matchDate");
                elDiv.textContent = value;
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


async function fetchData(endopoint, requestType, data) {
    let apiBase = 'https://cdm-worker.sureshach-off.workers.dev/web/codm';
    let response = '';
    let requestUrl = apiBase + endopoint;

    if (requestType === "GET") {
        try {
            response = await fetch(requestUrl);
        } catch (error) {
            console.error(error);
        }
    } else if (requestType === "POST") {
        try {
            response = await fetch(requestUrl, {
                method: "POST",
                data: JSON.stringify(data),
            });
        } catch (error) {
            console.error(error);
        }
    }
    let jsonData = await response.json();
    return jsonData;
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



renderFront(currentSeason);