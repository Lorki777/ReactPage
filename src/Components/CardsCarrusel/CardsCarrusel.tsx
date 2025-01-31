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

const CardsCarrusel: React.FC = () => {
  const { productos, error, swiperRef, handleCardClick } = useProductos();
  return (
    <div className="cards-carousel">
      {/* Botón personalizado para la flecha izquierda */}
      <button
        className="arrow left"
        onClick={() => swiperRef.current?.slidePrev()}
      >
        &lt;
      </button>

      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        breakpoints={{
          480: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
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
              <span className="promo">PROMO</span>
              <img src={tiktokimage} alt={producto.TourName} />
              <div className="card-content">
                <h3>{producto.TourName}</h3>
                <div className="price">34,990</div>
                <div className="duration">5 dias</div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Botón personalizado para la flecha derecha */}
      <button
        className="arrow right"
        onClick={() => swiperRef.current?.slideNext()}
      >
        &gt;
      </button>
    </div>
  );
};

export default CardsCarrusel;
