import React from "react";
import "./Grupales.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import tiktokimagen from "../GrupalesPage/tiktok.png";
import { Helmet as HelmetReact } from "react-helmet-async";

const Grupales: React.FC = () => {
  return (
    <>
      <HelmetReact>
        {/* Meta etiquetas dinámicas */}
        <title>Tours</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Toursland" />
        <meta
          name="copyright"
          content="©2025 Toursland. Todos los derechos reservados."
        />
        <meta name="description" content="" />
        <meta name="keywords" content="" />
        <link rel="canonical" href="" />
        <meta name="robots" content="" />

        {/* Meta etiquetas dinámicas para redes sociales */}
        <meta property="og:title" content="" />
        <meta property="og:description" content="" />
        <meta property="og:image" content="" />
        <meta property="og:url" content="" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Toursland" />
        <meta property="og:image:alt" content="Descripción de la imagen" />
      </HelmetReact>
      <Header />
      <div className="Grupalesheader">
        <h1>Viajes Grupales </h1>
      </div>

      <div className="travel-card">
        <div className="image-container">
          <img src={tiktokimagen} alt="" className="travel-image" />
          <div className={`highlight etiqueta`}>{"¡DESCUBRE!"}</div>
        </div>
        <div className="card-details">
          <h2 className="title">SOLTEROS POR NUEVA YORK</h2>
          <p className="duration">⏱️ 5 dias</p>
          <p className="location">✈️ mexico</p>
          <p className="location">🚢 Nueva York</p>
        </div>
        <div className="price-container">
          <p className="price-label">Desde</p>
          <p className="price">$34,990</p>
          <button className="details-button">VER DETALLES</button>
        </div>
      </div>

      <div className="travel-card">
        <div className="image-container">
          <img src={tiktokimagen} alt="" className="travel-image" />
          <div className={`highlight etiqueta`}>{"¡DESCUBRE!"}</div>
        </div>
        <div className="card-details">
          <h2 className="title">SOLTEROS POR NUEVA YORK</h2>
          <p className="duration">⏱️ 5 dias</p>
          <p className="location">✈️ mexico</p>
          <p className="location">🚢 Nueva York</p>
        </div>
        <div className="price-container">
          <p className="price-label">Desde</p>
          <p className="price">$34,990</p>
          <button className="details-button">VER DETALLES</button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Grupales;
