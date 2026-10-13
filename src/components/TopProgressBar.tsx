import { useIsFetching } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

const TopProgressBar: React.FC = () => {
  const isFetching = useIsFetching();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevFetching = useRef(0);

  useEffect(() => {
    if (isFetching > 0) {
      setVisible(true);
      requestAnimationFrame(() => setWidth(80));
    } else if (prevFetching.current > 0) {
      setWidth(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 300);
      return () => clearTimeout(timer);
    }
    prevFetching.current = isFetching;
  }, [isFetching]);

  if (!visible && width === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 h-[3px] z-[9999] transition-all duration-300 ease-out"
      style={{
        width: `${width}%`,
        background: 'linear-gradient(90deg, #a21caf, #c026d3, #e879f9)',
        opacity: visible ? 1 : 0,
        transition: 'width 0.3s ease-out, opacity 0.2s ease-out',
      }}
    />
  );
};

export default TopProgressBar;
