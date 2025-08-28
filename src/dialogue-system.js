// 对话系统模块

/**
 * 对话系统管理器
 */
window.DialogueSystem = class DialogueSystem {
    constructor(gameState, pageManager) {
        this.gameState = gameState;
        this.pageManager = pageManager;
        this.currentDialogue = null;
        this.isTyping = false;
        this.typingInterval = null;
        this.typingSpeed = window.GAME_CONSTANTS.TYPING_SPEED;
    }

    /**
     * 开始对话
     * @param {string} dialogueId - 对话ID，默认为intro-1
     */
    startDialogue(dialogueId = 'intro-1') {
        this.currentDialogue = window.DIALOGUE_STORY[dialogueId];
        if (!this.currentDialogue) {
            console.warn('找不到指定的对话:', dialogueId);
            return false;
        }
        
        this.pageManager.showPage(window.GAME_CONSTANTS.PAGES.DIALOGUE);
        setTimeout(() => this.displayDialogue(), 500);
        return true;
    }

    /**
     * 显示当前对话
     */
    displayDialogue() {
        if (!this.currentDialogue) return;
        
        const speakerElement = document.getElementById('dialogueSpeaker');
        const textElement = document.getElementById('dialogueText');
        const typingIndicator = document.getElementById('typingIndicator');
        const continueBtn = document.getElementById('dialogueContinue');
        const optionsContainer = document.getElementById('dialogueOptions');
        
        // 设置说话者
        if (speakerElement) {
            speakerElement.textContent = this.currentDialogue.speaker;
        }
        
        // 重置显示状态
        if (textElement) textElement.textContent = '';
        if (typingIndicator) typingIndicator.style.display = 'inline';
        if (continueBtn) continueBtn.classList.add('hidden');
        if (optionsContainer) optionsContainer.classList.add('hidden');
        
        // 开始打字机效果
        this.startTypingAnimation();
    }

    /**
     * 开始打字机动画
     */
    startTypingAnimation() {
        if (!this.currentDialogue) return;
        
        const textElement = document.getElementById('dialogueText');
        if (!textElement) return;
        
        this.isTyping = true;
        let index = 0;
        const text = this.currentDialogue.text;
        
        this.typingInterval = setInterval(() => {
            if (index < text.length) {
                textElement.textContent = text.slice(0, index + 1);
                index++;
            } else {
                this.finishTyping();
            }
        }, this.typingSpeed);
    }

    /**
     * 完成打字动画
     */
    finishTyping() {
        this.isTyping = false;
        
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) typingIndicator.style.display = 'none';
        
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
        }
        
        // 显示选项或继续按钮
        if (this.currentDialogue.options) {
            this.showOptions();
        } else {
            this.showContinueButton();
        }
    }

    /**
     * 显示对话选项
     */
    showOptions() {
        const optionsContainer = document.getElementById('dialogueOptions');
        const continueBtn = document.getElementById('dialogueContinue');
        
        if (optionsContainer && this.currentDialogue.options) {
            optionsContainer.innerHTML = '';
            
            this.currentDialogue.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = `game-button ${index === 0 ? 'primary' : 'secondary'}`;
                button.textContent = option.text;
                button.onclick = () => this.handleOptionSelect(option.nextId);
                optionsContainer.appendChild(button);
            });
            
            optionsContainer.classList.remove('hidden');
            if (continueBtn) continueBtn.classList.add('hidden');
        }
    }

    /**
     * 显示继续按钮
     */
    showContinueButton() {
        const continueBtn = document.getElementById('dialogueContinue');
        if (continueBtn) {
            continueBtn.classList.remove('hidden');
        }
    }

    /**
     * 继续对话
     */
    continueDialogue() {
        if (this.isTyping) {
            // 跳过打字动画
            this.skipTypingAnimation();
            return;
        }
        
        // 继续到下一个对话
        if (this.currentDialogue?.nextId) {
            this.handleNext(this.currentDialogue.nextId);
        }
    }

    /**
     * 跳过打字动画
     */
    skipTypingAnimation() {
        if (!this.currentDialogue) return;
        
        const textElement = document.getElementById('dialogueText');
        const typingIndicator = document.getElementById('typingIndicator');
        
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
        }
        
        if (textElement) {
            textElement.textContent = this.currentDialogue.text;
        }
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        
        this.isTyping = false;
        
        if (this.currentDialogue.options) {
            this.showOptions();
        } else {
            this.showContinueButton();
        }
    }

    /**
     * 处理选项选择
     * @param {string} nextId - 下一个对话ID
     */
    handleOptionSelect(nextId) {
        this.handleNext(nextId);
    }

    /**
     * 处理下一步操作
     * @param {string} nextId - 下一个ID
     */
    handleNext(nextId) {
        if (nextId === 'start-game') {
            this.pageManager.showPage(window.GAME_CONSTANTS.PAGES.GAME);
            return;
        }
        
        const nextDialogue = window.DIALOGUE_STORY[nextId];
        if (nextDialogue) {
            this.currentDialogue = nextDialogue;
            this.displayDialogue();
        } else {
            console.warn('找不到下一个对话:', nextId);
            this.endDialogue();
        }
    }

    /**
     * 跳过对话
     */
    skipDialogue() {
        this.endDialogue();
        this.pageManager.showPage(window.GAME_CONSTANTS.PAGES.GAME);
    }

    /**
     * 结束对话
     */
    endDialogue() {
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
        }
        
        this.currentDialogue = null;
        this.isTyping = false;
    }

    /**
     * 设置打字速度
     * @param {number} speed - 打字速度(毫秒)
     */
    setTypingSpeed(speed) {
        this.typingSpeed = Math.max(10, Math.min(200, speed));
    }

    /**
     * 获取当前对话信息
     * @returns {Object|null} 当前对话信息
     */
    getCurrentDialogue() {
        return this.currentDialogue;
    }

    /**
     * 检查是否有对话在进行
     * @returns {boolean} 是否有对话在进行
     */
    isDialogueActive() {
        return this.currentDialogue !== null;
    }
}