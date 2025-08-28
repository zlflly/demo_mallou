// 页面管理模块

/**
 * 页面管理器
 */
window.PageManager = class PageManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentPage = window.GAME_CONSTANTS.PAGES.HOME;
    }

    /**
     * 显示指定页面
     * @param {string} pageId - 页面ID
     */
    showPage(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 显示目标页面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            this.gameState.setPage(pageId);
            
            // 初始化页面特定内容
            this.initializePage(pageId);
        } else {
            console.warn('找不到页面:', pageId);
        }
    }

    /**
     * 初始化页面特定内容
     * @param {string} pageId - 页面ID
     */
    initializePage(pageId) {
        switch (pageId) {
            case window.GAME_CONSTANTS.PAGES.GAME:
                // 通知应用初始化游戏引擎
                if (window.gameApp) {
                    window.gameApp.initializeGameEngine();
                }
                break;
            case window.GAME_CONSTANTS.PAGES.ACHIEVEMENTS:
                this.renderAchievements();
                break;
            case window.GAME_CONSTANTS.PAGES.SAVES:
                this.renderSaves();
                break;
            case window.GAME_CONSTANTS.PAGES.TEAM:
                this.renderTeamOverview();
                break;
            case window.GAME_CONSTANTS.PAGES.HOME:
                // 检查是否有保存的用户数据，显示相应按钮状态
                this.updateHomePageButtons();
                break;
        }
    }

    /**
     * 渲染成就页面
     */
    renderAchievements() {
        const grid = document.getElementById('achievementsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.gameState.achievements.forEach(achievement => {
            const achievementCard = document.createElement('div');
            achievementCard.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            
            achievementCard.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h3 class="achievement-title">${achievement.title}</h3>
                    <p class="achievement-description">${achievement.description}</p>
                    ${achievement.unlocked && achievement.unlockedAt ? 
                        `<small class="achievement-date">解锁于: ${new Date(achievement.unlockedAt).toLocaleDateString()}</small>` : 
                        ''}
                </div>
            `;
            
            grid.appendChild(achievementCard);
        });
    }

    /**
     * 渲染存档页面
     */
    renderSaves() {
        const container = document.getElementById('savesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.gameState.saves.length === 0) {
            container.innerHTML = '<p class="no-saves">暂无存档</p>';
            return;
        }
        
        this.gameState.saves.forEach(save => {
            const saveCard = document.createElement('div');
            saveCard.className = 'save-card';
            
            saveCard.innerHTML = `
                <div class="save-info">
                    <h3 class="save-name">${save.name}</h3>
                    <p class="save-details">
                        等级: ${save.level} | 分数: ${save.score} | 奶酪: ${save.cheeseCollected}
                    </p>
                    <small class="save-date">
                        创建: ${new Date(save.createdAt).toLocaleDateString()}
                        | 最后游玩: ${new Date(save.lastPlayed).toLocaleDateString()}
                    </small>
                </div>
                <div class="save-actions">
                    <button class="game-button primary small" onclick="window.gameApp.loadSave('${save.id}')">
                        加载
                    </button>
                    <button class="game-button outline small" onclick="window.gameApp.deleteSave('${save.id}')">
                        删除
                    </button>
                </div>
            `;
            
            container.appendChild(saveCard);
        });
    }

    /**
     * 更新主页按钮状态
     */
    updateHomePageButtons() {
        const playerData = this.gameState.player;
        const continueBtn = document.querySelector('[onclick="showPage(\'loginPage\')"]');
        
        if (continueBtn && playerData.username) {
            // 如果有用户数据，更新按钮文本
            continueBtn.innerHTML = `继续游戏<br><small>(${playerData.username})</small>`;
        }
    }

    /**
     * 获取当前页面ID
     * @returns {string} 当前页面ID
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * 检查是否在指定页面
     * @param {string} pageId - 页面ID
     * @returns {boolean} 是否在指定页面
     */
    isCurrentPage(pageId) {
        return this.currentPage === pageId;
    }

    /**
     * 渲染团队概览页面
     */
    renderTeamOverview() {
        // 团队概览页面的内容是静态的，已在HTML中定义
        // 这里可以添加动态内容更新逻辑
        console.log('团队概览页面已加载');
    }


    /**
     * 返回上一页面
     */
    goBack() {
        // 简单的返回逻辑，可以根据需要扩展
        switch (this.currentPage) {
            case window.GAME_CONSTANTS.PAGES.REGISTER:
            case window.GAME_CONSTANTS.PAGES.LOGIN:
            case window.GAME_CONSTANTS.PAGES.ACHIEVEMENTS:
            case window.GAME_CONSTANTS.PAGES.SAVES:
            case window.GAME_CONSTANTS.PAGES.TEAM:
                this.showPage(window.GAME_CONSTANTS.PAGES.HOME);
                break;
            case window.GAME_CONSTANTS.PAGES.STORY:
                this.showPage(window.GAME_CONSTANTS.PAGES.HOME);
                break;
            case window.GAME_CONSTANTS.PAGES.DIALOGUE:
            case window.GAME_CONSTANTS.PAGES.GAME:
                this.showPage(window.GAME_CONSTANTS.PAGES.STORY);
                break;
            default:
                this.showPage(window.GAME_CONSTANTS.PAGES.HOME);
        }
    }
}