import React, { useState, useEffect } from "react";
import "./CardsForLocationsWithPagination.css";
import Enero from "./ENERO.webp";
import { useFetchLocations } from "../Hook";
import { useNavigate } from "react-router-dom";

const CardsForLocationsWithPagination: React.FC = () => {
  const navigate = useNavigate();

  // Estados inicializados directamente desde la URL
  const [level, setLevel] = useState<"countries" | "states" | "cities">(
    "countries"
  );
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [endpoint, setEndpoint] = useState<string>("");
  const [shouldFetch, setShouldFetch] = useState<boolean>(false); // Controla cuándo empezar a cargar datos

  // Leer la URL directamente y actualizar el estado según el nivel
  const syncStateFromURL = () => {
    const path = window.location.pathname;
    const pathParts = path.split("/").filter(Boolean);

    if (pathParts[0] === "TOURS" && pathParts[1] === "Location") {
      if (pathParts.length === 2) {
        setLevel("countries");
        setSelectedCountry(null);
        setSelectedState(null);
        setEndpoint("productos/locations/countries");
      } else if (pathParts.length === 3) {
        const country = decodeURIComponent(pathParts[2]);
        setSelectedCountry(country);
        setLevel("states");
        setSelectedState(null);
        setEndpoint(`productos/locations/states/${country}`);
      } else if (pathParts.length === 4) {
        const country = decodeURIComponent(pathParts[2]);
        const state = decodeURIComponent(pathParts[3]);
        setSelectedCountry(country);
        setSelectedState(state);
        setLevel("cities");
        setEndpoint(`productos/locations/cities/${state}`);
      }
    } else if (pathParts[0] === "TOURS") {
      setLevel("countries");
      setSelectedCountry(null);
      setSelectedState(null);
      setEndpoint("productos/locations/countries");
    }

    setShouldFetch(true); // Permitir que los datos se carguen después de sincronizar la URL
  };

  // Sincronizar el estado desde la URL en el montaje inicial y cada vez que cambie la ruta
  useEffect(() => {
    syncStateFromURL();
  }, [window.location.pathname]);

  // Hook de carga de datos que se actualiza cuando el estado cambia
  const { locations, error } = useFetchLocations(
    level,
    selectedCountry ?? undefined,
    selectedState ?? undefined
  );

  useEffect(() => {
    if (shouldFetch) {
      if (locations.length > 0 || error) {
        setIsLoading(false);
        setShouldFetch(false); // Evitar recargas innecesarias
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

  // Renderizado de tarjetas
  return (
    <>
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
    </>
  );
};

export default CardsForLocationsWithPagination;
