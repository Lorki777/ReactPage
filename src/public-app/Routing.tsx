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
import CardsPagination from "./Components/CardsWithPagination/CardsWithPagination";
import BlogTemplate from "./Components/BlogTemplate/BlogTemplate";
import Payment from "./Components/Payment/Payment";
import AvisoDePrivacidad from "./Components/AvisoDePrivacidad/AvisoDePrivacidad";
import TerminosYCondiciones from "./Components/Terminos y Condiciones/TerminosYCondiciones";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/extra" element={<ExtraPage />} />
      <Route path="/Productos/:tourName" element={<Tours />} />
      <Route path="/Paquetes" element={<Paquetes />} />
      <Route path="/Terminos" element={<TerminosYCondiciones />} />
      <Route path="/Aviso" element={<AvisoDePrivacidad />} />
      <Route path="/Grupales" element={<Grupales />} />
      <Route path="/:Type/:Param" element={<CardsPagination />} />
      <Route path="/AvailableTours" element={<CardsPagination />} />
      <Route
        path="/Filtered"
        element={<CardsPagination key={location.pathname} />}
      />
      <Route path="/TOURS" element={<ToursPage key={location.pathname} />} />
      <Route
        path="/TOURS/Location"
        element={<ToursPage key={location.pathname} />}
      />
      <Route
        path="/TOURS/Location/:country"
        element={<ToursPage key={location.pathname} />}
      />
      <Route
        path="/TOURS/Location/:country/:state"
        element={<ToursPage key={location.pathname} />}
      />
      <Route path="/Conocenos" element={<Conocenos />} />
      <Route path="/Expertos" element={<Expertos />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:blogId" element={<BlogTemplate />} />
      <Route path="/Payment" element={<Payment />} />
    </Routes>
  );
};

export default AppRoutes;
