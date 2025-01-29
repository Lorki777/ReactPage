import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Paquetes.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Enero from "./ENERO.webp";
import { Helmet as HelmetReact } from "react-helmet-async";

interface Month {
  Month: string;
  MonthSmallBanner: string;
  MonthLargeBanner: string;
}

const Paquetes: React.FC = () => {
  const [months, setMonths] = useState<Month[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener los datos del backend
  const fetchMonths = async () => {
    try {
      let token = localStorage.getItem("authToken");

      // Si no hay token, genera uno de invitado
      if (!token) {
        const guestTokenResponse = await fetch(
          "http://localhost:8080/api/guest-token"
        );
        if (!guestTokenResponse.ok)
          throw new Error("Error al generar token de invitado");

        const guestTokenData = await guestTokenResponse.json();
        token = guestTokenData.token;
        if (token) {
          localStorage.setItem("authToken", token);
        } else {
          throw new Error("Token de invitado no válido");
        }
      }

      // Realiza la solicitud usando el token
      const response = await fetch("http://localhost:8080/api/meses/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Si el token es inválido, intenta nuevamente generando uno de invitado
          localStorage.removeItem("authToken");
          return fetchMonths();
        }
        throw new Error("Error al obtener los datos");
      }

      const data: Month[] = await response.json();
      setMonths(data);
    } catch (err) {
      console.error("Error:", err);
      setError(
        (err as Error).message || "Error al obtener los datos del servidor."
      );
    }
  };

  useEffect(() => {
    fetchMonths();
  }, []);

  const navigate = useNavigate();

  const handleCardClick = (monthName: string) => {
    const formattedMonthName = monthName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/Paquetes/${encodeURIComponent(formattedMonthName)}`);
  };

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
              <h3>{month.Month}</h3>
              <p className="NumPaquetes-tours">20 Paquetes</p>
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
