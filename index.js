const searchBtn = document.getElementById("search-button");
const input = document.getElementById("search");
const select = document.getElementById("select");
const resultsCount = document.getElementById("results-count");
const tbody = document.getElementById("tbody");
const instructions = document.getElementById("instructions");
const spinner = document.getElementById("spinner");
const headerModal = document.getElementById("m-header");
const titleModal = document.getElementById("m-title");
const artistModal = document.getElementById("m-artist");
const albumModal = document.getElementById("m-album");
const genreModal = document.getElementById("m-genre");
const lengthModal = document.getElementById("m-length");
const noteModal = document.getElementById("m-note");
const bodyModal = document.getElementById("m-body");
const covers = document.getElementById("covers");
const coverSpinner = document.getElementById("cover-spinner");
let listNumber = 1;
let offset = 0;
let stopScroll = false;
let count;

searchBtn.addEventListener('click', ev => {
    ev.preventDefault();
    offset = 0;
    listNumber = 1;
    tbody.innerHTML = "";
    getMusicInfo(input.value, select.value);
})

function getMusicInfo(inputValue, selectValue, offset) {
    let request = new XMLHttpRequest();

    inputValue = inputValue.replace(/[\W_]+/g, " ");

    if (!request) {
        console.error('Abandon : Impossible de créer une instance de XMLHTTP'); // Change
        return false;
    }

    request.addEventListener("readystatechange", function() {
        getResponse(request, selectValue);
    });


    // if (selectValue === "recording") {
    //     request.open('GET', 'https://musicbrainz.org/ws/2/' + selectValue + '?query="'+ inputValue + '"&fmt=json&limit=50&offset=' + offset, true);
    if (selectValue === "everything") {
        request.open('GET', 'https://musicbrainz.org/ws/2/recording?query=recording:"'+ inputValue + '"%20OR%20release:"' + inputValue + '"%20OR%20artist:"' + inputValue + '"&fmt=json&limit=50&offset=' + offset, true);
    } else {
        request.open('GET', 'https://musicbrainz.org/ws/2/recording?query=' + selectValue + ':"'+ inputValue + '"&fmt=json&limit=50&offset=' + offset, true);
    }
    request.send();

    instructions.textContent = "";
    spinner.classList.remove("d-none");
}

function getResponse(request, type) {
    if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
            let response = JSON.parse(request.response);
            console.log(response)

            spinner.classList.add("d-none");
            count = response.count;

            while (resultsCount.firstChild) {
                resultsCount.removeChild(resultsCount.lastChild);
            }

            let countText = document.createElement("p");
            countText.textContent = count + " result(s)";
            resultsCount.appendChild(countText);

            if (count === 0) {
                instructions.textContent = "No results"
            }
            

            for (i = 0; i < response.recordings.length; i++) {
                let recording = response.recordings[i];
                let artistName = recording["artist-credit"][0].name;
                let title = recording.title;
                let id = recording.id;
                let score = recording.score;

                let titleAlbum;
                let idAlbum = "";
                if (recording.releases) {
                    titleAlbum = recording.releases[0].title;
                    recording.releases.forEach(element => {
                        if (idAlbum === "") {
                            idAlbum = element.id; 
                        } else {
                            idAlbum += " " + element.id;
                        }
                    });       
                }

                let artistList = "";
                recording["artist-credit"].forEach(element => {
                    if (artistList === "") {
                        artistList = element.name;
                    } else {
                        artistList += ", " + element.name;
                    }
                });

                fillTable(artistName, artistList, title, titleAlbum, id, idAlbum, score);
            }

        } else {
            console.error('Il y a eu un problème avec la requête.');
        }
    }
}

function fillTable(artistName, artistList, title, album, id, idAlbum, score) {
    let tr = document.createElement("tr");
    let tdNumber = document.createElement("td");
    let tdArtist = document.createElement("td");
    let tdTitle = document.createElement("td");
    let tdAlbum = document.createElement("td");
    let tdActions = document.createElement("td");
    let detailsButton = document.createElement("button");
    
    tdNumber.textContent = listNumber;
    tdArtist.textContent = artistName;
    tdTitle.textContent = title;
    tdAlbum.textContent = album;

    detailsButton.textContent = "Click";
    detailsButton.setAttribute("class", "btn btn-primary");
    detailsButton.setAttribute("data-bs-toggle", "modal");
    detailsButton.setAttribute("data-bs-target", "#modal");
    tdActions.appendChild(detailsButton);

    detailsButton.addEventListener("click", ev => {
        let arrayAlbum = idAlbum.split(" ");
        getModalContent("details", id, artistName, artistList, album, score);
        arrayAlbum.forEach(element => {
            // setTimeout(() => {
                getModalContent("cover", element)
            // }, 50);
        });
        while (covers.firstChild) {
            covers.removeChild(covers.lastChild);
        }
    })

    tbody.appendChild(tr).append(tdNumber, tdArtist, tdTitle, tdAlbum, tdActions)
    listNumber ++;
}

