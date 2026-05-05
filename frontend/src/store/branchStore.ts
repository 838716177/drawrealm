import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorldBranch } from '../types';

interface BranchState {
  branches: WorldBranch[];
  currentBranchId: string | null;

  createBranch: (worldId: number, parentBranchId: string | null, forkPointNodeId: string, diffData: any, creatorId?: number) => WorldBranch;
  getBranchTree: (worldId: number) => any[];
  getBranchChain: (branchId: string) => WorldBranch[];
  getBranchesAtNode: (worldId: number, nodeId: string) => WorldBranch[];
  getHotBranches: (worldId: number, limit?: number) => WorldBranch[];
  deleteBranch: (branchId: string) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      branches: [],
      currentBranchId: null,

      createBranch: (worldId, parentBranchId, forkPointNodeId, diffData, creatorId) => {
        const branchId = `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const parent = parentBranchId ? get().branches.find((b) => b.id === parentBranchId) : null;

        const branch: WorldBranch = {
          id: branchId,
          worldId,
          parentBranchId,
          rootWorldId: parent ? parent.rootWorldId : worldId,
          forkPointNodeId,
          forkDepth: parent ? parent.forkDepth + 1 : 1,
          creatorId: creatorId || null,
          branchType: 'extension',
          visibility: 'public',
          forkLicense: 'cc_by_sa',
          diffData: diffData || { addedNodes: [], modifiedNodes: {}, removedNodes: [], newCharacters: [], newItems: [] },
          stats: { playCount: 0, forkCount: 0, rating: 0 },
          metadata: {
            title: diffData?.title || `分支 - ${parent?.metadata?.title || 'origin'}`,
            description: diffData?.description || '',
            tags: diffData?.tags || [],
            createdAt: new Date().toISOString(),
          },
        };

        set((s) => {
          const updated = [...s.branches, branch];
          if (parent) {
            const parentIdx = updated.findIndex((b) => b.id === parentBranchId);
            if (parentIdx >= 0) {
              updated[parentIdx] = {
                ...updated[parentIdx],
                stats: { ...updated[parentIdx].stats, forkCount: updated[parentIdx].stats.forkCount + 1 },
              };
            }
          }
          return { branches: updated, currentBranchId: branchId };
        });

        return branch;
      },

      getBranchTree: (worldId) => {
        const relevant = get().branches.filter((b) => b.worldId === worldId || b.rootWorldId === worldId);
        const buildTree = (branches: WorldBranch[], parentId: string | null = null, depth = 0): any[] => {
          return branches
            .filter((b) => b.parentBranchId === parentId)
            .sort((a, b) => new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime())
            .map((b) => ({
              ...b,
              depth,
              children: buildTree(branches, b.id, depth + 1),
            }));
        };
        return buildTree(relevant);
      },

      getBranchChain: (branchId) => {
        const chain: WorldBranch[] = [];
        let current = get().branches.find((b) => b.id === branchId);
        while (current) {
          chain.unshift(current);
          current = current.parentBranchId ? get().branches.find((b) => b.id === current!.parentBranchId) : undefined;
        }
        return chain;
      },

      getBranchesAtNode: (worldId, nodeId) => {
        return get().branches.filter(
          (b) => (b.worldId === worldId || b.rootWorldId === worldId) && b.forkPointNodeId === nodeId
        );
      },

      getHotBranches: (worldId, limit = 10) => {
        return get()
          .branches.filter((b) => b.worldId === worldId || b.rootWorldId === worldId)
          .sort((a, b) => (b.stats.playCount || 0) - (a.stats.playCount || 0))
          .slice(0, limit);
      },

      deleteBranch: (branchId) => {
        set((s) => ({ branches: s.branches.filter((b) => b.id !== branchId) }));
      },
    }),
    {
      name: 'drawrealm-branches',
      partialize: (state) => ({ branches: state.branches }),
    }
  )
);
