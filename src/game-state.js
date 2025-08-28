// 游戏状态管理

/**
 * 游戏状态管理类
 */
window.GameState = class GameState {
    constructor() {
        this.currentPage = window.GAME_CONSTANTS.PAGES.HOME;
        
        this.player = {
            username: '',
            level: 1,
            score: 0,
            cheeseCollected: 0
        };
        
        this.gameProgress = {
            currentLevel: 1,
            totalLevels: 10,
            completedLevels: []
        };
        
        this.achievements = [...window.ACHIEVEMENTS];
        this.saves = [];
        this.gameSettings = {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal'
        };
        
        // 加载保存的数据
        this.loadFromStorage();
    }

    /**
     * 从本地存储加载数据
     */
    loadFromStorage() {
        const playerData = window.storageManager.getPlayerData();
        if (playerData) {
            this.player.username = playerData.username || '';
            this.gameSettings.difficulty = playerData.difficulty || 'normal';
        }

        const settings = window.storageManager.getSettings();
        this.gameSettings = { ...this.gameSettings, ...settings };

        this.saves = window.storageManager.getGameSaves();
    }

    /**
     * 保存当前状态到本地存储
     */
    saveToStorage() {
        const playerData = {
            username: this.player.username,
            difficulty: this.gameSettings.difficulty,
            level: this.player.level,
            score: this.player.score,
            cheeseCollected: this.player.cheeseCollected,
            completedLevels: this.gameProgress.completedLevels,
            achievements: this.achievements.filter(a => a.unlocked)
        };

        window.storageManager.savePlayerData(playerData);
        window.storageManager.saveSettings(this.gameSettings);
    }

    /**
     * 设置当前页面
     * @param {string} pageId - 页面ID
     */
    setPage(pageId) {
        this.currentPage = pageId;
    }

    /**
     * 玩家登录
     * @param {string} username - 用户名
     * @param {Object} options - 额外选项
     */
    loginPlayer(username, options = {}) {
        this.player.username = username;
        if (options.difficulty) {
            this.gameSettings.difficulty = options.difficulty;
        }
        this.saveToStorage();
    }

    /**
     * 收集奶酪
     * @param {number} amount - 奶酪数量
     */
    collectCheese(amount) {
        const newCheeseCount = this.player.cheeseCollected + amount;
        this.player.cheeseCollected = newCheeseCount;
        this.player.score += amount * 100;
        
        this.checkAchievements();
        this.saveToStorage();
        
        return {
            newTotal: newCheeseCount,
            scoreGain: amount * 100
        };
    }

    /**
     * 完成关卡
     * @param {number} levelNumber - 关卡号
     */
    completeLevel(levelNumber) {
        if (!this.gameProgress.completedLevels.includes(levelNumber)) {
            this.gameProgress.completedLevels.push(levelNumber);
            this.gameProgress.currentLevel = Math.min(
                levelNumber + 1, 
                this.gameProgress.totalLevels
            );
        }
        
        this.checkAchievements();
        this.saveToStorage();
    }

    /**
     * 检查并解锁成就
     */
    checkAchievements() {
        const unlockedAchievements = [];
        
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked) {
                let shouldUnlock = false;
                
                switch (achievement.id) {
                    case 'first-cheese':
                        shouldUnlock = this.player.cheeseCollected >= 1;
                        break;
                    case 'cheese-collector':
                        shouldUnlock = this.player.cheeseCollected >= 50;
                        break;
                    case 'level-master':
                        shouldUnlock = this.gameProgress.completedLevels.length >= 5;
                        break;
                    case 'speed-runner':
                        // 这个成就需要在游戏循环中检查
                        break;
                }
                
                if (shouldUnlock) {
                    achievement.unlocked = true;
                    achievement.unlockedAt = new Date();
                    unlockedAchievements.push(achievement);
                }
            }
        });
        
        return unlockedAchievements;
    }

    /**
     * 解锁指定成就
     * @param {string} achievementId - 成就ID
     */
    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockedAt = new Date();
            this.saveToStorage();
            return achievement;
        }
        return null;
    }

    /**
     * 创建存档
     * @param {string} name - 存档名称
     */
    createSave(name) {
        const saveData = {
            name,
            username: this.player.username,
            level: this.player.level,
            score: this.player.score,
            cheeseCollected: this.player.cheeseCollected,
            completedLevels: [...this.gameProgress.completedLevels],
            achievements: this.achievements.filter(a => a.unlocked),
            createdAt: new Date().toISOString(),
            lastPlayed: new Date().toISOString(),
            playtime: 0 // 可以后续添加游戏时长统计
        };

        const result = window.storageManager.saveGameData(saveData);
        if (result.success) {
            this.saves = window.storageManager.getGameSaves();
        }
        return result;
    }

    /**
     * 加载存档
     * @param {string} saveId - 存档ID
     */
    loadSave(saveId) {
        const save = this.saves.find(s => s.id === saveId);
        if (save) {
            this.player.level = save.level;
            this.player.score = save.score;
            this.player.cheeseCollected = save.cheeseCollected;
            this.gameProgress.currentLevel = save.level;
            this.gameProgress.completedLevels = [...save.completedLevels];
            
            // 恢复成就状态
            if (save.achievements) {
                save.achievements.forEach(savedAchievement => {
                    const achievement = this.achievements.find(a => a.id === savedAchievement.id);
                    if (achievement) {
                        achievement.unlocked = true;
                        achievement.unlockedAt = new Date(savedAchievement.unlockedAt);
                    }
                });
            }
            
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * 删除存档
     * @param {string} saveId - 存档ID
     */
    deleteSave(saveId) {
        const result = window.storageManager.deleteSave(saveId);
        if (result.success) {
            this.saves = window.storageManager.getGameSaves();
        }
        return result;
    }

    /**
     * 重置游戏数据
     */
    resetGameData() {
        this.player = {
            username: this.player.username, // 保留用户名
            level: 1,
            score: 0,
            cheeseCollected: 0
        };
        
        this.gameProgress = {
            currentLevel: 1,
            totalLevels: 10,
            completedLevels: []
        };
        
        this.achievements = [...window.ACHIEVEMENTS];
    }

    /**
     * 获取游戏统计信息
     * @returns {Object} 统计信息
     */
    getGameStats() {
        return {
            totalScore: this.player.score,
            totalCheese: this.player.cheeseCollected,
            currentLevel: this.gameProgress.currentLevel,
            completedLevels: this.gameProgress.completedLevels.length,
            unlockedAchievements: this.achievements.filter(a => a.unlocked).length,
            totalAchievements: this.achievements.length,
            totalSaves: this.saves.length
        };
    }
}