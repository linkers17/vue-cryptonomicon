const API_KEY = 'c5b4b0e5148c95f627ed0696c04a3b84a2378071f66cc509ac61aa6f2ca0adc8';
const AGGREGATE_INDEX = '5';
const INVALID_SUB = '500';

const tickersHandlers = new Map();
const ws = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);

ws.addEventListener('message', e => {
    const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);

    if (type !== AGGREGATE_INDEX || !newPrice) {
        return;
    }

    const handlers = tickersHandlers.get(currency) ?? [];
    handlers.forEach(fn => fn(newPrice));
});

function sendToWebSocket(message) {
    const stringifinedMessage = JSON.stringify(message);

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(stringifinedMessage);
        return;
    }

    ws.addEventListener('open', () => {
        ws.send(stringifinedMessage);
    }, {once: true});
}

function subscribeToTickerOnWs(ticker) {
    sendToWebSocket({
        action: 'SubAdd',
        subs: [`5~CCCAGG~${ticker}~USD`]
    });
}

function unsubscribeFromTickerOnWs(ticker) {
    sendToWebSocket({
        action: 'SubRemove',
        subs: [`5~CCCAGG~${ticker}~USD`]
    });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};



export const unsubscribeFromTicker = ticker => {
    tickersHandlers.delete(ticker);
    unsubscribeFromTickerOnWs(ticker);
}
