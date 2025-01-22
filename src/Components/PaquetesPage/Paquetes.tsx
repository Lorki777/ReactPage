import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Paquetes.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Enero from "./ENERO.webp";

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
      const response = await fetch("http://localhost:8080/api/meses/");
      if (!response.ok) throw new Error("Error al obtener los datos");

      const data: Month[] = await response.json();
      setMonths(data);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al obtener los datos del servidor.");
    }
  };

  useEffect(() => {
    fetchMonths();
  }, []);

  const navigate = useNavigate();

  const handleCardClick = (monthName: string) => {
    const formattedMonthName = monthName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/tours/${encodeURIComponent(formattedMonthName)}`);
  };

  return (
    <>
      <Header />
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
