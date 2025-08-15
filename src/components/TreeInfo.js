import skillData from '../skills.json';
import TreeHelpers from './TreeHelpers';
import PunchCardExport from './PunchCardExport';
import "../css/TreeInfo.css";

export default function TreeInfo({ availableSkillPoints, startingTree, data, setData, unlockedTiers }) {
    return (
        <div className="tree-info">
            <div className="skill-points">
                Available Skill Points: {availableSkillPoints}
            </div>
            <div className="starting-tree">
                <label htmlFor="startingTreeSelect">Select Starting Tree:</label>
                <select
                    id="startingTreeSelect"
                    value={startingTree}
                    onChange={(e) => TreeHelpers.SetDataField('startingTree', e.target.value, setData)}
                >
                    {Object.keys(skillData)
                        .filter(treeId => skillData[treeId].type === "basic")
                        .map(treeId => (
                            <option key={treeId} value={treeId}>
                                {treeId}
                            </option>
                        ))}
                </select>
            </div>
            <div className="button-wrapper">
                <div className="action-button">
                    <button onClick={() => TreeHelpers.ResetData(startingTree, data, setData)}>
                        Reset
                    </button>
                </div>
                <div className="action-button">
                    <PunchCardExport
                        skillData={skillData}
                        unlockedTiers={unlockedTiers}
                        skillPoints={availableSkillPoints}
                    />
                </div>
            </div>
        </div >
    );
};