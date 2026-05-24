const Helpers = {
    formatDate(date, format = 'full') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];

        switch (format) {
            case 'full':
                return `${year}年${month}月${day}日 ${weekday}`;
            case 'short':
                return `${month}月${day}日`;
            case 'date':
                return `${year}-${month}-${day}`;
            case 'month':
                return `${year}年${month}月`;
            case 'time':
                return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            default:
                return `${year}-${month}-${day}`;
        }
    },

    getToday() {
        return this.formatDate(new Date(), 'date');
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    countWords(text) {
        if (!text) return 0;
        const chinese = text.match(/[\u4e00-\u9fa5]/g) || [];
        const english = text.match(/[a-zA-Z]+/g) || [];
        return chinese.length + english.length;
    },

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    },

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    },

    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    },

    isSameDay(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    },

    isToday(date) {
        return this.isSameDay(date, new Date());
    },

    getMonthRange(year, month) {
        const daysInMonth = this.getDaysInMonth(year, month);
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month, daysInMonth);

        return {
            start: this.formatDate(firstDay, 'date'),
            end: this.formatDate(lastDay, 'date'),
            daysInMonth
        };
    },

    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    },

    downloadFile(data, filename, type = 'application/json') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textarea);
        return result;
    },

    scrollToElement(element, behavior = 'smooth') {
        if (element) {
            element.scrollIntoView({ behavior, block: 'start' });
        }
    },

    createElement(tag, className, content) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) {
            if (typeof content === 'string') {
                element.textContent = content;
            } else if (content instanceof Node) {
                element.appendChild(content);
            }
        }
        return element;
    },

    $(selector, context = document) {
        return context.querySelector(selector);
    },

    $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    },

    showToast(message, type = 'default', duration = 3000) {
        const container = $('#toastContainer');
        if (!container) return;

        const toast = this.createElement('div', `toast ${type}`, message);
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    animateValue(element, start, end, duration = 500) {
        const startTime = performance.now();
        const change = end - start;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + change * easeProgress);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    },

    getContrastColor(hexColor) {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#4A5568' : '#FFFFFF';
    },

    parseMBTI(answers) {
        if (answers.length < 4) return null;

        const types = answers.map(a => a.type).join('');
        const validTypes = Object.keys(MBTI_TYPES);

        if (validTypes.includes(types)) {
            return types;
        }

        const typeCount = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        answers.forEach(a => typeCount[a.type]++);

        let result = '';
        result += typeCount.E >= typeCount.I ? 'E' : 'I';
        result += typeCount.S >= typeCount.N ? 'S' : 'N';
        result += typeCount.T >= typeCount.F ? 'T' : 'F';
        result += typeCount.J >= typeCount.P ? 'J' : 'P';

        return result;
    }
};

function $(selector, context = document) {
    return context.querySelector(selector);
}

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}
