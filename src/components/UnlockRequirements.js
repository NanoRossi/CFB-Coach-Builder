
import "../css/UnlockRequirements.css";

export default function UnlockRequirements({ tree, pointsPerTree }) {
    return (
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
    )
}