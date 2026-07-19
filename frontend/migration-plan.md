# FitMate React 마이그레이션 순서 및 단계별 계획

> 근거 자료: `react-migration-analysis.md`, `react-migration-design.md`(컴포넌트 트리 & 상태 설계)
> 이 문서는 위 설계를 실제로 구현할 때의 단계 구분과 각 단계별 목표/리스크/AI 활용 계획을 정리합니다.

## 순서 검토

전체 골격(공용 요소 → 의존성 없는 페이지 → 단순 목록 → 공용 폼 → 최고난도 페이지 → 나머지)은 타당하다. 다만 실제 코드를 훑어보니 조정하면 좋을 지점이 세 가지 있다.

1. **0단계 범위 누락** — 나열한 목록(AppLayout, Sidebar, Header, ConfirmModal, Toast, 유틸함수들)에 `useAuth`(Context)와 `ValidatedField`가 빠져 있다. 그런데 1단계(Login)는 로그인 성공 시 토큰을 저장하는 곳(`useAuth`)과 이메일/비밀번호 검증 UI(`ValidatedField`+`validators.js`)에 바로 의존한다. 0단계에 명시적으로 넣지 않으면 1단계 도중 즉흥적으로 만들게 되어 "한 PR" 경계가 흐려진다.

2. **`response.data.link` 문제** — Login/Signup/Post Write/Post Edit/회원탈퇴가 전부 성공 시 `window.location.href = response.data.link`로 이동하는데, `Login.js:74`, `Signup.js:195` 등을 보면 이 `link`는 백엔드가 내려주는 정적 HTML 파일 경로(`../Post_detail/post_detail.html?postId=...` 형태)로 보인다. React Router의 `navigate()`는 이 문자열을 그대로 못 쓴다 — 파싱해서 라우트 경로로 변환하거나 백엔드 응답 형식을 바꿔야 한다. 1단계(Login)에서 처음 마주치니, 거기서 처리 방식을 정해두면 2·3·5단계에서 같은 고민을 반복 안 해도 된다.

3. **4단계가 여전히 크다** — mini-vdom 제거 + 댓글 CRUD + 좋아요/신고 + React.memo 최적화가 한 커밋에 다 들어가면 "하나의 PR로 마무리" 원칙과 부딪힐 수 있다. 단계 번호는 그대로 두고, 커밋만 "4-1: 게시글 표시/삭제/좋아요/신고" → "4-2: 댓글 CRUD + React.memo 최적화"로 쪼개는 것을 권장한다.

나머지는 그대로 유효하다 — Post Edit(3단계)의 프리필은 Post Detail과 별개 엔드포인트(`GET /posts/:id/edit`, `post_edit.js:67`)를 쓰므로 4단계보다 먼저 와도 의존성 문제 없다.

---

## [0단계] 공용 요소 구축

**목표**: AppLayout(레이아웃 라우트)+Sidebar+Header+ConfirmModal+Toast+useAuth(Context)+ValidatedField+validators.js+format.js가 각각 독립적으로 렌더링/동작 확인 가능한 상태.

**포함 범위**: AppLayout, Sidebar, Header/ProfileDropdown, ConfirmModal, Toast/useToast, useAuth(AuthContext), ValidatedField, validators.js, format.js, 라우터 최상위 설정(레이아웃 라우트 구조)

**예상 어려움**:
- AppLayout의 "페이지 전환해도 Sidebar 상태 유지" 여부는 실제 페이지가 최소 2개는 붙어야 검증 가능 — 0단계에서는 눈으로 100% 확인이 안 되고 2단계(Board)에서야 실제 검증된다.
- Login은 `input` 이벤트마다 검증, Signup/Password Edit는 `blur` 이벤트에서 검증 — 기존 3개 페이지가 검증 타이밍이 다르다. `ValidatedField`가 이 차이를 prop(`validateOn="input"|"blur"`)으로 받을지 결정 필요.
- `request.js`의 401 처리에 `//window.location.href = '/login.html'`처럼 주석 처리된 리다이렉트가 있다 — 의도적으로 비활성화한 것인지 불명확. `useAuth` 만들 때 건드릴지 그대로 둘지 결정 필요.

