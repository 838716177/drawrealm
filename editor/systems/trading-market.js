/**
 * 绘境Online - 交易市场系统
 * 差异化特性：托管交易、拍卖、创作者经济(70-85%)、评价体系
 */
class TradingMarketSystem {
    constructor(store) {
        this.store = store || dataStore;
        this.listings = new Map();
        this.auctions = new Map();
        this.transactions = [];
        this.escrow = new EscrowManager();
        this.ratingSystem = new RatingSystem();
        this.economy = new EconomyEngine();
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
        const saved = localStorage.getItem('huijing_market_state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                (state.listings || []).forEach(l => this.listings.set(l.id, l));
                (state.auctions || []).forEach(a => this.auctions.set(a.id, a));
                this.transactions = state.transactions || [];
            } catch (e) {}
        }
        if (this.listings.size === 0) this._initDefaultListings();
        if (this.auctions.size === 0) this._initDefaultAuctions();
    }

    _persist() {
        const state = {
            listings: Array.from(this.listings.values()),
            auctions: Array.from(this.auctions.values()),
            transactions: this.transactions.slice(-100)
        };
        localStorage.setItem('huijing_market_state', JSON.stringify(state));
    }

    _initDefaultListings() {
        const defaults = [
            {
                id: 'list_001', type: 'character', itemId: 'char_sample_1',
                name: '影武者·暗夜', sellerId: 'user_creator_1', sellerName: '暗夜工作室',
                price: 5000, currency: 'credit', rarity: 'rare',
                description: '高等级赛博朋克角色卡，包含完整技能树和传说装备',
                tags: ['赛博朋克', '战斗型', '成品'], rating: 4.8, salesCount: 23,
                createdAt: new Date().toISOString()
            },
            {
                id: 'list_002', type: 'world', itemId: 'world_sample_1',
                name: '末世求生·废土世界', sellerId: 'user_creator_2', sellerName: '末日绘师',
                price: 15000, currency: 'credit', rarity: 'epic',
                description: '完整的废土世界观，包含10个区域、8个势力、50+剧情节点',
                tags: ['末日', '生存', '开放世界'], rating: 4.9, salesCount: 56,
                createdAt: new Date().toISOString()
            },
            {
                id: 'list_003', type: 'equipment', itemId: 'eq_sample_1',
                name: '量子切割刃', sellerId: 'user_creator_3', sellerName: '铁匠铺',
                price: 3500, currency: 'credit', rarity: 'legendary',
                description: '攻击+150，附带量子穿透效果，无视50%防御',
                tags: ['武器', '传说', '高属性'], rating: 5.0, salesCount: 12,
                createdAt: new Date().toISOString()
            },
            {
                id: 'list_004', type: 'character', itemId: 'char_sample_2',
                name: '灵媒师·苏婉', sellerId: 'user_creator_4', sellerName: '灵异工坊',
                price: 3000, currency: 'credit', rarity: 'rare',
                description: '民国灵异角色卡，可通灵问神，附带专属技能"幽冥眼"',
                tags: ['民国', '灵异', '辅助型'], rating: 4.7, salesCount: 34,
                createdAt: new Date().toISOString()
            },
            {
                id: 'list_005', type: 'playset', itemId: 'ps_sample_1',
                name: '侦探推理·谜案追踪', sellerId: 'user_creator_5', sellerName: '推理社',
                price: 8000, currency: 'credit', rarity: 'epic',
                description: '完整的推理玩法集，包含线索收集、审讯、推理验证机制',
                tags: ['推理', '剧情', '多人'], rating: 4.6, salesCount: 41,
                createdAt: new Date().toISOString()
            }
        ];
        defaults.forEach(l => this.listings.set(l.id, l));
        this._persist();
    }

    _initDefaultAuctions() {
        const now = Date.now();
        const defaults = [
            {
                id: 'auc_001', type: 'character', itemId: 'char_auc_1',
                name: '剑仙·青云子', sellerId: 'user_creator_6', sellerName: '仙侠阁',
                startingBid: 10000, currentBid: 25000, buyoutPrice: 50000,
                currency: 'credit', rarity: 'legendary',
                bids: [
                    { userId: 'user_bidder_1', userName: '收藏家A', amount: 20000, time: new Date(now - 7200000).toISOString() },
                    { userId: 'user_bidder_2', userName: '剑痴', amount: 25000, time: new Date(now - 3600000).toISOString() }
                ],
                bidCount: 12, endsAt: new Date(now + 86400000).toISOString(),
                status: 'active', createdAt: new Date(now - 172800000).toISOString()
            },
            {
                id: 'auc_002', type: 'equipment', itemId: 'eq_auc_1',
                name: '龙鳞玄甲', sellerId: 'user_creator_6', sellerName: '仙侠阁',
                startingBid: 8000, currentBid: 18000, buyoutPrice: 35000,
                currency: 'credit', rarity: 'epic',
                bids: [
                    { userId: 'user_bidder_3', userName: '防具收集者', amount: 18000, time: new Date(now - 1800000).toISOString() }
                ],
                bidCount: 8, endsAt: new Date(now + 43200000).toISOString(),
                status: 'active', createdAt: new Date(now - 86400000).toISOString()
            }
        ];
        defaults.forEach(a => this.auctions.set(a.id, a));
        this._persist();
    }

    // ==================== 上架/下架 ====================

    listItem(item) {
        const listing = {
            id: `list_${Date.now()}`,
            type: item.type || 'character',
            itemId: item.itemId || item.id,
            name: item.name,
            sellerId: item.sellerId || 'current_user',
            sellerName: item.sellerName || '我',
            price: item.price || 0,
            currency: item.currency || 'credit',
            rarity: item.rarity || 'common',
            description: item.description || '',
            tags: item.tags || [],
            images: item.images || [],
            rating: 0,
            salesCount: 0,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        this.listings.set(listing.id, listing);
        this._persist();
        this._notifyChange('listing:created', listing);
        return listing;
    }

    removeListing(listingId) {
        const listing = this.listings.get(listingId);
        this.listings.delete(listingId);
        this._persist();
        this._notifyChange('listing:removed', listing);
        return listing;
    }

    getListing(id) {
        return this.listings.get(id);
    }

    getAllListings() {
        return Array.from(this.listings.values()).filter(l => l.status === 'active');
    }

    // ==================== 拍卖 ====================

    createAuction(item) {
        const auction = {
            id: `auc_${Date.now()}`,
            type: item.type || 'character',
            itemId: item.itemId || item.id,
            name: item.name,
            sellerId: item.sellerId || 'current_user',
            sellerName: item.sellerName || '我',
            startingBid: item.startingBid || 1000,
            currentBid: item.startingBid || 1000,
            buyoutPrice: item.buyoutPrice || null,
            currency: item.currency || 'credit',
            rarity: item.rarity || 'rare',
            bids: [],
            bidCount: 0,
            duration: item.duration || 86400000,
            endsAt: new Date(Date.now() + (item.duration || 86400000)).toISOString(),
            status: 'active',
            createdAt: new Date().toISOString()
        };
        this.auctions.set(auction.id, auction);
        this._persist();
        this._notifyChange('auction:created', auction);
        return auction;
    }

    placeBid(auctionId, userId, userName, amount) {
        const auction = this.auctions.get(auctionId);
        if (!auction || auction.status !== 'active') return null;
        if (amount <= auction.currentBid) return null;
        if (auction.buyoutPrice && amount >= auction.buyoutPrice) {
            amount = auction.buyoutPrice;
            auction.status = 'sold';
        }
        auction.currentBid = amount;
        auction.bidCount++;
        auction.bids.push({
            userId, userName, amount,
            time: new Date().toISOString()
        });
        this._persist();
        this._notifyChange('auction:bid', { auctionId, amount, userId });
        return auction;
    }

    getAuction(id) {
        return this.auctions.get(id);
    }

    getAllAuctions() {
        return Array.from(this.auctions.values());
    }

    getActiveAuctions() {
        return this.getAllAuctions().filter(a => a.status === 'active');
    }

    // ==================== 交易执行 ====================

    buyItem(listingId, buyerId, buyerName) {
        const listing = this.listings.get(listingId);
        if (!listing || listing.status !== 'active') return null;
        const price = listing.price;
        const fee = this.economy.calculateTradeFee(price);
        const creatorRevenue = this.economy.calculateCreatorRevenue(price);
        const platformRevenue = this.economy.calculatePlatformRevenue(price);
        const transaction = {
            id: `txn_${Date.now()}`,
            listingId,
            type: 'buy',
            itemId: listing.itemId,
            itemName: listing.name,
            sellerId: listing.sellerId,
            sellerName: listing.sellerName,
            buyerId, buyerName,
            price,
            fee,
            creatorRevenue,
            platformRevenue,
            status: 'completed',
            createdAt: new Date().toISOString()
        };
        listing.status = 'sold';
        listing.salesCount = (listing.salesCount || 0) + 1;
        this.transactions.push(transaction);
        const escrowEntry = this.escrow.hold(buyerId, price, transaction.id);
        this.escrow.release(escrowEntry.id, listing.sellerId, creatorRevenue);
        this._persist();
        this._notifyChange('transaction:completed', transaction);
        return transaction;
    }

    buyNowAuction(auctionId, buyerId, buyerName) {
        const auction = this.auctions.get(auctionId);
        if (!auction || !auction.buyoutPrice) return null;
        return this.placeBid(auctionId, buyerId, buyerName, auction.buyoutPrice);
    }

    getTransactionHistory(userId = null) {
        if (!userId) return [...this.transactions];
        return this.transactions.filter(t =>
            t.buyerId === userId || t.sellerId === userId
        );
    }

    // ==================== 搜索筛选 ====================

    searchListings(query) {
        const lower = query.toLowerCase();
        return this.getAllListings().filter(l =>
            l.name.toLowerCase().includes(lower) ||
            l.description.toLowerCase().includes(lower) ||
            (l.tags || []).some(t => t.toLowerCase().includes(lower))
        );
    }

    filterListings(filters = {}) {
        let results = this.getAllListings();
        if (filters.type) results = results.filter(l => l.type === filters.type);
        if (filters.rarity) results = results.filter(l => l.rarity === filters.rarity);
        if (filters.minPrice) results = results.filter(l => l.price >= filters.minPrice);
        if (filters.maxPrice) results = results.filter(l => l.price <= filters.maxPrice);
        if (filters.sortBy === 'price_asc') results.sort((a, b) => a.price - b.price);
        if (filters.sortBy === 'price_desc') results.sort((a, b) => b.price - a.price);
        if (filters.sortBy === 'rating') results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        if (filters.sortBy === 'sales') results.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        if (filters.sortBy === 'newest') results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return results;
    }

    // ==================== 评价系统 ====================

    rateListing(listingId, userId, score, comment = '') {
        return this.ratingSystem.addRating(listingId, userId, score, comment);
    }

    getCreatorStats(sellerId) {
        const soldListings = this.getAllListings().filter(l => l.sellerId === sellerId && l.status === 'sold');
        const transactions = this.transactions.filter(t => t.sellerId === sellerId && t.status === 'completed');
        const totalRevenue = transactions.reduce((sum, t) => sum + t.creatorRevenue, 0);
        return {
            totalListings: this.getAllListings().filter(l => l.sellerId === sellerId).length,
            totalSold: soldListings.length,
            totalRevenue,
            averageRating: 0
        };
    }

    // ==================== 统计 ====================

    getMarketStats() {
        const allListings = this.getAllListings();
        return {
            totalListings: allListings.length,
            totalSellers: new Set(allListings.map(l => l.sellerId)).size,
            averagePrice: allListings.reduce((sum, l) => sum + l.price, 0) / Math.max(allListings.length, 1),
            totalTransactions: this.transactions.length,
            activeAuctions: this.getActiveAuctions().length
        };
    }
}

