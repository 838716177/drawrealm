/**
 * 绘境Online - 数据存储层
 * 统一管理角色卡、世界书、玩法集的本地存储
 */

class DataStore {
    constructor() {
        this.keys = {
            characters: 'huijing_editor_characters',
            worlds: 'huijing_editor_worlds',
            playsets: 'huijing_editor_playsets',
            currentWorld: 'huijing_editor_current_world',
        };
        this.initDefaults();
    }

    initDefaults() {
        if (!localStorage.getItem(this.keys.characters)) {
            localStorage.setItem(this.keys.characters, JSON.stringify(this.getDefaultCharacters()));
        }
        if (!localStorage.getItem(this.keys.worlds)) {
            localStorage.setItem(this.keys.worlds, JSON.stringify(this.getDefaultWorlds()));
        }
        if (!localStorage.getItem(this.keys.playsets)) {
            localStorage.setItem(this.keys.playsets, JSON.stringify(this.getDefaultPlaysets()));
        }
    }

    // ==================== 通用CRUD ====================

    getAll(type) {
        const data = localStorage.getItem(this.keys[type]);
        return data ? JSON.parse(data) : [];
    }

    getById(type, id) {
        const items = this.getAll(type);
        return items.find(item => item.id === id);
    }

    save(type, item) {
        const items = this.getAll(type);
        const index = items.findIndex(i => i.id === item.id);
        if (index >= 0) {
            items[index] = { ...items[index], ...item, updatedAt: new Date().toISOString() };
        } else {
            item.id = item.id || `${type}_${Date.now()}`;
            item.createdAt = new Date().toISOString();
            item.updatedAt = item.createdAt;
            items.push(item);
        }
        localStorage.setItem(this.keys[type], JSON.stringify(items));
        return item;
    }

    delete(type, id) {
        const items = this.getAll(type).filter(i => i.id !== id);
        localStorage.setItem(this.keys[type], JSON.stringify(items));
    }

    search(type, keyword) {
        const items = this.getAll(type);
        if (!keyword) return items;
        const lower = keyword.toLowerCase();
        return items.filter(item =>
            (item.name && item.name.toLowerCase().includes(lower)) ||
            (item.description && item.description.toLowerCase().includes(lower)) ||
            (item.tags && item.tags.some(t => t.toLowerCase().includes(lower)))
        );
    }

    filterByTag(type, tag) {
        const items = this.getAll(type);
        if (!tag) return items;
        return items.filter(item => item.tags && item.tags.includes(tag));
    }

    // ==================== 角色卡 ====================

    getCharacters() { return this.getAll('characters'); }
    getCharacter(id) { return this.getById('characters', id); }
    saveCharacter(character) { return this.save('characters', character); }
    deleteCharacter(id) { this.delete('characters', id); }
    searchCharacters(keyword) { return this.search('characters', keyword); }

    // ==================== 世界书 ====================

    getWorlds() { return this.getAll('worlds'); }
    getWorld(id) { return this.getById('worlds', id); }
    saveWorld(world) { return this.save('worlds', world); }
    deleteWorld(id) { this.delete('worlds', id); }
    searchWorlds(keyword) { return this.search('worlds', keyword); }

    getCurrentWorld() {
        const id = localStorage.getItem(this.keys.currentWorld);
        return id ? this.getWorld(id) : this.getWorlds()[0];
    }

    setCurrentWorld(id) {
        localStorage.setItem(this.keys.currentWorld, id);
    }

    // ==================== 玩法集 ====================

    getPlaysets() { return this.getAll('playsets'); }
    getPlayset(id) { return this.getById('playsets', id); }
    savePlayset(playset) { return this.save('playsets', playset); }
    deletePlayset(id) { this.delete('playsets', id); }
    searchPlaysets(keyword) { return this.search('playsets', keyword); }

    // ==================== 默认数据 ====================

