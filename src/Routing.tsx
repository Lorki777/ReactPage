import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import ExtraPage from "./Components/Extra/Extra";
import Tours from "./Components/Tours/Tours";
import Paquetes from "./Components/PaquetesPage/Paquetes";
import ToursPage from "./Components/ToursPage/Tours";
import Grupales from "./Components/GrupalesPage/Grupales";
import CardsPagination from "./Components/CardsWithPagination/CardsWithPagination";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/extra" element={<ExtraPage />} />
      <Route path="/tours/:tourName" element={<Tours />} />
      <Route path="/Paquetes" element={<Paquetes />} />
      <Route path="/Tours" element={<ToursPage />} />
      <Route path="/Grupales" element={<Grupales />} />
      <Route path="/:Type/:Param" element={<CardsPagination />} />
    </Routes>
  );
};

export default AppRoutes;
