// 妄想商铺 - 标题界面交互脚本

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    const titleSection = document.querySelector('.title-section');

    // 点击效果 - 只在标题区域触发
    titleSection.addEventListener('click', function(e) {
        // 创建波纹效果
        createRipple(e);
        
        // 播放点击动画
        titleSection.style.animation = 'fadeOutDown 0.5s ease-out forwards';
        
        // 延迟后进入游戏
        setTimeout(() => {
            enterGame();
        }, 500);
    });

    // 创建波纹效果
    function createRipple(e) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        ripple.style.transform = 'translate(-50%, -50%)';
        container.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    }

    // 进入游戏
    function enterGame() {
        // 清除旧内容
        container.innerHTML = '';
        
        // 创建加载界面
        const loadingScreen = document.createElement('div');
        loadingScreen.className = 'loading-screen';
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <div class="loading-ring"></div>
                <p class="loading-text">正在进入妄想世界...</p>
                <div class="loading-progress">
                    <div class="loading-bar"></div>
                </div>
            </div>
        `;
        container.appendChild(loadingScreen);

        // 模拟加载进度
        let progress = 0;
        const loadingBar = loadingScreen.querySelector('.loading-bar');
        const loadingText = loadingScreen.querySelector('.loading-text');
        
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                
                loadingText.textContent = '进入成功！';
                
                setTimeout(() => {
                    showMainMenu();
                }, 500);
            }
            
            loadingBar.style.width = progress + '%';
            loadingText.textContent = `正在进入妄想世界... ${Math.floor(progress)}%`;
        }, 200);
    }

    // 显示主菜单
    function showMainMenu() {
        container.innerHTML = `
            <div class="menu-background">
                <div class="menu-container">
                    <h1 class="menu-title">妄想商铺</h1>
                    <nav class="menu-nav">
                        <button class="menu-btn" onclick="showCreateWorld()">
                            <svg class="btn-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                            创建世界
                        </button>
                        <button class="menu-btn" onclick="joinWorld()">
                            <svg class="btn-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                            加入世界
                        </button>
                        <button class="menu-btn" onclick="customizeWorldBook()">
                            <svg class="btn-icon" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
                            自定义世界书
                        </button>
                        <button class="menu-btn" onclick="customizeCharacterCard()">
                            <svg class="btn-icon" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            自定义性格卡
                        </button>
                        <button class="menu-btn" onclick="showAbout()">
                            <svg class="btn-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                            关于妄想商铺
                        </button>
                    </nav>
                </div>
            </div>
        `;
    }
});

// 存储生成的世界观
let generatedWorldview = '';

// 显示创建世界界面
function showCreateWorld() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="world-creator-background">
            <!-- 背景装饰 -->
            <div class="world-creator-bg-layer"></div>
            
            <!-- 返回按钮 -->
            <button class="back-btn" onclick="showMainMenuFromWorldCreator()">
                <svg viewBox="0 0 24 24" class="back-icon"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                返回
            </button>
            
            <!-- 标题 -->
            <div class="world-creator-header">
                <h1 class="world-creator-title">创建世界</h1>
                <p class="world-creator-subtitle">用你的想象力创造独一无二的世界</p>
            </div>
            
            <!-- 输入区域 -->
            <div class="world-creator-content">
                <!-- 步骤1: 输入描述 -->
                <div class="step-container" id="step1">
                    <div class="step-header">
                        <span class="step-number">01</span>
                        <h2>描述你的世界</h2>
                    </div>
                    <div class="input-section">
                        <textarea 
                            id="worldInput" 
                            class="world-textarea" 
                            placeholder="用关键词或大白话描述你的世界观...

例如：
- 一个魔法与科技并存的未来都市
- 中世纪奇幻世界，龙与骑士的传说
- 赛博朋克风格的海底文明

越详细越好，让AI更好地理解你的想法！"
                        ></textarea>
                    </div>
                    <div class="input-tips">
                        <span class="tip-icon">💡</span>
                        <span>提示：可以描述世界的时代背景、地理环境、种族、魔法体系、科技水平等</span>
                    </div>
                    <button class="generate-btn" onclick="generateWorldview()">
                        <span class="btn-text">✨ AI生成世界观</span>
                    </button>
                    
                    <!-- 分隔线 -->
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
                        <button class="secondary-btn" onclick="showQuickGenerate()">
                            <svg class="btn-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                            便捷生成世界观
                        </button>
                        <button class="secondary-btn" onclick="showBackpack()">
                            <svg class="btn-icon" viewBox="0 0 24 24"><path d="M20 8h-3V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-5 14H9v-2h6v2zm3-5H9V8h9v9z"/></svg>
                            打开背包
                        </button>
                    </div>
                </div>
                
                <!-- 步骤2: 查看生成的世界观 -->
                <div class="step-container hidden" id="step2">
                    <div class="step-header">
                        <span class="step-number">02</span>
                        <h2>生成的世界观</h2>
                        <button class="regenerate-btn" onclick="generateWorldview()">
                            🔄 重新生成
                        </button>
                    </div>
                    <div class="worldview-display">
                        <div class="worldview-content" id="worldviewContent">
                            <!-- 生成的世界观将显示在这里 -->
                        </div>
                    </div>
                    <div class="step2-buttons">
                        <button class="back-btn-small" onclick="backToStep1()">返回修改</button>
                        <button class="confirm-btn" onclick="confirmWorldview()">
                            <span>🎯 确认世界观</span>
                        </button>
                    </div>
                </div>
                
                <!-- 步骤3: 进入世界开场 -->
                <div class="step-container hidden" id="step3">
                    <div class="step-header">
                        <span class="step-number">03</span>
                        <h2>世界开场</h2>
                    </div>
                    <div class="opening-screen">
                        <div class="opening-content" id="openingContent">
                            <!-- 开场故事将显示在这里 -->
                        </div>
                        <div class="opening-progress-bar">
                            <div class="opening-progress" id="openingProgress"></div>
                        </div>
                        <p class="opening-hint">点击任意位置继续...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 返回主菜单
function showMainMenuFromWorldCreator() {
    generatedWorldview = '';
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="menu-background">
            <div class="menu-container">
                <h1 class="menu-title">妄想商铺</h1>
                <nav class="menu-nav">
                    <button class="menu-btn" onclick="showCreateWorld()">
                        <svg class="btn-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        创建世界
                    </button>
                    <button class="menu-btn" onclick="joinWorld()">
                        <svg class="btn-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                        加入世界
                    </button>
                    <button class="menu-btn" onclick="customizeWorldBook()">
                        <svg class="btn-icon" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
                        自定义世界书
                    </button>
                    <button class="menu-btn" onclick="customizeCharacterCard()">
                        <svg class="btn-icon" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        自定义性格卡
                    </button>
                    <button class="menu-btn" onclick="showAbout()">
                        <svg class="btn-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        关于妄想商铺
                    </button>
                </nav>
            </div>
        </div>
    `;
}

// 模拟AI生成世界观（实际应用中调用OpenAI API）
function generateWorldview() {
    const input = document.getElementById('worldInput').value.trim();
    
    if (!input) {
        alert('请先描述你的世界！');
        return;
    }
    
    // 显示加载状态
    const step1 = document.getElementById('step1');
    step1.style.opacity = '0.5';
    
    // 模拟AI生成过程
    setTimeout(() => {
        // 根据输入生成世界观（模拟数据）
        generatedWorldview = generateMockWorldview(input);
        
        // 显示步骤2
        document.getElementById('step1').classList.add('hidden');
        document.getElementById('step2').classList.remove('hidden');
        
        // 更新世界观内容
        document.getElementById('worldviewContent').innerHTML = generatedWorldview;
        
        step1.style.opacity = '1';
    }, 1500);
}

// 模拟生成世界观
function generateMockWorldview(input) {
    // 根据输入关键词生成不同的世界观
    const lowerInput = input.toLowerCase();
    
    let worldview = '';
    
    if (lowerInput.includes('魔法') || lowerInput.includes('奇幻') || lowerInput.includes('龙')) {
        worldview = `
            <h3>🏰 世界名称：艾尔德拉斯大陆</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>在遥远的艾尔德拉斯大陆，魔法是一切的基石。这片大陆被四大元素精灵守护着，每个元素都拥有独特的魔法力量。古老的龙族栖息在云端之巅，传说它们掌握着世界的秘密。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要种族</h4>
                <ul>
                    <li>✨ <strong>精灵族</strong> - 森林的守护者，擅长自然魔法</li>
                    <li>🐉 <strong>龙裔</strong> - 龙族与人类的后裔，拥有强大的魔法抗性</li>
                    <li>🏰 <strong>人类王国</strong> - 智慧与勇气的象征，正在研究魔法与科技的融合</li>
                    <li>🌑 <strong>暗影族</strong> - 来自地下世界的神秘种族</li>
                </ul>
            </div>
            <div class="worldview-section">
                <h4>⚔️ 势力纷争</h4>
                <p>大陆正处于动荡时期，元素精灵的力量逐渐减弱，黑暗势力蠢蠢欲动。各王国之间为了争夺魔法资源而纷争不断，而古老的预言说，只有真正的"元素使者"才能拯救这个世界。</p>
            </div>
            <div class="worldview-section">
                <h4>🏛️ 重要地点</h4>
                <p><strong>翡翠森林</strong> - 精灵族的圣地，世界树的所在地<br>
                <strong>黑曜堡垒</strong> - 暗影族的地下王国<br>
                <strong>浮空城阿斯特拉</strong> - 龙族的古老居所</p>
            </div>
        `;
    } else if (lowerInput.includes('科技') || lowerInput.includes('未来') || lowerInput.includes('赛博朋克')) {
        worldview = `
            <h3>🌃 世界名称：新东京2077</h3>
            <div class="worldview-section">
                <h4>📡 世界背景</h4>
                <p>2077年，人类已经进入了完全数字化的时代。新东京成为了世界的中心，高耸入云的摩天大楼与霓虹灯交织成一幅壮丽的赛博朋克画卷。人工智能已经达到了前所未有的高度。</p>
            </div>
            <div class="worldview-section">
                <h4>👤 主要势力</h4>
                <ul>
                    <li>🏢 <strong>星环科技</strong> - 掌控全球AI网络的巨型企业</li>
                    <li>🔴 <strong>夜刃帮</strong> - 活跃于地下世界的黑客组织</li>
                    <li>⚖️ <strong>新东京政府</strong> - 试图维持秩序的官方力量</li>
                    <li>🧠 <strong>觉醒者</strong> - 拥有超能力的改造人团体</li>
                </ul>
            </div>
            <div class="worldview-section">
                <h4>🌐 社会结构</h4>
                <p>社会被分为"云端阶层"和"地面居民"。富人居住在浮空城市中，享受着最先进的科技；而普通人则在地面的霓虹灯下挣扎求生。意识上传和记忆植入已经成为常态。</p>
            </div>
            <div class="worldview-section">
                <h4>🔍 核心冲突</h4>
                <p>星环科技正在秘密进行一项名为"伊甸园"的计划，试图创造完美的AI统治世界。夜刃帮发现了这个阴谋，一场关乎人类未来的战争即将爆发...</p>
            </div>
        `;
    } else if (lowerInput.includes('海底') || lowerInput.includes('海洋')) {
        worldview = `
            <h3>🌊 世界名称：亚特兰蒂斯重生</h3>
            <div class="worldview-section">
                <h4>🐙 世界背景</h4>
                <p>一万年前沉没的亚特兰蒂斯文明在深海中重生了。经过数千年的演化，海底居民发展出了独特的海洋科技和生物文明。</p>
            </div>
            <div class="worldview-section">
                <h4>🐠 主要种族</h4>
                <ul>
                    <li>🧜 <strong>人鱼族</strong> - 亚特兰蒂斯的正统后裔</li>
                    <li>🦑 <strong>章鱼人</strong> - 智慧超群的科技种族</li>
                    <li>🐢 <strong>海龟守护者</strong> - 古老的长寿种族</li>
                    <li>🦐 <strong>虾兵蟹将</strong> - 勤劳的劳动阶层</li>
                </ul>
            </div>
            <div class="worldview-section">
                <h4>🏰 城市结构</h4>
                <p>海底城市由巨大的能量罩保护，利用地热能和水压发电。建筑风格融合了生物材料与先进科技，珊瑚礁与玻璃穹顶交相辉映。</p>
            </div>
            <div class="worldview-section">
                <h4>⚠️ 危机降临</h4>
                <p>近年来，海洋温度异常升高，远古的海怪开始苏醒。同时，人类的海底探测船越来越接近亚特兰蒂斯的领地，暴露的危机正在逼近...</p>
            </div>
        `;
    } else {
        // 默认世界观
        worldview = `
            <h3>🌍 世界名称：幻想大陆</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>这是一个充满无限可能的幻想世界，魔法与冒险交织，传奇与史诗并存。古老的遗迹中隐藏着失落的秘密，等待勇敢的冒险者去探索。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要种族</h4>
                <ul>
                    <li>👨‍👩‍👧‍👦 <strong>人类</strong> - 适应性最强的种族</li>
                    <li>🧝 <strong>精灵</strong> - 优雅的森林守护者</li>
                    <li>🧙 <strong>法师</strong> - 掌握神秘力量的学者</li>
                    <li>👹 <strong>兽人</strong> - 强壮的战士种族</li>
                </ul>
            </div>
            <div class="worldview-section">
                <h4>🗺️ 世界地理</h4>
                <p>大陆被广袤的森林、险峻的山脉和神秘的海洋环绕。四大王国各自守护着自己的领地，而边境地带则是冒险者的乐园。</p>
            </div>
            <div class="worldview-section">
                <h4>⚔️ 冒险开始</h4>
                <p>传说中，远古神器散落于世界各地。集齐它们的人将获得改变世界的力量。无数冒险者踏上征程，你的故事即将开始...</p>
            </div>
        `;
    }
    
    return worldview;
}

