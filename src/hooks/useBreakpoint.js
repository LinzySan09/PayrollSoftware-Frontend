import { useState, useEffect } from "react";
const get = () => { const w = window.innerWidth; return w<=480?"xs":w<=768?"sm":w<=1024?"md":"lg"; };
export function useBreakpoint() {
  const [v, setV] = useState(get);
  useEffect(() => { const h = () => setV(get()); window.addEventListener("resize",h); return () => window.removeEventListener("resize",h); }, []);
  return { bp:v, isMobile:v==="xs"||v==="sm", isTablet:v==="md", isDesktop:v==="lg" };
}
