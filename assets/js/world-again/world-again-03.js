/* World Again #3 — Interactive Script */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  function initAll() {
    initStep1();
    initStep3();
    initStep4();
    initNewWindow();
  }

  /* STEP 1 */
  function initStep1() {
    const btnEU = document.getElementById('wa03-btn-step1-eu');
    const revealText = document.getElementById('wa03-step1-reveal');
    const mapContainer = document.getElementById('wa03-map-step1');

    if (!btnEU || !mapContainer) return;

    mapContainer.classList.add('wa03-map--step1');

    btnEU.addEventListener('click', () => {
      const isExpanded = btnEU.getAttribute('aria-expanded') === 'true';
      const nextState = !isExpanded;

      btnEU.setAttribute('aria-expanded', String(nextState));
      btnEU.classList.toggle('wa03__btn--active', nextState);
      if (revealText) revealText.hidden = !nextState;

      mapContainer.classList.toggle('is-eu-active', nextState);
    });
  }

  /* STEP 3 */
  function initStep3() {
    const tabs = document.querySelectorAll('#wa03-sec-3 [role="tab"]');
    const legend = document.getElementById('wa03-step3-legend');
    const statusText = document.getElementById('wa03-state-status-text');
    const proseEU = document.getElementById('wa03-prose-step3-eu');
    const proseSchengen = document.getElementById('wa03-prose-step3-schengen');
    const proseBoth = document.getElementById('wa03-prose-step3-both');
    const mapContainer = document.querySelector('#wa03-tabpanel-step3 .wa03__map-container');

    if (!tabs.length || !mapContainer) return;

    function setTab(mode) {
      tabs.forEach((t) => {
        const active = t.getAttribute('data-mode') === mode;
        t.classList.toggle('wa03__tab--active', active);
        t.setAttribute('aria-selected', String(active));
      });

      if (proseEU) proseEU.hidden = mode !== 'eu';
      if (proseSchengen) proseSchengen.hidden = mode !== 'schengen';
      if (proseBoth) proseBoth.hidden = mode !== 'both';

      mapContainer.classList.remove('wa03-map--mode-eu', 'wa03-map--mode-schengen', 'wa03-map--mode-both');
      mapContainer.classList.add(`wa03-map--mode-${mode}`);

      if (mode === 'eu') {
        legend.innerHTML = `
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-accent-eu);"></span> EU 회원국 (27개국)</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-map-country-muted);"></span> 비회원국</span>
        `;
      } else if (mode === 'schengen') {
        legend.innerHTML = `
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-accent-schengen);"></span> 솅겐 참여국 (29개국)</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-map-country-muted);"></span> 미참여국</span>
        `;
      } else if (mode === 'both') {
        legend.innerHTML = `
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-accent-both);"></span> EU와 솅겐 모두: 25개국</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-accent-eu);"></span> EU만 참여: 아일랜드, 키프로스</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-accent-schengen);"></span> 솅겐만 참여: 노르웨이, 스위스, 아이슬란드, 리히텐슈타인</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-accent-neither);"></span> 둘 다 참여하지 않음: 영국 등</span>
        `;
      }
      if (statusText) statusText.innerHTML = '';
    }

    tabs.forEach((t) => {
      t.addEventListener('click', () => setTab(t.getAttribute('data-mode')));
    });

    setTab('eu');
  }

  /* STEP 4 */
  function initStep4() {
    const btnShowOrder = document.getElementById('wa03-btn-show-order');
    const resultPanel = document.getElementById('wa03-pop-result-panel');

    if (!btnShowOrder || !resultPanel) return;

    btnShowOrder.addEventListener('click', () => {
      const isExpanded = btnShowOrder.getAttribute('aria-expanded') === 'true';
      const nextState = !isExpanded;
      btnShowOrder.setAttribute('aria-expanded', String(nextState));
      resultPanel.hidden = !nextState;
    });
  }

  /* NEW WINDOW (Section 5) */
  function initNewWindow() {
    const tabs = document.querySelectorAll('#wa03-sec-5 [role="tab"]');
    const popCirclesLayer = document.getElementById('wa03-pop-circles-layer');
    const popLegend = document.getElementById('wa03-pop-legend');
    const popInfoCard = document.getElementById('wa03-pop-info-card');
    const oneLiner = document.getElementById('wa03-nw-one-liner');
    const mapContainer = document.querySelector('#wa03-nw-stage .wa03__map-container');
    const circles = document.querySelectorAll('.wa03-pop-circle');

    if (!tabs.length || !mapContainer) return;

    function resetPopSelection() {
      circles.forEach((c) => c.classList.remove('is-active'));
      if (popInfoCard) {
        popInfoCard.innerHTML = `
          <div class="wa03__pop-info-prompt">
            지도 위의 원을 선택하면<br>나라별 인구를 볼 수 있습니다.
          </div>
        `;
      }
    }

    function setNWMode(mode) {
      tabs.forEach((t) => {
        const active = t.getAttribute('data-nw-mode') === mode;
        t.classList.toggle('wa03__tab--active', active);
        t.setAttribute('aria-selected', String(active));
      });

      mapContainer.classList.remove('wa03-map--mode-eu', 'wa03-map--mode-schengen', 'wa03-map--mode-population');
      mapContainer.classList.add(`wa03-map--mode-${mode}`);

      if (mode === 'eu') {
        if (oneLiner) {
          oneLiner.innerHTML = `
            <div class="wa03__nw-description-card">
              <strong>EU 회원국</strong>
              <p>정치와 경제를 함께 운영하는 27개국을 표시합니다.</p>
            </div>`;
        }
        if (popCirclesLayer) popCirclesLayer.hidden = true;
        if (popLegend) popLegend.hidden = true;
        if (popInfoCard) popInfoCard.hidden = true;
      } else if (mode === 'schengen') {
        if (oneLiner) {
          oneLiner.innerHTML = `
            <div class="wa03__nw-description-card">
              <strong>솅겐 참여국</strong>
              <p>평상시 내부 국경 검사 없이 이어지는 29개국을 표시합니다.</p>
            </div>`;
        }
        if (popCirclesLayer) popCirclesLayer.hidden = true;
        if (popLegend) popLegend.hidden = true;
        if (popInfoCard) popInfoCard.hidden = true;
      } else if (mode === 'population') {
        if (oneLiner) {
          oneLiner.innerHTML = `
            <div class="wa03__nw-description-card">
              <strong>나라별 인구</strong>
              <p>각 나라의 인구를 원의 크기로 표시합니다. 원이 클수록 더 많은 사람이 살고 있습니다.</p>
            </div>`;
        }
        if (popCirclesLayer) popCirclesLayer.hidden = false;
        if (popLegend) popLegend.hidden = false;
        if (popInfoCard) popInfoCard.hidden = false;
        resetPopSelection();
      }
    }

    const updateInfoCard = (circle) => {
      if (!circle || !popInfoCard) return;
      circles.forEach((c) => c.classList.remove('is-active'));
      circle.classList.add('is-active');

      const name = circle.getAttribute('data-name') || '';
      const pop = circle.getAttribute('data-pop') || '';
      const date = circle.getAttribute('data-date') || '2026년 1월 1일';

      popInfoCard.innerHTML = `
        <div class="wa03__pop-info-name">${name}</div>
        <div class="wa03__pop-info-value">${pop}</div>
        <div class="wa03__pop-info-date">${date}</div>
      `;
    };

    circles.forEach((c) => {
      c.addEventListener('click', () => updateInfoCard(c));
      c.addEventListener('mouseenter', () => updateInfoCard(c));
    });

    tabs.forEach((t) => {
      t.addEventListener('click', () => setNWMode(t.getAttribute('data-nw-mode')));
    });

    setNWMode('eu');
  }
})();
