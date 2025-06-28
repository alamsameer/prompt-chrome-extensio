console.log('PromptManager.js loaded');
class PromptManager {
    constructor() {
      this.dataManager = new DataManager();
      this.uiManager = new UIManager(this.dataManager);
      this.currentCategory = 'All';
      this.chosenCategory = '';
      this.popup = null;
      this.overlay = null;
    }
  
    async show() {
      if (this.popup) {
        this.toggle();
        return;
      }
  
      try {
        const template = await this.uiManager.loadTemplate();
        const { overlay, popup } = this.uiManager.createPopup(template);
        
        this.overlay = overlay;
        this.popup = popup;
        
        this.bindEvents();
        this.renderCategories();
        this.renderPrompts();
        
        // Focus on prompt input
        setTimeout(() => {
          const promptInput = this.popup.querySelector('#prompt-input');
          if (promptInput) promptInput.focus();
        }, 300);
        
      } catch (error) {
        console.error('Error loading prompt manager:', error);
      }
    }
  
    hide() {
      this.uiManager.closePopup();
      this.popup = null;
      this.overlay = null;
    }
  
    toggle() {
      if (this.popup) {
        this.hide();
      } else {
        this.show();
      }
    }
  
    bindEvents() {
      // Close button
      const closeBtn = this.popup.querySelector('#close-btn');
      if (closeBtn) {
        closeBtn.onclick = () => this.hide();
      }
  
      // Save button
      const saveBtn = this.popup.querySelector('#save-btn');
      if (saveBtn) {
        saveBtn.onclick = () => this.handleSave();
      }
  
      // Prompt input
      const promptInput = this.popup.querySelector('#prompt-input');
      if (promptInput) {
        promptInput.onfocus = () => this.handlePromptInputFocus();
        promptInput.onblur = () => this.handlePromptInputBlur();
        promptInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            this.handleSave();
          }
        });
      }
  
      // Category add button
      const categoryAddBtn = this.popup.querySelector('#categories-add-btn');
      if (categoryAddBtn) {
        categoryAddBtn.onclick = () => this.toggleCategoryInput();
      }
  
      // Category input
      const categoryInput = this.popup.querySelector('#category-input');
      if (categoryInput) {
        categoryInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.handleCategoryInput(e);
          }
        });
      }
    }
  
    handlePromptInputFocus() {
      const promptInput = this.popup.querySelector('#prompt-input');
      const chooseCategoryContainer = this.popup.querySelector('#choose-category-container');
      const categoriesContainer = this.popup.querySelector('#categories-container');
      
      if (promptInput) promptInput.style.borderColor = '#6366f1';
      if (chooseCategoryContainer) chooseCategoryContainer.style.display = 'flex';
      if (categoriesContainer) categoriesContainer.style.display = 'none';
      
      this.renderCategories();
    }
  
    handlePromptInputBlur() {
      const promptInput = this.popup.querySelector('#prompt-input');
      
      if (!this.chosenCategory && (!promptInput || !promptInput.value.trim())) {
        setTimeout(() => {
          const chooseCategoryContainer = this.popup.querySelector('#choose-category-container');
          const categoriesContainer = this.popup.querySelector('#categories-container');
          
          if (promptInput) promptInput.style.borderColor = '#404040';
          if (chooseCategoryContainer) chooseCategoryContainer.style.display = 'none';
          if (categoriesContainer) categoriesContainer.style.display = 'flex';
        }, 200);
      }
    }
  
    toggleCategoryInput() {
      const addBtn = this.popup.querySelector('#categories-add-btn');
      const input = this.popup.querySelector('#category-input');
  
      if (!input || !addBtn) return;
  
      if (input.style.opacity === '0' || input.style.opacity === '') {
        addBtn.style.transform = 'scale(0)';
        addBtn.style.opacity = '0';
  
        setTimeout(() => {
          input.style.opacity = '1';
          input.style.transform = 'scale(1)';
          input.style.width = '150px';
          input.style.borderRadius = '25px';
          input.focus();
        }, 150);
      } else {
        input.style.opacity = '0';
        input.style.transform = 'scale(0)';
        input.style.width = '50px';
        input.style.borderRadius = '50%';
  
        setTimeout(() => {
          addBtn.style.transform = 'scale(1)';
          addBtn.style.opacity = '1';
        }, 150);
      }
    }
  
    handleCategoryInput(event) {
      const input = event.target;
      const categoryValue = input.value.trim();
  
      if (categoryValue) {
        if (this.dataManager.addCategory(categoryValue)) {
          this.renderCategories();
          this.renderPrompts();
          input.value = '';
          this.uiManager.showNotification('Category added successfully!');
        } else {
          this.uiManager.showNotification('Category already exists!', 'error');
        }
      }
  
      this.toggleCategoryInput();
    }
  
    renderCategories() {
      const categoriesContainer = this.popup.querySelector('#categories-container');
      const chooseCategoryContainer = this.popup.querySelector('#choose-category-container');
      
      if (!categoriesContainer || !chooseCategoryContainer) return;
  
      categoriesContainer.innerHTML = '';
      chooseCategoryContainer.innerHTML = '';
      
      const categories = this.dataManager.getCategories();
  
      categories.forEach(category => {
        // Normal category tabs
        const tab = this.createCategoryTab(category, this.currentCategory, (cat) => {
          this.currentCategory = cat;
          this.renderCategories();
          this.renderPrompts();
        });
        
        // Choose category tabs
        const chooseTab = this.createCategoryTab(category, this.chosenCategory, (cat) => {
          this.chosenCategory = cat;
          this.renderCategories();
        });
  
        categoriesContainer.appendChild(tab);
        chooseCategoryContainer.appendChild(chooseTab);
      });
    }
  
    createCategoryTab(category, activeCategory, onClick) {
      const tab = document.createElement('button');
      tab.textContent = category;
      tab.className = `category-tab ${category === activeCategory ? 'active' : ''}`;
      tab.onclick = () => onClick(category);
      return tab;
    }
  
    renderPrompts() {
      const promptsList = this.popup.querySelector('#prompts-list');
      if (!promptsList) return;
  
      promptsList.innerHTML = '';
      const promptsToShow = this.dataManager.getCategoryPrompts(this.currentCategory);
  
      if (promptsToShow.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = this.currentCategory === 'All' 
          ? 'No prompts saved yet. Add your first prompt above!'
          : `No prompts in "${this.currentCategory}" category.`;
        promptsList.appendChild(empty);
        return;
      }
  
      promptsToShow.forEach(item => {
        const promptElement = this.createPromptElement(item);
        promptsList.appendChild(promptElement);
      });
    }
  
    createPromptElement(item) {
      const promptBtn = document.createElement('button');
      promptBtn.className = 'prompt-btn';
  
      const promptText = document.createElement('div');
      promptText.className = 'prompt-text';
      promptText.textContent = item.text;
  
      const categoryBadge = document.createElement('span');
      categoryBadge.className = 'category-badge';
      categoryBadge.textContent = item.category;
  
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.innerHTML = '📋';
      copyBtn.onclick = (e) => {
        e.stopPropagation();
        this.uiManager.copyToClipboard(item.text);
      };
  
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '×';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm('Delete this prompt?')) {
          this.dataManager.deletePrompt(item.text, item.category);
          this.renderPrompts();
          this.uiManager.showNotification('Prompt deleted successfully!');
        }
      };
  
      promptBtn.onclick = () => {
        this.uiManager.insertPrompt(item.text);
        this.hide();
      };
  
      // Handle expand/collapse for long text
      if (item.text.length > 100) {
        this.addExpandFunctionality(promptBtn, promptText);
      }
  
      const bottomRow = document.createElement('div');
      bottomRow.className = 'bottom-row';
      bottomRow.appendChild(categoryBadge);
  
      promptBtn.appendChild(promptText);
      promptBtn.appendChild(bottomRow);
      promptBtn.appendChild(copyBtn);
      promptBtn.appendChild(deleteBtn);
  
      return promptBtn;
    }
  
    addExpandFunctionality(promptBtn, promptText) {
      let isExpanded = false;
      const expandBtn = document.createElement('button');
      expandBtn.className = 'expand-btn';
      expandBtn.textContent = 'Show more';
  
      expandBtn.onclick = (e) => {
        e.stopPropagation();
        isExpanded = !isExpanded;
        
        if (isExpanded) {
          promptText.classList.add('expanded');
          expandBtn.textContent = 'Show less';
        } else {
          promptText.classList.remove('expanded');
          expandBtn.textContent = 'Show more';
        }
      };
  
      promptBtn.appendChild(expandBtn);
    }
  
    handleSave() {
      const promptInput = this.popup.querySelector('#prompt-input');
      const prompt = promptInput ? promptInput.value.trim() : '';
      const category = this.chosenCategory || 'General';
  
      if (!prompt) {
        this.uiManager.showNotification('Please enter a prompt!', 'error');
        return;
      }
  
      if (!this.chosenCategory) {
        this.uiManager.showNotification('Please choose a category!', 'error');
        return;
      }
  
      if (this.dataManager.addPrompt(prompt, category)) {
        if (promptInput) promptInput.value = '';
        this.chosenCategory = '';
  
        // Reset UI state
        const chooseCategoryContainer = this.popup.querySelector('#choose-category-container');
        const categoriesContainer = this.popup.querySelector('#categories-container');
        
        if (chooseCategoryContainer) chooseCategoryContainer.style.display = 'none';
        if (categoriesContainer) categoriesContainer.style.display = 'flex';
  
        this.renderCategories();
        this.renderPrompts();
        this.uiManager.showNotification('Prompt saved successfully!');
      } else {
        this.uiManager.showNotification('Prompt already exists in this category!', 'error');
      }
    }
  }