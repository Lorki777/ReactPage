import React, { useEffect } from "react";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (options: { xfbml: boolean; version: string }) => void;
    };
  }
}

const FacebookPagePlugin: React.FC = () => {
  useEffect(() => {
    if (!document.getElementById("facebook-jssdk")) {
      window.fbAsyncInit = function () {
        if (window.FB) {
          window.FB.init({
            xfbml: true,
            version: "v17.0",
          });
        }
      };

      (function (d, s, id) {
        let js: HTMLScriptElement;
        const fjs = d.getElementsByTagName(s)[0];

        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src =
          "https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v17.0";

        if (fjs && fjs.parentNode) {
          fjs.parentNode.insertBefore(js, fjs);
        } else {
          d.body.appendChild(js); // Como alternativa, añadimos el script al body
        }
      })(document, "script", "facebook-jssdk");
    }
  }, []);

  return (
    <div>
      <h2>Reseñas de nuestra página en Facebook</h2>
      <div
        className="fb-page"
        data-href="https://www.facebook.com/TU_PAGINA"
        data-tabs="reviews"
        data-width="500"
        data-height="500"
        data-small-header="false"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="true"
      ></div>
    </div>
  );
};

export default FacebookPagePlugin;
