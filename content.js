// Prevent multiple script injections
if (window.promptManagerInjected) {
  // Script already exists, just toggle if this is an intentional call
  if (window.promptManagerIntentionalCall) {
    togglePromptManager();
    window.promptManagerIntentionalCall = false;
  }
} else {
  // First time injection - only initialize, don't show popup
  window.promptManagerInjected = true;
  initializePromptManager();

  // Only show popup if this is an intentional call
  if (window.promptManagerIntentionalCall) {
    createPromptManager();
    window.promptManagerIntentionalCall = false;
  }
}

function togglePromptManager() {
  const existingPopup = document.getElementById("prompt-manager-popup");
  const existingOverlay = document.getElementById("prompt-manager-overlay");

  if (existingPopup && existingOverlay) {
    existingOverlay.remove();
  } else {
    createPromptManager();
  }
}

function initializePromptManager() {
  // Create styles once
  if (!document.getElementById("prompt-manager-styles")) {
    const style = document.createElement("style");
    style.id = "prompt-manager-styles";
    style.textContent = `...`; // (unchanged CSS styles)
    document.head.appendChild(style);
  }

  // Track the last focused input element
  let lastFocusedElement = null;
  document.addEventListener("focusin", (e) => {
    if (isValidInputElement(e.target)) {
      lastFocusedElement = e.target;
      window.lastFocusedElement = e.target;
    }
  });

  // ❌ DO NOT call createPromptManager here
  // ✅ Popup will be created only if intentional call is true (already handled outside)
}

function isValidInputElement(element) {
  if (!element) return false;

  const validTags = ["TEXTAREA", "INPUT"];
  const validInputTypes = ["text", "search", "url", "email", "password", "tel"];

  return (
    (validTags.includes(element.tagName) &&
      (element.tagName === "TEXTAREA" ||
        validInputTypes.includes(element.type))) ||
    element.contentEditable === "true"
  );
}

