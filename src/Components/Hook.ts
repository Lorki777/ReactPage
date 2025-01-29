import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Swiper as SwiperType } from "swiper";
import { Product } from "./Interfaces";

export const useProductos = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const navigate = useNavigate();

  // Función para obtener los productos del backend
  const fetchProductos = async () => {
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
        "http://localhost:8080/api/productos/carrusel",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          return fetchProductos();
        }
        throw new Error("Error al obtener los datos");
      }

      const data: Product[] = await response.json();
      setProductos(data);
    } catch (err) {
      console.error("Error:", err);
      setError(
        (err as Error).message || "Error al obtener los datos del servidor."
      );
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Navegación al hacer clic en una tarjeta
  const handleCardClick = (TourSlug: string) => {
    navigate(`/tours/${encodeURIComponent(TourSlug)}`);
  };
  return {
    productos,
    error,
    swiperRef,
    handleCardClick,
  };
};

interface UsePaginatedProductosProps {
  endpoint: string; // Ruta base para el fetch
  queryParamKey: string; // Clave del parámetro que quieres pasar
}

export const usePaginatedProductos = ({
  endpoint,
  queryParamKey,
}: UsePaginatedProductosProps) => {
  const { [queryParamKey]: queryParam } = useParams<{
    [key: string]: string;
  }>(); // Obtiene dinámicamente el parámetro
  const [productos, setProductos] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPaginatedProductos = async () => {
    try {
      let token = localStorage.getItem("authToken");

      // Generar un token de invitado si no hay uno
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

      // Realizar la solicitud
      const response = await fetch(
        `${endpoint}?${queryParamKey}=${queryParam}&page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          return fetchPaginatedProductos();
        }
        throw new Error("Error al obtener los datos");
      }

      const { data, totalPages } = await response.json(); // Ajusta esto al formato de tu backend
      setProductos(data);
      setTotalPages(totalPages);
    } catch (err) {
      console.error("Error:", err);
      setError(
        (err as Error).message || "Error al obtener los datos del servidor."
      );
    }
  };

  useEffect(() => {
    if (queryParam) {
      fetchPaginatedProductos();
    }
  }, [queryParam, currentPage]);

  return {
    productos,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
  };
};
