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
import AvisoDePrivacidad from "./Components/AvisoDePrivacidad/AvisoDePrivacidad";
import TerminosYCondiciones from "./Components/Terminos y Condiciones/TerminosYCondiciones";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/extra" element={<ExtraPage />} />
      <Route path="/tours/:tourName" element={<Tours />} />
      <Route path="/Paquetes" element={<Paquetes />} />
      <Route path="/Terminos" element={<TerminosYCondiciones />} />
      <Route path="/Aviso" element={<AvisoDePrivacidad />} />
      <Route
        path="/Tours"
        element={<ToursPage key={window.location.pathname} />}
      />
      <Route path="/Grupales" element={<Grupales />} />
      <Route path="/:Type/:Param" element={<CardsPagination />} />
      {/* Ruta principal de tours (para países) */}
      <Route
        path="/TOURS"
        element={<ToursPage key={window.location.pathname} />}
      />
      <Route
        path="/TOURS/Location"
        element={<ToursPage key={window.location.pathname} />}
      />

      {/* Ruta para los estados (requiere el nombre del país) */}
      <Route
        path="/TOURS/Location/:country"
        element={<ToursPage key={window.location.pathname} />}
      />

      {/* Ruta para las ciudades (requiere el país y el estado) */}
      <Route
        path="/TOURS/Location/:country/:state"
        element={<ToursPage key={window.location.pathname} />}
      />
      <Route path="/Conocenos" element={<Conocenos />} />
      <Route path="/Expertos" element={<Expertos />} />
      <Route path="/Blog" element={<Blog />} />
      <Route path="/Payment" element={<Payment />} />
    </Routes>
  );
};

export default AppRoutes;