**AI 활용 계획**:
- AI에게 물어보면 좋은 것: AppLayout/Sidebar/Header/ConfirmModal/Toast 초기 컴포넌트 코드 초안, React Router 레이아웃 라우트 설정, validators.js/format.js 리팩터링
- 직접 코드 레벨로 검증해야 하는 지점:
  - AuthContext가 새로고침 후에도 로그인 상태를 유지하는지(localStorage 동기화가 양방향인지 직접 diff로 확인)
  - ValidatedField의 검증 타이밍 prop이 각 소비처(Login=input, Signup/Password=blur)에 맞게 실제로 전달되는지 호출부 코드 확인
  - request.js 401 처리를 건드렸다면 정확히 무엇이 바뀌었는지 diff 확인
- AI 제안을 그대로 믿으면 안 되는 부분:
  - **[인증/보안]** AI가 "이 참에 401 처리도 개선하자"며 주석 처리된 리다이렉트를 활성화하거나 토큰 저장 방식을 바꾸자고 제안할 수 있다 — 보안 정책 변경은 반드시 별도로 명시적 결정 필요
  - AI가 만든 `useAuth`의 토큰 만료 자동 처리 등은 기존에 없던 "새 기능"일 수 있다 — 동일 동작 재현 범위를 벗어나는지 항상 구분

**AI 사용할 작업 리스팅**:
- [ ] (AI) AppLayout 컴포넌트 JSX 변환
- [ ] (AI) Sidebar 컴포넌트 변환(collapsed 로컬 상태 포함)
- [ ] (AI 초안 + 검증) React Router 레이아웃 라우트 구조(`<Outlet />` 배치) 설정
- [ ] (AI 초안 + 검증) Header/ProfileDropdown 컴포넌트 변환 + 로그아웃 로직
- [ ] (AI) ConfirmModal 범용 컴포넌트화
- [ ] (AI) Toast/useToast 훅 구현
- [ ] (AI 초안 + 검증) validators.js 정규식 추출(원본과 글자 단위 대조 필요)
- [ ] (AI) format.js 순수 함수 추출
- [ ] (AI 초안 + 검증) useAuth(AuthContext) 구현(토큰 저장/조회 흐름)
- [ ] (AI 초안 + 검증) ValidatedField 컴포넌트(검증 타이밍 prop 포함) 설계
- [ ] (사람) request.js 401 처리 로직(주석 처리된 리다이렉트)을 건드릴지 결정
- [ ] (사람) AppLayout을 레이아웃 라우트로 배치한 뒤 Sidebar 상태 유지 여부 임시 검증

**AI 사용 로그**:
| 무엇을 시켰나 | AI 제안 요약 | 어떻게 검증했나 | 채택·수정·폐기 + 이유 |
|---|---|---|---|
| | | | |

**검증 체크리스트**:
- [ ] AppLayout이 레이아웃 라우트로 배치되어, 임시로 2개 이상 자식 라우트를 붙였을 때 Sidebar 접힘 상태가 전환 후에도 유지되는가
- [ ] Sidebar 접힘/펼침 토글이 기존과 동일하게 동작하는가
- [ ] Header 드롭다운 열기/닫기가 기존 동작과 동일한가
- [ ] 로그아웃 클릭 시 accessToken 삭제 + 로그인 페이지 이동이 정확한가
- [ ] ConfirmModal이 기존 3곳(게시글 삭제/댓글 삭제/회원탈퇴) 각각에 props만으로 대입해도 동일하게 동작하는가
- [ ] Toast가 2초 후 자동으로 사라지는 기존 동작과 동일한가
- [ ] validators.js의 이메일/비밀번호 정규식이 기존 4곳과 글자 하나까지 동일한가
- [ ] format.js의 formatCount/formatDateTime이 기존 출력과 동일한 포맷인가
- [ ] useAuth가 저장한 토큰이 새로고침 후에도 유지되는가

**계획 대비 변경점**: (진행 중 채울 것)

