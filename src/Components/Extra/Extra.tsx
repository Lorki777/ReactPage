// src/components/ExtraPage.tsx s
import React from "react";
import "./Extra.css";

const ExtraPage: React.FC = () => {
  return (
    <>
      <div className="buscar-tour">
        <div className="categorias">
          <h2>Buscar Tour por categoría</h2>
          <div className="categoria-lista">
            <ul>
              <li>
                <a href="#">Europa</a>
              </li>
              <li>
                <a href="#">Asia</a>
              </li>
              <li>
                <a href="#">Latinoamérica</a>
              </li>
              <li>
                <a href="#">México</a>
              </li>
            </ul>
            <ul>
              <li>
                <a href="#">Playas de México</a>
              </li>
              <li>
                <a href="#">Norteamérica</a>
              </li>
              <li>
                <a href="#">Viajes Grupales</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="ofertas">
          <h2>¿Quieres recibir ofertas exclusivas?</h2>
          <p>Únete a nuestro canal y conviértete en un Viajero ToursLand.</p>
          <button>Únete aquí al canal</button>
          <div className="iconos">
            <span className="icono"></span>
            <span className="icono"></span>
            <span className="icono"></span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExtraPage;
