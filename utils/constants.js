// 游戏常量配置
window.GAME_CONSTANTS = {
    // 物理常量
    GRAVITY: 0.8,
    JUMP_FORCE: -15,
    MOVE_SPEED: 5,
    
    // 画布尺寸
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,
    
    // 游戏设置
    TYPING_SPEED: 50, // 打字机效果速度
    GAME_FPS: 60,     // 游戏帧率
    TIMER_DURATION: 120, // 游戏时长(秒)
    
    // 本地存储键名
    STORAGE_KEYS: {
        PLAYER_DATA: 'mouseGamePlayer',
        GAME_SAVES: 'mouseGameSaves',
        SETTINGS: 'mouseGameSettings'
    },
    
    // 页面标识
    PAGES: {
        HOME: 'homePage',
        REGISTER: 'registerPage',
        LOGIN: 'loginPage',
        STORY: 'storyPage',
        DIALOGUE: 'dialoguePage',
        GAME: 'gamePage',
        ACHIEVEMENTS: 'achievementsPage',
        SAVES: 'savesPage',
        TEAM: 'teamPage',
        TEAM_MEMBER: 'teamMemberPage'
    },
    
    // 游戏状态
    GAME_STATES: {
        PLAYING: 'playing',
        PAUSED: 'paused',
        COMPLETED: 'completed'
    }
};

// 成就配置
window.ACHIEVEMENTS = [
    {
        id: 'first-cheese',
        title: '第一块奶酪',
        description: '收集你的第一块奶酪',
        unlocked: false,
        icon: '🧀',
        condition: (player) => player.cheeseCollected >= 1
    },
    {
        id: 'cheese-collector',
        title: '奶酪收集家',
        description: '收集50块奶酪',
        unlocked: false,
        icon: '🏆',
        condition: (player) => player.cheeseCollected >= 50
    },
    {
        id: 'level-master',
        title: '关卡大师',
        description: '完成前5个关卡',
        unlocked: false,
        icon: '⭐',
        condition: (progress) => progress.completedLevels.length >= 5
    },
    {
        id: 'speed-runner',
        title: '速通专家',
        description: '在60秒内完成一个关卡',
        unlocked: false,
        icon: '⚡',
        condition: (timeLeft, startTime) => (startTime - timeLeft) <= 60
    }
];

// 游戏对象初始配置
window.INITIAL_GAME_OBJECTS = {
    player: {
        x: 100,
        y: 600,
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 0,
        onGround: false,
        facing: 'right'
    },
    platforms: [
        // 静态平台
        { x: 0, y: 750, width: 200, height: 50, type: 'static' },
        { x: 300, y: 650, width: 150, height: 20, type: 'static' },
        { x: 550, y: 550, width: 150, height: 20, type: 'static' },
        { x: 800, y: 450, width: 150, height: 20, type: 'static' },
        { x: 1000, y: 350, width: 200, height: 20, type: 'static' },
        
        // 移动平台
        { 
            x: 250, y: 400, width: 120, height: 20, type: 'moving', 
            moveSpeed: 1, moveDirection: 1, moveRange: 200, startX: 250 
        },
        { 
            x: 600, y: 300, width: 120, height: 20, type: 'moving', 
            moveSpeed: 1.5, moveDirection: -1, moveRange: 150, startX: 600 
        }
    ],
    cheeses: [
        { x: 350, y: 600, width: 30, height: 30, collected: false, animationOffset: 0 },
        { x: 600, y: 500, width: 30, height: 30, collected: false, animationOffset: Math.PI },
        { x: 850, y: 400, width: 30, height: 30, collected: false, animationOffset: Math.PI / 2 },
        { x: 1100, y: 300, width: 30, height: 30, collected: false, animationOffset: Math.PI * 1.5 },
        { x: 300, y: 350, width: 30, height: 30, collected: false, animationOffset: Math.PI / 4 }
    ]
};

// 团队成员配置
window.TEAM_MEMBERS = [
    {
        id: 'member1',
        name: '张小明',
        role: '项目经理 & 前端开发',
        avatar: '👨‍💼',
        bio: '负责项目整体规划和前端架构设计，拥有5年Web开发经验。',
        skills: ['JavaScript', 'React', 'Vue.js', '项目管理'],
        contact: {
            email: 'zhangxiaoming@example.com',
            github: 'https://github.com/zhangxiaoming'
        },
        achievements: [
            '主导完成了3个大型Web应用项目',
            '精通现代前端框架和工具链',
            '具有丰富的团队协作经验'
        ],
        quote: '代码如诗，用心雕琢每一行。',
        joinDate: '2023-01-15',
        favoriteColor: '#4F46E5'
    },
    {
        id: 'member2', 
        name: '李小红',
        role: '游戏设计师 & UI/UX设计',
        avatar: '👩‍🎨',
        bio: '专注于游戏体验设计和用户界面优化，让每个用户都能享受最佳的游戏体验。',
        skills: ['游戏设计', 'UI/UX设计', 'Figma', '用户体验'],
        contact: {
            email: 'lixiaohong@example.com',
            github: 'https://github.com/lixiaohong'
        },
        achievements: [
            '设计了10+款受欢迎的小游戏',
            '擅长可爱风格的游戏美术设计',
            '注重用户体验的细节打磨'
        ],
        quote: '好的设计不只是看起来美，更要用起来爽。',
        joinDate: '2023-02-01',
        favoriteColor: '#EC4899'
    },
    {
        id: 'member3',
        name: '王小强',
        role: '后端开发 & 系统架构',
        avatar: '👨‍💻',
        bio: '负责后端服务开发和系统架构设计，确保游戏的稳定性和可扩展性。',
        skills: ['Node.js', 'Python', '数据库设计', '系统架构'],
        contact: {
            email: 'wangxiaoqiang@example.com',
            github: 'https://github.com/wangxiaoqiang'
        },
        achievements: [
            '构建了多个高并发游戏后端系统',
            '精通数据库优化和性能调优',
            '具有丰富的服务器部署经验'
        ],
        quote: '稳定的后端是优秀游戏的基石。',
        joinDate: '2023-01-20',
        favoriteColor: '#10B981'
    },
    {
        id: 'member4',
        name: '赵小美',
        role: '测试工程师 & 质量保证',
        avatar: '👩‍🔬',
        bio: '专注于游戏测试和质量保证，确保每个功能都能完美运行。',
        skills: ['软件测试', '自动化测试', '质量保证', 'Bug追踪'],
        contact: {
            email: 'zhaoxiaomei@example.com',
            github: 'https://github.com/zhaoxiaomei'
        },
        achievements: [
            '建立了完善的游戏测试流程',
            '发现并修复了200+个潜在问题',
            '保证了游戏的高质量发布'
        ],
        quote: '每一个Bug都是提升用户体验的机会。',
        joinDate: '2023-02-10',
        favoriteColor: '#F59E0B'
    }
];