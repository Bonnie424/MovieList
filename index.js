const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12  //每頁只顯示 12 筆資料

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const pageinator = document.querySelector('#pageinator')
const modeChange = document.querySelector('#change-mode')



axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    // 展開運算子，「展開陣列元素」
    movies.push(...response.data.results)
    renderPageinator(movies.length)
    renderMovieCards(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))




dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))

  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})



// 按鈕切換
modeChange.addEventListener('click', event => {
  const target = event.target;

  // 切換到卡片模式
  if (target.matches('#card-mode-button')) {
    renderMovieCards(getMoviesByPage(1))

  } else if (target.matches('#list-mode-button')) {
    // 切換列表模式
    renderMovieList(getMoviesByPage(1))
  }
});





// Search Bar
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()  // 搜尋input裡面的值可以使用.value  toLowerCase將字串轉換成小寫母 trim 把字串前後的空白去除

  //錯誤處理：輸入無效字串
  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }
  //條件篩選
  filteredMovies = movies.filter((movie) => //filter陣列方法
    movie.title.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  //重製分頁器
  renderPageinator(filteredMovies.length)
  //預設顯示第 1 頁的搜尋結果
  renderMovieCards(getMoviesByPage(1))
})




function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}


function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return Swal.fire({
      title: "此電影已在蒐藏清單!",
      icon: "info",
    });
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
  Swal.fire({
    title: "已成功加入電影清單",
    icon: "success",
  });
}



pageinator.addEventListener('click', function onPageinatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieCards(getMoviesByPage(page))
})

function renderMovieCards(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `<ul class="list-group">
        <li class="list-group-item d-flex justify-content-between">
          <h5 class="list-title">${item.title}</h5>
          <div>
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </li>
      </ul>`;
  });
  dataPanel.innerHTML = rawHTML;
}

function renderPageinator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) //無條件進位
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  pageinator.innerHTML = rawHTML
}


function getMoviesByPage(page) {
  //計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  const data = filteredMovies.length ? filteredMovies : movies // 如果搜尋陣列裡的長度大於0 ,則只顯示搜尋後的電影, 如果沒有,則顯示所有電影
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE) //slice 方法接受兩個參數，第一個參數是起始索引（包含），第二個參數是結束索引（不包含）。

}





