import React from "react";
import "./Tours.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet as HelmetReact } from "react-helmet-async";
import CardsForLocationsWithPagination from "../CardsForLocationsWithPagination/CardsForLocationsWithPagination";
import { useParams, useLocation } from "react-router-dom";

const ToursPage: React.FC = () => {
  const { country, state } = useParams();
  const location = useLocation();

  // Detectar si la ruta corresponde a países, estados o ciudades
  const isLocationRoute = /^\/TOURS(\/Location)?/.test(location.pathname);
  console.log("Is location route:", isLocationRoute);

  return (
    <>
      <HelmetReact>
        <title>Tours</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Toursland" />
      </HelmetReact>

      <Header />
      <div className="tourspageheader">
        <h1>Tours</h1>
      </div>

      {isLocationRoute || country || state ? (
        <CardsForLocationsWithPagination />
      ) : (
        <div className="tours-content">
          <h2>Bienvenido a nuestros Tours</h2>
          <p>Selecciona una ubicación para comenzar.</p>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ToursPage;
