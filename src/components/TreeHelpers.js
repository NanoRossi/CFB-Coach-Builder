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

    static DeallocateSkill(treeId, categoryIndex, skillIndex, data, setData) {
        const skill = skillData[treeId].categories[categoryIndex].skills[skillIndex];
        const key = `${treeId}-${categoryIndex}-${skillIndex}`;

        if (!data.allocatedPoints[key]) return;

        let totalPointsRemoved = skill.cost;
        const updatedAllocatedPoints = { ...data.allocatedPoints };
        delete updatedAllocatedPoints[key];

        const currentTier = skill.tier;

        // Recursively remove higher-tier skills in the same category
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
            // Remove category tier entry if first skill is deallocated
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

        setData({
            ...data,
            allocatedPoints: updatedAllocatedPoints,
            deductions: [...data.deductions, Math.abs(totalPointsRemoved)],
            pointsPerTree: {
                ...data.pointsPerTree,
                [treeId]: Math.max((data.pointsPerTree?.[treeId] || 0) - totalPointsRemoved, 0),
            },
            unlockedTiers: updatedUnlockedTiers,
        });
    }

    static GetTreeCost({ tree, data }) {
        // standard trees have dynamic cost based upon how many of that type of tree you have unlocked
        let unlockCost = tree.type === "basic" ? data.baseTreeCosts[data.baseIndex] :
            tree.type === "advanced" ? data.advancedTreeCosts[data.advancedIndex] :
                tree.type === "crossover" ? data.crossoverTreeCosts[data.crossoverIndex] : 0;

        // elite trees have a fixed cost
        if (tree.type === "elite") {
            unlockCost = tree.treeUnlockCost;
        }

        return unlockCost;
    }

    static UnlockTree({ treeId, skillData, data, setData, unlockCost, availableSkillPoints }) {
        const tree = skillData[treeId];
        const pointsPerTree = data.pointsPerTree || {};
        const unlockedTrees = data.unlockedTrees || [];

        if (tree.type !== "basic") {
            const meetsRequirements = tree.unlockRequirements.every((req) => {
                if (Array.isArray(req)) {
                    return req.every(([requiredTree, requiredPoints]) => {
                        if (requiredTree === "Any") {
                            return Math.max(...Object.values(pointsPerTree)) >= parseInt(requiredPoints, 10);
                        } else {
                            return (pointsPerTree[requiredTree] || 0) >= parseInt(requiredPoints, 10);
                        }
                    });
                } else {
                    const [requiredTree, requiredPoints] = Object.entries(req)[0];
                    if (requiredTree === "Any") {
                        return Math.max(...Object.values(pointsPerTree)) >= parseInt(requiredPoints, 10);
                    } else {
                        return (pointsPerTree[requiredTree] || 0) >= parseInt(requiredPoints, 10);
                    }
                }
            });

            if (!meetsRequirements) {
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
}

export default TreeHelpers;