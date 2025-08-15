import { useEffect } from "react";
import skillData from "../skills.json";
import TreeHelpers from "./TreeHelpers";
import TreeInfo from "./TreeInfo";
import SkillDisplay from "./SkillDisplay";
import UnlockRequirements from "./UnlockRequirements";
import "../css/CoachSkillTree.css";

export default function CoachSkillTree({ isPreorderEnabled, data, setData }) {
  const {
    basePoints,
    preorderBonusSkillPoints,
    deductions,
    allocatedPoints,
    unlockedTrees,
    unlockedTiers,
    startingTree,
    expandedTree,
    pointsPerTree,
  } = data;

  const totalDeductions = deductions.reduce((acc, val) => acc + val, 0);

  const availableSkillPoints = basePoints + totalDeductions + (isPreorderEnabled ? preorderBonusSkillPoints : 0);

  useEffect(() => {
    if (startingTree && !data.unlockedTrees.includes(startingTree)) {
      setData({ ...data, unlockedTrees: [startingTree] });
    }
  }, [startingTree, data, setData]);

  const handleHeaderClick = (treeId, isDisabled) => {
    if (isDisabled) return;

    setData(prev => ({
      ...prev,
      expandedTree: prev.expandedTree === treeId ? "" : treeId
    }));

    // Scroll into view after DOM update
    setTimeout(() => {
      document.querySelector(".tree-container.expanded")
        ?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 0);

  };

  return (
    <div className="coach-skill-tree">
      <TreeInfo availableSkillPoints={availableSkillPoints} startingTree={startingTree} data={data} setData={setData} unlockedTiers={unlockedTiers} />

      <div className="tree-wrapper">
        {Object.entries(skillData).map(([treeId, tree]) => {
          const isBasic = tree.type === "basic";
          const isUnlocked = unlockedTrees.includes(treeId);
          const isExpanded = expandedTree === treeId;
          const expandButtonDisabled = !isUnlocked;
          const unlockCost = TreeHelpers.GetTreeCost({ tree, data });
          const requirementsMet = TreeHelpers.TreeMeetsRequirements(tree, pointsPerTree);

          return (
            <div
              key={treeId}
              className={`tree-container ${isExpanded ? "expanded" : "collapsed"}`}
              style={{ borderColor: tree.colour, borderWidth: "5px" }}
            >
              <div
                className="tree-header"
                onClick={() => handleHeaderClick(treeId, expandButtonDisabled)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleHeaderClick(treeId, expandButtonDisabled);
                }}
                aria-expanded={isExpanded}
                aria-disabled={expandButtonDisabled}
              >
                <h2>
                  {treeId} Tree
                </h2>

                {isUnlocked && (
                  isExpanded ? (
                    // Minus icon for Collapse
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <rect x="2" y="7" width="12" height="2" />
                    </svg>
                  ) : (
                    // Plus icon for Expand
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <rect x="7" y="2" width="2" height="12" />
                      <rect x="2" y="7" width="12" height="2" />
                    </svg>
                  )
                )}

                <p className="points-invested">Points Invested: {pointsPerTree[treeId] || 0}</p>

                {!isUnlocked && (
                  <button
                    className={`unlock-btn ${requirementsMet ? "unlocked" : "locked"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      TreeHelpers.UnlockTree({
                        treeId,
                        skillData,
                        data,
                        setData,
                        unlockCost,
                        availableSkillPoints,
                        requirementsMet
                      });
                    }}
                    disabled={isUnlocked || !requirementsMet || availableSkillPoints < unlockCost}
                    aria-disabled={isUnlocked}
                  >
                    Unlock Tree (Cost: {startingTree === treeId ? 0 : unlockCost} Points)
                  </button>
                )}
              </div>

              {!isBasic && !isUnlocked && (<UnlockRequirements tree={tree} pointsPerTree={pointsPerTree} />
              )}

              <div
                className="tree-content"
                aria-hidden={!isExpanded}
                style={{ maxHeight: isExpanded ? "2000px" : "0px" }}
              >
                {isUnlocked && isExpanded && requirementsMet && (
                  <SkillDisplay
                    tree={tree}
                    treeId={treeId}
                    data={data}
                    setData={setData}
                    availableSkillPoints={availableSkillPoints}
                    allocatedPoints={allocatedPoints}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <br />
    </div >
  );
}