class EscrowManager {
    constructor() {
        this.entries = new Map();
    }

    hold(userId, amount, referenceId) {
        const entry = {
            id: `esc_${Date.now()}`,
            userId, amount, referenceId,
            status: 'held',
            createdAt: new Date().toISOString()
        };
        this.entries.set(entry.id, entry);
        return entry;
    }

    release(entryId, recipientId, amount) {
        const entry = this.entries.get(entryId);
        if (!entry) return null;
        entry.status = 'released';
        entry.releasedTo = recipientId;
        entry.releasedAmount = amount;
        entry.releasedAt = new Date().toISOString();
        return entry;
    }

    refund(entryId) {
        const entry = this.entries.get(entryId);
        if (!entry) return null;
        entry.status = 'refunded';
        entry.refundedAt = new Date().toISOString();
        return entry;
    }
}

class RatingSystem {
    constructor() {
        this.ratings = new Map();
    }

    addRating(targetId, userId, score, comment) {
        const clamped = Math.max(1, Math.min(5, score));
        if (!this.ratings.has(targetId)) {
            this.ratings.set(targetId, []);
        }
        const existingIdx = this.ratings.get(targetId).findIndex(r => r.userId === userId);
        const rating = { userId, score: clamped, comment, time: new Date().toISOString() };
        if (existingIdx >= 0) {
            this.ratings.get(targetId)[existingIdx] = rating;
        } else {
            this.ratings.get(targetId).push(rating);
        }
        return this.getAverage(targetId);
    }

    getAverage(targetId) {
        const ratings = this.ratings.get(targetId) || [];
        if (ratings.length === 0) return { average: 0, count: 0 };
        return {
            average: ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length,
            count: ratings.length
        };
    }
}

window.TradingMarketSystem = TradingMarketSystem;
window.EscrowManager = EscrowManager;
window.RatingSystem = RatingSystem;
