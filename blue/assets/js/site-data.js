/* =========================================================
   site-data.js — 網站內容資料檔
   Catherine 個人網站 — 海洋藍主題套件

   ★ 這個檔案由後台 admin.html 產生，通常不需要手動編輯。
     在後台改完內容後按「匯出 site-data.js」，
     把下載到的檔案蓋回 blue\assets\js\ 就完成更新。

   ★ 如果你想手動改也可以，格式就是下面的 JavaScript 物件。
     改壞了的話，後台右上角有「還原成預設」可以救回來。
   ========================================================= */

window.SITE_DATA = {

    /* 後台圖片下拉選單會列出這些檔案（放在 my-web-main 資料夾裡的圖） */
    "images": [
        "../1.jpg", "../2.jpg", "../3.jpg", "../4.jpg", "../5.jpg",
        "../6.jpg", "../7.jpg", "../8.jpg", "../9.jpg", "../10.jpg",
        "../a.PNG", "../b.png", "../c.jpg", "../d.jpg", "../e.jpg",
        "../f.jpg", "../g.png", "../h.png", "../i.PNG", "../j.jpg",
        "../k.jpg", "../logo-transparent.png"
    ],

    /* ================= 首頁 index.html ================= */
    "home": {
        "heroEyebrow": "Catherine · Portfolio",
        "heroTitle": "一位跨界的生活藝術家。",
        "heroLead": "程式碼與食材的完美融合：理性邏輯建構數位世界，感性熱情創造美味生活。",
        "heroBtn1Text": "查看我的網頁作品 →",
        "heroBtn1Href": "web-design.html",
        "heroBtn2Text": "探索我的美味食譜 →",
        "heroBtn2Href": "cooking.html",

        "introEyebrow": "About",
        "introTitle": "我的理念",
        "introParas": [
            "嘿！我是Catherine。我擅長前端開發為顧客打造流暢的數位體驗。",
            "同時，我對烹飪有著深厚的熱情，特別鍾情於提拉米蘇！",
            "",
            "我相信，不論是設計網站或料理餐點，",
            "成功的關鍵都在於對細節的專注與對美感的追求。"
        ],

        "worksEyebrow": "Selected Works",
        "worksTitle": "精選作品與服務",
        "cards": [
            {
                "img": "../b.png",
                "alt": "網頁作品預覽圖",
                "eyebrow": "Web Design",
                "title": "網頁設計精選",
                "desc": "探索我的響應式設計與最新的前端專案。",
                "more": "查看作品",
                "href": "web-design.html"
            },
            {
                "img": "../g.png",
                "alt": "私房食譜",
                "eyebrow": "Cooking",
                "title": "我的私房食譜",
                "desc": "一窺我對美食的熱情與精緻料理的呈現。",
                "more": "查看食譜",
                "href": "cooking.html"
            },
            {
                "img": "../h.png",
                "alt": "客製",
                "eyebrow": "Services",
                "title": "客製",
                "desc": "提供個人化諮詢服務。",
                "more": "了解服務",
                "href": "services.html"
            }
        ],

        "ctaTitle": "想聊聊你的想法嗎？",
        "ctaText": "不論是網站合作、技術諮詢，或是一場難忘的美食體驗，都歡迎隨時與我聯繫。",
        "ctaBtnText": "查看我的服務 →",
        "ctaBtnHref": "services.html"
    },

    /* ================= 個人介紹 about.html ================= */
    "about": {
        "bannerTitle": "認識 Catherine：理性與感性的交會",
        "bannerSubtitle": "專業網頁開發者與美食愛好者，致力於創造兼具美感與實用性的體驗。",

        "photo": "../c.jpg",
        "photoAlt": "您的專業個人照片",
        "name": "Catherine",
        "nickname": "你也可以叫我水豚老大、葡萄、夏天...等等，在保持禮貌的前提想怎麼稱呼就怎麼稱呼！",

        "creedTitle": "我的核心理念",
        "creedParas": [
            "我的專業背景是資訊管理學系，我始終相信良好的設計和高效的程式碼是解決問題的基石。在工作之餘，烹飪是我的另一種創作方式。我喜歡將程式設計中的邏輯思維應用到食譜開發上，追求精確的美味；同時，烹飪的感性與美學也反哺了我在網頁設計中的色彩搭配和視覺層次感。",
            "我的目標是：用技術提升效率，用熱情豐富生活。"
        ],

        "skillsTitle": "專業技能與熱情",
        "skillGroups": [
            {
                "title": "網頁技術 (Web Development)",
                "style": "web",
                "tags": [
                    "HTML5 & CSS3 (SCSS/Less)",
                    "JavaScript (ES6+)",
                    "前端框架，例如：React / Vue.js",
                    "後端技能，例如：Node.js / Python / PHP",
                    "RWD 響應式設計",
                    "Git 版本控制"
                ]
            },
            {
                "title": "烹飪與生活技能 (Culinary & Life)",
                "style": "cooking",
                "tags": [
                    "甜點鹹食皆行",
                    "烘焙 (麵包/甜點)",
                    "攝影與修圖"
                ]
            }
        ],

        "timelineTitle": "經歷與里程碑",
        "timeline": [
            {
                "title": "九日生行動健康科技 - 測試工程師(實習生)",
                "href": "https://www.9rise.com/",
                "meta": "2026 年 7 月 - 至今 | 參與平台的功能與回歸測試，並協助相關文件整理。"
            },
            {
                "title": "網頁設計師 - 自行接案",
                "meta": "2024 年 - 至今 | 專注於 UX/UI 介面設計與使用者流程研究。"
            },
            {
                "title": "資訊管理學系(在學中)",
                "meta": "2023 年 - 至今"
            }
        ],

        "ctaTitle": "想進一步了解我的專業或交流美食心得嗎？",
        "ctaText": "不論是網站合作、技術交流，或只是想聊聊料理，都歡迎寫信給我。",
        "ctaBtnText": "聯繫我 →",
        "ctaBtnHref": "mailto:bertrandbridget24@gmail.com"
    },

    /* ================= 烹飪作品 cooking.html ================= */
    "cooking": {
        "bannerTitle": "我的私房廚房：味蕾的程式碼",
        "bannerSubtitle": "探索我的精選食譜與餐點設計。從精緻甜點到日式家常，每道菜都是對細節和美味的追求。",

        "categories": [
            { "key": "all",         "label": "全部" },
            { "key": "dessert",     "label": "甜點烘焙" },
            { "key": "main-course", "label": "主食料理" },
            { "key": "drinks",      "label": "飲品調製" },
            { "key": "holiday",     "label": "特殊節日" }
        ],

        "cards": [
            {
                "img": "../f.jpg",
                "title": "椰子奶酥麵包",
                "desc": "經典甜點。精確的酸甜平衡，搭配酥脆塔皮。考驗耐心與精準度。",
                "category": "dessert"
            },
            {
                "img": "../d.jpg",
                "title": "奶油白醬焗烤義大利麵(螺旋)",
                "desc": "利用低溫舒肥技術精準控制熟度，展現食材最原始的風味。",
                "category": "main-course"
            },
            {
                "img": "../e.jpg",
                "title": "草莓糖葫蘆",
                "desc": "簡單食材，多層次風味的堆疊，展現快速邏輯的烹飪哲學。",
                "category": "dessert"
            }
        ]
    },

    /* ================= 網頁作品 web-design.html ================= */
    "webDesign": {
        "bannerTitle": "數位作品集：邏輯與介面的藝術",
        "bannerSubtitle": "在這裡，您可以看到我如何運用最新的前端與後端技術，將想法轉化為高效、響應式的網站應用。",

        "cards": [
            {
                "img": "../b.png",
                "alt": "專案一截圖：電商網站",
                "title": "響應式購物平台",
                "desc": "目標：建置多種裝置適配購物網頁。",
                "tags": ["React", "Node.js", "MongoDB", "Html", "JS", "CSS"],
                "liveText": "實際網站連結 →",
                "liveHref": "https://yitingwu-tea.vercel.app/",
                "repoText": "GitHub Repo",
                "repoHref": "https://github.com/your-repo/project-one"
            }
        ],

        "ctaTitle": "對我的技術感興趣嗎？",
        "ctaText": "無論是合作新專案、技術諮詢，還是討論您的網站需求，歡迎隨時聯繫我。",
        "ctaBtnText": "立即聯繫我 →",
        "ctaBtnHref": "mailto:bertrandbridget24@gmail.com"
    },

    /* ================= 其他作品 other-works.html ================= */
    "otherWorks": {
        "bannerTitle": "多元創作空間：生活中的靈光一閃",
        "bannerSubtitle": "理性工作之外，我透過攝影、繪圖等等來探索世界的無限可能。這裡展現了我的創造力與個人風格。",

        "cards": [
            {
                "img": "../1.jpg",
                "alt": "城市夜景攝影",
                "title": "日常攝影系列",
                "desc": "捕捉生活間的光影。",
                "tags": ["攝影", "Lightroom"],
                "href": "photography-detail.html"
            },
            {
                "img": "../i.PNG",
                "alt": "數位插畫",
                "title": "隨手一畫",
                "desc": "使用 Linearty Curve 創作的數位插畫，充滿想像。",
                "tags": ["數位插畫", "概念設計"],
                "href": "illustration-detail.html"
            },
            {
                "img": "../j.jpg",
                "alt": "手工木製飾品盒",
                "title": "木製托盤(洞洞板、托盤二合一)",
                "desc": "利用細木作工藝完成，結合實用性與設計感。",
                "tags": ["手工藝", "細木作"],
                "href": "diy-detail.html"
            }
        ]
    },

    /* ================= 其他服務 services.html ================= */
    "services": {
        "bannerTitle": "從代碼到廚房：我的跨界服務",
        "bannerSubtitle": "運用我的專業技術與生活熱情，提供客製化服務。無論您需要一個高效能網站，還是一場難忘的美食體驗，我都能為您達成。",

        "cards": [
            {
                "style": "web",
                "title": "網站技術服務與諮詢",
                "desc": "結合我的網頁作品經驗，為您的數位專案提供專業支援，確保品質與效率。",
                "items": [
                    "響應式網站開發 (RWD) 與優化",
                    "專案架構設計與輔導",
                    "網站效能診斷與速度提升",
                    "前端技術一對一教學"
                ],
                "btnText": "洽談網站/技術合作",
                "btnHref": "mailto:bertrandbridget24@gmail.com?subject=網站技術諮詢服務"
            },
            {
                "style": "culinary",
                "title": "客製化服務",
                "desc": "將我對烹飪的熱情與精準的步驟流程融入服務中，創造獨一無二的美味。",
                "items": [
                    "個人/小班制烹飪教學",
                    "食譜開發與攝影擺盤合作",
                    "客製化節慶餐點設計",
                    "餐飲部落格內容協作與撰寫"
                ],
                "btnText": "預約體驗",
                "btnHref": "mailto:bertrandbridget24@gmail.com?subject=烹飪/美食服務諮詢"
            }
        ],

        "ctaTitle": "不確定您的需求屬於哪一項？",
        "ctaText": "沒關係！直接透過以下方式告訴我您的想法，讓我們一起找到最佳的解決方案。",
        "ctaBtnText": "傳送電子郵件聯繫我",
        "ctaBtnHref": "mailto:bertrandbridget24@gmail.com",

        /* 夜空：月亮與星星滑到會顯示的字。星星最多 8 顆。 */
        "nightsky": {
            "moon": "孫",
            "stars": ["欣", "九日生", "尤國任教授", "宜", "邱宏彬教授", "哥哥", "雨"],

            /* 哪顆星星藏哪個遊戲。可用的代號：starship（飛船射擊）、
               fishing（淺海垂釣）、maze（深海迷宮）、life（人生選擇）。
               留空＝那顆星星沒有遊戲。 */
            "games": {
                "欣": "starship",
                "哥哥": "maze",
                "雨": "fishing",
                "尤國任教授": "life"
            }
        }
    }
};
