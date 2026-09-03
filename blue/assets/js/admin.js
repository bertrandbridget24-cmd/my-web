/* =========================================================
   admin.js — 後台編輯器
   Catherine 個人網站 — 海洋藍主題套件

   做什麼：
     1. 讀取 assets/js/site-data.js 的現有內容
     2. 用表單編輯（新增／刪除／上下移動卡片、換圖、改文字）
     3. 邊改邊存草稿到瀏覽器，可以隨時「預覽網站」看實際效果
     4. 按「匯出 site-data.js」下載檔案，蓋回 assets/js/ 就正式更新

   ★ 密碼只是擋一下隨手亂改，看原始碼就會知道，不是真正的安全機制。
   ========================================================= */

(function () {
    'use strict';

    var PASSWORD  = 'catherine';                    // ← 想改密碼就改這一行
    var DRAFT_KEY = 'catherine-site-draft';

    var data = null;      // 目前編輯中的資料
    var pristine = null;  // site-data.js 原本的內容，用來「還原成預設」
    var current = 'home';

    /* ---------- 小工具 ---------- */
    function el(tag, cls, html) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html !== undefined) n.innerHTML = html;
        return n;
    }
    function clone(o) { return JSON.parse(JSON.stringify(o)); }
    function $(sel) { return document.querySelector(sel); }

    var toastT = 0;
    function toast(msg) {
        var t = $('#toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(toastT);
        toastT = setTimeout(function () { t.classList.remove('show'); }, 2200);
    }

    /* ---------- 欄位定義 ----------
       t: text 單行 / area 多行 / lines 多行→陣列 / tags 逗號→陣列
          image 圖片 / select 下拉 / list 可重複的項目                     */
    var SCHEMA = [
        { key: 'home', path: 'home', label: '首頁', fields: [
            { g: 'Hero 首屏' },
            { k: 'heroEyebrow', t: 'text', label: '小標（Catherine · Portfolio）' },
            { k: 'heroTitle',   t: 'text', label: '主標題' },
            { k: 'heroLead',    t: 'area', label: '副標' },
            { k: 'heroBtn1Text', t: 'text', label: '左按鈕文字' },
            { k: 'heroBtn1Href', t: 'text', label: '左按鈕連結' },
            { k: 'heroBtn2Text', t: 'text', label: '右按鈕文字' },
            { k: 'heroBtn2Href', t: 'text', label: '右按鈕連結' },
            { g: '我的理念' },
            { k: 'introEyebrow', t: 'text', label: '英文小標' },
            { k: 'introTitle',   t: 'text', label: '標題' },
            { k: 'introParas',   t: 'lines', label: '內文（一行一句；留一整行空白＝空一行）' },
            { g: '精選作品與服務' },
            { k: 'worksEyebrow', t: 'text', label: '英文小標' },
            { k: 'worksTitle',   t: 'text', label: '標題' },
            { k: 'cards', t: 'list', label: '卡片', name: 'title', item: [
                { k: 'img',     t: 'image', label: '圖片' },
                { k: 'eyebrow', t: 'text',  label: '分類小標（英文）' },
                { k: 'title',   t: 'text',  label: '標題' },
                { k: 'desc',    t: 'area',  label: '描述' },
                { k: 'more',    t: 'text',  label: '底部連結文字' },
                { k: 'href',    t: 'text',  label: '連到哪一頁' }
            ]},
            { g: '結尾聯絡區' },
            { k: 'ctaTitle',   t: 'text', label: '標題' },
            { k: 'ctaText',    t: 'area', label: '內文' },
            { k: 'ctaBtnText', t: 'text', label: '按鈕文字' },
            { k: 'ctaBtnHref', t: 'text', label: '按鈕連結' }
        ]},

        { key: 'about', path: 'about', label: '個人介紹', fields: [
            { g: '標題橫幅' },
            { k: 'bannerTitle',    t: 'text', label: '大標題' },
            { k: 'bannerSubtitle', t: 'area', label: '副標' },
            { g: '個人資料' },
            { k: 'photo',    t: 'image', label: '頭像' },
            { k: 'photoAlt', t: 'text',  label: '頭像替代文字' },
            { k: 'name',     t: 'text',  label: '名字' },
            { k: 'nickname', t: 'area',  label: '暱稱那一行' },
            { g: '我的核心理念' },
            { k: 'creedTitle', t: 'text',  label: '區塊標題' },
            { k: 'creedParas', t: 'lines', label: '內文（一行一段）' },
            { g: '專業技能與熱情' },
            { k: 'skillsTitle', t: 'text', label: '區塊標題' },
            { k: 'skillGroups', t: 'list', label: '技能群組', name: 'title', item: [
                { k: 'title', t: 'text', label: '群組名稱' },
                { k: 'style', t: 'select', label: '標籤顏色', options: [
                    { v: 'web', label: '海洋藍（網頁技術）' },
                    { v: 'cooking', label: '深海藍（烹飪生活）' }
                ]},
                { k: 'tags', t: 'lines', label: '技能項目（一行一個）' }
            ]},
            { g: '經歷與里程碑' },
            { k: 'timelineTitle', t: 'text', label: '區塊標題' },
            { k: 'timeline', t: 'list', label: '經歷', name: 'title', item: [
                { k: 'title', t: 'text', label: '職稱／學歷' },
                { k: 'href',  t: 'text', label: '網址（選填，填了標題就變成可以點的連結）' },
                { k: 'meta',  t: 'text', label: '年份與說明' }
            ]},
            { g: '結尾聯絡區' },
            { k: 'ctaTitle',   t: 'text', label: '標題' },
            { k: 'ctaText',    t: 'area', label: '內文' },
            { k: 'ctaBtnText', t: 'text', label: '按鈕文字' },
            { k: 'ctaBtnHref', t: 'text', label: '按鈕連結' }
        ]},

        { key: 'cooking', path: 'cooking', label: '烹飪作品', fields: [
            { g: '標題橫幅' },
            { k: 'bannerTitle',    t: 'text', label: '大標題' },
            { k: 'bannerSubtitle', t: 'area', label: '副標' },
            { g: '分類按鈕' },
            { k: 'categories', t: 'list', label: '分類', name: 'label', item: [
                { k: 'label', t: 'text', label: '顯示文字' },
                { k: 'key',   t: 'text', label: '代號（英文，要跟卡片的分類一致）' }
            ]},
            { g: '食譜卡片' },
            { k: 'cards', t: 'list', label: '食譜', name: 'title', item: [
                { k: 'img',      t: 'image', label: '圖片' },
                { k: 'title',    t: 'text',  label: '名稱' },
                { k: 'desc',     t: 'area',  label: '描述' },
                { k: 'category', t: 'text',  label: '分類代號（對應上面的代號）' }
            ]}
        ]},

        { key: 'webDesign', path: 'webDesign', label: '網頁作品', fields: [
            { g: '標題橫幅' },
            { k: 'bannerTitle',    t: 'text', label: '大標題' },
            { k: 'bannerSubtitle', t: 'area', label: '副標' },
            { g: '專案卡片' },
            { k: 'cards', t: 'list', label: '專案', name: 'title', item: [
                { k: 'img',       t: 'image', label: '截圖' },
                { k: 'alt',       t: 'text',  label: '圖片替代文字' },
                { k: 'title',     t: 'text',  label: '專案名稱' },
                { k: 'desc',      t: 'area',  label: '說明' },
                { k: 'tags',      t: 'tags',  label: '技術標籤（用逗號分隔）' },
                { k: 'liveText',  t: 'text',  label: '網站連結文字' },
                { k: 'liveHref',  t: 'text',  label: '網站網址' },
                { k: 'repoText',  t: 'text',  label: '原始碼連結文字' },
                { k: 'repoHref',  t: 'text',  label: '原始碼網址' }
            ]},
            { g: '結尾聯絡區' },
            { k: 'ctaTitle',   t: 'text', label: '標題' },
            { k: 'ctaText',    t: 'area', label: '內文' },
            { k: 'ctaBtnText', t: 'text', label: '按鈕文字' },
            { k: 'ctaBtnHref', t: 'text', label: '按鈕連結' }
        ]},

        { key: 'otherWorks', path: 'otherWorks', label: '其他作品', fields: [
            { g: '標題橫幅' },
            { k: 'bannerTitle',    t: 'text', label: '大標題' },
            { k: 'bannerSubtitle', t: 'area', label: '副標' },
            { g: '作品卡片' },
            { k: 'cards', t: 'list', label: '作品', name: 'title', item: [
                { k: 'img',   t: 'image', label: '圖片' },
                { k: 'alt',   t: 'text',  label: '圖片替代文字' },
                { k: 'title', t: 'text',  label: '作品名稱' },
                { k: 'desc',  t: 'area',  label: '說明' },
                { k: 'tags',  t: 'tags',  label: '標籤（用逗號分隔）' },
                { k: 'href',  t: 'text',  label: '點擊後連到哪一頁' }
            ]}
        ]},

        { key: 'services', path: 'services', label: '其他服務', fields: [
            { g: '標題橫幅' },
            { k: 'bannerTitle',    t: 'text', label: '大標題' },
            { k: 'bannerSubtitle', t: 'area', label: '副標' },
            { g: '服務卡片' },
            { k: 'cards', t: 'list', label: '服務', name: 'title', item: [
                { k: 'title', t: 'text', label: '服務名稱' },
                { k: 'style', t: 'select', label: '卡片色系', options: [
                    { v: 'web', label: '海洋藍（技術類）' },
                    { v: 'culinary', label: '深海藍（烹飪類）' }
                ]},
                { k: 'desc',    t: 'area',  label: '說明' },
                { k: 'items',   t: 'lines', label: '服務項目（一行一個）' },
                { k: 'btnText', t: 'text',  label: '按鈕文字' },
                { k: 'btnHref', t: 'text',  label: '按鈕連結' }
            ]},
            { g: '結尾聯絡區' },
            { k: 'ctaTitle',   t: 'text', label: '標題' },
            { k: 'ctaText',    t: 'area', label: '內文' },
            { k: 'ctaBtnText', t: 'text', label: '按鈕文字' },
            { k: 'ctaBtnHref', t: 'text', label: '按鈕連結' }
        ]},

        { key: 'nightsky', path: 'services.nightsky', label: '夜空星星', fields: [
            { g: '月亮與星星' },
            { k: 'moon',     t: 'text',  label: '月亮顯示的字（留空＝不放月亮）' },
            { k: 'stars',    t: 'lines', label: '星星（一行一顆，最多 8 顆）', rerender: true },
            { k: 'games',    t: 'gamemap', label: '每顆星星要藏哪個遊戲' }
        ]}
    ];

    /* ---------- 取得某個區段的資料物件 ---------- */
    function seg(path) {
        var parts = path.split('.'), d = data, i;
        for (i = 0; i < parts.length; i++) d = d[parts[i]];
        return d;
    }

    /* ---------- 草稿：邊改邊存，關掉分頁也不會不見 ---------- */
    function saveDraft() {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
            $('#status').textContent = '草稿已存 ' + new Date().toLocaleTimeString('zh-TW');
        } catch (e) {
            $('#status').textContent = '（這個瀏覽器不能存草稿，記得直接匯出）';
        }
    }

    function changed() { saveDraft(); }

    /* ---------- 建立各種欄位 ---------- */
    function textField(obj, f) {
        var wrap = el('div', 'field');
        wrap.appendChild(el('label', null, f.label));
        var input;
        if (f.t === 'area' || f.t === 'lines') {
            input = el('textarea');
            input.rows = f.t === 'lines' ? 5 : 3;
            input.value = f.t === 'lines' ? (obj[f.k] || []).join('\n') : (obj[f.k] || '');
        } else if (f.t === 'tags') {
            input = el('input'); input.type = 'text';
            input.value = (obj[f.k] || []).join('、');
        } else if (f.t === 'select') {
            input = el('select');
            f.options.forEach(function (o) {
                var opt = el('option', null, o.label);
                opt.value = o.v;
                input.appendChild(opt);
            });
            input.value = obj[f.k] || f.options[0].v;
        } else {
            input = el('input'); input.type = 'text';
            input.value = obj[f.k] || '';
        }
        input.addEventListener('input', function () {
            if (f.t === 'lines') obj[f.k] = input.value.split('\n');
            else if (f.t === 'tags') obj[f.k] = input.value.split(/[、,，]/).map(function (t) { return t.trim(); }).filter(Boolean);
            else obj[f.k] = input.value;
            changed();
        });
        input.addEventListener('change', function () {
            input.dispatchEvent(new Event('input'));
            // 星星名單這種會影響其他欄位的，改完要重畫整個區段
            if (f.rerender) renderSection();
        });
        wrap.appendChild(input);
        if (f.hint) wrap.appendChild(el('div', 'hint', f.hint));
        return wrap;
    }

    /* 圖片：可以從現有檔名挑，也可以直接拖圖進來 */
    function imageField(obj, f) {
        var wrap = el('div', 'field');
        wrap.appendChild(el('label', null, f.label));

        var row = el('div', 'img-field');
        var prev = el('div', 'img-prev');
        var col = el('div', 'col');

        var sel = el('select');
        var opt0 = el('option', null, '— 挑一個資料夾裡的圖 —');
        opt0.value = '';
        sel.appendChild(opt0);
        (data.images || []).forEach(function (src) {
            var o = el('option', null, src.replace('assets/img/', ''));
            o.value = src;
            sel.appendChild(o);
        });
        if ((data.images || []).indexOf(obj[f.k]) >= 0) sel.value = obj[f.k];

        var drop = el('div', 'drop', '或把圖片拖進來 / 點這裡選檔（會自動壓縮）');

        function paint() {
            prev.style.backgroundImage = obj[f.k] ? 'url("' + obj[f.k] + '")' : 'none';
        }

        sel.addEventListener('change', function () {
            if (sel.value) { obj[f.k] = sel.value; paint(); changed(); }
        });

        // 拖曳或選檔 → 壓縮成寬度最多 1200px 的 JPEG，再轉 base64 存進資料檔
        function useFile(file) {
            if (!file || !/^image\//.test(file.type)) { toast('請放圖片檔'); return; }
            var reader = new FileReader();
            reader.onload = function () {
                var img = new Image();
                img.onload = function () {
                    var max = 1200;
                    var w = img.width, h = img.height;
                    if (w > max) { h = Math.round(h * max / w); w = max; }
                    var cv = document.createElement('canvas');
                    cv.width = w; cv.height = h;
                    cv.getContext('2d').drawImage(img, 0, 0, w, h);
                    obj[f.k] = cv.toDataURL('image/jpeg', 0.82);
                    sel.value = '';
                    paint(); changed();
                    toast('圖片已壓縮並嵌入（' + Math.round(obj[f.k].length / 1024) + ' KB）');
                };
                img.onerror = function () { toast('這個圖檔讀不起來'); };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }

        drop.addEventListener('click', function () {
            var inp = el('input'); inp.type = 'file'; inp.accept = 'image/*';
            inp.addEventListener('change', function () { useFile(inp.files[0]); });
            inp.click();
        });
        drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('over'); });
        drop.addEventListener('dragleave', function () { drop.classList.remove('over'); });
        drop.addEventListener('drop', function (e) {
            e.preventDefault(); drop.classList.remove('over');
            useFile(e.dataTransfer.files[0]);
        });

        col.appendChild(sel);
        col.appendChild(drop);
        row.appendChild(prev);
        row.appendChild(col);
        wrap.appendChild(row);
        paint();
        return wrap;
    }

    /* 星星→遊戲的對應：每顆星星一個下拉選單 */
    var GAME_OPTIONS = [
        { v: '',         label: '（沒有遊戲）' },
        { v: 'starship', label: '飛船射擊 深海巡航' },
        { v: 'fishing',  label: '釣魚 淺海垂釣' },
        { v: 'maze',     label: '迷宮 深海迷宮' },
        { v: 'life',     label: '人生選擇 潮汐之間' }
    ];

    function gameMapField(obj, f) {
        var box = el('div');
        box.appendChild(el('div', 'hint',
            '同一個遊戲可以掛在多顆星星上。改完星星名單後回到這裡，下面的清單會跟著更新。'));

        var stars = (seg('services.nightsky').stars || []);
        var map = obj[f.k] || (obj[f.k] = {});

        // 星星被刪掉的話，順手把殘留的對應清掉
        Object.keys(map).forEach(function (k) { if (stars.indexOf(k) < 0) delete map[k]; });

        stars.forEach(function (star) {
            var wrap = el('div', 'field');
            wrap.appendChild(el('label', null, '★ ' + star));
            var sel = el('select');
            GAME_OPTIONS.forEach(function (o) {
                var opt = el('option', null, o.label);
                opt.value = o.v;
                sel.appendChild(opt);
            });
            sel.value = map[star] || '';
            sel.addEventListener('change', function () {
                if (sel.value) map[star] = sel.value; else delete map[star];
                changed();
            });
            wrap.appendChild(sel);
            box.appendChild(wrap);
        });

        if (!stars.length) box.appendChild(el('div', 'hint', '目前沒有星星，先到上面新增。'));
        return box;
    }

    /* 可重複的項目清單 */
    function listField(obj, f) {
        var box = el('div');
        var head = el('div', 'field');
        head.appendChild(el('label', null, f.label + '（共 ' + (obj[f.k] || []).length + ' 筆）'));
        box.appendChild(head);

        var host = el('div');
        box.appendChild(host);

        function blank() {
            var o = {};
            f.item.forEach(function (it) {
                o[it.k] = (it.t === 'lines' || it.t === 'tags') ? [] :
                          (it.t === 'select' ? it.options[0].v : '');
            });
            return o;
        }

        function draw() {
            host.innerHTML = '';
            var list = obj[f.k] || (obj[f.k] = []);
            list.forEach(function (item, i) {
                var card = el('div', 'item');
                var bar = el('div', 'item-bar');
                bar.appendChild(el('strong', null,
                    (i + 1) + '. ' + (item[f.name] || '（未命名）')));

                var up = el('button', 'btn btn-ghost btn-sm', '↑');
                up.title = '往上移';
                up.disabled = i === 0;
                up.onclick = function () {
                    list.splice(i - 1, 0, list.splice(i, 1)[0]); draw(); changed();
                };
                var down = el('button', 'btn btn-ghost btn-sm', '↓');
                down.title = '往下移';
                down.disabled = i === list.length - 1;
                down.onclick = function () {
                    list.splice(i + 1, 0, list.splice(i, 1)[0]); draw(); changed();
                };
                var del = el('button', 'btn btn-danger btn-sm', '刪除');
                del.onclick = function () {
                    if (!confirm('確定要刪除「' + (item[f.name] || '這一筆') + '」嗎？')) return;
                    list.splice(i, 1); draw(); changed(); toast('已刪除');
                };
                bar.appendChild(up); bar.appendChild(down); bar.appendChild(del);
                card.appendChild(bar);

                f.item.forEach(function (it) {
                    card.appendChild(it.t === 'image' ? imageField(item, it) : textField(item, it));
                });
                host.appendChild(card);
            });
            head.querySelector('label').textContent = f.label + '（共 ' + list.length + ' 筆）';
        }

        var add = el('button', 'btn btn-primary btn-sm', '＋ 新增一筆' + f.label);
        add.onclick = function () {
            (obj[f.k] || (obj[f.k] = [])).push(blank());
            draw(); changed(); toast('已新增，往下捲動填寫');
            host.lastChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        draw();
        box.appendChild(add);
        return box;
    }

    /* ---------- 畫出目前選到的區段 ---------- */
    function renderSection() {
        var def = SCHEMA.filter(function (s) { return s.key === current; })[0];
        var host = $('#form');
        host.innerHTML = '';
        var obj = seg(def.path);

        def.fields.forEach(function (f) {
            if (f.g) { host.appendChild(el('h3', 'sec', f.g)); return; }
            if (f.t === 'list')    { host.appendChild(listField(obj, f)); return; }
            if (f.t === 'image')   { host.appendChild(imageField(obj, f)); return; }
            if (f.t === 'gamemap') { host.appendChild(gameMapField(obj, f)); return; }
            host.appendChild(textField(obj, f));
        });

        document.querySelectorAll('.side button').forEach(function (b) {
            b.classList.toggle('on', b.dataset.key === current);
        });
        window.scrollTo(0, 0);
    }

    /* ---------- 匯出成 site-data.js ---------- */
    function exportFile() {
        var head = '/* =========================================================\n' +
            '   site-data.js — 網站內容資料檔\n' +
            '   由後台 admin.html 於 ' + new Date().toLocaleString('zh-TW') + ' 匯出\n' +
            '   把這個檔案蓋回 blue\\assets\\js\\ 就完成更新。\n' +
            '   ========================================================= */\n\n' +
            'window.SITE_DATA = ';
        var blob = new Blob([head + JSON.stringify(data, null, 4) + ';\n'],
                            { type: 'text/javascript;charset=utf-8' });
        var a = el('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'site-data.js';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        toast('已下載 site-data.js，記得蓋回 assets\\js\\ 資料夾');
    }

    /* ---------- 啟動 ---------- */
    function boot() {
        pristine = clone(window.SITE_DATA);
        var draft = null;
        try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch (e) {}
        data = draft || clone(window.SITE_DATA);
        if (draft) $('#status').textContent = '已載入上次未匯出的草稿';

        SCHEMA.forEach(function (s) {
            var b = el('button', null, s.label);
            b.dataset.key = s.key;
            b.onclick = function () { current = s.key; renderSection(); };
            $('#side-nav').appendChild(b);
        });

        $('#btn-export').onclick = exportFile;

        $('#btn-preview').onclick = function () {
            saveDraft();
            var map = { home: 'index.html', about: 'about.html', cooking: 'cooking.html',
                        webDesign: 'web-design.html', otherWorks: 'other-works.html',
                        services: 'services.html', nightsky: 'services.html' };
            window.open((map[current] || 'index.html') + '?draft=1', '_blank');
        };

        $('#btn-reset').onclick = function () {
            if (!confirm('會丟掉所有還沒匯出的修改，回到 site-data.js 目前的內容。確定嗎？')) return;
            data = clone(pristine);
            try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
            renderSection();
            toast('已還原');
        };

        renderSection();
    }

    /* ---------- 密碼 ---------- */
    function gate() {
        var box = $('#gate'), inp = $('#pw'), err = $('#pw-err');
        function tryIn() {
            if (inp.value === PASSWORD) {
                box.hidden = true;
                boot();
            } else {
                err.textContent = '密碼不對';
                inp.select();
            }
        }
        $('#pw-go').onclick = tryIn;
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryIn(); });
        inp.focus();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', gate);
    } else {
        gate();
    }
})();
