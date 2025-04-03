import React from "react";
import "./Grupales.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import tiktokimagen from "../GrupalesPage/tiktok.png";
import { Helmet as HelmetReact } from "react-helmet-async";
import { useProductosGrupales } from "../Hook";

const Grupales: React.FC = () => {
  const { productos, error, handleCardClick } = useProductosGrupales();

  return (
    <>
      <HelmetReact>
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

      {error && <p style={{ color: "red" }}>{error}</p>}

      {productos.map((producto) => (
        <div
          key={producto.TourSlug}
          className="travel-card"
          onClick={() => handleCardClick(producto.TourSlug)}
        >
          <div className="image-container">
            <img
              src={tiktokimagen}
              alt={producto.TourName}
              className="travel-image"
            />
            <div className="highlight etiqueta">
              {producto.TourBadge || "¡DESCUBRE!"}
            </div>
          </div>
          <div className="card-details">
            <h2 className="title">{producto.TourName}</h2>
            <p className="duration">⏱️ {producto.TourDuration} días</p>
            <p className="location">✈️ de algun lugar </p>
            <p className="location">🚢 {producto.Llegada}</p>
          </div>
          <div className="price-container">
            <p className="price-label">Desde</p>
            <p className="price">{producto.TourPrice}</p>
            <button className="details-button">VER DETALLES</button>
          </div>
        </div>
      ))}

      <Footer />
    </>
  );
};

export default Grupales;
