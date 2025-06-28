class DataManager {
    constructor() {
      this.storageKey = 'prompt_manager_data';
    }
  
    getPrompts() {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    }
  
    savePrompts(data) {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
  
    getCategories() {
      const prompts = this.getPrompts();
      const categories = new Set(['All']);
      Object.keys(prompts).forEach(category => categories.add(category));
      return Array.from(categories);
    }
  
    addPrompt(prompt, category) {
      const prompts = this.getPrompts();
      if (!prompts[category]) {
        prompts[category] = [];
      }
      
      if (!prompts[category].includes(prompt)) {
        prompts[category].push(prompt);
        this.savePrompts(prompts);
        return true;
      }
      return false;
    }
  
    deletePrompt(prompt, category) {
      const prompts = this.getPrompts();
      if (prompts[category]) {
        const updatedPrompts = prompts[category].filter(p => p !== prompt);
        
        if (updatedPrompts.length === 0) {
          delete prompts[category];
        } else {
          prompts[category] = updatedPrompts;
        }
        
        this.savePrompts(prompts);
        return true;
      }
      return false;
    }
  
    addCategory(category) {
      const prompts = this.getPrompts();
      if (!prompts[category]) {
        prompts[category] = [];
        this.savePrompts(prompts);
        return true;
      }
      return false;
    }
  
    getCategoryPrompts(category) {
      const allPrompts = this.getPrompts();
      let promptsToShow = [];
  
      if (category === 'All') {
        Object.keys(allPrompts).forEach(cat => {
          allPrompts[cat].forEach(prompt => {
            promptsToShow.push({ text: prompt, category: cat });
          });
        });
      } else {
        if (allPrompts[category]) {
          allPrompts[category].forEach(prompt => {
            promptsToShow.push({ text: prompt, category });
          });
        }
      }
  
      return promptsToShow;
    }
  }