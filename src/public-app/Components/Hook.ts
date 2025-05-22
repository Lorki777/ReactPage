/**
 * @file Hook.ts
 * @brief Custom hooks for managing application state and logic.
 * @details This file contains reusable hooks for fetching data and managing UI state.
 * @date
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Swiper as SwiperType } from "swiper";
import {
  Product,
  Itinerary,
  Title,
  Item,
  ListData,
  Month,
  MinMaxProducts,
  BlogPost,
} from "./Interfaces";
// Hook reutilizable para obtener datos con autenticación automática
/**
 *
 * @param token - Token JWT para verificar la expiración.
 * @returns boolean - Retorna true si el token ha expirado, false en caso contrario.
 * @description Verifica si el token JWT ha expirado. Si no se puede decodificar el token, se considera que ha expirado.
 * @throws Error - Si ocurre un error al decodificar el token.
 * @example
 * const isExpired = isTokenExpired("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVkX3N0YWdlIjoxNjY2NTY4NzQwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
 * console.log(isExpired); // true o false dependiendo de la expiración del token
 * @returns {boolean} - Retorna true si el token ha expirado, false en caso contrario.
 * @throws {Error} - Si ocurre un error al decodificar el token.
 */
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

/**
 * @function getToken
 * @description Obtiene un token de autenticación. Si no existe o ha expirado, genera uno nuevo.
 * @returns {Promise<string | null>} - Retorna el token o null si no se pudo obtener.
 * @throws {Error} - Si ocurre un error al generar el token de invitado.
 * @example
 * const token = await getToken();
 * console.log(token); // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVkX3N0YWdlIjoxNjY2NTY4NzQwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
 */

// Hooks.ts (extracto)

// helpers.ts
export const readCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

// Hook.ts (sólo la parte modificada)

