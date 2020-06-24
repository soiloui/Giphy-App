const searchForm_DOM = document.querySelector('#search-form');
const searchString_DOM = document.querySelector('#search-string');
const limitSelect_DOM = document.querySelector('#result-limit');
const nextPage_DOM = document.querySelector('#next-page');
const prevPage_DOM = document.querySelector('#prev-page');

class GiphyRequest {
	constructor() {
		this.gifsParent_DOM = document.querySelector('#giphy-results');
		this.api_key = 'wlxUti6vVhsjgaDcVMtYSN4zKPWXIWSW';
		this.offset = 0;
		this.total_count = 100;
		this.url = `https://api.giphy.com/v1/gifs/search?api_key=${this.api_key}&rating=G&lang=en`;
		this.waitForRefresh = null;
	}

	initLoading() {
		if (this.waitForRefresh != null) {
			clearTimeout(this.waitForRefresh);
			this.waitForRefresh = null;
		}

		this.waitForRefresh = setTimeout(() => {
			this.showGiphs(searchString_DOM.value.trim());
		}, 250);
	}
	checkResponse = (status, element_DOM) => {
		if (status == 200) {
			return true;
		} else if (status == 400) {
			element_DOM.innerHTML = `<p class="error-text"><span>Error 400 - </span>Sorry, your request was formatted incorrectly or missing a required parameter(s)</p>`;
		} else if (status == 403) {
			element_DOM.innerHTML = `<p class="error-text"><span>Error 403 - </span>Sorry, you weren't authorized to make your request</p>`;
		} else if (status == 404) {
			element_DOM.innerHTML = `<p class="error-text"><span>Error 404 - </span>Sorry, the particular GIF or Sticker you are requesting was not found</p>`;
		} else if (status == 429) {
			element_DOM.innerHTML = `<p class="error-text"><span>Error 429 - </span>Sorry, too Many Requests</p>`;
		} else {
			element_DOM.innerHTML = `<p class="error-text"><span>${status} - </span>Something went wrong</p>`;
		}
	};

	async showGiphs(search_string) {
		const uri = this.url + `&q=${search_string}&limit=${limitSelect_DOM.value}&offset=${this.offset}`;

		fetch(uri)
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					this.checkResponse(response.status, this.gifsParent_DOM);
					throw new Error(response.status);
				}
			})
			.then((data) => {
				this.mapData(data);
			})
			.catch((error) => {
				console.log(error);
			});
	}

	mapData(resp) {
		const frag = document.createDocumentFragment();
		this.total_count = resp.pagination.total_count;
		this.gifsParent_DOM.innerHTML = ``;
		document.querySelector('.count-info').innerHTML = `Total ${this.total_count} founded`;

		resp.data.map((entry) => {
			const link_DOM = document.createElement('a');
			link_DOM.href = entry.images.downsized.url;
			link_DOM.target = '_blank';

			const img_DOM = document.createElement('img');
			img_DOM.classList.add('giphy-results__result');
			img_DOM.alt = 'Your browser does not support the gifs';
			img_DOM.src = entry.images.preview_gif.url;

			link_DOM.appendChild(img_DOM);
			frag.appendChild(link_DOM);
		});

		this.gifsParent_DOM.appendChild(frag);
	}

	pageMove(action) {
		const result_limit = parseInt(limitSelect_DOM.value);
		const pagePos = Math.floor((this.offset + result_limit) / result_limit);
		const pageNeg = Math.floor((this.offset - result_limit) / result_limit);

		if (action == 'next') {
			this.offset = pagePos * result_limit;
			document.querySelector('.page-info__text').innerText = `Page ${pagePos + 1}`;
		} else if (action == 'prev') {
			this.offset = pageNeg * result_limit;
			document.querySelector('.page-info__text').innerText = `Page ${pageNeg + 1}`;
		} else if (action == 'stay') {
			document.querySelector('.page-info__text').innerText = `Page ${pagePos}`;
		}
	}
}

const Giphy = new GiphyRequest();

searchForm_DOM.addEventListener('submit', (e) => {
	e.preventDefault();
	Giphy.initLoading();
});

limitSelect_DOM.addEventListener('change', () => {
	Giphy.pageMove('stay');
	Giphy.initLoading();
});

nextPage_DOM.addEventListener('click', () => {
	const result_limit = parseInt(limitSelect_DOM.value);
	if (Math.floor((Giphy.offset + result_limit) / result_limit) * result_limit < Giphy.total_count) {
		Giphy.pageMove('next');
		Giphy.initLoading();
	}
});

prevPage_DOM.addEventListener('click', () => {
	const result_limit = parseInt(limitSelect_DOM.value);
	if (Math.floor((Giphy.offset - result_limit) / result_limit) >= 0) {
		Giphy.pageMove('prev');
		Giphy.initLoading();
	}
});

window.addEventListener('keyup', () => {
	Giphy.initLoading();
});
