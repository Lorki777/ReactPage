import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
// Styles must use direct files imports
import "../../../node_modules/swiper/swiper.css"; // core Swiper
import "../../../node_modules/swiper/swiper-bundle.min.css"; // core Swiper
import "../../../node_modules/swiper/modules/navigation.css"; // Ruta directa para navegación
import "../../../node_modules/swiper/modules/pagination.css"; // Ruta directa para paginación
import tiktokimage from "../CardsCarrusel/tiktok.png";
import "./CardsCarrusel.css";

const CardsCarrusel: React.FC = () => {
  return (
    <div className="cards-carousel">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20} // Space between slides
        slidesPerView={1} // Default slides visible
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          480: { slidesPerView: 1 }, // 1 slide para pantallas pequeñas
          768: { slidesPerView: 2 }, // 2 slides para tablets
          1024: { slidesPerView: 3 }, // 3 slides para computadoras
        }}
      >
        {/* First Card */}
        <SwiperSlide>
          <div className="card">
            <img src={tiktokimage} alt="Nueva York" />
            <div className="card-content">
              <h3>Solteros por Nueva York</h3>
              <div className="price">$34,990</div>
              <div className="duration">5 Días</div>
            </div>
          </div>
        </SwiperSlide>

        {/* Second Card */}
        <SwiperSlide>
          <div className="card">
            <span className="promo">PROMO</span>
            <img src={tiktokimage} alt="Medellín + Cartagena" />
            <div className="card-content">
              <h3>Medellín + Cartagena</h3>
              <div className="price">$26,900</div>
              <div className="duration">5 Días</div>
            </div>
          </div>
        </SwiperSlide>

        {/* Third Card */}
        <SwiperSlide>
          <div className="card">
            <img src={tiktokimage} alt="El Chepe" />
            <div className="card-content">
              <h3>Tren el Chepe + Barrancas del Cobre</h3>
              <div className="price">$22,500</div>
              <div className="duration">5 Días</div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="card">
            <img src={tiktokimage} alt="Nueva York2" />
            <div className="card-content">
              <h3>Solteros por Nueva York</h3>
              <div className="price">$34,990</div>
              <div className="duration">5 Días</div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="card">
            <img src={tiktokimage} alt="Nueva York3" />
            <div className="card-content">
              <h3>Solteros por Nueva York</h3>
              <div className="price">$34,990</div>
              <div className="duration">5 Días</div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="card">
            <img src={tiktokimage} alt="Nueva York4" />
            <div className="card-content">
              <h3>Solteros por Nueva York</h3>
              <div className="price">$34,990</div>
              <div className="duration">5 Días</div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="card">
            <img src={tiktokimage} alt="Nueva York5" />
            <div className="card-content">
              <h3>Solteros por Nueva York</h3>
              <div className="price">$34,990</div>
              <div className="duration">5 Días</div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="card">
            <img src={tiktokimage} alt="Nueva York6" />
            <div className="card-content">
              <h3>Solteros por Nueva York</h3>
              <div className="price">$34,990</div>
              <div className="duration">5 Días</div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="card">
            <img src={tiktokimage} alt="Nueva York7" />
            <div className="card-content">
              <h3>Solteros por Nueva York</h3>
              <div className="price">$34,990</div>
              <div className="duration">5 Días</div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default CardsCarrusel;
