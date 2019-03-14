const Alexa = require('alexa-sdk');
const handlers = require('./handlers');

const APP_ID = 'YOUR_AMAZON_APP_ID_HERE';

exports.handler = function(event, context, callback) {
    let alexa = Alexa.handler(event, context);

    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};




