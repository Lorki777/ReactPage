import React from "react";
import "./Blog.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet as HelmetReact } from "react-helmet-async";
import ReducirHuella from "./Reducir huella Portada Chica.webp";
import Anuncio from "./ANUNCIOS-02.webp";
import Diamante from "./diamante.svg";
import ToursLandLogo from "./ToursLand-Logo.png";

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

      <div className="PortadaBlog" /*Portada TourStories*/>
        <h3>TourStories</h3>
      </div>

      <div className="experienciablog" /*Contenedor Blog*/>
        <div className="experienciablog1" /*Lado Izquierdo*/>
          <div className="barra-busqueda-blog" /*Buscador*/>
            <input
              type="text"
              placeholder="Buscar"
              className="input-busqueda-blog"
            />
            <button className="boton-busqueda-blog">BUSCAR</button>
          </div>

          <div className="ConoceTourStories">
            <h2>CONÓCE TOURSTORIES</h2>
            <p>
              En esta página podrás estar informado de las últimas noticias en
              el mundo de los viajes.
            </p>
          </div>

          <div className="PostsRec">
            <h2>POSTS RECIENTES</h2>
          </div>
        </div>

        <div className="experienciablog2" /*Parte del Centro*/>
          <div className="cardBlog">
            <div className="imagenBlog">
              <img src={ReducirHuella} alt="" />
            </div>
            <div className="contentBlog">
              <a href="#">
                <span className="title">
                  Consejos prácticos para viajeros conscientes: reduce tu huella
                  de carbono mientras exploras el mundo
                </span>
              </a>

              <p className="descBlog">
                Viajar es una experiencia enriquecedora, pero también conlleva
                un impacto ambiental que podemos minimizar. Si buscas ser un
                viajero más consciente y reducir tu huella de carbono, estos
                consejos te ayudarán a disfrutar del mundo mientras cuidas el
                planeta. 1. Opta por medios de transporte...
              </p>

              <button
                className="actionBlog"
                onClick={() => (window.location.href = "/BlogTemplate")}
              >
                Leer Más
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
        <div className="experienciablog3" /*Lado Derecho*/>
          <h3>TOURSLAND</h3>
          <p>
            En esta página podrás estar informado de las últimas noticias en el
            mundo de los viajes.
          </p>
        </div>
      </div>

      <div className="Canal-Whats" /*Apartado Canal Whats*/>
        <div className="Img-Canal-Whats">
          <img src={Anuncio} alt="" />
        </div>
        <div className="Unete-Canal">
          <h3>¿Quieres recibir ofertas?</h3>
          <h2>¡Únete a nuestro canal de WhatsApp!</h2>
          <img src={Diamante} alt="" />
          <button className="Boton-Canal">Únete aquí al canal</button>
          <div className="LogoToursLandCanal">
            <img src={ToursLandLogo} alt="" />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Blog;
