const searchBtn = document.getElementById("search-button");
const input = document.getElementById('search');
const select = document.getElementById('select');
const tbody = document.getElementById("tbody");
const loadingText = document.getElementById("truc");
let listNumber = 1;

searchBtn.addEventListener('click', ev => {
    ev.preventDefault();
    getMusicInfo(input.value, select.value);
})

function getMusicInfo(inputValue, selectValue) {
    let request = new XMLHttpRequest();

    if (!request) {
        console.error('Abandon : Impossible de créer une instance de XMLHTTP');
        return false;
    }

    request.addEventListener("readystatechange", function() {
        getMusicResponse(request, selectValue);
    });
    request.open('GET', 'https://musicbrainz.org/ws/2/' + selectValue + '?query="'+ inputValue + '"&fmt=json', true);
    request.send();

    tbody.innerHTML = "";
    listNumber = 1;
    loadingText.textContent = "Réception en cours...";
}

function getMusicResponse(request, selectValue) {
    if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
            let response = JSON.parse(request.response);
            console.log(response["release-groups"])
            
            if (selectValue === "artist") {
                for (i = 0; i < response.artists.length; i++) {
                    let artistName = response.artists[i].name;
                    let id = response.artists[i].id;
                    
                    getMusics(id, selectValue, artistName);
                    loadingText.textContent = "";
                }
            } else if (selectValue === "recording") {
                for (i = 0; i < response.recordings.length; i++) {
                    let artistName = response.recordings[i]["artist-credit"][0].name; // question : Prendre que le premier artiste ?
                    let title = response.recordings[i].title;
                    let album;
                    if (response.recordings[i].releases) {
                        album = response.recordings[i].releases[0].title; // question : Prendre que le premier album ?
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

function getMusics(id, selectValue, value) {
    let request = new XMLHttpRequest();

    if (!request) {
        console.error('Abandon : Impossible de créer une instance de XMLHTTP');
        return false;
    }

    request.addEventListener("readystatechange", function() {
        getResponse(request, value);
    }); 

    if (selectValue === "artist") {
        request.open('GET', 'https://musicbrainz.org/ws/2/release?artist=' + id + '&inc=release-groups&fmt=json', true);
    } 

    request.send();
}

function getResponse(request, artistName) {
    
    if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
            let response = JSON.parse(request.response);
            console.log(response.releases, response.releases.length, "réponse trucs");
            for (i = 0; i < response.releases.length; i++) {
                fillTable(artistName, response.releases[i].title, response.releases[i]["release-group"].title)
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


// function getPageId(n) {
// 	return 'article-page-' + n;
// }

// function getDocumentHeight() {
// 	const body = document.body;
// 	const html = document.documentElement;
	
// 	return Math.max(
// 		body.scrollHeight, body.offsetHeight,
// 		html.clientHeight, html.scrollHeight, html.offsetHeight
// 	);
// };

// function getScrollTop() {
// 	return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
// }

// function getArticleImage() {
// 	const hash = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
// 	const image = new Image;
// 	image.className = 'article-list__item__image article-list__item__image--loading';
// 	image.src = 'http://api.adorable.io/avatars/250/' + hash;
	
// 	image.onload = function() {
// 		image.classList.remove('article-list__item__image--loading');
// 	};
	
// 	return image;
// }

// function getArticle() {
// 	const articleImage = getArticleImage();
// 	const article = document.createElement('article');
// 	article.className = 'article-list__item';
// 	article.appendChild(articleImage);
	
// 	return article;
// }

// function getArticlePage(page, articlesPerPage = 16) {
// 	const pageElement = document.createElement('div');
// 	pageElement.id = getPageId(page);
// 	pageElement.className = 'article-list__page';
	
// 	while (articlesPerPage--) {
// 		pageElement.appendChild(getArticle());
// 	}
	
// 	return pageElement;
// }


// function addPage(page) {
// 	articleList.appendChild(getArticlePage(page));
// }

// const articleList = document.getElementById('article-list');
// const articleListPagination = document.getElementById('article-list-pagination');
// let page = 0;

// addPage(page);

// window.onscroll = function() {
// 	if (getScrollTop() < getDocumentHeight() - window.innerHeight) return;
// 	addPage(page);
// };