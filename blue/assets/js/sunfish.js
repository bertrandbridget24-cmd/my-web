/* =========================================================
   sunfish.js — 小遊戲「浪潮迭起」
   （主角是「太陽魚超人」，檔名沿用主角的名字）
   Catherine 個人網站 — 海洋藍主題套件

   玩法：點一下（或按空白鍵）太陽魚就往上衝，不點就往下沉，
        穿過上面垂下來的雲和下面長上來的海草之間的縫隙。

   想調難度：改下面 CFG 那一區的數字就好，程式不用動。

   需搭配 assets/css/game.css 與 assets/css/sunfish.css，
   以及 HTML 裡 id="sunfish-overlay" 那一段結構。
   點擊觸發：任何元素加上 data-game="sunfish"（由 game-hub.js 轉接）。
   ========================================================= */

(function () {
    'use strict';

    /* ================= 可以調的設定 ================= */
    var CFG = {
        W: 420, H: 520,          // 畫布尺寸（實際顯示會等比縮放）
        waterY: 0.46,            // 海面在畫布高度的幾成
        gravity: 900,            // 重力（越大掉越快）
        flap: -340,              // 點一下往上衝的力道（負的是往上）
        maxFall: 400,            // 最快下沉速度，掉再久也不會超過這個
        speed: 150,              // 障礙物往左移動的速度
        gap0: 178,               // 一開始的縫隙高度
        gapMin: 132,             // 縫隙最小到多窄
        gapStep: 4,              // 每過一組縮小多少
        spacing: 230,            // 兩組障礙物的水平間距
        r: 17                    // 太陽魚的半徑（碰撞用）
    };

    var BEST_KEY = 'catherine-sunfish-best';

    /* ================= 以下是程式 ================= */

    var overlay, canvas, ctx, elScore, elBest, scStart, scEnd, elFinal, elFinalBest;
    var W = CFG.W, H = CFG.H, waterY = H * CFG.waterY;
    var dpr = 1;

    var running = false, raf = 0, last = 0;
    var y, vy, tilt, obstacles, score, gap, spawnX, best = 0, dead = false;
    var bubbles = [], t = 0;

    function $(sel) { return overlay.querySelector(sel); }

    function build() {
        overlay = document.getElementById('sunfish-overlay');
        if (!overlay) return false;
        canvas      = $('#sunfish-canvas');
        ctx         = canvas.getContext('2d');
        elScore     = $('#sunfish-score');
        elBest      = $('#sunfish-best');
        scStart     = $('#sunfish-start');
        scEnd       = $('#sunfish-end');
        elFinal     = $('#sunfish-final');
        elFinalBest = $('#sunfish-final-best');

        try { best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) { best = 0; }
        elBest.textContent = best;

        reset();          // ★ 一定要在 resize() 之前：resize 會順手畫一次靜止畫面，
                          //    沒先 reset 的話 obstacles / bubbles 還是 undefined 會炸掉
        resize();
        window.addEventListener('resize', resize);

        // 點畫面 / 空白鍵 = 往上衝
        canvas.addEventListener('pointerdown', function (e) { e.preventDefault(); flap(); });
        document.addEventListener('keydown', function (e) {
            if (!overlay.classList.contains('open')) return;
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ') {
                e.preventDefault();
                if (running) flap(); else start();
            }
        });
        return true;
    }

    /* 依照畫布實際顯示大小設定解析度，在高解析螢幕上才不會糊 */
    function resize() {
        if (!canvas) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (!running) draw();      // 沒在玩的時候也要把靜止畫面畫出來
    }

    function reset() {
        y = H * 0.4; vy = 0; tilt = 0;
        obstacles = []; score = 0; gap = CFG.gap0; spawnX = W + 60;
        dead = false; t = 0;
        bubbles = [];
        var i;
        for (i = 0; i < 14; i++) {
            bubbles.push({ x: Math.random() * W, y: waterY + Math.random() * (H - waterY),
                           r: 1.5 + Math.random() * 2.5, s: 12 + Math.random() * 22 });
        }
        elScore.textContent = '0';
    }

    function flap() {
        if (!running) return;
        vy = CFG.flap;
    }

    function addObstacle(x) {
        // 縫隙中心：不要太靠邊，上下各留一點
        var margin = 54;
        var cy = margin + gap / 2 + Math.random() * (H - gap - margin * 2);
        obstacles.push({ x: x, cy: cy, gap: gap, passed: false,
                         sway: Math.random() * Math.PI * 2 });
        gap = Math.max(CFG.gapMin, gap - CFG.gapStep);
    }

    function start() {
        reset();
        scStart.hidden = true;
        scEnd.hidden = true;
        running = true;
        last = 0;
        addObstacle(W + 40);
        addObstacle(W + 40 + CFG.spacing);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
    }

    function gameOver() {
        running = false;
        dead = true;
        if (score > best) {
            best = score;
            try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) {}
        }
        elBest.textContent = best;
        elFinal.textContent = score;
        elFinalBest.textContent = best;
        scEnd.hidden = false;
    }

    function loop(ts) {
        if (!running) return;
        if (!last) last = ts;
        var dt = (ts - last) / 1000;
        last = ts;
        if (dt > 0.05) dt = 0.05;     // 切到別的分頁再回來時，避免一次跳太多
        update(dt);
        draw();
        raf = requestAnimationFrame(loop);
    }

    function update(dt) {
        t += dt;

        vy += CFG.gravity * dt;
        if (vy > CFG.maxFall) vy = CFG.maxFall;
        y += vy * dt;

        // 身體傾斜跟著速度轉，往上衝會抬頭、往下掉會低頭
        var target = Math.max(-0.5, Math.min(0.9, vy / 700));
        tilt += (target - tilt) * Math.min(1, dt * 9);

        // 撞到上下邊界
        if (y - CFG.r < 0) { y = CFG.r; vy = 0; }
        if (y + CFG.r > H) { y = H - CFG.r; gameOver(); return; }

        var i, o;
        for (i = obstacles.length - 1; i >= 0; i--) {
            o = obstacles[i];
            o.x -= CFG.speed * dt;

            // 通過了就加分
            if (!o.passed && o.x + 26 < 110 - CFG.r) {
                o.passed = true;
                score++;
                elScore.textContent = score;
            }
            if (o.x < -80) obstacles.splice(i, 1);
        }

        // 補新的障礙物
        var lastO = obstacles[obstacles.length - 1];
        if (!lastO || lastO.x < W - CFG.spacing) addObstacle(W + 40);

        if (hit()) { gameOver(); return; }

        // 海裡的小氣泡
        for (i = 0; i < bubbles.length; i++) {
            var b = bubbles[i];
            b.y -= b.s * dt;
            if (b.y < waterY) { b.y = H + 4; b.x = Math.random() * W; }
        }
    }

    /* 圓形 vs 兩個長方形。障礙物半寬 26 */
    function hit() {
        var px = 110, hw = 26, i, o;
        for (i = 0; i < obstacles.length; i++) {
            o = obstacles[i];
            if (o.x + hw < px - CFG.r || o.x - hw > px + CFG.r) continue;
            var topBottom = o.cy - o.gap / 2;      // 上面那根的下緣
            var botTop    = o.cy + o.gap / 2;      // 下面那根的上緣
            if (y - CFG.r < topBottom || y + CFG.r > botTop) return true;
        }
        return false;
    }

    /* ---------- 畫面 ---------- */

    function draw() {
        if (!ctx) return;

        // 天空
        var sky = ctx.createLinearGradient(0, 0, 0, waterY);
        sky.addColorStop(0, '#BFE3F4');
        sky.addColorStop(1, '#8FCCE9');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, waterY);

        // 海
        var sea = ctx.createLinearGradient(0, waterY, 0, H);
        sea.addColorStop(0, '#4FB3D9');
        sea.addColorStop(1, '#0B3D5C');
        ctx.fillStyle = sea;
        ctx.fillRect(0, waterY, W, H - waterY);

        // 海面那條亮線
        ctx.fillStyle = 'rgba(255,255,255,.45)';
        ctx.fillRect(0, waterY - 1.5, W, 3);

        // 海裡的小氣泡
        ctx.fillStyle = 'rgba(255,255,255,.28)';
        var i;
        for (i = 0; i < bubbles.length; i++) {
            ctx.beginPath();
            ctx.arc(bubbles[i].x, bubbles[i].y, bubbles[i].r, 0, Math.PI * 2);
            ctx.fill();
        }

        for (i = 0; i < obstacles.length; i++) drawObstacle(obstacles[i]);

        drawSunfish();
    }

    /* 上面垂下來的是雲，下面長上來的是海草。
       ★ 畫出來的形狀要跟 hit() 的判定範圍一致：
         上面那根擋住 0 ~ topBottom，下面那根擋住 botTop ~ H，寬度都是 hw*2。
         之前海草畫成幾根細細的葉子，中間看起來有縫但其實會撞到，很不公平。 */
    function drawObstacle(o) {
        var hw = 26;
        var topBottom = o.cy - o.gap / 2;
        var botTop    = o.cy + o.gap / 2;
        var sway = Math.sin(t * 1.6 + o.sway) * 2.5;

        /* ---- 上：雲柱，下緣做成三顆圓的蓬鬆感 ---- */
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(o.x - hw, -10);
        ctx.lineTo(o.x - hw, topBottom - 14);
        // 下緣三顆圓弧，最低點正好到 topBottom
        ctx.arc(o.x - hw + 13, topBottom - 14, 13, Math.PI, 0, true);
        ctx.arc(o.x,           topBottom - 14, 14, Math.PI, 0, true);
        ctx.arc(o.x + hw - 13, topBottom - 14, 13, Math.PI, 0, true);
        ctx.lineTo(o.x + hw, -10);
        ctx.closePath();
        ctx.fill();
        // 底部一點淡淡的陰影，看起來有厚度
        ctx.fillStyle = 'rgba(207,230,242,.55)';
        ctx.beginPath();
        ctx.ellipse(o.x, topBottom - 10, hw - 6, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        /* ---- 下：海草叢，整叢實心填滿判定範圍 ---- */
        ctx.save();
        var h = H - botTop;
        // 顏色要明顯比海水深，不然整叢會融進背景，看不出是障礙物
        var g = ctx.createLinearGradient(0, botTop, 0, H);
        g.addColorStop(0, '#1A6B7F');
        g.addColorStop(.45, '#0C4A5C');
        g.addColorStop(1, '#06303E');
        ctx.fillStyle = g;

        // 主體：一整塊，上緣做成波浪狀的葉尖，但最高點就是 botTop
        ctx.beginPath();
        ctx.moveTo(o.x - hw, H);
        ctx.lineTo(o.x - hw, botTop + 12);
        ctx.quadraticCurveTo(o.x - hw + 6 + sway, botTop, o.x - hw + 13, botTop + 9);
        ctx.quadraticCurveTo(o.x - 8 + sway,      botTop, o.x - 2,       botTop + 8);
        ctx.quadraticCurveTo(o.x + 8 + sway,      botTop, o.x + hw - 13, botTop + 9);
        ctx.quadraticCurveTo(o.x + hw - 6 + sway, botTop, o.x + hw,      botTop + 12);
        ctx.lineTo(o.x + hw, H);
        ctx.closePath();
        ctx.fill();

        // 葉脈：在實心塊裡面畫幾道淺色的線，看起來像一叢草而不是一塊板子
        ctx.strokeStyle = 'rgba(168,220,240,.3)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        [-15, -5, 6, 16].forEach(function (dx, k) {
            var tip = botTop + 14 + (k % 2 ? 8 : 0);
            ctx.beginPath();
            ctx.moveTo(o.x + dx, H);
            ctx.quadraticCurveTo(o.x + dx + sway * .8, botTop + h * .5, o.x + dx + sway, tip);
            ctx.stroke();
        });
        ctx.restore();
    }

    /* 太陽魚超人：一顆有光芒的小太陽，加上尾鰭、胸鰭和披風 */
    function drawSunfish() {
        var px = 110, r = CFG.r;
        ctx.save();
        ctx.translate(px, y);
        ctx.rotate(tilt);

        // 披風（在身體後面，會飄）
        var flap1 = Math.sin(t * 9) * 3;
        ctx.fillStyle = '#E8909C';
        ctx.beginPath();
        ctx.moveTo(-r + 3, -r + 5);
        ctx.quadraticCurveTo(-r - 16, -2 + flap1, -r - 10, r + 4 + flap1);
        ctx.quadraticCurveTo(-r - 2, r - 2, -r + 4, r - 4);
        ctx.closePath();
        ctx.fill();

        // 尾鰭
        ctx.fillStyle = '#F0B36B';
        ctx.beginPath();
        ctx.moveTo(-r + 2, 0);
        ctx.lineTo(-r - 13, -9 + flap1 * .6);
        ctx.lineTo(-r - 13, 9 + flap1 * .6);
        ctx.closePath();
        ctx.fill();

        // 光芒
        ctx.strokeStyle = '#FFCF7A';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        var i, a;
        for (i = 0; i < 10; i++) {
            a = (i / 10) * Math.PI * 2 + t * 0.6;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * (r + 3), Math.sin(a) * (r + 3));
            ctx.lineTo(Math.cos(a) * (r + 8), Math.sin(a) * (r + 8));
            ctx.stroke();
        }

        // 身體
        var g = ctx.createRadialGradient(-4, -5, 2, 0, 0, r);
        g.addColorStop(0, '#FFF1C8');
        g.addColorStop(.6, '#FFD98A');
        g.addColorStop(1, '#F0A55E');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // 胸鰭
        ctx.fillStyle = '#F0B36B';
        ctx.beginPath();
        ctx.ellipse(-2, r - 3, 7, 4, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛和嘴
        ctx.fillStyle = '#0A2A3D';
        ctx.beginPath();
        ctx.arc(6, -4, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0A2A3D';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(6, 3, 3.4, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();

        ctx.restore();
    }

    /* ---------- 開關 ---------- */
    window.openSunfish = function () {
        if (!overlay && !build()) return;
        overlay.classList.add('open');
        // 每次打開都回到開始畫面，不會卡在上一次的結束畫面
        running = false;
        cancelAnimationFrame(raf);
        reset();
        scEnd.hidden = true;
        scStart.hidden = false;
        resize();
        draw();
    };

    window.closeSunfish = function () {
        if (!overlay) return;
        running = false;
        cancelAnimationFrame(raf);
        overlay.classList.remove('open');
    };

    window.startSunfish = function () { start(); };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();
