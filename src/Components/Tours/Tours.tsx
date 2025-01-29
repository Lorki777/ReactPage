import React, { useEffect, useState } from "react";
import "./Tours.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "../../../node_modules/swiper/swiper.css";
import "../../../node_modules/swiper/swiper-bundle.min.css";
import "../../../node_modules/swiper/modules/navigation.css";
import "../../../node_modules/swiper/modules/pagination.css";
import { useParams } from "react-router-dom";
import placeHolderImg from "./placeholder-image.webp";
import placeHolderImg2 from "./placeholder-image2.webp";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet as HelmetReact } from "react-helmet-async";
import { Product, Title, Item, Itinerary, ListData } from "../Interfaces";

const Tours: React.FC = () => {
  //logica para solicitud de productos

  const { tourName } = useParams();
  //const formattedTourName = (tourName || "").replace(/-/g, " ");

  const [error, setError] = useState<string | null>(null);

  const [product, setProduct] = useState<Product | null>(null); // Cambiar a un solo producto

  const fetchProduct = async () => {
    try {
      let token = localStorage.getItem("authToken");

      if (!token) {
        const guestTokenResponse = await fetch(
          "http://localhost:8080/api/guest-token"
        );
        if (!guestTokenResponse.ok)
          throw new Error("Error al generar token de invitado");

        const guestTokenData = await guestTokenResponse.json();
        token = guestTokenData.token;
        if (token) {
          localStorage.setItem("authToken", token);
        } else {
          throw new Error("Token de invitado no válido");
        }
      }

      const response = await fetch(
        `http://localhost:8080/api/productos/tour/${tourName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          return fetchProduct();
        }
        throw new Error("Error al obtener los datos");
      }

      const data: Product = await response.json();
      setProduct(data);
    } catch (err) {
      console.error("Error:", err);
      setError(
        (err as Error).message || "Error al obtener los datos del servidor."
      );
    }
  };

  //logica para solicitud de listas

  const [titles, setTitles] = useState<Title[]>([]); // Estado para los títulos
  const [items, setItems] = useState<Item[]>([]); // Estado para los ítems

  const fetchListData = async () => {
    try {
      let token = localStorage.getItem("authToken");

      if (!token) {
        const guestTokenResponse = await fetch(
          "http://localhost:8080/api/guest-token"
        );
        if (!guestTokenResponse.ok)
          throw new Error("Error al generar token de invitado");

        const guestTokenData = await guestTokenResponse.json();
        token = guestTokenData.token;
        if (token) {
          localStorage.setItem("authToken", token);
        } else {
          throw new Error("Token de invitado no válido");
        }
      }

      const response = await fetch(
        `http://localhost:8080/api/productos/tourlist/${tourName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          return fetchListData();
        }
        throw new Error("Error al obtener los datos");
      }

      const data: ListData = await response.json();
      setTitles(data.titles);
      setItems(data.items);
    } catch (err) {
      console.error("Error:", err);
      setError(
        (err as Error).message || "Error al obtener los datos del servidor."
      );
    }
  };

  //logica para solicitud de itinerarios

  const [_pointItinerary, setItinerary] = useState<Itinerary[]>([]); // Estado para los datos

  const fetchItinerary = async () => {
    try {
      let token = localStorage.getItem("authToken");

      if (!token) {
        const guestTokenResponse = await fetch(
          "http://localhost:8080/api/guest-token"
        );
        if (!guestTokenResponse.ok)
          throw new Error("Error al generar token de invitado");

        const guestTokenData = await guestTokenResponse.json();
        token = guestTokenData.token;
        if (token) {
          localStorage.setItem("authToken", token);
        } else {
          throw new Error("Token de invitado no válido");
        }
      }

      const response = await fetch(
        `http://localhost:8080/api/productos/touritinerary/${tourName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          return fetchItinerary();
        }
        throw new Error("Error al obtener los datos");
      }

      const data: Itinerary[] = await response.json();
      setItinerary(data);
    } catch (err) {
      console.error("Error:", err);
      setError(
        (err as Error).message || "Error al obtener los datos del servidor."
      );
    }
  };

  // Hook useEffect: Llama a la función al montar el componente
  useEffect(() => {
    fetchProduct();
    fetchListData();
    fetchItinerary();
  }, []);

  //logica para sidebar

  const [sidebarPosition, setSidebarPosition] = useState("absolute");
  const [activeTab, setActiveTab] = useState("tourdetails-section");

  // Manejar clics en las pestañas
  const handleTabClick = (id: string) => {
    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Detectar la sección visible
  useEffect(() => {
    // Lógica independiente para el tour-tabs
    const sections = document.querySelectorAll("section[id]");

    const handleScroll = () => {
      let currentSectionId = activeTab;

      // Detectar la sección activa con un margen de 150 píxeles
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < 150 && rect.bottom > 150) {
          currentSectionId = section.getAttribute("id") || activeTab;
        }
      });

      if (currentSectionId !== activeTab) {
        setActiveTab(currentSectionId);
      }

      // Lógica independiente para el sidebar basada en un umbral de 350 píxeles
      const sidebarElement = document.querySelector(".tour-sidebar"); // Selecciona el sidebar si es necesario
      if (sidebarElement) {
        if (window.scrollY > 350) {
          setSidebarPosition("sticky");
        } else {
          setSidebarPosition("absolute");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeTab]);
  const [openDay, setOpenDay] = useState<number | null>(null);

  const toggleDay = (index: number) => {
    setOpenDay(openDay === index ? null : index);
  };
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
            <section className="tourdetails-section">
              <h2>Detalles del Paquete</h2>
              <p>{product.TourDescription}</p>
              {titles.map((title) => (
                <div key={title.list_title}>
                  <hr />
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
              <hr />

              <section className="touritinerary">
                <h2>
                  <span role="img" aria-label="bus">
                    🚌
                  </span>{" "}
                  Itinerario
                </h2>
                <div
                  className={`day ${openDay === 1 ? "open" : ""}`}
                  onClick={() => toggleDay(1)}
                >
                  <h3>
                    Día 08: América <span>{openDay === 1 ? "▲" : "▼"}</span>
                  </h3>
                  <p>Salida en vuelo internacional con destino a Estambul.</p>
                </div>
                <div
                  className={`day ${openDay === 2 ? "open" : ""}`}
                  onClick={() => toggleDay(2)}
                >
                  <h3>
                    Día 09: Estambul <span>{openDay === 2 ? "▲" : "▼"}</span>
                  </h3>
                  <p>
                    Llegada y recepción en el aeropuerto por nuestro personal.
                    Traslado al hotel. Alojamiento.
                  </p>
                </div>
              </section>

              <hr />

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

              <hr />

              <div id="tour-mapa">
                <h2>Mapa</h2>
                <div className="tour-mapa">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.8354345093794!2d144.9537363156805!3d-37.81627974274788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf577ff84f153ce64!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1614558226485!5m2!1sen!2sau"
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
                  {/* Añade más fechas según sea necesario */}
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