**소요 시간**: (진행 중 채울 것)

---

## [1단계] Login / Signup

**목표**: 로그인/회원가입 페이지가 React로 완전히 전환되어, 로그인 성공 시 토큰 저장 후 이동, 회원가입 성공/실패(409 중복) 처리까지 기존과 동일하게 끝난 상태.

**포함 범위**: LoginPage, LoginForm, SignupPage, SignupForm, ProfileImageUploader(최초 사용)

**예상 어려움**:
- Login(input 검증)과 Signup(blur 검증)의 타이밍 차이를 정확히 반대로 적용해야 한다.
- Signup은 페이지 로드 즉시 프로필 이미지 필드가 "미입력 에러" 상태로 미리 세팅된다(`setProfileInvalid()`가 로드 즉시 호출, `Signup.js:37`) — 마운트 직후부터 에러 상태로 시작하는 폼이라는 점을 재현해야 한다.
- `response.data.link` 이동 — 검토 코멘트의 SPA 라우트 변환 문제를 이 단계에서 결정한다.
- Login 응답 구조가 `response.data.jwtToken.accessToken`으로 한 겹 더 감싸져 있다 — AuthContext 저장 코드에서 이 경로를 정확히 맞춰야 한다.

**AI 활용 계획**:
- AI에게 물어보면 좋은 것: LoginForm/SignupForm 코드 변환 초안, 5개 필드 검증을 errors 객체로 통합, 409 에러 필드별 매핑
- 직접 코드 레벨로 검증해야 하는 지점:
  - Signup 제출 버튼 활성화 조건이 원본(`isValidEmail && ... && isValidProfile` 전부 true)과 React 버전(`Object.values(errors).some(Boolean)` 등)이 논리적으로 동치인지 손으로 대응 확인
  - 409 에러가 email/nickname 필드에 원본 catch 블록(`Signup.js:198-211`)과 1:1로 매핑되는지 비교
  - 로그인 성공 시 localStorage에 저장되는 키/값이 정확히 기존과 같은 문자열인지 애플리케이션 탭에서 실제 값 확인
- AI 제안을 그대로 믿으면 안 되는 부분:
  - **[인증/보안]** 토큰 저장 위치/시점을 AI가 "더 안전한 방식"이라며 바꾸자고 제안할 수 있다 — 별도 논의 없이 수용 금지
  - 비밀번호 정규식을 AI가 "가독성을 위해" 재작성하면 한 글자 차이로 통과/실패 조건이 달라지므로 원본과 글자 단위 대조 필수

**AI 사용할 작업 리스팅**:
- [ ] (AI) LoginForm/SignupForm JSX 변환
- [ ] (AI) 기존 정규식(validators.js) 연결
- [ ] (AI 초안 + 검증) Login=input, Signup=blur 검증 타이밍 각각 올바르게 적용
- [ ] (AI 초안 + 검증) Signup 5개 필드 검증을 errors 객체로 통합
- [ ] (AI 초안 + 검증) Signup 409 에러 필드별(email/nickname) 매핑 처리
- [ ] (AI 초안 + 검증) Signup 마운트 시 프로필 이미지 필드 초기 에러 상태 재현
- [ ] (사람) `response.data.link`를 SPA 라우트 경로로 처리하는 방식 결정
- [ ] (AI 초안 + 검증) 결정된 방식대로 로그인/회원가입 성공 후 이동 로직 구현
- [ ] (AI 초안 + 검증) 로그인 성공 시 토큰 저장 코드(`response.data.jwtToken.accessToken` 경로) 구현
- [ ] (사람) 로그인 성공 후 localStorage에 저장된 실제 값 확인

**AI 사용 로그**:
| 무엇을 시켰나 | AI 제안 요약 | 어떻게 검증했나 | 채택·수정·폐기 + 이유 |
|---|---|---|---|
| | | | |

