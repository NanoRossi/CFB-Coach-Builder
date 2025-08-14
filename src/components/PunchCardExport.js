import React from "react";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import skillData from "../skills.json";
import "../css/PunchCardExport.css";

// Group trees by type
const treeGroups = {
    basic: [],
    advanced: [],
    crossover: [],
    elite: []
};

Object.keys(skillData).forEach(treeId => {
    const tree = skillData[treeId];
    treeGroups[tree.type].push({ id: treeId, data: tree });
});

export default function PunchCardExport({ unlockedTiers, skillPoints }) {
    const exportAsImage = async () => {
        // Create off-DOM container
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.top = "-9999px";
        container.style.left = "-9999px";
        document.body.appendChild(container);

        // Render the punch card into the container
        const root = ReactDOM.createRoot(container);
        root.render(
            <div className="punch-card-container">
                <div className="punch-card">
                    <div className="punch-card-header">
                        <h2>Coach Skill Tree Punch Card</h2>
                        <span className="available-points">Remaining Skill Points: {skillPoints}</span>
                    </div>
                    <div className="tree-columns">
                        {Object.entries(treeGroups).map(([type, trees]) => (
                            <div key={type} className="tree-column">
                                <h3 className="column-title">{type.charAt(0).toUpperCase() + type.slice(1)} Trees</h3>
                                {trees.map(({ id, data }) => {
                                    const treeData = unlockedTiers[id];

                                    const totalTreeCost = data.categories.reduce((sum, category) => {
                                        return sum + category.skills.reduce((skillSum, skill) => skillSum + skill.cost, 0);
                                    }, 0);

                                    if (treeData === undefined || totalTreeCost === 0) {
                                        return null;
                                    }

                                    return (
                                        <div
                                            key={id}
                                            className="punch-card-row"
                                            style={{
                                                borderColor: data.colour,
                                                borderWidth: "3px",
                                                borderStyle: "solid",
                                                borderRadius: "10px"
                                            }}
                                        >
                                            <span className="tree-name">{id}:</span>
                                            <div className="tree-data">
                                                {data.categories.map((category, idx) => {
                                                    if (treeData[idx] === undefined) return null;
                                                    return (
                                                        <p key={idx} className="category-data">
                                                            {category.name}: {treeData[idx] - 1}
                                                        </p>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );

        // Wait a tick to ensure DOM is rendered
        await new Promise(resolve => setTimeout(resolve, 50));

        // Generate canvas
        const canvas = await html2canvas(container, { backgroundColor: "#fff", scale: 2 });

        // Clean up
        root.unmount();
        document.body.removeChild(container);

        // Download PNG
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "coach_skill_punch_card.png";
        link.click();
    };

    return (
        <button onClick={exportAsImage} className="export-button">
            Download as PNG
        </button>
    );
}