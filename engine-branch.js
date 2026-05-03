/* ============================================================
   妄想商铺 分支系统引擎
   Branch Engine v2.0
   ============================================================ */
(function(global) {
    'use strict';

    class BranchEngine {
        constructor(engine) {
            this.engine = engine || global.Engine;
            this._branches = new Map();
            this._loadedBranches = new Set();
        }

        init() {
            const stored = this.engine.getState('branch.branches') || [];
            stored.forEach(b => this._branches.set(b.id, b));
            this.engine.on('state:world.currentWorldId', (worldId) => {
                if (worldId) this.loadBranchesForWorld(worldId);
            });
            return this;
        }

        loadBranchesForWorld(worldId) {
            if (this._loadedBranches.has(worldId)) return;
            this._loadedBranches.add(worldId);

            const stored = this.engine.getState('branch.branches') || [];
            const allBranches = stored.filter(b =>
                b.worldId === worldId || b.rootWorldId === worldId
            );
            this.engine.mergeState('branch', {
                totalBranches: allBranches.length,
                branches: allBranches,
            });
        }

        async createBranch(worldId, parentBranchId, forkPointNodeId, diffData, creatorId = null) {
            const branchId = `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const parentBranch = parentBranchId
                ? this._branches.get(parentBranchId)
                : null;

            const branch = {
                id: branchId,
                worldId: worldId,
                parentBranchId: parentBranchId || null,
                rootWorldId: parentBranch ? parentBranch.rootWorldId : worldId,
                forkPointNodeId: forkPointNodeId,
                forkDepth: parentBranch ? (parentBranch.forkDepth || 1) + 1 : 1,
                creatorId: creatorId,
                branchType: 'extension',
                visibility: 'public',
                forkLicense: 'cc_by_sa',
                diffData: diffData || { addedNodes: [], modifiedNodes: {}, removedNodes: [], newCharacters: [], newItems: [] },
                stats: { playCount: 0, forkCount: 0, rating: 0 },
                metadata: {
                    title: diffData?.title || `分支 - ${parentBranch?.metadata?.title || 'origin'}`,
                    description: diffData?.description || '',
                    tags: diffData?.tags || [],
                    createdAt: new Date().toISOString(),
                },
            };

            this._branches.set(branchId, branch);

            const branches = this.engine.getState('branch.branches') || [];
            branches.push(branch);
            this.engine.setState('branch.branches', branches);
            this.engine.setState('branch.currentForkDepth', branch.forkDepth);

            if (parentBranch) {
                parentBranch.stats.forkCount = (parentBranch.stats.forkCount || 0) + 1;
                this._branches.set(parentBranchId, parentBranch);
            }

            if (global.Drawrealm?.Audio) {
                global.Drawrealm.Audio.play('branch');
            }

            this.engine.emit('branch:created', branch);
            return branch;
        }

        getBranchTree(worldId) {
            const branches = this.engine.getState('branch.branches') || [];
            const relevant = branches.filter(b => b.rootWorldId === worldId || b.worldId === worldId);
            const tree = this._buildTree(relevant);
            return tree;
        }

        _buildTree(branches, parentId = null, depth = 0) {
            return branches
                .filter(b => b.parentBranchId === parentId)
                .sort((a, b) => new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt))
                .map(b => ({
                    ...b,
                    depth,
                    children: this._buildTree(branches, b.id, depth + 1),
                }));
        }

        getBranchChain(branchId) {
            const chain = [];
            let current = this._branches.get(branchId);
            while (current) {
                chain.unshift(current);
                current = current.parentBranchId ? this._branches.get(current.parentBranchId) : null;
            }
            return chain;
        }

        applyBranchDiff(node, branchId) {
            const branch = this._branches.get(branchId);
            if (!branch || !branch.diffData) return node;

            const diff = branch.diffData;
            if (diff.modifiedNodes && diff.modifiedNodes[node.id]) {
                return { ...node, ...diff.modifiedNodes[node.id] };
            }
            return node;
        }

        getBranchesAtNode(worldId, nodeId) {
            const branches = this.engine.getState('branch.branches') || [];
            return branches.filter(b =>
                (b.worldId === worldId || b.rootWorldId === worldId) &&
                b.forkPointNodeId === nodeId
            );
        }

        getHotBranches(worldId, limit = 10) {
            const branches = this.engine.getState('branch.branches') || [];
            return branches
                .filter(b => b.worldId === worldId || b.rootWorldId === worldId)
                .sort((a, b) => (b.stats.playCount || 0) - (a.stats.playCount || 0))
                .slice(0, limit);
        }

        deleteBranch(branchId) {
            this._branches.delete(branchId);
            const branches = this.engine.getState('branch.branches') || [];
            this.engine.setState('branch.branches', branches.filter(b => b.id !== branchId));
            this.engine.emit('branch:deleted', branchId);
        }
    }

    global.Drawrealm = global.Drawrealm || {};
    global.Drawrealm.BranchEngine = BranchEngine;
    global.Drawrealm.Branch = new BranchEngine(global.Engine);

})(window);
