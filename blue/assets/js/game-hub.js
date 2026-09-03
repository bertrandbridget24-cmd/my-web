/* =========================================================
   game-hub.js — 星星與小遊戲的中間人
   Catherine 個人網站 — 海洋藍主題套件

   ocean.js 會依 data-games 幫指定的星星加上 data-game="xxx"。
   這支程式負責在那顆星星被點擊時，呼叫對應遊戲的開啟函式。

     data-game="starship"  → 飛船射擊（starship.js 自己會處理點擊，這裡不插手）
     data-game="fishing"   → 釣魚（呼叫 window.openGame）
     data-game="maze"      → 迷宮（呼叫 window.openMaze）
     data-game="life"      → 人生選擇（呼叫 window.openLife）
     data-game="sunfish"   → 浪潮迭起（呼叫 window.openSunfish）

   要再加新遊戲，只要在下面的 OPENERS 補一行。
   ========================================================= */

(function () {
    'use strict';

    var OPENERS = {
        // starship 由 starship.js 自己綁定，這裡故意留空避免重複開啟
        'starship': null,
        'fishing':  function () { if (window.openGame) window.openGame(); else warn('fishing.js'); },
        'maze':     function () { if (window.openMaze) window.openMaze(); else warn('maze.js'); },
        'life':     function () { if (window.openLife) window.openLife(); else warn('life.js'); },
        'sunfish':  function () { if (window.openSunfish) window.openSunfish(); else warn('sunfish.js'); }
    };

    function warn(file) {
        console.warn('[game-hub] 這一頁沒有載入 ' + file + '，遊戲打不開');
    }

    function handle(e) {
        var t = e.target.closest && e.target.closest('[data-game]');
        if (!t) return;
        var fn = OPENERS[t.getAttribute('data-game')];
        if (fn) { e.preventDefault(); fn(); }
    }

    /* ---------- 迷宮方向鍵：按著不放會連續移動 ---------- */
    /* 21x21 的迷宮如果每走一步都要點一下，手機上會按到手痠。 */
    function bindDpad() {
        var timer = 0;

        function stop() { clearTimeout(timer); clearInterval(timer); timer = 0; }

        document.addEventListener('pointerdown', function (e) {
            var btn = e.target.closest && e.target.closest('[data-move]');
            if (!btn || !window.movePlayer) return;
            e.preventDefault();                       // 避免變成選字或捲動
            var d = btn.getAttribute('data-move').split(',');
            var dc = parseInt(d[0], 10), dr = parseInt(d[1], 10);
            window.movePlayer(dc, dr);
            stop();
            // 先停 320ms 再開始連發，避免只想走一步卻衝出去
            timer = setTimeout(function () {
                timer = setInterval(function () { window.movePlayer(dc, dr); }, 130);
            }, 320);
        });

        ['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach(function (ev) {
            document.addEventListener(ev, stop, true);
        });

        // 鍵盤 Tab 到方向鍵上按 Enter / 空白鍵也能走一步
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            var el = document.activeElement;
            if (!el || !el.matches || !el.matches('[data-move]') || !window.movePlayer) return;
            e.preventDefault();
            var d = el.getAttribute('data-move').split(',');
            window.movePlayer(parseInt(d[0], 10), parseInt(d[1], 10));
        });
    }

    /* Esc 關閉釣魚 / 迷宮 / 人生選擇（飛船射擊自己有處理） */
    function bindEsc() {
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            var open = document.querySelector('#fishing-overlay.open, #maze-overlay.open, #life-overlay.open, #sunfish-overlay.open');
            if (!open) return;
            if (open.id === 'fishing-overlay' && window.closeGame) window.closeGame();
            if (open.id === 'maze-overlay' && window.closeMaze) window.closeMaze();
            if (open.id === 'life-overlay' && window.closeLife) window.closeLife();
            if (open.id === 'sunfish-overlay' && window.closeSunfish) window.closeSunfish();
        });
    }

    /* 點視窗外的深色區域也關閉 */
    function bindBackdrop() {
        document.addEventListener('mousedown', function (e) {
            if (e.target.id === 'fishing-overlay' && window.closeGame) window.closeGame();
            if (e.target.id === 'maze-overlay' && window.closeMaze) window.closeMaze();
            if (e.target.id === 'life-overlay' && window.closeLife) window.closeLife();
            if (e.target.id === 'sunfish-overlay' && window.closeSunfish) window.closeSunfish();
        });
    }

    function init() {
        document.addEventListener('click', handle);
        bindDpad();
        bindEsc();
        bindBackdrop();
        // 鍵盤 Tab 到星星上按 Enter / 空白鍵也能開
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            // ★ 遊戲已經開著就不要理它。
            //   否則點星星開遊戲後，焦點還留在那顆星星上，
            //   遊戲內按空白鍵（例如太陽魚超人的拍翅膀）會又觸發一次開啟，把遊戲重設。
            if (document.querySelector('.game-overlay.open')) return;
            var el = document.activeElement;
            if (!el || !el.matches || !el.matches('[data-game]')) return;
            var fn = OPENERS[el.getAttribute('data-game')];
            if (fn) { e.preventDefault(); fn(); }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
