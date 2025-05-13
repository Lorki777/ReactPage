/**
 * @file Paquetes.tsx
 * @brief Component for displaying travel packages.
 * @details This component fetches and displays travel packages for different months.
 * @author
 * @date
 */

import React from "react";
import "./Paquetes.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Enero from "./ENERO.webp";
import { Helmet as HelmetReact } from "react-helmet-async";
import { useFetchMonths } from "../Hook";

/**
 * @brief Paquetes component.
 * @returns JSX.Element
 */
const Paquetes: React.FC = () => {
  const { months, totalMonths, error, handleCardClick } = useFetchMonths();
  return (
    <>
      <HelmetReact>
        {/* Meta tags for SEO */}
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
            key={month.month_name}
            className="PaquetesCard"
            onClick={() => handleCardClick(month.month_name)}
            style={{ backgroundImage: `url(${Enero})` }}
          >
            <div className="PaquetesCard-content">
              <h3>
                {month.month_name.charAt(0).toUpperCase() +
                  month.month_name.slice(1)}
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
