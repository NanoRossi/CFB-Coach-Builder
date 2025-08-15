import skillData from '../skills.json';

class TreeHelpers {

    static AllocateSkill(treeId, categoryIndex, skillIndex, data, setData, availableSkillPoints) {
        const category = skillData[treeId].categories[categoryIndex];
        const skill = category.skills[skillIndex];
        const currentTier = skill.tier;

        let totalCost = 0;
        const newAllocatedPoints = { ...data.allocatedPoints };

        for (let i = 0; i <= skillIndex; i++) {
            const prevSkill = category.skills[i];
            const prevKey = `${treeId}-${categoryIndex}-${i}`;

            if (!newAllocatedPoints[prevKey]) {
                totalCost += prevSkill.cost;
                newAllocatedPoints[prevKey] = prevSkill.cost;
            }
        }

        if (availableSkillPoints < totalCost) {
            alert("You don't have enough points to allocate this skill.");
            return;
        }

        // Update all related nested states inside data
        setData({
            ...data,
            allocatedPoints: newAllocatedPoints,
            deductions: [...data.deductions, -Math.abs(totalCost)],
            pointsPerTree: {
                ...data.pointsPerTree,
                [treeId]: (data.pointsPerTree?.[treeId] || 0) + totalCost,
            },
            unlockedTiers: {
                ...data.unlockedTiers,
                [treeId]: {
                    ...data.unlockedTiers?.[treeId],
                    [categoryIndex]: currentTier + 1,
                },
            },
        });
    };

    static GetTreeCost({ tree, data, indexMod }) {
        // Determine the effective index, applying indexMod if provided
        const baseIndex = tree.type === "basic" ? (data.baseIndex || 0) - (indexMod || 0) :
            tree.type === "advanced" ? (data.advancedIndex || 0) - (indexMod || 0) :
                tree.type === "crossover" ? (data.crossoverIndex || 0) - (indexMod || 0) :
                    0;

        let unlockCost = 0;

        // standard trees have dynamic cost based upon how many of that type of tree you have unlocked
        if (tree.type === "basic") {
            unlockCost = data.baseTreeCosts[baseIndex] || 0;
        } else if (tree.type === "advanced") {
            unlockCost = data.advancedTreeCosts[baseIndex] || 0;
        } else if (tree.type === "crossover") {
            unlockCost = data.crossoverTreeCosts[baseIndex] || 0;
        } else if (tree.type === "elite") {
            // elite trees have a fixed cost
            unlockCost = tree.treeUnlockCost || 0;
        }

        return unlockCost;
    }

    static UnlockTree({ treeId, skillData, data, setData, unlockCost, availableSkillPoints, requirementsMet }) {
        const tree = skillData[treeId];
        const unlockedTrees = data.unlockedTrees || [];

        if (tree.type !== "basic") {

            if (!requirementsMet) {
                alert("You haven't met the requirements to unlock this advanced tree.");
                return;
            }
        }

        if (availableSkillPoints >= unlockCost && !unlockedTrees.includes(treeId)) {
            setData(prev => ({
                ...prev,
                unlockedTrees: [...(prev.unlockedTrees || []), treeId],
                deductions: [...(prev.deductions || []), -Math.abs(unlockCost)],
                baseIndex: tree.type === "basic" ? (prev.baseIndex || 0) + 1 : prev.baseIndex,
                advancedIndex: tree.type === "advanced" ? (prev.advancedIndex || 0) + 1 : prev.advancedIndex,
                crossoverIndex: tree.type === "crossover" ? (prev.crossoverIndex || 0) + 1 : prev.crossoverIndex,
            }));
        }
    };

