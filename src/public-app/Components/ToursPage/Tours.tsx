// src/pages/Tours.tsx

import React, { useEffect } from "react";
import "./Tours.css";
import "./CardsForLocationsWithPagination.css";
import Enero from "./ENERO.webp";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet as HelmetReact } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useFetchLocations, useToursCount } from "../Hook";

const ITEMS_PER_PAGE = 12;

const ToursPage: React.FC = () => {
  const navigate = useNavigate();

  // Determinar el nivel y el filtro actual desde la URL
  let level: "continents" | "countries" | "states" | "cities" = "continents";
  let selectedContinent: string | null = null;
  let selectedCountry: string | null = null;
  let selectedState: string | null = null;

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts[0] === "TOURS" && pathParts[1] === "Location") {
    if (pathParts.length === 2) {
      level = "continents";
    } else if (pathParts.length === 3) {
      level = "countries";
      selectedContinent = decodeURIComponent(pathParts[2]);
    } else if (pathParts.length === 4) {
      level = "states";
      selectedContinent = decodeURIComponent(pathParts[2]);
      selectedCountry = decodeURIComponent(pathParts[3]);
    } else if (pathParts.length === 5) {
      level = "cities";
      selectedContinent = decodeURIComponent(pathParts[2]);
      selectedCountry = decodeURIComponent(pathParts[3]);
      selectedState = decodeURIComponent(pathParts[4]);
    }
  }

  // Carga de ubicaciones según nivel
  const { locations: continents, error: continentsError } = useFetchLocations(
    level === "continents" ? "continents" : "",
    undefined
  );
  const { locations: countries, error: countriesError } = useFetchLocations(
    level === "countries" && selectedContinent ? "countries" : "",
    selectedContinent ?? undefined
  );
  const { locations: states, error: statesError } = useFetchLocations(
    level === "states" && selectedCountry ? "states" : "",
    selectedCountry ?? undefined
  );
  const { locations: cities, error: citiesError } = useFetchLocations(
    level === "cities" && selectedState ? "cities" : "",
    undefined,
    selectedState ?? undefined
  );

  // Conteo de tours para cada nivel
  const { count: continentCount } = useToursCount(
    selectedContinent,
    undefined,
    undefined,
    undefined
  );
  const { count: countryCount } = useToursCount(
    undefined,
    selectedCountry,
    undefined,
    undefined
  );
  const { count: stateCount } = useToursCount(
    undefined,
    undefined,
    selectedState,
    undefined
  );

  // Solo redirige si el nivel actual tiene ≤ ITEMS_PER_PAGE tours
  useEffect(() => {
    if (
      level === "countries" &&
      selectedContinent &&
      continentCount !== null &&
      continentCount > 0 &&
      continentCount <= ITEMS_PER_PAGE
    ) {
      navigate(`/AvailableTours/${encodeURIComponent(selectedContinent)}`);
    } else if (
      level === "states" &&
      selectedCountry &&
      countryCount !== null &&
      countryCount > 0 &&
      countryCount <= ITEMS_PER_PAGE
    ) {
      navigate(`/AvailableTours/${encodeURIComponent(selectedCountry)}`);
    } else if (
      level === "cities" &&
      selectedState &&
      stateCount !== null &&
      stateCount > 0 &&
      stateCount <= ITEMS_PER_PAGE
    ) {
      navigate(`/AvailableTours/${encodeURIComponent(selectedState)}`);
    }
  }, [
    level,
    selectedContinent,
    selectedCountry,
    selectedState,
    continentCount,
    countryCount,
    stateCount,
    navigate,
  ]);

  // Handlers de navegación
  const handleContinentClick = (name: string) => {
    navigate(`/TOURS/Location/${encodeURIComponent(name)}`);
  };
  const handleCountryClick = (name: string) => {
    if (selectedContinent) {
      navigate(
        `/TOURS/Location/${encodeURIComponent(
          selectedContinent
        )}/${encodeURIComponent(name)}`
      );
    }
  };
  const handleStateClick = (name: string) => {
    if (selectedContinent && selectedCountry) {
      navigate(
        `/TOURS/Location/${encodeURIComponent(
          selectedContinent
        )}/${encodeURIComponent(selectedCountry)}/${encodeURIComponent(name)}`
      );
    }
  };
  const handleCityClick = (name: string) => {
    navigate(`/AvailableTours/${encodeURIComponent(name)}`);
  };

  // Texto del header dinámico
  let headerText = "Tours";
  if (level === "countries" && selectedContinent) {
    headerText = `Países en ${selectedContinent}`;
  } else if (level === "states" && selectedCountry) {
    headerText = `Estados en ${selectedCountry}`;
  } else if (level === "cities" && selectedState) {
    headerText = `Ciudades en ${selectedState}`;
  }

  // Carga y errores
  const error = continentsError || countriesError || statesError || citiesError;

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
        <h1>{headerText}</h1>
      </div>

      {error && <p className="error">Error al cargar datos.</p>}

      {level === "continents" && (
        <div className="cardLocationCard-container">
          {continents.map((c) => (
            <div
              key={c.name}
              className="cardLocationCard"
              onClick={() => handleContinentClick(c.name)}
              style={{ backgroundImage: `url(${Enero})` }}
            >
              <div className="cardLocationCard-content">
                <h3>{c.name}</h3>
                <p className="cardLocationCard-tours">Ver países</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {level === "countries" && (
        <div className="cardLocationCard-container">
          {countries.map((c) => (
            <div
              key={c.name}
              className="cardLocationCard"
              onClick={() => handleCountryClick(c.name)}
              style={{ backgroundImage: `url(${Enero})` }}
            >
              <div className="cardLocationCard-content">
                <h3>{c.name}</h3>
                <p className="cardLocationCard-tours">Ver estados</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {level === "states" && (
        <div className="cardLocationCard-container">
          {states.map((s) => (
            <div
              key={s.name}
              className="cardLocationCard"
              onClick={() => handleStateClick(s.name)}
              style={{ backgroundImage: `url(${Enero})` }}
            >
              <div className="cardLocationCard-content">
                <h3>{s.name}</h3>
                <p className="cardLocationCard-tours">Ver ciudades</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {level === "cities" && (
        <div className="cardLocationCard-container">
          {cities.map((c) => (
            <div
              key={c.name}
              className="cardLocationCard"
              onClick={() => handleCityClick(c.name)}
              style={{ backgroundImage: `url(${Enero})` }}
            >
              <div className="cardLocationCard-content">
                <h3>{c.name}</h3>
                <p className="cardLocationCard-tours">Ver tours</p>
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
