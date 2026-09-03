/* =========================================================
   ui.js — 共用介面行為
   Catherine 個人網站 — 海洋藍主題套件

   1. 導覽列：捲動超過 40px 之後背景變不透明
      需要：<header class="header" id="siteHeader">（或任何 .header）
   2. 進場動畫：加上 class="reveal" 的區塊，捲到才淡入上浮
   ========================================================= */

(function () {
    'use strict';

    function init() {

        /* ---------- 導覽列捲動變色 ---------- */
        var header = document.querySelector('.header');
        if (header) {
            var onScroll = function () {
                header.classList.toggle('scrolled', window.scrollY > 40);
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();   // 重新整理後停在半路時也要正確
        }

        /* ---------- 漢堡選單（窄螢幕才會出現） ---------- */
        var toggle = document.querySelector('.nav-toggle');
        if (header && toggle) {
            var links = header.querySelector('.nav-links');

            function setOpen(on) {
                header.classList.toggle('nav-open', on);
                toggle.setAttribute('aria-expanded', on ? 'true' : 'false');
            }
            setOpen(false);

            toggle.addEventListener('click', function (e) {
                e.stopPropagation();
                setOpen(!header.classList.contains('nav-open'));
            });

            // 點選單裡的連結之後自動收起來
            if (links) {
                links.addEventListener('click', function (e) {
                    if (e.target.closest('a')) setOpen(false);
                });
            }

            // 點選單以外的地方、或按 Esc 也收起來
            document.addEventListener('click', function (e) {
                if (!header.contains(e.target)) setOpen(false);
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') setOpen(false);
            });

            // 視窗拉寬回桌機尺寸時，狀態要歸零，否則選單會卡在展開
            var mq = window.matchMedia('(min-width: 901px)');
            var onWide = function (ev) { if (ev.matches) setOpen(false); };
            if (mq.addEventListener) mq.addEventListener('change', onWide);
            else if (mq.addListener) mq.addListener(onWide);
        }

        /* ---------- 區塊進場淡入 ---------- */
        var items = document.querySelectorAll('.reveal');
        if (!items.length) return;

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add('visible');
                        io.unobserve(e.target);
                    }
                });
            }, { threshold: 0.12 });
            Array.prototype.forEach.call(items, function (el) { io.observe(el); });
        } else {
            // 舊瀏覽器：直接顯示，不要讓內容消失
            Array.prototype.forEach.call(items, function (el) { el.classList.add('visible'); });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
