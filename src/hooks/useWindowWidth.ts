import { useState, useEffect, useMemo } from 'react';
import breakpoints from "@/styles/_breakpoints.module.scss";

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  function convertRemToPixels(rem: string) {    
    // Get the computed font size of the <html> element
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    
    // Multiply the rem value by the root font size
    return parseInt(rem) * rootFontSize;
}

  const windowBreakPoints = useMemo(() => {
    const isXS = width < convertRemToPixels(breakpoints.bpSM);
    const isSM = width >= convertRemToPixels(breakpoints.bpSM) && width < convertRemToPixels(breakpoints.bpMD);
    const isMD = width >= convertRemToPixels(breakpoints.bpMD) && width < convertRemToPixels(breakpoints.bpLG);
    const isLG = width >= convertRemToPixels(breakpoints.bpLG) && width < convertRemToPixels(breakpoints.bpXL);
    const isXL = width >= convertRemToPixels(breakpoints.bpXL) && width < convertRemToPixels(breakpoints.bpXXL);
    const isXXL = width >= convertRemToPixels(breakpoints.bpXXL);

    const isMobile = isXS || isSM;

    return {
      isMobile,
      isXS,
      isSM,
      isMD,
      isLG,
      isXL,
      isXXL,
    }
  }, [width]);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { width, windowBreakPoints };
}
