// 辅助工具函数

/**
 * 显示Toast通知
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型: info, success, error, achievement
 */
window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // 触发动画
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 移除通知
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

/**
 * 格式化时间显示
 * @param {number} seconds - 秒数
 * @returns {string} 格式化的时间字符串 (MM:SS)
 */
window.formatTime = function(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 碰撞检测
 * @param {Object} rect1 - 第一个矩形对象 {x, y, width, height}
 * @param {Object} rect2 - 第二个矩形对象 {x, y, width, height}
 * @returns {boolean} 是否发生碰撞
 */
window.checkCollision = function(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * 深拷贝对象
 * @param {Object} obj - 要拷贝的对象
 * @returns {Object} 拷贝后的新对象
 */
window.deepClone = function(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const clonedObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    return clonedObj;
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间(毫秒)
 * @returns {Function} 防抖后的函数
 */
window.debounce = function(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 间隔时间(毫秒)
 * @returns {Function} 节流后的函数
 */
window.throttle = function(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

/**
 * 获取随机数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
window.getRandomNumber = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {Object} 验证结果 {valid: boolean, message: string}
 */
window.validateUsername = function(username) {
    if (!username || username.trim().length === 0) {
        return { valid: false, message: '用户名不能为空' };
    }
    
    if (username.length < 2) {
        return { valid: false, message: '用户名至少需要2个字符' };
    }
    
    if (username.length > 20) {
        return { valid: false, message: '用户名最多20个字符' };
    }
    
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/.test(username)) {
        return { valid: false, message: '用户名只能包含中文、英文、数字、下划线和横线' };
    }
    
    return { valid: true, message: '' };
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
window.validateEmail = function(email) {
    if (!email) return true; // 邮箱可选
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}