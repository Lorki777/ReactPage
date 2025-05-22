import { useEffect } from "react";
import "./BuscadorExterno.css";

const PriceResWidget = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://widgets.priceres.com.mx/travel-agencyweb/jsonpBooker/startWidget?container=ptw-container&UseConfigs=false&WhiteLabelId=toursland-agency";
    script.type = "text/javascript";
    script.async = true;
    document.getElementById("ptw-container")?.appendChild(script);

    // Limpieza opcional cuando se desmonte el componente
    return () => {
      document.getElementById("ptw-container")?.removeChild(script);
    };
  }, []);

  return <div id="ptw-container" className="ptw-horizontal-search"></div>;
};

export default PriceResWidget;