// 返回步骤1
function backToStep1() {
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step1').classList.remove('hidden');
}

// 确认世界观，生成开场
function confirmWorldview() {
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.remove('hidden');
    
    // 生成开场故事
    generateOpening();
}

// 生成开场故事
function generateOpening() {
    const openingContent = document.getElementById('openingContent');
    const progressBar = document.getElementById('openingProgress');
    const openingScreen = document.querySelector('.opening-screen');
    
    // 根据选择的角色生成不同的开场
    let openings = [
        { text: "🌙 夜幕降临，你站在世界的边缘...", delay: 50 },
        { text: "\n\n在这片神秘的土地上，命运的齿轮开始转动...", delay: 50 },
        { text: "\n\n古老的传说在风中低语，似乎在呼唤着什么...", delay: 50 },
        { text: "\n\n你深吸一口气，迈出了踏入这个世界的第一步...", delay: 50 },
        { text: "\n\n✨ 欢迎来到属于你的妄想世界 ✨", delay: 80 }
    ];
    
    // 如果选择了金瓶梅的角色，生成专属开场
    if (selectedCharacter) {
        if (selectedCharacter.id === 'panjinlian') {
            openings = [
                { text: "🏮 北宋年间，山东清河县...", delay: 50 },
                { text: "\n\n你是潘金莲，武大郎的妻子...", delay: 50 },
                { text: "\n\n每天看着镜子里的自己，你不甘心就这样平凡度过一生...", delay: 50 },
                { text: "\n\n命运的十字路口就在眼前，你将做出怎样的选择？", delay: 50 },
                { text: "\n\n✨ 你的故事，由你自己书写 ✨", delay: 80 }
            ];
        } else if (selectedCharacter.id === 'ximenqing') {
            openings = [
                { text: "🏮 北宋年间，山东清河县...", delay: 50 },
                { text: "\n\n你是西门庆，清河县的首富...", delay: 50 },
                { text: "\n\n金钱、权势、美人，你似乎拥有了一切...", delay: 50 },
                { text: "\n\n但真正的满足，或许就在下一个转角...", delay: 50 },
                { text: "\n\n✨ 你的故事，由你自己书写 ✨", delay: 80 }
            ];
        } else if (selectedCharacter.id === 'wudalang') {
            openings = [
                { text: "🏮 北宋年间，山东清河县...", delay: 50 },
                { text: "\n\n你是武大郎，靠卖炊饼为生...", delay: 50 },
                { text: "\n\n虽然身材矮小，但你有一颗善良的心...", delay: 50 },
                { text: "\n\n平静的生活即将被打破，你将如何面对？", delay: 50 },
                { text: "\n\n✨ 你的故事，由你自己书写 ✨", delay: 80 }
            ];
        } else if (selectedCharacter.id === 'wusong') {
            openings = [
                { text: "🏮 北宋年间，山东清河县...", delay: 50 },
                { text: "\n\n你是武松，打虎英雄...", delay: 50 },
                { text: "\n\n一身武艺，满腔正义，你是众人眼中的英雄...", delay: 50 },
                { text: "\n\n但有些事情，比老虎更难对付...", delay: 50 },
                { text: "\n\n✨ 你的故事，由你自己书写 ✨", delay: 80 }
            ];
        }
    }
    
    let currentIndex = 0;
    let currentTextIndex = 0;
    openingContent.textContent = '';
    
    const typeInterval = setInterval(() => {
        if (currentIndex >= openings.length) {
            clearInterval(typeInterval);
            // 添加点击提示
            const hint = document.querySelector('.opening-hint');
            if (hint) hint.style.opacity = '1';
            // 添加点击事件
            if (openingScreen) {
                openingScreen.style.cursor = 'pointer';
                openingScreen.onclick = () => {
                    showVideoLoading();
                };
            }
            return;
        }
        
        const currentOpening = openings[currentIndex];
        
        if (currentTextIndex < currentOpening.text.length) {
            openingContent.textContent += currentOpening.text[currentTextIndex];
            currentTextIndex++;
            // 更新进度
            const totalLength = openings.reduce((sum, o) => sum + o.text.length, 0);
            const progress = ((currentIndex * 100 + currentTextIndex) / totalLength) * 100;
            progressBar.style.width = Math.min(progress, 100) + '%';
        } else {
            currentIndex++;
            currentTextIndex = 0;
        }
    }, 30);
}

// 显示视频生成加载界面
function showVideoLoading() {
    const container = document.querySelector('.container');
    
    container.innerHTML = `
        <div class="world-creator-background">
            <div class="world-creator-bg-layer"></div>
            
            <div class="video-loading-content">
                <div class="loading-header">
                    <h1 class="loading-title">正在生成世界</h1>
                    <p class="loading-subtitle">使用AI为您创作专属剧情</p>
                </div>
                
                <div class="loading-stages">
                    <div class="stage-item active" id="stage1">
                        <div class="stage-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </div>
                        <span class="stage-text">解析世界观</span>
                    </div>
                    <div class="stage-line"></div>
                    <div class="stage-item" id="stage2">
                        <div class="stage-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                        </div>
                        <span class="stage-text">生成剧情分支</span>
                    </div>
                    <div class="stage-line"></div>
                    <div class="stage-item" id="stage3">
                        <div class="stage-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                            </svg>
                        </div>
                        <span class="stage-text">渲染画面</span>
                    </div>
                    <div class="stage-line"></div>
                    <div class="stage-item" id="stage4">
                        <div class="stage-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                        <span class="stage-text">合成视频</span>
                    </div>
                </div>
                
                <div class="loading-progress-container">
                    <div class="loading-progress-bar">
                        <div class="loading-progress" id="loadingProgress"></div>
                    </div>
                    <p class="loading-percent" id="loadingPercent">0%</p>
                </div>
                
                <div class="loading-tip" id="loadingTip">
                    <p>正在连接OpenAI服务器...</p>
                </div>
                
                <div class="particle-container" id="particleContainer"></div>
            </div>
        </div>
    `;
    
    // 开始加载动画
    startVideoLoading();
}

// 开始视频加载动画
function startVideoLoading() {
    let progress = 0;
    let currentStage = 1;
    
    const stages = [
        { text: "正在解析世界观和角色设定...", duration: 1500 },
        { text: "正在生成多条剧情分支线路...", duration: 2000 },
        { text: "正在使用AI渲染精美画面...", duration: 2500 },
        { text: "正在合成最终视频...", duration: 1500 },
        { text: "即将完成...", duration: 500 }
    ];
    
    const loadingTip = document.getElementById('loadingTip');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingPercent = document.getElementById('loadingPercent');
    
    let stageIndex = 0;
    
    const updateProgress = setInterval(() => {
        progress += Math.random() * 2 + 1;
        if (progress > 100) progress = 100;
        
        loadingProgress.style.width = progress + '%';
        loadingPercent.textContent = Math.floor(progress) + '%';
        
        // 更新阶段
        if (progress >= 25 && currentStage === 1) {
            document.getElementById('stage1').classList.add('completed');
            document.getElementById('stage2').classList.add('active');
            currentStage = 2;
        }
        if (progress >= 50 && currentStage === 2) {
            document.getElementById('stage2').classList.add('completed');
            document.getElementById('stage3').classList.add('active');
            currentStage = 3;
        }
        if (progress >= 75 && currentStage === 3) {
            document.getElementById('stage3').classList.add('completed');
            document.getElementById('stage4').classList.add('active');
            currentStage = 4;
        }
        
        // 更新提示文本
        if (stageIndex < stages.length - 1 && progress >= (stageIndex + 1) * 20) {
            stageIndex++;
            if (loadingTip) {
                loadingTip.innerHTML = `<p>${stages[stageIndex].text}</p>`;
            }
        }
        
        if (progress >= 100) {
            clearInterval(updateProgress);
            document.getElementById('stage4').classList.add('completed');
            setTimeout(() => {
                showVideoPlayer();
            }, 800);
        }
    }, 50);
    
    // 创建粒子效果
    createParticles();
}

// 创建粒子效果
function createParticles() {
    const container = document.getElementById('particleContainer');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'loading-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
        container.appendChild(particle);
    }
}

// 显示全屏视频播放器
function showVideoPlayer() {
    const container = document.querySelector('.container');
    
    container.innerHTML = `
        <div class="fullscreen-video-player">
            <div class="video-background"></div>
            
            <div class="video-overlay">
                <div class="story-title-area">
                    <h1 class="main-story-title">${selectedCharacter ? selectedCharacter.name + '的故事' : '你的故事'}</h1>
                    <p class="story-chapter">第一章</p>
                </div>
                
                <div class="video-progress-bar">
                    <div class="video-progress-fill" id="videoProgressFill"></div>
                </div>
                
                <!-- 左右分栏布局 -->
                <div class="split-layout">
                    <!-- 左侧：分支选项 -->
                    <div class="choices-panel">
                        <h3 class="choices-prompt">请选择你的行动</h3>
                        <div class="choices-buttons" id="choicesButtons"></div>
                    </div>
                    
                    <!-- 右侧：剧情描述区域 -->
                    <div class="story-panel">
                        <div class="scene-description" id="sceneDescription"></div>
                    </div>
                </div>
                
                <div class="video-controls">
                    <button class="video-ctrl-btn" onclick="togglePlayPause()">
                        <svg id="playPauseIcon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <button class="video-ctrl-btn" onclick="toggleFullscreen()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                        </svg>
                    </button>
                    <button class="video-ctrl-btn" onclick="showMainMenuFromVideo()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 9v6l8-3-8-3z"/>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="loading-indicator" id="loadingIndicator">
                    <div class="loading-spinner"></div>
                    <p class="loading-text" id="loadingText">正在生成视频...</p>
                </div>
            </div>
        </div>
    `;
    
    // 立即开始加载，避免不必要的延迟
    playVideoSegment('intro');
}

