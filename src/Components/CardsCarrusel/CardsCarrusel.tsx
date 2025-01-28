import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Swiper as SwiperType } from "swiper/types";
import "../../../node_modules/swiper/swiper.css";
import "../../../node_modules/swiper/swiper-bundle.min.css";
import "../../../node_modules/swiper/modules/navigation.css";
import "../../../node_modules/swiper/modules/pagination.css";
import tiktokimage from "../CardsCarrusel/tiktok.png";
import "./CardsCarrusel.css";
import { useNavigate } from "react-router-dom";
interface Producto {
  TourName: string;
  TourInfo: string;
  TourSlug: string;
}

const CardsCarrusel: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]); // Estado para los dato
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores

  // Función para obtener los datos del backend
  const fetchProductos = async () => {
    try {
      let token = localStorage.getItem("authToken"); // Obtén el token del localStorage

      // Si no hay token, genera uno de invitado
      if (!token) {
        const guestTokenResponse = await fetch(
          "http://localhost:8080/api/guest-token"
        );
        if (!guestTokenResponse.ok)
          throw new Error("Error al generar token de invitado");

        const guestTokenData = await guestTokenResponse.json();
        token = guestTokenData.token;
        if (token) {
          localStorage.setItem("authToken", token); // Guarda el token de invitado en localStorage
        } else {
          throw new Error("Token de invitado no válido");
        }
      }

      // Usa el token (ya sea existente o de invitado) para la solicitud
      const response = await fetch(
        "http://localhost:8080/api/productos/carrusel",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Incluye el token en el encabezado
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Si el token es inválido, intenta generar uno de invitado
          localStorage.removeItem("authToken"); // Borra el token inválido
          return fetchProductos(); // Intenta nuevamente generando un token de invitado
        }
        throw new Error("Error al obtener los datos");
      }

      const data: Producto[] = await response.json();
      setProductos(data); // Actualiza los datos
    } catch (err) {
      console.error("Error:", err);
      setError(
        (err as Error).message || "Error al obtener los datos del servidor."
      );
    }
  };

  // Hook useEffect: Llama a la función al montar el componente
  useEffect(() => {
    fetchProductos();
  }, []);

  // Lleva a la pagina de tours con el nombre de el tour en la url

  const navigate = useNavigate();

  const handleCardClick = (TourSlug: string) => {
    navigate(`/tours/${encodeURIComponent(TourSlug)}`);
  };

  const swiperRef = useRef<SwiperType | null>(null); // Define el tipo correctamente
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
