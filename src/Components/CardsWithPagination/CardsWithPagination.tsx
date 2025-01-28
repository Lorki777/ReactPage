import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ResponsivePagination from "react-responsive-pagination";
import { useNavigate } from "react-router-dom";

interface Producto {
  TourName: string;
  TourInfo: string;
  TourSlug: string;
}

const CardsCarrusel: React.FC = () => {
  const { Type, Param } = useParams(); // Captura los parámetros de la URL
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, _setTotalPages] = useState(1);
  const [productos, setProductos] = useState<Producto[]>([]); // Estado para los datos
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores

  // Función para obtener los datos del backend
  const fetchProductosCardsPagination = async () => {
    try {
      let token = localStorage.getItem("authToken");

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
          localStorage.setItem("authToken", token);
        } else {
          throw new Error("Token de invitado no válido");
        }
      }

      // Realiza la solicitud usando el token
      const response = await fetch(
        "http://localhost:8080/api/productos/carrusel",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Si el token es inválido, intenta nuevamente generando uno de invitado
          localStorage.removeItem("authToken");
          return fetchProductosCardsPagination();
        }
        throw new Error("Error al obtener los datos");
      }

      const data: Producto[] = await response.json();
      setProductos(data);
    } catch (err) {
      console.error("Error:", err);
      setError(
        (err as Error).message || "Error al obtener los datos del servidor."
      );
    }
  };

  const navigate = useNavigate();

  const handleCardClick = (TourSlug: string) => {
    navigate(`/tours/${encodeURIComponent(TourSlug)}`);
  };

  useEffect(() => {
    if (Type && Param) {
      fetchProductosCardsPagination(); // Llama a la función si hay tipo y parámetro
    }
  }, [Type, Param, currentPage]);

  return (
    <div className="cards-pagination">
      <h1>
        {Type === "Paquetes" && `Mostrando paquetes para el mes: ${Param}`}
        {Type === "AvailableTours" &&
          `Mostrando tours para la ciudad: ${Param}`}
      </h1>

      {/* Mostrar error si ocurre */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Renderizar las tarjetas */}
      {productos.map((producto) => (
        <div
          key={producto.TourSlug}
          className="card"
          onClick={() => handleCardClick(producto.TourSlug)}
        >
          <span className="promo">PROMO</span>
          <img src={"../path/to/image.png"} alt={producto.TourName} />
          <div className="card-content">
            <h3>{producto.TourName}</h3>
            <div className="price">34,990</div>
            <div className="duration">5 días</div>
          </div>
        </div>
      ))}

      {/* Paginación */}
      <ResponsivePagination
        current={currentPage}
        total={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default CardsCarrusel;
