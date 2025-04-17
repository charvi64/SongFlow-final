import { useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';

const Slider = ({ value = 0, onChange, className = '' }) => {
  const { isDarkMode } = useTheme();

  const handleChange = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    onChange(Math.max(0, Math.min(100, percent)));
  }, [onChange]);

  return (
    <div 
      className={`h-1 rounded-full cursor-pointer relative ${
        isDarkMode 
          ? 'bg-gray-700' 
          : 'bg-blue-100'
      } ${className}`}
      onClick={handleChange}
    >
      <div 
        className={`h-full rounded-full ${
          isDarkMode 
            ? 'bg-white' 
            : 'bg-blue-500'
        }`}
        style={{ width: `${value}%` }}
      />
      <div 
        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${
          isDarkMode 
            ? 'bg-white' 
            : 'bg-blue-500'
        }`}
        style={{ left: `${value}%`, transform: `translate(-50%, -50%)` }}
      />
    </div>
  );
};

export default Slider; 