function getModalContent(type, id, artistName, artistList, album, score) {
    let request = new XMLHttpRequest();
    if (!request) {
        console.error('Abandon : Impossible de créer une instance de XMLHTTP'); // Change
        return false;
    }

    request.addEventListener("readystatechange", function() {
        getModalResponse(request, type, artistName, artistList, album, score);
    }); 
    
    if (type === "cover") {
        request.open('GET', 'https://coverartarchive.org/release/' + id, true);
    } else {
        request.open('GET', 'https://musicbrainz.org/ws/2/recording/' + id + '?inc=genres&fmt=json', true)
    }
    request.send();

    if (type === "cover") {
        coverSpinner.classList.remove("d-none");
    }
}

function getModalResponse(request, type, artistName, artistList, album, score) {
    if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
            let response = JSON.parse(request.response);
            coverSpinner.classList.add("d-none");
            
            if (type === "cover") {
                console.log(response);
                response.images.forEach(element => {
                    let image = document.createElement("img");
                    image.setAttribute("src", element.thumbnails.small);
                    image.setAttribute("class", "col-6");
                    covers.appendChild(image);
                });

            } else if (type === "details") {
                let genreList = "";
                let length = response.length;

                headerModal.textContent = response.title + " - " + artistName;
                titleModal.textContent = response.title;
                artistModal.textContent = artistList;
                albumModal.textContent = album;
                fillStars(score);

                let convertedLength = convertTime(length);
                lengthModal.textContent = convertedLength;

                response.genres.forEach(element => {
                    if (genreList === "") {
                        genreList = element.name;
                    } else {
                        genreList += ", " + element.name;
                    }
                });
                genreModal.textContent = genreList;
            }
        } else {
            if (type === "cover") {
                coverSpinner.classList.add("d-none");
                let error = document.createElement("p");
                error.textContent = "No covers found.";
                covers.appendChild(error);
            } else {
                let error = document.createElement("p");
                error.textContent = "The request failed.";
                bodyModal.appendChild(error);
            }
        }
    }
}

window.addEventListener("scroll", ev => {
    ev.preventDefault();
    if ((window.innerHeight + window.scrollY) > document.body.offsetHeight && stopScroll === false) {
        getNextRecords(input.value, select.value);
        stopScroll = true;
    }
}) 

function getNextRecords(inputValue, selectValue) {
    offset += 50;
    // arrête de relancer une requète si la totalité des musiques ont été chargées
    if (offset > count) {
        return 
    }
    getMusicInfo(inputValue, selectValue, offset);

    // quand on scroll trop vite la requète se lance des fois deux fois de suite
    setTimeout(() => {
        stopScroll = false
    }, 50); 
}

function convertTime(time) {
    if (time >= 3600000) {
        let hour = Math.floor(time / 3600000);
        let minute = Math.floor((time % 3600000) / 60000);
        let second = (((time % 3600000) % 60000) / 1000).toFixed(0);
        if (hour < 10) {
            hour = "0" + hour;
        }
        if (minute < 10) {
            minute = "0" + minute;
        }
        if (second < 10) {
            second = "0" + second;
        }
    
        return hour + " : " + minute + " : " + second;
    } else {
        let minute = Math.floor(time / 60000);
        let second = ((time % 60000 ) / 1000).toFixed(0)
    
        if (minute < 10) {
            minute = "0" + minute;
        }
        if (second < 10) {
            second = "0" + second;
        }
    
        return minute + " : " + second;
    }
}

function fillStars(score) {
    let stars = document.querySelectorAll(".star");
    let starsToFill = Math.floor(score / 20);
    let firstOffset = document.getElementById("first-offset");
    let secondOffset = document.getElementById("second-offset");

    stars.forEach(element => {
        element.classList.remove("star-fill");
    });

    if (starsToFill < 5) {
        let fillPercent = (score / 20) % 1;
        
        for (i = 0; i < starsToFill; i++) {
            stars[i].classList.add("star-fill");
        }

        firstOffset.setAttribute("offset", fillPercent);
        secondOffset.setAttribute("offset", fillPercent);
        
        stars[i].classList.add("star-gradient");

    } else {
        stars.forEach(element => {
            element.classList.add("star-fill");
        });
    }
}