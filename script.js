const STORAGE_KEY = "xaviers_stock_watchlist_v1";

const defaultStocks = [
  { symbol: "TSE:7203", market: "INTL", name: "Toyota Motor Corp (Tokyo)" },
  { symbol: "LSE:HSBA", market: "INTL", name: "HSBC Holdings plc (London)" },
  { symbol: "XETR:SAP", market: "INTL", name: "SAP SE (Frankfurt)" },
  { symbol: "HKEX:700", market: "INTL", name: "Tencent Holdings (Hong Kong)" },
  { symbol: "PSE:SM", market: "PSE", name: "SM Investments Corp" },
  { symbol: "PSE:BDO", market: "PSE", name: "BDO Unibank, Inc." },
  { symbol: "NASDAQ:NVDA", market: "US", name: "NVIDIA Corporation" }
];

let watchlist = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultStocks;
let activeFilter = "ALL";

function saveWatchlist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
}

function loadTVChart(tvSymbol) {
  document.getElementById("activeChartLabel").textContent = tvSymbol;
  const container = document.getElementById("tvChartContainer");
  container.innerHTML = "";

  const script = document.createElement("script");
  script.src = "https://tradingview.com";
  script.async = true;
  script.innerHTML = JSON.stringify({
    symbol: tvSymbol,
    width: "100%",
    height: "260",
    locale: "en",
    dateRange: "12M",
    colorTheme: "dark",
    isTransparent: true,
    autosize: true
  });
  container.appendChild(script);
}

function getScreenerLinks(item) {
  const parts = item.symbol.split(":");
  const rawTicker = parts.length > 1 ? parts[1] : parts[0];
  const tvSymbol = item.symbol.includes(":")
    ? item.symbol
    : item.market === "PSE"
      ? `PSE:${rawTicker}`
      : rawTicker;

  const links = [
    {
      label: "TradingView",
      url: `https://tradingview.com{encodeURIComponent(tvSymbol.replace(":", "-"))}/`
    }
  ];

  if (item.market === "PSE") {
    links.push({
      label: "MarketShack PSE",
      url: "https://marketshack.com"
    });
    links.push({
      label: "Investing.com PH",
      url: `https://investing.com{encodeURIComponent(rawTicker)}`
    });
  } else if (item.market === "US") {
    links.push({
      label: "Finviz",
      url: `https://finviz.com{encodeURIComponent(rawTicker)}`
    });
    links.push({
      label: "Stock Analysis",
      url: `https://stockanalysis.com{encodeURIComponent(rawTicker.toLowerCase())}/`
    });
  } else {
    links.push({
      label: "Stock Analysis",
      url: `https://stockanalysis.com{encodeURIComponent(rawTicker)}`
    });
    links.push({
      label: "Investing.com PH",
      url: `https://investing.com{encodeURIComponent(rawTicker)}`
    });
  }

  return { tvSymbol, links };
}

function renderTable() {
  const tbody = document.getElementById("watchlistBody");
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  tbody.innerHTML = "";

  const filtered = watchlist.filter((item) => {
    const matchesMarket = activeFilter === "ALL" || item.market === activeFilter;
    const matchesQuery =
      item.symbol.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query);
    return matchesMarket && matchesQuery;
  });

  filtered.forEach((item) => {
    const realIndex = watchlist.indexOf(item);
    const { tvSymbol, links } = getScreenerLinks(item);

    const tr = document.createElement("tr");

    const tdSymbol = document.createElement("td");
    tdSymbol.innerHTML = `<strong>${item.symbol}</strong>`;

    const tdMarket = document.createElement("td");
    tdMarket.innerHTML = `<span class="market-tag">${item.market}</span>`;

    const tdName = document.createElement("td");
    tdName.textContent = item.name || "—";

    const tdLinks = document.createElement("td");
    const pillWrap = document.createElement("div");
    pillWrap.className = "link-pills";

    const chartBtn = document.createElement("button");
    chartBtn.type = "button";
    chartBtn.className = "pill";
    chartBtn.textContent = "Chart";
    chartBtn.addEventListener("click", () => loadTVChart(tvSymbol));
    pillWrap.appendChild(chartBtn);

    links.forEach((link) => {
      const a = document.createElement("a");
      a.className = "pill";
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = `${link.label} ↗`;
      pillWrap.appendChild(a);
    });

    tdLinks.appendChild(pillWrap);

    const tdAction = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "del-btn";
    delBtn.textContent = "Remove";
    delBtn.addEventListener("click", () => {
      watchlist.splice(realIndex, 1);
      saveWatchlist();
      renderTable();
    });
    tdAction.appendChild(delBtn);

    tr.append(tdSymbol, tdMarket, tdName, tdLinks, tdAction);
    tbody.appendChild(tr);
  });
}

function addStock() {
  const market = document.getElementById("marketInput").value;
  const symEl = document.getElementById("symbolInput");
  const nameEl = document.getElementById("nameInput");
  const symbol = symEl.value.trim().toUpperCase();
  const name = nameEl.value.trim();

  if (!symbol) return;

  watchlist.unshift({ symbol, market, name: name || symbol });
  saveWatchlist();
  symEl.value = "";
  nameEl.value = "";
  renderTable();
}

document.getElementById("addStockBtn").addEventListener("click", addStock);

document.getElementById("symbolInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addStock();
});

document.getElementById("nameInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addStock();
});

document.getElementById("searchInput").addEventListener("input", renderTable);

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    activeFilter = btn.dataset.market;
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderTable();
  });
});

renderTable();
loadTVChart("TSE:7203");