const getToken = async (): Promise<string | null> => {
  // 1) Si ya hay uno válido, lo devolvemos
  const existing = readCookie("token");
  if (existing && !isTokenExpired(existing)) {
    return existing;
  }

  // 2) Si no hay o expiró, pedimos uno nuevo
  try {
    const res = await fetch("http://localhost:8080/api/guest-token", {
      method: "GET",
      credentials: "include", // para que reciba la cabecera Set-Cookie si el back la envía
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { token } = (await res.json()) as { token?: string };
    if (!token) {
      console.error("Backend no devolvió token");
      return null;
    }

    // **Aquí** guardamos en la cookie el JWT recién llegado
    document.cookie = [
      `token=${token}`,
      `path=/`,
      `max-age=${60 * 60}`, // 1 hora (igual que expiresIn)
      /*/`secure`,// en producción, sólo HTTPS*/
      `sameSite=strict`,
    ].join("; ");

    return token;
  } catch (err) {
    console.error("Error en getToken():", err);
    return null;
  }
};

/**
 * @function useFetchData
 * @description Hook para realizar peticiones HTTP y manejar el estado de los datos.
 * @param {string} endpoint - Endpoint de la API a la que se desea hacer la petición.
 * @param {Function} setter - Función para establecer el estado de los datos obtenidos.
 * @param {any} [body] - Cuerpo de la petición (opcional).
 * @returns {Object} - Objeto que contiene el error, si lo hubo.
 * @example
 * const { error } = useFetchData("productos", setProducts, { filter: "new" });
 * console.log(error); // "Error al obtener los datos del servidor."
 */

export const useFetchData = (
  endpoint: string,
  setter: (data: any) => void,
  body?: any
) => {
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (retry = true) => {
    if (!endpoint.trim()) {
      console.warn("El endpoint está vacío, no se realizará la consulta.");
      return;
    }

    try {
      // Asegúrate de que la cookie esté presente
      await getToken();

      const isPost = !!body;

      const fetchOptions: RequestInit = {
        method: isPost ? "POST" : "GET",
        headers: {
          ...(isPost && { "Content-Type": "application/json" }),
        },
        ...(isPost && { body: JSON.stringify(body) }),
        credentials: "include", // Importante: enviar cookies
      };

      const response = await fetch(
        `http://localhost:8080/api/${endpoint}`,
        fetchOptions
      );

      if (!response.ok) {
        if (response.status === 401 && retry) {
          // Intentar regenerar la cookie
          await getToken();
          return fetchData(false);
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
    if (endpoint.trim()) {
      fetchData();
    }
  }, [endpoint, JSON.stringify(body)]);

  return { error };
};

/**
 * @function useMinMaxProducts
 * @returns { minmaxproducts, error } - Retorna los productos con precios mínimos y máximos y el error si lo hubo.
 * @description Hook para obtener productos con precios mínimos y máximos.
 * @param {string} endpoint - Endpoint de la API a la que se desea hacer la petición.
 * @param {Function} setter - Función para establecer el estado de los datos obtenidos.
 * @param {any} [body] - Cuerpo de la petición (opcional).
 * @example
 * const { minmaxproducts, error } = useMinMaxProducts();
 * console.log(minmaxproducts); // { min: 100, max: 500 }
 * console.log(error); // "Error al obtener los datos del servidor."
 */

export const useMinMaxProducts = () => {
  const [minmaxproducts, setminmaxproducts] = useState<MinMaxProducts | null>(
    null
  );

  const endpoint = "productos/minmax";

  const { error } = useFetchData(endpoint, setminmaxproducts);

  return { minmaxproducts, error };
};

/**
 * @function useProductosGrupales
 * @returns { productos, error, handleCardClick } - Retorna los productos grupales y el error si lo hubo.
 * @description Hook para obtener productos grupales.
 * @param {string} endpoint - Endpoint de la API a la que se desea hacer la petición.
 * @param {Function} setter - Función para establecer el estado de los datos obtenidos.
 * @param {any} [body] - Cuerpo de la petición (opcional).
 * @example
 * const { productos, error, handleCardClick } = useProductosGrupales();
 * console.log(productos); // [{ id: 1, name: "Tour 1" }, { id: 2, name: "Tour 2" }]
 * console.log(error); // "Error al obtener los datos del servidor."
 * @returns {Object} - Objeto que contiene los productos, el error y la función handleCardClick.
 * @throws {Error} - Si ocurre un error al obtener los datos del servidor.
 */

export const useProductosGrupales = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const navigate = useNavigate();

  const endpoint = "productos/grupales";
  const { error } = useFetchData(endpoint, setProductos);

  const handleCardClick = (TourSlug: string) => {
    navigate(`/Productos/${encodeURIComponent(TourSlug)}`);
  };

  return { productos, error, handleCardClick };
};

/**
 * @function useProductos
 * @param filter - Filtro para los productos del carrusel.
 * @description Hook para obtener productos del carrusel.
 * @returns { productos, error, swiperRef, handleCardClick } - Retorna los productos del carrusel y el error si lo hubo.
 * @example
 * const { productos, error, swiperRef, handleCardClick } = useProductos("new");
 * console.log(productos); // [{ id: 1, name: "Tour 1" }, { id: 2, name: "Tour 2" }]
 * console.log(error); // "Error al obtener los datos del servidor."
 * @throws {Error} - Si ocurre un error al obtener los datos del servidor.
 */
// Hook para productos del carrusel
export const useProductos = (filter?: string) => {
  const [productos, setProductos] = useState<Product[]>([]);
  const swiperRef = useRef<SwiperType | null>(null);
  const navigate = useNavigate();

  // Construir la URL dependiendo del filtro recibido
  const endpoint = filter
    ? `productos/carrusel?filter=${filter}`
    : "productos/carrusel";
  const { error } = useFetchData(endpoint, setProductos);

  const handleCardClick = (TourSlug: string) => {
    navigate(`/Productos/${encodeURIComponent(TourSlug)}`);
  };

  return { productos, error, swiperRef, handleCardClick };
};

/**
 * @brief Hook to fetch tour data.
 * @returns Object containing tour data and state management functions.
 */
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
        if (window.scrollY > 500) {
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
    navigate(`/Productos/${encodeURIComponent(TourSlug)}`);
  };

  const handlePageChange = (page: number) => {
    // Cambiamos la página
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const capitalize = (str: string | undefined): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return {
    productos,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    handleCardClick,
    handlePageChange,
    capitalize,
  };
};

// Hook para obtener meses
export const useFetchMonths = () => {
  const [months, setMonths] = useState<Month[]>([]);
  const [totalMonths, setTotalMonths] = useState<number>(0); // Estado para la cantidad total
  const navigate = useNavigate();

  // Modificamos el setter para actualizar los dos estados
  const setMonthsData = (data: {
    rows: Month[];
    count: { total: number }[];
  }) => {
    setMonths(data.rows);
    if (data.count.length > 0) {
      setTotalMonths(data.count[0].total);
    }
  };

  const { error } = useFetchData("meses", setMonthsData);

  const handleCardClick = (monthName: string) => {
    const formattedMonthName = monthName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/Paquetes/${encodeURIComponent(formattedMonthName)}`);
  };

  return { months, totalMonths, error, handleCardClick };
};

//Hook para obtener locations

export const useFetchLocations = (
  level: string,
  country?: string,
  state?: string
) => {
  const [locations, setLocations] = useState<
    { name: string; image?: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  let endpoint = "";
  if (level === "continents") endpoint = "productos/locations/continents";
  if (level === "countries") endpoint = "productos/locations/countries";
  if (level === "states" && country)
    endpoint = `productos/locations/states/${country}`;
  if (level === "cities" && state)
    endpoint = `productos/locations/cities/${state}`;

  const { error: fetchError } = useFetchData(
    endpoint ? endpoint : "", // Evitar llamadas vacías
    setLocations
  );

  useEffect(() => {
    if (!endpoint) {
      setError("Endpoint no válido");
    } else {
      setError(fetchError);
    }
  }, [fetchError, endpoint]);

  return { locations, error };
};
//Hook para obtener productos megamenu

export const useMegaMenuData = (type: string) => {
  const [items, setItems] = useState<Product[]>([]);
  const { error } = useFetchData(`productos/megamenu/${type}`, setItems);

  return { items, error };
};

// TourAvailability Sidebar

export const useTourAvailability = () => {
  const { tourName } = useParams();
  const [salidaDesde, setSalidaDesde] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [ninosAdultosCantidad, setNinosAdultosCantidad] = useState<any[]>([]);
  const [reservationDates, setReservationDates] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useFetchData(`productos/tour/availability/${tourName}`, (data: any) => {
    setSalidaDesde(data.salida_desde);
    setHorarios(data.horario);
    setReservationDates(data.reservation_date);
    setNinosAdultosCantidad(data.ninos_adultos_cantidad);
  });

  useFetchData(`productos/tour/services/${tourName}`, (data: any) => {
    setServices(data.services);
  });

  return {
    salidaDesde,
    horarios,
    ninosAdultosCantidad,
    reservationDates,
    services,
  };
};

// Filter Sidebar
export const useFilteredTours = () => {
  const [filteredTours, setFilteredTours] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<any>(null);

  const body = filters
    ? { ...filters, page: currentPage, itemsPerPage: 12 }
    : null;

  const { error } = useFetchData(
    filters ? "productos/tours/filter" : "",
    (response: {
      data: Product[];
      totalPages: number;
      currentPage: number;
    }) => {
      setFilteredTours(response.data || []);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    },
    body
  );

  const applyFilters = useCallback((newFilters: any, page: number = 1) => {
    setFilters(newFilters);
    setCurrentPage(page);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const isLoading = filters !== null && filteredTours.length === 0 && !error;
  const filtersApplied = filters !== null;

  return {
    filteredTours,
    filtersApplied,
    applyFilters,
    isLoading,
    error,
    totalPages,
    currentPage,
    handlePageChange,
  };
};

// Formatear Fecha a Texto

export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const useAddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProduct = async (productData: any) => {
    setLoading(true);
    try {
      let token = await getToken();
      if (!token) {
        throw new Error("No se pudo obtener un token válido");
      }

      const response = await fetch(
        "http://localhost:8080/api/productos/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      if (!response.ok) {
        throw new Error("Error al crear el producto");
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addProduct, loading, error };
};

/**
 * @function fmtMXN
 * @description Formatea un número a la moneda mexicana (MXN).
 * @param {number} value - El valor a formatear.
 * @returns {string} - El valor formateado como moneda mexicana.
 * @example
 * const formattedValue = fmtMXN.format(1234567.89);
 * console.log(formattedValue); // "$1,234,567.89"
 * @throws {TypeError} - Si el valor no es un número.
 * @throws {RangeError} - Si el valor es menor que 0.
 * @throws {Error} - Si ocurre un error al formatear el número.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
 */
export const fmtMXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
});

/**
 * Hook para paginar blogs (5 por página)
 */
export const useBlogsPagination = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Cada vez que cambie currentPage, refetch
  const { error } = useFetchData(
    `blogs?page=${currentPage}`,
    (response: {
      data: BlogPost[];
      totalPages: number;
      currentPage: number;
    }) => {
      setBlogs(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    }
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return { blogs, currentPage, totalPages, handlePageChange, error };
};

/**
 * Hook para obtener los 5 posts recientes
 */
export const useRecentBlogs = () => {
  const [recent, setRecent] = useState<BlogPost[]>([]);
  const { error } = useFetchData("blogs/recent", setRecent);
  return { recent, error };
};

/**
 * Hook para cargar un sólo blog por ID
 */
export const useBlog = (blogId?: string) => {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const { error } = useFetchData(blogId ? `blogs/${blogId}` : "", setBlog);
  return { blog, error };
};

// Hook para contar tours por filtro (continente, país, estado, ciudad)
export const useToursCount = (
  continent?: string | null,
  country?: string | null,
  state?: string | null,
  city?: string | null
) => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let filter = continent || country || state || city;
    if (!filter) {
      setCount(null);
      return;
    }
    setLoading(true);
    fetch(
      `http://localhost:8080/api/productos/tourscount?continent=${encodeURIComponent(
        continent ?? ""
      )}&country=${encodeURIComponent(
        country ?? ""
      )}&state=${encodeURIComponent(state ?? "")}&city=${encodeURIComponent(
        city ?? ""
      )}`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setCount(data.count ?? 0);
        setLoading(false);
      })
      .catch(() => {
        setCount(0);
        setLoading(false);
      });
  }, [continent, country, state, city]);

  return { count, loading };
};

// Hook para obtener tours por filtro (con paginación)
export const useToursByFilter = (
  continent?: string | null,
  country?: string | null,
  state?: string | null,
  city?: string | null,
  page: number = 1,
  itemsPerPage: number = 12
) => {
  const [tours, setTours] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let filter = continent || country || state || city;
    if (!filter) {
      setTours([]);
      setTotalPages(1);
      return;
    }
    setLoading(true);
    fetch(
      `http://localhost:8080/api/productos/toursbyfilter?continent=${encodeURIComponent(
        continent ?? ""
      )}&country=${encodeURIComponent(
        country ?? ""
      )}&state=${encodeURIComponent(state ?? "")}&city=${encodeURIComponent(
        city ?? ""
      )}&page=${page}&itemsPerPage=${itemsPerPage}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((data) => {
        setTours(data.tours || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => {
        setTours([]);
        setTotalPages(1);
        setLoading(false);
      });
  }, [continent, country, state, city, page, itemsPerPage]);

  return { tours, totalPages, loading };
};
