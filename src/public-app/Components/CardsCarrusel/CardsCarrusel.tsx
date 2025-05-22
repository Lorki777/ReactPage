import React, { useRef } from "react";
import type { Swiper as SwiperInstance } from "swiper/types";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "../../../../node_modules/swiper/swiper.css";
import "../../../../node_modules/swiper/swiper-bundle.min.css";
import "../../../../node_modules/swiper/modules/navigation.css";
import "../../../../node_modules/swiper/modules/pagination.css";
import tiktokimage from "../CardsCarrusel/tiktok.png";
import "./CardsCarrusel.css";
import { useProductos, fmtMXN } from "../Hook"; // Importa el hook
import { FaBolt } from "react-icons/fa";
import { CardsCarruselProps } from "../Interfaces";
import { FaClock } from "react-icons/fa";

// Definir el tipo de props (por ejemplo, filter puede ser una cadena o número)

const CardsCarrusel: React.FC<CardsCarruselProps> = ({ filter }) => {
  // Convertir el filtro a cadena en caso de ser número
  const filtroStr = filter !== undefined ? String(filter) : undefined;

  const progressCircle = useRef<HTMLDivElement>(null);
  const progressContent = useRef<HTMLDivElement>(null);

  const onAutoplayTimeLeft = (
    swiper: SwiperInstance,
    time: number,
    progress: number
  ): void => {
    const circle = progressCircle.current;
    const content = progressContent.current;
    if (!circle || !content) return; // corta si alguno es null

    circle.style.setProperty("--progress", String(1 - progress));
    content.textContent = `${Math.ceil(time / 1000)}s`;
  };
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
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        loop={true}
        pagination={{ clickable: true }}
        watchSlidesProgress={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        onAutoplayTimeLeft={onAutoplayTimeLeft}
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
          <SwiperSlide key={producto.tour_name}>
            <div
              className="card"
              onClick={() => handleCardClick(producto.tour_slug)}
            >
              {producto.tour_badge_name ? (
                <span className="promo">{producto.tour_badge_name}</span>
              ) : (
                <span style={{ display: "none" }}>
                  {producto.tour_badge_name}
                </span>
              )}
              <img src={tiktokimage} alt={producto.tour_name} />
              <div className="card-content">
                <h3>
                  <FaBolt />
                  {producto.tour_name}
                </h3>
                <div className="price">
                  {fmtMXN.format(producto.tour_price)}
                </div>
                <div className="duration">
                  <FaClock />
                  {producto.tour_duration} dias
                </div>
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
