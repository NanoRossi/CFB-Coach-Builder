import { useState } from "react";
import CoachSkillTree from "./CoachSkillTree";
import '../css/TreeTabWrapper.css';

function TreeTabWrapper({ includeCoordinators, isPreorderEnabled }) {

    // Base data structure
    const baseCoachData = {
        // initial points, these will be modified as the user interacts with the tree
        basePoints: 1000,
        preorderBonusSkillPoints: 100,
        // total points used across all trees
        deductions: [],
        // points allocated overall - TODO, we have deducations, we can reduce to one var??
        allocatedPoints: {},
        // unlocked tiers and trees
        unlockedTiers: {},
        unlockedTrees: [],
        // starting tree - we'll default to "Motivator", but maybe we should read from the data for this
        startingTree: "Motivator",
        // tree's which have been opened
        expandedTrees: {},
        // points allocated to each individual tree
        pointsPerTree: {},
        // costs for each tree type
        baseTreeCosts: [0, 20, 30],
        baseIndex: 1,
        advancedTreeCosts: [20, 25, 30],
        advancedIndex: 0,
        crossoverTreeCosts: [30, 35, 40],
        crossoverIndex: 0,
    }

    const [activeTab, setActiveTab] = useState(0);
    const [headCoachData, setHeadCoachData] = useState({ ...baseCoachData });
    const [offenseData, setOffenseData] = useState({ ...baseCoachData });
    const [defenseData, setDefenseData] = useState({ ...baseCoachData });

    const tabs = [
        { title: "Head Coach", state: headCoachData, setState: setHeadCoachData },
        { title: "Offensive Coordinator", state: offenseData, setState: setOffenseData },
        { title: "Defensive Coordinator", state: defenseData, setState: setDefenseData },
    ];

    if (!includeCoordinators) {
        // If coordinators are not included, only show the Head Coach tab
        return (
            <CoachSkillTree
                title={tabs[0].title}
                data={tabs[0].state}
                setData={tabs[0].setState}
                isPreorderEnabled={isPreorderEnabled}
            />
        );
    }

    // If coordinators are included, show all tabs
    // Passing down the appropriate props to CoachSkillTree
    // And the head coach tab will get isPreorderEnabled
    return (
        <div>
            <div className="tabs-header">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={activeTab === index ? "active" : ""}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>

            <div className="tabs-content">
                <CoachSkillTree
                    title={tabs[activeTab].title}
                    data={tabs[activeTab].state}
                    setData={tabs[activeTab].setState}
                    {...(tabs[activeTab].title === "Head Coach" ? { isPreorderEnabled } : false)}
                />
            </div>
        </div>
    );
}

export default TreeTabWrapper;
