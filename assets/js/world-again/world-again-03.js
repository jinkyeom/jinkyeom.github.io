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
        statusText.innerHTML = `<p>EU 스물일곱 나라가 하나의 색으로 강조됩니다. 영국·노르웨이·스위스는 비회원 상태입니다.</p>`;
      } else if (mode === 'schengen') {
        legend.innerHTML = `
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-accent-schengen);"></span> 솅겐 참여국 (29개국)</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-map-country-muted);"></span> 미참여국</span>
        `;
        statusText.innerHTML = `<p>노르웨이·스위스·아이슬란드·리히텐슈타인이 솅겐 지역으로 이어지고, 아일랜드와 키프로스는 솅겐 미참여 상태로 남습니다.</p>`;
      } else if (mode === 'both') {
        legend.innerHTML = `
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-accent-both);"></span> EU & 솅겐 모두 (25)</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-accent-eu);"></span> EU만 (아일랜드, 키프로스) (2)</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-accent-schengen);"></span> 솅겐만 (노르웨이, 스위스, IS, LI) (4)</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:var(--wa03-accent-neither);"></span> 둘 다 아님 (영국 외)</span>
        `;
        statusText.innerHTML = `
          <ul>
            <li><strong>EU & 솅겐 모두 (25개국):</strong> 독일, 프랑스, 이탈리아, 스페인 등</li>
            <li><strong>EU만 참여 (2개국):</strong> 아일랜드, 키프로스</li>
            <li><strong>솅겐만 참여 (4개국):</strong> 노르웨이, 스위스, 아이슬란드, 리히텐슈타인</li>
            <li><strong>둘 다 미참여:</strong> 영국 외</li>
          </ul>
        `;
      }
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
    const oneLiner = document.getElementById('wa03-nw-one-liner');
    const proseEU = document.getElementById('wa03-nw-prose-eu');
    const proseSchengen = document.getElementById('wa03-nw-prose-schengen');
    const prosePop = document.getElementById('wa03-nw-prose-pop');
    const mapContainer = document.querySelector('#wa03-nw-stage .wa03__map-container');

    if (!tabs.length || !mapContainer) return;

    function setNWMode(mode) {
      tabs.forEach((t) => {
        const active = t.getAttribute('data-nw-mode') === mode;
        t.classList.toggle('wa03__tab--active', active);
        t.setAttribute('aria-selected', String(active));
      });

      if (proseEU) proseEU.hidden = mode !== 'eu';
      if (proseSchengen) proseSchengen.hidden = mode !== 'schengen';
      if (prosePop) prosePop.hidden = mode !== 'population';

      mapContainer.classList.remove('wa03-map--mode-eu', 'wa03-map--mode-schengen', 'wa03-map--mode-population');
      mapContainer.classList.add(`wa03-map--mode-${mode}`);

      if (mode === 'eu') {
        if (oneLiner) oneLiner.textContent = 'EU 회원국: 정치와 경제를 함께 운영하는 27개국';
        if (popCirclesLayer) popCirclesLayer.hidden = true;
      } else if (mode === 'schengen') {
        if (oneLiner) oneLiner.textContent = '솅겐 참여국: 평상시 내부 국경 검사 없이 이어지는 29개국';
        if (popCirclesLayer) popCirclesLayer.hidden = true;
      } else if (mode === 'population') {
        if (oneLiner) oneLiner.textContent = '나라별 인구: 각 나라에 사는 사람의 수를 원의 크기와 고유 색상으로 표시합니다.';
        if (popCirclesLayer) popCirclesLayer.hidden = false;
      }
    }

    tabs.forEach((t) => {
      t.addEventListener('click', () => setNWMode(t.getAttribute('data-nw-mode')));
    });

    setNWMode('eu');
  }
})();
