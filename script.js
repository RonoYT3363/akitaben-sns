function formatRelativeTime(date) {

    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff <= 5) return "たった今";
    if (diff < 60) return Math.floor(diff) + "秒前";

    const minutes = diff / 60;
    if (minutes < 60) return Math.floor(minutes) + "分前";

    const hours = minutes / 60;
    if (hours < 24) return Math.floor(hours) + "時間前";

    const days = hours / 24;
    if (days < 30) return Math.floor(days) + "日前";

    const months = days / 30;
    if (months < 12) return Math.floor(months) + "か月前";

    const years = months / 12;
    return Math.floor(years) + "年前";
}

async function addPost() {

    const input =
        document.getElementById("postInput");

    const text =
        input.value.trim();

    if (!text) {
        alert("文章を入力してください");
        return;
    }

    await firestoreFunctions.addDoc(
        firestoreFunctions.collection(
            db,
            "posts"
        ),
        {
            text: text,
            createdAt:
                firestoreFunctions.serverTimestamp()
        }
    );

    input.value = "";
}

window.addPost = addPost;

window.addEventListener("load", () => {

    const posts =
        document.getElementById("posts");

    const q =
        firestoreFunctions.query(
            firestoreFunctions.collection(
                db,
                "posts"
            ),
            firestoreFunctions.orderBy(
                "createdAt",
                "desc"
            )
        );

    firestoreFunctions.onSnapshot(
        q,
        (snapshot) => {

            posts.innerHTML = "";

            snapshot.forEach((doc) => {

                const data = doc.data();

                const post =
                    document.createElement("div");

                post.className = "post";

                const text =
                    document.createElement("p");

                text.textContent =
                    data.text || "";

                post.appendChild(text);

                const time =
                    document.createElement("span");

                time.className = "time";

                if (data.createdAt) {

                    time.textContent =
                        formatRelativeTime(
                            data.createdAt.toDate()
                        );

                } else {

                    time.textContent =
                        "送信中...";
                }

                post.appendChild(time);

                posts.appendChild(post);
            });
        }
    );
});

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById(
                "postInput"
            );

        input.addEventListener(
            "keydown",
            (e) => {

                if (
                    e.key === "Enter" &&
                    e.shiftKey
                ) {
                    return;
                }

                if (
                    e.key === "Enter"
                ) {

                    e.preventDefault();

                    addPost();
                }
            }
        );
    }
);

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.style.display =
                "none";
        });

    document
        .getElementById(pageId)
        .style.display =
        "flex";
}

window.showPage = showPage;
