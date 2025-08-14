import { useState } from "react";
import TreeHelpers from "./TreeHelpers";

import "../css/SkillDisplay.css";

export default function SkillDisplay({ tree, treeId, data, setData, availableSkillPoints, allocatedPoints }) {
    const [openCategory, setOpenCategory] = useState(null); // Track which category is open

    const toggleCategory = (index) => {
        setOpenCategory((prev) => (prev === index ? null : index));
    };

    return (
        <div className="category-accordion">
            {tree.categories.map((category, categoryIndex) => {
                const isOpen = openCategory === categoryIndex;

                return (
                    <div key={categoryIndex} className="accordion-item">
                        <button
                            className="accordion-header"
                            onClick={() => toggleCategory(categoryIndex)}
                        >
                            <span>{category.name} {isOpen ? "▲" : "▼"}</span>

                            {/* Progress meter */}
                            <div className="category-progress">
                                {category.skills.map((skill, idx) => (
                                    <div
                                        key={idx}
                                        className={`progress-chunk ${allocatedPoints[`${treeId}-${categoryIndex}-${idx}`] ? "filled" : ""}`}
                                    />
                                ))}
                            </div>
                        </button>

                        {isOpen && (
                            <div className="accordion-content">
                                {category.skills.map((skill, skillIndex) => (
                                    <div key={skillIndex} className="skill">
                                        <p>
                                            <strong>Tier {skill.tier}:</strong> {skill.description}
                                        </p>
                                        <button
                                            onClick={() =>
                                                TreeHelpers.AllocateSkill(
                                                    treeId,
                                                    categoryIndex,
                                                    skillIndex,
                                                    data,
                                                    setData,
                                                    availableSkillPoints
                                                )
                                            }
                                            disabled={
                                                allocatedPoints[`${treeId}-${categoryIndex}-${skillIndex}`] ||
                                                availableSkillPoints < skill.cost
                                            }
                                            className="skill-button add-skill-button"
                                        >
                                            Add Skill ({skill.cost} Points)
                                        </button>
                                        <button
                                            onClick={() =>
                                                TreeHelpers.DeallocateSkill(
                                                    treeId,
                                                    categoryIndex,
                                                    skillIndex,
                                                    data,
                                                    setData
                                                )
                                            }
                                            disabled={!allocatedPoints[`${treeId}-${categoryIndex}-${skillIndex}`]}
                                            className="skill-button remove-skill-button"
                                        >
                                            Remove Skill
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
