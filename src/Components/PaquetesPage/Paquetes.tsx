import React from "react";
import "./Paquetes.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Enero from "./ENERO.webp";
import { Helmet as HelmetReact } from "react-helmet-async";
import { useFetchMonths } from "../Hook";

const Paquetes: React.FC = () => {
  const { months, totalMonths, error, handleCardClick } = useFetchMonths();
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
          content="© Toursland. Todos los derechos reservados."
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

      <div className="paquetesheader">
        <h1>Descubre la belleza del mundo </h1>
        <p>Conóce nuestra agenda y encuentra el viaje de tus sueños</p>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="PaquetesCard-container">
        {months.map((month) => (
          <div
            key={month.Month}
            className="PaquetesCard"
            onClick={() => handleCardClick(month.Month)}
            style={{ backgroundImage: `url(${Enero})` }}
          >
            <div className="PaquetesCard-content">
              <h3>
                {month.Month.charAt(0).toUpperCase() + month.Month.slice(1)}
              </h3>
              <p className="NumPaquetes-tours">{totalMonths} Paquetes</p>
              <p className="PaquetesCard-tours">Ver todos los tours</p>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </>
  );
};

export default Paquetes;
