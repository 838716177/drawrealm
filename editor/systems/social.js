/**
 * 绘境Online - 社交互联系统
 * 差异化特性：好友关系值、公会等级/排位/战争、跨世界通讯、排行榜
 */
class SocialInterconnectionSystem {
    constructor() {
        this.friends = new Map();
        this.guilds = new Map();
        this.leaderboards = new Map();
        this.activityFeed = [];
        this.messages = new Map();
        this._changeListeners = [];
        this._loadState();
    }

    onChange(fn) {
        this._changeListeners.push(fn);
        return () => {
            const idx = this._changeListeners.indexOf(fn);
            if (idx >= 0) this._changeListeners.splice(idx, 1);
        };
    }

    _notifyChange(event, data) {
        this._changeListeners.forEach(fn => fn(event, data));
    }

    _loadState() {
        const saved = localStorage.getItem('huijing_social_state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                (state.friends || []).forEach(f => this.friends.set(f.id, f));
                (state.guilds || []).forEach(g => this.guilds.set(g.id, g));
                this.activityFeed = state.activityFeed || [];
            } catch (e) {}
        }
        if (this.friends.size === 0) this._initDefaultFriends();
        if (this.guilds.size === 0) this._initDefaultGuilds();
        if (this.activityFeed.length === 0) this._initDefaultActivity();
    }

    _persist() {
        const state = {
            friends: Array.from(this.friends.values()),
            guilds: Array.from(this.guilds.values()),
            activityFeed: this.activityFeed.slice(-200)
        };
        localStorage.setItem('huijing_social_state', JSON.stringify(state));
    }

    _initDefaultFriends() {
        const defaults = [
            { id: 'friend_001', userId: 'user_creator_1', name: '夜行者', avatar: null, avatarGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', status: 'online', relationshipValue: 85, relationLabel: '好友', tags: ['赛博朋克', '战斗型'], mutualFriends: 5, lastActive: new Date().toISOString(), world: '赛博都市' },
            { id: 'friend_002', userId: 'user_creator_2', name: '红狐', avatar: null, avatarGradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', status: 'online', relationshipValue: 72, relationLabel: '好友', tags: ['情报商', '社交型'], mutualFriends: 3, lastActive: new Date(Date.now() - 600000).toISOString(), world: '赛博都市' },
            { id: 'friend_003', userId: 'user_creator_4', name: '苏婉', avatar: null, avatarGradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)', status: 'offline', relationshipValue: 60, relationLabel: '友好', tags: ['民国', '灵异'], mutualFriends: 1, lastActive: new Date(Date.now() - 3600000).toISOString(), world: '民国异闻' },
            { id: 'friend_004', userId: 'user_bidder_2', name: '剑痴', avatar: null, avatarGradient: 'linear-gradient(135deg, #06b6d4, #6366f1)', status: 'online', relationshipValue: 45, relationLabel: '友好', tags: ['仙侠', '战斗型'], mutualFriends: 2, lastActive: new Date().toISOString(), world: '仙侠大陆' },
            { id: 'friend_005', userId: 'user_creator_5', name: '推理社·明轩', avatar: null, avatarGradient: 'linear-gradient(135deg, #10b981, #3b82f6)', status: 'busy', relationshipValue: 30, relationLabel: '认识', tags: ['推理', '剧情型'], mutualFriends: 4, lastActive: new Date(Date.now() - 300000).toISOString(), world: '现代都市' }
        ];
        defaults.forEach(f => this.friends.set(f.id, f));
        this._persist();
    }

    _initDefaultGuilds() {
        const defaults = [
            {
                id: 'guild_001', name: '赛博反抗军', tag: 'CYB', level: 8, rank: 1,
                members: [{ userId: 'current_user', userName: '我', role: 'member', joinedAt: new Date().toISOString() }],
                memberCount: 128, maxMembers: 150, description: '赛博朋克世界最大的玩家公会',
                emblem: 'linear-gradient(135deg, #00f0ff, #0066ff)', createdAt: new Date().toISOString(),
                wars: { won: 15, lost: 3, draw: 1 }
            },
            {
                id: 'guild_002', name: '仙道联盟', tag: 'XDLM', level: 10, rank: 2,
                members: [], memberCount: 200, maxMembers: 200, description: '仙侠世界顶级公会',
                emblem: 'linear-gradient(135deg, #9d00ff, #ff00ff)', createdAt: new Date().toISOString(),
                wars: { won: 22, lost: 5, draw: 2 }
            },
            {
                id: 'guild_003', name: '灵异调查局', tag: 'LSA', level: 5, rank: 8,
                members: [], memberCount: 56, maxMembers: 80, description: '民国灵异世界的专业调查团队',
                emblem: 'linear-gradient(135deg, #ff4400, #ff8800)', createdAt: new Date().toISOString(),
                wars: { won: 3, lost: 7, draw: 1 }
            }
        ];
        defaults.forEach(g => this.guilds.set(g.id, g));
        this._persist();
    }

    _initDefaultActivity() {
        const feeds = [
            { id: 'act_001', type: 'achievement', userId: 'user_creator_1', userName: '夜行者', content: '击败了天启集团CEO，获得成就"革命者"', time: new Date(Date.now() - 600000).toISOString(), icon: '🏆' },
            { id: 'act_002', type: 'trade', userId: 'user_creator_2', userName: '红狐', content: '在市场中上架了新角色卡"数据幽灵"', time: new Date(Date.now() - 1800000).toISOString(), icon: '💼' },
            { id: 'act_003', type: 'level', userId: 'user_bidder_2', userName: '剑痴', content: '角色"剑仙"达到等级 50', time: new Date(Date.now() - 2700000).toISOString(), icon: '⬆️' },
            { id: 'act_004', type: 'guild', userId: 'guild_001', userName: '赛博反抗军', content: '公会升级至 Lv.8！获得新公会技能', time: new Date(Date.now() - 3600000).toISOString(), icon: '🏰' },
            { id: 'act_005', type: 'create', userId: 'user_creator_4', userName: '苏婉', content: '创建了新世界书"民国异闻·聊斋新编"', time: new Date(Date.now() - 7200000).toISOString(), icon: '📖' },
            { id: 'act_006', type: 'social', userId: 'user_creator_5', userName: '推理社·明轩', content: '与"夜行者"成为了好友', time: new Date(Date.now() - 10800000).toISOString(), icon: '🤝' },
            { id: 'act_007', type: 'auction', userId: 'user_creator_6', userName: '仙侠阁', content: '拍卖物品"龙鳞玄甲"当前出价 18,000¢', time: new Date(Date.now() - 14400000).toISOString(), icon: '🔨' }
        ];
        this.activityFeed = feeds;
        this._persist();
    }

    // ==================== 好友管理 ====================

    getFriends() {
        return Array.from(this.friends.values());
    }

    getOnlineFriends() {
        return this.getFriends().filter(f => f.status === 'online');
    }

    addFriend(userId, userName) {
        if (this.friends.has(userId)) return null;
        const friend = {
            id: userId, userId, name: userName, avatar: null,
            avatarGradient: this._randomGradient(), status: 'online',
            relationshipValue: 10, relationLabel: '认识', tags: [],
            mutualFriends: 0, lastActive: new Date().toISOString(), world: ''
        };
        this.friends.set(friend.id, friend);
        this.addActivity({ type: 'social', userId, userName, content: `与"${userName}"成为了好友`, icon: '🤝' });
        this._persist();
        this._notifyChange('friend:added', friend);
        return friend;
    }

    removeFriend(friendId) {
        const friend = this.friends.get(friendId);
        this.friends.delete(friendId);
        this._persist();
        this._notifyChange('friend:removed', friend);
    }

    updateRelationship(friendId, value) {
        const friend = this.friends.get(friendId);
        if (!friend) return;
        friend.relationshipValue = Math.max(0, Math.min(100, value));
        friend.relationLabel = this._getRelationLabel(friend.relationshipValue);
        this._persist();
        this._notifyChange('friend:relationshipChanged', friend);
    }

    _getRelationLabel(value) {
        if (value >= 90) return '挚友';
        if (value >= 70) return '好友';
        if (value >= 40) return '友好';
        if (value >= 10) return '认识';
        return '陌生人';
    }

    // ==================== 公会 ====================

    getGuilds() {
        return Array.from(this.guilds.values());
    }

    getGuild(guildId) {
        return this.guilds.get(guildId);
    }

    createGuild(name, tag, description) {
        const guild = {
            id: `guild_${Date.now()}`, name, tag: tag.toUpperCase(),
            level: 1, rank: 999, members: [{ userId: 'current_user', userName: '我', role: 'founder', joinedAt: new Date().toISOString() }],
            memberCount: 1, maxMembers: 20, description,
            emblem: this._randomGradient(), createdAt: new Date().toISOString(),
            wars: { won: 0, lost: 0, draw: 0 }
        };
        this.guilds.set(guild.id, guild);
        this.addActivity({ type: 'guild', userId: guild.id, userName: guild.name, content: `新公会"${guild.name}"成立！`, icon: '🏰' });
        this._persist();
        this._notifyChange('guild:created', guild);
        return guild;
    }

    joinGuild(guildId, userId, userName) {
        const guild = this.guilds.get(guildId);
        if (!guild) return null;
        if (guild.memberCount >= guild.maxMembers) return null;
        guild.members.push({ userId, userName, role: 'member', joinedAt: new Date().toISOString() });
        guild.memberCount++;
        this._persist();
        this._notifyChange('guild:memberJoined', { guildId, userId, userName });
        return guild;
    }

    leaveGuild(guildId, userId) {
        const guild = this.guilds.get(guildId);
        if (!guild) return null;
        guild.members = guild.members.filter(m => m.userId !== userId);
        guild.memberCount = guild.members.length;
        this._persist();
        this._notifyChange('guild:memberLeft', { guildId, userId });
        return guild;
    }

    guildWar(guildIdA, guildIdB) {
        const a = this.guilds.get(guildIdA);
        const b = this.guilds.get(guildIdB);
        if (!a || !b) return null;
        const powerA = a.level * a.memberCount * 10;
        const powerB = b.level * b.memberCount * 10;
        const result = powerA > powerB ? 'win_a' : powerB > powerA ? 'win_b' : 'draw';
        if (result === 'win_a') { a.wars.won++; b.wars.lost++; }
        else if (result === 'win_b') { b.wars.won++; a.wars.lost++; }
        else { a.wars.draw++; b.wars.draw++; }
        this._persist();
        this.addActivity({ type: 'war', userId: guildIdA, userName: a.name, content: `${a.name} VS ${b.name} 公会战争已结算`, icon: '⚔️' });
        this._notifyChange('guild:warCompleted', { guildIdA, guildIdB, result });
        return result;
    }

    // ==================== 排行榜 ====================

    updateLeaderboard(category, entries) {
        this.leaderboards.set(category, entries.sort((a, b) => b.score - a.score));
        this._notifyChange('leaderboard:updated', { category, entries });
    }

    getLeaderboard(category) {
        return this.leaderboards.get(category) || this._defaultLeaderboard(category);
    }

    _defaultLeaderboard(category) {
        const defaults = {
            level: [
                { rank: 1, userId: 'user_elite_1', name: '剑仙·青云子', score: 100, detail: 'Lv.100 仙侠大陆' },
                { rank: 2, userId: 'user_elite_2', name: '暗夜行者', score: 97, detail: 'Lv.97 赛博都市' },
                { rank: 3, userId: 'user_elite_3', name: '灵媒王', score: 95, detail: 'Lv.95 民国异闻' },
                { rank: 4, userId: 'user_creator_1', name: '夜行者', score: 82, detail: 'Lv.82 赛博都市' },
                { rank: 5, userId: 'user_bidder_2', name: '剑痴', score: 78, detail: 'Lv.78 仙侠大陆' }
            ],
            wealth: [
                { rank: 1, userId: 'user_rich_1', name: '仙侠阁主', score: 500000, detail: '500,000¢ 仙侠大陆' },
                { rank: 2, userId: 'user_rich_2', name: '赛博财阀', score: 420000, detail: '420,000¢ 赛博都市' },
                { rank: 3, userId: 'user_rich_3', name: '古董商人', score: 380000, detail: '380,000¢ 民国异闻' }
            ],
            guild: [
                { rank: 1, userId: 'guild_002', name: '仙道联盟', score: 4500, detail: 'Lv.10 · 200人 · 22胜' },
                { rank: 2, userId: 'guild_001', name: '赛博反抗军', score: 3200, detail: 'Lv.8 · 128人 · 15胜' },
                { rank: 3, userId: 'guild_003', name: '灵异调查局', score: 1800, detail: 'Lv.5 · 56人 · 3胜' }
            ],
            creation: [
                { rank: 1, userId: 'user_creator_6', name: '仙侠阁', score: 12500, detail: '120角色卡 · 30世界书' },
                { rank: 2, userId: 'user_creator_2', name: '末日绘师', score: 10200, detail: '80角色卡 · 25世界书' },
                { rank: 3, userId: 'user_creator_1', name: '暗夜工作室', score: 8500, detail: '65角色卡 · 18世界书' }
            ]
        };
        return defaults[category] || [];
    }

    // ==================== 活动动态 ====================

    addActivity(activity) {
        const entry = {
            id: `act_${Date.now()}`,
            ...activity,
            time: new Date().toISOString()
        };
        this.activityFeed.unshift(entry);
        if (this.activityFeed.length > 200) this.activityFeed = this.activityFeed.slice(0, 200);
        this._persist();
        this._notifyChange('activity:added', entry);
        return entry;
    }

    getActivityFeed(limit = 20) {
        return this.activityFeed.slice(0, limit);
    }

    // ==================== 跨世界通讯 ====================

    sendMessage(fromUserId, fromUserName, toUserId, content, worldId = null) {
        if (!this.messages.has(toUserId)) this.messages.set(toUserId, []);
        const msg = {
            id: `msg_${Date.now()}`, fromUserId, fromUserName, toUserId,
            content, worldId, read: false, createdAt: new Date().toISOString()
        };
        this.messages.get(toUserId).push(msg);
        this._notifyChange('message:sent', msg);
        return msg;
    }

    getMessages(userId) {
        return this.messages.get(userId) || [];
    }

    getUnreadCount(userId) {
        return this.getMessages(userId).filter(m => !m.read).length;
    }

    markAsRead(userId, messageId) {
        const msgs = this.messages.get(userId);
        if (!msgs) return;
        const msg = msgs.find(m => m.id === messageId);
        if (msg) msg.read = true;
    }

    // ==================== 搜索 ====================

    searchFriends(query) {
        const lower = query.toLowerCase();
        return this.getFriends().filter(f =>
            f.name.toLowerCase().includes(lower) ||
            (f.tags || []).some(t => t.toLowerCase().includes(lower))
        );
    }

    searchGuilds(query) {
        const lower = query.toLowerCase();
        return this.getGuilds().filter(g =>
            g.name.toLowerCase().includes(lower) ||
            g.tag.toLowerCase().includes(lower) ||
            g.description.toLowerCase().includes(lower)
        );
    }

    // ==================== 统计 ====================

    getStats() {
        return {
            totalFriends: this.friends.size,
            onlineFriends: this.getOnlineFriends().length,
            totalGuilds: this.guilds.size,
            totalActivity: this.activityFeed.length,
            unreadMessages: this.getUnreadCount('current_user')
        };
    }

    _randomGradient() {
        const grads = [
            'linear-gradient(135deg, #6366f1, #8b5cf6)',
            'linear-gradient(135deg, #f59e0b, #ef4444)',
            'linear-gradient(135deg, #10b981, #3b82f6)',
            'linear-gradient(135deg, #ec4899, #8b5cf6)',
            'linear-gradient(135deg, #06b6d4, #6366f1)'
        ];
        return grads[Math.floor(Math.random() * grads.length)];
    }
}

window.SocialInterconnectionSystem = SocialInterconnectionSystem;
