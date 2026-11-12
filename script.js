/* =========================================
   RIZZ.MONEY - JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       1. ANIMATED CANDLESTICK CHART
    ===================================== */

    const container = document.getElementById("candleContainer");

    if (container) {

        const maxCandles = 50;
        const minPrice = 40;
        const maxPrice = 200;

        let currentPrice = 120;
        let momentum = 0;
        let trend = 1;
        let trendDuration = 0;
        let chartInterval = null;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        function random(min, max) {
            return Math.random() * (max - min) + min;
        }

        function priceToPixel(price) {
            const height = container.clientHeight;

            return (
                ((price - minPrice) / (maxPrice - minPrice)) * height
            );
        }

        function generateCandle() {

            trendDuration++;

            // Mengubah arah tren secara berkala
            if (trendDuration > Math.floor(random(10, 24))) {
                trend *= -1;
                trendDuration = 0;
            }

            // Menghasilkan pergerakan harga hipotetis
            const noise = random(-2.8, 2.8);

            momentum = momentum * 0.55 + trend * 1.7 + noise;

            const open = currentPrice;

            let close = open + momentum;

            close = Math.max(
                minPrice + 5,
                Math.min(maxPrice - 5, close)
            );

            const high = Math.min(
                maxPrice,
                Math.max(open, close) + random(1, 7)
            );

            const low = Math.max(
                minPrice,
                Math.min(open, close) - random(1, 7)
            );

            currentPrice = close;

            return {
                open,
                close,
                high,
                low
            };
        }

        function createCandle(leftPosition, spacing) {

            const data = generateCandle();

            const { open, close, high, low } = data;

            const candle = document.createElement("div");

            candle.className = "candle";

            candle.classList.add(
                close >= open ? "green" : "red"
            );

            const wick = document.createElement("div");
            wick.className = "candle-wick";

            const body = document.createElement("div");
            body.className = "candle-body";

            const lowPixel = priceToPixel(low);
            const highPixel = priceToPixel(high);

            const openPixel = priceToPixel(open);
            const closePixel = priceToPixel(close);

            const bodyBottom =
                Math.min(openPixel, closePixel) - lowPixel;

            const bodyHeight = Math.max(
                3,
                Math.abs(closePixel - openPixel)
            );

            candle.style.left = `${leftPosition}px`;
            candle.style.bottom = `${lowPixel}px`;
            candle.style.height = `${Math.max(3, highPixel - lowPixel)}px`;

            candle.style.width = `${Math.max(3, spacing * 0.55)}px`;

            wick.style.height = "100%";

            body.style.bottom = `${bodyBottom}px`;
            body.style.height = `${bodyHeight}px`;

            candle.appendChild(wick);
            candle.appendChild(body);

            container.appendChild(candle);
        }

        function initializeChart() {

            container.innerHTML = "";

            const width = container.clientWidth;

            if (width <= 0 || container.clientHeight <= 0) {
                return;
            }

            const spacing = width / maxCandles;

            currentPrice = 120;
            momentum = 0;
            trend = 1;
            trendDuration = 0;

            for (let i = 0; i < maxCandles; i++) {
                createCandle(i * spacing, spacing);
            }
        }

        function updateChart() {

            const width = container.clientWidth;

            if (width <= 0) return;

            const spacing = width / maxCandles;

            // Geser candle ke kiri
            const candles = container.querySelectorAll(".candle");

            candles.forEach(candle => {

                const currentLeft = parseFloat(candle.style.left);

                candle.style.left =
                    `${currentLeft - spacing}px`;

            });

            // Hapus candle yang keluar dari layar
            candles.forEach(candle => {

                const position = parseFloat(candle.style.left);

                if (position < -spacing) {
                    candle.remove();
                }

            });

            // Buat candle baru dari kanan
            createCandle(width - spacing, spacing);
        }

        function startChart() {

            clearInterval(chartInterval);

            initializeChart();

            // Hormati pengaturan pengurangan animasi pengguna
            if (!reducedMotion) {
                chartInterval = setInterval(updateChart, 450);
            }
        }

        startChart();

        // Perbarui chart saat ukuran layar berubah
        let resizeTimeout;

        window.addEventListener("resize", () => {

            clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
                startChart();
            }, 150);

        });

    }


    /* =====================================
       2. FINANCIAL CALCULATOR 50/30/20
    ===================================== */

    const incomeInput = document.getElementById("income");

    const needsValue = document.getElementById("needs-val");
    const wantsValue = document.getElementById("wants-val");
    const savingsValue = document.getElementById("savings-val");

    const needsBar = document.getElementById("needs-bar");
    const wantsBar = document.getElementById("wants-bar");
    const savingsBar = document.getElementById("savings-bar");

    function formatRupiah(amount) {

        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);

    }

    function hitungAnggaran() {

        if (!incomeInput) return;

        const income = Math.max(
            0,
            Number(incomeInput.value) || 0
        );

        // Pembagian anggaran
        const needs = income * 0.50;
        const wants = income * 0.30;
        const savings = income * 0.20;

        // Tampilkan hasil
        needsValue.textContent = formatRupiah(needs);
        wantsValue.textContent = formatRupiah(wants);
        savingsValue.textContent = formatRupiah(savings);

        // Perbarui progress bar
        needsBar.style.width = income > 0 ? "50%" : "0%";
        wantsBar.style.width = income > 0 ? "30%" : "0%";
        savingsBar.style.width = income > 0 ? "20%" : "0%";

    }

    // Hitung otomatis ketika pengguna mengetik
    if (incomeInput) {

        incomeInput.addEventListener(
            "input",
            hitungAnggaran
        );

        hitungAnggaran();

    }

});
