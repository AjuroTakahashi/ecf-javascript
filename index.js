const searchBtn = document.getElementById("search-button");
const input = document.getElementById('search');
const select = document.getElementById('select');
const tbody = document.getElementById("tbody");
const loadingText = document.getElementById("truc");
let listNumber = 1;
let offset = 0;
let stopScroll = false;

searchBtn.addEventListener('click', ev => {
    ev.preventDefault();
    offset = 0;
    listNumber = 1;
    tbody.innerHTML = "";
    getMusicInfo(input.value, select.value);
})

function getMusicInfo(inputValue, selectValue, offset) {
    let request = new XMLHttpRequest();

    if (!request) {
        console.error('Abandon : Impossible de créer une instance de XMLHTTP');
        return false;
    }

    request.addEventListener("readystatechange", function() {
        getMusicResponse(request, selectValue);
    });
    if (selectValue === "recording") {
        request.open('GET', 'https://musicbrainz.org/ws/2/' + selectValue + '?query="'+ inputValue + '"&fmt=json', true);
    } else {
        request.open('GET', 'https://musicbrainz.org/ws/2/recording?query=' + selectValue + ':"'+ inputValue + '"&fmt=json&limit=50&offset=' + offset, true);
    }
    request.send();

    loadingText.textContent = "Réception en cours...";
}

function getMusicResponse(request, selectValue) {
    if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
            let response = JSON.parse(request.response);
            console.log(response)
            
            if (selectValue === "artist" || selectValue === "recording" || selectValue === "release-group") {
                for (i = 0; i < response.recordings.length; i++) {
                    let artistName = response.recordings[i]["artist-credit"][0].name;
                    let title = response.recordings[i].title;
                    let album;
                    if (response.recordings[i].releases) {
                        album = response.recordings[i].releases[0].title;
                    }

                    fillTable(artistName, title, album);
                    loadingText.textContent = "";
                }
            } else if (selectValue === "release-group") {
                for (i = 0; i < response["release-groups"].length; i++) {
                    let artistName = response["release-groups"][i]["artist-credit"][0].name; 
                    let album = response["release-groups"][i].title;
                    let title = response["release-groups"][i].releases[0].title; 

                    fillTable(artistName, title, album);
                    loadingText.textContent = "";
                }
            }

        } else {
            console.error('Il y a eu un problème avec la requête.');
        }
    }
}

function fillTable(artistName, title, album) {
    let tr = document.createElement("tr");
    let tdNumber = document.createElement("td");
    let tdArtist = document.createElement("td");
    let tdTitle = document.createElement("td");
    let tdAlbum = document.createElement("td");
    let tdActions = document.createElement("td");
    
    tdNumber.textContent = listNumber;
    tdArtist.textContent = artistName;
    tdTitle.textContent = title;
    tdAlbum.textContent = album;

    tbody.appendChild(tr).append(tdNumber, tdArtist, tdTitle, tdAlbum, tdActions)
    listNumber ++;
}

// function getMusics(id, value) {
//     let request = new XMLHttpRequest();

//     if (!request) {
//         console.error('Abandon : Impossible de créer une instance de XMLHTTP');
//         return false;
//     }

//     request.addEventListener("readystatechange", function() {
//         getResponse(request, value);
//     }); 
    
//     request.open('GET', 'https://musicbrainz.org/ws/2/release?artist=' + id + '&inc=release-groups&fmt=json&offset=0&limit=20', true);
//     request.send();
// }

// function getResponse(request, artistName) {
    
//     if (request.readyState === XMLHttpRequest.DONE) {
//         if (request.status === 200) {
//             let response = JSON.parse(request.response);
//             console.log(response.releases, response.releases.length, "réponse trucs");
//             for (i = 0; i < response.releases.length; i++) {
//                 fillTable(artistName, response.releases[i].title, response.releases[i]["release-group"].title)
//             }
            
//         } else {
//             console.error('Il y a eu un problème avec la requête.');
//         }
//     }
// }

window.addEventListener("scroll", ev => {
    ev.preventDefault();
    // if (getScrollTop() < getDocumentHeight() - window.innerHeight) return;
    // getNextRecords(input.value, select.value);
    if ((window.innerHeight + window.scrollY) > document.body.offsetHeight && stopScroll === false) {
        getNextRecords(input.value, select.value);
        stopScroll = true;
    }
}) 

function getNextRecords(inputValue, selectValue) {
    console.log("pouet")
    offset += 50;
    getMusicInfo(inputValue, selectValue, offset);
    setTimeout(() => {
        stopScroll = false
    }, 1000);
}