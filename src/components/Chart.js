import { Radar } from "react-chartjs-2";
import skillData from '../skills.json';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function Chart() {

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
        <div className="chart-container">
            <Radar
                data={getChartData()}
                options={chartOptions}
            />
        </div>
    )
}