// OpenAI API 配置
const OpenAIConfig = {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    
    demoVideos: {
        'panjinlian-intro': 'https://videos.pexels.com/video-files/5765380/5765380-uhd_2560_1440_30fps.mp4',
        'ximenqing-intro': 'https://videos.pexels.com/video-files/3203883/3203883-uhd_2560_1440_30fps.mp4',
        'wudalang-intro': 'https://videos.pexels.com/video-files/5765380/5765380-uhd_2560_1440_30fps.mp4',
        'wusong-intro': 'https://videos.pexels.com/video-files/3203883/3203883-uhd_2560_1440_30fps.mp4',
        'default': 'https://videos.pexels.com/video-files/5765380/5765380-uhd_2560_1440_30fps.mp4'
    },
    
    async generateVideo(character, scene, mood) {
        if (this.apiKey) {
            try {
                const prompt = `Ancient Chinese Song Dynasty, cinematic, ${mood}, dramatic lighting`;
                
                const response = await fetch(`${this.baseUrl}/videos/generations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        prompt: prompt,
                        model: 'sora-1.0',
                        duration: 10,
                        resolution: '1080p'
                    })
                });
                
                if (!response.ok) throw new Error('视频生成失败');
                const data = await response.json();
                return data.video_url;
            } catch (error) {
                console.error('OpenAI API 错误:', error);
            }
        }
        
        const key = `${character}-${scene}`;
        return this.demoVideos[key] || this.demoVideos['default'];
    }
};

// 当前视频状态
let currentVideoState = {
    scene: 'intro',
    isPlaying: false,
    choicesVisible: false
};

// 玩家选择统计系统
const playerChoiceStats = {
    // 统计数据存储
    data: {},
    
    // 初始化场景统计数据
    initScene(sceneKey) {
        if (!this.data[sceneKey]) {
            this.data[sceneKey] = {};
        }
    },
    
    // 获取选项统计数据
    getChoiceStats(sceneKey, choiceId) {
        this.initScene(sceneKey);
        return this.data[sceneKey][choiceId] || 0;
    },
    
    // 记录玩家选择
    recordChoice(sceneKey, choiceId) {
        this.initScene(sceneKey);
        this.data[sceneKey][choiceId] = (this.data[sceneKey][choiceId] || 0) + 1;
        this.saveToStorage();
    },
    
    // 获取所有选项统计
    getAllStats(sceneKey) {
        this.initScene(sceneKey);
        return this.data[sceneKey];
    },
    
    // 计算百分比
    getPercentage(sceneKey, choiceId) {
        const stats = this.getAllStats(sceneKey);
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        if (total === 0) return 0;
        return Math.round((this.getChoiceStats(sceneKey, choiceId) / total) * 100);
    },
    
    // 保存到本地存储
    saveToStorage() {
        try {
            localStorage.setItem('playerChoiceStats', JSON.stringify(this.data));
        } catch (e) {
            console.log('无法保存统计数据');
        }
    },
    
    // 从本地存储加载
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('playerChoiceStats');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        } catch (e) {
            console.log('无法加载统计数据');
        }
    },
    
    // 生成随机统计数据（用于演示）
    generateDemoStats(sceneKey, choiceCount) {
        this.initScene(sceneKey);
        if (Object.keys(this.data[sceneKey]).length === 0) {
            for (let i = 0; i < choiceCount; i++) {
                this.data[sceneKey][`choice_${i}`] = Math.floor(Math.random() * 500) + 50;
            }
        }
    }
};

// 加载保存的统计数据
playerChoiceStats.loadFromStorage();

// 播放视频片段
async function playVideoSegment(sceneName) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const loadingText = document.getElementById('loadingText');
    const choicesPanel = document.querySelector('.choices-panel');
    const storyPanel = document.querySelector('.story-panel');
    
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    if (choicesPanel) {
        choicesPanel.style.opacity = '0';
        choicesPanel.style.transform = 'translateX(-20px)';
    }
    if (storyPanel) {
        storyPanel.style.opacity = '0';
        storyPanel.style.transform = 'translateX(20px)';
    }
    
    currentVideoState.scene = sceneName;
    
    const branches = getStoryBranchesForScene(sceneName);
    
    // 先更新文字剧情（这是视频生成的参考基础，必须优先更新）
    showSceneDescription(sceneName);
    
    let videoUrl = null;
    if (selectedCharacter) {
        videoUrl = await OpenAIConfig.generateVideo(selectedCharacter.id, sceneName, 'dramatic emotional');
    }
    
    if (!videoUrl) {
        if (loadingText) loadingText.textContent = '正在渲染剧情片段...';
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        showSceneVisual(sceneName);
        setTimeout(() => { showChoicesOverlay(branches); }, 1500);
    } else {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        playRealVideo(videoUrl);
    }
}

// 显示场景描述文字
function showSceneDescription(sceneName) {
    // 优先查找 story-panel 中的 sceneDescription
    let descElement = null;
    const storyPanel = document.querySelector('.story-panel');
    if (storyPanel) {
        descElement = storyPanel.querySelector('#sceneDescription');
        // 显示 story-panel
        storyPanel.style.opacity = '1';
        storyPanel.style.transform = 'translateX(0)';
    }
    
    // 如果没找到，再找全局的
    if (!descElement) {
        descElement = document.getElementById('sceneDescription');
    }
    
    if (!descElement) {
        console.error('找不到场景描述元素');
        return;
    }
    
    const descriptions = {
        'intro': {
            panjinlian: '你站在窗前，望着窗外的市井喧嚣。作为武大郎的妻子，你的日子平淡如水，但内心深处总有一丝不甘...',
            ximenqing: '清河县的街道上人来人往，你是这里最有权势的商人。金钱、美酒、美人，似乎没有什么是你得不到的...',
            wudalang: '清晨的阳光洒在你的脸上，你整理好炊饼担子，准备开始一天的营生。虽然平凡，但你知足常乐...',
            wusong: '景阳冈上的猛虎早已成为过去，你回到了家乡。哥哥武大郎的家就在前方，你迫不及待想见到他...'
        },
        'west': {
            panjinlian: '西门庆的身影出现在你面前，他的眼神中带着一种难以抗拒的魅力。命运的齿轮，似乎开始转动了...',
            ximenqing: '潘金莲就站在那里，她的美貌让你心动不已。你知道，你必须得到她...'
        },
        'panjinlian_west': { panjinlian: '西门庆的身影出现在你面前，他的眼神中带着一种难以抗拒的魅力。命运的齿轮，似乎开始转动了...' },
        'panjinlian_independent': { panjinlian: '你决定靠自己的力量改变命运，利用自己的聪明才智开始经商...' },
        'panjinlian_wusong': { panjinlian: '你对武松一见钟情，想尽办法吸引他的注意...' },
        'secret_meeting': { panjinlian: '你与西门庆偷偷相会，这段不伦之恋让你既害怕又渴望...' },
        'refuse_west': { panjinlian: '你坚守本心，拒绝了西门庆的诱惑，决定继续做武大郎的妻子...' },
        'confession_wuda': { panjinlian: '你向武大郎坦白了一切，等待着命运的审判...' },
        'business_success': { panjinlian: '你利用美貌和智慧经商，生意越做越大，成为了清河县的女商人...' },
        'escape_town': { panjinlian: '你离开了清河县，开始了新的生活，未知的未来在等待着你...' },
        'confession_wusong': { panjinlian: '你向武松表白了心意，但他的反应却让你始料未及...' },
        'wait_opportunity': { panjinlian: '你选择默默等待，等待合适的时机来改变命运...' },
        'calm_ending': { panjinlian: '你选择了安稳的生活，与武大郎相守一生。虽然平凡，但也算圆满。' },
        
        'ximenqing_pursue': { ximenqing: '你决定追求潘金莲，开始设计接近她的计划...' },
        'ximenqing_business': { ximenqing: '你决定专心经营生意，成为一个受人尊敬的商人...' },
        'ximenqing_power': { ximenqing: '你利用财富和人脉，开始扩张自己的势力...' },
        'ximenqing_help': { ximenqing: '你决定暗中帮助武大郎一家，改善他们的生活...' },
        'send_gifts': { ximenqing: '你用金银珠宝打动潘金莲，她似乎对你的礼物很感兴趣...' },
        'frame_wuda': { ximenqing: '你设计让武大郎离开，为自己创造机会...' },
        'honest_confession': { ximenqing: '你真心实意向潘金莲表白，她被你的真诚打动了...' },
        
        'wuda_continue': { wudalang: '你继续卖炊饼，虽然平凡但安稳，和弟弟武松团聚也是一种幸福...' },
        'wuda_expand': { wudalang: '你决定扩大生意，开一家炊饼铺，招几个伙计...' },
        'wuda_follow': { wudalang: '你决定跟着弟弟武松出去闯荡，见见世面...' },
        'wuda_remarry': { wudalang: '你决定成全潘金莲，给她自由，自己再找一个合适的伴侣...' },
        
        'protect': { wusong: '你寸步不离地守护着哥哥，敏锐的直觉告诉你，危险正在逼近...' },
        'persuade': { wusong: '你察觉到不对劲，决定劝说潘金莲回心转意...' },
        'duty': { wusong: '你决定继续当差，建功立业，为哥哥争光...' },
        'investigate': { wusong: '你决定设计试探西门庆和潘金莲，看看他们到底想干什么...' }
    };
    
    const charId = selectedCharacter ? selectedCharacter.id : 'panjinlian';
    let sceneDesc = descriptions[sceneName] && descriptions[sceneName][charId];
    
    // 如果找不到对应角色的描述，尝试查找通用描述
    if (!sceneDesc && descriptions[sceneName]) {
        sceneDesc = Object.values(descriptions[sceneName])[0];
    }
    
    // 如果还是找不到，使用默认描述
    if (!sceneDesc) {
        sceneDesc = '剧情正在发展中...';
    }
    
    descElement.textContent = sceneDesc;
    descElement.style.opacity = '1';
    console.log('场景描述已更新:', sceneName, sceneDesc);
}

// 显示场景视觉效果
function showSceneVisual(sceneName) {
    const videoBg = document.querySelector('.video-background');
    if (!videoBg) return;
    
    const visuals = {
        'intro': 'linear-gradient(135deg, rgba(139, 69, 19, 0.7), rgba(210, 105, 30, 0.5))',
        'west': 'linear-gradient(135deg, rgba(178, 34, 34, 0.7), rgba(139, 69, 19, 0.5))',
        'protect': 'linear-gradient(135deg, rgba(0, 100, 0, 0.7), rgba(34, 139, 34, 0.5))'
    };
    
    videoBg.style.background = visuals[sceneName] || visuals['intro'];
    videoBg.classList.add('scene-active');
}

// 获取场景对应的剧情分支
function getStoryBranchesForScene(sceneName) {
    const allBranches = {
        // 潘金莲的剧情分支
        'panjinlian-intro': [
            { id: 'calm', title: '安分守己', description: '好好和武大郎过日子', nextScene: 'calm_ending' },
            { id: 'west', title: '与西门庆相遇', description: '接受命运的安排', nextScene: 'panjinlian_west' },
            { id: 'independent', title: '独立自强', description: '不靠男人，自己闯荡', nextScene: 'panjinlian_independent' },
            { id: 'wusong', title: '对武松心动', description: '想办法接近武松', nextScene: 'panjinlian_wusong' }
        ],
        'panjinlian_west': [
            { id: 'secret', title: '秘密交往', description: '与西门庆偷偷相会', nextScene: 'secret_meeting' },
            { id: 'refuse', title: '拒绝诱惑', description: '坚守本心，拒绝西门庆', nextScene: 'refuse_west' },
            { id: 'confession', title: '向武大坦白', description: '告诉武大郎真相', nextScene: 'confession_wuda' }
        ],
        'panjinlian_independent': [
            { id: 'business', title: '经商致富', description: '利用美貌和智慧经商', nextScene: 'business_success' },
            { id: 'escape', title: '远走高飞', description: '离开清河县，开始新生活', nextScene: 'escape_town' }
        ],
        'panjinlian_wusong': [
            { id: 'express', title: '表白心意', description: '向武松表白', nextScene: 'confession_wusong' },
            { id: 'wait', title: '默默等待', description: '等待合适的时机', nextScene: 'wait_opportunity' }
        ],
        
        // 西门庆的剧情分支
        'ximenqing-intro': [
            { id: 'pursue', title: '追求潘金莲', description: '设计接近她', nextScene: 'ximenqing_pursue' },
            { id: 'business', title: '专心做生意', description: '不招惹是非', nextScene: 'ximenqing_business' },
            { id: 'power', title: '扩大势力', description: '扩张商业版图', nextScene: 'ximenqing_power' },
            { id: 'help', title: '帮助武大郎', description: '暗中扶持', nextScene: 'ximenqing_help' }
        ],
        'ximenqing_pursue': [
            { id: 'gift', title: '送礼物', description: '用金银珠宝打动她', nextScene: 'send_gifts' },
            { id: 'scheme', title: '设计陷害', description: '设计让武大郎离开', nextScene: 'frame_wuda' },
            { id: 'honest', title: '真诚表白', description: '真心实意向潘金莲表白', nextScene: 'honest_confession' }
        ],
        
        // 武大郎的剧情分支
        'wudalang-intro': [
            { id: 'continue', title: '继续卖炊饼', description: '知足常乐', nextScene: 'wuda_continue' },
            { id: 'expand', title: '扩大生意', description: '开炊饼铺', nextScene: 'wuda_expand' },
            { id: 'follow', title: '跟着武松', description: '出去闯荡', nextScene: 'wuda_follow' },
            { id: 'remarry', title: '另寻姻缘', description: '成全潘金莲', nextScene: 'wuda_remarry' }
        ],
        'wuda_continue': [
            { id: 'accept', title: '接受现状', description: '继续平凡的生活', nextScene: 'peaceful_life' },
            { id: 'notice', title: '察觉异常', description: '发现潘金莲的变化', nextScene: 'notice_change' }
        ],
        
        // 武松的剧情分支
        'wusong-intro': [
            { id: 'protect', title: '保护哥哥', description: '寸步不离', nextScene: 'wusong_protect' },
            { id: 'persuade', title: '劝说嫂嫂', description: '让她回心转意', nextScene: 'wusong_persuade' },
            { id: 'duty', title: '继续当差', description: '建功立业', nextScene: 'wusong_duty' },
            { id: 'investigate', title: '设计试探', description: '查明真相', nextScene: 'wusong_investigate' }
        ],
        'wusong_protect': [
            { id: 'watch', title: '暗中监视', description: '暗中观察嫂嫂的举动', nextScene: 'secret_watch' },
            { id: 'confront', title: '正面质问', description: '直接质问西门庆', nextScene: 'confront_west' }
        ],
        
        // 通用结局分支
        'calm_ending': [
            { id: 'ending1', title: '圆满结局', description: '与武大郎幸福生活', nextScene: 'final_peaceful' },
            { id: 'ending2', title: '重新开始', description: '重新选择剧情', nextScene: 'intro' }
        ],
        'secret_meeting': [
            { id: 'ending3', title: '悲剧结局', description: '武松归来...', nextScene: 'final_tragedy' },
            { id: 'ending4', title: '私奔结局', description: '与西门庆远走高飞', nextScene: 'final_escape' }
        ]
    };
    
    const charId = selectedCharacter ? selectedCharacter.id : 'panjinlian';
    const key = `${charId}-${sceneName}`;
    
    // 如果有角色特定的分支就返回，否则返回通用分支
    if (allBranches[key]) {
        return allBranches[key];
    }
    
    // 如果当前场景没有分支，返回默认的结局选项
    return allBranches['calm_ending'] || [
        { id: 'replay', title: '重新开始', description: '重新体验故事', nextScene: 'intro' },
        { id: 'menu', title: '返回菜单', description: '回到主菜单', nextScene: 'menu' }
    ];
}

// 显示选项浮层
function showChoicesOverlay(branches) {
    const choicesPanel = document.querySelector('.choices-panel');
    const choicesButtons = document.getElementById('choicesButtons');
    
    if (!choicesPanel || !choicesButtons) return;
    
    const sceneKey = currentVideoState.scene;
    const charId = selectedCharacter ? selectedCharacter.id : 'default';
    const fullSceneKey = `${charId}-${sceneKey}`;
    
    // 生成演示统计（如果没有数据）
    playerChoiceStats.generateDemoStats(fullSceneKey, branches.length);
    
    // 计算最大选择数（用于显示热门程度）
    const stats = playerChoiceStats.getAllStats(fullSceneKey);
    const maxChoice = Math.max(...Object.values(stats), 1);
    
    choicesButtons.innerHTML = branches.map((branch, index) => {
        const choiceId = branch.id;
        const choiceCount = playerChoiceStats.getChoiceStats(fullSceneKey, choiceId);
        const percentage = playerChoiceStats.getPercentage(fullSceneKey, choiceId);
        const hotLevel = choiceCount >= maxChoice * 0.7 ? 'hot' : (choiceCount >= maxChoice * 0.4 ? 'warm' : 'cold');
        const hotIcon = hotLevel === 'hot' ? '🔥' : (hotLevel === 'warm' ? '📈' : '');
        
        return `
        <button class="choice-button" onclick="selectChoice('${branch.nextScene}', '${choiceId}')" data-choice-id="${choiceId}" style="animation-delay: ${index * 0.15}s">
            <span class="choice-number">${index + 1}</span>
            <span class="choice-content">
                <span class="choice-title">${branch.title} ${hotIcon}</span>
                <span class="choice-desc">${branch.description}</span>
                <div class="choice-stats">
                    <div class="stats-bar">
                        <div class="stats-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="stats-text">${choiceCount}人选择 (${percentage}%)</span>
                </div>
            </span>
            <svg class="choice-arrow" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
        </button>
    `}).join('');
    
    // 显示选项面板
    choicesPanel.style.opacity = '1';
    choicesPanel.style.transform = 'translateX(0)';
    currentVideoState.choicesVisible = true;
    updateVideoProgress();
}

// 选择剧情分支
function selectChoice(nextScene, choiceId) {
    const choicesPanel = document.querySelector('.choices-panel');
    if (choicesPanel) {
        choicesPanel.style.opacity = '0';
        choicesPanel.style.transform = 'translateX(-20px)';
    }
    currentVideoState.choicesVisible = false;
    
    // 记录玩家选择
    if (choiceId) {
        const sceneKey = currentVideoState.scene;
        const charId = selectedCharacter ? selectedCharacter.id : 'default';
        const fullSceneKey = `${charId}-${sceneKey}`;
        playerChoiceStats.recordChoice(fullSceneKey, choiceId);
    }
    
    // 如果选择返回菜单
    if (nextScene === 'menu') {
        showMainMenu();
        return;
    }
    
    setTimeout(() => {
        playVideoSegment(nextScene);
    }, 500);
}

// 播放真实视频
function playRealVideo(videoUrl) {
    const videoBg = document.querySelector('.video-background');
    if (!videoBg) return;
    
    videoBg.innerHTML = `
        <video id="mainVideo" src="${videoUrl}" autoplay loop playsinline style="width:100%;height:100%;object-fit:cover;">
            您的浏览器不支持视频播放
        </video>
        <div class="video-error" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;text-align:center;padding:20px;background:rgba(0,0,0,0.8);border-radius:10px;display:none;">
            <p>视频加载中...</p>
        </div>
    `;
    videoBg.classList.add('has-video');
    
    const video = document.getElementById('mainVideo');
    video.addEventListener('loadeddata', function() {
        console.log('视频加载成功:', videoUrl);
    });
    video.addEventListener('error', function() {
        console.error('视频加载失败，使用背景效果');
        showSceneVisual(currentVideoState.scene);
    });
    
    // 注意：showSceneDescription 已在 playVideoSegment 中调用，避免重复调用
    const branches = getStoryBranchesForScene(currentVideoState.scene);
    setTimeout(() => { showChoicesOverlay(branches); }, 2000);
}

// 更新视频进度条
function updateVideoProgress() {
    const progressFill = document.getElementById('videoProgressFill');
    if (!progressFill) return;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 0.5;
        if (progress > 100 || !currentVideoState.choicesVisible) {
            clearInterval(interval);
            return;
        }
        progressFill.style.width = progress + '%';
    }, 150);
}

// 播放/暂停控制
function togglePlayPause() {
    const icon = document.getElementById('playPauseIcon');
    if (!icon) return;
    
    currentVideoState.isPlaying = !currentVideoState.isPlaying;
    
    if (currentVideoState.isPlaying) {
        icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    } else {
        icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    }
}

// 全屏切换
function toggleFullscreen() {
    const player = document.querySelector('.fullscreen-video-player');
    if (!player) return;
    
    if (!document.fullscreenElement) {
        player.requestFullscreen().catch(err => {});
    } else {
        document.exitFullscreen();
    }
}

// 从视频界面返回主菜单
function showMainMenuFromVideo() {
    if (confirm('确定要退出当前剧情吗？')) {
        showMainMenu();
    }
}

// 世界书数据
const worldbooksData = {
    'fantasy-basic': {
        name: '奇幻大陆',
        category: 'fantasy',
        price: 0,
        description: '经典中世纪奇幻设定',
        tags: ['剑与魔法', '龙族', '骑士'],
        icon: 'castle',
        content: `<h3>世界名称：奇幻大陆</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>这是一个剑与魔法的世界，骑士与法师并存，巨龙与精灵共同守护这片土地。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要种族</h4>
                <ul><li>人类、精灵、矮人、兽人</li></ul>
            </div>
            <div class="worldview-section">
                <h4>⚔️ 核心冲突</h4>
                <p>黑暗势力正在崛起，勇者们必须联合起来对抗邪恶。</p>
            </div>`
    },
    'scifi-basic': {
        name: '星际纪元',
        category: 'scifi',
        price: 0,
        description: '太空歌剧冒险世界',
        tags: ['星际', '冒险', '外星文明'],
        icon: 'spaceship',
        content: `<h3>世界名称：星际纪元</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>人类已经进入星际时代，探索宇宙的奥秘，与外星文明接触。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要势力</h4>
                <ul><li>星际联邦、反叛军、外星联盟</li></ul>
            </div>
            <div class="worldview-section">
                <h4>🌌 核心冲突</h4>
                <p>联邦的统治受到挑战，宇宙的和平岌岌可危。</p>
            </div>`
    },
    'modern-basic': {
        name: '都市秘闻',
        category: 'modern',
        price: 0,
        description: '现代都市隐藏秘密',
        tags: ['都市', '悬疑', '超自然'],
        icon: 'city',
        content: `<h3>世界名称：都市秘闻</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>繁华的现代都市背后隐藏着不为人知的秘密，超自然现象悄然发生。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要势力</h4>
                <ul><li>神秘组织、异能者、普通人类</li></ul>
            </div>
            <div class="worldview-section">
                <h4>🔍 核心冲突</h4>
                <p>真相与谎言交织，谁能揭开都市背后的秘密？</p>
            </div>`
    },
    'wuxia-basic': {
        name: '江湖风云',
        category: 'wuxia',
        price: 0,
        description: '快意恩仇的武侠世界',
        tags: ['武侠', '江湖', '武功'],
        icon: 'sword',
        content: `<h3>世界名称：江湖风云</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>武林纷争不断，各门各派争夺秘籍，江湖恩怨何时了。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要势力</h4>
                <ul><li>名门正派、邪派魔教、江湖散人</li></ul>
            </div>
            <div class="worldview-section">
                <h4>⚔️ 核心冲突</h4>
                <p>正邪不两立，英雄豪杰辈出，谁能称霸武林？</p>
            </div>`
    },
    'xianxia-basic': {
        name: '修仙问道',
        category: 'xianxia',
        price: 0,
        description: '逆天修行的仙侠世界',
        tags: ['修仙', '渡劫', '飞升'],
        icon: 'cloud',
        content: `<h3>世界名称：修仙问道</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>灵气充沛的修仙界，无数修士追求长生大道，逆天而行。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要势力</h4>
                <ul><li>正道宗门、魔道邪修、妖族部落</li></ul>
            </div>
            <div class="worldview-section">
                <h4>☯️ 核心冲突</h4>
                <p>仙魔大战即将爆发，谁能在这乱世中求得一线生机？</p>
            </div>`
    },
    'historical-basic': {
        name: '乱世春秋',
        category: 'historical',
        price: 0,
        description: '群雄逐鹿的历史世界',
        tags: ['历史', '争霸', '权谋'],
        icon: 'crown',
        content: `<h3>世界名称：乱世春秋</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>天下大乱，诸侯并起，英雄辈出，逐鹿中原。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要势力</h4>
                <ul><li>皇室贵族、诸侯霸主、江湖豪杰</li></ul>
            </div>
            <div class="worldview-section">
                <h4>⚔️ 核心冲突</h4>
                <p>江山如画，一时多少豪杰，谁能最终问鼎天下？</p>
            </div>`
    },
    'fantasy-epic': {
        name: '史诗幻想',
        category: 'fantasy',
        price: 299,
        description: '完整的史诗级奇幻世界',
        tags: ['史诗', '魔法', '神话'],
        icon: 'crown',
        content: `<h3>世界名称：艾尔德拉斯传奇</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>古老的艾尔德拉斯大陆承载着千年的历史，诸神的传说在这片土地上流传。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要种族</h4>
                <ul><li>人类、高等精灵、黑暗精灵、矮人、龙族、兽人、地精</li></ul>
            </div>
            <div class="worldview-section">
                <h4>⚔️ 核心冲突</h4>
                <p>远古的邪恶即将苏醒，传说中的英雄必须再次现身拯救世界。</p>
            </div>
            <div class="worldview-section">
                <h4>🏛️ 重要地点</h4>
                <p>世界树、巨龙神殿、精灵王国、矮人要塞</p>
            </div>`
    },
    'cyberpunk-ultra': {
        name: '赛博朋克',
        category: 'scifi',
        price: 399,
        description: '深度赛博朋克设定',
        tags: ['赛博朋克', '科技', '未来'],
        icon: 'circuit',
        content: `<h3>世界名称：霓虹之城2088</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>2088年的新海市，科技高度发达但贫富差距悬殊，霓虹灯照亮了每一个阴暗的角落。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要势力</h4>
                <ul><li>巨型企业、地下黑客组织、改造人军团、警察部门</li></ul>
            </div>
            <div class="worldview-section">
                <h4>🌐 核心冲突</h4>
                <p>企业掌控一切，自由意志与体制之间的战争正在上演。</p>
            </div>
            <div class="worldview-section">
                <h4>🏙️ 重要地点</h4>
                <p>浮空城、地下黑市、数据中心、义体诊所</p>
            </div>`
    },
    'ancient-mystery': {
        name: '远古秘境',
        category: 'fantasy',
        price: 249,
        description: '失落文明探险世界',
        tags: ['探险', '秘境', '宝藏'],
        icon: 'pyramid',
        content: `<h3>世界名称：失落的亚特兰蒂斯</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>传说中的亚特兰蒂斯并未消失，而是隐藏在时空的夹缝中等待被发现。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要种族</h4>
                <ul><li>亚特兰蒂斯后裔、探险者、守护灵、远古生物</li></ul>
            </div>
            <div class="worldview-section">
                <h4>🔮 核心冲突</h4>
                <p>宝藏与危险并存，谁能解开远古的谜题？</p>
            </div>
            <div class="worldview-section">
                <h4>🗺️ 重要地点</h4>
                <p>水晶宫殿、迷宫神殿、时间裂隙、深海遗迹</p>
            </div>`
    },
    'wuxia-legend': {
        name: '武侠传奇',
        category: 'wuxia',
        price: 199,
        description: '波澜壮阔的武侠史诗',
        tags: ['武侠', '传奇', '江湖'],
        icon: 'sword',
        content: `<h3>世界名称：江湖传奇</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>武林盟主失踪，江湖陷入混乱，各大势力暗流涌动。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要势力</h4>
                <ul><li>少林、武当、丐帮、魔教、唐门</li></ul>
            </div>
            <div class="worldview-section">
                <h4>⚔️ 核心冲突</h4>
                <p>阴谋与背叛交织，谁才是幕后黑手？</p>
            </div>
            <div class="worldview-section">
                <h4>🏛️ 重要地点</h4>
                <p>少林寺、武当山、黑木崖、唐门密室</p>
            </div>`
    },
    'xianxia-immortal': {
        name: '仙侠永恒',
        category: 'xianxia',
        price: 349,
        description: '宏大的修仙世界设定',
        tags: ['仙侠', '长生', '法宝'],
        icon: 'cloud',
        content: `<h3>世界名称：九天仙界</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>三千大世界，亿万小世界，修仙之路漫漫，长生可期。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要势力</h4>
                <ul><li>天庭仙庭、魔道联盟、妖族圣地、凡人王朝</li></ul>
            </div>
            <div class="worldview-section">
                <h4>☯️ 核心冲突</h4>
                <p>仙魔大战一触即发，凡人命运何去何从？</p>
            </div>
            <div class="worldview-section">
                <h4>🏛️ 重要地点</h4>
                <p>凌霄宝殿、魔域深渊、蓬莱仙岛、昆仑秘境</p>
            </div>`
    },
    'modern-supernatural': {
        name: '都市异能',
        category: 'modern',
        price: 249,
        description: '现代都市异能世界',
        tags: ['都市', '异能', '超能力'],
        icon: 'lightning',
        content: `<h3>世界名称：异能都市</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>普通都市之下隐藏着一个不为人知的异能世界，超能力者暗中活动。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要势力</h4>
                <ul><li>异能管理局、暗影组织、觉醒者联盟、普通人</li></ul>
            </div>
            <div class="worldview-section">
                <h4>⚡ 核心冲突</h4>
                <p>秘密即将暴露，异能者与普通人的战争是否不可避免？</p>
            </div>
            <div class="worldview-section">
                <h4>🏙️ 重要地点</h4>
                <p>异能学院、地下竞技场、管理局总部、神秘研究所</p>
            </div>`
    },
    'historical-epic': {
        name: '王朝霸业',
        category: 'historical',
        price: 299,
        description: '风起云涌的王朝争霸',
        tags: ['历史', '王朝', '战争'],
        icon: 'crown',
        content: `<h3>世界名称：大曜王朝</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>大曜王朝末年，内忧外患，群雄并起，天下即将大乱。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要势力</h4>
                <ul><li>皇室、世家大族、农民起义、边境诸侯</li></ul>
            </div>
            <div class="worldview-section">
                <h4>⚔️ 核心冲突</h4>
                <p>王朝更迭，英雄辈出，谁能建立新的盛世？</p>
            </div>
            <div class="worldview-section">
                <h4>🏛️ 重要地点</h4>
                <p>京城皇宫、边关要塞、江南水乡、起义军营地</p>
            </div>`
    },
    'scifi-galaxy': {
        name: '银河帝国',
        category: 'scifi',
        price: 399,
        description: '浩瀚银河的星际帝国',
        tags: ['银河', '帝国', '战争'],
        icon: 'spaceship',
        content: `<h3>世界名称：银河帝国</h3>
            <div class="worldview-section">
                <h4>📜 世界背景</h4>
                <p>银河帝国统治着上千个星系，但叛乱之火已经点燃。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要势力</h4>
                <ul><li>银河帝国、反叛联盟、外星文明、商业联盟</li></ul>
            </div>
            <div class="worldview-section">
                <h4>🌌 核心冲突</h4>
                <p>帝国的统治摇摇欲坠，自由与独裁的战争即将爆发。</p>
            </div>
            <div class="worldview-section">
                <h4>🚀 重要地点</h4>
                <p>帝国首都、反叛军基地、中立星系、远古遗迹</p>
            </div>`
    },
    'panjinlian-ximenqing': {
        name: '金瓶梅',
        category: 'historical',
        price: 0,
        description: '北宋年间的恩怨情仇',
        tags: ['爱情', '悲剧', '权谋'],
        icon: 'crown',
        characters: [
            {
                id: 'panjinlian',
                name: '潘金莲',
                avatar: 'female',
                description: '武大郎的妻子，美貌如花却命运坎坷',
                traits: ['美貌', '聪慧', '不甘平凡']
            },
            {
                id: 'ximenqing',
                name: '西门庆',
                avatar: 'male',
                description: '清河县的富商，风流倜傥',
                traits: ['富有', '多情', '权势']
            },
            {
                id: 'wudalang',
                name: '武大郎',
                avatar: 'male',
                description: '潘金莲的丈夫，身材矮小但心地善良',
                traits: ['善良', '老实', '懦弱']
            },
            {
                id: 'wusong',
                name: '武松',
                avatar: 'male',
                description: '武大郎的弟弟，打虎英雄，武艺高强',
                traits: ['勇猛', '正义', '重情义']
            }
        ],
        content: `<h3>世界名称：金瓶梅</h3>
            <div class="worldview-section">
                <h4>📜 时代背景</h4>
                <p>北宋年间，山东清河县，市井繁华，人情冷暖交织。</p>
            </div>
            <div class="worldview-section">
                <h4>👥 主要人物</h4>
                <ul>
                    <li><strong>潘金莲</strong>：武大郎之妻，美貌动人却不甘于平凡生活</li>
                    <li><strong>西门庆</strong>：清河县首富，风流成性，权倾一方</li>
                    <li><strong>武大郎</strong>：卖炊饼的小贩，老实本分</li>
                    <li><strong>武松</strong>：打虎英雄，武大郎的弟弟</li>
                </ul>
            </div>
            <div class="worldview-section">
                <h4>💔 核心冲突</h4>
                <p>潘金莲与西门庆的私情，引发了一连串的悲剧事件，改变了所有人的命运。</p>
            </div>
            <div class="worldview-section">
                <h4>📍 重要地点</h4>
                <p>清河县、狮子楼、武大郎家、西门府</p>
            </div>`
    }
};

// 玩家背包（内置金瓶梅世界书）
let playerBackpack = {
    worldbooks: ['panjinlian-ximenqing']
};

// 分类数据
const categories = [
    { id: 'all', name: '全部', icon: 'grid' },
    { id: 'fantasy', name: '奇幻', icon: 'castle' },
    { id: 'scifi', name: '科幻', icon: 'spaceship' },
    { id: 'wuxia', name: '武侠', icon: 'sword' },
    { id: 'xianxia', name: '仙侠', icon: 'cloud' },
    { id: 'modern', name: '都市', icon: 'city' },
    { id: 'historical', name: '历史', icon: 'crown' }
];

// 自定义图标SVG
const iconSVGs = {
    castle: `<svg viewBox="0 0 48 48" fill="currentColor">
        <path d="M24 4L4 12v24l8-4 8 4 8-4 8 4 8-4V12L24 4zm-4 20v8h-4v-8H8v-4l8-4 8 4v4h-4zm8 0v8h4v-8h4v-4l-8-4-8 4v4h4z"/>
    </svg>`,
    spaceship: `<svg viewBox="0 0 48 48" fill="currentColor">
        <path d="M46 20L30 4H2L46 20zm-2 14L30 44H2L44 34zM30 14l12 6-12 6-12-6 12-6z"/>
    </svg>`,
    city: `<svg viewBox="0 0 48 48" fill="currentColor">
        <path d="M40 8h-4V4h-4v4h-4V4h-4v4h-4V4h-4v4H8v32h32V8zM12 36H8v-8h4v8zm8 0h-4v-4h4v4zm0-6h-4v-8h4v8zm8 6h-4v-4h4v4zm0-6h-4v-2h4v2zm0-4h-4v-4h4v4zm8 10h-4v-8h4v8z"/>
    </svg>`,
    sword: `<svg viewBox="0 0 48 48" fill="currentColor">
        <path d="M40 36V12l-8-4-4 2-4-2-8 4v24l8 4 4-2 4 2 8-4zM24 4L8 14v28l8 6 4-2 4 2 8-6V14L24 4z"/>
        <path d="M26 22h4v12h-4z"/>
    </svg>`,
    cloud: `<svg viewBox="0 0 48 48" fill="currentColor">
        <path d="M36 26c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-18 8c-2.67 0-8 1.34-8 4v2h20v-2c0-2.66-5.33-4-8-4zm22-10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-22 4c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
    </svg>`,
    crown: `<svg viewBox="0 0 48 48" fill="currentColor">
        <path d="M24 4L14 14l2 12 10-6 10 6 2-12L24 4zm-4 28v8h8v-8h-8z"/>
    </svg>`,
    circuit: `<svg viewBox="0 0 48 48" fill="currentColor">
        <path d="M40 8h-8v8h-8v8h-8v8H8v8h8v-8h8v-8h8v-8h8V8z"/>
        <circle cx="24" cy="24" r="4"/>
    </svg>`,
    pyramid: `<svg viewBox="0 0 48 48" fill="currentColor">
        <path d="M24 4L4 40h40L24 4zm0 12l8 12-8 4-8-4 8-12z"/>
    </svg>`,
    lightning: `<svg viewBox="0 0 48 48" fill="currentColor">
        <path d="M24 4L10 40h8L20 28h8l2 12h8L24 4z"/>
    </svg>`,
    grid: `<svg viewBox="0 0 48 48" fill="currentColor">
        <path d="M8 8h8v8H8zm0 12h8v8H8zm0 12h8v8H8zm12-24h8v8h-8zm0 12h8v8h-8zm0 12h8v8h-8zm12-24h8v8h-8zm0 12h8v8h-8zm0 12h8v8h-8z"/>
    </svg>`
};

// 显示商店界面
function showStore() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="world-creator-background">
            <div class="world-creator-bg-layer"></div>
            
            <button class="back-btn" onclick="showCreateWorld()">
                <svg viewBox="0 0 24 24" class="back-icon"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                返回
            </button>
            
            <div class="world-creator-header">
                <h1 class="world-creator-title">世界书商店</h1>
                <p class="world-creator-subtitle">选择一个现成的世界观开始你的冒险</p>
            </div>
            
            <!-- 分类筛选栏 -->
            <div class="store-filters">
                <div class="category-tabs">
                    ${categories.map(cat => `
                        <button 
                            class="category-tab ${cat.id === 'all' ? 'active' : ''}" 
                            onclick="filterWorldbooks('${cat.id}')"
                        >
                            ${iconSVGs[cat.icon]}
                            <span>${cat.name}</span>
                        </button>
                    `).join('')}
                </div>
                
                <!-- 价格筛选 -->
                <div class="price-filter">
                    <label class="filter-option">
                        <input type="radio" name="priceFilter" value="all" checked onclick="filterWorldbooks()">
                        <span>全部</span>
                    </label>
                    <label class="filter-option">
                        <input type="radio" name="priceFilter" value="free" onclick="filterWorldbooks()">
                        <span>免费</span>
                    </label>
                    <label class="filter-option">
                        <input type="radio" name="priceFilter" value="premium" onclick="filterWorldbooks()">
                        <span>付费</span>
                    </label>
                </div>
            </div>
            
            <!-- 世界书列表 -->
            <div class="store-content">
                <div class="worldbook-grid" id="worldbookGrid">
                    ${Object.entries(worldbooksData).map(([id, book]) => `
                        <div class="worldbook-card ${book.price === 0 ? 'free' : 'premium'}" onclick="selectWorldbook('${id}')" data-category="${book.category}" data-price="${book.price === 0 ? 'free' : 'premium'}">
                            <div class="worldbook-icon-wrapper">
                                ${iconSVGs[book.icon]}
                            </div>
                            <h4>${book.name}</h4>
                            <p class="worldbook-desc">${book.description}</p>
                            <div class="worldbook-tags">
                                ${book.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
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
}

// 筛选世界书
function filterWorldbooks(category = null) {
    const selectedCategory = category || document.querySelector('.category-tab.active')?.getAttribute('onclick').match(/'([^']+)'/)[1] || 'all';
    const priceFilter = document.querySelector('input[name="priceFilter"]:checked')?.value || 'all';
    
    const cards = document.querySelectorAll('.worldbook-card');
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const cardPrice = card.getAttribute('data-price');
        
        const categoryMatch = selectedCategory === 'all' || cardCategory === selectedCategory;
        const priceMatch = priceFilter === 'all' || cardPrice === priceFilter;
        
        card.style.display = categoryMatch && priceMatch ? 'block' : 'none';
    });
}

// 选择世界书
function selectWorldbook(worldbookId, fromBackpack = false) {
    const worldbook = worldbooksData[worldbookId];
    if (!worldbook) return;
    
    generatedWorldview = worldbook.content;
    
    // 如果世界书有角色列表，显示角色选择界面
    if (worldbook.characters && worldbook.characters.length > 0) {
        showCharacterSelect(worldbookId, worldbook);
    } else {
        alert(`已选择世界书：${worldbook.name}\n\n即将进入这个世界！`);
        
        // 直接进入开场
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="world-creator-background">
                <div class="world-creator-bg-layer"></div>
                <div class="step-container">
                    <div class="step-header">
                        <span class="step-number">03</span>
                        <h2>世界开场</h2>
                    </div>
                    <div class="opening-screen">
                        <div class="opening-content" id="openingContent"></div>
                        <div class="opening-progress-bar">
                            <div class="opening-progress" id="openingProgress"></div>
                        </div>
                        <p class="opening-hint">点击任意位置继续...</p>
                    </div>
                </div>
            </div>
        `;
        
        generateOpening();
    }
}

// 显示背包界面
function showBackpack() {
    const container = document.querySelector('.container');
    
    const backpackWorldbooks = playerBackpack.worldbooks.map(id => worldbooksData[id]).filter(Boolean);
    
    container.innerHTML = `
        <div class="world-creator-background">
            <div class="world-creator-bg-layer"></div>
            
            <button class="back-btn" onclick="showCreateWorld()">
                <svg viewBox="0 0 24 24" class="back-icon"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                返回
            </button>
            
            <div class="world-creator-header">
                <h1 class="world-creator-title">背包</h1>
                <p class="world-creator-subtitle">你的世界书收藏</p>
            </div>
            
            <div class="store-content">
                ${backpackWorldbooks.length > 0 ? `
                    <div class="worldbook-grid">
                        ${backpackWorldbooks.map(worldbook => `
                            <div 
                                class="worldbook-card ${worldbook.price === 0 ? 'free' : 'premium'}" 
                                data-category="${worldbook.category}"
                                data-price="${worldbook.price === 0 ? 'free' : 'premium'}"
                                onclick="selectWorldbook('${Object.keys(worldbooksData).find(key => worldbooksData[key].name === worldbook.name)}', true)"
                            >
                                <div class="worldbook-icon-wrapper">
                                    ${iconSVGs[worldbook.icon] || iconSVGs['grid']}
                                </div>
                                <h4>${worldbook.name}</h4>
                                <p class="worldbook-desc">${worldbook.description}</p>
                                <div class="worldbook-tags">
                                    ${worldbook.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                                <div class="worldbook-price">
                                    <span class="${worldbook.price === 0 ? 'free-text' : 'premium-text'}">
                                        ${worldbook.price === 0 ? '免费' : `¥${worldbook.price}`}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <svg viewBox="0 0 48 48" fill="currentColor" class="empty-icon">
                            <path d="M20 8h-3V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-5 14H9v-2h6v2zm3-5H9V9h8v8z"/>
                        </svg>
                        <p class="empty-text">背包是空的</p>
                        <p class="empty-hint">去商店购买一些世界书吧！</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// 显示角色选择界面
function showCharacterSelect(worldbookId, worldbook) {
    const container = document.querySelector('.container');
    
    container.innerHTML = `
        <div class="world-creator-background">
            <div class="world-creator-bg-layer"></div>
            
            <button class="back-btn" onclick="showBackpack()">
                <svg viewBox="0 0 24 24" class="back-icon"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                返回
            </button>
            
            <div class="world-creator-header">
                <h1 class="world-creator-title">${worldbook.name}</h1>
                <p class="world-creator-subtitle">选择你要扮演的角色</p>
            </div>
            
            <div class="character-select-content">
                <div class="character-grid">
                    ${worldbook.characters.map(char => `
                        <div class="character-card" onclick="selectCharacter('${worldbookId}', '${char.id}')">
                            <div class="character-avatar">
                                ${char.avatar === 'female' ? quickIcons.female : quickIcons.male}
                            </div>
                            <h4 class="character-name">${char.name}</h4>
                            <p class="character-desc">${char.description}</p>
                            <div class="character-traits">
                                ${char.traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// 选择角色并进入世界
function selectCharacter(worldbookId, characterId) {
    const worldbook = worldbooksData[worldbookId];
    const character = worldbook.characters.find(c => c.id === characterId);
    
    if (!character) return;
    
    // 保存选中的角色
    selectedCharacter = character;
    
    alert(`你选择扮演：${character.name}\n\n即将进入${worldbook.name}的世界！`);
    
    // 进入开场
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="world-creator-background">
            <div class="world-creator-bg-layer"></div>
            <div class="step-container">
                <div class="step-header">
                    <span class="step-number">03</span>
                    <h2>世界开场</h2>
                </div>
                <div class="opening-screen">
                    <div class="opening-content" id="openingContent"></div>
                    <div class="opening-progress-bar">
                        <div class="opening-progress" id="openingProgress"></div>
                    </div>
                    <p class="opening-hint">点击任意位置继续...</p>
                </div>
            </div>
        </div>
    `;
    
    generateOpening();
}

// 选中的角色
let selectedCharacter = null;

// 便捷生成图标
const quickIcons = {
    wuxia: `<svg viewBox="0 0 48 48" fill="currentColor"><path d="M40 36V12l-8-4-4 2-4-2-8 4v24l8 4 4-2 4 2 8-4zM24 4L8 14v28l8 6 4-2 4 2 8-6V14L24 4z"/><path d="M26 22h4v12h-4z"/></svg>`,
    xianxia: `<svg viewBox="0 0 48 48" fill="currentColor"><path d="M36 26c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-18 8c-2.67 0-8 1.34-8 4v2h20v-2c0-2.66-5.33-4-8-4zm22-10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-22 4c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>`,
    fantasy: `<svg viewBox="0 0 48 48" fill="currentColor"><path d="M24 4L4 12v24l8-4 8 4 8-4 8 4 8-4V12L24 4zm-4 20v8h-4v-8H8v-4l8-4 8 4v4h-4zm8 0v8h4v-8h4v-4l-8-4-8 4v4h4z"/></svg>`,
    scifi: `<svg viewBox="0 0 48 48" fill="currentColor"><path d="M46 20L30 4H2L46 20zm-2 14L30 44H2L44 34zM30 14l12 6-12 6-12-6 12-6z"/></svg>`,
    modern: `<svg viewBox="0 0 48 48" fill="currentColor"><path d="M40 8h-4V4h-4v4h-4V4h-4v4h-4V4h-4v4H8v32h32V8zM12 36H8v-8h4v8zm8 0h-4v-4h4v4zm0-6h-4v-8h4v8zm8 6h-4v-4h4v4zm0-6h-4v-2h4v2zm0-4h-4v-4h4v4zm8 10h-4v-8h4v8z"/></svg>`,
    historical: `<svg viewBox="0 0 48 48" fill="currentColor"><path d="M24 4L14 14l2 12 10-6 10 6 2-12L24 4zm-4 28v8h8v-8h-8z"/></svg>`,
    female: `<svg viewBox="0 0 48 48" fill="currentColor"><path d="M24 2C11.84 2 2 11.84 2 24s9.84 22 22 22 22-9.84 22-22S36.16 2 24 2zm-4 30c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm8-18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>`,
    male: `<svg viewBox="0 0 48 48" fill="currentColor"><path d="M24 2C11.84 2 2 11.84 2 24s9.84 22 22 22 22-9.84 22-22S36.16 2 24 2zm-4 34c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm8-18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>`,
    generate: `<svg viewBox="0 0 48 48" fill="currentColor"><path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-2 30l-4-4 4-4-4-4 10 8-10 8z"/></svg>`
};

// 显示便捷生成界面
function showQuickGenerate() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="world-creator-background">
            <div class="world-creator-bg-layer"></div>
            
            <button class="back-btn" onclick="showCreateWorld()">
                <svg viewBox="0 0 24 24" class="back-icon"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                返回
            </button>
            
            <div class="world-creator-header">
                <h1 class="world-creator-title">便捷生成</h1>
                <p class="world-creator-subtitle">选择类型和情节，快速创建世界观</p>
            </div>
            
            <div class="quick-generate-content">
                <!-- 选择类型 -->
                <div class="quick-section">
                    <h3 class="section-title">选择世界类型</h3>
                    <div class="type-grid">
                        <label class="type-card" data-type="wuxia">
                            <input type="radio" name="worldType" value="wuxia" checked>
                            <span class="type-icon">${quickIcons.wuxia}</span>
                            <span class="type-name">武侠</span>
                        </label>
                        <label class="type-card" data-type="xianxia">
                            <input type="radio" name="worldType" value="xianxia">
                            <span class="type-icon">${quickIcons.xianxia}</span>
                            <span class="type-name">仙侠</span>
                        </label>
                        <label class="type-card" data-type="fantasy">
                            <input type="radio" name="worldType" value="fantasy">
                            <span class="type-icon">${quickIcons.fantasy}</span>
                            <span class="type-name">奇幻</span>
                        </label>
                        <label class="type-card" data-type="scifi">
                            <input type="radio" name="worldType" value="scifi">
                            <span class="type-icon">${quickIcons.scifi}</span>
                            <span class="type-name">科幻</span>
                        </label>
                        <label class="type-card" data-type="modern">
                            <input type="radio" name="worldType" value="modern">
                            <span class="type-icon">${quickIcons.modern}</span>
                            <span class="type-name">都市</span>
                        </label>
                        <label class="type-card" data-type="historical">
                            <input type="radio" name="worldType" value="historical">
                            <span class="type-icon">${quickIcons.historical}</span>
                            <span class="type-name">历史</span>
                        </label>
                    </div>
                </div>
                
                <!-- 选择主角设定 -->
                <div class="quick-section">
                    <h3 class="section-title">主角设定</h3>
                    <div class="type-grid">
                        <label class="type-card" data-tag="single-female">
                            <input type="radio" name="protagonist" value="single-female">
                            <span class="type-icon">${quickIcons.female}</span>
                            <span class="type-name">单女主</span>
                        </label>
                        <label class="type-card" data-tag="multi-female">
                            <input type="radio" name="protagonist" value="multi-female">
                            <span class="type-icon">${quickIcons.female}${quickIcons.female}${quickIcons.female}</span>
                            <span class="type-name">多女主</span>
                        </label>
                        <label class="type-card" data-tag="single-male">
                            <input type="radio" name="protagonist" value="single-male">
                            <span class="type-icon">${quickIcons.male}</span>
                            <span class="type-name">单男主</span>
                        </label>
                        <label class="type-card" data-tag="multi-male">
                            <input type="radio" name="protagonist" value="multi-male">
                            <span class="type-icon">${quickIcons.male}${quickIcons.male}${quickIcons.male}</span>
                            <span class="type-name">多男主</span>
                        </label>
                    </div>
                </div>
                
                <!-- 选择情节标签 -->
                <div class="quick-section">
                    <h3 class="section-title">情节标签（可多选）</h3>
                    <div class="tag-grid">
                        <label class="tag-card">
                            <input type="checkbox" name="plotTags" value="pretend-weak">
                            <span>扮猪吃虎</span>
                        </label>
                        <label class="tag-card">
                            <input type="checkbox" name="plotTags" value="golden-finger">
                            <span>金手指</span>
                        </label>
                        <label class="tag-card">
                            <input type="checkbox" name="plotTags" value="rebirth">
                            <span>重生</span>
                        </label>
                        <label class="tag-card">
                            <input type="checkbox" name="plotTags" value="system">
                            <span>系统流</span>
                        </label>
                        <label class="tag-card">
                            <input type="checkbox" name="plotTags" value="time-travel">
                            <span>穿越</span>
                        </label>
                        <label class="tag-card">
                            <input type="checkbox" name="plotTags" value="cultivation">
                            <span>修炼升级</span>
                        </label>
                        <label class="tag-card">
                            <input type="checkbox" name="plotTags" value="strategy">
                            <span>权谋</span>
                        </label>
                        <label class="tag-card">
                            <input type="checkbox" name="plotTags" value="adventure">
                            <span>冒险</span>
                        </label>
                        <label class="tag-card">
                            <input type="checkbox" name="plotTags" value="comedy">
                            <span>轻松搞笑</span>
                        </label>
                        <label class="tag-card">
                            <input type="checkbox" name="plotTags" value="dark">
                            <span>暗黑</span>
                        </label>
                        <label class="tag-card">
                            <input type="checkbox" name="plotTags" value="romance">
                            <span>恋爱</span>
                        </label>
                        <label class="tag-card">
                            <input type="checkbox" name="plotTags" value="tragedy">
                            <span>悲剧</span>
                        </label>
                    </div>
                </div>
                
                <button class="generate-btn" onclick="quickGenerateWorldview()">
                    <span class="btn-text">${quickIcons.generate} 开始生成</span>
                </button>
            </div>
        </div>
    `;
}

// 便捷生成世界观
function quickGenerateWorldview() {
    const worldType = document.querySelector('input[name="worldType"]:checked')?.value || 'fantasy';
    const protagonist = document.querySelector('input[name="protagonist"]:checked')?.value || 'single-male';
    const plotTags = Array.from(document.querySelectorAll('input[name="plotTags"]:checked')).map(e => e.value);
    
    // 根据选择生成世界观
    generatedWorldview = generateQuickWorldview(worldType, protagonist, plotTags);
    
    // 显示生成的世界观
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="world-creator-background">
            <div class="world-creator-bg-layer"></div>
            <div class="step-container">
                <div class="step-header">
                    <span class="step-number">02</span>
                    <h2>生成的世界观</h2>
                    <button class="regenerate-btn" onclick="showQuickGenerate()">
                        🔄 重新选择
                    </button>
                </div>
                <div class="worldview-display">
                    <div class="worldview-content" id="worldviewContent">${generatedWorldview}</div>
                </div>
                <div class="step2-buttons">
                    <button class="back-btn-small" onclick="showQuickGenerate()">返回修改</button>
                    <button class="confirm-btn" onclick="confirmWorldviewFromQuick()">
                        <span>🎯 确认世界观</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 根据选择快速生成世界观
function generateQuickWorldview(worldType, protagonist, plotTags) {
    const typeSettings = {
        wuxia: { name: '江湖风云', bg: '武林世界', races: ['名门正派', '邪派魔教', '江湖散人', '隐世家族'], icon: '⚔️' },
        xianxia: { name: '修真界', bg: '仙侠世界', races: ['修仙者', '妖族', '魔族', '凡人'], icon: '☯️' },
        fantasy: { name: '魔法大陆', bg: '奇幻世界', races: ['人类', '精灵', '矮人', '兽人'], icon: '🧙' },
        scifi: { name: '星际帝国', bg: '科幻世界', races: ['人类', '外星文明', 'AI', '改造人'], icon: '🚀' },
        modern: { name: '都市秘境', bg: '现代都市', races: ['普通人', '异能者', '神秘组织', '超自然生物'], icon: '🌆' },
        historical: { name: '乱世春秋', bg: '历史世界', races: ['皇室贵族', '江湖豪杰', '平民百姓', '异国使者'], icon: '🏺' }
    };
    
    const protagSettings = {
        'single-female': '一位天赋异禀的少女',
        'multi-female': '一位拥有多位红颜知己的少年',
        'single-male': '一位身负秘密的少年',
        'multi-male': '一位拥有众多兄弟的少女'
    };
    
    const tagDescriptions = {
        'pretend-weak': '表面看似平凡，实则实力深不可测',
        'golden-finger': '意外获得了强大的金手指',
        'rebirth': '重生回到过去，弥补遗憾',
        'system': '觉醒了神秘的系统能力',
        'time-travel': '意外穿越到这个世界',
        'cultivation': '踏上了修炼升级的道路',
        'strategy': '精通权谋策略，步步为营',
        'adventure': '充满未知的冒险之旅',
        'comedy': '轻松搞笑的日常故事',
        'dark': '黑暗深沉的故事基调',
        'romance': '浪漫动人的爱情故事',
        'tragedy': '悲壮感人的故事情节'
    };
    
    const type = typeSettings[worldType];
    const protag = protagSettings[protagonist];
    
    let tagText = plotTags.length > 0 ? plotTags.map(t => tagDescriptions[t]).join('，') : '展开一段传奇故事';
    
    return `
        <h3>${type.icon} 世界名称：${type.name}</h3>
        <div class="worldview-section">
            <h4>📜 世界背景</h4>
            <p>这是一个充满传奇色彩的${type.bg}，强者辈出，机遇与危险并存。</p>
        </div>
        <div class="worldview-section">
            <h4>👥 主要势力</h4>
            <ul>
                ${type.races.map(r => `<li>• ${r}</li>`).join('')}
            </ul>
        </div>
        <div class="worldview-section">
            <h4>🎭 主角设定</h4>
            <p>${protag}，${tagText}。</p>
        </div>
        <div class="worldview-section">
            <h4>📖 情节标签</h4>
            <div class="plot-tags">
                ${plotTags.map(t => `<span class="plot-tag">#${tagDescriptions[t]}</span>`).join('')}
            </div>
        </div>
        <div class="worldview-section">
            <h4>⚔️ 核心冲突</h4>
            <p>在这个世界中，主角将面对各种挑战和机遇，书写属于自己的传奇故事。</p>
        </div>
    `;
}

// 从便捷生成确认世界观
function confirmWorldviewFromQuick() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="world-creator-background">
            <div class="world-creator-bg-layer"></div>
            <div class="step-container">
                <div class="step-header">
                    <span class="step-number">03</span>
                    <h2>世界开场</h2>
                </div>
                <div class="opening-screen">
                    <div class="opening-content" id="openingContent"></div>
                    <div class="opening-progress-bar">
                        <div class="opening-progress" id="openingProgress"></div>
                    </div>
                    <p class="opening-hint">点击任意位置继续...</p>
                </div>
            </div>
        </div>
    `;
    
    generateOpening();
}

// 其他功能函数
function joinWorld() {
    alert('🚪 加入他人的世界\n\n输入世界ID或搜索公开世界，开启冒险之旅！');
}

function customizeWorldBook() {
    alert('📚 自定义世界书\n\n编写你的世界设定、历史背景、人物关系...');
}

function customizeCharacterCard() {
    alert('🎭 自定义性格卡\n\n设计你的角色外貌、性格、技能和背景故事...');
}

function showAbout() {
    alert('ℹ️ 关于妄想商铺\n\n一个充满无限可能的幻想世界游戏！在这里，你可以创建属于自己的世界，探索他人的幻想，书写独特的故事。');
}

// 添加淡出动画样式
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
    @keyframes fadeOutDown {
        0% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(50px); }
    }
    
    @keyframes fadeInUp {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    
    /* 加载界面 */
    .loading-screen {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%);
    }
    
    .loading-content { text-align: center; z-index: 10; }
    
    .loading-ring {
        width: 60px;
        height: 60px;
        border: 3px solid rgba(168, 85, 247, 0.3);
        border-top-color: #a855f7;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .loading-text {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.2rem;
        margin-bottom: 20px;
    }
    
    .loading-progress {
        width: 200px;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        margin: 0 auto;
        overflow: hidden;
    }
    
    .loading-bar {
        height: 100%;
        background: linear-gradient(90deg, #a855f7, #c084fc);
        transition: width 0.2s ease;
    }
    
    /* 主菜单 */
    .menu-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%);
    }
    
    .menu-container {
        text-align: center;
        animation: fadeInUp 0.5s ease-out;
    }
    
    .menu-title {
        font-size: clamp(2.5rem, 8vw, 5rem);
        color: transparent;
        background: linear-gradient(90deg, #fdf4ff, #a855f7, #c084fc, #a855f7, #fdf4ff);
        background-size: 200% auto;
        background-clip: text;
        -webkit-background-clip: text;
        animation: shimmer 3s linear infinite;
        margin-bottom: 40px;
    }
    
    @keyframes shimmer {
        0% { background-position: 0% center; }
        100% { background-position: 200% center; }
    }
    
    .menu-nav {
        display: flex;
        flex-direction: column;
        gap: 15px;
        align-items: center;
    }
    
    .menu-btn {
        padding: 15px 30px;
        font-size: 1.2rem;
        font-weight: bold;
        color: white;
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3));
        border: 2px solid rgba(168, 85, 247, 0.5);
        border-radius: 30px;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        width: 220px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
    
    .menu-btn:hover {
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.5), rgba(99, 102, 241, 0.5));
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3);
    }
    
    .btn-icon {
        width: 24px;
        height: 24px;
        fill: currentColor;
        opacity: 0.9;
    }
    
    /* 创建世界界面 */
    .world-creator-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%);
        overflow-y: auto;
    }
    
    .world-creator-bg-layer {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(ellipse at 20% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
        pointer-events: none;
    }
    
    .back-btn {
        position: fixed;
        top: 20px;
        left: 20px;
        padding: 10px 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.8);
        background: rgba(168, 85, 247, 0.2);
        border: 1px solid rgba(168, 85, 247, 0.4);
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 100;
    }
    
    .back-btn:hover {
        background: rgba(168, 85, 247, 0.4);
        transform: translateX(-5px);
    }
    
    .back-icon {
        width: 20px;
        height: 20px;
        fill: currentColor;
    }
    
    .world-creator-header {
        text-align: center;
        padding: 60px 20px 30px;
    }
    
    .world-creator-title {
        font-size: clamp(2rem, 6vw, 3.5rem);
        color: transparent;
        background: linear-gradient(90deg, #fdf4ff, #a855f7, #c084fc);
        background-size: 200% auto;
        background-clip: text;
        -webkit-background-clip: text;
        animation: shimmer 3s linear infinite;
        margin-bottom: 10px;
    }
    
    .world-creator-subtitle {
        color: rgba(255, 255, 255, 0.6);
        font-size: 1.1rem;
        letter-spacing: 4px;
    }
    
    .world-creator-content {
        max-width: 700px;
        margin: 0 auto;
        padding: 0 20px 50px;
    }
    
    .step-container {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 20px;
        padding: 30px;
        animation: fadeInUp 0.5s ease-out;
    }
    
    .step-container.hidden {
        display: none;
    }
    
    .step-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(168, 85, 247, 0.2);
    }
    
    .step-number {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #a855f7, #c084fc);
        border-radius: 50%;
        color: white;
        font-weight: bold;
        font-size: 0.9rem;
    }
    
    .step-header h2 {
        color: white;
        font-size: 1.4rem;
        flex: 1;
    }
    
    .regenerate-btn {
        padding: 8px 16px;
        color: rgba(168, 85, 247, 0.8);
        background: rgba(168, 85, 247, 0.1);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
    }
    
    .regenerate-btn:hover {
        background: rgba(168, 85, 247, 0.2);
    }
    
    .world-textarea {
        width: 100%;
        height: 200px;
        padding: 20px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 15px;
        color: white;
        font-size: 1rem;
        font-family: inherit;
        resize: vertical;
        transition: all 0.3s ease;
    }
    
    .world-textarea:focus {
        outline: none;
        border-color: #a855f7;
        box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
    }
    
    .world-textarea::placeholder {
        color: rgba(255, 255, 255, 0.3);
    }
    
    .input-tips {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 15px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
    }
    
    .tip-icon {
        font-size: 1.1rem;
    }
    
    .generate-btn {
        width: 100%;
        margin-top: 25px;
        padding: 18px;
        background: linear-gradient(135deg, #a855f7, #c084fc);
        border: none;
        border-radius: 15px;
        color: white;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
    
    .generate-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4);
    }
    
    .worldview-display {
        max-height: 400px;
        overflow-y: auto;
        padding-right: 10px;
    }
    
    .worldview-display::-webkit-scrollbar {
        width: 6px;
    }
    
    .worldview-display::-webkit-scrollbar-track {
        background: rgba(168, 85, 247, 0.1);
        border-radius: 3px;
    }
    
    .worldview-display::-webkit-scrollbar-thumb {
        background: rgba(168, 85, 247, 0.5);
        border-radius: 3px;
    }
    
    .worldview-content {
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.8;
    }
    
    .worldview-content h3 {
        color: #c084fc;
        font-size: 1.5rem;
        margin-bottom: 20px;
        text-align: center;
    }
    
    .worldview-section {
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(168, 85, 247, 0.1);
        border-radius: 10px;
    }
    
    .worldview-section h4 {
        color: #a855f7;
        margin-bottom: 10px;
        font-size: 1.1rem;
    }
    
    .worldview-section ul {
        list-style: none;
        padding: 0;
    }
    
    .worldview-section li {
        padding: 5px 0;
        border-bottom: 1px solid rgba(168, 85, 247, 0.1);
    }
    
    .worldview-section li:last-child {
        border-bottom: none;
    }
    
    .step2-buttons {
        display: flex;
        gap: 15px;
        margin-top: 25px;
        justify-content: center;
    }
    
    .back-btn-small {
        padding: 12px 30px;
        color: rgba(255, 255, 255, 0.8);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .back-btn-small:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .confirm-btn {
        padding: 12px 40px;
        background: linear-gradient(135deg, #a855f7, #c084fc);
        border: none;
        border-radius: 25px;
        color: white;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .confirm-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4);
    }
    
    /* 开场界面 */
    .opening-screen {
        text-align: center;
        padding: 50px 20px;
    }
    
    .opening-content {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.9);
        line-height: 2;
        min-height: 200px;
        white-space: pre-line;
        font-family: 'STKaiti', 'KaiTi', serif;
    }
    
    .opening-progress-bar {
        width: 300px;
        height: 3px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        margin: 30px auto;
        overflow: hidden;
    }
    
    .opening-progress {
        height: 100%;
        background: linear-gradient(90deg, #a855f7, #c084fc);
        transition: width 0.1s ease;
    }
    
    .opening-hint {
        color: rgba(255, 255, 255, 0.4);
        font-size: 0.9rem;
        animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.8; }
    }
    
    /* 分隔线 */
    .btn-divider {
        display: flex;
        align-items: center;
        gap: 15px;
        margin: 25px 0;
    }
    
    .divider-line {
        flex: 1;
        height: 1px;
        background: rgba(168, 85, 247, 0.3);
    }
    
    .divider-text {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
    }
    
    /* 次要按钮组 */
    .secondary-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
    }
    
    .secondary-btn {
        padding: 14px 25px;
        color: rgba(255, 255, 255, 0.9);
        background: rgba(168, 85, 247, 0.15);
        border: 1px solid rgba(168, 85, 247, 0.4);
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1rem;
    }
    
    .secondary-btn:hover {
        background: rgba(168, 85, 247, 0.3);
        transform: translateY(-2px);
    }
    
    /* 商店界面 */
    .store-filters {
        max-width: 1000px;
        margin: 0 auto 30px;
        padding: 0 20px;
    }
    
    .category-tabs {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        padding-bottom: 15px;
        scrollbar-width: none;
    }
    
    .category-tabs::-webkit-scrollbar {
        display: none;
    }
    
    .category-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 25px;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
        font-size: 0.95rem;
    }
    
    .category-tab svg {
        width: 20px;
        height: 20px;
    }
    
    .category-tab:hover {
        background: rgba(168, 85, 247, 0.2);
        border-color: rgba(168, 85, 247, 0.6);
    }
    
    .category-tab.active {
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(99, 102, 241, 0.4));
        border-color: #a855f7;
        color: white;
    }
    
    .price-filter {
        display: flex;
        gap: 20px;
        margin-top: 15px;
        justify-content: center;
    }
    
    .filter-option {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9rem;
    }
    
    .filter-option input[type="radio"] {
        display: none;
    }
    
    .filter-option input[type="radio"]:checked + span {
        color: #a855f7;
        font-weight: bold;
    }
    
    .store-content {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 20px 50px;
    }
    
    .store-section {
        margin-bottom: 40px;
    }
    
    .section-title {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.3rem;
        margin-bottom: 20px;
        padding-left: 10px;
        border-left: 4px solid #a855f7;
    }
    
    .worldbook-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
    }
    
    .worldbook-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 18px;
        padding: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        position: relative;
        overflow: hidden;
    }
    
    .worldbook-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .worldbook-card:hover::before {
        opacity: 1;
    }
    
    .worldbook-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(168, 85, 247, 0.2);
        border-color: #a855f7;
    }
    
    .worldbook-card.free:hover {
        border-color: #22c55e;
        box-shadow: 0 15px 35px rgba(34, 197, 94, 0.2);
    }
    
    .worldbook-card.premium:hover {
        border-color: #f59e0b;
        box-shadow: 0 15px 35px rgba(245, 158, 11, 0.2);
    }
    
    .worldbook-icon-wrapper {
        width: 60px;
        height: 60px;
        margin: 0 auto 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(168, 85, 247, 0.1);
        border-radius: 15px;
        transition: all 0.3s ease;
    }
    
    .worldbook-card:hover .worldbook-icon-wrapper {
        background: rgba(168, 85, 247, 0.2);
        transform: scale(1.1);
    }
    
    .worldbook-icon-wrapper svg {
        width: 32px;
        height: 32px;
        color: #c084fc;
    }
    
    .worldbook-card.free .worldbook-icon-wrapper svg {
        color: #22c55e;
    }
    
    .worldbook-card.premium .worldbook-icon-wrapper svg {
        color: #f59e0b;
    }
    
    .worldbook-card h4 {
        color: white;
        font-size: 1.3rem;
        margin-bottom: 8px;
        font-weight: 600;
    }
    
    .worldbook-desc {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
        margin-bottom: 15px;
        line-height: 1.5;
    }
    
    .worldbook-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        margin-bottom: 15px;
    }
    
    .worldbook-tags .tag {
        padding: 4px 12px;
        background: rgba(168, 85, 247, 0.15);
        border-radius: 12px;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(168, 85, 247, 0.2);
    }
    
    .worldbook-price {
        padding-top: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .free-text {
        color: #22c55e;
        font-weight: bold;
        font-size: 1rem;
    }
    
    .premium-text {
        color: #f59e0b;
        font-weight: bold;
        font-size: 1rem;
    }
    
    /* 空背包状态 */
    .empty-state {
        text-align: center;
        padding: 60px 20px;
    }
    
    .empty-icon {
        width: 80px;
        height: 80px;
        color: rgba(255, 255, 255, 0.2);
        margin-bottom: 20px;
    }
    
    .empty-text {
        font-size: 1.5rem;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 10px;
    }
    
    .empty-hint {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.4);
    }
    
    /* 角色选择界面 */
    .character-select-content {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 20px 50px;
    }
    
    .character-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }
    
    .character-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 18px;
        padding: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        position: relative;
        overflow: hidden;
    }
    
    .character-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .character-card:hover::before {
        opacity: 1;
    }
    
    .character-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(168, 85, 247, 0.2);
        border-color: #a855f7;
    }
    
    .character-avatar {
        width: 80px;
        height: 80px;
        margin: 0 auto 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(168, 85, 247, 0.15);
        border-radius: 50%;
        border: 2px solid rgba(168, 85, 247, 0.3);
        transition: all 0.3s ease;
    }
    
    .character-card:hover .character-avatar {
        background: rgba(168, 85, 247, 0.25);
        transform: scale(1.1);
    }
    
    .character-avatar svg {
        width: 40px;
        height: 40px;
        color: #c084fc;
    }
    
    .character-name {
        color: white;
        font-size: 1.4rem;
        margin-bottom: 10px;
        font-weight: 600;
    }
    
    .character-desc {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9rem;
        margin-bottom: 15px;
        line-height: 1.5;
    }
    
    .character-traits {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
    }
    
    .trait-tag {
        padding: 4px 12px;
        background: rgba(168, 85, 247, 0.15);
        border-radius: 12px;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(168, 85, 247, 0.2);
    }
    
    /* 便捷生成界面 */
    .quick-generate-content {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 20px 50px;
    }
    
    .quick-section {
        margin-bottom: 35px;
    }
    
    .type-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
    }
    
    .type-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(168, 85, 247, 0.2);
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .type-card:hover {
        border-color: rgba(168, 85, 247, 0.6);
        background: rgba(168, 85, 247, 0.1);
    }
    
    .type-card input[type="radio"]:checked + .type-icon,
    .type-card input[type="radio"]:checked + .type-icon + .type-name {
        color: #a855f7;
    }
    
    .type-card input[type="radio"]:checked ~ * {
        color: #a855f7;
    }
    
    .type-card input[type="radio"] {
        display: none;
    }
    
    .type-icon {
        font-size: 2rem;
        margin-bottom: 10px;
    }
    
    .type-name {
        font-size: 0.95rem;
    }
    
    /* 标签网格 */
    .tag-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }
    
    .tag-card {
        padding: 10px 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(168, 85, 247, 0.2);
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.95rem;
    }
    
    .tag-card:hover {
        border-color: rgba(168, 85, 247, 0.5);
    }
    
    .tag-card input[type="checkbox"] {
        display: none;
    }
    
    .tag-card input[type="checkbox"]:checked {
        background: rgba(168, 85, 247, 0.3);
        border-color: #a855f7;
        color: #a855f7;
    }
    
    .tag-card input[type="checkbox"]:checked + span {
        color: #a855f7;
    }
    
    .tag-card:has(input[type="checkbox"]:checked) {
        background: rgba(168, 85, 247, 0.2);
        border-color: #a855f7;
        color: #a855f7;
    }
    
    /* 情节标签显示 */
    .plot-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
    }
    
    .plot-tag {
        padding: 5px 12px;
        background: rgba(168, 85, 247, 0.2);
        border-radius: 15px;
        font-size: 0.85rem;
        color: #c084fc;
    }
    
    /* 视频加载界面 */
    .video-loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 40px 20px;
        position: relative;
    }
    
    .loading-header {
        text-align: center;
        margin-bottom: 50px;
    }
    
    .loading-title {
        font-size: 2.5rem;
        background: linear-gradient(135deg, #a855f7, #6366f1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 10px;
    }
    
    .loading-subtitle {
        color: rgba(255, 255, 255, 0.6);
        font-size: 1.1rem;
    }
    
    .loading-stages {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 50px;
        flex-wrap: wrap;
    }
    
    .stage-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        opacity: 0.4;
        transition: all 0.5s ease;
    }
    
    .stage-item.active {
        opacity: 1;
        transform: scale(1.1);
    }
    
    .stage-item.completed {
        opacity: 1;
    }
    
    .stage-icon {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(168, 85, 247, 0.1);
        border: 2px solid rgba(168, 85, 247, 0.3);
        border-radius: 50%;
        color: #c084fc;
        transition: all 0.5s ease;
    }
    
    .stage-item.active .stage-icon {
        background: rgba(168, 85, 247, 0.3);
        border-color: #a855f7;
        animation: pulse 2s infinite;
    }
    
    .stage-item.completed .stage-icon {
        background: rgba(34, 197, 94, 0.2);
        border-color: #22c55e;
        color: #22c55e;
    }
    
    .stage-icon svg {
        width: 24px;
        height: 24px;
    }
    
    .stage-text {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        text-align: center;
    }
    
    .stage-line {
        width: 40px;
        height: 2px;
        background: linear-gradient(90deg, rgba(168, 85, 247, 0.3), rgba(168, 85, 247, 0.1));
    }
    
    .loading-progress-container {
        width: 100%;
        max-width: 500px;
        text-align: center;
    }
    
    .loading-progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 10px;
    }
    
    .loading-progress {
        height: 100%;
        background: linear-gradient(90deg, #a855f7, #6366f1, #a855f7);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
        border-radius: 4px;
        transition: width 0.3s ease;
    }
    
    .loading-percent {
        font-size: 1.5rem;
        font-weight: bold;
        color: #a855f7;
        margin: 0;
    }
    
    .loading-tip {
        margin-top: 30px;
        text-align: center;
    }
    
    .loading-tip p {
        color: rgba(255, 255, 255, 0.5);
        font-size: 1rem;
        margin: 0;
    }
    
    .particle-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        overflow: hidden;
    }
    
    .loading-particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #a855f7;
        border-radius: 50%;
        opacity: 0.6;
        animation: float 3s infinite ease-in-out;
    }
    
    /* 视频播放器界面 */
    .video-player-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
    }
    
    .video-header {
        text-align: center;
        margin-bottom: 30px;
    }
    
    .video-title {
        font-size: 2.5rem;
        background: linear-gradient(135deg, #a855f7, #6366f1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 10px;
    }
    
    .video-subtitle {
        color: rgba(255, 255, 255, 0.6);
        font-size: 1.1rem;
    }
    
    .video-screen {
        width: 100%;
        aspect-ratio: 16/9;
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(99, 102, 241, 0.1));
        border: 2px solid rgba(168, 85, 247, 0.3);
        border-radius: 15px;
        margin-bottom: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    
    .video-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }
    
    .video-icon {
        width: 80px;
        height: 80px;
        color: rgba(168, 85, 247, 0.5);
        animation: iconPulse 2s infinite;
    }
    
    .video-placeholder-text {
        color: rgba(255, 255, 255, 0.5);
        font-size: 1.2rem;
        margin: 0;
    }
    
    .story-branches {
        margin-top: 30px;
    }
    
    .branches-title {
        color: white;
        font-size: 1.5rem;
        margin-bottom: 20px;
        text-align: center;
    }
    
    .branches-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }
    
    .branch-card {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(168, 85, 247, 0.2);
        border-radius: 15px;
        padding: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: left;
    }
    
    .branch-card:hover {
        transform: translateY(-5px);
        border-color: #a855f7;
        background: rgba(168, 85, 247, 0.1);
        box-shadow: 0 10px 30px rgba(168, 85, 247, 0.2);
    }
    
    .branch-title {
        color: white;
        font-size: 1.3rem;
        margin-bottom: 10px;
    }
    
    .branch-desc {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.95rem;
        margin-bottom: 15px;
    }
    
    .branch-preview {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.85rem;
        line-height: 1.6;
        font-style: italic;
    }
    
    /* 剧情游玩界面 */
    .story-play-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px 20px;
    }
    
    .story-header {
        text-align: center;
        margin-bottom: 40px;
    }
    
    .story-title {
        font-size: 2rem;
        background: linear-gradient(135deg, #a855f7, #6366f1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 10px;
    }
    
    .story-branch-label {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.95rem;
        margin: 0;
    }
    
    .story-content {
        margin-bottom: 40px;
    }
    
    .story-scene {
        display: flex;
        gap: 30px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
    }
    
    .scene-visual {
        flex-shrink: 0;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(168, 85, 247, 0.1);
        border-radius: 50%;
    }
    
    .scene-icon {
        width: 40px;
        height: 40px;
        color: #c084fc;
    }
    
    .scene-text {
        flex: 1;
    }
    
    .scene-dialogue {
        color: white;
        font-size: 1.1rem;
        line-height: 1.8;
        margin: 0;
    }
    
    .story-choices {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 15px;
        padding: 25px;
    }
    
    .choices-title {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.2rem;
        margin-bottom: 20px;
    }
    
    .choices-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 15px;
    }
    
    .choice-btn {
        padding: 15px 20px;
        background: rgba(168, 85, 247, 0.15);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 10px;
        color: white;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .choice-btn:hover {
        background: rgba(168, 85, 247, 0.3);
        border-color: #a855f7;
        transform: translateY(-2px);
    }
    
    .story-controls {
        text-align: center;
    }
    
    .control-btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 12px 25px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 25px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .control-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.4);
    }
    
    .control-btn svg {
        width: 20px;
        height: 20px;
    }
    
    /* 动画 */
    @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
        50% { box-shadow: 0 0 0 15px rgba(168, 85, 247, 0); }
    }
    
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
        50% { transform: translateY(-20px) rotate(180deg); opacity: 0.3; }
    }
    
    @keyframes iconPulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }
    
    /* 全屏视频播放器 */
    .fullscreen-video-player {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1000;
        overflow: hidden;
    }
    
    .video-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(30, 20, 10, 0.9), rgba(60, 40, 20, 0.8));
        transition: background 1s ease;
    }
    
    .video-background.scene-active {
        animation: sceneTransition 2s ease-in-out;
    }
    
    .video-background.has-video {
        background: transparent;
    }
    
    .video-background.has-video video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .video-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        pointer-events: none;
    }
    
    .video-overlay > * {
        pointer-events: auto;
    }
    
    .story-title-area {
        padding: 40px 60px;
        text-align: center;
    }
    
    .main-story-title {
        font-size: 3rem;
        background: linear-gradient(135deg, #f5d742, #e6a737, #f5d742);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 0 40px rgba(245, 215, 66, 0.3);
        margin-bottom: 10px;
        letter-spacing: 8px;
    }
    
    .story-chapter {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.6);
        letter-spacing: 4px;
    }
    
    .video-progress-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
    }
    
    .video-progress-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #f5d742, #e6a737);
        transition: width 0.3s ease;
    }
    
    .choices-overlay {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 40px;
        opacity: 0;
        transition: opacity 0.8s ease;
        background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%);
    }
    
    .choices-overlay.visible {
        opacity: 1;
    }
    
    .choices-prompt {
        font-size: 1.5rem;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 40px;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        letter-spacing: 4px;
    }
    
    .choices-buttons {
        display: flex;
        flex-direction: column;
        gap: 20px;
        width: 100%;
        max-width: 700px;
    }
    
    .choice-button {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 25px 35px;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.4s ease;
        text-align: left;
        opacity: 0;
        transform: translateX(-30px);
        animation: slideInChoice 0.5s ease forwards;
    }
    
    .choice-button:hover {
        background: rgba(245, 215, 66, 0.2);
        border-color: rgba(245, 215, 66, 0.5);
        transform: translateX(10px) scale(1.02);
        box-shadow: 0 10px 40px rgba(245, 215, 66, 0.2);
    }
    
    .choice-number {
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(245, 215, 66, 0.2);
        border: 2px solid rgba(245, 215, 66, 0.5);
        border-radius: 50%;
        font-size: 1.2rem;
        font-weight: bold;
        color: #f5d742;
    }
    
    .choice-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .choice-title {
        font-size: 1.3rem;
        font-weight: bold;
        color: white;
    }
    
    .choice-desc {
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.6);
    }
    
    .choice-arrow {
        width: 30px;
        height: 30px;
        color: rgba(245, 215, 66, 0.5);
        transition: all 0.3s ease;
    }
    
    .choice-button:hover .choice-arrow {
        color: #f5d742;
        transform: translateX(5px);
    }
    
    .video-controls {
        display: flex;
        justify-content: center;
        gap: 20px;
        padding: 30px;
    }
    
    .video-ctrl-btn {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        color: white;
    }
    
    .video-ctrl-btn:hover {
        background: rgba(245, 215, 66, 0.3);
        border-color: rgba(245, 215, 66, 0.5);
        transform: scale(1.1);
    }
    
    .video-ctrl-btn svg {
        width: 24px;
        height: 24px;
    }
    
    .loading-indicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }
    
    .loading-spinner {
        width: 80px;
        height: 80px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top-color: #f5d742;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    .loading-text {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.8);
        letter-spacing: 2px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @keyframes slideInChoice {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes sceneTransition {
        0% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
        100% { filter: brightness(1); }
    }
    
    /* 场景描述文字 */
    .scene-description {
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        max-width: 800px;
        padding: 30px 40px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(245, 215, 66, 0.2);
        border-radius: 20px;
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.8;
        text-align: center;
        opacity: 0;
        transition: opacity 1s ease;
        animation: fadeInUp 1s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translate(-50%, -30%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }
    
    /* 选项统计样式 */
    .choice-stats {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    
    .stats-bar {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 3px;
        overflow: hidden;
    }
    
    .stats-fill {
        height: 100%;
        background: linear-gradient(90deg, #f5d742, #e6a737);
        border-radius: 3px;
        transition: width 0.8s ease;
    }
    
    .stats-text {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.6);
    }
    
    /* 左右分栏布局 */
    .split-layout {
        flex: 1;
        display: flex;
        padding: 20px 40px 60px;
        gap: 30px;
        max-height: calc(100vh - 200px);
    }
    
    /* 左侧：分支选项 */
    .choices-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 30px;
        overflow-y: auto;
        opacity: 0;
        transform: translateX(-20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .choices-panel .choices-prompt {
        font-size: 1.3rem;
        color: rgba(245, 215, 66, 0.9);
        margin-bottom: 30px;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        letter-spacing: 3px;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 20px;
    }
    
    .choices-panel .choices-buttons {
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;
        max-width: none;
    }
    
    .choices-panel .choice-button {
        padding: 20px 25px;
        border-radius: 12px;
        gap: 15px;
    }
    
    /* 右侧：剧情描述区域 */
    .story-panel {
        flex: 1.5;
        display: flex;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 30px;
        overflow-y: auto;
        position: relative;
        opacity: 0;
        transform: translateX(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .story-panel .scene-description {
        font-size: 1.3rem;
        line-height: 2;
        color: rgba(255, 255, 255, 0.9);
        text-align: left;
        white-space: pre-wrap;
        position: relative;
        z-index: 2;
    }
    
    /* 隐藏旧的场景描述样式 */
    .video-overlay .scene-description {
        display: none;
    }
    
    .story-panel .scene-description {
        display: block;
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        width: 100%;
        max-width: none;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: 0;
        font-size: 1.3rem;
        color: rgba(255, 255, 255, 0.9);
        line-height: 2;
        text-align: left;
        opacity: 1;
        transition: opacity 1s ease;
        animation: fadeIn 1s ease forwards;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(fadeStyle);