**검증 체크리스트**:
- [ ] Login: 이메일 형식이 잘못되면 타이핑 중 즉시 에러가 뜨는가
- [ ] Login: 이메일/비밀번호 둘 다 유효해야 로그인 버튼이 활성화되는가
- [ ] Login: 로그인 성공 시 정확한 키로 토큰 저장 + `link`로 이동하는가
- [ ] Signup: 진입 즉시 프로필 이미지 필드가 에러 상태로 보이는가
- [ ] Signup: 각 필드가 blur 시점에 검증되는가
- [ ] Signup: 비밀번호/확인 필드가 서로 참조해서 일치 여부까지 검증되는가
- [ ] Signup: 닉네임 10자 초과/공백 포함/미입력 각각 다른 에러 문구가 뜨는가
- [ ] Signup: 5개 필드 전부 유효해야만 버튼이 활성화되는가
- [ ] Signup: 이메일/닉네임 중복(409) 시 각각 해당 필드에만 에러가 뜨는가
- [ ] `response.data.link` 이동이 React Router 환경에서도 올바른 페이지로 연결되는가

**계획 대비 변경점**: (진행 중 채울 것)

**소요 시간**: (진행 중 채울 것)

---

## [2단계] Board

**목표**: 게시글 목록 무한 스크롤이 정상 동작하고, AppLayout 안에서 Sidebar/Header 상태가 실제로 유지되는 것까지 확인된 상태(0단계에서 유보한 검증이 처음 실현됨).

**포함 범위**: BoardPage, BoardMain, PostList, PostCard, InfiniteScrollStatus, ScrollSentinel, useInfinitePosts

**예상 어려움**:
- 최초 로드도 별도 useEffect가 아니라 IntersectionObserver가 처음부터 sentinel이 보이는 상태를 감지해서 트리거한다(`board.js:39-68`) — React에서 "마운트 시 fetch하는 useEffect"와 "observer 콜백"을 둘 다 만들면 첫 페이지가 중복 요청될 위험이 있다.
- 다음 페이지 존재 여부는 "응답 개수가 정확히 `LIMIT(7)`과 같은지"로 판단한다(`posts.length === LIMIT`) — 이 경계 조건을 놓치기 쉽다.
- 로딩/빈목록/에러 3가지 상태가 각각 별도 DOM 토글로 되어 있어, `InfiniteScrollStatus`의 `status` prop이 정확히 구분해야 한다.

**AI 활용 계획**:
- AI에게 물어보면 좋은 것: useInfinitePosts 훅 초안(IntersectionObserver를 useEffect+ref로 감싸는 패턴), PostCard 아이콘 SVG 컴포넌트화
- 직접 코드 레벨로 검증해야 하는 지점:
  - cursor 갱신 로직과 "정확히 LIMIT개일 때만 관찰 계속" 조건을 그대로 옮겼는지 조건문 대조
  - 마운트 시 첫 요청이 정확히 1번만 나가는지 네트워크 탭에서 확인(StrictMode 이중 렌더링과 착각하지 않도록 프로덕션 빌드 기준으로)
  - useEffect cleanup에서 IntersectionObserver를 정확히 해제하는지
- AI 제안을 그대로 믿으면 안 되는 부분:
  - AI가 "성능을 위해" 가상 스크롤/캐싱을 같이 제안할 수 있다 — 원본에 없던 기능 확장이므로 이번 범위에 포함할지 별도 판단

**AI 사용할 작업 리스팅**:
- [ ] (AI) PostCard/PostList 컴포넌트 JSX 변환
- [ ] (AI) InfiniteScrollStatus/ScrollSentinel 컴포넌트 변환
- [ ] (AI 초안 + 검증) useInfinitePosts 훅 구현(IntersectionObserver + fetch)
- [ ] (AI 초안 + 검증) cursor 종료 조건(`posts.length === LIMIT`) 정확히 재현
- [ ] (AI 초안 + 검증) useEffect cleanup에서 IntersectionObserver 해제 처리
- [ ] (사람) 마운트 시 첫 요청이 정확히 1번만 나가는지 네트워크 탭 실측
- [ ] (사람) Board ↔ 다른 페이지 왕복 시 Sidebar 상태 유지 여부 실제 확인

