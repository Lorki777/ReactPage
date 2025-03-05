import React, { useState, useEffect } from "react";
import "./Tours.css";
import "./CardsForLocationsWithPagination.css";
import Enero from "./ENERO.webp";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet as HelmetReact } from "react-helmet-async";
import { useNavigate, useLocation } from "react-router-dom";
import { useFetchLocations } from "../Hook";

const ToursPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener nivel desde la URL al iniciar
  const getLevelFromPath = () => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "TOURS" && pathParts[1] === "Location") {
      if (pathParts.length === 2) return "countries";
      if (pathParts.length === 3) return "states";
      if (pathParts.length === 4) return "cities";
    }
    return "countries";
  };

  const [level, setLevel] = useState<"countries" | "states" | "cities">(
    getLevelFromPath()
  );
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [endpoint, setEndpoint] = useState<string>("");
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);

  // Sincronizar estado con la URL al cambiar de página
  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    let newLevel: "countries" | "states" | "cities" = "countries";

    if (pathParts[0] === "TOURS" && pathParts[1] === "Location") {
      if (pathParts.length === 2) {
        newLevel = "countries";
        setSelectedCountry(null);
        setSelectedState(null);
        setEndpoint("productos/locations/countries");
      } else if (pathParts.length === 3) {
        const country = decodeURIComponent(pathParts[2]);
        newLevel = "states";
        setSelectedCountry(country);
        setSelectedState(null);
        setEndpoint(`productos/locations/states/${country}`);
      } else if (pathParts.length === 4) {
        const country = decodeURIComponent(pathParts[2]);
        const state = decodeURIComponent(pathParts[3]);
        newLevel = "cities";
        setSelectedCountry(country);
        setSelectedState(state);
        setEndpoint(`productos/locations/cities/${state}`);
      }
    }

    setLevel(newLevel);
    setShouldFetch(true);
    setIsLoading(true);
  }, [location.pathname]);

  // Hook para obtener ubicaciones
  const { locations, error } = useFetchLocations(
    level,
    selectedCountry ?? undefined,
    selectedState ?? undefined
  );

  useEffect(() => {
    if (shouldFetch) {
      setIsLoading(true);
      if (locations.length > 0 || error) {
        setIsLoading(false);
        setShouldFetch(false);
      }
    }
  }, [locations, error, endpoint, shouldFetch]);

  // Manejo de clic en las tarjetas
  const handleCardClick = (name: string) => {
    if (level === "countries") {
      navigate(`/TOURS/Location/${encodeURIComponent(name)}`);
    } else if (level === "states") {
      navigate(
        `/TOURS/Location/${encodeURIComponent(
          selectedCountry!
        )}/${encodeURIComponent(name)}`
      );
    } else if (level === "cities") {
      navigate(`/AvailableTours/${encodeURIComponent(name)}`);
    }
  };

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

      {error && <p style={{ color: "red" }}>{error}</p>}
      {isLoading ? (
        <p>Cargando...</p>
      ) : locations.length === 0 ? (
        <p>No se encontraron ubicaciones</p>
      ) : (
        <div className="cardLocationCard-container">
          {locations.map((location: { name: string; image?: string }) => (
            <div
              key={location.name}
              className="cardLocationCard"
              onClick={() => handleCardClick(location.name)}
              style={{ backgroundImage: `url(${location.image ?? Enero})` }}
            >
              <div className="cardLocationCard-content">
                <h3>{location.name}</h3>
                <p className="cardLocationCard-tours">Ver más</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <Footer />
    </>
  );
};

export default ToursPage;
