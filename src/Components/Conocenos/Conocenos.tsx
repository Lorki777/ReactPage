import React from "react";
import "./Conocenos.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import FondoNostros from "./fondo-nosotros.webp";
import tiktokimage from "../CardsCarrusel/tiktok.png";


const SobreNosotros: React.FC = () => {
  return (
    <>
      <Header />
      <div className="sobre-nosotros">
        <div className="inicio">Sobre Nosotros</div>

        <div className="experiencia">
          <div className="experiencia1">
            <img src={FondoNostros} alt="Sobre Nostros" />
          </div>
          <div className="experiencia2">
            <h3>9 Años de Experiencia</h3>
            <p>
              Somos una empresa de turismo 100% mexicana, que se dedica a la
              prestación de servicios para personas desde el año 2015, iniciando
              nuestras operaciones en Tampico y posicionándonos en el mercado.
              Hoy en día nuestra plataforma de red social tiene un total de
              98,996 seguidores y operamos con más de 3,000 clientes anualmente.
            </p>
          </div>
        </div>

        <div className="valores-profesionales">
          <div className="valores">
            <h3>Nuestros valores</h3>
            <ul>
              <li>Lealtad</li>
              <li>Profesionalismo</li>
              <li>Responsabilidad</li>
              <li>Servicio</li>
              <li>Transparencia</li>
            </ul>
          </div>
          <div className="profesionales">
            <h3>Un grupo de profesionales</h3>
            <p>
              Estamos integrados por nuestro equipo de profesionales con
              experiencia en el ramo, la satisfacción de nuestros clientes es
              nuestra misión y nos diferenciamos por lograr que nuestros
              clientes vivan una experiencia única.
            </p>
          </div>
        </div>

        <div className="mision-vision">
          <div className="mision">
            <h3>Misión</h3>
            <p>
              Llevar a nuestros clientes más allá de sus expectativas,
              ofreciendo confiabilidad y servicio, con personal altamente
              calificado, innovando la tendencia viajera y creando expectativas
              al cliente.
            </p>
          </div>
          <div className="vision">
            <h3>Visión</h3>
            <p>
              Ser una empresa posicionada como líder a nivel nacional en el
              mercado, con experiencia en el extranjero, manejando diferentes
              sedes de atención al cliente con la capacidad de brindar un
              servicio de calidad en equipo siendo la mejor opción para nuestro
              viajero
            </p>
          </div>
        </div>
      </div>

      <div className="nuestro-equipo">

        <div className="card">
          <img src={tiktokimage} alt="Nueva York" />
          <div className="card-content">
            <h3>Rosalinda Rangel</h3>
          </div>
        </div>

        <div className="card">
          <img src={tiktokimage} alt="Nueva York" />
          <div className="card-content">
            <h3>Pedro Martinez</h3>
          </div>
        </div>

        <div className="card">
          <img src={tiktokimage} alt="Nueva York" />
          <div className="card-content">
            <h3>Maria Jose</h3>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SobreNosotros;
