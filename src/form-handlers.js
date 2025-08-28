// 表单处理模块

/**
 * 表单处理器
 */
window.FormHandlers = class FormHandlers {
    constructor(gameState, pageManager, dialogueSystem) {
        this.gameState = gameState;
        this.pageManager = pageManager;
        this.dialogueSystem = dialogueSystem;
    }

    /**
     * 初始化所有表单
     */
    initializeForms() {
        this.setupRegisterForm();
        this.setupLoginForm();
    }

    /**
     * 设置注册表单
     */
    setupRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    /**
     * 设置登录表单
     */
    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    /**
     * 处理注册
     */
    handleRegister() {
        const username = document.getElementById('newUsername')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const difficulty = document.getElementById('difficulty')?.value;

        // 验证用户名
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            showToast(usernameValidation.message, 'error');
            return;
        }

        // 验证邮箱（可选）
        if (email && !validateEmail(email)) {
            showToast('邮箱格式不正确', 'error');
            return;
        }

        // 保存玩家数据
        try {
            this.gameState.loginPlayer(username, { 
                email, 
                difficulty,
                isNewPlayer: true
            });

            showToast(`欢迎加入小鼠世界，${username}！`, 'success');

            // 开始故事对话
            setTimeout(() => {
                this.dialogueSystem.startDialogue('intro-1');
            }, 1000);

        } catch (error) {
            console.error('注册失败:', error);
            showToast('注册失败，请稍后重试', 'error');
        }
    }

    /**
     * 处理登录
     */
    handleLogin() {
        const username = document.getElementById('username')?.value.trim();

        // 验证用户名
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            showToast(usernameValidation.message, 'error');
            return;
        }

        try {
            // 检查是否是现有玩家
            const existingPlayer = this.gameState.player.username === username;
            
            this.gameState.loginPlayer(username, { isNewPlayer: false });

            if (existingPlayer) {
                showToast(`欢迎回来，${username}！`, 'success');
            } else {
                showToast(`欢迎，${username}！`, 'success');
            }

            // 跳转到故事页面
            setTimeout(() => {
                this.pageManager.showPage(GAME_CONSTANTS.PAGES.STORY);
            }, 500);

        } catch (error) {
            console.error('登录失败:', error);
            showToast('登录失败，请稍后重试', 'error');
        }
    }

    /**
     * 处理存档创建
     */
    handleCreateSave() {
        const saveName = prompt('请输入存档名称:');
        if (!saveName || saveName.trim() === '') {
            showToast('存档名称不能为空', 'error');
            return;
        }

        const result = this.gameState.createSave(saveName.trim());
        if (result.success) {
            showToast('存档创建成功！', 'success');
            if (this.pageManager.isCurrentPage(GAME_CONSTANTS.PAGES.SAVES)) {
                this.pageManager.renderSaves();
            }
        } else {
            showToast(`存档创建失败: ${result.error}`, 'error');
        }
    }

    /**
     * 处理存档加载
     * @param {string} saveId - 存档ID
     */
    handleLoadSave(saveId) {
        if (!saveId) {
            showToast('无效的存档ID', 'error');
            return;
        }

        const success = this.gameState.loadSave(saveId);
        if (success) {
            showToast('存档加载成功！', 'success');
            // 跳转到游戏页面
            setTimeout(() => {
                this.pageManager.showPage(GAME_CONSTANTS.PAGES.GAME);
            }, 500);
        } else {
            showToast('存档加载失败', 'error');
        }
    }

    /**
     * 处理存档删除
     * @param {string} saveId - 存档ID
     */
    handleDeleteSave(saveId) {
        if (!saveId) {
            showToast('无效的存档ID', 'error');
            return;
        }

        const confirmed = confirm('确定要删除这个存档吗？此操作无法撤销。');
        if (!confirmed) return;

        const result = this.gameState.deleteSave(saveId);
        if (result.success) {
            showToast('存档删除成功', 'success');
            // 重新渲染存档列表
            if (this.pageManager.isCurrentPage(GAME_CONSTANTS.PAGES.SAVES)) {
                this.pageManager.renderSaves();
            }
        } else {
            showToast(`存档删除失败: ${result.error}`, 'error');
        }
    }

    /**
     * 清空表单
     * @param {string} formId - 表单ID
     */
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    /**
     * 设置表单字段值
     * @param {string} fieldId - 字段ID
     * @param {string} value - 值
     */
    setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = value;
        }
    }

    /**
     * 获取表单字段值
     * @param {string} fieldId - 字段ID
     * @returns {string} 字段值
     */
    getFieldValue(fieldId) {
        const field = document.getElementById(fieldId);
        return field ? field.value.trim() : '';
    }

    /**
     * 禁用/启用表单
     * @param {string} formId - 表单ID
     * @param {boolean} disabled - 是否禁用
     */
    setFormDisabled(formId, disabled) {
        const form = document.getElementById(formId);
        if (form) {
            const inputs = form.querySelectorAll('input, select, button');
            inputs.forEach(input => {
                input.disabled = disabled;
            });
        }
    }
}