**AI 사용 로그**:
| 무엇을 시켰나 | AI 제안 요약 | 어떻게 검증했나 | 채택·수정·폐기 + 이유 |
|---|---|---|---|
| | | | |

**검증 체크리스트**:
- [ ] 최초 진입 시 첫 페이지(7개)가 정확히 1번만 요청되는가
- [ ] sentinel이 보일 때마다 다음 페이지가 이어서 로드되는가
- [ ] 마지막 페이지(응답 개수 < 7)에서 더 이상 요청이 안 나가는가
- [ ] 빈 목록/에러 문구가 각각 올바른 조건에서 뜨는가
- [ ] PostCard의 통계 숫자가 1000 이상일 때 "1.2k" 형식으로 정확히 표시되는가
- [ ] PostCard 클릭 시 정확한 postId로 이동하는가
- [ ] Board ↔ 다른 페이지 왕복 시 Sidebar 접힘 상태가 유지되는가

**계획 대비 변경점**: (진행 중 채울 것)

**소요 시간**: (진행 중 채울 것)

---

## [3단계] Post Write / Post Edit

**목표**: 게시글 작성/수정 폼이 하나의 PostForm으로 공용화되어 두 페이지 모두 기존과 동일하게 동작.

**포함 범위**: PostWritePage, PostEditPage, PostForm(mode prop), ImageUploader

**예상 어려움**:
- 수정 진입 시 프리필은 별도 엔드포인트(`GET /posts/:id/edit`, `post_edit.js:67`)를 사용한다 — Post Detail 응답 구조와 혼동하지 않아야 한다.
- 이미지를 새로 선택하지 않으면 FormData에 이미지 필드 자체가 빠진다(`postImageInput.files.length > 0`일 때만 추가) — 기존 이미지 유지가 "필드 자체를 안 보낸다"는 전제에 기대고 있다. React 버전도 이 조건을 그대로 지켜야 이미지가 의도치 않게 삭제되지 않는다.
- `postImageInput.addEventListener('change', ...)`에서 파일 미선택 시에도 `URL.createObjectURL(file)`을 호출하는 잠재 버그(`post_write.js:46`, `post_edit.js:46`) — 그대로 승계할지 고칠지 결정 필요.

**AI 활용 계획**:
- AI에게 물어보면 좋은 것: PostForm(mode prop) 초안, FormData 구성 로직 통합
- 직접 코드 레벨로 검증해야 하는 지점:
  - 이미지 미선택 시 FormData에 이미지 필드가 정말 빠지는지 네트워크 탭에서 실제 전송 필드 확인
  - Edit 진입 시 `initialValues`가 어떤 응답에서 왔는지 추적(4단계 usePostDetail과 착각해 잘못 재사용하지 않았는지)
- AI 제안을 그대로 믿으면 안 되는 부분:
  - AI가 `URL.createObjectURL` 버그를 "당연히 고칠 버그"로 판단해 조용히 수정할 수 있다 — "동일 동작 재현"이 목표인지 "버그도 같이 수정"이 목표인지 먼저 정하고 AI 제안이 그 경계를 넘는지 확인

**AI 사용할 작업 리스팅**:
- [ ] (AI) PostForm(mode prop) 컴포넌트 JSX 변환
- [ ] (AI) ImageUploader 컴포넌트 변환
- [ ] (AI 초안 + 검증) FormData 구성 로직(이미지 유무에 따른 조건부 포함) 구현
- [ ] (AI 초안 + 검증) PostEditPage의 initialValues prefill 로직 구현
- [ ] (사람) `URL.createObjectURL` 관련 기존 버그를 그대로 승계할지 고칠지 결정
- [ ] (사람) 이미지 미변경 시 FormData에 이미지 필드가 실제로 빠지는지 네트워크 탭 확인

**AI 사용 로그**:
| 무엇을 시켰나 | AI 제안 요약 | 어떻게 검증했나 | 채택·수정·폐기 + 이유 |
|---|---|---|---|
| | | | |

