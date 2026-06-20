let currentUser = null;

// ----------------------
// ユーザー読み込み
// ----------------------
window.addEventListener("load", () => {
    loadUser();
    updateTopRight();
    loadPosts();
});

// ----------------------
// 登録
// ----------------------
async function register() {
    const id = document.getElementById("regId").value;
    const name = document.getElementById("regName").value;
    const pw = document.getElementById("regPw").value;

    await window.fs.addDoc(
        window.fs.collection(window.db, "users"),
        {
            accountId: id,
            nickname: name,
            password: pw
        }
    );

    alert("登録完了");
    showPage("loginPage");
}

// ----------------------
// ログイン
// ----------------------
async function login() {
    const id = document.getElementById("loginId").value;
    const pw = document.getElementById("loginPw").value;

    const snap = await window.fs.getDocs(
        window.fs.collection(window.db, "users")
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

// ----------------------
// 投稿
// ----------------------
async function addPost() {
    const text = document.getElementById("postInput").value.trim();
    if (!text) return;

    await window.fs.addDoc(
        window.fs.collection(window.db, "posts"),
        {
            text,
            nickname: currentUser?.nickname || "名無し",
            createdAt: window.fs.serverTimestamp()
        }
    );

    document.getElementById("postInput").value = "";
}

// ----------------------
// 投稿読み込み（重要修正済み）
// ----------------------
function loadPosts() {
    const posts = document.getElementById("posts");

    const q = window.fs.query(
        window.fs.collection(window.db, "posts"),
        window.fs.orderBy("createdAt", "desc")
    );

    window.fs.onSnapshot(q, (snap) => {

        console.log("snapshot:", snap.size);

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

// ----------------------
// ユーザー保存
// ----------------------
function loadUser() {
    const u = localStorage.getItem("user");
    if (u) currentUser = JSON.parse(u);
}

// ----------------------
// 右上UI
// ----------------------
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

// ----------------------
// プロフィール
// ----------------------
function renderProfile() {
    const el = document.getElementById("profileInfo");
    if (!currentUser) return;

    el.innerHTML = `
        <p>ID: ${currentUser.accountId}</p>
        <p>名前: ${currentUser.nickname}</p>
    `;
}

// ----------------------
// ページ切り替え
// ----------------------
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => {
        p.style.display = "none";
    });

    document.getElementById(id).style.display = "block";
}

// ----------------------
// expose
// ----------------------
window.register = register;
window.login = login;
window.addPost = addPost;
window.showPage = showPage;
