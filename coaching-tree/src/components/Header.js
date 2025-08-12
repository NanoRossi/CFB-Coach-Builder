import Toggle from "./Toggle";
import { useState } from "react";

import "../css/Header.css";

export default function Header({ options }) {

    const {
        isPreorderEnabled,
        setIsPreorderEnabled,
        includeCoordinators,
        setIncludeCoordinators,
        darkMode,
        setDarkMode,
        savedDarkMode,
        setSavedDarkMode
    } = options;

    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    return (
        <div className="header">
            <div className="title">
                <h1>EA Sports College Football 26</h1>
                <h2>Coach Builder</h2>
            </div>

            <button
                className="options-toggle-button"
                onClick={() => setIsOptionsOpen((open) => !open)}
                aria-expanded={isOptionsOpen}
                aria-controls="options-panel"
            >
                {isOptionsOpen ? "Hide Options ▲" : "Show Options ▼"}
            </button>

            <div id="options-panel" className={`options ${isOptionsOpen ? "open" : "closed"}`} aria-hidden={!isOptionsOpen} >
                <div className="option">Toggle Preorder Bonus: <Toggle checked={isPreorderEnabled} onChange={() => setIsPreorderEnabled(!isPreorderEnabled)} /></div>
                <div className="option">Include Coordinators: <Toggle checked={includeCoordinators} onChange={() => setIncludeCoordinators(!includeCoordinators)} /></div>
                <div className="option">Dark Mode: <Toggle checked={savedDarkMode || darkMode} onChange={() => [setDarkMode(!darkMode), setSavedDarkMode(!darkMode)]} /></div>
            </div>
        </div>
    );
}