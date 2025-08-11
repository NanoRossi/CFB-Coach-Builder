import { useEffect } from "react";
import "../css/CoachSkillTree.css";
import skillData from '../skills.json';
import TreeInfo from "./TreeInfo";
import TreeHelpers from "./TreeHelpers";

export default function CoachSkillTree({ isPreorderEnabled, data, setData }) {

  const {
    basePoints,
    preorderBonusSkillPoints,
    deductions,
    allocatedPoints,
    unlockedTrees,
    startingTree,
    expandedTrees,
    pointsPerTree,
  } = data;

  // Calculate total deductions
  const totalDeductions = deductions.reduce((acc, val) => acc + val, 0);

  // Final available skill points
  const availableSkillPoints = basePoints + totalDeductions + (isPreorderEnabled ? preorderBonusSkillPoints : 0);

  useEffect(() => {
    if (startingTree) {
      setData({ ...data, unlockedTrees: [startingTree] });
    }
  }, [startingTree]);



  return (
    <div className="coach-skill-tree">
      <TreeInfo availableSkillPoints={availableSkillPoints} startingTree={startingTree} data={data} setData={setData} />

      <div className="tree-wrapper">
        {Object.keys(skillData).map((treeId) => {
          const tree = skillData[treeId];
          const isBasic = tree.type === "basic";

          return (
            <div key={treeId} className={`tree-container ${expandedTrees?.[treeId] ? "expanded" : "collapsed"}`} style={{ backgroundColor: tree.colour }}>
              <div className="tree-header">
                <h2>
                  {treeId} Tree
                  <button onClick={() => TreeHelpers.ToggleCollapse(treeId, data, setData)} disabled={!unlockedTrees.includes(treeId)}>
                    {expandedTrees[treeId] ? "Collapse" : "Expand"}
                  </button>
                </h2>

                <p>Points Invested: {pointsPerTree[treeId] || 0}</p>

                <button
                  onClick={() =>
                    TreeHelpers.UnlockTree({
                      treeId,
                      skillData,
                      data,
                      setData,
                      unlockCost: TreeHelpers.GetTreeCost({ tree, data }),
                      availableSkillPoints,
                    })
                  }
                  disabled={unlockedTrees.includes(treeId)}
                >
                  Unlock Tree (Cost: {startingTree === treeId ? 0 : TreeHelpers.GetTreeCost({ tree, data })} Points)
                </button>
              </div>

              {!isBasic && (
                <div className="unlock-requirements">
                  <h4>Unlock Requirements:</h4>

                  {tree.unlockRequirements.map((req, index) => {
                    // Iterate over each requirement within the unlock requirements
                    return Object.entries(req).map(([requiredTree, requiredPoints], innerIndex) => {
                      var currentPoints;
                      if (requiredTree === "Any") {
                        currentPoints = Math.max(...Object.values(pointsPerTree), 0);
                      } else {
                        currentPoints = pointsPerTree[requiredTree] || 0;
                      }

                      const progress = Math.min((currentPoints / requiredPoints) * 100, 100);

                      return (
                        <div key={`${index}-${innerIndex}`} className="requirement">
                          <p>
                            <strong>{requiredTree} Tree:</strong> {currentPoints} / {requiredPoints} Points
                          </p>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${progress}%`, backgroundColor: progress === 100 ? "green" : "red" }}
                            ></div>
                          </div>
                        </div>
                      );
                    });
                  })}
                </div>
              )}

              {unlockedTrees.includes(treeId) && expandedTrees[treeId] && (
                <div className="category-grid">
                  {tree.categories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="category">
                      <h3>{category.name}</h3>
                      {category.skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="skill">
                          <p><strong>Tier {skill.tier}: </strong>{skill.description}</p>
                          <button
                            onClick={() => TreeHelpers.AllocateSkill(treeId, categoryIndex, skillIndex, data, setData, availableSkillPoints)}
                            disabled={
                              allocatedPoints[`${treeId}-${categoryIndex}-${skillIndex}`] ||
                              availableSkillPoints < skill.cost
                            }
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
          );
        })}
      </div>
      <br />
    </div>
  );
}