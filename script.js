let currentUser = null;

// =====================
// 初期化
// =====================
window.addEventListener("load", () => {
    loadUser();
    updateTopRight();
    loadPosts();
});

// =====================
// 投稿作成
// =====================
async function addPost() {
    const text = document.getElementById("postInput").value.trim();

    if (!text) return;

    await fs.addDoc(
        fs.collection(db, "posts"),
        {
            text,
            nickname: currentUser?.nickname || "名無し",
            createdAt: fs.serverTimestamp()
        }
    );

    document.getElementById("postInput").value = "";
}

// =====================
// 投稿取得
// =====================
function loadPosts() {
    const posts = document.getElementById("posts");

    const q = fs.query(
        fs.collection(db, "posts"),
        fs.orderBy("createdAt", "desc")
    );

    fs.onSnapshot(q, (snap) => {
        console.log("posts:", snap.size);

        posts.innerHTML = "";

        snap.forEach(doc => {
            const p = doc.data();

            let timeText = "送信中...";

            if (p.createdAt) {
                const date = p.createdAt.toDate();

                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, "0");
                const dd = String(date.getDate()).padStart(2, "0");
                const hh = String(date.getHours()).padStart(2, "0");
                const mi = String(date.getMinutes()).padStart(2, "0");

                timeText = `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
            }

            const div = document.createElement("div");
            div.className = "post";

            div.innerHTML = `
                <div class="postHeader">
                    <b>${p.nickname || "名無し"}</b>
                </div>

                <div class="postText">
                    ${p.text || ""}
                </div>

                <div class="postTime">
                    ${timeText}
                </div>
            `;

            posts.appendChild(div);
        });
    });
}

// =====================
// 登録
// =====================
async function register() {
    const id = document.getElementById("regId").value;
    const name = document.getElementById("regName").value;
    const pw = document.getElementById("regPw").value;

    await fs.addDoc(
        fs.collection(db, "users"),
        {
            accountId: id,
            nickname: name,
            password: pw
        }
    );

    alert("登録完了");
    showPage("loginPage");
}

// =====================
// ログイン
// =====================
async function login() {
    const id = document.getElementById("loginId").value;
    const pw = document.getElementById("loginPw").value;

    const snap = await fs.getDocs(
        fs.collection(db, "users")
    );

    snap.forEach(doc => {
        const u = doc.data();

        if (
            u.accountId === id &&
            u.password === pw
        ) {
            currentUser = u;

            localStorage.setItem(
                "user",
                JSON.stringify(u)
            );
        }
    });

    updateTopRight();
    showPage("homePage");
}

// =====================
// ユーザー読込
// =====================
function loadUser() {
    const u = localStorage.getItem("user");

    if (u) {
        currentUser = JSON.parse(u);
    }
}

// =====================
// 右上ボタン更新
// =====================
function updateTopRight() {
    const btn =
        document.getElementById("accountBtn");

    if (!currentUser) {
        btn.textContent = "アカウント作成";

        btn.onclick = () =>
            showPage("registerPage");
    } else {
        btn.textContent =
            currentUser.nickname;

        btn.onclick = () =>
            showPage("profilePage");

        renderProfile();
    }
}

// =====================
// プロフィール表示
// =====================
function renderProfile() {
    const el =
        document.getElementById(
            "profileInfo"
        );

    if (!currentUser) return;

    el.innerHTML = `
        <p>ID: ${currentUser.accountId}</p>
        <p>名前: ${currentUser.nickname}</p>
    `;
}

// =====================
// ページ切替
// =====================
function showPage(id) {
    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.style.display = "none";
        });

    document.getElementById(id)
        .style.display = "block";
}

// =====================
// グローバル公開
// =====================
window.addPost = addPost;
window.register = register;
window.login = login;
window.showPage = showPage;
