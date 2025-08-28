// 对话系统数据
window.DIALOGUE_STORY = {
    'intro-1': {
        id: 'intro-1',
        speaker: '神秘的声音',
        text: '欢迎来到书本的世界，小老鼠...',
        nextId: 'intro-2'
    },
    'intro-2': {
        id: 'intro-2',
        speaker: '神秘的声音',
        text: '这里是一个充满魔法的图书馆，每一本书都蕴含着神奇的力量。',
        nextId: 'intro-3'
    },
    'intro-3': {
        id: 'intro-3',
        speaker: '小老鼠',
        text: '哇！这些书本居然在漂浮！这里真是太神奇了！',
        nextId: 'intro-4'
    },
    'intro-4': {
        id: 'intro-4',
        speaker: '神秘的声音',
        text: '没错，但是要小心。这些书本不只是装饰，它们是你前进道路上的平台。',
        nextId: 'intro-5'
    },
    'intro-5': {
        id: 'intro-5',
        speaker: '神秘的声音',
        text: '你的任务是收集散落在各处的魔法奶酪，它们能帮助你解锁更深层的世界。',
        nextId: 'intro-6'
    },
    'intro-6': {
        id: 'intro-6',
        speaker: '小老鼠',
        text: '奶酪？我最喜欢奶酪了！那我该怎么开始呢？',
        nextId: 'intro-7'
    },
    'intro-7': {
        id: 'intro-7',
        speaker: '神秘的声音',
        text: '使用WASD键或方向键移动，空格键跳跃。记住，时机很重要！',
        nextId: 'intro-8'
    },
    'intro-8': {
        id: 'intro-8',
        speaker: '神秘的声音',
        text: '现在，让我们开始你的第一次冒险吧！小心那些移动的平台...',
        options: [
            { text: '我准备好了！开始游戏！', nextId: 'start-game' },
            { text: '让我再听一遍操作说明', nextId: 'intro-7' }
        ]
    }
};