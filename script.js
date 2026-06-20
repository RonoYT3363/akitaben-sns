let currentUser = null;

// --------------------
// 初期ロード
// --------------------
window.addEventListener("load", () => {
    loadUser();
    updateTopRight();
    loadPosts();
});

// --------------------
// ユーザー登録
// --------------------
async function register() {
    const id = document.getElementById("regId").value;
    const name = document.getElementById("regName").value;
    const pw = document.getElementById("regPw").value;

    if (!id || !name || !pw) return alert("全部入力して");

    await firestoreFunctions.addDoc(
        firestoreFunctions.collection(db, "users"),
        { accountId: id, nickname: name, password: pw }
    );

    alert("登録完了");
    showPage("loginPage");
}

// --------------------
// ログイン
// --------------------
async function login() {
    const id = document.getElementById("loginId").value;
    const pw = document.getElementById("loginPw").value;

    const snap = await firestoreFunctions.getDocs(
        firestoreFunctions.collection(db, "users")
    );

    snap.forEach(doc => {
        const u = doc.data();
        if (u.accountId === id && u.password === pw) {
            currentUser = u;
            localStorage.setItem("user", JSON.stringify(u));
        }
    });

    updateTopRight();
    showPage("homePage");
}

// --------------------
// ログアウト保持
// --------------------
function loadUser() {
    const u = localStorage.getItem("user");
    if (u) currentUser = JSON.parse(u);
}

// --------------------
// 右上UI更新
// --------------------
function updateTopRight() {
    const btn = document.getElementById("accountBtn");

    if (!currentUser) {
        btn.textContent = "アカウント作成";
        btn.onclick = () => showPage("registerPage");
    } else {
        btn.textContent = currentUser.nickname;
        btn.onclick = () => showPage("profilePage");
        renderProfile();
    }
}

// --------------------
// プロフィール表示
// --------------------
function renderProfile() {
    const el = document.getElementById("profileInfo");
    if (!currentUser) return;

    el.innerHTML = `
        <p>ID: ${currentUser.accountId}</p>
        <p>名前: ${currentUser.nickname}</p>
    `;
}

// --------------------
// 投稿
// --------------------
async function addPost() {
    const text = document.getElementById("postInput").value;

    if (!text) return;

    await firestoreFunctions.addDoc(
        firestoreFunctions.collection(db, "posts"),
        {
            text,
            nickname: currentUser?.nickname || "名無し"
        }
    );

    document.getElementById("postInput").value = "";
}

// --------------------
// 投稿表示
// --------------------
function loadPosts() {
    const posts = document.getElementById("posts");

    const q = firestoreFunctions.query(
        firestoreFunctions.collection(db, "posts"),
        firestoreFunctions.orderBy("createdAt", "desc")
    );

    firestoreFunctions.onSnapshot(q, snap => {
        posts.innerHTML = "";

        snap.forEach(doc => {
            const p = doc.data();

            const div = document.createElement("div");
            div.className = "post";

            div.innerHTML = `
                <b>${p.nickname}</b><br>
                ${p.text}
            `;

            posts.appendChild(div);
        });
    });
}

// --------------------
// ページ切り替え
// --------------------
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => {
        p.style.display = "none";
    });

    document.getElementById(id).style.display = "block";
}

window.register = register;
window.login = login;
window.addPost = addPost;
window.showPage = showPage;
