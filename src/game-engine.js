// 游戏引擎模块
import { GAME_CONSTANTS, INITIAL_GAME_OBJECTS } from '../utils/constants.js';
import { checkCollision, formatTime, showToast } from '../utils/helpers.js';

/**
 * 游戏引擎类
 */
export class GameEngine {
    constructor(gameState, pageManager) {
        this.gameState = gameState;
        this.pageManager = pageManager;
        
        // 游戏状态
        this.currentGameState = GAME_CONSTANTS.GAME_STATES.PLAYING;
        this.score = 0;
        this.timeLeft = GAME_CONSTANTS.TIMER_DURATION;
        this.keys = new Set();
        
        // 游戏循环相关
        this.gameLoop = null;
        this.timer = null;
        
        // Canvas 相关
        this.canvas = null;
        this.ctx = null;
        
        // 游戏对象
        this.gameObjects = this.resetGameObjects();
    }

    /**
     * 重置游戏对象到初始状态
     * @returns {Object} 游戏对象
     */
    resetGameObjects() {
        return {
            player: { ...INITIAL_GAME_OBJECTS.player },
            platforms: [...INITIAL_GAME_OBJECTS.platforms],
            cheeses: INITIAL_GAME_OBJECTS.cheeses.map(cheese => ({ ...cheese, collected: false }))
        };
    }