**검증 체크리스트**:
- [ ] 제목/내용 둘 다 입력해야만 버튼이 활성화되는가
- [ ] 제목 글자수 카운터가 입력마다 정확히 갱신되는가
- [ ] 작성 성공 시 응답의 `link`로 이동하는가
- [ ] 수정 페이지 진입 시 기존 제목/내용/이미지 파일명이 정확히 채워지는가
- [ ] 이미지를 새로 선택하지 않고 수정해도 기존 이미지가 유지되는가
- [ ] 수정 성공 시 해당 게시글 상세로 정확히 이동하는가
- [ ] 제목/내용 비운 채 제출 시 alert가 뜨고 요청이 안 나가는가

**계획 대비 변경점**: (진행 중 채울 것)

**소요 시간**: (진행 중 채울 것)

---

## [4단계] Post Detail

**목표**: mini-vdom이 완전히 제거되고 React state로 대체된 상태에서, 게시글 표시/수정·삭제/좋아요/신고/댓글 CRUD가 기존과 동일하게 동작하며, React.memo 최적화까지 적용되어 좋아요 클릭 시 무관한 댓글이 리렌더링되지 않는 것까지 확인된 상태.

**포함 범위**: PostDetailPage, PostDetailMain, PostTopBar, PostHeader, PostEngagementRow, LikeButton, ReportButton, CommentSection, CommentForm, CommentList, CommentItem, ConfirmModal(게시글/댓글), usePostDetail, React.memo 적용

> 리뷰 부담이 크면 커밋을 "4-1: 게시글 표시+삭제+좋아요+신고" / "4-2: 댓글 CRUD+editingComment/deleteTarget 흐름+React.memo" 두 개로 나누는 것을 권장한다.

**예상 어려움 (mini-vdom 경험 참고 지점)**:
- `comments` 배열의 "조회 시 통째 교체, 생성 시 앞에 추가, 수정 시 해당 항목만 교체, 삭제 시 filter" 패턴(`post_detail.js:127` 주석, 부록 표)은 이미 한 번 검증해본 로직이라 그대로 `setComments`로 옮기면 된다 — 이 부분 자체의 리스크는 낮다.
- 원본은 `isEditing`과 `currentEditCommentId`를 별도 변수로 관리한다(둘이 항상 같이 간다는 암묵적 전제) — React에서 `editingComment !== null` 파생값 하나로 합칠 때, 원본에서 이 둘을 각각 초기화하던 모든 지점(`post_detail.js:369-371` 등)을 빠짐없이 `setEditingComment(null)` 하나로 옮겼는지 대조 필요.
- `currentDeleteItem`(DOM 참조)이 React에서는 불필요해지는데(부록 표), 원본에서 이 DOM 참조가 정말 저장만 되고 안 쓰였는지 다시 한번 grep해서 놓친 사용처가 없는지 확인.
- 좋아요 버튼이 `likeBtn.classList.contains('liked') && isLiked` 이중 조건으로 검사한다(`post_detail.js:404`) — React에서 `isLiked` state 하나로 단순화되면서 이 이중 조건에 원본이 의도한 특별한 이유가 있었는지 재현 전 재확인.
- React.memo 최적화는 원본에 없던 새 관심사라, 기능부터 원본과 완전히 맞춘 뒤 마지막에 얹는 순서를 권장한다(기능 문제와 최적화 문제가 섞이면 원인 구분이 어려움).

**AI 활용 계획**:
- AI에게 물어보면 좋은 것: usePostDetail 훅 초안(8개 API+상태 묶음), CommentItem/CommentList React.memo 적용 초안, useCallback/useMemo 의존성 배열 리뷰
- 직접 코드 레벨로 검증해야 하는 지점:
  - comments의 map/filter 불변 업데이트가 실제로 "변경 안 된 댓글의 참조를 유지"하는지 코드로 확인(React.memo 효과의 전제조건)
  - React.memo 적용 후 좋아요 클릭 시 댓글들이 리렌더링 안 되는지 React DevTools Profiler로 실측(느낌으로 판단 금지)
  - editingComment/deleteTargetCommentId 초기화 시점이 원본의 모든 지점(제출 성공/모달 취소/모달 확인)과 1:1 대응하는지 핸들러 대조
