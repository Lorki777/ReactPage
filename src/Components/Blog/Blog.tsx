import React from "react";
import "./Blog.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet as HelmetReact } from "react-helmet-async";

const Blog: React.FC = () => {
  return (
    <>
      <HelmetReact>
        {/* Meta etiquetas dinámicas */}
        <title>Tours</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Toursland" />
        <meta
          name="copyright"
          content="© Toursland. Todos los derechos reservados."
        />
        <meta name="description" content="" />
        <meta name="keywords" content="" />
        <link rel="canonical" href="" />
        <meta name="robots" content="" />

        {/* Meta etiquetas dinámicas para redes sociales */}
        <meta property="og:title" content="" />
        <meta property="og:description" content="" />
        <meta property="og:image" content="" />
        <meta property="og:url" content="" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Toursland" />
        <meta property="og:image:alt" content="Descripción de la imagen" />
      </HelmetReact>
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
