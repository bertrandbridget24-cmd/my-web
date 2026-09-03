/* =========================================================
   starship.js — 飛船射擊小遊戲
   Catherine 個人網站 — 海洋藍主題套件

   用法：任何元素加上 data-game="starship"，點擊就會開啟遊戲。
     <div data-ocean="nightsky" data-moon="孫" data-stars="欣,黑糖"
          data-game-star="欣"></div>
   （ocean.js 會自動幫指定的那顆星星加上 data-game="starship"）

   需搭配 assets/css/game.css。
   操作：← → 或 A D 移動，空白鍵射擊；手機用拖曳移動、點擊射擊。
   ========================================================= */

(function () {
    'use strict';

    var W = 480, H = 640;           // 畫布的邏輯尺寸（實際顯示會等比縮放）
    var BEST_KEY = 'catherine-starship-best';

    /* 觸控裝置自動射擊。
       原因：iPhone / iPad 上「拖曳移動」和「點擊射擊」是衝突的手勢，
       快速點兩下還會被系統當成選字或放大，等於沒辦法一邊閃一邊打。
       所以在沒有滑鼠的裝置上直接改成持續自動開火，玩家只要專心移動。 */
    var TOUCH_ONLY = !window.matchMedia || window.matchMedia('(hover: none), (pointer: coarse)').matches;

    var overlay = null, canvas = null, ctx = null, screenEl = null;
    var elScore = null, elLives = null, elLevel = null;
    var raf = 0, last = 0, game = null, dpr = 1;

    /* ---------- 最高分（存在瀏覽器裡，不會上傳） ---------- */
    function readBest() {
        try { return parseInt(localStorage.getItem(BEST_KEY), 10) || 0; }
        catch (e) { return 0; }     // 無痕視窗等情況會丟例外，忽略即可
    }
    function writeBest(v) {
        try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) {}
    }

    /* ---------- 建立遊戲視窗（第一次點擊時才建） ---------- */
    function buildOverlay() {
        overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', '飛船射擊小遊戲');
        overlay.innerHTML =
            '<div class="game-panel">' +
                '<div class="game-bar">' +
                    '<strong>深海巡航</strong>' +
                    '<div class="game-stats">' +
                        '<span>分數 <b data-el="score">0</b></span>' +
                        '<span>關卡 <b data-el="level">1</b></span>' +
                        '<span>生命 <b data-el="lives">♥♥♥</b></span>' +
                    '</div>' +
                    '<button class="game-close" type="button" aria-label="關閉遊戲">×</button>' +
                '</div>' +
                '<div class="game-stage">' +
                    '<canvas class="game-canvas"></canvas>' +
                    '<div class="game-screen"></div>' +
                '</div>' +
                '<div class="game-hint">' +
                    (TOUCH_ONLY
                        ? '拖曳畫面移動 ・ <b>自動射擊</b> ・ 右上角 × 關閉'
                        : '← → 移動 ・ 空白鍵射擊 ・ Esc 關閉<br>觸控裝置：拖曳移動、自動射擊') +
                '</div>' +
            '</div>';
        document.body.appendChild(overlay);

        canvas   = overlay.querySelector('.game-canvas');
        ctx      = canvas.getContext('2d');
        screenEl = overlay.querySelector('.game-screen');
        elScore  = overlay.querySelector('[data-el="score"]');
        elLevel  = overlay.querySelector('[data-el="level"]');
        elLives  = overlay.querySelector('[data-el="lives"]');

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        overlay.querySelector('.game-close').addEventListener('click', close);
        overlay.addEventListener('mousedown', function (e) {
            if (e.target === overlay) close();      // 點視窗外關閉
        });

        bindControls();
    }

    // 依裝置像素密度放大畫布，避免在高解析度螢幕上糊掉
    function resizeCanvas() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        canvas.style.aspectRatio = W + ' / ' + H;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* ---------- 狀態 ---------- */
    function newGame() {
        var stars = [], i;
        for (i = 0; i < 60; i++) {
            stars.push({ x: Math.random() * W, y: Math.random() * H,
                         r: Math.random() * 1.3 + .3, v: Math.random() * 26 + 8 });
        }
        return {
            phase: 'ready',                 // ready | playing | over
            score: 0, best: readBest(), lives: 3, level: 1, kills: 0,
            t: 0, spawnT: 0, spawnEvery: 1.15,
            player: { x: W / 2, y: H - 62, r: 15, cool: 0, invuln: 0 },
            bullets: [], foes: [], foeShots: [], bits: [], stars: stars,
            keys: {}, pointerX: null, wantShoot: false
        };
    }

    /* ---------- 操作 ---------- */
    function bindControls() {
        document.addEventListener('keydown', function (e) {
            if (!overlay || !overlay.classList.contains('open')) return;
            if (e.key === 'Escape') { close(); return; }
            if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) >= 0) e.preventDefault();
            if (!game) return;
            game.keys[e.key] = true;
            if (e.key === ' ') {
                if (game.phase === 'playing') game.wantShoot = true;
                else start();                                  // 空白鍵也可以開始／重來
            }
        });
        document.addEventListener('keyup', function (e) {
            if (game) game.keys[e.key] = false;
        });

        // 觸控／滑鼠：拖曳移動、點擊射擊
        function toGameX(clientX) {
            var r = canvas.getBoundingClientRect();
            return (clientX - r.left) / r.width * W;
        }
        canvas.addEventListener('pointerdown', function (e) {
            if (!game) return;
            canvas.setPointerCapture(e.pointerId);
            game.pointerX = toGameX(e.clientX);
            if (game.phase !== 'playing') start();
            else if (!TOUCH_ONLY) game.wantShoot = true;   // 觸控裝置是自動射擊，不用點
        });
        canvas.addEventListener('pointermove', function (e) {
            if (game && e.buttons) game.pointerX = toGameX(e.clientX);
        });
        canvas.addEventListener('pointerup', function () { if (game) game.pointerX = null; });
    }

    /* ---------- 提示畫面 ---------- */
    function showScreen(html) { screenEl.innerHTML = html; screenEl.hidden = false; }
    function hideScreen() { screenEl.hidden = true; }

    function readyScreen() {
        showScreen('<h3>深海巡航</h3>' +
            '<p>擊落來襲的水母，撐過越多關越好。<br>' +
            (TOUCH_ONLY ? '拖曳移動，砲火會自動發射。' : '← → 移動，空白鍵射擊。') + '</p>' +
            (game.best ? '<p>最高分 ' + game.best + '</p>' : '') +
            '<button class="game-btn" type="button" data-act="start">開始</button>');
    }

    function overScreen() {
        showScreen('<h3>' + (game.score >= game.best && game.score > 0 ? '新紀錄！' : '任務結束') + '</h3>' +
            '<div class="game-score-big">' + game.score + '</div>' +
            '<p>最高分 ' + game.best + ' ・ 抵達第 ' + game.level + ' 關</p>' +
            '<button class="game-btn" type="button" data-act="start">再玩一次</button>');
    }

    /* ---------- 開關 ---------- */
    function open() {
        if (!overlay) buildOverlay();
        game = newGame();
        updateHUD();
        readyScreen();
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        last = performance.now();
        loop(last);
    }

    function close() {
        if (!overlay) return;
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        cancelAnimationFrame(raf);
        raf = 0;
        game = null;
    }

    function start() {
        if (!game) return;
        if (game.phase === 'over') { var b = game.best; game = newGame(); game.best = b; }
        game.phase = 'playing';
        hideScreen();
        updateHUD();
    }

    function updateHUD() {
        elScore.textContent = game.score;
        elLevel.textContent = game.level;
        elLives.textContent = game.lives > 0 ? new Array(game.lives + 1).join('♥') : '—';
    }

    /* ---------- 每一幀 ---------- */
    function loop(now) {
        raf = requestAnimationFrame(loop);
        var dt = Math.min((now - last) / 1000, 0.05);   // 分頁切回來時避免一次跳太多
        last = now;
        if (game) { update(dt); draw(); }
    }

    function update(dt) {
        var i, j, s;

        // 背景星星永遠在跑，待機畫面也有動態
        for (i = 0; i < game.stars.length; i++) {
            s = game.stars[i];
            s.y += s.v * dt;
            if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
        }
        if (game.phase !== 'playing') return;

        game.t += dt;
        var p = game.player;

        // 移動
        var speed = 320;
        if (game.keys.ArrowLeft  || game.keys.a || game.keys.A) p.x -= speed * dt;
        if (game.keys.ArrowRight || game.keys.d || game.keys.D) p.x += speed * dt;
        if (game.pointerX !== null) p.x += (game.pointerX - p.x) * Math.min(dt * 14, 1);
        p.x = Math.max(p.r + 4, Math.min(W - p.r - 4, p.x));

        // 射擊
        p.cool -= dt;
        if (p.invuln > 0) p.invuln -= dt;
        if ((game.keys[' '] || game.wantShoot || TOUCH_ONLY) && p.cool <= 0) {
            game.bullets.push({ x: p.x, y: p.y - 20, v: -520 });
            p.cool = 0.17;
        }
        game.wantShoot = false;

        // 子彈
        for (i = game.bullets.length - 1; i >= 0; i--) {
            game.bullets[i].y += game.bullets[i].v * dt;
            if (game.bullets[i].y < -12) game.bullets.splice(i, 1);
        }
        for (i = game.foeShots.length - 1; i >= 0; i--) {
            game.foeShots[i].y += game.foeShots[i].v * dt;
            if (game.foeShots[i].y > H + 12) game.foeShots.splice(i, 1);
        }

        // 生怪：關卡越高越快、越密
        game.spawnT -= dt;
        if (game.spawnT <= 0) {
            game.spawnT = Math.max(0.34, game.spawnEvery - game.level * 0.07);
            game.foes.push({
                x: 26 + Math.random() * (W - 52),
                y: -24,
                r: 15 + Math.random() * 5,
                v: 52 + game.level * 11 + Math.random() * 26,
                sway: Math.random() * Math.PI * 2,
                hp: 1
            });
        }

        // 敵人移動與開火
        for (i = game.foes.length - 1; i >= 0; i--) {
            var f = game.foes[i];
            f.y += f.v * dt;
            f.sway += dt * 2.2;
            f.x += Math.sin(f.sway) * 26 * dt;
            if (game.level >= 3 && Math.random() < 0.16 * dt * game.level) {
                game.foeShots.push({ x: f.x, y: f.y + f.r, v: 190 + game.level * 12 });
            }
            if (f.y - f.r > H) { game.foes.splice(i, 1); hit(); continue; }   // 漏掉也扣血

            // 被子彈打中
            for (j = game.bullets.length - 1; j >= 0; j--) {
                var b = game.bullets[j];
                if (Math.abs(b.x - f.x) < f.r && Math.abs(b.y - f.y) < f.r) {
                    game.bullets.splice(j, 1);
                    game.foes.splice(i, 1);
                    boom(f.x, f.y, '#E8909C');
                    game.score += 10;
                    game.kills++;
                    if (game.kills % 10 === 0) game.level++;
                    updateHUD();
                    break;
                }
            }
        }

        // 撞到玩家
        if (p.invuln <= 0) {
            for (i = game.foes.length - 1; i >= 0; i--) {
                if (dist(game.foes[i], p) < game.foes[i].r + p.r - 4) {
                    boom(game.foes[i].x, game.foes[i].y, '#E8909C');
                    game.foes.splice(i, 1);
                    hit();
                    break;
                }
            }
            for (i = game.foeShots.length - 1; i >= 0; i--) {
                if (dist(game.foeShots[i], p) < p.r) {
                    game.foeShots.splice(i, 1);
                    hit();
                    break;
                }
            }
        }

        // 爆炸碎片
        for (i = game.bits.length - 1; i >= 0; i--) {
            var bit = game.bits[i];
            bit.x += bit.vx * dt; bit.y += bit.vy * dt; bit.life -= dt;
            if (bit.life <= 0) game.bits.splice(i, 1);
        }
    }

    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

    function boom(x, y, color) {
        for (var i = 0; i < 12; i++) {
            var a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 130;
            game.bits.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                             life: 0.35 + Math.random() * 0.3, color: color });
        }
    }

    function hit() {
        var p = game.player;
        if (p.invuln > 0) return;
        game.lives--;
        p.invuln = 1.4;                 // 短暫無敵，不會被連續扣血
        boom(p.x, p.y, '#A8DCF0');
        updateHUD();
        if (game.lives <= 0) {
            game.phase = 'over';
            if (game.score > game.best) { game.best = game.score; writeBest(game.score); }
            overScreen();
        }
    }

    /* ---------- 畫面 ---------- */
    function draw() {
        var i;

        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#02090F');
        g.addColorStop(0.55, '#061626');
        g.addColorStop(1, '#0A2A3D');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // 背景星星
        ctx.fillStyle = '#FFF6DA';
        for (i = 0; i < game.stars.length; i++) {
            var s = game.stars[i];
            ctx.globalAlpha = 0.25 + s.r * 0.45;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.284); ctx.fill();
        }
        ctx.globalAlpha = 1;

        // 敵人（水母）
        for (i = 0; i < game.foes.length; i++) drawFoe(game.foes[i]);

        // 子彈
        ctx.fillStyle = '#FFF6DA';
        for (i = 0; i < game.bullets.length; i++) {
            ctx.fillRect(game.bullets[i].x - 1.6, game.bullets[i].y - 9, 3.2, 13);
        }
        ctx.fillStyle = '#E8909C';
        for (i = 0; i < game.foeShots.length; i++) {
            ctx.beginPath(); ctx.arc(game.foeShots[i].x, game.foeShots[i].y, 3.4, 0, 6.284); ctx.fill();
        }

        // 碎片
        for (i = 0; i < game.bits.length; i++) {
            var b = game.bits[i];
            ctx.globalAlpha = Math.max(b.life * 2, 0);
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x - 1.8, b.y - 1.8, 3.6, 3.6);
        }
        ctx.globalAlpha = 1;

        if (game.lives > 0) drawShip(game.player);
    }

    function drawShip(p) {
        // 無敵時閃爍
        if (p.invuln > 0 && Math.floor(p.invuln * 12) % 2 === 0) return;
        ctx.save();
        ctx.translate(p.x, p.y);

        ctx.fillStyle = '#4FB3D9';                 // 尾翼
        ctx.beginPath();
        ctx.moveTo(-15, 12); ctx.lineTo(-6, 2); ctx.lineTo(-6, 14); ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(15, 12); ctx.lineTo(6, 2); ctx.lineTo(6, 14); ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#A8DCF0';                 // 機身
        ctx.beginPath();
        ctx.moveTo(0, -18); ctx.quadraticCurveTo(9, 0, 8, 14);
        ctx.lineTo(-8, 14); ctx.quadraticCurveTo(-9, 0, 0, -18);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#0B3D5C';                 // 座艙
        ctx.beginPath(); ctx.ellipse(0, -2, 3.6, 5.4, 0, 0, 6.284); ctx.fill();

        ctx.fillStyle = 'rgba(255,246,218,.85)';   // 尾焰
        var f = 6 + Math.random() * 6;
        ctx.beginPath();
        ctx.moveTo(-4, 14); ctx.lineTo(0, 14 + f); ctx.lineTo(4, 14); ctx.closePath(); ctx.fill();

        ctx.restore();
    }

    function drawFoe(f) {
        ctx.save();
        ctx.translate(f.x, f.y);

        ctx.fillStyle = '#E8909C';                 // 傘蓋
        ctx.beginPath();
        ctx.ellipse(0, 0, f.r, f.r * 0.82, 0, Math.PI, 0);
        ctx.closePath(); ctx.fill();

        ctx.strokeStyle = 'rgba(232,144,156,.75)'; // 觸手
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        for (var i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * f.r * 0.32, 0);
            ctx.quadraticCurveTo(i * f.r * 0.32 + Math.sin(f.sway + i) * 4,
                                 f.r * 0.7, i * f.r * 0.32, f.r * 1.15);
            ctx.stroke();
        }

        ctx.fillStyle = '#FFF6DA';                 // 眼睛
        ctx.beginPath(); ctx.arc(-f.r * 0.3, -f.r * 0.32, 2.3, 0, 6.284); ctx.fill();
        ctx.beginPath(); ctx.arc(f.r * 0.3, -f.r * 0.32, 2.3, 0, 6.284); ctx.fill();

        ctx.restore();
    }

    /* ---------- 啟動 ---------- */
    function init() {
        document.addEventListener('click', function (e) {
            var trigger = e.target.closest && e.target.closest('[data-game="starship"]');
            if (trigger) { e.preventDefault(); open(); return; }
            var btn = e.target.closest && e.target.closest('.game-screen [data-act="start"]');
            if (btn) start();
        });

        // 用鍵盤 Tab 移到星星上時，Enter 或空白鍵也能開啟
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            var el = document.activeElement;
            if (el && el.matches && el.matches('[data-game="starship"]')) {
                e.preventDefault();
                open();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