- AI 제안을 그대로 믿으면 안 되는 부분:
  - **[되돌릴 수 없는 작업]** 댓글/게시글 삭제 흐름에서 `onRequestDelete`와 `onConfirm`이 실수로 잘못 연결되어 확인 없이 바로 삭제되는 코드 경로가 생기지 않았는지 반드시 직접 클릭해서 확인
  - 신고 기능은 원본이 확인 절차 없이 바로 처리한다 — AI가 임의로 신고 사유 입력 등 원본에 없던 UI를 추가하지 않았는지 확인

**AI 사용할 작업 리스팅**:
- [ ] (AI) PostHeader/PostTopBar/LikeButton/ReportButton 컴포넌트 JSX 변환
- [ ] (AI) CommentList/CommentItem/CommentForm 컴포넌트 JSX 변환
- [ ] (AI 초안 + 검증) usePostDetail 훅(8개 API + 상태) 구현
- [ ] (AI 초안 + 검증) comments 배열 불변 업데이트(map/filter/spread) 구현
- [ ] (AI 초안 + 검증) editingComment/deleteTargetCommentId 통합 로직 구현
- [ ] (AI 초안 + 검증) React.memo 적용 대상 선정 및 적용
- [ ] (AI 초안 + 검증) useCallback/useMemo 의존성 배열 작성
- [ ] (사람) 게시글/댓글 삭제 확인 모달의 onConfirm/onCancel 연결이 실제로 맞는지 직접 클릭 검증
- [ ] (사람) 신고 기능에 원본에 없던 확인 UI가 추가되지 않았는지 확인
- [ ] (사람) React DevTools Profiler로 좋아요 클릭 시 무관한 CommentItem 리렌더링 여부 실측

**AI 사용 로그**:
| 무엇을 시켰나 | AI 제안 요약 | 어떻게 검증했나 | 채택·수정·폐기 + 이유 |
|---|---|---|---|
| | | | |

**검증 체크리스트**:
- [ ] 게시글 제목/작성자/날짜/이미지/본문이 기존과 동일하게 표시되는가
- [ ] 작성자 본인일 때만 수정/삭제 버튼이 보이는가
- [ ] 게시글 삭제 확인 모달의 취소/확인이 각각 정확히 동작하는가
- [ ] 좋아요 토글이 클릭마다 정확히 반대로 바뀌고 숫자가 서버 응답으로 갱신되는가
- [ ] 신고 버튼이 확인 없이 바로 처리되는 기존 동작이 유지되는가
- [ ] 댓글 등록 시 목록 맨 앞에 추가되는가
- [ ] 댓글 수정 버튼 클릭 시 입력창 프리필 + 버튼 라벨 변경이 되는가
- [ ] 댓글 수정 도중 다른 댓글의 수정 버튼을 누르면 입력창이 새 댓글 내용으로 덮어써지는가
- [ ] 댓글 삭제 확인 모달의 취소/확인이 각각 정확히 동작하는가
- [ ] 댓글 등록/삭제 시 댓글 개수가 정확히 갱신되는가
- [ ] 댓글이 많은 상태에서 좋아요 클릭 시 Profiler 기준 CommentItem들이 리렌더링 안 되는가
- [ ] 댓글 하나를 수정했을 때 그 댓글만 리렌더링되고 나머지는 안 되는가

**계획 대비 변경점**: (진행 중 채울 것)

**소요 시간**: (진행 중 채울 것)

---

## [5단계] Profile Edit / Password Edit

**목표**: 회원 정보 수정(닉네임/프로필사진/회원탈퇴)과 비밀번호 변경이 기존과 동일하게 동작.

**포함 범위**: ProfileEditPage, ProfileEditForm, PasswordEditPage, PasswordEditForm, ConfirmModal(회원탈퇴), Toast

