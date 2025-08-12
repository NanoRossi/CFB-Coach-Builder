import { useEffect } from "react";
import skillData from "../skills.json";
import TreeHelpers from "./TreeHelpers";
import TreeInfo from "./TreeInfo";
import "../css/CoachSkillTree.css";

export default function CoachSkillTree({ isPreorderEnabled, data, setData }) {
  const {
    basePoints,
    preorderBonusSkillPoints,
    deductions,
    allocatedPoints,
    unlockedTrees,
    startingTree,
    expandedTree,
    pointsPerTree,
  } = data;

  const totalDeductions = deductions.reduce((acc, val) => acc + val, 0);
  const availableSkillPoints = basePoints + totalDeductions + (isPreorderEnabled ? preorderBonusSkillPoints : 0);

  useEffect(() => {
    if (startingTree) {
      console.log(`Setting initial tree: ${startingTree}`);
      setData({ ...data, unlockedTrees: [startingTree] });
    }
  }, [startingTree]);

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
      <TreeInfo availableSkillPoints={availableSkillPoints} startingTree={startingTree} data={data} setData={setData} />

      <div className="tree-wrapper">
        {Object.entries(skillData).map(([treeId, tree]) => {
          const isBasic = tree.type === "basic";
          const isUnlocked = unlockedTrees.includes(treeId);
          const isExpanded = expandedTree === treeId;
          const expandButtonDisabled = !isUnlocked;

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
                    className="unlock-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      TreeHelpers.UnlockTree({
                        treeId,
                        skillData,
                        data,
                        setData,
                        unlockCost: TreeHelpers.GetTreeCost({ tree, data }),
                        availableSkillPoints,
                      });
                    }}
                    disabled={isUnlocked}
                    aria-disabled={isUnlocked}
                  >
                    Unlock Tree (Cost: {startingTree === treeId ? 0 : TreeHelpers.GetTreeCost({ tree, data })} Points)
                  </button>
                )}
              </div>

              {/* Unlock requirements always visible */}
              {!isBasic && (
                <div className="unlock-requirements">
                  <h4>Unlock Requirements:</h4>
                  {tree.unlockRequirements.map((req, idx) =>
                    Object.entries(req).map(([requiredTree, requiredPoints], innerIdx) => {
                      const currentPoints =
                        requiredTree === "Any"
                          ? Math.max(...Object.values(pointsPerTree), 0)
                          : pointsPerTree[requiredTree] || 0;
                      const progress = Math.min((currentPoints / requiredPoints) * 100, 100);

                      return (
                        <div key={`${idx}-${innerIdx}`} className="requirement">
                          <p>
                            <strong>{requiredTree} Tree:</strong> {currentPoints} / {requiredPoints} Points
                          </p>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${progress}%`, backgroundColor: progress === 100 ? "green" : "red" }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Accordion content panel */}
              <div
                className="tree-content"
                aria-hidden={!isExpanded}
                style={{ maxHeight: isExpanded ? "2000px" : "0px" }}
              >
                {isUnlocked && isExpanded && (
                  <div className="category-grid">
                    {tree.categories.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="category">
                        <h3>{category.name}</h3>
                        {category.skills.map((skill, skillIndex) => (
                          <div key={skillIndex} className="skill">
                            <p>
                              <strong>Tier {skill.tier}:</strong> {skill.description}
                            </p>
                            <button
                              onClick={() =>
                                TreeHelpers.AllocateSkill(treeId, categoryIndex, skillIndex, data, setData, availableSkillPoints)
                              }
                              disabled={allocatedPoints[`${treeId}-${categoryIndex}-${skillIndex}`] || availableSkillPoints < skill.cost}
                              className="skill-button add-skill-button"
                            >
                              Add Skill ({skill.cost} Points)
                            </button>
                            <button
                              onClick={() => TreeHelpers.DeallocateSkill(treeId, categoryIndex, skillIndex, data, setData)}
                              disabled={!allocatedPoints[`${treeId}-${categoryIndex}-${skillIndex}`]}
                              className="skill-button remove-skill-button"
                            >
                              Remove Skill
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
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
