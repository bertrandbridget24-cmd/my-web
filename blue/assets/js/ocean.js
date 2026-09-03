/* =========================================================
   ocean.js — 海洋特效產生器
   Catherine 個人網站 — 海洋藍主題套件

   用法：在 HTML 裡加一個 data-ocean 屬性就好，內容由這支程式產生。

     <div data-ocean="bubbles" data-count="9"></div>      上升的氣泡
     <div data-ocean="fish"    data-count="8"></div>      悠游的小魚
     <div data-ocean="seabed"  data-weeds="10" data-crab="1"></div>   海草＋螃蟹
     <a  data-ocean="btn-bubbles" data-count="5">…</a>    按鈕 hover 冒泡泡
     <a  data-ocean="card-fx" data-bubbles="6" data-pearls="9">…</a>  卡片 hover 泡泡＋珍珠串
     <div data-ocean="jellyfish" data-count="6"></div>    背景漂浮水母（內頁背景層）
     <div data-ocean="nightsky" data-moon="孫" data-stars="欣,黑糖"
          data-games="欣:starship,黑糖:maze">…</div>          夜空月亮＋星星
                                                          （滑到會顯示對應的字）

   需搭配 assets/css/effects.css。
   共用參數：data-seed 可換一組隨機排列（同一個 seed 每次結果都一樣）。
   ========================================================= */

