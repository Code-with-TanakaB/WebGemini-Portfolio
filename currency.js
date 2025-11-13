// currency.js - simple USD -> ZAR conversion helper for dashboards
(function (global) {
    const DEFAULT_RATE = 18.0; // fallback if fetch fails (editable)
    let cachedRate = null;

    async function fetchRate() {
        if (cachedRate) return cachedRate;

        try {
            const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=ZAR');
            if (!res.ok) throw new Error('Rate fetch failed');
            const data = await res.json();
            if (data && data.rates && data.rates.ZAR) {
                cachedRate = parseFloat(data.rates.ZAR);
                return cachedRate;
            }
        } catch (e) {
            // ignore - we'll use fallback
            console.warn('Could not fetch exchange rate, using fallback rate', e);
        }

        cachedRate = DEFAULT_RATE;
        return cachedRate;
    }

    async function getRate() {
        return await fetchRate();
    }

    async function convert(amountUsd) {
        const rate = await fetchRate();
        const n = Number(amountUsd) || 0;
        return n * rate;
    }

    // Sync conversion that uses cached rate if available, otherwise falls back to DEFAULT_RATE
    function convertSync(amountUsd) {
        const rate = cachedRate || DEFAULT_RATE;
        const n = Number(amountUsd) || 0;
        return n * rate;
    }

    function formatZar(amount) {
        const n = Number(amount) || 0;
        try {
            return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);
        } catch (e) {
            return `R${n.toFixed(2)}`;
        }
    }

    global.currencyConverter = {
        getRate,
        convert,
        convertSync,
        formatZar
    };
})(window);
