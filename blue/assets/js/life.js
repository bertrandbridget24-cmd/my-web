/* =========================================================
   life.js — 人生選擇小遊戲「潮汐之間」
   Catherine 個人網站 — 海洋藍主題套件

   七個路口，每個選項會往「技術」或「生活」加一分，
   最後依照兩邊的比例給不同的結局。
   另外偷偷記錄「大膽」的次數：七題全選大膽的、或七題全不選大膽的，
   會各自拿到一個隱藏結局。

   ★ 劇情是「節點」串起來的，不是固定順序，
     所以第一章選什麼，第二三章會遇到完全不同的場景。

   想改故事：改下面的 NODES 和 ENDINGS 就好，程式的部分不用動。
   每個節點長這樣：

     '節點代號': {
         chapter: '第幾章 ・ 標題',
         text:    '情境描述',
         options: [
             { label: '選項標題', desc: '選項小字',
               axis: 'tech' 或 'life',       ← 加分給哪一邊
               bold: true,                   ← 這是比較冒險的那個（每個節點只能有一個）
               outcome: '選完之後發生了什麼', ← 這段就是「劇情」
               next: '下一個節點代號' }       ← 不寫 next 就是走到結局
         ]
     }

   需搭配 assets/css/game.css 與 assets/css/life.css。
   點擊觸發：任何元素加上 data-game="life"（由 game-hub.js 轉接）。
   ========================================================= */

