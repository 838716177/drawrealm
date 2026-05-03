/* ============================================================
   妄想商铺 Bug修复与功能增强补丁 v2.1
   修复内容：
   1. AI生成/便捷生成按钮功能失效 → 统一为AI生成流程
   2. 世界书广场详情无法查看 → 添加完整详情弹窗
   3. 角色卡创建纯手动 → 添加AI辅助生成
   ============================================================ */
(function(global) {
    'use strict';

    /* ============================================================
       修复1：AI生成与便捷生成统一
       ============================================================ */

    // 覆盖showCreateWorld - 统一为AI生成流程
    global.showCreateWorld = function() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="world-creator-background">
                <div class="world-creator-bg-layer"></div>
                <button class="back-btn" onclick="showMainMenuFromWorldCreator()">
                    <svg viewBox="0 0 24 24" class="back-icon"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                    返回
                </button>
                <div class="world-creator-header">
                    <h1 class="world-creator-title">创建世界</h1>
                    <p class="world-creator-subtitle">用AI辅助生成完整的世界观设定</p>
                </div>
                <div class="world-creator-content">
                    <div class="step-container" id="step1">
                        <div class="step-header">
                            <span class="step-number">01</span>
                            <h2>描述你的世界</h2>
                        </div>
                        <div class="input-section">
                            <textarea id="worldInput" class="world-textarea" placeholder="用关键词或大白话描述你的世界观...

例如：
- 一个魔法与科技并存的未来都市
- 中世纪奇幻世界，龙与骑士的传说
- 赛博朋克风格的海底文明

越详细越好，让AI更好地理解你的想法！"></textarea>
                        </div>
                        <div class="input-tips">
                            <span class="tip-icon">💡</span>
                            <span>提示：可以描述世界的时代背景、地理环境、种族、魔法体系、科技水平等</span>
                        </div>
                        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:16px;">
                            <button class="generate-btn" onclick="generateWorldviewFixed()">
                                <span class="btn-text">✨ AI生成世界观</span>
                            </button>
                            <button class="btn-secondary" onclick="showQuickGenerateFixed()">
                                <span>⚡ 便捷模板生成</span>
                            </button>
                        </div>
                        <div class="btn-divider">
                            <span class="divider-line"></span>
                            <span class="divider-text">或</span>
                            <span class="divider-line"></span>
                        </div>
                        <div class="secondary-buttons">
                            <button class="secondary-btn" onclick="showStore()">
                                <svg class="btn-icon" viewBox="0 0 24 24"><path d="M18 6h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zm0 14h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zm0-7h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zM4 6H2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zm0 14H2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zm0-7H2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zm13-5c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V8zm-2 0V6h2v2h-2zm-2 12H7v-2h8v2zm0-4H7v-2h8v2zm0-4H7V8h8v2z"/></svg>
                                使用现有世界观
                            </button>
                            <button class="secondary-btn" onclick="showBackpack()">
                                <svg class="btn-icon" viewBox="0 0 24 24"><path d="M20 8h-3V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-5 14H9v-2h6v2zm3-5H9V8h9v9z"/></svg>
                                打开背包
                            </button>
                        </div>
                    </div>
                    <div class="step-container hidden" id="step2">
                        <div class="step-header">
                            <span class="step-number">02</span>
                            <h2>生成的世界观</h2>
                            <button class="regenerate-btn" onclick="generateWorldviewFixed()">🔄 重新生成</button>
                        </div>
                        <div class="worldview-display">
                            <div class="worldview-content" id="worldviewContent"></div>
                        </div>
                        <div class="step2-buttons">
                            <button class="back-btn-small" onclick="backToStep1()">返回修改</button>
                            <button class="confirm-btn" onclick="confirmWorldviewFixed()"><span>🎯 确认世界观</span></button>
                        </div>
                    </div>
                    <div class="step-container hidden" id="step3">
                        <div class="step-header">
                            <span class="step-number">03</span>
                            <h2>世界开场</h2>
                        </div>
                        <div class="opening-screen">
                            <div class="opening-content" id="openingContent"></div>
                            <div class="opening-progress-bar"><div class="opening-progress" id="openingProgress"></div></div>
                            <p class="opening-hint">点击任意位置继续...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    global.generateWorldviewFixed = function() {
        const input = document.getElementById('worldInput');
        if (!input) return;
        const value = input.value.trim();
        if (!value) {
            if (typeof showToast === 'function') showToast('请先描述你的世界！', 'warning');
            else alert('请先描述你的世界！');
            return;
        }
        const step1 = document.getElementById('step1');
        if (step1) step1.style.opacity = '0.5';

        // 模拟AI生成
        setTimeout(() => {
            const worldview = generateMockWorldviewFixed(value);
            generatedWorldview = worldview;
            const step2 = document.getElementById('step2');
            const step1El = document.getElementById('step1');
            const content = document.getElementById('worldviewContent');
            if (step1El) step1El.classList.add('hidden');
            if (step2) step2.classList.remove('hidden');
            if (content) content.innerHTML = worldview;
            if (step1El) step1El.style.opacity = '1';
            if (typeof showToast === 'function') showToast('世界观生成成功！', 'success');
        }, 1500);
    };

    global.generateMockWorldviewFixed = function(input) {
        const lower = input.toLowerCase();
        let name = '幻想大陆', icon = '🌍', bg = '一个充满无限可能的幻想世界';
        let races = [], factions = [], locations = [], conflict = '';

        if (lower.includes('魔法') || lower.includes('奇幻') || lower.includes('龙') || lower.includes('剑')) {
            name = '艾尔德拉斯大陆'; icon = '🏰';
            bg = '在遥远的艾尔德拉斯大陆，魔法是一切的基石。这片大陆被四大元素精灵守护着，古老的龙族栖息在云端之巅。';
            races = ['精灵族 - 森林守护者，擅长自然魔法','龙裔 - 龙族与人类后裔，拥有魔法抗性','人类王国 - 智慧与勇气，研究魔法与科技融合','暗影族 - 来自地下世界的神秘种族'];
            factions = ['元素议会 - 四大元素精灵使者的最高统治机构','龙族长老会 - 守护世界平衡的古老议会','暗影兄弟会 - 暗中积累力量的秘密组织'];
            locations = ['翡翠森林 - 精灵族圣地，世界树所在地','黑曜堡垒 - 暗影族地下王国','浮空城阿斯特拉 - 龙族古老居所'];
            conflict = '元素精灵力量减弱，黑暗势力蠢蠢欲动。各王国争夺魔法资源，古老预言说只有"元素使者"能拯救世界。';
        } else if (lower.includes('科技') || lower.includes('未来') || lower.includes('赛博') || lower.includes('科幻')) {
            name = '新东京2077'; icon = '🌃';
            bg = '2077年，人类进入完全数字化时代。新东京成为世界中心，摩天大楼与霓虹灯交织成赛博朋克画卷。';
            races = ['星环科技 - 掌控全球AI网络的巨型企业','夜刃帮 - 活跃于地下世界的黑客组织','新东京政府 - 维持秩序的官方力量','觉醒者 - 拥有超能力的改造人团体'];
            factions = ['星环科技 - 掌控全球AI网络的巨型企业','夜刃帮 - 活跃于地下世界的黑客组织','新东京政府 - 维持秩序的官方力量'];
            locations = ['浮空城新宿 - 富人居住的云端城市','地下都市秋叶原 - 底层居民的霓虹世界','星环总部 - 掌控一切的企业巨塔'];
            conflict = '星环科技秘密进行"伊甸园"计划，试图创造完美AI统治世界。夜刃帮发现阴谋，关乎人类未来的战争即将爆发。';
        } else if (lower.includes('海底') || lower.includes('海洋') || lower.includes('水')) {
            name = '亚特兰蒂斯重生'; icon = '🌊';
            bg = '一万年前沉没的亚特兰蒂斯文明在深海中重生，发展出独特的海洋科技和生物文明。';
            races = ['人鱼族 - 亚特兰蒂斯的正统后裔','章鱼人 - 智慧超群的科技种族','海龟守护者 - 古老的长寿种族','虾兵蟹将 - 勤劳的劳动阶层'];
            factions = ['海皇殿 - 亚特兰蒂斯的统治中心','深海科研院 - 研究海洋科技的学术机构','珊瑚守卫军 - 保护领地的军事力量'];
            locations = ['珊瑚王城 - 海底最大的城市','深渊裂谷 - 通往地心的神秘通道','珍珠圣殿 - 人鱼族的圣地'];
            conflict = '海洋温度异常升高，远古海怪开始苏醒。人类探测船逼近亚特兰蒂斯领地，暴露危机正在逼近。';
        } else if (lower.includes('武侠') || lower.includes('江湖') || lower.includes('武林')) {
            name = '江湖风云录'; icon = '⚔️';
            bg = '武林纷争不断，各门各派争夺秘籍，江湖恩怨何时了。';
            races = ['名门正派 - 以正义之名行侠仗义','邪派魔教 - 追求力量不择手段','江湖散人 - 独来独往的游侠','隐世家族 - 传承千年的武学世家'];
            factions = ['武当派 - 内家拳法的正统传承','少林寺 - 天下武功出少林','魔教 - 暗中积蓄力量的邪恶势力'];
            locations = ['武当山 - 道教圣地，内家拳发源地','少林寺 - 禅宗祖庭，武学圣地','黑木崖 - 魔教总坛'];
            conflict = '武林盟主之位空缺，正邪两派暗流涌动。失传已久的绝世武功秘籍重现江湖，一场腥风血雨即将展开。';
        } else if (lower.includes('仙侠') || lower.includes('修真') || lower.includes('修仙')) {
            name = '九霄仙界'; icon = '☯️';
            bg = '天地灵气充沛，凡人可修仙问道，追求长生不老。九霄之上，仙界与人界相连。';
            races = ['修仙者 - 追求长生的修行者','妖族 - 吸收日月精华化形的生灵','魔族 - 堕入魔道的修士','凡人 - 尚未踏入修仙之路的普通人'];
            factions = ['天道宗 - 正道领袖，维护三界平衡','万妖谷 - 妖族聚集地，实力强大','幽冥殿 - 魔道至尊，与正道势不两立'];
            locations = ['昆仑山 - 仙界入口，灵气最盛之地','蓬莱岛 - 海上仙山，长生之秘所在','幽冥深渊 - 魔族老巢，阴气森森'];
            conflict = '天道宗发现魔族正在谋划打开幽冥之门，一旦成功三界将陷入浩劫。修仙界召集各路英豪，准备与魔族决一死战。';
        } else if (lower.includes('都市') || lower.includes('现代') || lower.includes('城市')) {
            name = '都市秘闻'; icon = '🌆';
            bg = '繁华的现代都市背后隐藏着不为人知的秘密，超自然现象悄然发生。';
            races = ['普通人 - 对超自然一无所知的市民','异能者 - 觉醒特殊能力的个体','神秘组织 - 隐藏在暗处操控一切的势力','超自然生物 - 伪装成人类的非人生物'];
            factions = ['异能管理局 - 官方机构，监管异能者','暗影议会 - 地下势力，掌控灰色地带','猎魔人公会 - 专门处理超自然事件'];
            locations = ['中央商务区 - 表面繁华的商业中心','老城区 - 隐藏着古老秘密的街区','地下设施 - 不为人知的秘密基地'];
            conflict = '城市中频繁出现超自然事件，异能者与普通人之间的矛盾日益加深。一个足以毁灭城市的阴谋正在暗中酝酿。';
        } else {
            name = input.substring(0, 10) + '世界'; icon = '🌟';
            bg = '这是一个由你的想象力构建的独特世界，充满了无限的可能性和未知的冒险。';
            races = ['主角族群 - 故事的核心种族','盟友种族 - 与主角并肩作战的伙伴','中立种族 - 保持观望的第三方势力','敌对种族 - 制造冲突与挑战的存在'];
            factions = ['正义联盟 - 维护世界和平的力量','黑暗势力 - 试图颠覆秩序的反派','自由行者 - 不受约束的独立势力'];
            locations = ['起始之地 - 冒险开始的地方','神秘遗迹 - 隐藏着古老秘密的场所','最终战场 - 决定命运的关键地点'];
            conflict = '世界的平衡正在动摇，各种势力蠢蠢欲动。作为主角的你，将在这个充满挑战的世界中书写属于自己的传奇。';
        }

        // 填充currentWorldBook
        if (typeof resetCurrentWorldBook === 'function') resetCurrentWorldBook();
        if (typeof currentWorldBook !== 'undefined') {
            currentWorldBook.name = name;
            currentWorldBook.description = bg;
            currentWorldBook.tags = [icon, '冒险', 'AI生成'];
            currentWorldBook.background = { summary: bg, geography: locations.join('、'), climate: '适宜', magic_level: 'medium', tech_level: 'medieval' };
            currentWorldBook.races = races.map((r, i) => ({ id: 'r'+i, name: r.split(' - ')[0], description: r.split(' - ')[1] || '', traits: ['独特'] }));
            currentWorldBook.factions = factions.map((f, i) => ({ id: 'f'+i, name: f.split(' - ')[0], description: f.split(' - ')[1] || '', alignment: '中立', influence: 50, leader: null }));
            currentWorldBook.locations = locations.map((l, i) => ({ id: 'l'+i, name: l.split(' - ')[0], type: '地点', description: l.split(' - ')[1] || '', ruler: null }));
        }

        return `
            <h3>${icon} 世界名称：${name}</h3>
            <div class="worldview-section"><h4>📜 世界背景</h4><p>${bg}</p></div>
            <div class="worldview-section"><h4>👥 主要种族/势力</h4><ul>${races.map(r => `<li>• ${r}</li>`).join('')}</ul></div>
            <div class="worldview-section"><h4>🏛️ 重要地点</h4><ul>${locations.map(l => `<li>• ${l}</li>`).join('')}</ul></div>
            <div class="worldview-section"><h4>⚔️ 核心冲突</h4><p>${conflict}</p></div>
            <div class="worldview-section"><h4>🎭 势力格局</h4><ul>${factions.map(f => `<li>• ${f}</li>`).join('')}</ul></div>
        `;
    };

    global.backToStep1 = function() {
        const step2 = document.getElementById('step2');
        const step1 = document.getElementById('step1');
        if (step2) step2.classList.add('hidden');
        if (step1) step1.classList.remove('hidden');
    };

    global.confirmWorldviewFixed = function() {
        if (typeof autoSaveWorldBook === 'function') autoSaveWorldBook();
        const step2 = document.getElementById('step2');
        const step3 = document.getElementById('step3');
        if (step2) step2.classList.add('hidden');
        if (step3) step3.classList.remove('hidden');
        if (typeof generateOpening === 'function') generateOpening();
        if (typeof injectEditorEntryButton === 'function') injectEditorEntryButton();
    };

    // 便捷生成改为模板选择后调用AI生成
    global.showQuickGenerateFixed = function() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="world-creator-background">
                <div class="world-creator-bg-layer"></div>
                <button class="back-btn" onclick="showCreateWorld()"><svg viewBox="0 0 24 24" class="back-icon"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>返回</button>
                <div class="world-creator-header">
                    <h1 class="world-creator-title">便捷模板</h1>
                    <p class="world-creator-subtitle">选择类型快速生成世界观</p>
                </div>
                <div class="quick-generate-content">
                    <div class="quick-section">
                        <h3 class="section-title">选择世界类型</h3>
                        <div class="type-grid">
                            ${[
                                {v:'wuxia',icon:'⚔️',name:'武侠',desc:'快意恩仇的江湖世界'},
                                {v:'xianxia',icon:'☯️',name:'仙侠',desc:'逆天修行的修仙世界'},
                                {v:'fantasy',icon:'🧙',name:'奇幻',desc:'剑与魔法的史诗大陆'},
                                {v:'scifi',icon:'🚀',name:'科幻',desc:'星际探索的未来世界'},
                                {v:'modern',icon:'🌆',name:'都市',desc:'隐藏秘密的现代城市'},
                                {v:'historical',icon:'🏺',name:'历史',desc:'波澜壮阔的历史长河'}
                            ].map(t => `
                                <div class="type-card" onclick="quickSelectType('${t.v}','${t.icon} ${t.name}')" style="cursor:pointer;">
                                    <span class="type-icon" style="font-size:2rem;display:block;margin-bottom:8px;">${t.icon}</span>
                                    <span class="type-name" style="font-weight:600;">${t.name}</span>
                                    <span style="font-size:0.75rem;color:var(--text-muted);display:block;margin-top:4px;">${t.desc}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    global.quickSelectType = function(type, typeName) {
        const prompts = {
            wuxia: '一个快意恩仇的武侠世界，各大门派争夺武林盟主之位，江湖中流传着失传已久的绝世武功秘籍',
            xianxia: '一个修仙问道的仙侠世界，凡人通过修炼可以长生不老，九霄之上存在着神秘的仙界',
            fantasy: '一个剑与魔法并存的奇幻大陆，龙族、精灵与人类共存，古老的预言预示着世界的命运',
            scifi: '一个星际探索的科幻未来，人类已经殖民多个星球，与外星文明建立了复杂的政治关系',
            modern: '一个繁华的现代都市，表面平静的生活下隐藏着超自然现象和神秘组织的阴谋',
            historical: '一个波澜壮阔的历史时代，王朝更迭、英雄辈出，个人的命运与国家的兴衰紧密相连'
        };
        showCreateWorld();
        setTimeout(() => {
            const input = document.getElementById('worldInput');
            if (input) input.value = prompts[type] || '';
            generateWorldviewFixed();
        }, 100);
    };

    /* ============================================================
       修复2：世界书广场详情弹窗
       ============================================================ */

    // 覆盖showStore，添加详情查看
    const origShowStore = global.showStore;
    global.showStore = function() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="world-creator-background">
                <div class="world-creator-bg-layer"></div>
                <button class="back-btn" onclick="showCreateWorld()">
                    <svg viewBox="0 0 24 24" class="back-icon"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                    返回
                </button>
                <div class="world-creator-header">
                    <h1 class="world-creator-title">世界书广场</h1>
                    <p class="world-creator-subtitle">探索丰富的世界观，开启你的冒险</p>
                </div>
                <div class="store-filters">
                    <div class="category-tabs">
                        ${(typeof categories !== 'undefined' ? categories : [
                            {id:'all',name:'全部',icon:'grid'},
                            {id:'fantasy',name:'奇幻',icon:'castle'},
                            {id:'scifi',name:'科幻',icon:'spaceship'},
                            {id:'wuxia',name:'武侠',icon:'sword'},
                            {id:'xianxia',name:'仙侠',icon:'scroll'},
                            {id:'modern',name:'都市',icon:'city'},
                            {id:'historical',name:'历史',icon:'book'}
                        ]).map(cat => `
                            <button class="category-tab ${cat.id === 'all' ? 'active' : ''}" onclick="filterWorldbooksFixed('${cat.id}')">
                                <span>${cat.name}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="price-filter">
                        <label class="filter-option"><input type="radio" name="priceFilter" value="all" checked onclick="filterWorldbooksFixed()"><span>全部</span></label>
                        <label class="filter-option"><input type="radio" name="priceFilter" value="free" onclick="filterWorldbooksFixed()"><span>免费</span></label>
                        <label class="filter-option"><input type="radio" name="priceFilter" value="premium" onclick="filterWorldbooksFixed()"><span>付费</span></label>
                    </div>
                </div>
                <div class="store-content">
                    <div class="worldbook-grid" id="worldbookGrid">
                        ${Object.entries(typeof worldbooksData !== 'undefined' ? worldbooksData : {}).map(([id, book]) => `
                            <div class="worldbook-card ${book.price === 0 ? 'free' : 'premium'}" data-category="${book.category || 'all'}" data-price="${book.price === 0 ? 'free' : 'premium'}" onclick="showWorldbookDetailFixed('${id}')">
                                <div class="worldbook-icon-wrapper">
                                    <span style="font-size:1.8rem;">${book.icon === 'castle' ? '🏰' : book.icon === 'spaceship' ? '🚀' : book.icon === 'city' ? '🌆' : book.icon === 'sword' ? '⚔️' : book.icon === 'scroll' ? '📜' : book.icon === 'book' ? '📚' : '📖'}</span>
                                </div>
                                <h4>${book.name}</h4>
                                <p class="worldbook-desc">${book.description}</p>
                                <div class="worldbook-tags">
                                    ${(book.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                                <div class="worldbook-price">
                                    ${book.price === 0 ? '<span class="free-text">免费</span>' : `<span class="premium-text">${book.price}钻石</span>`}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    };

    global.filterWorldbooksFixed = function(category) {
        const selectedCategory = category || 'all';
        const priceFilter = document.querySelector('input[name="priceFilter"]:checked')?.value || 'all';
        const cards = document.querySelectorAll('.worldbook-card');
        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category') || 'all';
            const cardPrice = card.getAttribute('data-price') || 'free';
            const categoryMatch = selectedCategory === 'all' || cardCategory === selectedCategory;
            const priceMatch = priceFilter === 'all' || cardPrice === priceFilter;
            card.style.display = categoryMatch && priceMatch ? 'block' : 'none';
        });
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('onclick')?.includes(`'${selectedCategory}'`)) tab.classList.add('active');
        });
    };

    // 江南鹤风格的世界书详情
    global.showWorldbookDetailFixed = function(worldbookId) {
        const book = typeof worldbooksData !== 'undefined' ? worldbooksData[worldbookId] : null;
        if (!book) return;

        // 获取完整数据（如果有）
        const fullData = typeof currentWorldBook !== 'undefined' && currentWorldBook.name === book.name ? currentWorldBook : null;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.zIndex = '300';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width:700px;max-height:85vh;overflow-y:auto;">
                <div class="modal-header">
                    <h3 style="font-size:1.3rem;margin:0;">📖 ${book.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body" style="padding:24px;">
                    <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:20px;">
                        <div style="width:80px;height:80px;border-radius:16px;background:linear-gradient(135deg,var(--color-purple),var(--color-cyan));display:flex;align-items:center;justify-content:center;font-size:2.5rem;flex-shrink:0;">
                            ${book.icon === 'castle' ? '🏰' : book.icon === 'spaceship' ? '🚀' : book.icon === 'city' ? '🌆' : book.icon === 'sword' ? '⚔️' : book.icon === 'scroll' ? '📜' : book.icon === 'book' ? '📚' : '📖'}
                        </div>
                        <div style="flex:1;">
                            <p style="color:var(--text-secondary);margin:0 0 8px;line-height:1.6;">${book.description}</p>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                ${(book.tags || []).map(t => `<span style="padding:3px 10px;border-radius:10px;background:rgba(168,85,247,0.1);color:var(--color-purple-light);font-size:0.8rem;">${t}</span>`).join('')}
                                <span style="padding:3px 10px;border-radius:10px;background:${book.price === 0 ? 'rgba(6,182,212,0.1)' : 'rgba(255,149,0,0.1)'};color:${book.price === 0 ? 'var(--color-cyan)' : 'var(--color-orange)'};font-size:0.8rem;font-weight:600;">${book.price === 0 ? '免费' : book.price + '钻石'}</span>
                            </div>
                        </div>
                    </div>

                    <div style="border-top:1px solid var(--border-subtle);padding-top:20px;">
                        ${book.content ? book.content : `
                            <div class="worldview-section">
                                <h4 style="color:var(--color-purple-light);margin-bottom:8px;">📜 世界背景</h4>
                                <p style="color:var(--text-secondary);line-height:1.8;">${book.description}</p>
                            </div>
                        `}
                    </div>

                    ${fullData ? `
                        <div style="border-top:1px solid var(--border-subtle);padding-top:20px;margin-top:20px;">
                            <h4 style="color:var(--color-purple-light);margin-bottom:12px;">🗂️ 完整设定</h4>
                            ${fullData.races && fullData.races.length ? `
                                <div style="margin-bottom:16px;">
                                    <h5 style="color:var(--text-secondary);margin-bottom:8px;font-size:0.95rem;">👥 种族</h5>
                                    <div style="display:flex;flex-direction:column;gap:8px;">
                                        ${fullData.races.map(r => `
                                            <div style="padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle);border-radius:10px;">
                                                <strong style="color:#fff;">${r.name}</strong>
                                                <p style="color:var(--text-muted);margin:4px 0 0;font-size:0.85rem;">${r.description}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${fullData.factions && fullData.factions.length ? `
                                <div style="margin-bottom:16px;">
                                    <h5 style="color:var(--text-secondary);margin-bottom:8px;font-size:0.95rem;">⚔️ 势力</h5>
                                    <div style="display:flex;flex-direction:column;gap:8px;">
                                        ${fullData.factions.map(f => `
                                            <div style="padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle);border-radius:10px;">
                                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                                    <strong style="color:#fff;">${f.name}</strong>
                                                    <span style="font-size:0.75rem;color:var(--text-muted);">影响力: ${f.influence}</span>
                                                </div>
                                                <p style="color:var(--text-muted);margin:4px 0 0;font-size:0.85rem;">${f.description}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${fullData.locations && fullData.locations.length ? `
                                <div style="margin-bottom:16px;">
                                    <h5 style="color:var(--text-secondary);margin-bottom:8px;font-size:0.95rem;">🏛️ 地点</h5>
                                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                                        ${fullData.locations.map(l => `
                                            <span style="padding:6px 12px;background:rgba(168,85,247,0.08);border:1px solid var(--border-default);border-radius:20px;color:var(--text-secondary);font-size:0.85rem;">${l.name}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    ${book.characters && book.characters.length ? `
                        <div style="border-top:1px solid var(--border-subtle);padding-top:20px;margin-top:20px;">
                            <h4 style="color:var(--color-purple-light);margin-bottom:12px;">🎭 可选角色</h4>
                            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;">
                                ${book.characters.map(c => `
                                    <div style="padding:14px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle);border-radius:12px;text-align:center;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.borderColor='var(--border-active)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
                                        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--color-purple),var(--color-cyan));margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">${c.avatar === 'female' ? '👩' : '👨'}</div>
                                        <strong style="color:#fff;font-size:0.9rem;">${c.name}</strong>
                                        <p style="color:var(--text-muted);font-size:0.75rem;margin:4px 0 0;">${c.description.substring(0, 20)}...</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer" style="display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid var(--border-subtle);">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">关闭</button>
                    <button class="btn-primary" onclick="selectWorldbook('${worldbookId}');this.closest('.modal-overlay').remove();">
                        <span>🎮 进入世界</span>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        if (typeof showToast === 'function') showToast('查看世界书详情', 'info');
    };

    /* ============================================================
       修复3：角色卡AI辅助创建
       ============================================================ */

    global.showCharacterCardEditorAIFixed = function() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="world-creator-background">
                <div class="world-creator-bg-layer"></div>
                <button class="back-btn" onclick="showMainMenuFromWorldCreator()">
                    <svg viewBox="0 0 24 24" class="back-icon"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                    返回
                </button>
                <div class="world-creator-header">
                    <h1 class="world-creator-title">创建角色卡</h1>
                    <p class="world-creator-subtitle">用AI辅助生成，或手动自定义你的角色</p>
                </div>
                <div class="quick-generate-content">
                    <!-- AI生成区 -->
                    <div class="quick-section">
                        <h3 class="section-title">🤖 AI辅助生成</h3>
                        <p style="color:var(--text-muted);margin-bottom:12px;font-size:0.9rem;">描述你想要的角色，AI会为你生成完整的角色设定</p>
                        <textarea id="charAIInput" class="world-textarea" style="min-height:100px;margin-bottom:12px;" placeholder="例如：
- 一个冷酷的刺客，擅长暗影魔法，有着悲惨的过去
- 活泼开朗的精灵弓箭手，来自翡翠森林
- 赛博朋克风格的黑客少女，拥有改造义肢"></textarea>
                        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
                            <button class="btn-primary" onclick="generateCharacterAIFixed()">✨ AI生成角色</button>
                            <button class="btn-secondary" onclick="showCharacterTemplatePicker()">📋 选择模板</button>
                        </div>
                    </div>

                    <!-- 手动编辑区 -->
                    <div class="quick-section" id="charManualSection">
                        <h3 class="section-title">✏️ 角色信息</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>角色名称</label>
                                <input type="text" id="charName" placeholder="输入角色名称">
                            </div>
                            <div class="form-group">
                                <label>称号/别名</label>
                                <input type="text" id="charAlias" placeholder="例如：暗影之刃">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>性别</label>
                                <select id="charGender">
                                    <option value="male">男</option>
                                    <option value="female">女</option>
                                    <option value="other">其他</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>种族</label>
                                <input type="text" id="charRace" placeholder="例如：人类/精灵/龙裔">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom:16px;">
                            <label>角色简介</label>
                            <textarea id="charBio" placeholder="描述角色的背景故事、性格特点..." style="min-height:80px;"></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom:16px;">
                            <label>外貌描述</label>
                            <textarea id="charAppearance" placeholder="描述角色的外貌特征、穿着打扮..." style="min-height:60px;"></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom:16px;">
                            <label>性格标签（用逗号分隔）</label>
                            <input type="text" id="charTraits" placeholder="例如：冷静,果断,忠诚,神秘">
                        </div>
                        <div class="form-group" style="margin-bottom:16px;">
                            <label>能力/技能</label>
                            <textarea id="charAbilities" placeholder="描述角色的特殊能力或技能..." style="min-height:60px;"></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom:16px;">
                            <label>目标/动机</label>
                            <textarea id="charGoal" placeholder="角色在这个世界中的目标和动机..." style="min-height:60px;"></textarea>
                        </div>
                    </div>

                    <div style="display:flex;gap:12px;justify-content:center;padding-bottom:40px;">
                        <button class="btn-secondary" onclick="showMainMenuFromWorldCreator()">取消</button>
                        <button class="btn-primary" onclick="saveCharacterCardFixed()">💾 保存角色卡</button>
                    </div>
                </div>
            </div>
        `;
    };

    global.generateCharacterAIFixed = function() {
        const input = document.getElementById('charAIInput');
        if (!input || !input.value.trim()) {
            if (typeof showToast === 'function') showToast('请先描述你想要的角色！', 'warning');
            else alert('请先描述你想要的角色！');
            return;
        }
        const desc = input.value.trim().toLowerCase();

        // AI生成逻辑
        let charData = {};
        if (desc.includes('刺客') || desc.includes('杀手') || desc.includes('暗影')) {
            charData = {
                name: '影刃', alias: '暗影之刃', gender: 'male', race: '人类',
                bio: '出身于被毁灭的暗影宗门，自幼接受残酷训练成为顶尖刺客。在一次任务中发现了组织的黑暗秘密，选择背叛并独自流浪。冷峻的外表下隐藏着对正义的执着追求。',
                appearance: '黑色紧身劲装，银色面具遮住半张脸。双眼如鹰隼般锐利，腰间佩戴着淬毒的匕首。身形瘦削但肌肉线条分明，行动时如同幽灵般无声无息。',
                traits: '冷酷,果断,孤独,正义感,隐忍',
                abilities: '暗影步：可在阴影中瞬移；毒刃：匕首涂有麻痹毒素；潜行：几乎完全隐身的潜伏能力；心眼：在黑暗中视力不受影响。',
                goal: '追查并摧毁培养他的暗影组织，为死去的同伴复仇，同时保护无辜者免受黑暗势力侵害。'
            };
        } else if (desc.includes('精灵') || desc.includes('弓箭') || desc.includes('森林')) {
            charData = {
                name: '艾拉瑞尔', alias: '翡翠射手', gender: 'female', race: '精灵',
                bio: '翡翠森林的守护者，精灵族中最年轻的神射手。天生与自然之力共鸣，能与森林中的生灵交流。性格开朗活泼，但对破坏自然的行为绝不姑息。',
                appearance: '翠绿色长发如瀑布般垂落，尖耳上佩戴着树叶形状的水晶耳坠。身着轻便的皮甲，披着用藤蔓编织的斗篷。手持一把由世界树枝干制成的长弓，箭袋中装满了散发着微光的魔法箭矢。',
                traits: '活泼,善良,勇敢,自然亲和,正义',
                abilities: '精准射击：百步穿杨的箭术；自然之语：与动植物沟通；治愈之箭：射出的箭矢可治疗盟友；藤蔓束缚：召唤藤蔓限制敌人行动。',
                goal: '守护翡翠森林不被外界侵扰，寻找失落的精灵圣物，重建精灵族与其他种族的友好关系。'
            };
        } else if (desc.includes('黑客') || desc.includes('赛博') || desc.includes('科技')) {
            charData = {
                name: '零', alias: '幽灵黑客', gender: 'female', race: '改造人',
                bio: '新东京地下世界的传奇黑客，拥有半机械化的身体。曾是星环科技的首席工程师，因发现公司的黑暗实验而叛逃。在地下网络中建立了自己的情报帝国。',
                appearance: '银白色短发，左眼是散发着蓝光的机械义眼。右臂完全机械化，指尖可伸出数据接口。穿着改装过的黑色战术服，背后有隐藏的无人机收纳槽。颈部有星环科技的叛逃者标记。',
                traits: '聪明,叛逆,正义感,技术宅,独立',
                abilities: '神经入侵：直接接入任何电子设备；无人机群：操控微型无人机侦察和攻击；电磁脉冲：释放EMP瘫痪电子设备；数据幽灵：在数字世界中几乎无法被追踪。',
                goal: '揭露星环科技的阴谋，摧毁"伊甸园"计划，为被实验牺牲的受害者讨回公道。'
            };
        } else if (desc.includes('法师') || desc.includes('魔法') || desc.includes('巫师')) {
            charData = {
                name: '奥瑞恩', alias: '星辰法师', gender: 'male', race: '人类',
                bio: '元素议会最年轻的大法师，拥有罕见的四元素亲和体质。从小在浮空城阿斯特拉长大，对古老的龙族魔法有着深入研究。性格温和但意志坚定。',
                appearance: '银灰色长发用星辰发冠束起，身穿绣有四大元素符文的深蓝色法袍。手持一根由龙骨和水晶制成的法杖，法杖顶端悬浮着一颗不断变换颜色的元素核心。双眼中偶尔闪过元素的光芒。',
                traits: '睿智,温和,好奇,责任感,博学',
                abilities: '四元素掌控：同时操控火、水、风、土四种元素；龙语魔法：使用古老的龙族咒语；元素护盾：召唤元素屏障防御；星辰预言：通过观察星辰预知未来片段。',
                goal: '寻找恢复元素精灵力量的方法，阻止黑暗势力打开远古封印，解开龙族消失之谜。'
            };
        } else {
            charData = {
                name: '无名旅者', alias: '命运之子', gender: 'male', race: '人类',
                bio: '一个来历神秘的旅者，似乎与这个世界的命运有着某种联系。拥有超越常人的直觉和适应能力，总能在危机中找到一线生机。',
                appearance: '穿着旅行者常见的斗篷和皮甲，腰间挂着一把看似普通却隐隐发光的短剑。眼神深邃而坚定，仿佛看透了世间的沧桑。',
                traits: '勇敢,机智,神秘,适应力强,正义',
                abilities: '命运感知：预知即将到来的危险；快速学习：能迅速掌握新技能；不屈意志：在绝境中爆发强大力量；世界亲和：与世界本身产生共鸣。',
                goal: '探索世界的真相，寻找自己的身世之谜，在命运的洪流中书写属于自己的传奇。'
            };
        }

        // 填充表单
        const fields = {
            'charName': charData.name, 'charAlias': charData.alias,
            'charGender': charData.gender, 'charRace': charData.race,
            'charBio': charData.bio, 'charAppearance': charData.appearance,
            'charTraits': charData.traits, 'charAbilities': charData.abilities,
            'charGoal': charData.goal
        };
        for (const [id, val] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) el.value = val;
        }

        if (typeof showToast === 'function') showToast('AI角色生成成功！已填充到表单中', 'success');
    };

    global.showCharacterTemplatePicker = function() {
        const templates = [
            { name: '冷酷刺客', icon: '🗡️', desc: '暗影中的杀手，擅长潜行与暗杀' },
            { name: '精灵射手', icon: '🏹', desc: '森林守护者，百步穿杨的神射手' },
            { name: '龙裔战士', icon: '🐉', desc: '拥有龙族血脉的强大战士' },
            { name: '元素法师', icon: '🔮', desc: '掌控四大元素的强大法师' },
            { name: '圣骑士', icon: '⚔️', desc: '信仰坚定的守护者，正义的化身' },
            { name: '暗影术士', icon: '🌑', desc: '钻研禁忌魔法的黑暗学者' },
            { name: '机械师', icon: '⚙️', desc: '擅长制造机械装置的工匠' },
            { name: '吟游诗人', icon: '🎵', desc: '用音乐和故事传递力量的旅者' },
        ];

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width:600px;">
                <div class="modal-header">
                    <h3>选择角色模板</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;">
                        ${templates.map(t => `
                            <div style="padding:16px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle);border-radius:14px;text-align:center;cursor:pointer;transition:all 0.3s;" onclick="applyCharacterTemplate('${t.name}');this.closest('.modal-overlay').remove();" onmouseover="this.style.borderColor='var(--border-active)';this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='var(--border-subtle)';this.style.transform='translateY(0)'">
                                <span style="font-size:2rem;display:block;margin-bottom:8px;">${t.icon}</span>
                                <strong style="color:#fff;font-size:0.95rem;">${t.name}</strong>
                                <p style="color:var(--text-muted);font-size:0.78rem;margin:6px 0 0;line-height:1.4;">${t.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    global.applyCharacterTemplate = function(templateName) {
        const input = document.getElementById('charAIInput');
        if (input) input.value = `一个${templateName}角色`;
        generateCharacterAIFixed();
    };

    global.saveCharacterCardFixed = function() {
        const name = document.getElementById('charName')?.value?.trim();
        if (!name) {
            if (typeof showToast === 'function') showToast('请至少填写角色名称！', 'warning');
            else alert('请至少填写角色名称！');
            return;
        }
        const character = {
            id: 'char_' + Date.now(),
            name: name,
            alias: document.getElementById('charAlias')?.value || '',
            gender: document.getElementById('charGender')?.value || 'male',
            race: document.getElementById('charRace')?.value || '人类',
            bio: document.getElementById('charBio')?.value || '',
            appearance: document.getElementById('charAppearance')?.value || '',
            traits: (document.getElementById('charTraits')?.value || '').split(',').map(t => t.trim()).filter(Boolean),
            abilities: document.getElementById('charAbilities')?.value || '',
            goal: document.getElementById('charGoal')?.value || '',
            createdAt: new Date().toISOString()
        };

        // 保存到localStorage
        const saved = JSON.parse(localStorage.getItem('drawrealm_characters') || '[]');
        saved.push(character);
        localStorage.setItem('drawrealm_characters', JSON.stringify(saved));

        if (typeof showToast === 'function') showToast(`角色「${name}」保存成功！`, 'success');
        else alert(`角色「${name}」保存成功！`);

        showMainMenuFromWorldCreator();
    };

    // 钩子：拦截主菜单的角色卡创建按钮
    const origShowMainMenu = global.showMainMenu;
    if (origShowMainMenu) {
        // 在DOM渲染后修改按钮行为
        const observer = new MutationObserver(function(mutations) {
            const btn = document.querySelector('[onclick*="showCharacterCardEditor"], [onclick*="customizeCharacterCard"], [onclick*="createCharacter"]');
            if (btn && !btn.dataset.fixed) {
                btn.dataset.fixed = 'true';
                const origOnclick = btn.getAttribute('onclick');
                btn.setAttribute('onclick', 'showCharacterCardEditorAIFixed()');
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    console.log('%c[妄想商舗 修复补丁] %c已加载 v2.1',
        'color:#ff9500;font-weight:bold;', 'color:#06b6d4;');

})(window);