    /**
     * 初始化游戏引擎
     */
    initialize() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('找不到游戏画布');
            return false;
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('无法获取画布上下文');
            return false;
        }

        this.setupEventListeners();
        this.reset();
        this.start();
        
        return true;
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 移除旧的监听器
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);

        // 绑定this上下文
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // 添加新的监听器
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    /**
     * 键盘按下处理
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyDown(e) {
        this.keys.add(e.code);

        if (e.code === 'Escape') {
            this.togglePause();
        }

        e.preventDefault();
    }

    /**
     * 键盘抬起处理
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyUp(e) {
        this.keys.delete(e.code);
    }

    /**
     * 开始游戏
     */
    start() {
        this.startGameLoop();
        this.startTimer();
    }

    /**
     * 停止游戏
     */
    stop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }

        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // 移除事件监听器
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    /**
     * 重置游戏
     */
    reset() {
        this.gameObjects = this.resetGameObjects();
        this.score = 0;
        this.timeLeft = GAME_CONSTANTS.TIMER_DURATION;
        this.currentGameState = GAME_CONSTANTS.GAME_STATES.PLAYING;
        this.updateUI();
        
        // 隐藏覆盖层
        document.getElementById('pauseOverlay')?.classList.add('hidden');
        document.getElementById('completionOverlay')?.classList.add('hidden');
    }

    /**
     * 重启游戏
     */
    restart() {
        this.reset();
        this.start();
    }

    /**
     * 暂停/继续游戏
     */
    togglePause() {
        if (this.currentGameState === GAME_CONSTANTS.GAME_STATES.PLAYING) {
            this.currentGameState = GAME_CONSTANTS.GAME_STATES.PAUSED;
            document.getElementById('pauseOverlay')?.classList.remove('hidden');
            document.getElementById('pauseBtn').textContent = '继续';
        } else if (this.currentGameState === GAME_CONSTANTS.GAME_STATES.PAUSED) {
            this.currentGameState = GAME_CONSTANTS.GAME_STATES.PLAYING;
            document.getElementById('pauseOverlay')?.classList.add('hidden');
            document.getElementById('pauseBtn').textContent = '暂停';
        }
    }

    /**
     * 开始游戏循环
     */
    startGameLoop() {
        const loop = () => {
            if (this.currentGameState === GAME_CONSTANTS.GAME_STATES.PLAYING) {
                this.update();
            }
            this.render();
            this.gameLoop = requestAnimationFrame(loop);
        };

        this.gameLoop = requestAnimationFrame(loop);
    }

    /**
     * 开始计时器
     */
    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
            if (this.currentGameState === GAME_CONSTANTS.GAME_STATES.PLAYING) {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    this.timeLeft = 0;
                    this.completeGame(false); // 时间到了但未完成
                }
            }
        }, 1000);
    }

    /**
     * 更新游戏逻辑
     */
    update() {
        this.updatePlayer();
        this.updateCheeses();
        this.checkCollisions();
        this.checkGameCompletion();
        this.updateUI();
    }

    /**
     * 更新玩家
     */
    updatePlayer() {
        const player = this.gameObjects.player;

        // 处理输入
        if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) {
            player.velocityX = -GAME_CONSTANTS.MOVE_SPEED;
            player.facing = 'left';
        } else if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) {
            player.velocityX = GAME_CONSTANTS.MOVE_SPEED;
            player.facing = 'right';
        } else {
            player.velocityX *= 0.8; // 摩擦力
        }

        if ((this.keys.has('Space') || this.keys.has('KeyW') || this.keys.has('ArrowUp')) && player.onGround) {
            player.velocityY = GAME_CONSTANTS.JUMP_FORCE;
            player.onGround = false;
        }

        // 应用重力
        player.velocityY += GAME_CONSTANTS.GRAVITY;

        // 应用速度
        player.x += player.velocityX;
        player.y += player.velocityY;

        // 平台碰撞检测
        this.handlePlatformCollisions();

        // 边界检测
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > GAME_CONSTANTS.CANVAS_WIDTH) {
            player.x = GAME_CONSTANTS.CANVAS_WIDTH - player.width;
        }

        // 掉落检测
        if (player.y > GAME_CONSTANTS.CANVAS_HEIGHT) {
            this.resetPlayerPosition();
        }
    }

    /**
     * 处理平台碰撞
     */
    handlePlatformCollisions() {
        const player = this.gameObjects.player;
        player.onGround = false;

        this.gameObjects.platforms.forEach(platform => {
            let currentPlatform = { ...platform };

            // 更新移动平台
            if (platform.type === 'moving' && platform.startX !== undefined) {
                const range = platform.moveRange || 100;
                const speed = platform.moveSpeed || 1;
                currentPlatform.x = platform.startX + Math.sin(Date.now() * 0.001 * speed) * range;
            }

            if (checkCollision(player, currentPlatform)) {
                // 从上方落下
                if (player.velocityY > 0 && player.y < currentPlatform.y) {
                    player.y = currentPlatform.y - player.height;
                    player.velocityY = 0;
                    player.onGround = true;
                }
                // 从下方撞击
                else if (player.velocityY < 0 && player.y > currentPlatform.y) {
                    player.y = currentPlatform.y + currentPlatform.height;
                    player.velocityY = 0;
                }
                // 侧面碰撞
                else if (player.velocityX !== 0) {
                    if (player.x < currentPlatform.x) {
                        player.x = currentPlatform.x - player.width;
                    } else {
                        player.x = currentPlatform.x + currentPlatform.width;
                    }
                    player.velocityX = 0;
                }
            }
        });
    }

    /**
     * 重置玩家位置
     */
    resetPlayerPosition() {
        const player = this.gameObjects.player;
        player.x = 100;
        player.y = 600;
        player.velocityX = 0;
        player.velocityY = 0;
        showToast('小心！小老鼠掉下去了，重新开始吧！', 'error');
    }

    /**
     * 更新奶酪动画
     */
    updateCheeses() {
        this.gameObjects.cheeses.forEach(cheese => {
            cheese.animationOffset += 0.1;
        });
    }

    /**
     * 检查碰撞
     */
    checkCollisions() {
        const player = this.gameObjects.player;

        this.gameObjects.cheeses.forEach(cheese => {
            if (!cheese.collected && checkCollision(player, cheese)) {
                cheese.collected = true;
                this.score += 100;
                
                const result = this.gameState.collectCheese(1);
                const achievements = this.gameState.checkAchievements();
                
                showToast('奶酪！+100 分！', 'success');
                
                // 显示成就解锁
                achievements.forEach(achievement => {
                    showToast(`🏆 成就解锁：${achievement.title}`, 'achievement');
                });
            }
        });
    }

    /**
     * 检查游戏完成
     */
    checkGameCompletion() {
        const allCheeseCollected = this.gameObjects.cheeses.every(c => c.collected);
        if (allCheeseCollected && this.currentGameState === GAME_CONSTANTS.GAME_STATES.PLAYING) {
            this.completeGame(true);
        }
    }

    /**
     * 完成游戏
     * @param {boolean} success - 是否成功完成
     */
    completeGame(success) {
        this.currentGameState = GAME_CONSTANTS.GAME_STATES.COMPLETED;
        
        if (success) {
            this.gameState.completeLevel(this.gameState.gameProgress.currentLevel);
            showToast('关卡完成！所有奶酪都收集完了！', 'success');
        } else {
            showToast('时间到！虽然时间用完了，但你可以继续游戏！', 'info');
        }
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('completionOverlay')?.classList.remove('hidden');
    }

    /**
     * 渲染游戏
     */
    render() {
        if (!this.ctx) return;

        // 清空画布
        this.ctx.fillStyle = '#f5f5dc';
        this.ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);

        this.renderPlatforms();
        this.renderCheeses();
        this.renderPlayer();
    }

    /**
     * 渲染平台
     */
    renderPlatforms() {
        this.gameObjects.platforms.forEach(platform => {
            let currentPlatform = { ...platform };

            if (platform.type === 'moving' && platform.startX !== undefined) {
                const range = platform.moveRange || 100;
                const speed = platform.moveSpeed || 1;
                currentPlatform.x = platform.startX + Math.sin(Date.now() * 0.001 * speed) * range;
            }

            // 绘制平台
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(currentPlatform.x, currentPlatform.y, currentPlatform.width, currentPlatform.height);

            // 添加书本细节
            this.ctx.fillStyle = '#A0522D';
            this.ctx.fillRect(currentPlatform.x + 2, currentPlatform.y + 2, currentPlatform.width - 4, currentPlatform.height - 4);
        });
    }

    /**
     * 渲染奶酪
     */
    renderCheeses() {
        this.gameObjects.cheeses.forEach(cheese => {
            if (!cheese.collected) {
                const bounce = Math.sin(cheese.animationOffset) * 5;
                
                // 奶酪主体
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(
                    cheese.x + cheese.width / 2,
                    cheese.y + cheese.height / 2 + bounce,
                    cheese.width / 2,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();

                // 奶酪孔洞
                this.ctx.fillStyle = '#FFA500';
                this.ctx.beginPath();
                this.ctx.arc(cheese.x + cheese.width / 2 - 5, cheese.y + cheese.height / 2 + bounce - 3, 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(cheese.x + cheese.width / 2 + 3, cheese.y + cheese.height / 2 + bounce + 2, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    /**
     * 渲染玩家
     */
    renderPlayer() {
        const player = this.gameObjects.player;

        // 玩家主体
        this.ctx.fillStyle = '#808080';
        this.ctx.fillRect(player.x, player.y, player.width, player.height);

        // 耳朵
        this.ctx.fillStyle = '#FFB6C1';
        this.ctx.beginPath();
        this.ctx.arc(player.x + 8, player.y + 8, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(player.x + 32, player.y + 8, 6, 0, Math.PI * 2);
        this.ctx.fill();

        // 眼睛
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(player.x + 12, player.y + 15, 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(player.x + 28, player.y + 15, 2, 0, Math.PI * 2);
        this.ctx.fill();

        // 尾巴
        this.ctx.strokeStyle = '#808080';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        if (player.facing === 'right') {
            this.ctx.moveTo(player.x, player.y + player.height / 2);
            this.ctx.quadraticCurveTo(player.x - 15, player.y + player.height / 2 - 10, player.x - 20, player.y + player.height / 2 + 5);
        } else {
            this.ctx.moveTo(player.x + player.width, player.y + player.height / 2);
            this.ctx.quadraticCurveTo(player.x + player.width + 15, player.y + player.height / 2 - 10, player.x + player.width + 20, player.y + player.height / 2 + 5);
        }
        this.ctx.stroke();
    }

    /**
     * 更新UI
     */
    updateUI() {
        const scoreDisplay = document.getElementById('scoreDisplay');
        const timeDisplay = document.getElementById('timeDisplay');
        const cheeseDisplay = document.getElementById('cheeseDisplay');

        if (scoreDisplay) scoreDisplay.textContent = this.score;
        if (timeDisplay) timeDisplay.textContent = formatTime(this.timeLeft);

        if (cheeseDisplay) {
            const collected = this.gameObjects.cheeses.filter(c => c.collected).length;
            const total = this.gameObjects.cheeses.length;
            cheeseDisplay.textContent = `${collected}/${total}`;
        }
    }
}