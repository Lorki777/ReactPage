import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Swiper as SwiperType } from "swiper";
import { Product, Itinerary, Title, Item, ListData, Month } from "./Interfaces";
// Hook reutilizable para obtener datos con autenticación automática
const isTokenExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));

    if (!decodedPayload.exp) return true;

    const expirationTime = decodedPayload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return true;
  }
};

const getToken = async (): Promise<string | null> => {
  let token = localStorage.getItem("authToken");

  if (!token || isTokenExpired(token)) {
    console.log("Token no existe o ha expirado, generando uno nuevo...");
    localStorage.removeItem("authToken");
    return await generateGuestToken();
  }

  return token;
};

const generateGuestToken = async (): Promise<string | null> => {
  try {
    const guestTokenResponse = await fetch(
      "http://localhost:8080/api/guest-token"
    );
    if (!guestTokenResponse.ok)
      throw new Error("Error al generar token de invitado");

    const guestTokenData = await guestTokenResponse.json();
    if (guestTokenData.token) {
      localStorage.setItem("authToken", guestTokenData.token);
      return guestTokenData.token;
    } else {
      throw new Error("Token de invitado no válido");
    }
  } catch (err) {
    console.error("Error generando token:", err);
    return null;
  }
};

const useFetchData = (endpoint: string, setter: (data: any) => void) => {
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (retry = true) => {
    try {
      let token = await getToken();
      if (!token) throw new Error("No se pudo obtener un token válido");

      const response = await fetch(`http://localhost:8080/api/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401 && retry) {
          console.log("Token expirado, solicitando uno nuevo...");
          localStorage.removeItem("authToken");
          token = await generateGuestToken();
          if (token) return fetchData(false);
        }
        throw new Error("Error al obtener los datos");
      }

      const data = await response.json();
      setter(data);
    } catch (err) {
      console.error("Error:", err);
      setError(
        (err as Error).message || "Error al obtener los datos del servidor."
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { error };
};

// Hook para productos del carrusel
export const useProductos = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const swiperRef = useRef<SwiperType | null>(null);
  const navigate = useNavigate();
  const { error } = useFetchData("productos/carrusel", setProductos);

  const handleCardClick = (TourSlug: string) => {
    navigate(`/tours/${encodeURIComponent(TourSlug)}`);
  };

  return { productos, error, swiperRef, handleCardClick };
};

// Hook para obtener datos de un tour
export const useTourData = () => {
  const { tourName } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [titles, setTitles] = useState<Title[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [pointItinerary, setItinerary] = useState<Itinerary[]>([]);
  const [openDay, setOpenDay] = useState<number | null>(null);

  useFetchData(`productos/tour/${tourName}`, setProduct);
  useFetchData(`productos/tourlist/${tourName}`, (data: ListData) => {
    setTitles(data.titles);
    setItems(data.items);
  });
  useFetchData(`productos/touritinerary/${tourName}`, setItinerary);

  return { product, titles, items, pointItinerary, openDay, setOpenDay };
};

// Hook para la lógica del sidebar
export const useSidebarLogic = () => {
  const [sidebarPosition, setSidebarPosition] = useState("absolute");
  const [translateY, setTranslateY] = useState("-8rem");
  const [activeTab, setActiveTab] = useState("tourdetails-section");

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const handleScroll = () => {
      let currentSectionId = activeTab;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < 150 && rect.bottom > 150) {
          currentSectionId = section.getAttribute("id") || activeTab;
        }
      });
      if (currentSectionId !== activeTab) {
        setActiveTab(currentSectionId);
      }

      const sidebarElement = document.querySelector(
        ".tour-sidebar"
      ) as HTMLElement | null;
      if (sidebarElement) {
        sidebarElement.style.transition =
          "top 0.3s ease, transform 0.3s ease, opacity 0.3s ease";
        if (window.scrollY > 350) {
          setTranslateY("-10rem");
          setTimeout(() => {
            setSidebarPosition("sticky");
            setTranslateY("1rem");
          }, 500);
        } else {
          setTranslateY("-8rem");
          setTimeout(() => setSidebarPosition("absolute"), 500);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  return { sidebarPosition, translateY, activeTab, handleTabClick };
};

// Hook para productos con paginación
export const useProductosPagination = (
  Type: string | undefined,
  Param: string | undefined
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [productos, setProductos] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Solo se ejecuta cuando Type y Param son válidos
  const { error } = useFetchData(
    Type && Param ? `productos/${Type}/${Param}/${currentPage}` : "",
    (data) => {
      setProductos(data.data);
      setTotalPages(data.totalPages);
    }
  );

  const handleCardClick = (TourSlug: string) => {
    navigate(`/tours/${encodeURIComponent(TourSlug)}`);
  };

  const handlePageChange = (page: number) => {
    // Cambiamos la página
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return {
    productos,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    handleCardClick,
    handlePageChange,
  };
};

// Hook para obtener meses
export const useFetchMonths = () => {
  const [months, setMonths] = useState<Month[]>([]);
  const navigate = useNavigate();
  const { error } = useFetchData("meses", setMonths);

  const handleCardClick = (monthName: string) => {
    const formattedMonthName = monthName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/Paquetes/${encodeURIComponent(formattedMonthName)}`);
  };

  return { months, error, handleCardClick };
};
