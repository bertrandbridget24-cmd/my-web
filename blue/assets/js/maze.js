(function() {
    function initMazeGame() {
        const overlay = document.getElementById('maze-overlay');
        const svgWalls = document.getElementById('maze-walls');
        const playerEl = document.getElementById('maze-player');
        const goalEl = document.getElementById('maze-goal');
        const elTime = document.getElementById('maze-time');
        const screenStart = document.getElementById('maze-start');
        const screenEnd = document.getElementById('maze-end');
        const finalTime = document.getElementById('maze-final-time');

        if (!overlay) return;

        // 提高難度：將網格從 15x15 擴大為 21x21
        const COLS = 21;
        const ROWS = 21;
        const CELL_SIZE = 280 / COLS; 
        const OFFSET = 10;
        
        let grid = [];
        let playerPos = { c: 0, r: 0 };
        let isPlaying = false;
        
        let time = 0;
        let timerInterval = null;

        window.openMaze = function() {
            overlay.classList.add('open');

            /* 每次打開都回到「開始」畫面。
               原本這裡只有加 open class，所以如果上一次是玩到一半直接關掉，
               screenStart 和 screenEnd 都還停在 hidden = true 的狀態，
               而 isPlaying 已經被 closeMaze 設成 false ——
               重新打開就會看到一個不能動、也沒有開始按鈕的迷宮。 */
            isPlaying = false;
            clearInterval(timerInterval);
            time = 0;
            if (elTime) elTime.innerText = time;
            screenEnd.hidden = true;
            screenStart.hidden = false;
        };

        window.closeMaze = function() {
            overlay.classList.remove('open');
            isPlaying = false;
            clearInterval(timerInterval);
        };

        window.startMaze = function() {
            screenStart.hidden = true;
            screenEnd.hidden = true;
            isPlaying = true;
            
            time = 0;
            if (elTime) elTime.innerText = time;
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                time++;
                if (elTime) elTime.innerText = time;
            }, 1000);
            
            generateMaze();
            drawMaze();
            
            playerPos = { c: 0, r: 0 };
            updatePlayerVisual();
            goalEl.setAttribute('transform', `translate(${OFFSET + (COLS - 1) * CELL_SIZE}, ${OFFSET + (ROWS - 1) * CELL_SIZE})`);
        };

        function generateMaze() {
            grid = [];
            for (let r = 0; r < ROWS; r++) {
                let row = [];
                for (let c = 0; c < COLS; c++) {
                    row.push({ r, c, walls: [true, true, true, true], visited: false });
                }
                grid.push(row);
            }

            let current = grid[0][0];
            current.visited = true;
            let stack = [current];

            while (stack.length > 0) {
                let next = getUnvisitedNeighbor(current.c, current.r);
                if (next) {
                    next.visited = true;
                    stack.push(current);
                    removeWalls(current, next);
                    current = next;
                } else {
                    current = stack.pop();
                }
            }
        }

        function getUnvisitedNeighbor(c, r) {
            let neighbors = [];
            if (r > 0 && !grid[r - 1][c].visited) neighbors.push(grid[r - 1][c]); 
            if (c < COLS - 1 && !grid[r][c + 1].visited) neighbors.push(grid[r][c + 1]); 
            if (r < ROWS - 1 && !grid[r + 1][c].visited) neighbors.push(grid[r + 1][c]); 
            if (c > 0 && !grid[r][c - 1].visited) neighbors.push(grid[r][c - 1]); 
            
            if (neighbors.length > 0) {
                return neighbors[Math.floor(Math.random() * neighbors.length)];
            }
            return undefined;
        }

        function removeWalls(a, b) {
            let x = a.c - b.c;
            if (x === 1) { a.walls[3] = false; b.walls[1] = false; }
            else if (x === -1) { a.walls[1] = false; b.walls[3] = false; }
            
            let y = a.r - b.r;
            if (y === 1) { a.walls[0] = false; b.walls[2] = false; }
            else if (y === -1) { a.walls[2] = false; b.walls[0] = false; }
        }

        function drawMaze() {
            let html = '';
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    let cell = grid[r][c];
                    let x = OFFSET + c * CELL_SIZE;
                    let y = OFFSET + r * CELL_SIZE;
                    
                    if (cell.walls[0]) html += `<line class="maze-wall" x1="${x}" y1="${y}" x2="${x+CELL_SIZE}" y2="${y}" />`; 
                    if (cell.walls[1]) html += `<line class="maze-wall" x1="${x+CELL_SIZE}" y1="${y}" x2="${x+CELL_SIZE}" y2="${y+CELL_SIZE}" />`; 
                    if (cell.walls[2]) html += `<line class="maze-wall" x1="${x+CELL_SIZE}" y1="${y+CELL_SIZE}" x2="${x}" y2="${y+CELL_SIZE}" />`; 
                    if (cell.walls[3]) html += `<line class="maze-wall" x1="${x}" y1="${y+CELL_SIZE}" x2="${x}" y2="${y}" />`; 
                }
            }
            svgWalls.innerHTML = html;
        }

        window.movePlayer = function(dc, dr) {
            if (!isPlaying) return;
            
            let currentCell = grid[playerPos.r][playerPos.c];
            
            if (dr === -1 && currentCell.walls[0]) return;
            if (dc === 1 && currentCell.walls[1]) return;
            if (dr === 1 && currentCell.walls[2]) return;
            if (dc === -1 && currentCell.walls[3]) return;

            playerPos.c += dc;
            playerPos.r += dr;
            updatePlayerVisual();

            if (playerPos.c === COLS - 1 && playerPos.r === ROWS - 1) {
                isPlaying = false;
                clearInterval(timerInterval);
                
                setTimeout(() => {
                    screenEnd.hidden = false;
                    if (finalTime) finalTime.innerText = time + ' 秒';
                }, 300);
            }
        };

        function updatePlayerVisual() {
            playerEl.setAttribute('cx', OFFSET + playerPos.c * CELL_SIZE + CELL_SIZE / 2);
            playerEl.setAttribute('cy', OFFSET + playerPos.r * CELL_SIZE + CELL_SIZE / 2);
        }

        document.addEventListener('keydown', (e) => {
            if (!isPlaying) return;
            if (['ArrowUp', 'w', 'W'].includes(e.key)) movePlayer(0, -1);
            if (['ArrowDown', 's', 'S'].includes(e.key)) movePlayer(0, 1);
            if (['ArrowLeft', 'a', 'A'].includes(e.key)) movePlayer(-1, 0);
            if (['ArrowRight', 'd', 'D'].includes(e.key)) movePlayer(1, 0);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMazeGame);
    } else {
        initMazeGame();
    }
})();