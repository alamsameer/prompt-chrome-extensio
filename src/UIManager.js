class UIManager {
    constructor(dataManager) {
      this.dataManager = dataManager;
      this.lastFocusedElement = null;
      this.setupFocusTracking();
    }
  
    setupFocusTracking() {
      document.addEventListener('focusin', (e) => {
        if (this.isValidInputElement(e.target)) {
          this.lastFocusedElement = e.target;
          window.lastFocusedElement = e.target;
        }
      });
    }
  
    isValidInputElement(element) {
      if (!element) return false;
  
      const validTags = ['TEXTAREA', 'INPUT'];
      const validInputTypes = ['text', 'search', 'url', 'email', 'password', 'tel'];
  
      return (
        (validTags.includes(element.tagName) &&
          (element.tagName === 'TEXTAREA' ||
            validInputTypes.includes(element.type))) ||
        element.contentEditable === 'true'
      );
    }
  
    async loadTemplate() {
      const templateUrl = chrome.runtime.getURL('src/templates/popup.html');
      console.log("tempateUrl",templateUrl)
      const response = await fetch(templateUrl);
      const txt=await response.text();
      console.log("txt",txt)
      return txt;
    }
  
    createPopup(template) {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.id = 'prompt-manager-overlay';
      overlay.className = 'prompt-overlay';
  
      // Create popup container
      const popup = document.createElement('div');
      popup.id = 'prompt-manager-popup';
      popup.className = 'prompt-popup';
      popup.innerHTML = template;
  
      overlay.appendChild(popup);
      document.body.appendChild(overlay);
  
      // Click outside to close
      overlay.onclick = (e) => {
        if (e.target === overlay) this.closePopup();
      };
  
      return { overlay, popup };
    }
  
    closePopup() {
      const overlay = document.getElementById('prompt-manager-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
  
    showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.className = `prompt-notification ${type}`;
  
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  
    insertPrompt(text) {
      let targetInput = this.lastFocusedElement || document.activeElement;
  
      if (!this.isValidInput(targetInput)) {
        const inputs = document.querySelectorAll(
          'textarea, input[type="text"], input[type="search"], input[type="email"], input[type="url"], [contenteditable="true"]'
        );
        targetInput = Array.from(inputs).find(input => {
          const rect = input.getBoundingClientRect();
          const style = getComputedStyle(input);
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            !input.disabled &&
            !input.readOnly
          );
        });
      }
  
      if (targetInput) {
        try {
          targetInput.focus();
  
          if (targetInput.contentEditable === 'true') {
            targetInput.innerHTML = text;
            targetInput.textContent = text;
          } else {
            targetInput.value = text;
            targetInput.setSelectionRange(text.length, text.length);
          }
  
          // Trigger events
          const events = ['input', 'change', 'keyup', 'blur', 'focus'];
          events.forEach(eventType => {
            const event = new Event(eventType, {
              bubbles: true,
              cancelable: true
            });
            targetInput.dispatchEvent(event);
          });
  
          this.showNotification('Prompt inserted successfully!');
        } catch (error) {
          console.error('Error inserting prompt:', error);
          this.copyToClipboard(text);
        }
      } else {
        this.copyToClipboard(text);
      }
    }
  
    copyToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
          .then(() => {
            this.showNotification('Prompt copied to clipboard!');
          })
          .catch(() => {
            this.fallbackCopyTextToClipboard(text);
          });
      } else {
        this.fallbackCopyTextToClipboard(text);
      }
    }
  
    fallbackCopyTextToClipboard(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
  
      try {
        document.execCommand('copy');
        this.showNotification('Prompt copied to clipboard!');
      } catch (err) {
        this.showNotification('Failed to copy prompt. Please copy manually.', 'error');
      }
  
      document.body.removeChild(textArea);
    }
  
    isValidInput(element) {
      if (!element) return false;
  
      const validTags = ['TEXTAREA', 'INPUT'];
      const validInputTypes = ['text', 'search', 'url', 'email', 'password', 'tel'];
  
      return (
        (validTags.includes(element.tagName) &&
          (element.tagName === 'TEXTAREA' ||
            validInputTypes.includes(element.type))) ||
        element.contentEditable === 'true'
      );
    }
  }