**예상 어려움**:
- `profile_edit.js`는 `getUser`/`withdrawUser` 호출 시 `request.js`를 우회해 직접 `fetch`를 쓰던 부분이 있다(설계 문서 4절) — `request` 공용 함수로 통일하는 과정에서 인증 헤더/에러 처리가 실제로 달라지지 않는지 확인 필요.
- 닉네임은 blur, 프로필 이미지는 change 이벤트로 검증 트리거가 다르다 — 0단계 ValidatedField 정책과 별개로 이미지 업로더 쪽은 따로 처리해야 한다.
- "프로필이 유효하지 않으면 미리보기를 지운다"(`profile_edit.js:143-148`)는 부수효과가 있는데, `isValidProfile`이 최초 조회 이후 갱신되는 지점이 안 보인다 — 이미지를 안 바꾸고 저장했을 때 기존 미리보기가 잘못 지워지는 건 아닌지 재확인.
- 비밀번호 변경 성공 후 입력 필드를 직접 비운다 — React라면 `values` state 리셋을 깜빡하기 쉽다.

**AI 활용 계획**:
- AI에게 물어보면 좋은 것: ProfileEditForm/PasswordEditForm 코드 변환 초안, `request` 공용 함수로 통일하는 리팩터링
- 직접 코드 레벨로 검증해야 하는 지점:
  - `request`로 통일 후 네트워크 탭에서 Authorization 헤더가 정확히 붙어 나가는지(우회했던 이유가 있었을 수도 있음)
  - 프로필 이미지를 안 바꾸고 닉네임만 바꿔 저장했을 때 기존 이미지가 사라지지 않는지 실제 요청 바디 확인
  - 비밀번호 변경 성공 후 입력 필드가 실제로 비워지는지
- AI 제안을 그대로 믿으면 안 되는 부분:
  - **[되돌릴 수 없는 작업]** 회원탈퇴 확인/취소 콜백이 뒤바뀌어 있지 않은지 반드시 직접 클릭해서 확인
  - **[인증/보안]** 비밀번호 변경 관련 코드에서 AI가 비밀번호를 console.log로 남기거나 state에 불필요하게 오래 유지하지 않는지 확인

**AI 사용할 작업 리스팅**:
- [ ] (AI) ProfileEditForm/PasswordEditForm 컴포넌트 JSX 변환
- [ ] (AI) 비밀번호 변경 성공 후 입력 필드 초기화 로직
- [ ] (AI 초안 + 검증) getUser/withdrawUser를 `request` 공용 함수로 치환
- [ ] (AI 초안 + 검증) 프로필 이미지 미변경 시 기존 이미지 유지 로직 구현
- [ ] (사람) 회원탈퇴 모달의 확인/취소 콜백이 실제로 맞는지 직접 클릭 검증
- [ ] (사람) 비밀번호 변경 관련 코드에 값이 로그로 남거나 불필요하게 오래 유지되지 않는지 확인

**AI 사용 로그**:
| 무엇을 시켰나 | AI 제안 요약 | 어떻게 검증했나 | 채택·수정·폐기 + 이유 |
|---|---|---|---|
| | | | |

**검증 체크리스트**:
- [ ] 진입 시 기존 이메일/닉네임/프로필사진이 정확히 채워지는가
- [ ] 닉네임 10자 초과/공백 포함/미입력 각각 에러 문구가 뜨는가
- [ ] 프로필 이미지 미선택 시 에러 문구가 뜨는가
- [ ] 닉네임/프로필 이미지 둘 다 유효해야 저장 버튼이 활성화되는가
- [ ] 닉네임 중복(409) 시 닉네임 필드에만 에러가 뜨는가
- [ ] 저장 성공 시 Toast + 헤더 프로필 아이콘 갱신이 되는가
- [ ] 이미지를 바꾸지 않고 닉네임만 바꿔도 기존 이미지가 유지되는가
- [ ] 회원탈퇴 모달 취소 시 탈퇴되지 않는가
- [ ] 회원탈퇴 확인 시 정확히 응답 `link`로 이동하는가
- [ ] 비밀번호 정규식 위반/불일치 시 각각 에러 문구가 뜨는가
- [ ] 비밀번호 변경 성공 시 Toast + 입력 필드 초기화가 되는가

**계획 대비 변경점**: (진행 중 채울 것)

**소요 시간**: (진행 중 채울 것)