function createPromptManager() {
  // Remove existing popup if already open
  const existingPopup = document.getElementById("prompt-manager-popup");
  const existingOverlay = document.getElementById("prompt-manager-overlay");
  if (existingPopup) existingPopup.remove();
  if (existingOverlay) existingOverlay.remove();

  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "prompt-manager-overlay";
  overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
    `;

  // Create main popup
  const popup = document.createElement("div");
  popup.id = "prompt-manager-popup";
  popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        width: 700px;
        max-width: 90vw;
        height: 700px;
        max-height: 90vh;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1f2937;
        z-index: 1000000;
        animation: slideIn 0.3s ease-out;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid #e5e7eb;
    `;

  // Header
  const header = document.createElement("div");
  header.style.cssText = `
        padding: 20px 24px;
        background: white;
        color: #1f2937;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e7eb;
    `;

  const title = document.createElement("h2");
  title.textContent = "Prompt Manager";
  title.style.cssText = `
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
    `;

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✕";
  closeBtn.style.cssText = `
        background: #f3f4f6;
        border: none;
        color: #6b7280;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    `;
  closeBtn.onmouseover = () => {
    closeBtn.style.background = "#e5e7eb";
    closeBtn.style.color = "#374151";
  };
  closeBtn.onmouseout = () => {
    closeBtn.style.background = "#f3f4f6";
    closeBtn.style.color = "#6b7280";
  };
  closeBtn.onclick = () => overlay.remove();

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Main content area
  const contentArea = document.createElement("div");
  contentArea.style.cssText = `
        flex: 1;
        padding: 24px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: white;
    `;

  // Add new prompt section
  const addSection = document.createElement("div");
  addSection.id = "add-prompt-section";
  addSection.style.cssText = `
        margin-bottom: 24px;
        padding: 12px;
        background: #2a2a2a;
        border-radius: 12px;
        border: 1px solid #404040;
    `;

  const sectionTitle = document.createElement("h3");
  sectionTitle.textContent = "Add New Prompt";
  sectionTitle.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
    `;

  const inputRow = document.createElement("div");
  inputRow.style.cssText = `
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
        align-items: center;
    `;

  const promptInput = document.createElement("input");
  promptInput.type = "text";
  promptInput.placeholder = "Enter you prompt here";
  promptInput.style.cssText = `
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #404040;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        font-family: inherit;
        color: #e5e5e5;
        background: #1a1a1a;
        transition: border-color 0.2s;
    `;
  // 1. Fix the focus/blur handlers for promptInput
  const handleOnFocuspromptInput = () => {
    promptInput.style.borderColor = "#6366f1";
    chooseCategoryContainer.style.display = "flex"; // Change to flex
    categoriesContainer.style.display = "none";
    renderCategories(); // Re-render to show choose categories
    console.log("focused");
  };

  const handleOnBlurpromptInput = () => {
    // Only hide if no category is chosen and input is empty
    if (!chosenCategory && !promptInput.value.trim()) {
      setTimeout(() => {
        promptInput.style.borderColor = "#404040";
        chooseCategoryContainer.style.display = "none";
        categoriesContainer.style.display = "flex"; // Change to flex
      }, 200); // Increased delay
    }
  };

  promptInput.onfocus = handleOnFocuspromptInput;
  promptInput.onblur = handleOnBlurpromptInput;

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Add prompt";
  saveBtn.style.cssText = `
        padding: 12px 24px;
        background: #6366f1;
        border: none;
        color: white;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.2s;
        white-space: nowrap;
    `;
  saveBtn.onmouseover = () => (saveBtn.style.background = "#5145e5");
  saveBtn.onmouseout = () => (saveBtn.style.background = "#6366f1");

  // Categories tabs
  // Categories section
  const categoriesLabel = document.createElement("div");
  categoriesLabel.textContent = "Categories";
  categoriesLabel.style.cssText = `
    color: #9ca3af;
    font-size: 14px;
    margin-bottom: 12px;
    font-weight: 500;
`;

  const categoriesParent = document.createElement("div");
  categoriesParent.id = "categories-parent";
  categoriesParent.style.cssText = `
    display: flex;
    flex-direction: row;
    gap: 12px;
    justify-content: space-between;
    position: relative;
`;

  const categoriesContainer = document.createElement("div");
  categoriesContainer.style.cssText = `
    display: flex;
    padding: 0 24px;
    overflow-x: auto;
    gap: 10px;
    width: 90%;
`;
  inputRow.appendChild(promptInput);

  const categoriesAddBtn = document.createElement("button");
  categoriesAddBtn.id = "categories-add-btn";
  categoriesAddBtn.textContent = "+";
  categoriesAddBtn.style.cssText = `
    padding: 12px 12px;
    background: #6366f1;
    border: none;
    color: white;
    width: 50px;
    height: 50px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    white-space: nowrap;
    text-align: center;
    opacity: 1;
    transform: scale(1);
`;

  // Create category input (initially hidden)
  const categoryInput = document.createElement("input");
  categoryInput.id = "category-input";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter category";
  categoryInput.style.cssText = `
    width: 50px;
    height: 50px;
    padding: 0 12px;
    border: 2px solid #6366f1;
    background: white;
    color: #333;
    border-radius: 50%;
    font-size: 14px;
    opacity: 0;
    transform: scale(0);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: absolute;
    right: 0;
`;

  // Function to toggle between add button and input
  function toggleCategoryInput() {
    const addBtn = document.getElementById("categories-add-btn");
    const input = document.getElementById("category-input");

    if (input.style.opacity === "0" || input.style.opacity === "") {
      // Hide button with animation
      addBtn.style.transform = "scale(0)";
      addBtn.style.opacity = "0";

      setTimeout(() => {
        // Show input with animation
        input.style.opacity = "1";
        input.style.transform = "scale(1)";
        input.style.width = "150px";
        input.style.borderRadius = "25px";
        input.focus();
      }, 150);
    } else {
      // Hide input with animation
      input.style.opacity = "0";
      input.style.transform = "scale(0)";
      input.style.width = "50px";
      input.style.borderRadius = "50%";

      setTimeout(() => {
        // Show button with animation
        addBtn.style.transform = "scale(1)";
        addBtn.style.opacity = "1";
      }, 150);
    }
  }

  // Function to handle category input submission
  function handleCategoryInput(event) {
    if (event.key === "Enter") {
      const input = event.target;
      const categoryValue = input.value.trim();

      if (categoryValue) {
        const prompts = getPrompts();
        // add this  new  catgorry
        prompts[categoryValue] = [];
        savePrompts(prompts);
        renderCategories();
        renderPrompts();
        // Clear input
        input.value = "";
      }

      // Hide input and show add button
      toggleCategoryInput();
    }
  }

  // when user  click to  enter  the  prompt  , then catrogryparent  will show  choose  category label
  // and  chosecategory container  , it  will  show  the   the list to chose  user  can chose and  then hir  add prompt
  // when  user  will  add it will show the  normal category

  // Add event listeners
  categoriesAddBtn.addEventListener("click", toggleCategoryInput);
  categoryInput.addEventListener("keypress", handleCategoryInput);

  const chooseCategoryContainer = document.createElement("div");
  chooseCategoryContainer.style.cssText = `
      display: none; // Initially hidden
      padding: 0 24px;
      overflow-x: auto;
      gap: 10px;
      width: 90%;
  `;
  // Append elements to parent
  categoriesParent.appendChild(categoriesContainer);
  categoriesParent.appendChild(chooseCategoryContainer);
  categoriesParent.appendChild(categoriesAddBtn);
  categoriesParent.appendChild(categoryInput);

  inputRow.appendChild(saveBtn);
  addSection.appendChild(sectionTitle);
  addSection.appendChild(inputRow);
  addSection.appendChild(categoriesLabel);
  addSection.appendChild(categoriesParent);
  // Prompts list header
  const listHeader = document.createElement("div");
  listHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    `;

  const listTitle = document.createElement("h3");
  listTitle.textContent = "Saved Prompts";
  listTitle.style.cssText = `
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
    `;

  listHeader.appendChild(listTitle);

  // Prompts list
  const promptsList = document.createElement("div");
  promptsList.style.cssText = `
        flex: 1;
        overflow-y: auto;
        display: grid;
        gap: 8px;
        max-height: 280px;
    `;
  promptsList.className = "scrollbar";

  contentArea.appendChild(addSection);
  contentArea.appendChild(listHeader);
  contentArea.appendChild(promptsList);

  popup.appendChild(header);
  // popup.appendChild(categoriesContainer);
  popup.appendChild(contentArea);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Click outside to close
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  // Data management
  let currentCategory = "All";

  function getPrompts() {
    const stored = localStorage.getItem("prompt_manager_data");
    return stored ? JSON.parse(stored) : {};
  }

  function savePrompts(data) {
    localStorage.setItem("prompt_manager_data", JSON.stringify(data));
  }

  function getCategories() {
    const prompts = getPrompts();
    const categories = new Set(["All"]);
    Object.keys(prompts).forEach((category) => categories.add(category));
    return Array.from(categories);
  }
  let chosenCategory = "";
  function renderCategories() {
    categoriesContainer.innerHTML = "";
    chooseCategoryContainer.innerHTML = "";
    const categories = getCategories();

    categories.forEach((category, index) => {
      const tab = document.createElement("button");
      const choosetab = document.createElement("button");

      choosetab.textContent = category;
      tab.textContent = category;

      tab.className = `category-tab ${
        category === currentCategory ? "active" : ""
      }`;
      choosetab.className = `category-tab ${
        category === chosenCategory ? "active" : ""
      }`;

      // Fixed styling for normal categories
      tab.style.cssText = `
            padding: 8px 16px;
            border: none;
            background: ${category === currentCategory ? "#6366f1" : "#f3f4f6"};
            color: ${category === currentCategory ? "white" : "#6b7280"};
            cursor: pointer;
            border-radius: 6px;
            font-weight: 500;
            font-size: 13px;
            transition: all 0.2s;
            white-space: nowrap;
        `;

      // Fixed styling for choose categories
      choosetab.style.cssText = `
            padding: 8px 16px;
            border: none;
            background: ${category === chosenCategory ? "#6366f1" : "#f3f4f6"};
            color: ${category === chosenCategory ? "white" : "#6b7280"};
            cursor: pointer;
            border-radius: 6px;
            font-weight: 500;
            font-size: 13px;
            transition: all 0.2s;
            white-space: nowrap;
        `;

      // Fixed hover effects for normal categories
      if (category !== currentCategory) {
        tab.onmouseover = () => {
          tab.style.background = "#e5e7eb";
          tab.style.color = "#374151";
        };
        tab.onmouseout = () => {
          tab.style.background = "#f3f4f6";
          tab.style.color = "#6b7280";
        };
      }

      // Fixed hover effects for choose categories
      if (category !== chosenCategory) {
        choosetab.onmouseover = () => {
          choosetab.style.background = "#e5e7eb";
          choosetab.style.color = "#374151";
        };
        choosetab.onmouseout = () => {
          choosetab.style.background = "#f3f4f6";
          choosetab.style.color = "#6b7280";
        };
      }

      // Click handlers
      tab.onclick = () => {
        currentCategory = category;
        renderCategories();
        renderPrompts();
      };

      choosetab.onclick = () => {
        chosenCategory = category;
        renderCategories();
        console.log("chosen category:", chosenCategory);
      };

      categoriesContainer.appendChild(tab);
      chooseCategoryContainer.appendChild(choosetab);
    });
  }
  // 5. Add this function to handle category selection better
  function selectCategory(category) {
    chosenCategory = category;
    renderCategories();

    // Hide choose container after selection
    setTimeout(() => {
      chooseCategoryContainer.style.display = "none";
      categoriesContainer.style.display = "flex";
    }, 100);
  }
  function renderPrompts() {
    promptsList.innerHTML = "";
    const allPrompts = getPrompts();
    let promptsToShow = [];

    if (currentCategory === "All") {
      Object.keys(allPrompts).forEach((category) => {
        allPrompts[category].forEach((prompt) => {
          promptsToShow.push({ text: prompt, category });
        });
      });
    } else {
      if (allPrompts[currentCategory]) {
        allPrompts[currentCategory].forEach((prompt) => {
          promptsToShow.push({ text: prompt, category: currentCategory });
        });
      }
    }

    if (promptsToShow.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = `
                text-align: center;
                color: #9ca3af;
                font-style: italic;
                padding: 40px 20px;
            `;
      empty.textContent =
        currentCategory === "All"
          ? "No prompts saved yet. Add your first prompt above!"
          : `No prompts in "${currentCategory}" category.`;
      promptsList.appendChild(empty);
      return;
    }

    promptsToShow.forEach((item, index) => {
      const promptBtn = document.createElement("button");
      console.log("item",item)
      promptBtn.className = "prompt-btn";
      // Replace the existing promptBtn.style.cssText with:
      promptBtn.style.cssText = `
                text-align: left;
                padding: 16px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                line-height: 1.4;
                transition: all 0.2s;
                position: relative;
                overflow: hidden;
                word-wrap: break-word;
                display: flex;
                flex-direction: row;
                justify-content:space-between;
                gap: 8px;
                min-height: 60px;
`;

      const promptText = document.createElement("div");
      promptText.textContent = item.text;
      // Replace the existing promptText.style.cssText with:
      promptText.style.cssText = `
            font-weight: 400;
            color: #1f2937;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            max-height: 2.8em;
            line-height: 1.4;
            margin-right: 60px;
`;
      // Add this after creating promptText
      let isExpanded = false;
      const shouldShowExpand = item.text.length > 100; // Show expand if text is long

      if (shouldShowExpand) {
        const expandBtn = document.createElement("button");
        expandBtn.textContent = "Show more";
        expandBtn.style.cssText = `
        color: #6366f1;
        background: none;
        border: none;
        font-size: 12px;
        cursor: pointer;
        padding: 0;
        margin-top: 4px;
        align-self: flex-start;
    `;

        expandBtn.onclick = (e) => {
          e.stopPropagation();
          isExpanded = !isExpanded;
          if (isExpanded) {
            promptText.style.display = "block";
            promptText.style.webkitLineClamp = "unset";
            promptText.style.maxHeight = "none";
            expandBtn.textContent = "Show less";
          } else {
            promptText.style.display = "-webkit-box";
            promptText.style.webkitLineClamp = "2";
            promptText.style.maxHeight = "2.8em";
            expandBtn.textContent = "Show more";
          }
        };

        promptBtn.appendChild(expandBtn);
      }


      const categoryBadge = document.createElement("span");
      categoryBadge.textContent = item.category;
      categoryBadge.style.cssText = `
                display: inline-block;
                background: #dbeafe;
                color: #1e40af;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            `;

      const deleteBtn = document.createElement("button");
      // Add this after creating deleteBtn
      const copyBtn = document.createElement("button");
      copyBtn.innerHTML = "📋";
      copyBtn.style.cssText = `
    position: absolute;
    top: 8px;
    right: 40px;
    background: #f0f9ff;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.2s;
    color: #0369a1;
    font-weight: 500;
`;

      copyBtn.onclick = (e) => {
        e.stopPropagation();
        copyToClipboard(item.text);
        showNotification("Prompt copied to clipboard!");
      };
      deleteBtn.innerHTML = "×";
      deleteBtn.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                background: #fef2f2;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                opacity: 0;
                transition: opacity 0.2s;
                color: #dc2626;
                font-weight: 500;
            `;

      promptBtn.onmouseover = () => {
        promptBtn.style.borderColor = "#2563eb";
        promptBtn.style.background = "#f8faff";
        deleteBtn.style.opacity = "1";
        copyBtn.style.opacity = "1"; // Add this line
      };

      promptBtn.onmouseout = () => {
        promptBtn.style.borderColor = "#e5e7eb";
        promptBtn.style.background = "white";
        deleteBtn.style.opacity = "0";
        copyBtn.style.opacity = "0"; // Add this line
      };

      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm("Delete this prompt?")) {
          const prompts = getPrompts();
          console.log("prompts", prompts);
          const categoryPrompts = prompts[item.category] || [];
          const updatedPrompts = categoryPrompts.filter((p) => p !== item.text);

          if (updatedPrompts.length === 0) {
            delete prompts[item.category];
          } else {
            prompts[item.category] = updatedPrompts;
          }

          savePrompts(prompts);
          // renderCategories();
          renderPrompts();
        }
      };

      promptBtn.onclick = () => {
        insertPrompt(item.text);
        overlay.remove();
      };

      // Replace the existing appendChild calls with:
      promptBtn.appendChild(promptText);
      const bottomRow = document.createElement("div");
      bottomRow.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
`;
      bottomRow.appendChild(categoryBadge);
      promptBtn.appendChild(bottomRow);
      promptBtn.appendChild(copyBtn);
      promptBtn.appendChild(deleteBtn);
      promptsList.appendChild(promptBtn);
    });
  }

  function insertPrompt(text) {
    // Store the last focused element before opening popup
    let targetInput = window.lastFocusedElement || document.activeElement;

    // If no valid target, try to find one
    if (!isValidInput(targetInput)) {
      const inputs = document.querySelectorAll(
        'textarea, input[type="text"], input[type="search"], input[type="email"], input[type="url"], [contenteditable="true"]'
      );
      targetInput = Array.from(inputs).find((input) => {
        const rect = input.getBoundingClientRect();
        const style = getComputedStyle(input);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          !input.disabled &&
          !input.readOnly
        );
      });
    }

    if (targetInput) {
      try {
        targetInput.focus();

        if (targetInput.contentEditable === "true") {
          // For contenteditable elements
          targetInput.innerHTML = text;
          targetInput.textContent = text;
        } else {
          // For input and textarea elements
          targetInput.value = text;

          // Set cursor to end
          targetInput.setSelectionRange(text.length, text.length);
        }

        // Trigger all possible events to ensure the website recognizes the change
        const events = ["input", "change", "keyup", "blur", "focus"];
        events.forEach((eventType) => {
          const event = new Event(eventType, {
            bubbles: true,
            cancelable: true,
          });
          targetInput.dispatchEvent(event);
        });

        // Special handling for React and other frameworks
        const reactEvent = new Event("input", { bubbles: true });
        Object.defineProperty(reactEvent, "target", {
          writable: false,
          value: targetInput,
        });
        targetInput.dispatchEvent(reactEvent);

        showNotification("Prompt inserted successfully!");
      } catch (error) {
        console.error("Error inserting prompt:", error);
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showNotification("No input field found. Prompt copied to clipboard!");
        })
        .catch(() => {
          fallbackCopyTextToClipboard(text);
        });
    } else {
      fallbackCopyTextToClipboard(text);
    }
  }

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      showNotification("Prompt copied to clipboard!");
    } catch (err) {
      showNotification("Failed to copy prompt. Please copy manually.");
    }

    document.body.removeChild(textArea);
  }

  function isValidInput(element) {
    if (!element) return false;

    const validTags = ["TEXTAREA", "INPUT"];
    const validInputTypes = [
      "text",
      "search",
      "url",
      "email",
      "password",
      "tel",
    ];

    return (
      (validTags.includes(element.tagName) &&
        (element.tagName === "TEXTAREA" ||
          validInputTypes.includes(element.type))) ||
      element.contentEditable === "true"
    );
  }

  function showNotification(message) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000001;
            font-family: inherit;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease-out;
        `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  function handleSave() {
    const prompt = promptInput.value.trim();
    const category = chosenCategory || "General";

    if (!prompt) {
      showNotification("Please enter a prompt!");
      return;
    }

    if (!chosenCategory) {
      showNotification("Please choose a category!");
      return;
    }

    const prompts = getPrompts();
    if (!prompts[category]) {
      prompts[category] = [];
    }

    if (!prompts[category].includes(prompt)) {
      prompts[category].push(prompt);
      savePrompts(prompts);

      promptInput.value = "";
      chosenCategory = ""; // Reset chosen category

      // Hide choose container and show normal categories
      chooseCategoryContainer.style.display = "none";
      categoriesContainer.style.display = "flex"; // Change to flex

      renderCategories();
      renderPrompts();
      showNotification("Prompt saved successfully!");
    } else {
      showNotification("Prompt already exists in this category!");
    }
  }
  function handleAddCategory() {
    // expand the categories container to input category and add input for category
    categoriesAddBtn.style.display = "none";
    categoryInput.style.display = "block";
    categoryInput.focus();
    categoryInput.onblur = () => {
      categoryInput.style.display = "none";
      categoriesAddBtn.style.display = "block";
    };

    if (!category) {
      showNotification("Please enter a category!");
      return;
    }
  }

  // Event listeners
  // categoriesAddBtn.onclick = handleAddCategory;
  saveBtn.onclick = handleSave;
  promptInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    }
  });

  // Initial render
  renderCategories();
  renderPrompts();

  // Focus on prompt input
  setTimeout(() => promptInput.focus(), 300);
}
