import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cuando cambie la ruta, forzamos el scroll al principio
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