    static DeallocateSkill(treeId, categoryIndex, skillIndex, data) {
        const skill = skillData[treeId].categories[categoryIndex].skills[skillIndex];
        const key = `${treeId}-${categoryIndex}-${skillIndex}`;

        if (!data.allocatedPoints[key]) return data;

        let totalPointsRemoved = skill.cost;
        const updatedAllocatedPoints = { ...data.allocatedPoints };
        delete updatedAllocatedPoints[key];

        const currentTier = skill.tier;

        // Recursively remove higher-tier skills
        for (let nextSkillIndex = skillIndex + 1; nextSkillIndex < skillData[treeId].categories[categoryIndex].skills.length; nextSkillIndex++) {
            const nextSkill = skillData[treeId].categories[categoryIndex].skills[nextSkillIndex];
            const nextKey = `${treeId}-${categoryIndex}-${nextSkillIndex}`;

            if (nextSkill.tier > currentTier && data.allocatedPoints[nextKey]) {
                totalPointsRemoved += nextSkill.cost;
                delete updatedAllocatedPoints[nextKey];
            } else {
                break;
            }
        }

        // Update unlocked tiers
        let updatedUnlockedTiers = { ...data.unlockedTiers };

        if (skillIndex === 0) {
            if (updatedUnlockedTiers[treeId]) {
                const updatedCategories = { ...updatedUnlockedTiers[treeId] };
                delete updatedCategories[categoryIndex];

                if (Object.keys(updatedCategories).length === 0) {
                    delete updatedUnlockedTiers[treeId];
                } else {
                    updatedUnlockedTiers[treeId] = updatedCategories;
                }
            }
        } else {
            if (
                updatedUnlockedTiers[treeId] &&
                updatedUnlockedTiers[treeId][categoryIndex] > currentTier
            ) {
                updatedUnlockedTiers = {
                    ...updatedUnlockedTiers,
                    [treeId]: {
                        ...updatedUnlockedTiers[treeId],
                        [categoryIndex]: currentTier,
                    },
                };
            }
        }

        return {
            ...data,
            allocatedPoints: updatedAllocatedPoints,
            deductions: [...data.deductions, Math.abs(totalPointsRemoved)],
            pointsPerTree: {
                ...data.pointsPerTree,
                [treeId]: Math.max((data.pointsPerTree?.[treeId] || 0) - totalPointsRemoved, 0),
            },
            unlockedTiers: updatedUnlockedTiers,
        };
    }

    static LockTree({ treeId, data, unlockCost }) {
        let tempData = { ...data };

        // Deallocate all skills in this tree (pure)
        const treeCategories = skillData[treeId]?.categories || [];
        treeCategories.forEach((_, categoryIndex) => {
            tempData = this.DeallocateSkill(treeId, categoryIndex, 0, tempData);
        });

        // Remove tree from unlockedTrees
        const updatedUnlockedTrees = (tempData.unlockedTrees || []).filter(id => id !== treeId);
        // Remove the deduction for unlocking this tree
        const target = -Math.abs(Number(unlockCost));
        const updatedDeductions = [...(tempData.deductions || [])];
        const index = updatedDeductions.findIndex(d => Number(d) === target);
        if (index !== -1) updatedDeductions.splice(index, 1);

        // Only decrement the index for the type of tree we're locking
        const tree = skillData[treeId];
        const updatedIndexes = {
            baseIndex: tempData.baseIndex,
            advancedIndex: tempData.advancedIndex,
            crossoverIndex: tempData.crossoverIndex,
        };

        if (tree.type === "basic") {
            updatedIndexes.baseIndex = Math.max((tempData.baseIndex || 0) - 1, 0);
        } else if (tree.type === "advanced") {
            updatedIndexes.advancedIndex = Math.max((tempData.advancedIndex || 0) - 1, 0);
        } else if (tree.type === "crossover") {
            updatedIndexes.crossoverIndex = Math.max((tempData.crossoverIndex || 0) - 1, 0);
        }

        return {
            ...tempData,
            unlockedTrees: updatedUnlockedTrees,
            deductions: updatedDeductions,
            ...updatedIndexes,
        };
    }

    static ToggleCollapse(treeId, data, setData) {
        const expandedTrees = data.expandedTrees || {};
        const newState = {
            ...expandedTrees,
            [treeId]: !expandedTrees[treeId]
        };

        setData(prev => ({
            ...prev,
            expandedTrees: newState
        }));
    };

    static SetDataField(field, value, setData) {
        setData(prev => ({
            ...prev,
            [field]: value
        }));
    }

    static ResetData(startingTree, data, setData) {
        setData({
            ...data,
            deductions: [],
            allocatedPoints: {},
            unlockedTiers: {},
            unlockedTrees: [startingTree],
            startingTree: startingTree,
            expandedTrees: {},
            pointsPerTree: {},
            baseIndex: 1,
            advancedIndex: 0,
            crossoverIndex: 0,
        });
    }

    static CollapseAll(data, setData) {
        setData({
            ...data,
            expandedTrees: {}
        });
    }

    static TreeMeetsRequirements(tree, pointsPerTree) {
        return (tree.unlockRequirements || []).every(req => Object.entries(req).every(([requiredTree, requiredPoints]) => {
            const currentPoints = requiredTree === "Any"
                ? Math.max(...Object.values(pointsPerTree), 0)
                : pointsPerTree[requiredTree] || 0;
            return currentPoints >= requiredPoints;
        }));
    }
}

export default TreeHelpers;