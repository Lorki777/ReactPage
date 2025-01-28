import React from "react";
import "./Grupales.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import tiktokimagen from "../GrupalesPage/tiktok.png";

const Grupales: React.FC = () => {
  return (
    <>
      <Header />
      <div className="Grupalesheader">
        <h1>Viajes Grupales </h1>
      </div>

      <div className="travel-card">
        <div className="image-container">
          <img src={tiktokimagen} alt="" className="travel-image" />
          <div className={`highlight`}>{"¡DESCUBRE!"}</div>
        </div>
        <div className="card-details">
          <h2 className="title">titulo</h2>
          <p className="duration">⏱️ 5 dias</p>
          <p className="location">✈️ mexico</p>
          <p className="location">🚢 monterrey</p>
        </div>
        <div className="price-container">
          <p className="price-label">Desde</p>
          <p className="price">$122</p>
          <button className="details-button">VER DETALLES</button>
        </div>
      </div>
      <p>esto es la pagina de grupales</p>
      <Footer />
    </>
  );
};

export default Grupales;