(function () {
    'use strict';

    /* ---------- 可重現的亂數（同一個 seed 每次結果相同，方便微調） ---------- */
    function makeRandom(seed) {
        var s = seed >>> 0;
        return function () {
            s |= 0; s = (s + 0x6D2B79F5) | 0;
            var t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function num(el, name, fallback) {
        var v = parseFloat(el.getAttribute(name));
        return isNaN(v) ? fallback : v;
    }

    var reduceMotion = window.matchMedia &&
                       window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* 色盤：只用 tokens.css 裡已經有的顏色 */
    var SKY = ['#A8DCF0', '#CDEBF7', '#E4F5FC', '#7FCBE8'];
    var WEED = ['#17708A', '#0E7C9B', '#4FB3D9', '#A8DCF0'];

    /* ---------- 素材 ---------- */

    // 小魚（魚頭朝左；往右游時由 CSS 的 .to-right 翻面）
    function fishSVG() {
        return '<svg viewBox="0 0 64 36">' +
            '<path class="tail" d="M44 18 L63 6 L63 30 Z" fill="currentColor" opacity=".85"/>' +
            '<ellipse cx="26" cy="18" rx="21" ry="12.5" fill="currentColor"/>' +
            '<path d="M20 6.5 Q27 -1.5 34 7 Z" fill="currentColor" opacity=".75"/>' +
            '<path d="M22 27.5 Q28 35.5 34 28 Z" fill="currentColor" opacity=".65"/>' +
            '<circle cx="13" cy="15" r="3.4" fill="#fff"/>' +
            '<circle cx="11.8" cy="15" r="1.7" fill="#0A2A3D"/>' +
            '</svg>';
    }

    // 海草：兩種葉形交替使用
    var WEED_PATHS = [
        'M20,160 C12,124 9,86 14,46 C16,28 18,12 20,0 C24,14 27,30 29,50 C33,90 28,126 20,160 Z',
        'M18,160 C22,120 8,92 16,58 C21,38 14,20 20,0 C29,20 22,40 27,60 C34,90 24,124 22,160 Z'
    ];

    function weedSVG(i) {
        return '<svg viewBox="0 0 40 160" preserveAspectRatio="none">' +
               '<path fill="currentColor" d="' + WEED_PATHS[i % WEED_PATHS.length] + '"/></svg>';
    }

    // 螃蟹
    function crabSVG() {
        return '<svg viewBox="0 0 100 72">' +
            '<g stroke="var(--crab-dark)" stroke-width="3.4" stroke-linecap="round" fill="none">' +
              '<path d="M34 50 q-9 5 -13 13"/><path d="M40 55 q-7 7 -8 15"/><path d="M47 57 q-3 8 -2 14"/>' +
              '<path d="M66 50 q9 5 13 13"/><path d="M60 55 q7 7 8 15"/><path d="M53 57 q3 8 2 14"/>' +
            '</g>' +
            '<g class="claw-wave" fill="var(--crab)">' +
              '<rect x="22" y="36" width="14" height="6" rx="3"/>' +
              '<path d="M8 30 Q22 26 26 36 Q16 38 8 35 Z"/><path d="M8 44 Q22 46 26 38 Q16 37 8 39 Z"/>' +
            '</g>' +
            '<g fill="var(--crab)">' +
              '<rect x="64" y="36" width="14" height="6" rx="3"/>' +
              '<path d="M92 30 Q78 26 74 36 Q84 38 92 35 Z"/><path d="M92 44 Q78 46 74 38 Q84 37 92 39 Z"/>' +
            '</g>' +
            '<ellipse cx="50" cy="42" rx="24" ry="17" fill="var(--crab)"/>' +
            '<ellipse cx="42" cy="35" rx="8" ry="4.5" fill="#fff" opacity=".30"/>' +
            '<rect x="41.5" y="18" width="3.4" height="12" rx="1.7" fill="var(--crab)"/>' +
            '<rect x="55.1" y="18" width="3.4" height="12" rx="1.7" fill="var(--crab)"/>' +
            '<circle cx="43.2" cy="16" r="5.6" fill="#fff"/><circle cx="56.8" cy="16" r="5.6" fill="#fff"/>' +
            '<circle cx="44.4" cy="16.4" r="2.7" fill="#0A2A3D"/><circle cx="58" cy="16.4" r="2.7" fill="#0A2A3D"/>' +
            '<path d="M44 47 Q50 52.5 56 47" stroke="#0A2A3D" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
            '</svg>';
    }

    /* ---------- 各種特效的建構函式 ---------- */

    // 上升的氣泡（大範圍背景用）
    function buildBubbles(el, rnd) {
        var n = num(el, 'data-count', 9), html = '', i;
        el.classList.add('bubbles');
        el.setAttribute('aria-hidden', 'true');
        for (i = 0; i < n; i++) {
            var size = 6 + Math.round(rnd() * 16);
            var dur = 12 + rnd() * 12;
            html += '<span style="left:' + (2 + (96 / n) * i + rnd() * 4).toFixed(1) + '%;' +
                    'width:' + size + 'px;height:' + size + 'px;' +
                    'animation-duration:' + dur.toFixed(1) + 's;' +
                    // 負的 delay ＝ 一開始就播到一半，畫面才不會全部擠在起點
                    'animation-delay:' + (-rnd() * dur).toFixed(1) + 's;"></span>';
        }
        el.innerHTML = html;
    }

    // 悠游的小魚
    function buildFish(el, rnd) {
        var n = num(el, 'data-count', 8), i;
        el.classList.add('school');
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = '';
        for (i = 0; i < n; i++) {
            var d = document.createElement('div');
            var toRight = rnd() > 0.42;
            var size = 22 + Math.round(rnd() * 54);
            d.className = 'fish ' + (toRight ? 'to-right' : 'to-left');
            d.style.top = (12 + (72 / n) * i + rnd() * 5).toFixed(1) + '%';
            d.style.setProperty('--size', size + 'px');
            var dur = 14 + rnd() * 22;
            d.style.setProperty('--dur', dur.toFixed(1) + 's');
            // 負的 delay ＝ 一開始就散在畫面各處，不會全部擠在左邊等出場
            d.style.setProperty('--delay', (-rnd() * dur).toFixed(1) + 's');
            d.style.setProperty('--bob', (2.2 + rnd() * 2.4).toFixed(1) + 's');
            d.style.color = SKY[i % SKY.length];
            // 越小越淡＝越遠
            d.style.opacity = (0.32 + (size / 76) * 0.26).toFixed(2);
            d.innerHTML = '<div class="flip"><div class="bob">' + fishSVG() + '</div></div>';
            // 關閉動畫時，讓小魚靜靜散佈在畫面上而不是停在畫面外
            if (reduceMotion) d.style.transform = 'translateX(' + (8 + (84 / n) * i).toFixed(0) + 'vw)';
            el.appendChild(d);
        }
    }

    // 海床：海草 + 螃蟹
    function buildSeabed(el, rnd) {
        var n = num(el, 'data-weeds', 10);
        var wantCrab = el.getAttribute('data-crab') !== '0';
        var html = '', i;
        el.classList.add('seabed');
        el.setAttribute('aria-hidden', 'true');
        for (i = 0; i < n; i++) {
            var h = 54 + Math.round(rnd() * 76);
            html += '<div class="weed" style="left:' + (2 + (94 / n) * i + rnd() * 5).toFixed(1) + '%;' +
                    'width:' + Math.round(h * (0.30 + rnd() * 0.14)) + 'px;height:' + h + 'px;' +
                    '--sw:' + (3.5 + rnd() * 3.2).toFixed(1) + 's;' +
                    '--swd:' + (rnd() * 2.8).toFixed(1) + 's;' +
                    'color:' + WEED[i % WEED.length] + ';' +
                    'opacity:' + (0.46 + rnd() * 0.26).toFixed(2) + ';">' + weedSVG(i) + '</div>';
        }
        if (wantCrab) {
            html += '<div class="crab"' +
                    (reduceMotion ? ' style="transform:translateX(24vw)"' : '') +
                    '><div class="crab-bob">' + crabSVG() + '</div></div>';
        }
        el.innerHTML = html;
    }

    // 按鈕 hover 冒泡泡
    function buildBtnBubbles(el, rnd) {
        var n = num(el, 'data-count', 5), html = '', i;
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
        for (i = 0; i < n; i++) {
            var size = 6 + Math.round(rnd() * 11);
            html += '<i style="left:' + (10 + (78 / n) * i).toFixed(0) + '%;' +
                    'width:' + size + 'px;height:' + size + 'px;' +
                    '--bd:' + (1.5 + rnd() * 1.1).toFixed(1) + 's;' +
                    '--bdl:' + (rnd()).toFixed(2) + 's;' +
                    '--bx:' + (rnd() > 0.5 ? '' : '-') + (5 + Math.round(rnd() * 9)) + 'px;"></i>';
        }
        var span = document.createElement('span');
        span.className = 'btn-bubbles';
        span.setAttribute('aria-hidden', 'true');
        span.innerHTML = html;
        el.appendChild(span);
    }

    // 卡片 hover：底部冒泡泡 + 上緣長珍珠串
    function buildCardFx(el, rnd) {
        var nb = num(el, 'data-bubbles', 6);
        var np = num(el, 'data-pearls', 9);
        var i, html = '';

        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

        for (i = 0; i < nb; i++) {
            var size = 6 + Math.round(rnd() * 9);
            html += '<i style="left:' + (10 + (80 / nb) * i).toFixed(0) + '%;' +
                    'width:' + size + 'px;height:' + size + 'px;' +
                    '--bd:' + (1.8 + rnd() * 1.6).toFixed(1) + 's;' +
                    '--bdl:' + (rnd()).toFixed(2) + 's;' +
                    '--bx:' + (rnd() > 0.5 ? '' : '-') + (6 + Math.round(rnd() * 11)) + 'px;"></i>';
        }
        var bub = document.createElement('span');
        bub.className = 'hover-bubbles';
        bub.setAttribute('aria-hidden', 'true');
        bub.innerHTML = html;
        el.appendChild(bub);

        html = '';
        for (i = 0; i < np; i++) {
            // 由左而右依序長出
            html += '<i style="transition-delay:' + (i * 0.04).toFixed(2) + 's"></i>';
        }
        var pearls = document.createElement('span');
        pearls.className = 'pearls';
        pearls.setAttribute('aria-hidden', 'true');
        pearls.innerHTML = html;
        el.appendChild(pearls);
    }


    /* ---------- 夜空：月亮與星星 ---------- */

    // 月亮（弦月＋外圈光暈）
    function moonSVG(uid) {
        return '<svg viewBox="0 0 72 72">' +
            '<defs>' +
              '<radialGradient id="mg' + uid + '">' +
                '<stop offset="52%" stop-color="#FFF4D0" stop-opacity=".34"/>' +
                '<stop offset="100%" stop-color="#FFF4D0" stop-opacity="0"/>' +
              '</radialGradient>' +
              '<mask id="mm' + uid + '">' +
                '<rect width="72" height="72" fill="#000"/>' +
                '<circle cx="36" cy="36" r="22" fill="#fff"/>' +
                '<circle cx="49" cy="28" r="19" fill="#000"/>' +
              '</mask>' +
            '</defs>' +
            '<circle cx="36" cy="36" r="34" fill="url(#mg' + uid + ')"/>' +
            '<circle cx="36" cy="36" r="22" fill="#FFF3CE" mask="url(#mm' + uid + ')"/>' +
            '</svg>';
    }

    // 四芒星
    function starSVG() {
        return '<svg viewBox="0 0 40 40">' +
            '<path fill="#FFF6DA" d="M20 0 C21.5 13.5 26.5 18.5 40 20 ' +
            'C26.5 21.5 21.5 26.5 20 40 C18.5 26.5 13.5 21.5 0 20 ' +
            'C13.5 18.5 18.5 13.5 20 0 Z"/></svg>';
    }

    // 星星的固定位置（避開中間的文字欄，也避開下方海床）
    var STAR_SPOTS = [
        { top: 24, left: 10, size: 16, tw: 3.0, twd: 0.0 },
        { top: 36, left: 20, size: 12, tw: 2.4, twd: 0.8 },
        { top: 27, left: 58, size: 14, tw: 3.6, twd: 1.6 },   /* 別放太高，會落在淺色的海浪上看不見 */
        { top: 42, left: 89, size: 13, tw: 2.8, twd: 0.4 },
        { top: 56, left:  6, size: 15, tw: 3.3, twd: 2.2 },
        { top: 24, left: 73, size: 11, tw: 2.6, twd: 1.1 },
        { top: 60, left: 84, size: 12, tw: 3.1, twd: 1.8 },
        { top: 50, left: 46, size: 13, tw: 2.9, twd: 2.5 }
    ];

    /* ★ top 不要小於 23：上面那道淺色的浪固定 76px 高（最深處約 51px），
       擺太高的東西會被浪蓋住（浪的 z-index 比天空層高）。 */
    var MOON_SPOT = { top: 23, left: 80, size: 62 };

    function skyObj(cls, spot, label, inner, games, extraStyle) {
        // 太靠上緣的話，提示文字改成往下顯示，避免被區塊裁掉
        var below = spot.top < 22 ? ' tip-below' : '';
        // 太靠左右邊的星星，提示改成貼齊自己的邊，名字長才不會被區塊裁掉
        var side = spot.left < 14 ? ' tip-left' : (spot.left > 80 ? ' tip-right' : '');
        // 這顆星星有沒有被指定遊戲（starship / fishing / maze）
        var game = games && games[label];
        return '<div class="sky-obj ' + cls + below + side + (game ? ' has-game' : '') + '" ' +
               'data-label="' + label + '" title="' + label + (game ? '（點我玩）' : '') + '" ' +
               (game ? 'data-game="' + game + '" role="button" tabindex="0" ' : '') +
               'style="top:' + spot.top + '%;left:' + spot.left + '%;width:' + spot.size + 'px;' +
               (extraStyle || '') + '">' +
               '<span class="sky-twinkle" style="--tw:' + (spot.tw || 6) + 's;--twd:' + (spot.twd || 0) + 's;">' +
               inner + '</span></div>';
    }

    /*
      夜空：滑鼠移到月亮或星星上會顯示一個字
        <div data-ocean="nightsky" data-moon="孫" data-stars="欣,黑糖,奶糖,宜,邱"></div>
      星星數量＝data-stars 逗號分隔的字數，最多 7 顆（位置是排好的，不重疊文字）。
    */
    function buildNightSky(el) {
        var moonLabel = el.getAttribute('data-moon') || '';

        /* 哪顆星星配哪個遊戲。兩種寫法都吃：
             data-games="欣:starship,雨:maze,哥哥:fishing"   ← 多個遊戲
             data-game-star="欣"                            ← 舊寫法，等同 欣:starship  */
        var games = {};
        (el.getAttribute('data-games') || '').split(',').forEach(function (pair) {
            var kv = pair.split(':');
            if (kv.length === 2 && kv[0].trim() && kv[1].trim()) games[kv[0].trim()] = kv[1].trim();
        });
        var legacy = el.getAttribute('data-game-star');
        if (legacy && !games[legacy]) games[legacy] = 'starship';
        var starLabels = (el.getAttribute('data-stars') || '')
                            .split(',').map(function (t) { return t.trim(); })
                            .filter(function (t) { return t; });
        var uid = Math.floor(Math.random() * 1e6);
        var html = '';

        if (moonLabel) html += skyObj('is-moon', MOON_SPOT, moonLabel, moonSVG(uid), games);

        starLabels.forEach(function (label, i) {
            if (i >= STAR_SPOTS.length) {
                console.warn('[ocean.js] 星星最多 ' + STAR_SPOTS.length + ' 顆，「' + label + '」沒有位置可放');
                return;
            }
            html += skyObj('is-star', STAR_SPOTS[i], label, starSVG(), games);
        });

        el.classList.add('nightsky');
        el.innerHTML = html;
    }


    /* ---------- 早晨天空：太陽與雲朵 ---------- */

    /* 雲朵的位置。飄動幅度用 --drift（左右各飄多少 px）和 --dd（起始時間差）控制 */
    /* 位置刻意避開中間的標題和按鈕（大約 left 24~76 / top 18~68 那一塊），
       所以雲都排在左右兩側和按鈕下方，文字才不會被壓到。 */
    var CLOUD_SPOTS = [
        { top: 23, left:  5, size: 84, drift: 16, dur: 17, dd: 0.0 },
        { top: 34, left: 82, size: 62, drift: 11, dur: 21, dd: 2.4 },
        { top: 50, left:  3, size: 64, drift: 13, dur: 19, dd: 1.2 },
        { top: 24, left: 44, size: 52, drift: 12, dur: 23, dd: 3.6 },
        { top: 60, left: 78, size: 76, drift: 14, dur: 18, dd: 0.8 },
        { top: 74, left:  8, size: 58, drift: 10, dur: 25, dd: 4.2 },
        { top: 24, left: 27, size: 46, drift: 10, dur: 20, dd: 1.9 },
        { top: 66, left: 88, size: 48, drift:  9, dur: 22, dd: 3.1 }
    ];

    /* ★ top 不要小於 23：上面那道淺色的浪固定 76px 高（最深處約 51px），
       擺太高的東西會被浪蓋住（浪的 z-index 比天空層高）。 */
    var SUN_SPOT = { top: 23, left: 80, size: 72 };

    function sunSVG(uid) {
        var rays = '', i, a;
        for (i = 0; i < 12; i++) {
            a = i * 30;
            rays += '<line x1="36" y1="5.5" x2="36" y2="12" transform="rotate(' + a + ' 36 36)"/>';
        }
        return '<svg viewBox="0 0 72 72">' +
            '<defs><radialGradient id="sg' + uid + '">' +
              '<stop offset="46%" stop-color="#FFC66B" stop-opacity=".42"/>' +
              '<stop offset="100%" stop-color="#FFC66B" stop-opacity="0"/>' +
            '</radialGradient></defs>' +
            '<circle cx="36" cy="36" r="35" fill="url(#sg' + uid + ')"/>' +
            '<g class="sun-rays" stroke="#FFCF7A" stroke-width="3.4" stroke-linecap="round">' + rays + '</g>' +
            '<circle cx="36" cy="36" r="17" fill="#FFD98A"/>' +
            '<circle cx="30" cy="30" r="6.5" fill="#FFF1C8" opacity=".7"/>' +
            '</svg>';
    }

    /* 三個圓疊成的雲，底部拉平 */
    function cloudSVG() {
        return '<svg viewBox="0 0 120 62">' +
            '<g fill="#FFFFFF">' +
              '<circle cx="40" cy="34" r="22"/>' +
              '<circle cx="68" cy="28" r="26"/>' +
              '<circle cx="92" cy="38" r="18"/>' +
              '<circle cx="24" cy="42" r="15"/>' +
              '<rect x="24" y="40" width="80" height="16" rx="8"/>' +
            '</g>' +
            '<ellipse cx="60" cy="52" rx="40" ry="6" fill="#CFE6F2" opacity=".5"/>' +
            '</svg>';
    }

    /*
      早晨天空：滑鼠移到太陽或雲朵上會顯示一個字，做法跟 nightsky 一樣
        <div data-ocean="daysky" data-sun="早安" data-clouds="A,B,C"></div>
      雲朵數量＝data-clouds 逗號分隔的字數，最多 8 朵（位置排好的，不重疊）。
      也吃 data-games（跟夜空一樣，可以在某朵雲上掛小遊戲）。
    */
    function buildDaySky(el) {
        var sunLabel = el.getAttribute('data-sun') || '';

        var games = {};
        (el.getAttribute('data-games') || '').split(',').forEach(function (pair) {
            var kv = pair.split(':');
            if (kv.length === 2 && kv[0].trim() && kv[1].trim()) games[kv[0].trim()] = kv[1].trim();
        });

        var cloudLabels = (el.getAttribute('data-clouds') || '')
                            .split(',').map(function (t) { return t.trim(); })
                            .filter(function (t) { return t; });
        var uid = Math.floor(Math.random() * 1e6);
        var html = '';

        if (sunLabel) html += skyObj('is-sun', SUN_SPOT, sunLabel, sunSVG(uid), games);

        cloudLabels.forEach(function (label, i) {
            if (i >= CLOUD_SPOTS.length) {
                console.warn('[ocean.js] 雲朵最多 ' + CLOUD_SPOTS.length + ' 朵，「' + label + '」沒有位置可放');
                return;
            }
            var spot = CLOUD_SPOTS[i];
            /* 多帶一個 c1~c8 的編號 class，手機版才有辦法用 CSS 單獨搬位置 */
            html += skyObj('is-cloud c' + (i + 1), spot, label, cloudSVG(), games,
                           '--drift:' + spot.drift + 'px;--cdur:' + spot.dur + 's;--cdd:-' + spot.dd + 's;');
        });

        el.classList.add('daysky');
        el.innerHTML = html;
    }


    /* ---------- 黃昏天空：夕陽、晚霞雲、飛鳥 ---------- */

    /* 純裝飾，沒有滑過去顯示字的功能，所以不用 skyObj，也不吃滑鼠事件 */

    /* 太陽要壓在漸層的暖色帶上（也就是海平面附近），才像在落海，
       所以 top 給得很低，一部分會沉到海床那一層去 —— .dusksky 因此不能設 overflow:hidden */
    var DUSK_SUN = { top: 84, left: 76, size: 96 };

    /* 位置一樣避開中間的標題、內文和按鈕 */
    var DUSK_CLOUDS = [
        { top: 23, left:  3, size: 92, tone: 0, drift: 16, dur: 23, dd: 0.0 },
        { top: 30, left: 84, size: 58, tone: 1, drift: 12, dur: 19, dd: 2.6 },
        { top: 46, left:  2, size: 66, tone: 1, drift: 14, dur: 26, dd: 1.3 },
        { top: 66, left: 85, size: 60, tone: 2, drift: 12, dur: 21, dd: 3.8 },
        { top: 23, left: 44, size: 50, tone: 0, drift: 10, dur: 24, dd: 0.7 },
        { top: 76, left:  8, size: 68, tone: 2, drift: 15, dur: 20, dd: 4.4 }
    ];

    /* 晚霞把雲染成三種深淺，靠近太陽的偏暖 */
    var DUSK_TONES = [
        { top: '#FFD9B0', bottom: '#E3A279' },
        { top: '#FFC79A', bottom: '#D18A73' },
        { top: '#E8BFB2', bottom: '#B37C82' }
    ];

    /* 飛鳥：兩道弧線的剪影。位置都在上半部，離文字遠一點 */
    /* 鳥要放在天空比較亮的中段，放太上面會跟深藍的夜色糊在一起看不見。
       位置一樣避開中間的文字，飛行距離 fly 也刻意壓小，飛到底也不會撞到字。 */
    var DUSK_BIRDS = [
        { top: 42, left:  7, size: 28, fly: 48, dur: 26, dd: 0.0, flap: 1.6 },
        { top: 84, left: 20, size: 20, fly: 38, dur: 31, dd: 5.0, flap: 2.1 },
        { top: 48, left: 82, size: 24, fly: 40, dur: 28, dd: 2.4, flap: 1.8 },
        { top: 88, left: 66, size: 16, fly: 32, dur: 34, dd: 7.5, flap: 2.4 },
        { top: 26, left: 40, size: 19, fly: 42, dur: 29, dd: 3.7, flap: 1.9 },
        { top: 30, left: 70, size: 16, fly: 34, dur: 36, dd: 6.1, flap: 2.6 }
    ];

    function duskSunSVG(uid) {
        return '<svg viewBox="0 0 88 88">' +
            '<defs>' +
              '<radialGradient id="dg' + uid + '">' +
                '<stop offset="30%" stop-color="#FFB877" stop-opacity=".55"/>' +
                '<stop offset="70%" stop-color="#F0906B" stop-opacity=".22"/>' +
                '<stop offset="100%" stop-color="#F0906B" stop-opacity="0"/>' +
              '</radialGradient>' +
              '<linearGradient id="dc' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
                '<stop offset="0%"   stop-color="#FFE0A8"/>' +
                '<stop offset="55%"  stop-color="#FFB877"/>' +
                '<stop offset="100%" stop-color="#F08E62"/>' +
              '</linearGradient>' +
            '</defs>' +
            '<circle cx="44" cy="44" r="44" fill="url(#dg' + uid + ')"/>' +
            '<circle cx="44" cy="44" r="19" fill="url(#dc' + uid + ')"/>' +
            '</svg>';
    }

    function duskCloudSVG(uid, tone) {
        var t = DUSK_TONES[tone] || DUSK_TONES[0];
        var id = 'dk' + uid + '_' + tone;
        return '<svg viewBox="0 0 120 62">' +
            '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0%" stop-color="' + t.top + '"/>' +
              '<stop offset="100%" stop-color="' + t.bottom + '"/>' +
            '</linearGradient></defs>' +
            '<g fill="url(#' + id + ')">' +
              '<circle cx="40" cy="34" r="22"/>' +
              '<circle cx="68" cy="28" r="26"/>' +
              '<circle cx="92" cy="38" r="18"/>' +
              '<circle cx="24" cy="42" r="15"/>' +
              '<rect x="24" y="40" width="80" height="16" rx="8"/>' +
            '</g></svg>';
    }

    function birdSVG() {
        return '<svg viewBox="0 0 40 20">' +
            '<g class="bird-wings" fill="none" stroke="#1B2942" stroke-width="2.6" ' +
            'stroke-linecap="round">' +
              '<path d="M2 12 Q10 2 20 11"/>' +
              '<path d="M20 11 Q30 2 38 12"/>' +
            '</g></svg>';
    }

    /*
      黃昏天空：夕陽＋晚霞雲＋飛鳥，純裝飾（不會顯示文字、也擋不到點擊）
        <div data-ocean="dusksky" data-clouds="5" data-birds="4"></div>
      不要太陽就寫 data-sun="0"。雲最多 6 朵、鳥最多 6 隻。
    */
    function buildDuskSky(el) {
        var nClouds = num(el, 'data-clouds', 5);
        var nBirds  = num(el, 'data-birds', 4);
        var wantSun = el.getAttribute('data-sun') !== '0';
        var uid = Math.floor(Math.random() * 1e6);
        var html = '', i, c, b;

        if (wantSun) {
            html += '<div class="dusk-obj dusk-sun" style="top:' + DUSK_SUN.top + '%;left:' +
                    DUSK_SUN.left + '%;width:' + DUSK_SUN.size + 'px;">' +
                    duskSunSVG(uid) + '</div>';
        }

        for (i = 0; i < Math.min(nClouds, DUSK_CLOUDS.length); i++) {
            c = DUSK_CLOUDS[i];
            html += '<div class="dusk-obj dusk-cloud dc' + (i + 1) + '" style="top:' + c.top +
                    '%;left:' + c.left + '%;width:' + c.size + 'px;--drift:' + c.drift +
                    'px;--cdur:' + c.dur + 's;--cdd:-' + c.dd + 's;">' +
                    duskCloudSVG(uid, c.tone) + '</div>';
        }

        for (i = 0; i < Math.min(nBirds, DUSK_BIRDS.length); i++) {
            b = DUSK_BIRDS[i];
            html += '<div class="dusk-obj dusk-bird db' + (i + 1) + '" style="top:' + b.top +
                    '%;left:' + b.left + '%;width:' + b.size + 'px;--fly:' + b.fly +
                    'px;--bdur:' + b.dur + 's;--bdd:-' + b.dd + 's;--flap:' + b.flap + 's;">' +
                    birdSVG() + '</div>';
        }

        el.classList.add('dusksky');
        el.innerHTML = html;
    }


    /* ---------- 背景漂浮水母 ---------- */

    // 傘部 + 五條觸手，觸手長度交錯才不會像梳子
    function jellySVG() {
        var t = '', i, xs = [-13, -6.5, 0, 6.5, 13], len = [30, 40, 46, 40, 30];
        for (i = 0; i < xs.length; i++) {
            t += '<path d="M' + xs[i] + ' 22 q' + (i % 2 ? 7 : -7) + ' ' + (len[i] * 0.45) +
                 ' 0 ' + len[i] + '" fill="none" stroke="currentColor" stroke-width="2.4" ' +
                 'stroke-linecap="round" opacity=".55"/>';
        }
        return '<svg viewBox="0 0 60 76">' +
            '<g transform="translate(30,4)">' +
                t +
                '<path d="M-22 22 A22 20 0 0 1 22 22 Q11 27 0 22 Q-11 27 -22 22 Z" fill="currentColor"/>' +
                '<ellipse cx="-8" cy="12" rx="6" ry="3.4" fill="#fff" opacity=".38"/>' +
            '</g></svg>';
    }

    var JELLY_COLORS = ['#4FB3D9', '#7FCBE8', '#17708A', '#A8DCF0', '#0E7C9B'];

    /*
      背景漂浮水母：放在 <body> 底下當背景層
        <div data-ocean="jellyfish" data-count="6"></div>
    */
    function buildJellyfish(el, rnd) {
        var n = num(el, 'data-count', 7), html = '', i;
        el.classList.add('drift');
        el.setAttribute('aria-hidden', 'true');
        for (i = 0; i < n; i++) {
            var size = 46 + Math.round(rnd() * 40);
            var dur = 38 + rnd() * 34;
            // 內容都在畫面中間，所以把水母安排在左右兩側的留白，才看得見又不會被卡片蓋住
            var lane = (i % 2) ? 86 + rnd() * 9 : 2.5 + rnd() * 8;
            html += '<div class="jelly" style="' +
                    'left:' + lane.toFixed(1) + '%;' +
                    '--jsize:' + size + 'px;' +
                    '--jdur:' + dur.toFixed(1) + 's;' +
                    // 負的 delay：一載入就散在畫面各處，不用等牠們從下面游上來
                    '--jdelay:' + (reduceMotion ? 0 : -rnd() * dur).toFixed(1) + 's;' +
                    '--jsway:' + (7 + rnd() * 6).toFixed(1) + 's;' +
                    '--jpulse:' + (2.6 + rnd() * 1.8).toFixed(1) + 's;' +
                    'color:' + JELLY_COLORS[i % JELLY_COLORS.length] + ';' +
                    // 淺色底上要夠淡才不會吵，但也不能淡到看不見
                    'opacity:' + (0.34 + rnd() * 0.24).toFixed(2) + ';' +
                    // 關閉動畫時直接散在畫面上，不會全部沉在畫面下方
                    (reduceMotion ? 'transform:translateY(' + -(15 + rnd() * 70).toFixed(0) + 'vh);' : '') +
                    '">' +
                    '<span class="jelly-sway"><span class="jelly-pulse">' + jellySVG() +
                    '</span></span></div>';
        }
        el.innerHTML = html;
    }

    var BUILDERS = {
        'bubbles':      buildBubbles,
        'fish':         buildFish,
        'seabed':       buildSeabed,
        'btn-bubbles':  buildBtnBubbles,
        'card-fx':      buildCardFx,
        'nightsky':     buildNightSky,
        'daysky':       buildDaySky,
        'dusksky':      buildDuskSky,
        'jellyfish':    buildJellyfish
    };

    function init() {
        var nodes = document.querySelectorAll('[data-ocean]');
        Array.prototype.forEach.call(nodes, function (el, idx) {
            var kind = el.getAttribute('data-ocean');
            var build = BUILDERS[kind];
            if (!build) {
                console.warn('[ocean.js] 不認得的 data-ocean 值：' + kind);
                return;
            }
            // 每個元素給不同 seed，才不會全部長一樣；指定 data-seed 可自己換一組
            build(el, makeRandom(num(el, 'data-seed', 20260901 + idx * 977)));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
