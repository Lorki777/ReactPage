import React from "react";
import "./Tours.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "../../../node_modules/swiper/swiper.css";
import "../../../node_modules/swiper/swiper-bundle.min.css";
import "../../../node_modules/swiper/modules/navigation.css";
import "../../../node_modules/swiper/modules/pagination.css";
import placeHolderImg from "./placeholder-image.webp";
import placeHolderImg2 from "./placeholder-image2.webp";
import Iconoinicio from "./tours-land.svg";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet as HelmetReact } from "react-helmet-async";
import { useTourData, useSidebarLogic } from "../Hook";

const Tours: React.FC = () => {
  const { product, titles, items, pointItinerary, openDay, setOpenDay } =
    useTourData();
  const { sidebarPosition, activeTab, handleTabClick } = useSidebarLogic();
  return (
    <>
      {product && (
        <>
          <HelmetReact>
            {/* Meta etiquetas dinámicas */}
            <title>{product.MetaTitle}</title>
            <meta charSet="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <meta name="author" content="Toursland" />
            <meta
              name="copyright"
              content="© Toursland. Todos los derechos reservados."
            />
            <meta name="description" content={product.MetaDescription} />
            <meta name="keywords" content={product.MetaKeywords} />
            <link rel="canonical" href={product.CanonicalUrl} />
            <meta name="robots" content={product.MetaRobots} />

            {/* Meta etiquetas dinámicas para redes sociales */}
            <meta property="og:title" content={product.OgTitle} />
            <meta property="og:description" content={product.OgDescription} />
            <meta property="og:image" content={product.OgImage} />
            <meta property="og:url" content={product.CanonicalUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Toursland" />
            <meta property="og:image:alt" content="Descripción de la imagen" />
          </HelmetReact>
          <Header />
          <div className="tourheader">
            <h1>{product.TourName}</h1>
          </div>

          <div className="tour-details-bar">
            <div className="tour-details2-bar">
              <div className="detail-item">
                <span role="img" aria-label="clock">
                  🕒
                </span>
                <span>{product.TourDuration + "Días"}</span>
              </div>
              <div className="detail-item">
                <span role="img" aria-label="plane">
                  ✈️
                </span>
                <span>CDMX</span>
              </div>
              <div className="detail-item">
                <span role="img" aria-label="ship">
                  🚢
                </span>
                <span>Nueva York</span>
              </div>
              <div className="detail-item">
                <span role="img" aria-label="user">
                  👤
                </span>
                <span>Edad Mínima: 2+</span>
              </div>
            </div>
          </div>

          <div className="tour-tabs">
            <ul>
              <li
                className={
                  activeTab === "tourdetails-section" ? "active-tab" : ""
                }
                onClick={() => handleTabClick("tourdetails-section")}
              >
                <a href="#tourdetails-section">Detalles</a>
              </li>
              <li
                className={activeTab === "tour-carrusel" ? "active-tab" : ""}
                onClick={() => handleTabClick("tour-carrusel")}
              >
                <a href="#tour-carrusel">Fotos</a>
              </li>
              <li
                className={activeTab === "tour-mapa" ? "active-tab" : ""}
                onClick={() => handleTabClick("tour-mapa")}
              >
                <a href="#tour-mapa">Mapa</a>
              </li>
              <li
                className={activeTab === "faq-section" ? "active-tab" : ""}
                onClick={() => handleTabClick("faq-section")}
              >
                <a href="#faq-section">FAQ</a>
              </li>
              <li
                className={activeTab === "reviews-section" ? "active-tab" : ""}
                onClick={() => handleTabClick("reviews-section")}
              >
                <a href="#reviews-section">Reseñas</a>
              </li>
            </ul>
          </div>

          <div id="tourdetails-section" className="tourinfo-container">
            <img
              src={Iconoinicio}
              alt="Icono de Tours"
              className="ToursIcon"
            ></img>
            <section className="tourdetails-section">
              <h2>Detalles del Paquete</h2>
              <p>{product.TourDescription}</p>
              {titles.map((title) => (
                <div key={title.list_title}>
                  <hr className="Tourseparation" />
                  <h2>{title.list_titletxt}</h2>
                  <ul>
                    {items
                      .filter((item) => item.list_title === title.list_title)
                      .map((item, index) => (
                        <li key={index}>
                          📍 <span>{item.list_item}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
              <hr className="Tourseparation" />

              <section className="touritinerary">
                <h2>
                  <span role="img" aria-label="bus">
                    🚌
                  </span>{" "}
                  Itinerario
                </h2>
                <div className="touritineraryitems">
                  {pointItinerary.length > 0 ? (
                    pointItinerary.map(({ day, descriptionitinerary }) => (
                      <div
                        key={day}
                        className={`day ${openDay === day ? "open" : ""}`}
                        onClick={() => setOpenDay(openDay === day ? null : day)}
                      >
                        <h3>
                          Día {day} <span>{openDay === day ? "▲" : "▼"}</span>
                        </h3>
                        {openDay === day && <p>{descriptionitinerary}</p>}
                      </div>
                    ))
                  ) : (
                    <p>Cargando itinerario...</p>
                  )}
                </div>
              </section>

              <hr className="Tourseparation" />

              <div id="tour-carrusel" className="tour-carrusel">
                <h2>Fotos</h2>
                <Swiper
                  modules={[Pagination]}
                  slidesPerView={1}
                  pagination={{ clickable: true, dynamicBullets: true }}
                >
                  <SwiperSlide>
                    <img src={placeHolderImg} alt="Carrusel de fotos" />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src={placeHolderImg2} alt="Carrusel de fotos" />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src={placeHolderImg} alt="Carrusel de fotos" />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src={placeHolderImg2} alt="Carrusel de fotos" />
                  </SwiperSlide>
                </Swiper>
              </div>

              <hr className="Tourseparation" />

              <h2>Mapa</h2>

              <div id="tour-mapa">
                <div className="tour-mapa">
                  <iframe
                    src="https://www.google.com/maps/d/embed?mid=1H4PgUJppTbFh8fFmzVPfSuK4JQOH0To&ehbc=2E312F"
                    width="100%"
                    height="100%"
                    style={{
                      borderRadius: "10px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    loading="lazy"
                    aria-label="Mapa interactivo mostrando Estambul y Dubái"
                    title="Mapa interactivo de Google Maps"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </section>

            <aside
              className={`tour-sidebar ${
                sidebarPosition === "sticky" ? "sticky" : "absolute"
              }`}
            >
              <h3 className="tour-sidebar-title">Precio por persona</h3>
              <div className="tour-sidebar-price">$59,990</div>
              <div className="tour-sidebar-reservation">
                <label htmlFor="date" className="tour-sidebar-label">
                  Fecha de salida:
                </label>
                <select id="date" className="tour-sidebar-select">
                  <option value="febrero-23">Febrero 23, 2025</option>
                  <option value="marzo-09">Marzo 09, 2025</option>
                  <option value="abril-27">Abril 27, 2025</option>
                </select>
                <label htmlFor="people" className="tour-sidebar-label">
                  Número de personas:
                </label>
                <select id="people" className="tour-sidebar-select">
                  <option value="1">1 Persona</option>
                  <option value="2">2 Personas</option>
                  <option value="3">3 Personas</option>
                  <option value="4">4 Personas</option>
                </select>
              </div>
              <button className="tour-sidebar-button">COMPRAR</button>
              <div className="tour-sidebar-wishlist">
                <a href="#" className="tour-sidebar-link">
                  Guardar en lista de deseos
                </a>
              </div>
              <div className="tour-sidebar-contact">
                <p>¿Tienes una pregunta?</p>
                <p>
                  Llama al{" "}
                  <a href="tel:+8333344042" className="tour-sidebar-link">
                    833 334 4042
                  </a>
                </p>
                <p>
                  O envía un correo a{" "}
                  <a
                    href="mailto:contacto@toursland.mx"
                    className="tour-sidebar-link"
                  >
                    contacto@toursland.mx
                  </a>
                </p>
              </div>
            </aside>
          </div>
          <Footer />
        </>
      )}
    </>
  );
};

export default Tours;
