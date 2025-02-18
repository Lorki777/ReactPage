import React, { useState } from "react";
import "./CardsForLocationsWithPagination.css";
import Enero from "./ENERO.webp";
import { useFetchLocations } from "../Hook";
import { useNavigate } from "react-router-dom";

const CardsForLocationsWithPagination: React.FC = () => {
  const [level, setLevel] = useState<"countries" | "states" | "cities">(
    "countries"
  );
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const { locations, error } = useFetchLocations(
    level,
    selectedCountry ?? undefined,
    selectedState ?? undefined
  );
  const navigate = useNavigate();

  const handleCardClick = (name: string) => {
    if (level === "countries") {
      setSelectedCountry(name);
      setLevel("states");
    } else if (level === "states") {
      setSelectedState(name);
      setLevel("cities");
    } else if (level === "cities") {
      navigate(`/AvailableTours/${encodeURIComponent(name)}/1`);
    }
  };

  return (
    <>
      {error && <p style={{ color: "red" }}>{error}</p>}
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
    </>
  );
};

export default CardsForLocationsWithPagination;
