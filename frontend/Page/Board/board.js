import request from "../../API/request.js";
import { getProfileImageUrl } from "../../API/imageRequest.js";
import { getPostImageUrl } from "../../API/imageRequest.js";

const profileMenuBtn = document.getElementById('profileMenuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

const postList = document.querySelector('.post-list');

const sentinel = document.getElementById("sentinel");
const postLoading = document.getElementById("postLoading");
const postEmpty = document.getElementById("postEmpty");
const postError = document.getElementById("postError");


const sidebar = document.getElementById('sidebar');
const collapsedTopbar = document.getElementById('collapsedTopbar');
const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
const sidebarExpandBtn = document.getElementById('sidebarExpandBtn');

const LogoutBtn = document.getElementById('logoutBtn');

LogoutBtn.addEventListener('click', function() {
  localStorage.removeItem('accessToken');
  window.location.href = '../Login/Login.html';
});

profileMenuBtn.addEventListener('click', function() {
  dropdownMenu.classList.toggle('active');
});


let cursorId = null; //처음엔 null
const LIMIT = 7;

let isLoading = false;


const intersectionObserver = new IntersectionObserver( async function (entries) {
  entries.forEach(async (entry) => {
    if (!entry.isIntersecting) return;
    if (isLoading) return;

    try {
      isLoading = true;

      postLoading.hidden = false;
      postError.hidden = true;

      const result = await getlistPost();
      const posts = result.data
      if (posts.length > 0) {
        postEmpty.hidden = true;
        renderPostList(posts);
      }

    } catch (error) {
      console.error(error);
      postError.hidden = false;

    } finally {
      isLoading = false;
      postLoading.hidden = true;
    }
  })
});

intersectionObserver.observe(sentinel);

async function getlistPost() {

  // cursor가 있을 때만 파라미터에 포함
  // 최초 요청에는 cursor 값이 null이지만, 그 이후에 요청에 대해서는 cursor 값이 다 있음.
  const Params = new URLSearchParams({ limit: LIMIT });

  if (cursorId !== null) {
    Params.set("cursor", cursorId);
  }

  const result = await request(`/posts?${Params.toString()}`, 'GET');

  // 받아온 목록의 마지막 postId를 다음 cursor로 업데이트
  const posts = result.data;
  if (posts && posts.length > 0 && posts.length === LIMIT) {
    cursorId = posts[posts.length - 1].post_id;
  }
  else{
    intersectionObserver.unobserve(sentinel);
  }

  return result;
}

// 1,000 이상이면 1k, 10,000 이상이면 10k, 100,000 이상이면 100k 식으로 표기
function formatCount(count) {
  if (count >= 1000) {
    return `${parseFloat((count / 1000).toFixed(1))}k`;
  }
  return `${count}`;
}

// yyyy-mm-dd hh:mm:ss 형식으로 변환
function formatDateTime(dateInput) {
  const date = new Date(dateInput);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

// 아이콘 SVG 문자열 (좋아요/댓글/조회수)
const ICONS = {
  like: `<svg class="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20.5s-7.5-4.6-10-9.3C.5 8 2 4.5 5.5 4c2-.3 3.8.7 4.9 2.2l1.6 2.1 1.6-2.1C14.7 4.7 16.5 3.7 18.5 4 22 4.5 23.5 8 22 11.2c-2.5 4.7-10 9.3-10 9.3z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  comment: `<svg class="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16v12H8.5L4 20V4z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  view: `<svg class="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>`
};

// 아이콘 + 숫자로 구성된 stat-item 하나 생성
function createStatItem(iconKey, count) {
  const item = document.createElement('span');
  item.className = 'stat-item';
  item.innerHTML = `${ICONS[iconKey]}<span>${formatCount(count)}</span>`;
  return item;
}

function renderPostList(posts) {

  posts.forEach((post) => {

    const li = document.createElement('li');
    li.className = 'post-card';

    // 카드 내부 wrapper (썸네일 + 본문 가로 배치)
    const postCardInner = document.createElement('div');
    postCardInner.className = 'post-card-inner';

    if (post.post_image) {
      const postImg = document.createElement('img');
      postImg.className = 'post-img';
      postImg.src = getPostImageUrl(post.post_image);
      postImg.alt = '';
      postCardInner.appendChild(postImg);
    }

    // 본문 영역 (제목 + 통계 + 하단 작성자/날짜)
    const postMain = document.createElement('div');
    postMain.className = 'post-main';

    const postTitle = document.createElement('h2');
    postTitle.className = 'post-title';
    postTitle.setAttribute('max-length', '26');
    postTitle.textContent = post.title;

    // 좋아요/댓글/조회수 (아이콘 + 숫자)
    const metaStats = document.createElement('div');
    metaStats.className = 'meta-stats';
    metaStats.appendChild(createStatItem('like', post.like_count));
    metaStats.appendChild(createStatItem('comment', post.comment_count));
    metaStats.appendChild(createStatItem('view', post.view_count));

    const postAuthor = document.createElement('div');
    postAuthor.className = 'post-author';

    const authorAvatar = document.createElement('div');
    authorAvatar.className = 'author-avatar';

    if (post.profileImage) {
      const authorAvatarImg = document.createElement('img');
      authorAvatarImg.className = 'author-avatar-img';
      authorAvatarImg.src = getProfileImageUrl(post.profileImage);
      authorAvatarImg.alt = '';
      authorAvatar.appendChild(authorAvatarImg);
    }

    const authorName = document.createElement('span');
    authorName.className = 'author-name';
    authorName.textContent = post.writer;

    postAuthor.appendChild(authorAvatar);
    postAuthor.appendChild(authorName);

    const metaDate = document.createElement('span');
    metaDate.className = 'meta-date';
    metaDate.textContent = formatDateTime(post.datewritten);

    // 하단 줄: 작성자 ↔ 날짜, 양끝 정렬
    const postBottomRow = document.createElement('div');
    postBottomRow.className = 'post-bottom-row';
    postBottomRow.appendChild(postAuthor);
    postBottomRow.appendChild(metaDate);

    postMain.appendChild(postTitle);
    postMain.appendChild(metaStats);
    postMain.appendChild(postBottomRow);

    postCardInner.appendChild(postMain);

    const postLink = document.createElement('a');
    postLink.href = `../Post_detail/post_detail.html?postId=${post.post_id}`;
    postLink.appendChild(postCardInner);

    li.appendChild(postLink);

    postList.appendChild(li);
  });
}



sidebarCollapseBtn.addEventListener('click', function () {
  sidebar.classList.add('collapsed');
  collapsedTopbar.hidden = false;
});

sidebarExpandBtn.addEventListener('click', function () {
  sidebar.classList.remove('collapsed');
  collapsedTopbar.hidden = true;
});
