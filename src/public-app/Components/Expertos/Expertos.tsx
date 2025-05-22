// src/components/Expertos/Expertos.tsx
import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet as HelmetReact } from "react-helmet-async";
import "./Expertos.css";
import { FaPhone, FaEnvelope } from "react-icons/fa";
import Portada from "./PORTADA GENTE VIAJANDO WEB.webp";
import Empresarial from "./VIAJE EMPRESARIAL WEB.webp";
import Familiar from "./VIAJE EN FAMILIA WEB.webp";
import Graduacion from "./VIAJE DE GRADUACIÓN WEB.webp";
import Despedida from "./VIAJE DE DESPEDIDA DE SOLTERA WEB.webp";

const services = [
  {
    title: "Viajes Empresariales",
    text: `Organizamos viajes que promuevan los valores de la empresa y hacemos
sinergia con dinámicas de liderazgo, aprendizaje y trabajo en equipo.

Lo diseñamos a la medida en base a la experiencia o mensaje que los
directivos de la empresa quieran brindar a sus colaboradores.`,
    img: Empresarial,
  },
  {
    title: "Viajes Familiares",
    text: `¿Quieres irte de vacaciones en familia y nadie se pone de acuerdo?
Te recomendamos nuestro servicio en donde nadie se preocupará por nada,
solo por disfrutar. Todos los viajes los hacemos en base a las edades
y necesidades de nuestros clientes.`,
    img: Familiar,
  },
  {
    title: "Viajes de Graduación",
    text: `Organizamos toda tu graduación de una manera muy original, llena de
adrenalina, diversión y sobre todo a la medida. ¡Una fiesta garantizada!`,
    img: Graduacion,
  },
  {
    title: "Viajes de Despedida de Soltero/a",
    text: `Llegó el momento de decir adiós a la soltería y en ToursLand sabemos
cómo consentirte. Planeamos, ejecutamos y cuidamos todos los detalles
de tu día especial, con destinos en todas las playas de México y el mundo.`,
    img: Despedida,
  },
];

const Expertos: React.FC = () => {
  return (
    <>
      <HelmetReact>{/* … tus metaetiquetas … */}</HelmetReact>
      <Header />

      <section className="PortadaExpertos">
        <img src={Portada} alt="Portada viajes" loading="lazy" />
        <p>
          SI VIAJAS CON 10 O MÁS PERSONAS PERSONALIZAMOS TU VIAJE A TU MANERA,
          AGREGANDO LOS SERVICIOS QUE NECESITES PARA QUE TU VIAJE SEA COMO TÚ LO
          QUIERAS.
        </p>
      </section>

      <h2 className="ServiciosTitulo">Servicios que ofrecemos</h2>
      <div className="Servicios">
        {services.map((s, i) => (
          <section
            key={i}
            className={`service-section ${i % 2 === 1 ? "reverse" : ""}`}
          >
            <div className="text">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
            <div className="image">
              <img src={s.img} alt={s.title} loading="lazy" />
            </div>
          </section>
        ))}
      </div>

      <div className="Clientes" /*Apartado mostrar logo de clientes*/>
        <h3>Clientes</h3>
      </div>

      <section className="SolicitaCotizacion">
        <div className="SolicitaLeft">
          <h3>¡Solicita tu Cotización!</h3>
        </div>
        <div className="SolicitaRight">
          <div className="ContactItem">
            <FaPhone className="icon" />
            <span className="text">833-334-40-42</span>
          </div>
          <div className="ContactItem">
            <FaEnvelope className="icon" />
            <span className="text">contacto@toursland.mx</span>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Expertos;
