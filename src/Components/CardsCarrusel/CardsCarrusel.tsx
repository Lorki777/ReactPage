import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "../../../node_modules/swiper/swiper.css";
import "../../../node_modules/swiper/swiper-bundle.min.css";
import "../../../node_modules/swiper/modules/navigation.css";
import "../../../node_modules/swiper/modules/pagination.css";
import tiktokimage from "../CardsCarrusel/tiktok.png";
import "./CardsCarrusel.css";
import { useProductos } from "../Hook"; // Importa el hook
import { FaBolt } from "react-icons/fa";
import { CardsCarruselProps } from "../Interfaces";

// Definir el tipo de props (por ejemplo, filter puede ser una cadena o número)

const CardsCarrusel: React.FC<CardsCarruselProps> = ({ filter }) => {
  // Convertir el filtro a cadena en caso de ser número
  const filtroStr = filter !== undefined ? String(filter) : undefined;
  const { productos, error, swiperRef, handleCardClick } =
    useProductos(filtroStr);

  return (
    <div className="cards-carousel">
      {/* Botón personalizado para la flecha izquierda */}
      <button
        className="swiper-button-prev arrow left"
        onClick={() => swiperRef.current?.slidePrev()}
      >
        &lt;
      </button>

      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        loop={true}
        pagination={{ clickable: true }}
        breakpoints={{
          300: { slidesPerView: 1 },
          570: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
      >
        {/* Mostrar error si ocurre */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Renderizar las tarjetas */}
        {productos.map((producto) => (
          <SwiperSlide key={producto.TourName}>
            <div
              className="card"
              onClick={() => handleCardClick(producto.TourSlug)}
            >
              {producto.TourBadge ? (
                <span className="promo">{producto.TourBadge}</span>
              ) : (
                <span style={{ display: "none" }}>{producto.TourBadge}</span>
              )}
              <img src={tiktokimage} alt={producto.TourName} />
              <div className="card-content">
                <h3>
                  <FaBolt />
                  {producto.TourName}
                </h3>
                <div className="price">{producto.TourPrice}</div>
                <div className="duration">{producto.TourDuration} dias</div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Botón personalizado para la flecha derecha */}
      <button
        className="swiper-button-next arrow right"
        onClick={() => swiperRef.current?.slideNext()}
      >
        &gt;
      </button>
    </div>
  );
};

export default CardsCarrusel;
