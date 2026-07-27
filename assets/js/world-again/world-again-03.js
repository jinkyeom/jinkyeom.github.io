/* World Again #3 — Interactive Script */

(function () {
  'use strict';

  const storyData = {
    meta: {
      euMemberCount: 27,
      schengenMemberCount: 29,
    },
    countries: [
      { code: "DE", name: "독일", pop: "약 8,347만 명", exact: "83,467,117명", eu: true, schengen: true, rank: 1 },
      { code: "GB", name: "영국", pop: "약 6,955만 명", exact: "69,554,275명", eu: false, schengen: false, rank: 2 },
      { code: "FR", name: "프랑스", pop: "약 6,911만 명", exact: "69,112,309명", eu: true, schengen: true, rank: 3 },
      { code: "IT", name: "이탈리아", pop: "약 5,894만 명", exact: "5,894,282명", eu: true, schengen: true, rank: 4 },
      { code: "ES", name: "스페인", pop: "약 4,959만 명", exact: "49,590,099명", eu: true, schengen: true, rank: 5 },
      { code: "PL", name: "폴란드", pop: "약 3,633만 명", exact: "36,332,765명", eu: true, schengen: true, rank: 6 },
      { code: "RO", name: "루마니아", pop: "약 1,904만 명", exact: "19,041,322명", eu: true, schengen: true, rank: 7 },
      { code: "NL", name: "네덜란드", pop: "약 1,813만 명", exact: "18,130,208명", eu: true, schengen: true, rank: 8 },
    ],
    details: {
      GB: {
        title: "영국",
        eu: false,
        schengen: false,
        text: "EU에는 참여하지 않습니다. 솅겐에도 참여하지 않습니다.",
      },
      NO: {
        title: "노르웨이",
        eu: false,
        schengen: true,
        text: "EU에는 참여하지 않습니다. 하지만 솅겐에는 참여합니다.",
      },
      CH: {
        title: "스위스",
        eu: false,
        schengen: true,
        text: "스위스도 EU 회원국은 아니지만 솅겐에는 참여합니다.",
      },
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    initStep1();
    initStep2();
    initStep3();
    initStep4();
    initNewWindow();
  });

  /* STEP 1 */
  function initStep1() {
    const btnEU = document.getElementById('wa03-btn-step1-eu');
    const revealText = document.getElementById('wa03-step1-reveal');
    const mapPaths = document.querySelectorAll('#wa03-step1-map-layer .wa03-country');

    if (!btnEU) return;

    btnEU.addEventListener('click', () => {
      const isExpanded = btnEU.getAttribute('aria-expanded') === 'true';
      btnEU.setAttribute('aria-expanded', !isExpanded);
      revealText.hidden = isExpanded;

      mapPaths.forEach((path) => {
        const isEU = path.getAttribute('data-eu') === 'true';
        if (!isExpanded && isEU) {
          path.classList.add('wa03-country--eu-active');
        } else {
          path.classList.remove('wa03-country--eu-active');
        }
      });
    });
  }

  /* STEP 2 */
  function initStep2() {
    const cardBtns = document.querySelectorAll('.wa03__card-btn');
    const detailPanel = document.getElementById('wa03-country-detail-panel');
    const btnSchengen = document.getElementById('wa03-btn-step2-schengen');
    const schengenStage = document.getElementById('wa03-schengen-stage');

    cardBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        cardBtns.forEach((b) => b.setAttribute('aria-expanded', 'false'));
        btn.setAttribute('aria-expanded', 'true');

        const code = btn.getAttribute('data-country');
        const info = storyData.details[code];

        if (info && detailPanel) {
          detailPanel.innerHTML = `
            <div class="wa03__detail-box">
              <h4>${info.title}</h4>
              <div class="wa03__detail-tags">
                <span class="wa03__tag ${info.eu ? 'wa03__tag--yes' : 'wa03__tag--no'}">
                  EU: ${info.eu ? '참여' : '미참여'}
                </span>
                <span class="wa03__tag ${info.schengen ? 'wa03__tag--yes' : 'wa03__tag--no'}">
                  솅겐: ${info.schengen ? '참여' : '미참여'}
                </span>
              </div>
              <p>${info.text}</p>
            </div>
          `;
        }
      });
    });

    if (btnSchengen && schengenStage) {
      btnSchengen.addEventListener('click', () => {
        const isExpanded = btnSchengen.getAttribute('aria-expanded') === 'true';
        btnSchengen.setAttribute('aria-expanded', !isExpanded);
        schengenStage.hidden = isExpanded;
      });
    }
  }

  /* STEP 3 */
  function initStep3() {
    const tabs = document.querySelectorAll('#wa03-step-3 [role="tab"]');
    const legend = document.getElementById('wa03-step3-legend');
    const statusText = document.getElementById('wa03-state-status-text');
    const proseEU = document.getElementById('wa03-prose-step3-eu');
    const proseSchengen = document.getElementById('wa03-prose-step3-schengen');
    const proseBoth = document.getElementById('wa03-prose-step3-both');
    const states = document.querySelectorAll('#wa03-step3-map-layer .wa03-country');

    if (!tabs.length) return;

    function setTab(mode) {
      tabs.forEach((t) => {
        const active = t.getAttribute('data-mode') === mode;
        t.classList.toggle('wa03__tab--active', active);
        t.setAttribute('aria-selected', active);
      });

      if (proseEU) proseEU.hidden = mode !== 'eu';
      if (proseSchengen) proseSchengen.hidden = mode !== 'schengen';
      if (proseBoth) proseBoth.hidden = mode !== 'both';

      if (mode === 'eu') {
        legend.innerHTML = `
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:#1D4ED8;"></span> EU 회원국 (27개국)</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:#9CA3AF;"></span> 비회원국</span>
        `;
        statusText.innerHTML = `<p>EU 스물일곱 나라가 하나의 색으로 강조됩니다. 영국·노르웨이·스위스는 비회원 상태입니다.</p>`;

        states.forEach((el) => {
          const isEU = el.getAttribute('data-eu') === 'true';
          el.style.fill = isEU ? 'var(--wa03-accent-eu)' : 'var(--wa03-map-country-neutral)';
        });
      } else if (mode === 'schengen') {
        legend.innerHTML = `
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:#D97706;"></span> 솅겐 참여국 (29개국)</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:#9CA3AF;"></span> 미참여국</span>
        `;
        statusText.innerHTML = `<p>노르웨이·스위스·아이슬란드·리히텐슈타인이 솅겐 지역으로 이어지고, 아일랜드와 키프로스는 솅겐 미참여 상태로 남습니다.</p>`;

        states.forEach((el) => {
          const isSchengen = el.getAttribute('data-schengen') === 'true';
          el.style.fill = isSchengen ? 'var(--wa03-accent-schengen)' : 'var(--wa03-map-country-neutral)';
        });
      } else if (mode === 'both') {
        legend.innerHTML = `
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:#059669;"></span> EU & 솅겐 모두 (25)</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:#1D4ED8;"></span> EU만 (아일랜드, 키프로스) (2)</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:#D97706;"></span> 솅겐만 (노르웨이, 스위스, IS, LI) (4)</span>
          <span class="wa03__legend-item"><span class="wa03__legend-color" style="background:#9CA3AF;"></span> 둘 다 아님 (영국 외)</span>
        `;
        statusText.innerHTML = `
          <ul>
            <li><strong>EU & 솅겐 모두 (25개국):</strong> 독일, 프랑스, 이탈리아, 스페인 등</li>
            <li><strong>EU만 참여 (2개국):</strong> 아일랜드, 키프로스</li>
            <li><strong>솅겐만 참여 (4개국):</strong> 노르웨이, 스위스, 아이슬란드, 리히텐슈타인</li>
            <li><strong>둘 다 미참여:</strong> 영국 외</li>
          </ul>
        `;

        states.forEach((el) => {
          const isEU = el.getAttribute('data-eu') === 'true';
          const isSchengen = el.getAttribute('data-schengen') === 'true';
          if (isEU && isSchengen) {
            el.style.fill = 'var(--wa03-accent-both)';
          } else if (isEU && !isSchengen) {
            el.style.fill = 'var(--wa03-accent-eu)';
          } else if (!isEU && isSchengen) {
            el.style.fill = 'var(--wa03-accent-schengen)';
          } else {
            el.style.fill = 'var(--wa03-accent-neither)';
          }
        });
      }
    }

    tabs.forEach((t) => {
      t.addEventListener('click', () => setTab(t.getAttribute('data-mode')));
    });

    setTab('eu');
  }

  /* STEP 4 */
  function initStep4() {
    const listEl = document.getElementById('wa03-sort-list');
    const btnShowOrder = document.getElementById('wa03-btn-show-order');
    const btnResetOrder = document.getElementById('wa03-btn-reset-order');
    const revealText = document.getElementById('wa03-step4-reveal');
    const liveAnnounce = document.getElementById('wa03-sort-live-announce');

    if (!listEl) return;

    // Initial shuffled state
    let currentItems = [
      storyData.countries[4], // ES
      storyData.countries[0], // DE
      storyData.countries[2], // FR
      storyData.countries[1], // GB
      storyData.countries[5], // PL
      storyData.countries[3], // IT
      storyData.countries[7], // NL
      storyData.countries[6], // RO
    ];

    let isRevealed = false;

    function renderList() {
      listEl.innerHTML = '';
      currentItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'wa03__sort-card';

        const displayPop = isRevealed ? item.pop : '';
        const rankText = isRevealed ? `${item.rank}위` : `${index + 1}`;

        card.innerHTML = `
          <div class="wa03__sort-card-info">
            <span class="wa03__sort-rank">${rankText}</span>
            <span class="wa03__sort-name">${item.name}</span>
            ${displayPop ? `<span class="wa03__sort-pop">${displayPop}</span>` : ''}
          </div>
          <div class="wa03__sort-card-actions">
            <button type="button" class="wa03__btn-move" data-dir="up" data-idx="${index}" aria-label="${item.name} 위로 이동" ${index === 0 ? 'disabled' : ''}>▲</button>
            <button type="button" class="wa03__btn-move" data-dir="down" data-idx="${index}" aria-label="${item.name} 아래로 이동" ${index === currentItems.length - 1 ? 'disabled' : ''}>▼</button>
          </div>
        `;
        listEl.appendChild(card);
      });

      attachMoveEvents();
    }

    function attachMoveEvents() {
      const moveBtns = listEl.querySelectorAll('.wa03__btn-move');
      moveBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          const dir = btn.getAttribute('data-dir');
          const targetIdx = dir === 'up' ? idx - 1 : idx + 1;

          if (targetIdx >= 0 && targetIdx < currentItems.length) {
            const temp = currentItems[idx];
            currentItems[idx] = currentItems[targetIdx];
            currentItems[targetIdx] = temp;
            renderList();

            if (liveAnnounce) {
              liveAnnounce.textContent = `${temp.name} 국가가 ${dir === 'up' ? '위' : '아래'}로 이동했습니다.`;
            }
          }
        });
      });
    }

    btnShowOrder.addEventListener('click', () => {
      isRevealed = true;
      currentItems = [...storyData.countries].sort((a, b) => a.rank - b.rank);
      renderList();
      revealText.hidden = false;

      if (liveAnnounce) {
        liveAnnounce.textContent = `실제 인구 순서로 정렬되었습니다. 1위 독일, 2위 영국, 3위 프랑스, 4위 이탈리아, 5위 스페인.`;
      }
    });

    btnResetOrder.addEventListener('click', () => {
      isRevealed = false;
      currentItems = [
        storyData.countries[4],
        storyData.countries[0],
        storyData.countries[2],
        storyData.countries[1],
        storyData.countries[5],
        storyData.countries[3],
        storyData.countries[7],
        storyData.countries[6],
      ];
      renderList();
      revealText.hidden = true;

      if (liveAnnounce) {
        liveAnnounce.textContent = `정렬 순서가 초기화되었습니다.`;
      }
    });

    renderList();
  }

  /* NEW WINDOW */
  function initNewWindow() {
    const tabs = document.querySelectorAll('#wa03-new-window [role="tab"]');
    const mapPaths = document.querySelectorAll('#wa03-nw-map-layer .wa03-country');
    const proseEU = document.getElementById('wa03-nw-prose-eu');
    const proseSchengen = document.getElementById('wa03-nw-prose-schengen');
    const prosePop = document.getElementById('wa03-nw-prose-pop');

    if (!tabs.length || !mapPaths.length) return;

    const popCodes = ['DE', 'GB', 'FR', 'IT', 'ES', 'PL', 'RO', 'NL'];

    function setNWMode(mode) {
      tabs.forEach((t) => {
        const active = t.getAttribute('data-nw-mode') === mode;
        t.classList.toggle('wa03__tab--active', active);
        t.setAttribute('aria-selected', active);
      });

      if (proseEU) proseEU.hidden = mode !== 'eu';
      if (proseSchengen) proseSchengen.hidden = mode !== 'schengen';
      if (prosePop) prosePop.hidden = mode !== 'population';

      mapPaths.forEach((path) => {
        const code = path.getAttribute('data-code');
        const isEU = path.getAttribute('data-eu') === 'true';
        const isSchengen = path.getAttribute('data-schengen') === 'true';

        if (mode === 'eu') {
          path.style.fill = isEU ? 'var(--wa03-accent-eu)' : 'var(--wa03-map-country-neutral)';
        } else if (mode === 'schengen') {
          path.style.fill = isSchengen ? 'var(--wa03-accent-schengen)' : 'var(--wa03-map-country-neutral)';
        } else if (mode === 'population') {
          if (popCodes.includes(code)) {
            path.style.fill = 'var(--wa03-accent-both)';
          } else {
            path.style.fill = 'var(--wa03-map-country-neutral)';
          }
        }
      });
    }

    tabs.forEach((t) => {
      t.addEventListener('click', () => setNWMode(t.getAttribute('data-nw-mode')));
    });

    setNWMode('eu');
  }
})();
