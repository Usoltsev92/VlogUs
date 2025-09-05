class BingXAPI {
    constructor(apiKey, secretKey) {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.baseURL = 'https://open-api.bingx.com';
    }

    async getAccountBalance() {
        try {
            const endpoint = '/openApi/swap/v2/user/balance';
            const timestamp = Date.now();
            
            // Создаем подпись
            const queryString = `timestamp=${timestamp}`;
            const signature = await this.createSignature(queryString);
            
            const url = `${this.baseURL}${endpoint}?${queryString}&signature=${signature}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-BX-APIKEY': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.code !== 0) {
                throw new Error(`API Error: ${data.msg}`);
            }

            return data.data.balance;
            
        } catch (error) {
            console.error('Error fetching balance:', error);
            throw error;
        }
    }

    async createSignature(queryString) {
        // В реальном приложении здесь должна быть реализация подписи
        // Используем простой хэш для демонстрации
        const encoder = new TextEncoder();
        const data = encoder.encode(queryString + this.secretKey);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async getCurrentPrices(symbols) {
        try {
            const endpoint = '/openApi/swap/v2/quote/ticker';
            const symbolParams = symbols.map(s => `symbol=${s}`).join('&');
            const url = `${this.baseURL}${endpoint}?${symbolParams}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            const prices = {};
            data.data.forEach(ticker => {
                prices[ticker.symbol] = parseFloat(ticker.lastPrice);
            });
            
            return prices;
        } catch (error) {
            console.error('Error fetching prices:', error);
            throw error;
        }
    }
}

class BalanceManager {
    constructor() {
        this.api = null;
        this.assets = [];
    }

    async initialize(apiKey, secretKey) {
        this.api = new BingXAPI(apiKey, secretKey);
        await this.loadData();
    }

    async loadData() {
        try {
            this.showLoading();
            
            const balances = await this.api.getAccountBalance();
            const symbols = balances.map(asset => asset.asset);
            const prices = await this.api.getCurrentPrices(symbols);
            
            this.assets = balances.map(asset => ({
                symbol: asset.asset,
                balance: parseFloat(asset.balance),
                price: prices[asset.asset] || 0,
                value: parseFloat(asset.balance) * (prices[asset.asset] || 0)
            })).filter(asset => asset.balance > 0);
            
            this.displayBalances();
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    displayBalances() {
        const container = document.getElementById('assetsContainer');
        const totalBalanceElement = document.getElementById('totalBalance');
        
        container.innerHTML = '';
        
        let totalValue = 0;
        
        this.assets.forEach(asset => {
            totalValue += asset.value;
            
            const assetCard = document.createElement('div');
            assetCard.className = 'asset-card';
            assetCard.innerHTML = `
                <div class="asset-symbol">${asset.symbol}</div>
                <div class="asset-balance">${asset.balance.toFixed(4)}</div>
                <div class="asset-value">${asset.value.toFixed(2)} USDT</div>
                <div class="asset-price">Цена: ${asset.price.toFixed(4)} USDT</div>
            `;
            
            container.appendChild(assetCard);
        });
        
        totalBalanceElement.textContent = `${totalValue.toFixed(2)} USDT`;
        
        document.getElementById('loading').style.display = 'none';
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('errorMessage').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').textContent = `Ошибка: ${message}`;
        document.getElementById('loading').style.display = 'none';
    }
}

const balanceManager = new BalanceManager();

async function loadBalances() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const secretKey = document.getElementById('secretKey').value.trim();
    
    if (!apiKey || !secretKey) {
        alert('Пожалуйста, введите API Key и Secret Key');
        return;
    }
    
    try {
        await balanceManager.initialize(apiKey, secretKey);
    } catch (error) {
        console.error('Failed to load balances:', error);
    }
}

// Демонстрационные данные для тестирования
function loadDemoData() {
    const demoAssets = [
        { symbol: 'BTC', balance: 0.5, price: 45000, value: 22500 },
        { symbol: 'ETH', balance: 3.2, price: 3000, value: 9600 },
        { symbol: 'BNB', balance: 15, price: 400, value: 6000 },
        { symbol: 'USDT', balance: 5000, price: 1, value: 5000 }
    ];
    
    const container = document.getElementById('assetsContainer');
    const totalBalanceElement = document.getElementById('totalBalance');
    
    container.innerHTML = '';
    
    let totalValue = 0;
    
    demoAssets.forEach(asset => {
        totalValue += asset.value;
        
        const assetCard = document.createElement('div');
        assetCard.className = 'asset-card';
        assetCard.innerHTML = `
            <div class="asset-symbol">${asset.symbol}</div>
            <div class="asset-balance">${asset.balance.toFixed(4)}</div>
            <div class="asset-value">${asset.value.toFixed(2)} USDT</div>
            <div class="asset-price">Цена: ${asset.price.toFixed(4)} USDT</div>
        `;
        
        container.appendChild(assetCard);
    });
    
    totalBalanceElement.textContent = `${totalValue.toFixed(2)} USDT`;
    document.getElementById('loading').style.display = 'none';
}

// Для тестирования без API ключей
// loadDemoData();