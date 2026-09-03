/* =========================================================
   fishing.js — SVG 釣魚小遊戲邏輯
   搭配 game.css 與對應的 HTML 結構使用
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 取得 DOM 元素
    const overlay = document.getElementById('fishing-overlay');
    const svg = document.getElementById('fishing-svg');
    const fishLayer = document.getElementById('fish-layer');
    const caughtLayer = document.getElementById('caught-fish-layer');
    const fishingLine = document.getElementById('fishing-line');
    const hook = document.getElementById('hook');
    const elScore = document.getElementById('score');
    const elTime = document.getElementById('time');
    const screenStart = document.getElementById('screen-start');
    const screenEnd = document.getElementById('screen-end');
    const finalScore = document.getElementById('final-score');

    // 如果當前頁面沒有遊戲元素，則不執行後續邏輯
    if (!overlay || !svg) return;

    // 遊戲全域變數
    let score = 0;
    let time = 30;
    let isPlaying = false;
    let timerInterval = null;
    let animFrame = null;
    let fishes = [];
    
    // 釣鉤狀態設定
    const HOOK_REST_Y = 80;  // 釣鉤預設高度 (水面上)
    const HOOK_X = 240;      // 釣鉤 X 軸位置 (固定在船邊)
    let hookY = HOOK_REST_Y;
    let hookTargetY = HOOK_REST_Y;
    let hookState = 'idle';  // 狀態: 'idle'(閒置), 'dropping'(下沉), 'reeling'(收線)
    let caughtFish = null;   // 目前釣到的魚

    // 魚類設定 (顏色對應你的海洋藍主題：淺藍、淡黃、深藍等)
    const fishTypes = [
        { score: 10, speed: 1.5, scale: 0.8, color: '#A8DCF0', depth: [100, 200] },
        { score: 30, speed: 2.0, scale: 0.6, color: '#FFF3CE', depth: [200, 350] },
        { score: 50, speed: 3.0, scale: 0.4, color: '#0B3D5C', depth: [350, 450], stroke: '#A8DCF0' }
    ];

    // 打開遊戲視窗
    window.openGame = function() {
        overlay.classList.add('open');

        /* 每次打開都回到「開始」畫面。
           原本關閉時會呼叫 endGame()，所以重新打開會停在「時間到」那一頁，
           雖然還按得下去，但玩家會以為自己剛剛玩過。 */
        isPlaying = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animFrame);
        screenEnd.hidden = true;
        screenStart.hidden = false;
    };

    // 關閉遊戲視窗
    window.closeGame = function() {
        overlay.classList.remove('open');
        if (isPlaying) endGame();
    };

    // 開始遊戲
    window.startGame = function() {
        // 重置 UI 與畫面
        screenStart.hidden = true;
        screenEnd.hidden = true;
        score = 0;
        time = 30;
        fishes = [];
        fishLayer.innerHTML = '';
        caughtLayer.innerHTML = '';
        updateUI();
        
        // 重置釣鉤
        hookY = HOOK_REST_Y;
        hookTargetY = HOOK_REST_Y;
        hookState = 'idle';
        updateHookVisual();

        // 啟動計時器與遊戲迴圈
        isPlaying = true;
        timerInterval = setInterval(() => {
            time--;
            updateUI();
            if (time <= 0) endGame();
        }, 1000);

        lastTime = performance.now();
        animFrame = requestAnimationFrame(gameLoop);
    };

    // 結束遊戲
    function endGame() {
        isPlaying = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animFrame);
        screenEnd.hidden = false;
        finalScore.innerText = score;
    }

    // 更新分數與時間 UI
    function updateUI() {
        elScore.innerText = score;
        elTime.innerText = time;
    }

    // 建立魚的 SVG DOM 元素
    function createFishDOM(type, direction) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // 魚身
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        body.setAttribute('cx', 0);
        body.setAttribute('cy', 0);
        body.setAttribute('rx', 20);
        body.setAttribute('ry', 10);
        body.setAttribute('fill', type.color);
        if(type.stroke) {
            body.setAttribute('stroke', type.stroke);
            body.setAttribute('stroke-width', '2');
        }
        
        // 魚尾巴
        const tail = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const tailPoints = direction === 1 ? "-15,0 -28,-10 -28,10" : "15,0 28,-10 28,10";
        tail.setAttribute('points', tailPoints);
        tail.setAttribute('fill', type.color);
        if(type.stroke) {
            tail.setAttribute('stroke', type.stroke);
            tail.setAttribute('stroke-width', '2');
        }

        // 魚眼睛 (新增)
        const eye = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const eyeX = direction === 1 ? 10 : -10; // 根據游動方向，決定眼睛在右邊還是左邊
        eye.setAttribute('cx', eyeX);
        eye.setAttribute('cy', -3); // 眼睛偏上半部一點
        eye.setAttribute('r', 2.5);
        eye.setAttribute('fill', '#02090F'); // 使用你的主題深色當作眼睛

        g.appendChild(tail);
        g.appendChild(body);
        g.appendChild(eye); // 將眼睛組合進去
        return g;
    }

    // 隨機生成魚群
    function spawnFish() {
        if (fishes.length > 10) return; // 畫面最多 10 條魚
        if (Math.random() > 0.03) return; // 每一幀的產卵機率 (大約每秒1~2隻)

        const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        const direction = Math.random() > 0.5 ? 1 : -1;
        const x = direction === 1 ? -50 : 450;
        const y = Math.random() * (type.depth[1] - type.depth[0]) + type.depth[0];
        
        const dom = createFishDOM(type, direction);
        fishLayer.appendChild(dom);

        fishes.push({ x, y, direction, speed: type.speed, type, dom, active: true });
    }

    // 綁定點擊事件 (滑鼠/觸控點擊 SVG 時拋出鉤子)
    svg.addEventListener('pointerdown', (e) => {
        if (!isPlaying || hookState !== 'idle') return;
        
        // 將螢幕點擊座標轉換為 SVG viewBox 內部座標
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        
        // 確保只能往下釣 (不能往天空點)
        if (svgP.y > HOOK_REST_Y + 20) {
            hookTargetY = Math.min(svgP.y, 460); // 限制最深不超過海底
            hookState = 'dropping';
        }
    });

    // 更新釣魚線與魚鉤的視覺位置
    function updateHookVisual() {
        // 線只要改變終點 y 座標即可 (繩子會變長)
        fishingLine.setAttribute('y2', hookY);
        
        // 魚鉤改用 translate 平移，完全不會改變鉤子本身的弧線形狀
        hook.setAttribute('transform', `translate(${HOOK_X}, ${hookY})`);
        
        // 如果有釣到魚，讓魚跟著鉤子移動，並且轉向朝上 (-90度)
        if (caughtFish) {
            caughtFish.dom.setAttribute('transform', `translate(${HOOK_X}, ${hookY + 10}) scale(${caughtFish.type.scale}) rotate(-90)`);
        }
    }

    // 遊戲主迴圈
    let lastTime = 0;
    function gameLoop(timestamp) {
        if (!isPlaying) return;
        const dt = timestamp - lastTime;
        lastTime = timestamp;

        spawnFish();

        // 1. 更新游動的魚
        for (let i = fishes.length - 1; i >= 0; i--) {
            let f = fishes[i];
            if (!f.active) continue;

            f.x += f.speed * f.direction;
            f.dom.setAttribute('transform', `translate(${f.x}, ${f.y}) scale(${f.type.scale})`);

            // 檢查是否游出邊界，是的話移除
            if ((f.direction === 1 && f.x > 460) || (f.direction === -1 && f.x < -60)) {
                f.dom.remove();
                fishes.splice(i, 1);
                continue;
            }

            // 2. 碰撞判定 (鉤子下降或回收時都有機會碰到魚)
            if (!caughtFish && hookState !== 'idle') {
                const distY = Math.abs(f.y - (hookY + 10));
                const distX = Math.abs(f.x - HOOK_X);
                // 簡易的矩形範圍碰撞判定
                if (distX < 20 * f.type.scale && distY < 15) {
                    // 釣到了！
                    f.active = false;
                    caughtFish = f;
                    fishLayer.removeChild(f.dom);
                    caughtLayer.appendChild(f.dom); // 把魚移到上層圖層，避免被其他魚遮擋
                    hookState = 'reeling';          // 咬鉤後立刻開始收線
                }
            }
        }

        // 3. 更新鉤子高度狀態
        if (hookState === 'dropping') {
            hookY += 4; // 下沉速度
            if (hookY >= hookTargetY) {
                hookState = 'reeling'; // 抵達目標深度後自動收線
            }
        } else if (hookState === 'reeling') {
            hookY -= (caughtFish ? 3 : 5); // 回收速度 (釣到魚時會比較重，拉得慢)
            
            // 回收完畢
            if (hookY <= HOOK_REST_Y) {
                hookY = HOOK_REST_Y;
                hookState = 'idle';
                
                // 結算分數
                if (caughtFish) {
                    score += caughtFish.type.score;
                    updateUI();
                    caughtFish.dom.remove();
                    
                    // 清理陣列
                    const idx = fishes.indexOf(caughtFish);
                    if (idx > -1) fishes.splice(idx, 1);
                    caughtFish = null;
                }
            }
        }

        updateHookVisual();

        // 呼叫下一幀
        if (isPlaying) animFrame = requestAnimationFrame(gameLoop);
    }
});