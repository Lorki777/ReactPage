import React from "react";
import "./Blog.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const Blog: React.FC = () => {
  return (
    <>
      <Header />
      <div className="experienciablog">
        <div className="experienciablog1">
          <img src="hola" alt="Sobre Nostros" />
        </div>
        <div className="experienciablog2">
          <h3>10 Años de experienciablog</h3>
          <p>
            Somos una empresa de turismo 100% mexicana, que se dedica a la
            prestación de servicios para personas desde el año 2015, iniciando
            nuestras operaciones en Tampico y posicionándonos en el mercado. Hoy
            en día nuestra plataforma de red social tiene un total de 98,996
            seguidores y operamos con más de 3,000 clientes anualmente.
          </p>
        </div>
        <div className="experienciablog3">
          <h3>10 Años de experienciablog</h3>
          <p>
            Somos una empresa de turismo 100% mexicana, que se dedica a la
            prestación de servicios para personas desde el año 2015, iniciando
            nuestras operaciones en Tampico y posicionándonos en el mercado. Hoy
            en día nuestra plataforma de red social tiene un total de 98,996
            seguidores y operamos con más de 3,000 clientes anualmente.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Blog;
