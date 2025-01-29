import React from "react";
import "./Expertos.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Portada from "./PORTADA GENTE VIAJANDO WEB.webp";
import Empresarial from "./VIAJE EMPRESARIAL WEB.webp";
import Familiar from "./VIAJE EN FAMILIA WEB.webp";
import Graduacion from "./VIAJE DE GRADUACIÓN WEB.webp";
import Despedida from "./VIAJE DE DESPEDIDA DE SOLTERA WEB.webp";

const Expertos: React.FC = () => {
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
      <div className="PortadaExpertos" /*Portada Pagina*/>
        <img src={Portada} alt="" />
        <p>
          SI VIAJAS CON 10 O MAS PERSONAS PERSONALIZAMOS TU VIAJE A TU MANERA,
          AGREGANDO LOS SERVICIOS QUE NECESITES PARA QUE TU VIAJE SEA COMO TU LO
          QUIERAS.
        </p>
      </div>

      <div className="ServiciosTitulo">
        <h3>Servicios que ofrecemos</h3>
      </div>

      <div className="Servicios" /*Empieza Servicios*/>
        <div className="Servicio" /*Viajes Empresariales*/>
          <h3>Viajes Empresariales</h3>
          <p>
            Organizamos viajes que promuevan los valores de la empresa y hacemos
            sinergia con dinámicas de liderazgo, aprendizaje y trabajo en
            equipo.
          </p><br />
          <p>Lo diseñamos a la medida en base a la experiencia o mensaje
            que los directivos de la empresa quieran brindar a sus
            colaboradores.</p>
        </div>
        <div className="ServicioImagen">
          <img src={Empresarial} alt="Viaje Empresarial" />
        </div>
      </div>

      <div className="Servicios">
        <div className="ServicioImagen" /*Viajes Familiares*/>
          <img src={Familiar} alt="" />
        </div>
        <div className="Servicio">
          <h3>Viajes Familiares</h3>
          <p>
            Quieres irte de vacaciones en familia y nadie se pone de acuerdo, te
            recomendamos nuestro servicio en donde nadie se preocupara por nada,
            solamente por disfrutar, si están por celebrar un evento o fechas
            importantes todas los viajes los hacemos en base a las edades y
            necesidades de nuestros clientes.
          </p>
        </div>
      </div>

      <div className="Servicios">
        <div className="Servicio" /*Viajes de Graduación*/>
          <h3>Viajes de Graduación</h3>
          <p>
            Organizamos toda tu graduación de una manera muy original, lleno de
            adrenalina, diversión y sobre todo a la medida, vamos a celebrar es
            una fiesta garantizada.
          </p>
        </div>
        <div className="ServicioImagen">
          <img src={Graduacion} alt="" />
        </div>
      </div>

      <div className="Servicios">
        <div className="ServicioImagen" /*Viajes Despedida de Soltero/a*/>
          <img src={Despedida} alt="" />
        </div>
        <div className="Servicio">
          <h3>Viajes de Despedida de Soltero/a</h3>
          <p>
            Llego el momento de decir adiós a la soltería y en ToursLand sabemos
            como consentirte, planeamos, ejecutamos, y cuidamos todos los
            detalles de tu día especial, tenemos todos los destinos y todas las
            playas de México y el mundo.
          </p>
        </div>
      </div>

      <div className="Clientes" /*Apartado mostrar logo de clientes*/>
        <h3>Clientes</h3>
      </div>

      <div className="SolicitaCotizacion" /*Apartado Solicitar Cotizacion*/>
        <div className="SolicCot">
          <h3>¡Solicita tu Cotización!</h3>
        </div>
        <div className="InfoContacto">
          <p>833-334-40-42</p><br />
          <p>contacto@toursland.mx</p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Expertos;
