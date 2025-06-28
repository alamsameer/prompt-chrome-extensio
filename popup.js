// Remove existing popup if already open
const existing = document.getElementById("prompt-popup");
if (existing) {
    existing.remove();
} else {
    const popup = document.createElement("div");
    popup.id = "prompt-popup";
    popup.style = `
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        border: 2px solid #333;
        border-radius: 16px;
        padding: 24px 20px 20px 20px;
        z-index: 9999;
        width: 340px;
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #111;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        transition: box-shadow 0.2s;
    `;

    const title = document.createElement("h3");
    title.textContent = "Prompt List";
    title.style = `
        margin-top: 0;
        margin-bottom: 18px;
        font-size: 1.3em;
        color: #111;
        letter-spacing: 0.5px;
        font-weight: 600;
        text-align: center;
    `;
    popup.appendChild(title);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter new prompt...";
    input.style = `
        width: 100%;
        padding: 10px 12px;
        margin-bottom: 12px;
        box-sizing: border-box;
        border: 1.5px solid #bbb;
        border-radius: 6px;
        font-size: 15px;
        color: #111;
        background: #fafbfc;
        outline: none;
        transition: border 0.2s;
    `;
    input.onfocus = () => (input.style.border = "1.5px solid #333");
    input.onblur = () => (input.style.border = "1.5px solid #bbb");
    popup.appendChild(input);

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.style = `
        margin-bottom: 16px;
        padding: 8px 18px;
        cursor: pointer;
        background: linear-gradient(90deg, #f8d90f 0%, #fcb900 100%);
        border: none;
        border-radius: 5px;
        color: #111;
        font-weight: 600;
        font-size: 15px;
        box-shadow: 0 2px 8px rgba(252,185,0,0.08);
        transition: background 0.2s;
    `;
    saveBtn.onmouseover = () => (saveBtn.style.background = "#ffe066");
    saveBtn.onmouseout = () => (saveBtn.style.background = "linear-gradient(90deg, #f8d90f 0%, #fcb900 100%)");
    popup.appendChild(saveBtn);

    const list = document.createElement("div");
    list.style = `
        margin-bottom: 10px;
        max-height: 180px;
        overflow-y: auto;
    `;
    popup.appendChild(list);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style = `
        display: block;
        margin: 18px auto 0 auto;
        background: #f3f3f3;
        color: #111;
        border: none;
        border-radius: 5px;
        padding: 8px 18px;
        cursor: pointer;
        font-size: 15px;
        font-weight: 500;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        transition: background 0.2s;
    `;
    closeBtn.onmouseover = () => (closeBtn.style.background = "#e0e0e0");
    closeBtn.onmouseout = () => (closeBtn.style.background = "#f3f3f3");
    closeBtn.onclick = () => popup.remove();
    popup.appendChild(closeBtn);

    document.body.appendChild(popup);

    const PROMPT_KEY = "user_prompts";

    function loadPrompts() {
        const stored = localStorage.getItem(PROMPT_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    function savePrompts(prompts) {
        localStorage.setItem(PROMPT_KEY, JSON.stringify(prompts));
    }

    function renderList() {
        list.innerHTML = "";
        const prompts = loadPrompts();
        prompts.forEach((prompt, i) => {
            const btn = document.createElement("button");
            btn.textContent = prompt;
            btn.style = `
                display: block;
                margin: 5px 0;
                width: 100%;
                text-align: left;
                padding: 9px 10px;
                font-size: 15px;
                cursor: pointer;
                border: none;
                border-radius: 5px;
                background: #f7f7f7;
                color: #111;
                transition: background 0.18s;
                font-family: inherit;
                font-weight: 500;
            `;
            btn.onmouseover = () => (btn.style.background = "#ffe066");
            btn.onmouseout = () => (btn.style.background = "#f7f7f7");

            btn.onclick = () => {
                let inputBox = document.activeElement;

                const isValid =
                    inputBox &&
                    (inputBox.tagName === "TEXTAREA" ||
                        (inputBox.tagName === "INPUT" &&
                            (inputBox.type === "text" || inputBox.type === "search")));

                if (isValid) {
                    inputBox.focus();
                    inputBox.value = prompt;
                } else {
                    // Try to find any input or textarea
                    inputBox = document.querySelector(
                        "textarea, input[type='text'], input[type='search']"
                    );
                    if (inputBox) {
                        inputBox.focus();
                        inputBox.value = prompt;
                    } else {
                        alert("No text input or textarea found.");
                    }
                }

                popup.remove();
            };

            list.appendChild(btn);
        });
    }

    function handleSave() {
        const val = input.value.trim();
        if (!val) return;
        const prompts = loadPrompts();
        prompts.push(val);
        savePrompts(prompts);
        input.value = "";
        renderList();
    }

    saveBtn.onclick = handleSave;
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleSave();
        }
    });

    renderList();
}
