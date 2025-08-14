// App.js
import { useState, useEffect } from 'react';
import Header from './Header';
import TreeTabsWrapper from './TreeTabWrapper';
import '../css/App.css';

// Custom hook to save dark mode state to localStorage
// TODO, probably move this to a separate file
function useLocalStorageState(key) {
    const [state, setState] = useState(() => {
        const storedValue = localStorage.getItem(key);
        if (storedValue !== null) {
            return (storedValue === 'true');
        }
        return false;;
    });

    // Update localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem(key, state);
    }, [key, state]);

    return [state, setState];
}

function App() {
    const initialBase = 1000;
    const preorderBonusSkillPoints = 100;
    const [baseValue] = useState(initialBase);
    const [isPreorderEnabled, setIsPreorderEnabled] = useState(false);
    const [includeCoordinators, setIncludeCoordinators] = useState(false);
    const [deductions] = useState([]);
    const [darkMode, setDarkMode] = useState(false);
    const [savedDarkMode, setSavedDarkMode] = useLocalStorageState('darkMode', false);

    // Calculate total deductions
    const totalDeductions = deductions.reduce((acc, val) => acc + val, 0);

    // Final available skill points
    const availableSkillPoints = baseValue + totalDeductions + (isPreorderEnabled ? preorderBonusSkillPoints : 0);

    const headerOptions = {
        availableSkillPoints,
        isPreorderEnabled,
        setIsPreorderEnabled,
        includeCoordinators,
        setIncludeCoordinators,
        darkMode,
        setDarkMode,
        savedDarkMode,
        setSavedDarkMode
    };

    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
        document.body.classList.toggle('light-mode', !darkMode);

        const bgColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-tree-bg').trim();

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', bgColor);
        } else {
            const meta = document.createElement('meta');
            meta.name = "theme-color";
            meta.content = bgColor;
            document.head.appendChild(meta);
        }
    }, [darkMode]);

    useEffect(() => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        // if there is a saved dark mode preference, use it
        // otherwise, use the system preference - this will only happen on the first load
        if (savedDarkMode !== null) {
            setDarkMode(savedDarkMode);
        }
        else {
            setDarkMode(prefersDark);
        }

    }, [savedDarkMode]);

    return (
        <div className={`app-container ${darkMode ? 'dark' : ''}`}>
            <Header options={headerOptions} />
            <TreeTabsWrapper includeCoordinators={includeCoordinators} isPreorderEnabled={isPreorderEnabled} />
        </div>
    );
}

export default App;