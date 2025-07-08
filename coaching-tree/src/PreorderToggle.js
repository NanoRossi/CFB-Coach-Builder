import React, { useState } from 'react';
import './PreorderToggle.css'; // Import the CSS styling

const PreorderToggle = ({ checked = false, onChange }) => {
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

export default PreorderToggle;