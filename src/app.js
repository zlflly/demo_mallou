// 主应用程序

/**
 * 主应用程序类
 */
class GameApplication {
    constructor() {
        this.gameState = new window.GameState();
        this.pageManager = new window.PageManager(this.gameState);
        this.dialogueSystem = new window.DialogueSystem(this.gameState, this.pageManager);
        this.formHandlers = new window.FormHandlers(this.gameState, this.pageManager, this.dialogueSystem);
        
        // 游戏引擎将在需要时初始化
        this.gameEngine = null;
        
        this.initialize();
    }

    /**
     * 初始化应用程序
     */
    initialize() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.onDOMReady();
            });
        } else {
            this.onDOMReady();
        }
    }

    /**
     * DOM准备就绪时执行
     */
    onDOMReady() {
        // 初始化表单处理器
        this.formHandlers.initializeForms();
        
        // 设置全局函数供HTML调用
        this.setupGlobalFunctions();
        
        // 显示主页
        this.pageManager.showPage(window.GAME_CONSTANTS.PAGES.HOME);
        
        // 设置全局错误处理
        this.setupErrorHandling();
        
        console.log('小鼠奇遇记已启动！');
    }

    /**
     * 设置全局函数供HTML调用
     */
    setupGlobalFunctions() {
        // 将应用实例暴露给全局，供HTML中的onclick等调用
        window.gameApp = this;
        
        // 全局页面导航函数
        window.showPage = (pageId) => {
            this.pageManager.showPage(pageId);
        };
        
        
        // 全局对话系统函数
        window.startStoryDialogue = () => {
            this.dialogueSystem.startDialogue('intro-1');
        };
        
        window.continueDialogue = () => {
            this.dialogueSystem.continueDialogue();
        };
        
        window.skipDialogue = () => {
            this.dialogueSystem.skipDialogue();
        };
        
        // 全局游戏控制函数
        window.togglePause = () => {
            if (this.gameEngine) {
                this.gameEngine.togglePause();
            }
        };
        
        window.restartGame = () => {
            if (this.gameEngine) {
                this.gameEngine.restart();
            }
        };
    }

    /**
     * 设置错误处理
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('应用错误:', event.error);
            window.showToast('发生了一个错误，请刷新页面重试', 'error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
            window.showToast('发生了一个错误，请稍后重试', 'error');
        });
    }

    /**
     * 初始化游戏引擎
     */
    initializeGameEngine() {
        if (this.gameEngine) {
            return this.gameEngine;
        }

        try {
            // 直接使用全局的GameEngine类
            this.gameEngine = new window.GameEngine(this.gameState, this.pageManager);
            return this.gameEngine;
        } catch (error) {
            console.error('游戏引擎初始化失败:', error);
            window.showToast('游戏初始化失败', 'error');
            return null;
        }
    }

    /**
     * 开始游戏
     */
    startGame() {
        const engine = this.initializeGameEngine();
        if (engine) {
            engine.initialize();
            this.pageManager.showPage(window.GAME_CONSTANTS.PAGES.GAME);
        }
    }

    /**
     * 加载存档
     * @param {string} saveId - 存档ID
     */
    loadSave(saveId) {
        this.formHandlers.handleLoadSave(saveId);
    }

    /**
     * 删除存档
     * @param {string} saveId - 存档ID
     */
    deleteSave(saveId) {
        this.formHandlers.handleDeleteSave(saveId);
    }

    /**
     * 创建存档
     */
    createSave() {
        this.formHandlers.handleCreateSave();
    }

    /**
     * 获取游戏状态
     * @returns {GameState} 游戏状态实例
     */
    getGameState() {
        return this.gameState;
    }

    /**
     * 获取页面管理器
     * @returns {PageManager} 页面管理器实例
     */
    getPageManager() {
        return this.pageManager;
    }

    /**
     * 获取对话系统
     * @returns {DialogueSystem} 对话系统实例
     */
    getDialogueSystem() {
        return this.dialogueSystem;
    }

    /**
     * 获取游戏引擎
     * @returns {GameEngine|null} 游戏引擎实例
     */
    getGameEngine() {
        return this.gameEngine;
    }

    /**
     * 重启应用
     */
    restart() {
        // 重置游戏状态
        this.gameState.resetGameData();
        
        // 停止游戏引擎
        if (this.gameEngine) {
            this.gameEngine.stop();
            this.gameEngine = null;
        }
        
        // 结束对话
        this.dialogueSystem.endDialogue();
        
        // 返回主页
        this.pageManager.showPage(window.GAME_CONSTANTS.PAGES.HOME);
        
        window.showToast('应用已重启', 'info');
    }

    /**
     * 清理资源
     */
    cleanup() {
        if (this.gameEngine) {
            this.gameEngine.stop();
        }
        
        this.dialogueSystem.endDialogue();
        
        // 清理全局函数
        delete window.gameApp;
        delete window.showPage;
        delete window.startStoryDialogue;
        delete window.continueDialogue;
        delete window.skipDialogue;
        delete window.togglePause;
        delete window.restartGame;
    }
}

// 创建并启动应用
const app = new GameApplication();

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    app.cleanup();
});

