class CaptchaGenerator {
    constructor() {
        this.canvas = document.getElementById('captcha-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.captchaText = '';
        this.initCanvas();
    }
    
    initCanvas() {
        this.canvas.width = 300;
        this.canvas.height = 100;
    }
    
    generateRandomText() {
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%&';
        this.captchaText = Array(6).fill()
            .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
            .join('');
        return this.captchaText;
    }
    
    drawLine() {
        this.ctx.beginPath();
        this.ctx.moveTo(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
        this.ctx.lineTo(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
        this.ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.2)`;
        this.ctx.lineWidth = 1 + Math.random() * 2;
        this.ctx.stroke();
    }
    
    generate() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const text = this.generateRandomText();
        
        // Draw noise lines
        for(let i = 0; i < 20; i++) {
            this.drawLine();
        }
        
        let x = 30; 
        const y = this.canvas.height / 2; 

        // Draw captcha text with enhanced styling
        for(let i = 0; i < text.length; i++) {
            this.ctx.save();            
            const charX = x + i * 40;
            const charY = y + Math.sin(i * 0.5) * 10;
            this.ctx.translate(charX, charY);
            this.ctx.rotate((Math.random() - 0.5) * 0.4);
            
            // Randomize font size and style
            const fontSize = 35 + Math.random() * 10;
            const fontStyles = ['bold', 'italic', 'normal'];
            const fontStyle = fontStyles[Math.floor(Math.random() * fontStyles.length)];
            this.ctx.font = `${fontStyle} ${fontSize}px Poppins, Arial`;
            
            // Use more vibrant colors
            const r = Math.floor(Math.random() * 100);
            const g = Math.floor(Math.random() * 100);
            const b = Math.floor(Math.random() * 100);
            this.ctx.fillStyle = `rgb(${r},${g},${b})`;
            
            // Add text shadow for depth
            this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
            
            this.ctx.fillText(text[i], 0, 0);            
            this.ctx.restore();
        }
        
        // Add noise dots
        for(let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 2;            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`;
            this.ctx.fill();
        }
        
        // Add wavy lines across the canvas
        for(let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, Math.random() * this.canvas.height);            
            let x = 0;
            while(x < this.canvas.width) {
                x += 10;
                this.ctx.lineTo(
                    x, 
                    Math.sin(x * 0.05) * 20 + (Math.random() * 20 + this.canvas.height/2)
                );
            }
            this.ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.1)`;
            this.ctx.lineWidth = 1 + Math.random() * 2;
            this.ctx.stroke();
        }
    }
    
    verify(userInput) {
        return userInput === this.captchaText;
    }
}

class CaptchaCash {
    constructor() {
        this.earnings = this.loadEarnings();
        this.solvedCount = this.loadSolvedCount();
        this.startTime = new Date();
        this.captchaGenerator = new CaptchaGenerator();
        this.initializeElements();
        this.attachEventListeners();
        this.generateNewCaptcha();
        this.updateStats();
        this.addAnimations();
    }
    
    initializeElements() {
        this.earningsElement = document.getElementById('earnings');
        this.solvedCountElement = document.getElementById('solved-count');
        this.timeSpentElement = document.getElementById('time-spent');
        this.messageElement = document.getElementById('message');
        this.captchaInput = document.getElementById('captcha-input');
        this.cashoutButton = document.getElementById('cashout-btn');
        
        if (!this.earningsElement || !this.solvedCountElement || 
            !this.timeSpentElement || !this.messageElement || 
            !this.captchaInput || !this.cashoutButton) {
            console.error('Required elements not found. Check your HTML IDs.');
        }
    }
    
    loadEarnings() {
        return parseFloat(localStorage.getItem('earnings')) || 0;
    }
    
    loadSolvedCount() {
        return parseInt(localStorage.getItem('solvedCount')) || 0;
    }
    
    saveProgress() {
        localStorage.setItem('earnings', this.earnings.toString());
        localStorage.setItem('solvedCount', this.solvedCount.toString());
    }
    
    attachEventListeners() {
        const refreshButton = document.getElementById('refresh-captcha');
        const submitButton = document.getElementById('submit-captcha');
        
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.generateNewCaptcha());
        }
        
        if (submitButton) {
            submitButton.addEventListener('click', () => this.verifyCaptcha());
        }
        
        if (this.cashoutButton) {
            this.cashoutButton.addEventListener('click', () => this.cashout());
        }
        
        if (this.captchaInput) {
            this.captchaInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.verifyCaptcha();
                }
            });
        }
        
        setInterval(() => this.updateTimeSpent(), 1000);
        setInterval(() => this.saveProgress(), 5000);
    }
    
    addAnimations() {
        // Add pulse animation to cashout button when earnings reach a threshold
        if (this.earnings >= 20) {
            this.cashoutButton.classList.add('pulse');
        } else {
            this.cashoutButton.classList.remove('pulse');
        }
    }
    
    generateNewCaptcha() {
        this.captchaGenerator.generate();
        
        if (this.captchaInput) {
            this.captchaInput.value = '';
            this.captchaInput.focus();
        }
        
        if (this.messageElement) {
            this.messageElement.className = 'message';
            this.messageElement.textContent = '';
        }
    }
    
    verifyCaptcha() {
        const userInput = this.captchaInput.value;   
        
        if (!userInput) {
            this.showMessage('Please enter the captcha text', 'error');
            return;
        }
        
        if (this.captchaGenerator.verify(userInput)) {
            this.earnings += 5;
            this.solvedCount++;
            this.updateStats();
            this.saveProgress();
            this.showMessage('Correct! Earned ₹5', 'success');
            this.generateNewCaptcha();
            this.addAnimations();
        } else {
            this.showMessage('Incorrect captcha. Try again!', 'error');
            this.generateNewCaptcha();
        }
    }
    
    updateStats() {
        if (this.earningsElement) {
            this.earningsElement.textContent = this.earnings.toFixed(2);
        }
        
        if (this.solvedCountElement) {
            this.solvedCountElement.textContent = this.solvedCount;
        }
    }
    
    updateTimeSpent() {
        if (this.timeSpentElement) {
            const now = new Date();
            const diff = Math.floor((now - this.startTime) / 1000);
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            this.timeSpentElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    showMessage(text, type) {
        if (this.messageElement) {
            this.messageElement.textContent = text;
            this.messageElement.className = `message ${type}`;
        }
    }
    
    cashout() {
        if (this.earnings <= 0) {
            this.showMessage('No earnings to cash out!', 'error');
            return;
        }
        
        localStorage.setItem('earnings', this.earnings.toString());
        const currentPath = window.location.pathname;
        const directoryPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        window.location.replace(directoryPath + '/cashout/cashout.html');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CaptchaCash();
});