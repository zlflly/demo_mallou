// 本地存储管理工具

/**
 * 本地存储管理器
 */
class StorageManager {
    constructor() {
        this.keys = window.GAME_CONSTANTS.STORAGE_KEYS;
    }

    /**
     * 保存玩家数据
     * @param {Object} playerData - 玩家数据
     */
    savePlayerData(playerData) {
        try {
            const data = {
                ...playerData,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.keys.PLAYER_DATA, JSON.stringify(data));
            return { success: true };
        } catch (error) {
            console.error('保存玩家数据失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 读取玩家数据
     * @returns {Object|null} 玩家数据或null
     */
    getPlayerData() {
        try {
            const data = localStorage.getItem(this.keys.PLAYER_DATA);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('读取玩家数据失败:', error);
            return null;
        }
    }

    /**
     * 保存游戏存档
     * @param {Object} saveData - 存档数据
     * @returns {Object} 操作结果
     */
    saveGameData(saveData) {
        try {
            const saves = this.getGameSaves() || [];
            const saveId = saveData.id || Date.now().toString();
            
            // 查找是否存在同名存档
            const existingIndex = saves.findIndex(save => save.id === saveId);
            
            const newSave = {
                ...saveData,
                id: saveId,
                lastSaved: new Date().toISOString()
            };
            
            if (existingIndex >= 0) {
                saves[existingIndex] = newSave;
            } else {
                saves.push(newSave);
            }
            
            localStorage.setItem(this.keys.GAME_SAVES, JSON.stringify(saves));
            return { success: true, saveId };
        } catch (error) {
            console.error('保存游戏存档失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 读取所有游戏存档
     * @returns {Array} 存档列表
     */
    getGameSaves() {
        try {
            const data = localStorage.getItem(this.keys.GAME_SAVES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('读取游戏存档失败:', error);
            return [];
        }
    }

    /**
     * 删除指定存档
     * @param {string} saveId - 存档ID
     * @returns {Object} 操作结果
     */
    deleteSave(saveId) {
        try {
            const saves = this.getGameSaves();
            const filteredSaves = saves.filter(save => save.id !== saveId);
            
            localStorage.setItem(this.keys.GAME_SAVES, JSON.stringify(filteredSaves));
            return { success: true };
        } catch (error) {
            console.error('删除存档失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 保存游戏设置
     * @param {Object} settings - 设置数据
     */
    saveSettings(settings) {
        try {
            const data = {
                ...settings,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.keys.SETTINGS, JSON.stringify(data));
            return { success: true };
        } catch (error) {
            console.error('保存设置失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 读取游戏设置
     * @returns {Object} 设置数据
     */
    getSettings() {
        try {
            const data = localStorage.getItem(this.keys.SETTINGS);
            return data ? JSON.parse(data) : {
                soundEnabled: true,
                musicEnabled: true,
                difficulty: 'normal'
            };
        } catch (error) {
            console.error('读取设置失败:', error);
            return {
                soundEnabled: true,
                musicEnabled: true,
                difficulty: 'normal'
            };
        }
    }

    /**
     * 清除所有数据
     */
    clearAllData() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            return { success: true };
        } catch (error) {
            console.error('清除数据失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 检查存储是否可用
     * @returns {boolean} 存储是否可用
     */
    isStorageAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
}

// 导出单例实例
window.storageManager = new StorageManager();