import { useEffect } from "react";
import "./Chatbot.css";

const KommoButton: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.id = "crm_plugin_script";
    script.src = "https://gso.kommo.com/js/button.js";
    (window as any).crm_plugin = {
      id: "1032869",
      hash: "95cffc1ceecce296f8e28b9e322e9708b3f22a40930ec600096fa8648343a7c7",
      locale: "es",
      setMeta: function (p: any) {
        this.params = (this.params || []).concat([p]);
      },
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};

export default KommoButton;
