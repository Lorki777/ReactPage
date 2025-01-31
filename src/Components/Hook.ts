import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Swiper as SwiperType } from "swiper";
import { Product, Itinerary, Title, Item, ListData, Month } from "./Interfaces";
//carrusel
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
//tours
export const useTourData = () => {
  //Variables
  const { tourName } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [titles, setTitles] = useState<Title[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [pointItinerary, setItinerary] = useState<Itinerary[]>([]);
  const [openDay, setOpenDay] = useState<number | null>(null);
  //FetchData
  const fetchData = async (endpoint: string, setter: (data: any) => void) => {
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
        `http://localhost:8080/api/productos/${endpoint}/${tourName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          return fetchData(endpoint, setter);
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
  //FetchAllData
  useEffect(() => {
    fetchData("tour", setProduct);
    fetchData("tourlist", (data: ListData) => {
      setTitles(data.titles);
      setItems(data.items);
    });
    fetchData("touritinerary", setItinerary);
  }, [tourName]);

  return { product, titles, items, pointItinerary, openDay, setOpenDay, error };
};
//Sidebar
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
//cardswith pagination
export const useProductosPagination = (
  Type: string | undefined,
  Param: string | undefined
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, _setTotalPages] = useState(1);
  const [productos, setProductos] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProductosCardsPagination = async () => {
    try {
      let token: string | null = localStorage.getItem("authToken");

      if (!token) {
        const guestTokenResponse = await fetch(
          "http://localhost:8080/api/guest-token"
        );
        if (!guestTokenResponse.ok)
          throw new Error("Error al generar token de invitado");

        const guestTokenData = await guestTokenResponse.json();
        token = guestTokenData.token;

        if (typeof token === "string" && token.trim() !== "") {
          localStorage.setItem("authToken", token);
        } else {
          throw new Error("Token de invitado no válido");
        }
      }

      let endpoint = "";
      if (Type === "Paquetes" && Param) {
        endpoint = `http://localhost:8080/api/productos/Paquetes/${Param}/${currentPage}`;
      } else if (Type === "AvailableTours" && Param) {
        endpoint = `http://localhost:8080/api/productos/AvailableTours/${Param}/${currentPage}`;
      } else {
        throw new Error("Tipo o parámetro inválido");
      }

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          return fetchProductosCardsPagination();
        }
        throw new Error("Error al obtener los datos");
      }

      const data = await response.json();
      setProductos(data.data);
      _setTotalPages(data.totalPages);
    } catch (err) {
      setError((err as Error).message || "Error al obtener los datos.");
    }
  };

  const handleCardClick = (TourSlug: string) => {
    navigate(`/tours/${encodeURIComponent(TourSlug)}`);
  };

  useEffect(() => {
    if (Type && Param) {
      fetchProductosCardsPagination();
    }
  }, [Type, Param, currentPage]);

  return {
    productos,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    handleCardClick,
  };
};
//paquetes
export const useFetchMonths = () => {
  const [months, setMonths] = useState<Month[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchMonths = async () => {
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

      const response = await fetch("http://localhost:8080/api/meses/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          return fetchMonths();
        }
        throw new Error("Error al obtener los datos");
      }

      const data: Month[] = await response.json();
      setMonths(data);
    } catch (err) {
      console.error("Error:", err);
      setError(
        (err as Error).message || "Error al obtener los datos del servidor."
      );
    }
  };

  useEffect(() => {
    fetchMonths();
  }, []);

  const handleCardClick = (monthName: string) => {
    const formattedMonthName = monthName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/Paquetes/${encodeURIComponent(formattedMonthName)}`);
  };

  return { months, error, handleCardClick };
};