    getDefaultCharacters() {
        return [
            {
                id: 'char_001',
                name: '夜行者',
                alias: 'Nightwalker',
                avatar: null,
                description: '神秘的独行侠，擅长潜行和黑客技术',
                personality: '冷静、寡言、内心正义感强烈',
                background: '曾是某大公司的安全专家，因揭露公司黑幕而被追杀，从此隐姓埋名',
                appearance: '黑色风衣，机械义眼，腰间挂着老式数据接口',
                abilities: ['黑客入侵', '潜行', '格斗', '电子战'],
                voice: '低沉磁性，语速不快',
                tags: ['赛博朋克', '主角', '黑客'],
                worldId: 'world_001',
                scenes: ['霓虹街道', '地下网络', '公司大楼'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'char_002',
                name: '红狐',
                alias: 'Red Fox',
                avatar: null,
                description: '情报贩子，消息灵通，八面玲珑',
                personality: '圆滑、机智、见人说人话',
                background: '在街头长大，靠贩卖情报为生，认识三教九流的人',
                appearance: '红色短发，皮夹克，总是带着笑容',
                abilities: ['情报收集', '社交', '逃脱', '谈判'],
                voice: '轻快活泼，带街头口音',
                tags: ['赛博朋克', '配角', '情报'],
                worldId: 'world_001',
                scenes: ['酒吧', '黑市', '街头'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'char_003',
                name: '艾琳',
                alias: 'Eileen',
                avatar: null,
                description: '天才科学家，致力于解放AI',
                personality: '理想主义、执着、有些书呆子气',
                background: '顶尖大学毕业，发现公司利用AI压榨底层人民，决定反抗',
                appearance: '白大褂，眼镜，总是带着数据板',
                abilities: ['AI编程', '科学研究', '策略规划', '说服'],
                voice: '清晰理性，偶尔激动',
                tags: ['赛博朋克', '配角', '科学'],
                worldId: 'world_001',
                scenes: ['实验室', '大学', '抗议现场'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        ];
    }

    getDefaultWorlds() {
        return [
            {
                id: 'world_001',
                name: '赛博都市',
                description: '2150年的新上海，巨型公司统治着城市，霓虹灯与雨水交织',
                type: 'scifi',
                era: 'future_2150',
                difficulty: 'normal',
                tags: ['科幻', '赛博朋克', '未来'],
                rules: {
                    technology: '高科技与贫民窟并存，义体改造普遍',
                    society: '公司统治，阶级固化严重',
                    magic: '无魔法，科技替代',
                    danger: '街头危险，公司区安全但受监控',
                },
                geography: {
                    regions: [
                        { name: '核心区', description: '公司总部所在地，高楼林立' },
                        { name: '工业区', description: '工厂和仓库，污染严重' },
                        { name: '贫民窟', description: '底层人民居住，混乱无序' },
                        { name: '地下城', description: '废弃地铁系统，黑客聚集地' },
                    ],
                    climate: '多雨，酸雨常见',
                    landmarks: ['天空之眼塔', '霓虹大道', '黑市入口'],
                },
                factions: [
                    { name: '天启集团', description: '最大的公司，控制能源和通信', alignment: '敌对' },
                    { name: '自由黑客联盟', description: '地下反抗组织', alignment: '友好' },
                    { name: '街头帮派', description: '各区域的地下势力', alignment: '中立' },
                ],
                visualStyle: {
                    primaryColor: '#00f0ff',
                    elements: ['摩天大楼', '全息广告', '飞行载具'],
                    atmosphere: '雨夜、霓虹、压抑与希望并存',
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        ];
    }

    getDefaultPlaysets() {
        return [
            {
                id: 'playset_001',
                name: '侦探模式',
                description: '调查线索、审讯嫌疑人、推理真相',
                type: 'investigation',
                tags: ['推理', '剧情', '单人'],
                rules: {
                    objective: '收集证据，找出真相',
                    mechanics: ['线索收集', '对话选择', '推理验证'],
                    winCondition: '成功破案',
                    loseCondition: '指认错误或时间耗尽',
                },
                options: {
                    style: 'bottom',
                    timing: 'end',
                    timeLimit: 15,
                    animation: 'slide',
                },
                scenes: [
                    { name: '案发现场', description: '调查现场线索' },
                    { name: '审讯室', description: '询问嫌疑人' },
                    { name: '追踪', description: '追捕真凶' },
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'playset_002',
                name: '生存挑战',
                description: '在危险环境中生存，资源管理至关重要',
                type: 'survival',
                tags: ['生存', '资源管理', '紧张'],
                rules: {
                    objective: '在限定条件下生存下来',
                    mechanics: ['资源收集', '危险规避', '决策选择'],
                    winCondition: '达成目标或坚持到最后',
                    loseCondition: '生命值归零或关键资源耗尽',
                },
                options: {
                    style: 'overlay',
                    timing: 'custom',
                    timeLimit: 10,
                    animation: 'fade',
                },
                scenes: [
                    { name: '资源搜寻', description: '寻找食物和装备' },
                    { name: '危机应对', description: '面对突发危险' },
                    { name: '最终逃脱', description: '逃离危险区域' },
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'playset_003',
                name: '潜入行动',
                description: '秘密潜入敌方设施，完成任务',
                type: 'stealth',
                tags: ['潜行', '动作', '策略'],
                rules: {
                    objective: '不被发现的情况下完成任务',
                    mechanics: ['潜行', '黑客', '伪装', '快速反应'],
                    winCondition: '任务完成且未被察觉',
                    loseCondition: '被发现或警报触发',
                },
                options: {
                    style: 'sidebar',
                    timing: 'end',
                    timeLimit: 0,
                    animation: 'typewriter',
                },
                scenes: [
                    { name: '外围侦察', description: '观察敌方巡逻路线' },
                    { name: '核心渗透', description: '进入关键区域' },
                    { name: '撤离', description: '带着情报安全离开' },
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        ];
    }
}

// 创建全局实例
const dataStore = new DataStore();
