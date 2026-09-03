/* =========================================================
   render.js — 依 site-data.js 產生頁面內容
   Catherine 個人網站 — 海洋藍主題套件

   HTML 只留空的容器，實際內容由這支程式填。用法：

     <h1 data-text="cooking.bannerTitle"></h1>        文字
     <a  data-text="home.heroBtn1Text"
         data-href="home.heroBtn1Href"></a>           文字＋連結
     <img data-src="about.photo" data-alt="about.photoAlt">
     <div data-list="cooking.cards"></div>            由對應的產生器填卡片

   ★ 一定要在 ocean.js 之前載入，
     因為卡片特效和夜空星星要等這裡把元素產生出來才抓得到。
   ========================================================= */

(function () {
    'use strict';

    /* 網址帶 ?draft=1 時，改用後台還沒匯出的草稿，方便即時預覽 */
    if (location.search.indexOf('draft=1') >= 0) {
        try {
            var draft = JSON.parse(localStorage.getItem('catherine-site-draft'));
            if (draft) {
                window.SITE_DATA = draft;
                console.info('[render.js] 目前顯示的是後台草稿，不是正式內容');
            }
        } catch (e) {}
    }

    /* 用 "a.b.c" 這種路徑去 SITE_DATA 裡取值 */
    function get(path) {
        var d = window.SITE_DATA;
        if (!d) return undefined;
        var parts = String(path).split('.'), i;
        for (i = 0; i < parts.length; i++) {
            if (d === null || d === undefined) return undefined;
            d = d[parts[i]];
        }
        return d;
    }

    /* 把使用者輸入的文字轉成安全的 HTML（避免 < > & 破壞版面） */
    function esc(t) {
        return String(t === undefined || t === null ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* ---------- 各區塊的產生器 ---------- */
    var BUILDERS = {

        /* 首頁：精選作品卡片 */
        'home.cards': function (list) {
            return list.map(function (c) {
                return '<a href="' + esc(c.href) + '" class="card" data-ocean="card-fx">' +
                    '<div class="card-img">' +
                        '<img src="' + esc(c.img) + '" alt="' + esc(c.alt || c.title) + '" class="preview-img-style">' +
                    '</div>' +
                    '<div class="card-body">' +
                        '<p class="eyebrow">' + esc(c.eyebrow) + '</p>' +
                        '<h3>' + esc(c.title) + '</h3>' +
                        '<p>' + esc(c.desc) + '</p>' +
                        '<div class="card-more">' + esc(c.more) + ' <span>→</span></div>' +
                    '</div>' +
                '</a>';
            }).join('');
        },

        /* 首頁：理念段落（空字串＝換一行空行） */
        'home.introParas': function (list) {
            return '<p>' + list.map(function (t) {
                return t === '' ? '<br>' : esc(t) + '<br>';
            }).join('') + '</p>';
        },

        /* 個人介紹：核心理念段落 */
        'about.creedParas': function (list) {
            return list.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
        },

        /* 個人介紹：技能群組 */
        'about.skillGroups': function (list) {
            return list.map(function (g) {
                var cls = g.style === 'cooking' ? 'skill-tag cooking' : 'skill-tag';
                return '<h3>' + esc(g.title) + '</h3>' +
                    '<ul class="skills-list">' +
                        (g.tags || []).map(function (t) {
                            return '<li class="' + cls + '">' + esc(t) + '</li>';
                        }).join('') +
                    '</ul>';
            }).join('');
        },

        /* 個人介紹：經歷時間軸 */
        'about.timeline': function (list) {
            return list.map(function (t) {
                // 有填 href 的話，標題變成可以點的連結
                var title = esc(t.title);
                if (t.href) {
                    title = '<a href="' + esc(t.href) + '" target="_blank" rel="noopener">' + title + '</a>';
                }
                return '<div class="timeline-item">' +
                    '<h4>' + title + '</h4>' +
                    '<p>' + esc(t.meta) + '</p>' +
                '</div>';
            }).join('');
        },

        /* 烹飪：分類按鈕 */
        'cooking.categories': function (list) {
            return list.map(function (c, i) {
                return '<button class="' + (i === 0 ? 'active' : '') + '" data-filter="' +
                       esc(c.key) + '">' + esc(c.label) + '</button>';
            }).join(' ');
        },

        /* 烹飪：食譜卡片 */
        'cooking.cards': function (list) {
            return list.map(function (c) {
                return '<article class="recipe-card" data-ocean="card-fx" data-category="' + esc(c.category) + '">' +
                    '<img src="' + esc(c.img) + '" alt="' + esc(c.title) + '" class="recipe-image">' +
                    '<div class="recipe-details">' +
                        '<h3>' + esc(c.title) + '</h3>' +
                        '<p>' + esc(c.desc) + '</p>' +
                    '</div>' +
                '</article>';
            }).join('');
        },

        /* 網頁作品：專案卡片 */
        'webDesign.cards': function (list) {
            return list.map(function (c) {
                var img = '<img src="' + esc(c.img) + '" alt="' + esc(c.alt || c.title) + '" class="project-image">';
                return '<article class="project-card" data-ocean="card-fx">' +
                    (c.liveHref
                        ? '<a href="' + esc(c.liveHref) + '" target="_blank" rel="noopener" style="display:block;">' + img + '</a>'
                        : img) +
                    '<div class="project-details">' +
                        '<h3>' + esc(c.title) + '</h3>' +
                        '<p>' + esc(c.desc) + '</p>' +
                        '<ul class="tech-tags">' +
                            (c.tags || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') +
                        '</ul>' +
                        '<div class="project-links">' +
                            (c.liveHref ? '<a href="' + esc(c.liveHref) + '" target="_blank" rel="noopener" class="link-primary">' + esc(c.liveText || '實際網站連結 →') + '</a>' : '') +
                            (c.repoHref ? '<a href="' + esc(c.repoHref) + '" target="_blank" rel="noopener" class="link-secondary">' + esc(c.repoText || 'GitHub Repo') + '</a>' : '') +
                        '</div>' +
                    '</div>' +
                '</article>';
            }).join('');
        },

        /* 其他作品：作品卡片 */
        'otherWorks.cards': function (list) {
            return list.map(function (c) {
                return '<div class="work-card" data-ocean="card-fx">' +
                    '<a href="' + esc(c.href) + '">' +
                        '<img src="' + esc(c.img) + '" alt="' + esc(c.alt || c.title) + '" class="work-image">' +
                        '<div class="work-details">' +
                            '<h3>' + esc(c.title) + '</h3>' +
                            '<p>' + esc(c.desc) + '</p>' +
                            (c.tags || []).map(function (t) {
                                return '<span class="work-tag">' + esc(t) + '</span>';
                            }).join('') +
                        '</div>' +
                    '</a>' +
                '</div>';
            }).join('');
        },

        /* 其他服務：服務卡片 */
        'services.cards': function (list) {
            return list.map(function (c) {
                var btnCls = c.style === 'culinary' ? 'contact-cta food' : 'contact-cta web';
                return '<div class="service-card' + (c.style === 'culinary' ? ' culinary' : '') + '">' +
                    '<h2>' + esc(c.title) + '</h2>' +
                    '<p>' + esc(c.desc) + '</p>' +
                    '<ul>' + (c.items || []).map(function (t) {
                        return '<li>' + esc(t) + '</li>';
                    }).join('') + '</ul>' +
                    '<a href="' + esc(c.btnHref) + '" class="' + btnCls + '">' + esc(c.btnText) + '</a>' +
                '</div>';
            }).join('');
        }
    };

    function render() {
        if (!window.SITE_DATA) {
            console.warn('[render.js] 找不到 site-data.js，頁面內容不會被填入');
            return;
        }

        // 純文字
        document.querySelectorAll('[data-text]').forEach(function (el) {
            var v = get(el.getAttribute('data-text'));
            if (v !== undefined) el.textContent = v;
        });

        // 連結
        document.querySelectorAll('[data-href]').forEach(function (el) {
            var v = get(el.getAttribute('data-href'));
            if (v !== undefined) el.setAttribute('href', v);
        });

        // 圖片
        document.querySelectorAll('[data-src]').forEach(function (el) {
            var v = get(el.getAttribute('data-src'));
            if (v !== undefined) el.setAttribute('src', v);
            var a = el.getAttribute('data-alt');
            if (a) {
                var av = get(a);
                if (av !== undefined) el.setAttribute('alt', av);
            }
        });

        // 需要產生器的區塊
        document.querySelectorAll('[data-list]').forEach(function (el) {
            var key = el.getAttribute('data-list');
            var fn = BUILDERS[key];
            var data = get(key);
            if (!fn) { console.warn('[render.js] 沒有這個產生器：' + key); return; }
            if (!data) { el.innerHTML = ''; return; }
            el.innerHTML = fn(data);
        });

        // 早晨天空：把太陽和雲朵的名單寫成 ocean.js 看得懂的屬性
        var day = document.querySelector('[data-ocean="daysky"]');
        var dayCfg = get('about.daysky');
        if (day && dayCfg) {
            day.setAttribute('data-sun', dayCfg.sun || '');
            day.setAttribute('data-clouds', (dayCfg.clouds || []).join(','));
            // 太陽／雲朵→遊戲的對應，格式跟夜空一樣："欣:sunfish"
            var dayPairs = [];
            var dg = dayCfg.games || {};
            Object.keys(dg).forEach(function (k) { if (dg[k]) dayPairs.push(k + ':' + dg[k]); });
            day.setAttribute('data-games', dayPairs.join(','));
        }

        // 夜空：把星星名單寫成 ocean.js 看得懂的屬性（要在 ocean.js 執行前完成）
        var sky = document.querySelector('[data-ocean="nightsky"]');
        var cfg = get('services.nightsky');
        if (sky && cfg) {
            sky.setAttribute('data-moon', cfg.moon || '');
            sky.setAttribute('data-stars', (cfg.stars || []).join(','));
            // 星星→遊戲的對應，寫成 "欣:starship,雨:maze" 這種格式給 ocean.js
            var pairs = [];
            var g = cfg.games || (cfg.gameStar ? (function () { var o = {}; o[cfg.gameStar] = 'starship'; return o; })() : {});
            Object.keys(g).forEach(function (star) {
                if (g[star]) pairs.push(star + ':' + g[star]);
            });
            sky.setAttribute('data-games', pairs.join(','));
            sky.removeAttribute('data-game-star');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();
