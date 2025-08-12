import { useState } from 'react';
import '../css/Toggle.css'; // Import the CSS styling

const Toggle = ({ checked = false, onChange }) => {
  const [isToggled, setIsToggled] = useState(checked);

  const handleToggle = () => {
    setIsToggled(!isToggled);
    onChange && onChange(!isToggled);
  };

  return (
    <div className={`toggle-slider ${isToggled ? 'on' : 'off'}`} onClick={handleToggle}>
      <div className="slider-circle"></div>
    </div>
  );
};

export default Toggle;