let request = require("request");
let utils = require("./utilities");
let intents = require("./intents");

const SKILL_NAME = "Crypto Market";
const WELCOME_MESSAGE = "Welcome to the Crypto Market. What cryptocurrency would you like to know about";
const HELP_MESSAGE = "You can ask for the latest on a cryptocurrency, or, you can say exit... How can I help?";
const HELP_REPROMPT = "Try saying something like: 'What is the price of Bitcoin'";
const STOP_MESSAGE = "Goodbye!";

let ERROR_MESSAGE = "I didn't catch that. What coin was that?";
let LAST_MESSAGE = "What cryptocurrency can I help you with?";
let messageChanged = false;

const newSessionHandler = function() {
    this.emit('LaunchRequest');    
};

const launchRequestHandler = function () {
    if (this.event.request.type === "IntentRequest") {
        this.emit(this.event.request.intent.name);
    }
    else {
        this.emit(":ask", WELCOME_MESSAGE);
    }
}

const coinPriceHandler = function () {
    let coin = this.event.request.intent.slots.coin.value;
    
    coin = coin ? coin.replace(/ /g, '-') : this.emit(':ask', ERROR_MESSAGE);
    
    request('https://api.coinmarketcap.com/v1/ticker/' + coin, (err, resp, body) => {
        let res = JSON.parse(body);

        if (err || res.error) {
            this.emit(':ask', ERROR_MESSAGE); 
            if(!messageChanged) {
                ERROR_MESSAGE = "Sorry, I couldn't find " + coin + ". Please try another one.";
                messageChanged = true;
            }
            else{
                ERROR_MESSAGE = "I didn't catch that. What coin was that?";
                messageChanged = false;
            }
            return;
        }

        let priceUSD = parseFloat(res[0].price_usd).toFixed(2);
        let cardText = "The price of " + coin + " is US$" + priceUSD;
        let alexaSays = "The price of " + coin + " is US$" + priceUSD;

        LAST_MESSAGE = alexaSays;
        ERROR_MESSAGE = "I didn't catch that. What coin was that?";

        this.emit(':tellWithCard', alexaSays, SKILL_NAME, cardText);
    });
}

const coinInfoHandler = function () {
    let coin = this.event.request.intent.slots.coin.value;
    
    coin = coin ? coin.replace(/ /g, '-') : this.emit(':ask', ERROR_MESSAGE);
    
    request('https://api.coinmarketcap.com/v1/ticker/' + coin, (err, resp, body) => {
        let res = JSON.parse(body);

        if (err || res.error) {
            this.emit(':ask', ERROR_MESSAGE); 
            if(!messageChanged) {
                ERROR_MESSAGE = "Sorry, I couldn't find " + coin + ". Please try another one.";
                messageChanged = true;
            }
            else{
                ERROR_MESSAGE = "I didn't catch that. What coin was that?";
                messageChanged = false;
            }
            return;
        }

        let info = {
            coin_name: res[0].name,
            symbol: res[0].symbol.split('').join('.'),
            usd: 'US$' + parseFloat(res[0].price_usd).toFixed(2),
            change_1h: utils.readChange(res[0].percent_change_1h),
            change_24h: utils.readChange(res[0].percent_change_24h),
            change_7d: utils.readChange(res[0].percent_change_7d)
        };

        var alexaSays = info.coin_name + ', <prosody pitch="low"> or ' + info.symbol + '</prosody>,' +
                        'is currently ' + info.usd + '. <break time="0.5s" />' +
                        info.coin_name + ' is ' + info.change_1h + ' in the last hour, ' +
                        info.change_24h + ' in 24 hours, and' +
                        info.change_7d + ' in 7 days';

        var cardText = info.coin_name + ' (' + res[0].symbol + ') ' +
                        'is currently ' + info.usd + '. ' +
                        info.coin_name + ' is ' + info.change_1h + ' in the last hour, ' +
                        info.change_24h + ' in 24 hours, and' +
                        info.change_7d + ' in 7 days.';

        LAST_MESSAGE = alexaSays;
        ERROR_MESSAGE = "I didn't catch that. What coin was that?";

        this.emit(':tellWithCard', alexaSays, SKILL_NAME, cardText);
    });
}
    
const amazonHelpHandler = function () {
    this.emit(':ask', HELP_MESSAGE);
}

const amazonStopHandler = function () {
    this.emit(':tell', STOP_MESSAGE);
}

const amazonCancelHandler = function () {
    this.emit(':tell', STOP_MESSAGE);
}

const amazonRepeatHandler = function () {
    this.emit(':tell', LAST_MESSAGE);
}

const amazonUnhandled = function () {
    this.emit(':ask', "I don't know about that. "  + HELP_MESSAGE);
}

const amazonSessionEnd = function () {
    ERROR_MESSAGE = "I didn't catch that. What coin was that?";
    this.emit(':tell', "I hope your cryptocurrency is doing well. Goodbye!");
}

let handlers = {};

// Event handlers
handlers["NewSession"] = newSessionHandler;
handlers["LaunchRequest"] = launchRequestHandler;
handlers["Unhandled"] = amazonUnhandled;
handlers["SessionEndedRequest"] = amazonSessionEnd;

// Intent handlers
handlers["CoinPriceIntent"] = coinPriceHandler;
handlers["CoinInfoIntent"] = coinInfoHandler;
handlers[intents.AMAZON_CANCEL] = amazonCancelHandler;
handlers[intents.AMAZON_STOP] = amazonStopHandler;
handlers[intents.AMAZON_HELP] = amazonHelpHandler;
handlers[intents.AMAZON_REPEAT] = amazonRepeatHandler;

module.exports = handlers;
