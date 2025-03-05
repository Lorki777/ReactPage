import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet as HelmetReact } from "react-helmet-async";
import "./BlogTemplate.css";

const BlogTemplate: React.FC = () => {
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

      <div className="PortadaBlogTemplate" /*Portada para Blogs*/>
        <h3>
          Consejos prácticos para viajeros conscientes: reduce tu huella de
          carbono mientras exploras el mundo
        </h3>
      </div>

      <div className="CuerpoBlog">
        <p>
          Viajar es una experiencia enriquecedora, pero también conlleva un
          impacto ambiental que podemos minimizar. Si buscas ser un viajero más
          consciente y reducir tu huella de carbono, estos consejos te ayudarán
          a disfrutar del mundo mientras cuidas el planeta.
        </p><br />
        
      </div>

      <Footer />
    </>
  );
};

export default BlogTemplate;
