import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import React from "react";
import CardsCarrusel from "../CardsCarrusel/CardsCarrusel";
import "./Home.css";
import InicioImg from "./inicio.webp";
import Asia from "./ASIA.webp";
import Europa from "./EUROPA.webp";
import Latinoamerica from "./LATINOAMERICA.webp";
import Mexico from "./MEXICO.webp";
import Norteamerica from "./NUEVAYORK.webp";
import PlayasMexico from "./PLAYASMEXICO.webp";
import Icono1 from "./Recurso-1.svg";
import Icono2 from "./Recurso-2.svg";
import Icono3 from "./Recurso-3.svg";

const continentes = [
  { nombre: "Europa", tours: 7, imagen: Europa, area: "europa" },
  { nombre: "Asia", tours: 0, imagen: Asia, area: "asia" },
  {
    nombre: "Latinoamérica",
    tours: 3,
    imagen: Latinoamerica,
    area: "latinoamerica",
  },
  { nombre: "México", tours: 40, imagen: Mexico, area: "mexico" },
  {
    nombre: "Playas de México",
    tours: 15,
    imagen: PlayasMexico,
    area: "playasdemexico",
  },
  {
    nombre: "Norteamérica",
    tours: 4,
    imagen: Norteamerica,
    area: "norteamerica",
  },
];

const Home: React.FC = () => {
  return (
    <>
      <Header />

      <div className="homeheader">
        <img src={InicioImg} alt="" />
      </div>

      <div className="search-bar-container">
        <div className="search-bar">
          <input type="text" placeholder="Buscar" className="search-input" />
          <select className="search-dropdown">
            <option>Destino</option>
          </select>
          <select className="search-dropdown">
            <option>Duración</option>
          </select>
          <button className="search-button">BUSCAR</button>
        </div>

        <div className="info-section">
          <div className="info-item">
            <div className="icon-placeholder">
              <img src={Icono3} alt="" />
            </div>
            <div>
              <h3>
                DESTINO,
                <span className="azuloscuro-placeholder"> EL MUNDO</span>
              </h3>
              <p>Contamos con un gran catálogo de sitios escogidos para ti</p>
            </div>
          </div>
          <div className="info-item">
            <div className="icon-placeholder">
              <img src={Icono2} alt="" />
            </div>
            <div>
              <h3>
                LOS <span className="azuloscuro-placeholder">MEJORES</span>{" "}
                PRECIOS
              </h3>
              <p>Descuentos y promociones todas las semanas</p>
            </div>
          </div>
          <div className="info-item">
            <div className="icon-placeholder">
              <img src={Icono1} alt="" />
            </div>
            <div>
              <h3>
                SERVICIO{" "}
                <span className="azuloscuro-placeholder">PERSONALIZADO</span>
              </h3>
              <p>Tenemos un plan para cada uno de nuestros clientes</p>
            </div>
          </div>
        </div>
      </div>

      <h2>Ofertas de viajes</h2>

      <CardsCarrusel />

      <h2>Mejores destinos para viajar</h2>

      <div className="Continentes-container">
        {continentes.map((continente) => (
          <div
            key={continente.nombre}
            className={`Continentes-card ${continente.area}`}
            style={{ backgroundImage: `url(${continente.imagen})` }}
          >
            <div className="Continentes-name">
              <h3>{continente.nombre}</h3>
            </div>
            <div className="Continentes-content">
              <p className="Continentes-tours">{continente.tours} tours</p>
            </div>
            <p className="Continentes-tours-vertodo">Ver todos los tours</p>
          </div>
        ))}
      </div>
      <CardsCarrusel />

      <h2>Galería de fotos</h2>
      <Footer />
    </>
  );
};

export default Home;
