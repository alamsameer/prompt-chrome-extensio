chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Set the intentional call flag first
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => { window.promptManagerIntentionalCall = true; }
    });

    // Check if the script is already injected
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.promptManagerInjected || false
    });

    if (result.result) {
      // Script already injected, just toggle the popup
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          if (window.togglePromptManager) {
            window.togglePromptManager();
          }
        }
      });
    } else {
      // First time injection - the script will check for intentional call flag
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    }
  } catch (error) {
    console.error('Error executing script:', error);
    // Fallback: set flag and inject script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => { window.promptManagerIntentionalCall = true; }
      });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
  }
});