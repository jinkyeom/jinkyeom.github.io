(() => {
  if (window.WorldAgain01Initialized) return;
  window.WorldAgain01Initialized = true;

  const ROOT_SELECTOR = '[data-world-again="01"]';
  const DOT_COUNT = 20;
  const REST_COLOR = "var(--wa01-rest)";

  const formatNumber = (value, maximumFractionDigits = 0) =>
    Number(value).toLocaleString("ko-KR", { maximumFractionDigits });

  const stripCityType = (name) =>
    name.replace("특별자치시", "").replace("특별시", "").replace("광역시", "");

  const el = (tag, options = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(options).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "html") node.innerHTML = value;
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

  const replaceChildren = (node, children) => {
    node.textContent = "";
    children.forEach((child) => node.append(child));
  };

  const chartHead = (title, description) =>
    el("div", { className: "wa01__chart-head" }, [
      el("h3", { text: title }),
      el("p", { text: description }),
    ]);

  const unitLabel = (unitType) => ({
    metropolitan_city: "광역시·특별시",
    general_city: "도 아래의 일반시",
    province: "도 단위",
  })[unitType] || "지역";

  const mapSourceNote = (data) => {
    const snapshot = data.meta?.mapBoundaryLayers?.historicalSnapshot;
    const boundaryYear = snapshot?.boundaryYear || "2025";
    return `행정경계: SGIS GeoService ${boundaryYear} 행정경계. 면적 통계: 국토교통부 2025년 지적통계.\n두 자료는 작성 목적과 면적 산정 방식이 달라 일부 차이가 있을 수 있습니다.`;
  };

  const officialMapMissing = (message) =>
    el("div", { className: "wa01__map-missing", role: "note" }, [
      el("h3", { text: "행정경계 지도를 불러오지 못했습니다" }),
      el("p", { text: message }),
    ]);

  const officialAssetImage = ({ src, alt, className, missingMessage }) => {
    const container = el("div", { className: className + " wa01__svg-container" });
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error("SVG fetch failed");
        return res.text();
      })
      .then((svgText) => {
        container.innerHTML = svgText;
        const svg = container.querySelector("svg");
        if (svg) {
          svg.setAttribute("aria-label", alt);
          svg.setAttribute("role", "img");
          svg.style.width = "100%";
          svg.style.height = "auto";
          svg.style.display = "block";
        } else {
          throw new Error("Invalid SVG");
        }
      })
      .catch(() => {
        container.replaceWith(officialMapMissing(missingMessage));
      });
    return container;
  };

  const renderContextMap = (root, data) => {
    const target = root.querySelector('[data-chart="context-map"]');
    if (!target) return;

    const visiblePlaceIds = new Set([
      "seoul",
      "busan",
      "daegu",
      "incheon",
      "gwangju",
      "daejeon",
      "ulsan",
      "sejong",
      "suwon",
      "yongin",
      "goyang",
      "jeonju",
    ]);
    const places = (data.contextPlaces || []).filter((place) => visiblePlaceIds.has(place.id));
    const asset = data.meta?.mapAssets?.contextSvg;
    const mapNode = asset
      ? officialAssetImage({
        className: "wa01__official-map",
        src: asset,
        alt: "공식 행정경계에 기반한 대한민국 전국 맥락 지도",
        missingMessage: "GIS GeoService 공개 2025 행정경계 데이터에서 생성한 korea-context.svg 파일을 찾지 못했습니다.",
      })
      : officialMapMissing("GIS GeoService 공개 2025 행정경계 데이터에서 생성한 korea-context.svg 파일을 찾지 못했습니다.");

    replaceChildren(target, [
      el("div", { className: "wa01__context-map" }, [
        el("figure", { className: "wa01__map-figure" }, [
          mapNode,
          el("figcaption", { className: "wa01__map-source", text: mapSourceNote(data) }),
        ]),
        el("div", {}, [
          chartHead("머릿속에 있던 도시들", "아직 기준을 바꾸지 않습니다. 먼저 익숙한 이름을 지도 위에서 봅니다."),
          el("ul", { className: "wa01__legend" }, [
            el("li", {}, [
              el("i", { className: "wa01__legend-mark", style: { "--legend-color": "var(--wa01-accent)" }, "aria-hidden": "true" }),
              el("span", { text: "서울·부산·대구처럼 먼저 떠올리는 광역 도시" }),
            ]),
            el("li", {}, [
              el("i", { className: "wa01__legend-mark", style: { "--legend-color": "#8a6f2a" }, "aria-hidden": "true" }),
              el("span", { text: "수원·용인·고양·전주처럼 함께 떠올리는 일반시" }),
            ]),
          ]),
          el("ul", { className: "wa01__place-list" }, places.map((place) =>
            el("li", {}, [
              el("strong", { text: place.nameKo }),
              el("span", { text: unitLabel(place.unitType) }),
            ])
          )),
        ]),
      ]),
    ]);
  };

  const renderUnitGroups = (root, data) => {
    const target = root.querySelector('[data-chart="unit-groups"]');
    if (!target) return;

    const groups = data.comparisonGroups || {};
    const groupRows = [
      ["광역시·특별시", groups.metropolitanCities || []],
      ["기초자치단체인 일반시", (groups.generalCities || []).map((city) => city.nameKo)],
      ["도 단위", groups.provinces || []],
    ];

    replaceChildren(target, groupRows.map(([title, items]) =>
      el("article", { className: "wa01__unit-card" }, [
        el("h3", { text: title }),
        el("ul", {}, items.map((item) => el("li", { text: item }))),
      ])
    ));
  };

  const buildBarRow = ({ rank, nameKo, metric, percent, colorHex, label, emphasized = false }) =>
    el("div", { className: `wa01__bar-row${emphasized ? " wa01__bar-row--emphasis" : ""}`, role: "listitem" }, [
      el("div", { className: "wa01__bar-name" }, [
        rank ? el("span", { className: "wa01__rank", text: rank }) : document.createTextNode(""),
        el("span", { className: "wa01__city", text: nameKo }),
      ]),
      el("div", { className: "wa01__track", "aria-label": label }, [
        el("span", {
          className: "wa01__fill",
          style: { "--value": `${percent}%`, "--city-color": colorHex },
        }),
      ]),
      el("div", { className: "wa01__bar-value", text: metric }),
    ]);

  const renderPopulation = (root, data) => {
    const target = root.querySelector('[data-chart="population"]');
    if (!target) return;

    const max = Math.max(...data.actualPopulation.map((city) => city.population));
    const rows = data.actualPopulation.map((city) =>
      buildBarRow({
        rank: city.rank,
        nameKo: city.nameKo,
        metric: `${city.populationDisplay}명`,
        percent: (city.population / max) * 100,
        colorHex: city.colorHex,
        label: `${city.nameKo} 인구 ${city.populationDisplay}명`,
      })
    );

    replaceChildren(target, [
      chartHead("인구", "사람의 수로 보면, 우리가 익숙하게 떠올리던 도시의 순서와 크게 다르지 않습니다."),
      el("div", { className: "wa01__bar-list", role: "list" }, rows),
    ]);
  };

  const dotFill = (color, fill) =>
    fill >= 1 ? color : `conic-gradient(${color} ${Math.round(fill * 360)}deg, var(--wa01-neutral) 0deg)`;

  const buildPeopleDots = (value, color, label) => {
    const full = Math.floor(value);
    const fraction = value - full;
    const count = Math.min(DOT_COUNT, Math.max(1, Math.ceil(value)));
    const dots = Array.from({ length: count }, (_, index) => {
      const fill = index < full ? 1 : index === full && fraction > 0 ? fraction : 0;
      return el("span", {
        className: "wa01__dot",
        style: { "--dot-fill": dotFill(color, fill) },
        "aria-hidden": "true",
      });
    });
    return el("div", { className: "wa01__people-dots", "aria-label": label }, dots);
  };

  const renderHundred = (root, data) => {
    const target = root.querySelector('[data-chart="hundred"]');
    if (!target) return;

    const selectedTotal = data.perHundred.reduce((sum, city) => sum + city.peoplePerHundred, 0);
    const rest = Math.max(0, 100 - selectedTotal);
    const rows = [
      ...data.perHundred.map((city) => ({
        name: city.nameKo,
        value: city.peoplePerHundred,
        display: city.peoplePerHundredDisplay,
        color: city.colorHex,
      })),
      {
        name: "나머지 지역",
        value: rest,
        display: `${rest.toFixed(2)}명`,
        color: REST_COLOR,
      },
    ].map((row) =>
      el("div", { className: "wa01__people-row" }, [
        el("div", { className: "wa01__people-meta" }, [
          el("span", { className: "wa01__city", text: row.name }),
          el("span", { className: "wa01__metric", text: row.display }),
        ]),
        buildPeopleDots(row.value, row.color, `${row.name} ${row.display}`),
      ])
    );

    replaceChildren(target, [
      chartHead("대한민국 100명 중", "선택한 8개 도시끼리 다시 100명으로 만들지 않습니다."),
      el("div", { className: "wa01__people-list" }, rows),
      el("p", {
        className: "wa01__finding",
        text: "대구는 대한민국 100명 가운데 약 5명, 인구 순위로는 네 번째입니다. 그렇다면 땅의 크기로 보아도 네 번째일까요?",
      }),
    ]);
  };

  const renderArea = (root, data) => {
    const target = root.querySelector('[data-chart="area"]');
    if (!target) return;

    const area = data.area || [];
    const max = Math.max(...area.map((city) => city.area));
    const daegu = area.find((city) => city.cityId === "daegu");
    const seoul = area.find((city) => city.cityId === "seoul");
    const ratio = daegu && seoul ? daegu.area / seoul.area : null;
    const rows = area.map((city) =>
      buildBarRow({
        rank: city.areaRank,
        nameKo: city.nameKo,
        metric: city.areaDisplay,
        percent: (city.area / max) * 100,
        colorHex: city.colorHex,
        label: `${city.nameKo} 면적 ${city.areaDisplay}`,
        emphasized: city.cityId === "daegu",
      })
    );

    replaceChildren(target, [
      chartHead("행정구역 면적 순위", "0에서 시작하는 선형 막대입니다."),
      el("div", { className: "wa01__bar-list", role: "list" }, rows),
      el("p", {
        className: "wa01__finding",
        text: ratio
          ? `대구의 면적은 ${daegu.areaDisplay}입니다. 서울 면적의 약 ${ratio.toFixed(1)}배입니다.`
          : "대구는 비교한 8개 도시 가운데 가장 넓습니다.",
      }),
    ]);
  };

  const renderOutlines = (root, data) => {
    const target = root.querySelector('[data-chart="outlines"]');
    if (!target) return;

    const asset = data.meta?.mapAssets?.cityOutlinesSvg;
    const outlineNode = asset
      ? officialAssetImage({
        className: "wa01__official-outlines",
        src: asset,
        alt: "서울, 부산, 인천, 대구, 울산, 수원, 전주의 실제 행정경계를 같은 축척으로 비교한 지도",
        missingMessage: "GIS GeoService 공개 2025 행정경계 데이터에서 생성한 city-outlines.svg 파일을 찾지 못했습니다.",
      })
      : officialMapMissing("GIS GeoService 공개 2025 행정경계 데이터에서 생성한 city-outlines.svg 파일을 찾지 못했습니다.");

    replaceChildren(target, [
      chartHead("동일 축척 실제 행정경계", "도시마다 따로 확대하지 않고 같은 축척으로 놓았습니다."),
      el("figure", { className: "wa01__outline-figure" }, [
        outlineNode,
        el("figcaption", { className: "wa01__map-source", text: mapSourceNote(data) }),
      ]),
      el("p", {
        className: "wa01__finding",
        text: "대구는 비교한 광역 도시 가운데 면적이 가장 넓었습니다. 사람이 적은 도시가 아니라, 많은 사람이 넓은 공간에 퍼져 사는 도시였습니다.",
      }),
      el("p", {
        className: "wa01__supporting-note",
        text: "인천의 외곽선이 여러 조각으로 보이는 것은 강화·옹진의 섬 지역까지 포함한 실제 행정경계이기 때문입니다.",
      }),
    ]);
  };

  const buildDensityRow = (city, max) => {
    const percent = (city.populationDensity / max) * 100;
    return el("div", { className: "wa01__density-row", role: "listitem" }, [
      el("div", { className: "wa01__bar-name" }, [
        el("span", { className: "wa01__rank", text: city.rank }),
        el("span", { className: "wa01__city", text: city.nameKo }),
      ]),
      el("div", {
        className: "wa01__axis",
        "data-max": formatNumber(max),
        "aria-label": `${city.nameKo} 인구밀도 ${city.populationDensityDisplay}`,
      }, [
        el("span", {
          className: "wa01__density-dot",
          style: { "--value": `${percent}%`, "--city-color": city.colorHex },
        }),
      ]),
      el("div", { className: "wa01__bar-value", text: city.populationDensityDisplay }),
    ]);
  };

  const renderDensity = (root, data) => {
    const target = root.querySelector('[data-chart="density"]');
    if (!target) return;

    const max = Math.max(...data.populationDensity.map((city) => city.populationDensity));
    const withoutSeoul = data.populationDensity.filter((city) => city.cityId !== "seoul");
    const maxWithoutSeoul = Math.max(...withoutSeoul.map((city) => city.populationDensity));
    const rows = data.populationDensity.map((city) => buildDensityRow(city, max));
    const zoomRows = withoutSeoul.map((city) =>
      buildBarRow({
        nameKo: city.nameKo,
        metric: city.populationDensityDisplay,
        percent: (city.populationDensity / maxWithoutSeoul) * 100,
        colorHex: city.colorHex,
        label: `${city.nameKo} 인구밀도 ${city.populationDensityDisplay}`,
      })
    );

    replaceChildren(target, [
      chartHead("인구밀도", "사람의 수를 도시가 차지한 공간 위에 올려놓습니다."),
      el("div", { className: "wa01__density-list", role: "list" }, rows),
      el("div", { className: "wa01__zoom" }, [
        el("h4", { text: "서울을 제외하고 다시 보면" }),
        el("div", { className: "wa01__bar-list", role: "list" }, zoomRows),
      ]),
      el("p", {
        className: "wa01__finding",
        text: "같은 사람의 수라도 공간이 달라지면 도시는 전혀 다른 모습이 됩니다. 인구 4위였던 대구는 밀도에서는 6위로 보입니다.",
      }),
    ]);
  };

  const renderRankShift = (root, data) => {
    const target = root.querySelector('[data-chart="rank-shift"]');
    if (!target) return;

    const population = new Map(data.actualPopulation.map((city) => [city.cityId, city]));
    const area = new Map((data.area || []).map((city) => [city.cityId, city]));
    const density = new Map(data.populationDensity.map((city) => [city.cityId, city]));
    const cityIds = ["daegu", "gwangju", "daejeon"];
    const rows = cityIds.map((cityId) => {
      const pop = population.get(cityId);
      const cityArea = area.get(cityId);
      const cityDensity = density.get(cityId);
      return el("div", { className: `wa01__rank-row${cityId === "daegu" ? " wa01__rank-row--emphasis" : ""}`, role: "row" }, [
        el("span", { role: "cell" }, [
          el("i", { className: "wa01__swatch", style: { "--city-color": pop.colorHex }, "aria-hidden": "true" }),
          document.createTextNode(stripCityType(pop.nameKo)),
        ]),
        el("span", { role: "cell", text: `${pop.rank}위` }),
        el("span", { role: "cell", text: `${cityArea.areaRank}위` }),
        el("span", { role: "cell", text: `${cityDensity.rank}위` }),
      ]);
    });

    replaceChildren(target, [
      el("div", { className: "wa01__rank-table", role: "table", "aria-label": "인구, 면적, 인구밀도 기준 비교" }, [
        el("div", { className: "wa01__rank-row wa01__rank-row--head", role: "row" }, [
          el("span", { role: "columnheader", text: "도시" }),
          el("span", { role: "columnheader", text: "인구" }),
          el("span", { role: "columnheader", text: "면적" }),
          el("span", { role: "columnheader", text: "밀도" }),
        ]),
        ...rows,
      ]),
    ]);
  };

  const renderGeneralCities = (root, data) => {
    const target = root.querySelector('[data-chart="general-cities"]');
    if (!target) return;

    const candidates = data.comparisonGroups?.generalCities || [];
    replaceChildren(target, [
      chartHead("일반시 1차 조사 후보", "공식 인구·면적 기준을 맞춘 뒤 광역 도시와 별도 그룹으로 연결합니다."),
      el("ul", { className: "wa01__candidate-list" }, candidates.map((city) =>
        el("li", {}, [
          el("strong", { text: city.nameKo }),
          document.createTextNode(" — 인구·면적 공식 기준 확인 중"),
        ])
      )),
      el("p", {
        className: "wa01__finding",
        text: "경기도 인구에는 수원·고양·용인 등이 포함됩니다. 그래서 도 단위와 일반시를 하나의 순위표에 섞지 않습니다.",
      }),
    ]);
  };

  const renderSummary = (root, data) => {
    const target = root.querySelector('[data-chart="summary"]');
    if (!target) return;

    const per100 = new Map(data.perHundred.map((city) => [city.cityId, city.peoplePerHundredDisplay]));
    const area = new Map((data.area || []).map((city) => [city.cityId, city.areaDisplay]));
    const density = new Map(data.populationDensity.map((city) => [city.cityId, city.populationDensityDisplay]));
    const rows = data.actualPopulation.map((city) =>
      el("tr", {}, [
        el("td", { text: city.nameKo }),
        el("td", { text: `${city.populationDisplay}명` }),
        el("td", { text: per100.get(city.cityId) }),
        el("td", { text: area.get(city.cityId) }),
        el("td", { text: density.get(city.cityId) }),
      ])
    );

    replaceChildren(target, [
      el("h2", { text: "시각화 데이터 요약" }),
      el("table", {}, [
        el("thead", {}, [
          el("tr", {}, [
            el("th", { text: "도시" }),
            el("th", { text: "인구" }),
            el("th", { text: "100명 환산" }),
            el("th", { text: "면적" }),
            el("th", { text: "인구밀도" }),
          ]),
        ]),
        el("tbody", {}, rows),
      ]),
    ]);
  };

  const bindChoices = (root, data) => {
    const note = root.querySelector("[data-choice-note]");
    const buttons = root.querySelectorAll("[data-city-choice], [data-place-choice]");
    const byId = new Map(data.actualPopulation.map((city) => [city.cityId, city]));
    const places = new Map((data.contextPlaces || []).map((place) => [place.id, place]));

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((item) => item.setAttribute("aria-pressed", "false"));
        button.setAttribute("aria-pressed", "true");
        const city = byId.get(button.dataset.cityChoice || button.dataset.placeChoice);
        const place = places.get(button.dataset.placeChoice);
        if (note && city) {
          note.textContent = `${stripCityType(city.nameKo)}을 떠올렸습니다. 이제 인구와 면적이 같은 이야기를 하는지 따라가 보겠습니다.`;
        } else if (note && place) {
          note.textContent = `${place.nameKo}을 떠올렸습니다. 이 이름은 ${unitLabel(place.unitType)} 단위입니다.`;
        }
      });
    });
  };

  const render = (root, data) => {
    bindChoices(root, data);
    renderContextMap(root, data);
    renderUnitGroups(root, data);
    renderPopulation(root, data);
    renderHundred(root, data);
    renderArea(root, data);
    renderOutlines(root, data);
    renderDensity(root, data);
    renderRankShift(root, data);
    renderGeneralCities(root, data);
    renderSummary(root, data);
  };

  const showError = (root) => {
    root.querySelectorAll("[data-chart]").forEach((target) => {
      if (target.dataset.chart === "summary" || target.dataset.chart === "rank-shift") return;
      replaceChildren(target, [
        el("p", {
          className: "wa01__error",
          text: "World Again 시각화 데이터를 불러오지 못했습니다. 본문은 그대로 읽을 수 있습니다.",
        }),
      ]);
    });
  };

  const initRoot = async (root) => {
    if (root.dataset.initialized === "true") return;
    root.dataset.initialized = "true";
    const source = root.dataset.source;
    if (!source) {
      showError(root);
      return;
    }
    try {
      const response = await fetch(source, { credentials: "same-origin" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      render(root, data);
    } catch (error) {
      console.error("[World Again #1] data load failed", error);
      showError(root);
    }
  };

  const init = () => document.querySelectorAll(ROOT_SELECTOR).forEach(initRoot);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
