import { useState, useEffect } from "react";
import "./CoachSkillTree.css";
import PreorderToggle from "./PreorderToggle";
import skillData from './skills.json';
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import PunchCardExport from "./PunchCardExport";
import * as React from 'react';

// Register chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CoachSkillTree() {

  const initialBase = 1000;
  const preorderBonusSkillPoints = 100;
  const [baseValue, setBaseValue] = useState(initialBase);
  const [deductions, setDeductions] = useState([]); 
  const [isPreorderEnabled, setIsPreorderEnabled] = useState(false);

  // Calculate total deductions
  const totalDeductions = deductions.reduce((acc, val) => acc + val, 0);

  // Final available skill points
  const availableSkillPoints = baseValue + totalDeductions + (isPreorderEnabled ? preorderBonusSkillPoints : 0);

  const [allocatedPoints, setAllocatedPoints] = useState({});
  const [unlockedTiers, setUnlockedTiers] = useState({});
  const [unlockedTrees, setUnlockedTrees] = useState([]);
  const [startingTree, setStartingTree] = useState("Motivator"); // Default starting tree
  const [expandedTree, setExandedTrees] = useState({});
  const [pointsPerTree, setPointsPerTree] = useState({}); // Tracks total points spent in each tree

  const [baseTreeCosts, setBaseTreeCosts] = useState([0, 20, 30]);
  const [baseIndex, setBaseIndex] = useState(1);

  const [advancedTreeCosts, setAdvancedTreeCosts] = useState([20, 25, 30]);
  const [advancedIndex, setAdvancedIndex] = useState(0);

  const [crossoverTreeCosts, setCrossoverTreeCosts] = useState([30, 35, 40]);
  const [crossoverIndex, setCrossoverIndex] = useState(0);

  const handleToggle = (enabled) => {
    setIsPreorderEnabled(enabled);
  };

  useEffect(() => {
    if (startingTree) {
      setUnlockedTrees([startingTree]);
      /*setUnlockedTiers((prev) => ({
        ...prev,
        [startingTree]: { [0]: 1 },
      }));*/
    }
  }, [startingTree]);

  const allocateSkill = (treeId, categoryIndex, skillIndex) => {
    const category = skillData[treeId].categories[categoryIndex];
    const skill = category.skills[skillIndex];
    const currentTier = skill.tier;

    // Find all previous tiers that need to be unlocked
    let totalCost = 0;
    let newAllocatedPoints = { ...allocatedPoints };

    for (let i = 0; i <= skillIndex; i++) {
      const prevSkill = category.skills[i];
      const prevKey = `${treeId}-${categoryIndex}-${i}`;

      if (!allocatedPoints[prevKey]) {
        totalCost += prevSkill.cost;
        newAllocatedPoints[prevKey] = prevSkill.cost;
      }
    }

    // Check if the user has enough points
    if (availableSkillPoints < totalCost) {
      alert("You don't have enough points to allocate this skill.");
      return;
    }

    // Update state
    setAllocatedPoints(newAllocatedPoints);
    setDeductions(prev => [...prev, -Math.abs(totalCost)]);

    setPointsPerTree((prev) => ({
      ...prev,
      [treeId]: (prev[treeId] || 0) + totalCost,
    }));

    // Unlock all tiers leading up to the selected one
    setUnlockedTiers((prev) => ({
      ...prev,
      [treeId]: {
        ...prev[treeId],
        [categoryIndex]: currentTier + 1, // Ensure next tier is unlocked
      },
    }));
  };

  const deallocateSkill = (treeId, categoryIndex, skillIndex) => {
    const skill = skillData[treeId].categories[categoryIndex].skills[skillIndex];
    const key = `${treeId}-${categoryIndex}-${skillIndex}`;

    if (!allocatedPoints[key]) return;

    let totalPointsRemoved = skill.cost;
    let updatedAllocatedPoints = { ...allocatedPoints };
    delete updatedAllocatedPoints[key];

    const currentTier = skill.tier;

    // Recursively remove higher-tier skills in the same category
    for (let nextSkillIndex = skillIndex + 1; nextSkillIndex < skillData[treeId].categories[categoryIndex].skills.length; nextSkillIndex++) {
      const nextSkill = skillData[treeId].categories[categoryIndex].skills[nextSkillIndex];
      const nextKey = `${treeId}-${categoryIndex}-${nextSkillIndex}`;

      if (nextSkill.tier > currentTier && allocatedPoints[nextKey]) {
        totalPointsRemoved += nextSkill.cost;
        delete updatedAllocatedPoints[nextKey];
      } else {
        break;
      }
    }

    setAllocatedPoints(updatedAllocatedPoints);
    setDeductions(prev => [...prev, Math.abs(totalPointsRemoved)]);
    setPointsPerTree((prev) => ({
      ...prev,
      [treeId]: Math.max((prev[treeId] || 0) - totalPointsRemoved, 0),
    }));


    if (skillIndex === 0) 
    { 
      // If the first skill in the category is deallocated, we need to reset the tier for that category
      setUnlockedTiers((prev) => {
        const updatedTiers = { ...prev };
        delete updatedTiers[treeId][categoryIndex];
      
        if (Object.keys(updatedTiers[treeId]).length === 0) {
          delete updatedTiers[treeId]; // Remove the tree entry if no categories are left
        }

        return updatedTiers;
      });

    }
    else
    { 
      setUnlockedTiers((prev) => {
        const updatedTiers = { ...prev };
        if (updatedTiers[treeId] && updatedTiers[treeId][categoryIndex] > currentTier) {
          updatedTiers[treeId][categoryIndex] = currentTier;
        }
        return updatedTiers;
      });
    }
  };

  const getTreeCost = (tree) => {
      // standard trees have dynamic cost based upon how many of that type of tree you have unlocked
      let unlockCost = tree.type === "basic" ? baseTreeCosts[baseIndex] :
      tree.type === "advanced" ? advancedTreeCosts[advancedIndex] :
      tree.type === "crossover" ? crossoverTreeCosts[crossoverIndex] : 0;
  
      // elite trees have a fixed cost
      if (tree.type === "elite")
      {
        unlockCost = tree.treeUnlockCost;
      }

      return unlockCost;
  }

  const unlockTree = (treeId) => {
    const tree = skillData[treeId];

    if (tree.type !== "basic") {
      // Check all requirements for unlocking an advanced tree
      const meetsRequirements = tree.unlockRequirements.every((req) => {
        // If `req` is an array (multiple requirements for a tree)
        if (Array.isArray(req)) {
          return req.every(([requiredTree, requiredPoints]) => {
            if (requiredTree === "Any") {
              // Check if any tree has sufficient points
              return Math.max(...Object.values(pointsPerTree)) >= parseInt(requiredPoints, 10);
            } else {
              // Check if the specified tree has sufficient points
              return (pointsPerTree[requiredTree] || 0) >= parseInt(requiredPoints, 10);
            }
          });
        } else {
          // If `req` is an object with just one key-value pair
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

    let unlockCost = getTreeCost(tree);

    if (availableSkillPoints >= unlockCost && !unlockedTrees.includes(treeId)) {
      setUnlockedTrees((prev) => [...prev, treeId]);
      setDeductions(prev => [...prev, -Math.abs(unlockCost)]);

      if (tree.type === "basic") {
        setBaseIndex((prev) => (prev + 1));
      }
      else if (tree.type === "advanced") {
        setAdvancedIndex((prev) => (prev + 1));
      }
      else if (tree.type === "crossover") {
        setCrossoverIndex((prev) => (prev + 1));
      }
    }
  };

  const toggleCollapse = (treeId) => {
    setExandedTrees((prev) => {
      const newState = { ...prev, [treeId]: !prev[treeId] };
      const treeElement = document.getElementById(`tree-${treeId}`);

      if (treeElement) {
        // Add or remove the 'collapsed' class based on the state
        treeElement.classList.toggle('expanded', setExandedTrees[treeId]);
      }

      return newState;
    });
  };

  const getChartData = () => {

    var labels = [];
    var data = [];
    var backgroundColours = [];
    var pointBackgroundColors = [];
    var fullData = {
      labels: labels, // Categories or Trees
      datasets: [
        {
          data: data, // Points invested in each tree/category
          backgroundColor: backgroundColours, // Different background color for each data point
          borderColor: [
            'rgb(0, 0, 0)',
            'rgb(0, 0, 0)',
            'rgb(0, 0, 0)',
            'rgb(0, 0, 0)',
            'rgb(0, 0, 0)',
            'rgb(0, 0, 0)'
          ], // Different border color for each data point
          pointRadius: 6, // Adjust point size (radius of the points)
          borderWidth: 2, // Border width of the line
          pointBackgroundColor: pointBackgroundColors, // Keep point color consistent
        }
      ]
    };
    Object.keys(skillData).forEach(function (key, idx, value) {

      var tree = skillData[key];
      var treeType = skillData[key].type;
      // Elites dont go on the tree
      if (treeType === "elite") { return; }

      // basic and crossover we just add to the array
      else if (treeType === "basic" || treeType === "crossover") {
        labels.push(key)
        data.push((pointsPerTree[key] || 0))
        backgroundColours.push(hexToRgb(tree.colour))
        pointBackgroundColors.push(hexToRgb(tree.colour))
      }
      else if (treeType === "advanced") {
        var baseTree = Object.keys(tree.unlockRequirements[0])[0]

        var index = labels.indexOf(baseTree);
        var newData = data[index] += (pointsPerTree[key] || 0);
        data[index] = newData;
      }

    })

    return fullData;
  };

  function hexToRgb(hex) {
    // Remove the '#' if it's present
    hex = hex.replace(/^#/, '');

    // Parse the hex color code into RGB components
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    return `rgb(${r}, ${g}, ${b})`;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to take up full space
    scales: {
      r: {
        min: 0,   // Set the minimum value
        max: 250, // Set the maximum value
        ticks: {
          display: false // Hides the ticks
        },
        grid: {
          display: true, // Optional: Shows the grid lines
        },
        angleLines: {
          display: true, // Optional: Shows the angle lines
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Skill Points Distribution',
      },
      legend: {
        position: 'right',
        labels: {
          // Ensure text color remains fixed
          generateLabels: (chart) => {
            return chart.data.labels.map((label, index) => ({
              text: label, // Use the label names from the data
              fillStyle: chart.data.datasets[0].backgroundColor[index], // Use the backgroundColor for legend item
              strokeStyle: chart.data.datasets[0].borderColor[index], // Use the borderColor for legend item
              lineWidth: 1,
              // Set the text color to always be white, or any color you want
              fontColor: 'black',
            }));
          },
          // Prevent legend text color change on hover
          onHover: (event, legendItem) => {
            legendItem.textColor = 'black'; // Set to the fixed color on hover as well
          },
        },
      },
    },
  };

  return (
    <div className="coach-skill-tree">
      <div className="header">
        <img src={"./26header.jpeg"} />
      </div>

      <div className="title">
        <h1>Coach Planner</h1>
      </div>

      <div className="skill-points">Available Skill Points: {availableSkillPoints}</div>
      <div className="skill-points">Toggle Preorder Bonus: <PreorderToggle checked={isPreorderEnabled} onChange={handleToggle} /></div>
 
      <div className="starting-tree">
        <label>Select Starting Tree:</label>
        <select value={startingTree} onChange={(e) => setStartingTree(e.target.value)}>
          {Object.keys(skillData)
            .filter(treeId => skillData[treeId].type === "basic") // Only include basic trees
            .map(treeId => (
              <option key={treeId} value={treeId}>
                {treeId} Tree
              </option>
            ))}
        </select>
      </div>

      <div className="chart-container">
        <Radar
          data={getChartData()}
          options={chartOptions}
        />
      </div>

      <div className="tree-wrapper">
        {Object.keys(skillData).map((treeId) => {
          const tree = skillData[treeId];
          const isBasic = tree.type === "basic";

          return (
            <div key={treeId} className={`tree-container ${expandedTree[treeId] ? 'expanded' : 'collapsed'}`} style={{ backgroundColor: tree.colour }}>
              <h2>
                {treeId} Tree
                {unlockedTrees.includes(treeId) && (
                  <button onClick={() => toggleCollapse(treeId)}>
                    {expandedTree[treeId] ? "Collapse" : "Expand"}
                  </button>
                )}
              </h2>

              <p>Points Invested: {pointsPerTree[treeId] || 0}</p>

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

              <button
                onClick={() => unlockTree(treeId)}
                disabled={unlockedTrees.includes(treeId)}
              >
                Unlock Tree (Cost: {startingTree === treeId ? 0 : getTreeCost(tree)} Points)
              </button>

              {unlockedTrees.includes(treeId) && expandedTree[treeId] && (
                <div className="category-grid">
                  {tree.categories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="category">
                      <h3>{category.name}</h3>
                      {category.skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="skill">
                          <p><strong>Tier {skill.tier}: </strong>{skill.description}</p>
                          <button
                            onClick={() => allocateSkill(treeId, categoryIndex, skillIndex)}
                            disabled={
                              allocatedPoints[`${treeId}-${categoryIndex}-${skillIndex}`] ||
                              availableSkillPoints < skill.cost
                            }
                            className="add-skill-button"
                          >
                            Add Skill ({skill.cost} Points)
                          </button>
                          <button
                            onClick={() => deallocateSkill(treeId, categoryIndex, skillIndex)}
                            disabled={!allocatedPoints[`${treeId}-${categoryIndex}-${skillIndex}`]}
                            className="remove-skill-button"
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

      <PunchCardExport unlockedTiers={unlockedTiers} skillPoints={availableSkillPoints} />
    </div>
  );
}