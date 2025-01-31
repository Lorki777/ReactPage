import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import ExtraPage from "./Components/Extra/Extra";
import Tours from "./Components/Tours/Tours";
import Paquetes from "./Components/PaquetesPage/Paquetes";
import ToursPage from "./Components/ToursPage/Tours";
import Grupales from "./Components/GrupalesPage/Grupales";
import Expertos from "./Components/Expertos/Expertos";
import Conocenos from "./Components/Conocenos/Conocenos";
import Blog from "./Components/Blog/Blog";
import Payment from "./Components/Payment/Payment";
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
      <Route path="/Conocenos" element={<Conocenos />} />
      <Route path="/Expertos" element={<Expertos />} />
      <Route path="/Blog" element={<Blog />} />
      <Route path="/Payment" element={<Payment />} />
    </Routes>
  );
};

export default AppRoutes;
