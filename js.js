class Gate {
    ccxt = require('ccxt');

    //переменные для доступа к API биржи, у других бирж могут быть другими
    ACCESS_KEY = "";
    SECRET_KEY = "";

    //переменные для объекта класса биржи, а также массив с проксями и id текущего используемого прокси
    exchange = null;
    proxy_arr = null;
    used_proxy = 0;

    //конструктор, здесь мы создаем объект класса биржи и прокидываем список прокси
    constructor(access_key, secret_key, proxy_init) {
        this.proxy_arr = proxy_init;
        this.exchange = new this.ccxt.gate({
            apiKey: access_key,
            secret: secret_key,
        });
    }

    //в этом методе подгружаем необходимые для работы класса ccxt данные
    async initialize() {
        this.exchange['markets'] = await this.exchange.loadMarkets();
    }

    //получаем цены по паре (BNB/USDT) из стакана, с учетом глубины стакана (depth), т.е. сколько позиций берем из стакана
    async getPrices(pair, depth) {

        //устанавливаем прокси, т.к. мы ограничены в кол-ве запросов в секунду
        let proxy = this.getNewProxy();
        this.exchange.proxies = {
            'http': proxy
        };
        //предварительно готовим объект для ответа, так как даже если на бирже нет токена, нужно вернуть что-то
        let result = {
            "saleObject": [],
            "buyObject": []
        };
        //если пара есть на бирже, запрашиваем стакан
        if (this.exchange.markets[pair]) {
            try {
                let res = await this.exchange.fetchOrderBook(pair, depth);
                result.saleObject = res['bids']; //объект с позициями, куда мы можем ПРОДАТЬ свой объем токенов
                result.buyObject = res['asks'];  //объект с позициями, по которым мы можем КУПИТЬ токен
            } catch (ex) {
                console.log(ex); //данные для дебага, если будет ошибка
            }
        }

        return result;
    }

    async getDepositWallet(pair) {
        let symbol = pair.toString().split("/")[0].trim();
        let wallet = false;
        try {
            let request = await this.exchange.fetchDepositAddress(symbol, { 'network': "BEP20" });
            if (request && request.info.multichain_addresses && Array.isArray(request.info.multichain_addresses)) {
                // прохожу по каждому элементу массива multichain_addresses
                for (let addressInfo of request.info.multichain_addresses) {
                    // проверяю, если значение свойства 'chain' равно 'BSC'
                    if (addressInfo.chain === 'BSC') {
                        console.log(addressInfo.chain);
                        console.log(addressInfo.address);
                        wallet = addressInfo.address;
                        break; 
                    }
                }
            } else {
                console.log("No deposit address found.");
            }
        } catch (ex) {
            console.log(ex);
        }
        return wallet;
    }
    
    //получаем объем токена, который придет после вывода. Передаем пару(или тикер токена) и объем токена
    async getFinalFreeVolume(pair, volume) {
        let symbol = pair.toString().split("/")[0].trim();
        let request = await this.exchange.fetchDepositWithdrawFees();
        if (request[symbol]['networks']['BSC']) {
            return volume - request[symbol]['networks']['BSC']['withdraw']['fee'];
        } else {
            return 0;
        }
    }

    //получаем текущий баланс токена на аккаунте бирже. Передаем пару либо тикер
    async getBalance(pair) {
        let symbol = pair.toString().split("/")[0].trim();
        let balance = 0;
        try {
            let temp_balance = await this.exchange.fetchBalance();
            if ('free' in temp_balance && symbol in temp_balance['free'] && temp_balance['free'][symbol] !== undefined) {
                balance = temp_balance['free'][symbol];
            } else {
                balance = null;
            }
        } catch (ex) {
            console.log(ex);
        }
        return balance;
    }

    //получаем комиссию при торгах на бирже. Передаем пару (BNB/USDT), цену ордера и объем 
    async getFee(pair, price, volume) {
        let fee = false;
        try {
            let fees = await this.exchange.fetchTradingFees();
            let takerFee = fees[pair].maker;
            fee = volume * price * takerFee;
        } catch (ex) {
            console.log(ex);
        }
        return fee;
    }

    //проверяем возможность завести токен на биржу. Передаем пару либо тикер
    canDeposit(pair) {
        let result = false;
        try {
            let symb = pair.toString().split("/")[0].trim();
            if (this.exchange.currencies[symb] && this.exchange.currencies[symb]['networks'] && this.exchange.currencies[symb]['networks']['BEP20']) {
                if (this.exchange.currencies[symb]['networks']['BEP20'].active && this.exchange.currencies[symb]['networks']['BEP20'].deposit) {
                    result = true;
                }
            }
        } catch (ex) {
            console.log(ex);
        }
        return result;
    }

    //проверяем возможность вывести токен с биржи. Передаем пару либо тикер
    canWithdraw(pair) {
        let result = false;
        try {
            let symb = pair.toString().split("/")[0].trim();
            if (this.exchange.currencies[symb] && this.exchange.currencies[symb]['networks'] && this.exchange.currencies[symb]['networks']['BEP20']) {
                if (this.exchange.currencies[symb]['networks']['BEP20'].active && this.exchange.currencies[symb]['networks']['BEP20'].withdraw) {
                    result = true;
                }
            }
        } catch (ex) {
            console.log(ex);
        }
        return result;
    }

    //возвращаем новый прокси из массива, идем по кругу по каждой записи
    getNewProxy() {
        this.used_proxy++;
        if (this.used_proxy >= this.proxy_arr.length) this.used_proxy = 0;
        let proxy = this.proxy_arr[this.used_proxy];
        return proxy;
    }

}

module.exports = Gate;
