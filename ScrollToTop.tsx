import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Universal ScrollToTop component for React Router SPA.
 * Automatically resets scroll position to top (0, 0) whenever route pathname changes,
 * preventing pages from opening scrolled to the bottom or middle.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
};

export default ScrollToTop;
