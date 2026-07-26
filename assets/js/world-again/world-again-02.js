(() => {
  if (window.WorldAgain02Initialized) return;
  window.WorldAgain02Initialized = true;

  const ROOT_SELECTOR = '[data-world-again="02"]';
  const COUNTRY_ORDER = ["IE", "DE", "FR", "FI", "NL", "MT"];

  const el = (tag, options = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(options).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "style") {
        Object.entries(value).forEach(([styleKey, styleValue]) => {
          if (styleKey.startsWith("--")) node.style.setProperty(styleKey, styleValue);
          else node.style[styleKey] = styleValue;
        });
      } else {
        node.setAttribute(key, String(value));
      }
    });
    children.forEach((child) => node.append(child));
    return node;
  };

  const replaceChildren = (target, children) => {
    target.textContent = "";
    children.forEach((child) => target.append(child));
  };

  const formatNumber = (value, digits = 0) =>
    Number(value).toLocaleString("ko-KR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

  const fetchText = async (url) => {
    const response = await fetch(url, { credentials: "same-origin" });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    return response.text();
  };

  const inlineSvg = async (url, className) => {
    const wrapper = el("div", { className });
    wrapper.innerHTML = await fetchText(url);
    const svg = wrapper.querySelector("svg");
    if (!svg) throw new Error(`Invalid SVG: ${url}`);
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    return wrapper;
  };

  const provisionalBadge = () =>
    el("span", {
      className: "wa02__status-badge",
      text: "잠정치",
      title: "Eurostat provisional status",
    });

  const chartHead = (title, note, axisMax) =>
    el("div", { className: "wa02__chart-head" }, [
      el("div", {}, [el("h3", { text: title }), el("p", { text: note })]),
      axisMax
        ? el("p", {
            className: "wa02__axis-contract",
            text: `선형축 · 0–${axisMax}`,
          })
        : document.createTextNode(""),
    ]);

  const metricRow = ({
    country,
    value,
    axisMax,
    visibleValue,
    exactValue,
    status = null,
    unitLabel,
  }) => {
    const percent = (value / axisMax) * 100;
    const tooltip = `${country.nameKo} · ${exactValue}${status ? " · Eurostat 잠정치" : ""}`;
    return el(
      "div",
      {
        className: "wa02__metric-row",
        role: "listitem",
        tabindex: "0",
        "data-tooltip": tooltip,
        "aria-label": `${country.nameKo} ${unitLabel} ${exactValue}${status ? ", 잠정치" : ""}`,
        style: {
          "--country-color": country.color.primary,
          "--country-soft": country.color.light,
        },
      },
      [
        el("div", { className: "wa02__metric-meta" }, [
          el("span", { className: "wa02__country-code", text: country.countryCode }),
          el("strong", { text: country.nameKo }),
          status ? provisionalBadge() : document.createTextNode(""),
        ]),
        el("div", { className: "wa02__metric-value" }, [
          el("span", { text: visibleValue }),
          el("small", { text: "정확값은 포커스·마우스로 확인" }),
        ]),
        el("div", { className: "wa02__bar-track", "aria-hidden": "true" }, [
          el("span", {
            className: "wa02__bar-fill",
            style: { "--bar-value": `${percent}%` },
          }),
        ]),
      ],
    );
  };

  const renderPopulation = (root, data) => {
    const target = root.querySelector('[data-chart="population"]');
    const view = data.views.population;
    if (!target || !view) return;
    const rows = view.rows.map((country) =>
      metricRow({
        country,
        value: country.population,
        axisMax: view.axisMax,
        visibleValue: country.populationBody,
        exactValue: country.populationExact,
        status: country.populationStatus,
        unitLabel: "인구",
      }),
    );
    replaceChildren(target, [
      chartHead(view.title, "막대 길이는 정확한 인구 비율입니다.", `${formatNumber(view.axisMax)}명`),
      el("div", { className: "wa02__metric-list", role: "list" }, rows),
    ]);
  };

  const outlineSvg = (country, symbolId, label) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 800 800");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", label);
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = label;
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#${symbolId}`);
    svg.append(title, use);
    svg.style.color = country.color.primary;
    return svg;
  };

  const renderOutlines = (root, data) => {
    const target = root.querySelector('[data-chart="outlines"]');
    if (!target) return;
    const rows = data.views.area.rows;
    const makeOutlineCard = (country, emphasis = "supporting") =>
      el(
        "figure",
        {
          className: `wa02__outline-card wa02__outline-card--${emphasis} wa02__outline-card--${country.countryCode.toLowerCase()}`,
          style: {
            "--country-color": country.color.primary,
            "--country-soft": country.color.light,
          },
        },
        [
          el("div", { className: "wa02__outline-canvas" }, [
            outlineSvg(
              country,
              `wa02-outline-${country.countryCode}`,
              `${country.nameKo} 유럽 범위 외곽선. 여섯 나라 모두 같은 축척입니다.`,
            ),
          ]),
          el("figcaption", {}, [
            el("div", { className: "wa02__outline-name" }, [
              el("span", { className: "wa02__country-code", text: country.countryCode }),
              el("strong", { text: country.nameKo }),
            ]),
            emphasis === "primary"
              ? el("dl", { className: "wa02__outline-facts" }, [
                  el("div", {}, [
                    el("dt", { text: "인구" }),
                    el("dd", { text: formatNumber(country.population) }),
                  ]),
                  el("div", {}, [
                    el("dt", { text: "면적" }),
                    el("dd", { text: `${formatNumber(country.landAreaKm2)}㎢` }),
                  ]),
                ])
              : el("div", { className: "wa02__outline-area" }, [
                  el("span", { text: country.landAreaBody }),
                  el("small", { text: country.landAreaExact }),
                ]),
          ]),
        ],
      );
    const primaryOrder = ["FI", "IE"];
    const supportingOrder = ["FR", "DE", "NL", "MT"];
    const byCode = new Map(rows.map((country) => [country.countryCode, country]));
    const primaryCards = primaryOrder.map((code) =>
      makeOutlineCard(byCode.get(code), "primary"),
    );
    const supportingCards = supportingOrder.map((code) =>
      makeOutlineCard(byCode.get(code), "supporting"),
    );
    const malta = rows.find((country) => country.countryCode === "MT");
    const maltaZoom = el("aside", { className: "wa02__malta-zoom" }, [
      el("div", { className: "wa02__malta-zoom-copy" }, [
        el("strong", { text: "몰타 외곽선 · 8× 확대" }),
        el("p", { text: "섬의 형태를 읽기 위한 보조창입니다. 기본 비교의 몰타는 1×를 유지합니다." }),
      ]),
      el("div", { className: "wa02__malta-zoom-canvas" }, [
        outlineSvg(malta, "wa02-outline-MT-zoom", "몰타 외곽선 8배 확대 보조 보기"),
      ]),
    ]);

    replaceChildren(target, [
      el("div", { className: "wa02__outline-contract" }, [
        el("span", { text: "EPSG:3035" }),
        el("span", { text: "모든 기본 패널 1×" }),
        el("span", { text: "국가별 fit-to-box 없음" }),
      ]),
      el(
        "div",
        {
          className: "wa02__outline-primary",
          "aria-label": "핀란드와 아일랜드 주 비교",
        },
        primaryCards,
      ),
      el("p", { className: "wa02__outline-relation" }, [
        el("span", { text: "인구는 비슷하지만" }),
        el("strong", { text: "핀란드의 땅은 약 4.4배 넓습니다." }),
      ]),
      el(
        "div",
        {
          className: "wa02__outline-supporting",
          "aria-label": "프랑스, 독일, 네덜란드, 몰타 보조 비교",
        },
        supportingCards,
      ),
      maltaZoom,
      el("p", {
        className: "wa02__chart-note",
        text: "면적 숫자는 Eurostat reg_area3입니다. Natural Earth 도형 면적을 통계로 사용하지 않았습니다.",
      }),
    ]);
  };

  const renderDensity = (root, data) => {
    const target = root.querySelector('[data-chart="density"]');
    const view = data.views.density;
    if (!target || !view) return;
    const mainRows = view.rows.map((country) =>
      metricRow({
        country,
        value: country.density,
        axisMax: view.axisMax,
        visibleValue: country.densityExact,
        exactValue: `${country.densityFullPrecision}명/km²`,
        status: country.densityOfficial2024Status,
        unitLabel: "계산 인구밀도",
      }),
    );
    const zoomRows = view.zoom.rows.map((country) =>
      metricRow({
        country,
        value: country.density,
        axisMax: view.zoom.axisMax,
        visibleValue: country.densityExact,
        exactValue: `${country.densityFullPrecision}명/km²`,
        status: country.densityOfficial2024Status,
        unitLabel: "계산 인구밀도",
      }),
    );
    replaceChildren(target, [
      chartHead(
        view.title,
        "1㎢당 인구 · 몰타를 포함한 실제 비율입니다. 로그축과 축 절단을 사용하지 않았습니다.",
        `${formatNumber(view.axisMax, 1)}명/km²`,
      ),
      el("div", { className: "wa02__metric-list", role: "list" }, mainRows),
      el("section", { className: "wa02__density-zoom", "aria-label": view.zoom.title }, [
        el("div", { className: "wa02__density-zoom-head" }, [
          el("div", {}, [
            el("p", { className: "wa02__zoom-label", text: "보조 확대창" }),
            el("h4", { text: view.zoom.title }),
          ]),
          el("strong", { text: view.zoom.disclosure }),
        ]),
        el("p", {
          text: "기본축과 별개의 확대 보기입니다. 값과 순서는 바꾸지 않았습니다.",
        }),
        el("div", { className: "wa02__metric-list", role: "list" }, zoomRows),
      ]),
      el("p", {
        className: "wa02__chart-note",
        text: "Eurostat 공식 2024 밀도는 연평균 인구 기준입니다. 프랑스 공식값도 잠정치입니다.",
      }),
    ]);
  };

  const installOutlineSymbols = async (root, url) => {
    const holder = el("div", { className: "wa02__svg-defs", "aria-hidden": "true" });
    holder.innerHTML = await fetchText(url);
    root.prepend(holder);
  };

  const renderContextMap = async (root, url, chartName, extraClass = "") => {
    const target = root.querySelector(`[data-chart="${chartName}"]`);
    if (!target) return null;
    const map = await inlineSvg(url, `wa02__context-svg ${extraClass}`.trim());
    replaceChildren(target, [
      el("figure", {}, [
        map,
        el("figcaption", {}, [
          el("span", { text: "Natural Earth Admin 0 · v5.1.1 · 1:10m" }),
          el("span", { text: "EPSG:3035" }),
        ]),
      ]),
    ]);
    return map.querySelector("svg");
  };

  const revealComparisonCountries = (root) => {
    const trigger = root.querySelector("[data-reveal-comparison]");
    const mapCard = root.querySelector(".wa02__map-card--context");
    if (!trigger || !mapCard) return;
    const reveal = () => mapCard.classList.add("wa02-map--reveal-comparison");
    if (!("IntersectionObserver" in window)) {
      reveal();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(trigger);
  };

  const hexToRgb = (hex) => {
    const value = hex.replace("#", "");
    return [
      Number.parseInt(value.slice(0, 2), 16),
      Number.parseInt(value.slice(2, 4), 16),
      Number.parseInt(value.slice(4, 6), 16),
    ];
  };

  const mixHex = (from, to, ratio) => {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    const channels = a.map((value, index) =>
      Math.round(value + (b[index] - value) * Math.max(0, Math.min(1, ratio))),
    );
    return `rgb(${channels.join(", ")})`;
  };

  const bindWindow = (root, data, svg) => {
    if (!svg) return;
    const buttons = [...root.querySelectorAll("[data-window-mode]")];
    const status = root.querySelector("[data-window-status]");
    const legendWrap = root.querySelector("[data-density-legend]");
    const byCode = new Map(data.countries.map((country) => [country.countryCode, country]));
    svg.classList.add("wa02-map--window", "wa02-map--reveal-comparison");

    // 6-rank density scale mapping by country code
    const DENSITY_RANKS = {
      FI: { rank: 1, lightFill: "#D1EAE0", lightStroke: "#4D8070", darkFill: "#1D3B31", darkStroke: "#3E6E5E" },
      IE: { rank: 2, lightFill: "#9FD8C4", lightStroke: "#356F5F", darkFill: "#285344", darkStroke: "#52917D" },
      FR: { rank: 3, lightFill: "#69C1A5", lightStroke: "#225849", darkFill: "#356F5C", darkStroke: "#69B39B" },
      DE: { rank: 4, lightFill: "#36A483", lightStroke: "#154437", darkFill: "#448D75", darkStroke: "#86D5BC" },
      NL: { rank: 5, lightFill: "#1B7F62", lightStroke: "#0E3328", darkFill: "#5BB396", darkStroke: "#A9EBD4" },
      MT: { rank: 6, lightFill: "#08533F", lightStroke: "#04291F", darkFill: "#7DE2BF", darkStroke: "#C4F6E5" },
    };

    // Point-on-surface anchors (ax, ay) & displaced non-overlapping circle centers (cx, cy)
    // Rendered in Z-order: largest circles first (below), smallest circles last (on top)
    const POP_CIRCLES = [
      { code: "DE", ax: 330, ay: 315, cx: 365, cy: 230, r: 28, label: "독일 8,344만", lx: 365, ly: 195 },
      { code: "FR", ax: 215, ay: 410, cx: 145, cy: 470, r: 25.3, label: "프랑스 6,845만", lx: 145, ly: 508 },
      { code: "NL", ax: 280, ay: 268, cx: 235, cy: 210, r: 13, label: "네덜란드 1,798만", lx: 235, ly: 188 },
      { code: "FI", ax: 440, ay: 115, cx: 485, cy: 90, r: 7.3, label: "핀란드 563만", lx: 485, ly: 110 },
      { code: "IE", ax: 115, ay: 270, cx: 55, cy: 230, r: 7.2, label: "아일랜드 544만", lx: 55, ly: 250 },
      { code: "MT", ax: 478, ay: 642, cx: 520, cy: 642, r: 4.5, label: "몰타 57만", lx: 520, ly: 660 },
    ];

    const isDarkMode = () => document.documentElement.getAttribute("data-theme") === "dark";

    // Malta overlay helper (Density Mode)
    let maltaOverlayGroup = svg.querySelector(".wa02-map__malta-overlay-group");
    if (!maltaOverlayGroup) {
      maltaOverlayGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      maltaOverlayGroup.setAttribute("class", "wa02-map__malta-overlay-group");
      maltaOverlayGroup.setAttribute("aria-hidden", "true");
      maltaOverlayGroup.style.display = "none";
      maltaOverlayGroup.innerHTML = `
        <circle cx="478" cy="642" r="14" class="wa02-map__malta-halo" />
        <circle cx="478" cy="642" r="3.5" fill="currentColor" />
        <line x1="478" y1="642" x2="455" y2="670" class="wa02-map__malta-line" />
        <text x="450" y="684" text-anchor="end" font-size="11" font-weight="800" fill="currentColor" class="wa02-map__malta-label">몰타 1,835명/㎢</text>
      `;
      svg.appendChild(maltaOverlayGroup);
    }

    // Population Circles overlay helper (Population Mode)
    let popOverlayGroup = svg.querySelector(".wa02-map__pop-overlay-group");
    if (!popOverlayGroup) {
      popOverlayGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      popOverlayGroup.setAttribute("class", "wa02-map__pop-overlay-group");
      popOverlayGroup.setAttribute("aria-hidden", "true");
      popOverlayGroup.style.display = "none";
      popOverlayGroup.innerHTML = POP_CIRCLES.map((item) => `
        <g class="wa02-map__pop-item" data-pop-code="${item.code}">
          <line x1="${item.ax}" y1="${item.ay}" x2="${item.cx}" y2="${item.cy}" class="wa02-map__leader-line" />
          <circle cx="${item.ax}" cy="${item.ay}" r="2.5" class="wa02-map__anchor-dot" />
          <circle cx="${item.cx}" cy="${item.cy}" r="${item.r}" class="wa02-map__pop-circle" />
          <text x="${item.lx}" y="${item.ly}" text-anchor="middle" class="wa02-map__pop-label">${item.label}</text>
        </g>
      `).join("");
      svg.appendChild(popOverlayGroup);
    }

    const applyMode = (mode) => {
      const dark = isDarkMode();
      buttons.forEach((button) =>
        button.setAttribute("aria-pressed", String(button.dataset.windowMode === mode)),
      );

      COUNTRY_ORDER.forEach((code) => {
        const country = byCode.get(code);
        const pathNode = svg.querySelector(`[data-country="${code}"]`);
        if (!country || !pathNode) return;

        let fill = country.color.primary;
        let stroke = country.color.primary;
        let opacity = 0.55;

        if (mode === "population") {
          opacity = 0.35;
        } else if (mode === "density") {
          const config = DENSITY_RANKS[code];
          fill = dark ? config.darkFill : config.lightFill;
          stroke = dark ? config.darkStroke : config.lightStroke;
          opacity = 1;
        }

        pathNode.style.setProperty("fill", fill, "important");
        pathNode.style.setProperty("fill-opacity", String(opacity), "important");
        pathNode.style.setProperty("stroke", stroke, "important");
      });

      // Overlay visibility logic
      if (popOverlayGroup) {
        popOverlayGroup.style.display = mode === "population" ? "block" : "none";
      }
      if (maltaOverlayGroup) {
        maltaOverlayGroup.style.display = mode === "density" ? "block" : "none";
      }
      if (legendWrap) {
        legendWrap.style.display = mode === "density" ? "block" : "none";
        legendWrap.setAttribute("aria-hidden", String(mode !== "density"));
      }

      const messages = {
        map: "기본 지도입니다. 여섯 나라는 고유색과 같은 비중의 라벨로 표시됩니다.",
        population: "원의 크기는 인구를 나타냅니다. 정확한 값은 앞의 인구 비교에서 확인할 수 있습니다.",
        density: "밀도 창입니다. 여섯 나라 안에서의 인구밀도 순서대로 6단계 색이 적용됩니다.",
      };
      if (status) status.textContent = messages[mode];
    };

    buttons.forEach((button) =>
      button.addEventListener("click", () => applyMode(button.dataset.windowMode)),
    );
    applyMode("map");
  };

  const renderSummary = (root, data) => {
    const target = root.querySelector('[data-chart="summary"]');
    if (!target) return;
    const header = ["국가", "인구", "면적", "인구밀도", "Eurostat 공식 2024 인구밀도"];
    const rows = data.countries.map((country) =>
      el("tr", {}, [
        el("th", { scope: "row", text: `${country.nameKo} (${country.countryCode})` }),
        el("td", {
          text: `${country.populationExact}${country.populationStatus ? " · 잠정치" : ""}`,
        }),
        el("td", { text: country.landAreaExact }),
        el("td", { text: country.densityExact }),
        el("td", {
          text: `${country.densityOfficial2024Display}${
            country.densityOfficial2024Status ? " · 잠정치" : ""
          }`,
        }),
      ]),
    );
    replaceChildren(target, [
      el("div", { className: "wa02__table-scroll", tabindex: "0" }, [
        el("table", {}, [
          el("caption", { text: "World Again #2 여섯 나라의 인구·면적·인구밀도 정확값" }),
          el("thead", {}, [el("tr", {}, header.map((name) => el("th", { scope: "col", text: name })))]),
          el("tbody", {}, rows),
        ]),
      ]),
    ]);
  };

  const showError = (root, message) => {
    root.querySelectorAll("[data-chart]").forEach((target) => {
      if (target.dataset.chart === "summary") return;
      replaceChildren(target, [el("p", { className: "wa02__error", text: message })]);
    });
  };

  const render = async (root, data) => {
    const contextUrl = root.dataset.contextMap;
    const outlinesUrl = root.dataset.outlinesMap;
    if (!contextUrl || !outlinesUrl) throw new Error("Map asset URL is missing");
    await installOutlineSymbols(root, outlinesUrl);
    renderPopulation(root, data);
    renderOutlines(root, data);
    renderDensity(root, data);
    renderSummary(root, data);
    const [contextSvg, windowSvg] = await Promise.all([
      renderContextMap(root, contextUrl, "context-map"),
      renderContextMap(root, contextUrl, "window-map", "wa02__context-svg--window"),
    ]);
    if (contextSvg) contextSvg.classList.add("wa02-map--step1");
    revealComparisonCountries(root);
    bindWindow(root, data, windowSvg);
  };

  const initRoot = async (root) => {
    if (root.dataset.initialized === "true") return;
    root.dataset.initialized = "true";
    const source = root.dataset.source;
    if (!source) {
      showError(root, "World Again #2 데이터 경로가 없습니다.");
      return;
    }
    try {
      const response = await fetch(source, { credentials: "same-origin" });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${source}`);
      const data = await response.json();
      await render(root, data);
      root.dataset.ready = "true";
    } catch (error) {
      console.error("[World Again #2] render failed", error);
      showError(root, "World Again #2 시각화 자산을 불러오지 못했습니다. 본문은 그대로 읽을 수 있습니다.");
    }
  };

  const init = () => document.querySelectorAll(ROOT_SELECTOR).forEach(initRoot);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