(function () {
    'use strict';

    /* ================= 故事內容 ================= */

    var START = 'ch1';      // 從哪個節點開始
    var TOTAL = 7;          // 一場總共會走幾章（進度點的數量）

    var NODES = {

        /* ---------- 第一章：這裡決定接下來兩章走哪條線 ---------- */
        'ch1': {
            chapter: '第一章 ・ 開學',
            text: '大一的社團博覽會，攤位擠得水泄不通。你手上只剩一張報名表，站在走道中間，兩邊都在喊你。',
            options: [
                {
                    label: '走向資訊社', desc: '從零開始，寫出第一支會動的程式。',
                    axis: 'tech', bold: true, next: 'code2',
                    outcome: '學長把筆電轉過來，畫面上只有一個黑底白字的視窗。「先讓它印出你的名字就好。」' +
                             '你打了十分鐘，錯了七次，第八次成功的時候，你盯著那三個字看了很久 —— 是你叫電腦講的。'
                },
                {
                    label: '走向烘焙社', desc: '先學會把蛋白打發到不會掉下來。',
                    axis: 'life', next: 'bake2',
                    outcome: '學姊把鋼盆倒過來舉在你頭上，你下意識閉眼。蛋白霜一動也不動。「這樣就算成功。」' +
                             '你睜開眼，發現自己記住的不是配方，是那個「不會掉下來」的手感。'
                }
            ]
        },

        /* ---------- 第二章：資訊社線 ---------- */
        'code2': {
            chapter: '第二章 ・ 第一支程式',
            text: '專題卡在同一個 bug 上三天了。凌晨兩點，你發現問題不在程式，在你當初把整個結構想錯了。',
            options: [
                {
                    label: '整個打掉重寫', desc: '錯的地基，補再多也是歪的。',
                    axis: 'tech', next: 'code3',
                    outcome: '你花了兩個晚上重來。新版本只有原本一半長，而且你每一行都知道自己在做什麼。' +
                             '那個 bug 最後不是被修好的 —— 它是被刪掉的。'
                },
                {
                    label: '先讓它跑起來，之後再說', desc: '明天要 demo，先過關比較重要。',
                    axis: 'life', bold: true, next: 'code3',
                    outcome: '隔天 demo 順利過了，沒有人發現。但之後每次要加東西，你都得先繞過自己補上去的那塊。' +
                             '你學到的不是怎麼寫程式，是「今天省下來的，之後會加倍還」。'
                }
            ]
        },

        /* ---------- 第二章：烘焙社線 ---------- */
        'bake2': {
            chapter: '第二章 ・ 第一爐麵包',
            text: '你的第一爐吐司膨得漂亮，切開卻是實心的。社辦只剩最後一包高筋麵粉。',
            options: [
                {
                    label: '照著配方，重來一次', desc: '這次每一步都量、都計時、都寫下來。',
                    axis: 'tech', next: 'bake3',
                    outcome: '你把水溫、室溫、發酵時間全部記進手機備忘錄。第二爐切開，孔洞均勻。' +
                             '你盯著那張表突然想通：所謂手感，其實只是還沒寫下來的參數。'
                },
                {
                    label: '憑感覺調，看看會怎樣', desc: '麵團摸起來太乾了，不管配方寫幾克。',
                    axis: 'life', bold: true, next: 'bake3',
                    outcome: '你多加了兩湯匙水，發酵也拉長了。烤出來的形狀有點歪，可是切開的瞬間香氣衝上來，' +
                             '比第一爐好吃太多。你沒辦法解釋為什麼 —— 但你的手記住了。'
                }
            ]
        },

        /* ---------- 第三章：資訊社線 ---------- */
        'code3': {
            chapter: '第三章 ・ 有人找上門',
            text: '訊息在半夜跳出來。學長要找人接一個案子，期限很趕；同一天，家裡的小店問你能不能幫忙拍菜單。兩個都想答應，但你只回得了一個。',
            options: [
                {
                    label: '接下第一個接案', desc: '客戶要一個響應式網站，兩週。',
                    axis: 'tech', bold: true, next: 'ch4',
                    outcome: '那兩週你幾乎沒出門。交件那天客戶只回了一句「跟我想的一樣」，' +
                             '你才發現自己緊張到手在抖。錢不多，但那是第一次有人因為你寫的東西付錢。'
                },
                {
                    label: '幫家裡的小店拍菜單', desc: '沒有酬勞，但那是你長大的地方。',
                    axis: 'life', next: 'ch4',
                    outcome: '你借了燈，在店裡跪著拍了一下午。新菜單掛上去的那週，媽媽傳了張照片給你，' +
                             '有客人正在拍那張菜單。她沒多說什麼，但那張照片她存了很久。'
                }
            ]
        },

        /* ---------- 第三章：烘焙社線 ---------- */
        'bake3': {
            chapter: '第三章 ・ 有人找上門',
            text: '訊息在半夜跳出來。有人在社群看到你的甜點，想訂三十份當婚禮小物；同一天，系上找你幫忙做迎新的網頁。兩個都想答應，但你只做得完一個。',
            options: [
                {
                    label: '接下系上的網頁', desc: '你其實沒把握，但你想知道自己做不做得到。',
                    axis: 'tech', bold: true, next: 'ch4',
                    outcome: '你邊查邊做，改了不知道幾版。迎新那天網頁在投影幕上打開，底下有人「喔」了一聲。' +
                             '那一聲很短，你記到現在。'
                },
                {
                    label: '接下三十份婚禮小物', desc: '三十份，你只做過六份。',
                    axis: 'life', next: 'ch4',
                    outcome: '你連做兩天，最後五份是趴在桌上包完的。新娘傳照片來的時候，你正在洗第四輪的鋼盆。' +
                             '你太累了，笑不出來，可是心裡有個地方是滿的。'
                }
            ]
        },

        /* ---------- 第四章：兩條線在這裡會合，然後再分岔 ---------- */
        'ch4': {
            chapter: '第四章 ・ 分岔',
            text: '大三下，時間只夠投一個。兩份實習都在收履歷，截止日是同一天。',
            options: [
                {
                    label: '投測試工程師的實習', desc: '你想知道自己寫的東西，別人會怎麼弄壞它。',
                    axis: 'tech', next: 'office5',
                    outcome: '面試官問你「你覺得什麼叫做好」。你想了三秒，說「是別人怎麼弄都弄不壞」。' +
                             '他笑了一下，在紙上寫了什麼。一週後你收到信。'
                },
                {
                    label: '投飯店西點房的實習', desc: '早上五點上班，站一整天。',
                    axis: 'life', bold: true, next: 'kitchen5',
                    outcome: '第一天你切壞了半盤慕斯，主廚只說「再一次」。第五天你切出整齊的十六等分，' +
                             '他什麼也沒說，只是把下一盤推過來。你懂了，那就是通過。'
                }
            ]
        },

        /* ---------- 第五章：實習線 ---------- */
        'office5': {
            chapter: '第五章 ・ 實習的第一週',
            text: '上線前一天，你測出一個 bug。不算嚴重，但要修就得延期，而所有人都已經很累了。',
            options: [
                {
                    label: '說出來，寧可延期', desc: '它現在不嚴重，但你知道它什麼時候會變嚴重。',
                    axis: 'tech', bold: true, next: 'ch6',
                    outcome: '會議室安靜了幾秒，最後 PM 說「那就延兩天」。上線之後沒有人提起這件事 —— ' +
                             '因為沒有出事。你第一次感覺到，沒有發生的事情也是一種成果。'
                },
                {
                    label: '記錄下來，等下一版再修', desc: '它現在真的不會壞，而大家真的很累。',
                    axis: 'life', next: 'ch6',
                    outcome: '你把它寫進待辦，標了黃色。三個月後它還在那裡，只是被你改成紅色。' +
                             '你學到的是：有些事情不會自己消失，它只是在等你。'
                }
            ]
        },

        /* ---------- 第五章：西點房線 ---------- */
        'kitchen5': {
            chapter: '第五章 ・ 出餐的第一週',
            text: '出餐尖峰，你發現自己前一盤的醬汁調鹹了。那桌已經動筷，客人沒有任何反應。',
            options: [
                {
                    label: '走出去，重做一盤', desc: '客人沒說話，不代表沒差。',
                    axis: 'tech', bold: true, next: 'ch6',
                    outcome: '你端新的那盤過去，客人愣了一下，說「其實我覺得還好耶」。回到廚房，' +
                             '主廚沒罵你浪費，只說「下次先嚐再出」。標準是你自己定的，這件事沒有人會替你定。'
                },
                {
                    label: '記住這個手感，繼續出下一盤', desc: '現在停下來，後面十桌會全部延遲。',
                    axis: 'life', next: 'ch6',
                    outcome: '那晚收工後你在筆記本上寫了一行：鹽，右手，兩指，別抖。之後你再也沒調鹹過。' +
                             '有些教訓不用讓別人知道，只要自己記得。'
                }
            ]
        },

        /* ---------- 第六章 ---------- */
        'ch6': {
            chapter: '第六章 ・ 有人問你',
            text: '學弟妹傳訊息來：「學姊，我不知道自己該走技術，還是走喜歡的那條。」你看著這行字，發現這是你三年前問過自己的。',
            options: [
                {
                    label: '叫他先把一件事做到底', desc: '半途而廢的東西，不會在手上留下任何手感。',
                    axis: 'tech', next: 'ch7',
                    outcome: '他真的照做了。半年後傳來他的第一個作品，粗糙但完整。他說「原來做完跟做一半差這麼多」。' +
                             '你回了個貼圖，心裡卻在想 —— 這句話當年也有人跟你說過。'
                },
                {
                    label: '叫他兩個都做，做久了會合起來', desc: '你自己就是這樣走過來的，雖然當時看起來很像在浪費時間。',
                    axis: 'life', bold: true, next: 'ch7',
                    outcome: '他半信半疑，但兩邊都留著。一年後他傳來一個用程式做的食譜網站，說' +
                             '「學姊你講的那個合起來，我好像看到了」。你看著螢幕笑了很久。'
                }
            ]
        },

        /* ---------- 第七章：最後一題，選完就是結局 ---------- */
        'ch7': {
            chapter: '第七章 ・ 最後一個暑假',
            text: '畢業前的最後一個長假。行事曆上一片空白，等你填。',
            options: [
                {
                    label: '把這幾年整理成一個作品集', desc: '你想讓別人一眼看懂你是誰。',
                    axis: 'tech',
                    outcome: '你花了整個暑假，刪掉的比留下的多。最後那個網站不長，但每一頁都是你真的做過的事。' +
                             '按下上線的那天，你第一次覺得自己不是「還在學」的人。'
                },
                {
                    label: '去一趟沒有計畫的旅行', desc: '不查攻略，不訂回程。',
                    axis: 'life', bold: true,
                    outcome: '你在一個沒聽過的小鎮住了六天，最後一天在市場買了一包香料，攤販說不出它的英文名字。' +
                             '你到現在還留著。有些東西沒辦法整理進作品集，但它們也是你。'
                }
            ]
        }
    };

    /* 結局用的圖示。每個是一段畫在 0 0 64 64 方框裡的 SVG */
    var ICONS = {
        gear: '<circle cx="32" cy="32" r="11" fill="none" stroke="currentColor" stroke-width="3.5"/>' +
              '<g stroke="currentColor" stroke-width="3.5" stroke-linecap="round">' +
              '<path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M49 15l-6 6M21 43l-6 6"/></g>',
        anchor: '<circle cx="32" cy="14" r="6" fill="none" stroke="currentColor" stroke-width="3.5"/>' +
              '<path d="M32 20v32M18 34h28M14 42a18 18 0 0 0 36 0" fill="none" stroke="currentColor" ' +
              'stroke-width="3.5" stroke-linecap="round"/>',
        shell: '<path d="M32 54C18 44 10 32 10 24a22 22 0 0 1 44 0c0 8-8 20-22 30Z" fill="none" ' +
              'stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>' +
              '<path d="M32 54V10M32 54c-6-12-10-26-10-38M32 54c6-12 10-26 10-38" fill="none" ' +
              'stroke="currentColor" stroke-width="2.4" opacity=".7"/>',
        leaf: '<path d="M52 12C28 12 14 26 14 44c0 4 1 7 2 9 3-16 15-26 30-30-12 6-21 15-25 30 20 2 33-12 33-30 0-4 0-8-2-11Z" ' +
              'fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>',
        wave: '<path d="M6 26c7-8 15-8 22 0s15 8 22 0 8-6 8-6" fill="none" stroke="currentColor" ' +
              'stroke-width="3.5" stroke-linecap="round"/>' +
              '<path d="M6 40c7-8 15-8 22 0s15 8 22 0 8-6 8-6" fill="none" stroke="currentColor" ' +
              'stroke-width="3.5" stroke-linecap="round" opacity=".65"/>' +
              '<path d="M6 54c7-8 15-8 22 0s15 8 22 0 8-6 8-6" fill="none" stroke="currentColor" ' +
              'stroke-width="3.5" stroke-linecap="round" opacity=".35"/>',
        compass: '<circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="3.5"/>' +
              '<path d="M42 22 27 27l-5 15 15-5Z" fill="none" stroke="currentColor" stroke-width="3.5" ' +
              'stroke-linejoin="round"/><circle cx="32" cy="32" r="2.6" fill="currentColor"/>',
        /* 燈塔：給「一步都沒踩空」的隱藏結局 */
        lighthouse: '<path d="M24 26h16l3 30H21Z" fill="none" stroke="currentColor" stroke-width="3.5" ' +
              'stroke-linejoin="round"/><path d="M22 26h20M20 56h24" fill="none" stroke="currentColor" ' +
              'stroke-width="3.5" stroke-linecap="round"/>' +
              '<path d="M27 26v-8h10v8" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>' +
              '<path d="M32 18V9M14 16l6 3M50 16l-6 3" fill="none" stroke="currentColor" ' +
              'stroke-width="3" stroke-linecap="round" opacity=".7"/>'
    };

    var ENDINGS = {
        tech6: {
            icon: 'gear', color: '#4FB3D9',
            title: '深海工程師',
            text: '七次分岔，你幾乎每一次都投進同一個方向，於是走得比誰都深。' +
                  '別人還在看海面的時候，你已經知道那底下的結構怎麼撐起來。' +
                  '偶爾會有人問你「不累嗎」，你想了想，說：專注本身就是一種休息。'
        },
        tech5: {
            icon: 'anchor', color: '#1C7CB8',
            title: '穩健的建造者',
            text: '你大部分時候選了那條看得見盡頭的路，但總會留一點空間給別的事。' +
                  '你蓋出來的東西不花俏，可是站得住。' +
                  '很多年後你會發現，那一點點的「留白」，才是讓你沒有被沖走的錨。'
        },
        balance: {
            icon: 'shell', color: '#17708A',
            title: '跨界的生活藝術家',
            text: '技術和生活，你一次都沒有真的放掉哪一邊。' +
                  '所以你寫程式的時候會想到火候，做菜的時候會想到流程。' +
                  '別人覺得那是兩件事，只有你知道，那從頭到尾都是同一件事：把事情做好，然後做得好看。'
        },
        life5: {
            icon: 'leaf', color: '#0E7C9B',
            title: '用五感生活的人',
            text: '你比較常選那個「當下比較想做」的選項。' +
                  '於是你的人生沒有很整齊，但每一段都有味道、有顏色、有聲音。' +
                  '你記得的不是完成了什麼，而是那天的光線是什麼樣子。'
        },
        life6: {
            icon: 'wave', color: '#A8DCF0',
            title: '把日子過成作品',
            text: '你幾乎沒有選過那條比較「應該」的路。' +
                  '有人替你可惜，但你清楚自己在做什麼 —— 你不是在逃避什麼，你是在收集什麼。' +
                  '最後那些看起來沒有用的東西，全部變成了只有你做得出來的那個味道。'
        },
        bold: {
            icon: 'compass', color: '#FFF3CE',
            title: '跳進未知的人　★ 隱藏結局',
            text: '七次分岔，你每一次都選了比較不確定的那一邊。' +
                  '你不是不怕，你只是更怕站在原地。' +
                  '所以你的人生沒有地圖，但你一直在往前 —— 而那些沒有地圖的地方，後來都變成了你的路。'
        },
        steady: {
            icon: 'lighthouse', color: '#F0B36B',
            title: '一步都沒踩空的人　★ 隱藏結局',
            text: '七次分岔，你每一次都挑了看得比較清楚的那一邊。' +
                  '有人說那是保守，你知道不是 —— 你不是不敢跳，你是先把橋蓋好再走。' +
                  '所以你走得慢，卻一次都沒有掉下去；而那些跟在你後面的人，也都平安到了對岸。'
        }
    };

    /* 依照最後的分數挑一個結局 */
    function pickEnding() {
        if (bold === TOTAL) return ENDINGS.bold;      // 七次全選大膽的
        if (bold === 0)     return ENDINGS.steady;    // 七次全不選大膽的
        if (tech >= 6) return ENDINGS.tech6;
        if (tech === 5) return ENDINGS.tech5;
        if (tech >= 3) return ENDINGS.balance;        // 3 或 4
        if (tech === 2) return ENDINGS.life5;
        return ENDINGS.life6;                          // 0 或 1
    }

    /* ================= 以下是程式，改故事不用動 ================= */

    var overlay = null, stageEl = null, dotsEl = null, chapterEl = null;
    var nodeId = START, step = 0, tech = 0, life = 0, bold = 0, history = [];

    function el(tag, cls, html) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html !== undefined) n.innerHTML = html;
        return n;
    }

    function build() {
        overlay = document.getElementById('life-overlay');
        if (!overlay) return false;
        stageEl   = overlay.querySelector('[data-life="stage"]');
        dotsEl    = overlay.querySelector('[data-life="dots"]');
        chapterEl = overlay.querySelector('[data-life="chapter"]');
        stageEl.addEventListener('scroll', updateFade);
        window.addEventListener('resize', updateFade);
        return true;
    }

    function reset() {
        nodeId = START; step = 0; tech = 0; life = 0; bold = 0; history = [];
    }

    /* 內容比視窗高的時候（例如結局那頁），底部加一層漸層提示還可以往下捲。
       捲到最底就把提示拿掉，不然最後一行會一直霧霧的。 */
    function updateFade() {
        var more = stageEl.scrollHeight > stageEl.clientHeight + 4 &&
                   stageEl.scrollTop + stageEl.clientHeight < stageEl.scrollHeight - 4;
        stageEl.classList.toggle('has-more', more);
    }

    /* 換畫面時讓淡入動畫重播一次（不重設的話 CSS 動畫只會播第一次） */
    function replay() {
        stageEl.scrollTop = 0;
        stageEl.style.animation = 'none';
        void stageEl.offsetWidth;          // 強制瀏覽器重算，動畫才會重新開始
        stageEl.style.animation = '';
        updateFade();
    }

    function drawDots() {
        dotsEl.innerHTML = '';
        for (var i = 0; i < TOTAL; i++) {
            dotsEl.appendChild(el('span',
                'life-dot' + (i < step ? ' done' : (i === step ? ' now' : ''))));
        }
    }

    function btn(label, cls, fn) {
        var b = el('button', cls || 'game-btn', label);
        b.type = 'button';
        b.addEventListener('click', fn);
        return b;
    }

    /* ---------- 開頭 ---------- */
    function showIntro() {
        chapterEl.textContent = '潮汐之間';
        dotsEl.innerHTML = '';
        stageEl.innerHTML = '';
        stageEl.appendChild(el('p', 'life-text',
            '七個路口，七次選擇。<br>沒有正確答案，只有你會走成什麼樣子。'));
        stageEl.appendChild(el('p', 'life-hint',
            '前面選的會影響後面遇到的場景，走兩次不會一樣。'));
        stageEl.appendChild(btn('開始', null, function () { reset(); showQuestion(); }));
        replay();
    }

    /* ---------- 出題 ---------- */
    function showQuestion() {
        var node = NODES[nodeId];
        if (!node) { showEnding(); return; }

        chapterEl.textContent = node.chapter;
        drawDots();

        stageEl.innerHTML = '';
        stageEl.appendChild(el('p', 'life-text', node.text));

        var wrap = el('div', 'life-options');
        node.options.forEach(function (o) {
            var b = el('button', 'life-option');
            b.type = 'button';
            b.innerHTML = '<strong>' + o.label + '</strong><span>' + o.desc + '</span>';
            b.addEventListener('click', function () { choose(node, o); });
            wrap.appendChild(b);
        });
        stageEl.appendChild(wrap);
        replay();
    }

    function choose(node, o) {
        if (o.axis === 'tech') tech++; else life++;
        if (o.bold) bold++;
        history.push({ chapter: node.chapter, label: o.label });
        step++;
        nodeId = o.next || null;
        showOutcome(node, o);
    }

    /* ---------- 選完之後發生了什麼 ---------- */
    function showOutcome(node, o) {
        chapterEl.textContent = node.chapter;
        drawDots();

        stageEl.innerHTML = '';
        stageEl.appendChild(el('p', 'life-choice', '你選了　' + o.label));
        stageEl.appendChild(el('p', 'life-text life-outcome', o.outcome));
        stageEl.appendChild(btn(nodeId ? '繼續' : '看看你走成什麼樣子', null, function () {
            if (nodeId) showQuestion(); else showEnding();
        }));
        replay();
    }

    /* ---------- 結局 ---------- */
    function showEnding() {
        var e = pickEnding();
        chapterEl.textContent = '結局';
        drawDots();

        stageEl.innerHTML = '';

        var icon = el('div', 'life-icon');
        icon.style.color = e.color;
        icon.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true">' + ICONS[e.icon] + '</svg>';
        stageEl.appendChild(icon);

        stageEl.appendChild(el('h3', 'life-title', e.title));
        stageEl.appendChild(el('p', 'life-text', e.text));

        /* 這一路走過來的七個選擇 */
        var recap = el('div', 'life-recap');
        recap.appendChild(el('p', 'life-recap-title', '你走過的路'));
        history.forEach(function (h) {
            var row = el('div', 'life-recap-row');
            row.appendChild(el('span', 'life-recap-ch', h.chapter));
            row.appendChild(el('span', 'life-recap-pick', h.label));
            recap.appendChild(row);
        });
        stageEl.appendChild(recap);

        stageEl.appendChild(el('p', 'life-score',
            '技術 ' + tech + '　・　生活 ' + life + '　・　大膽 ' + bold));

        stageEl.appendChild(btn('再走一次', null, function () { reset(); showQuestion(); }));
        stageEl.appendChild(el('p', 'life-hint', '共有 7 種結局，其中兩個藏得比較深。'));
        replay();
    }

    /* ---------- 開關 ---------- */
    window.openLife = function () {
        if (!overlay && !build()) return;
        overlay.classList.add('open');
        reset();
        showIntro();      // 每次打開都從頭開始，不會卡在上次的畫面
    };

    window.closeLife = function () {
        if (overlay) overlay.classList.remove('open');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();
