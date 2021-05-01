const API_KEY = 'c5b4b0e5148c95f627ed0696c04a3b84a2378071f66cc509ac61aa6f2ca0adc8';

const tickersHandlers = new Map();

const loadTickers = () => {

    if (tickersHandlers.size === 0) {
        return;
    }

    fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(',')}&tsyms=USD&api_key=${API_KEY}`
    )
        .then(res => res.json()
        .then(rawData => {
            const updatedPrices = Object.fromEntries(
                Object.entries(rawData).map(([key, value]) => [key, value.USD])
            );

            Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
               const handlers = tickersHandlers.get(currency) ?? [];
               handlers.forEach(fn => fn(newPrice));
            });
        })
    );
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = ticker => {
    /*const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, subscribers.filter(fn => fn !== cb));*/
    tickersHandlers.delete(ticker);
}

setInterval(loadTickers, 5000);
