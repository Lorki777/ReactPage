import React, { useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ResponsivePagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/classic.css";
import "./CardsWithPagination.css";
import tiktokimage from "../CardsCarrusel/tiktok.png";
import { FaBolt } from "react-icons/fa";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {
  dropEllipsis,
  dropNav,
  combine,
} from "react-responsive-pagination/narrowBehaviour";
import { FaClock } from "react-icons/fa";
import FilterSidebar from "../FilterSidebar/FilterSidebar";
import { useProductosPagination, useFilteredTours, fmtMXN } from "../Hook";

const CardsWithPagination: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { Type, Param } = useParams<{ Type: string; Param: string }>();
  const isFilteredRoute = location.pathname === "/Filtered";

  // Parseamos filtros y página de la URL cada render
  const qp = new URLSearchParams(location.search);
  const sidebarFilters: Record<string, string> = {};
  qp.forEach((value, key) => {
    if (key !== "page") sidebarFilters[key] = value;
  });
  const pageParam = parseInt(qp.get("page") ?? "1", 10);

  // Hooks de datos
  const {
    productos,
    currentPage: pageNormal,
    totalPages: totalNormal,
    handleCardClick,
    handlePageChange: handlePageChangeNormal,
  } = useProductosPagination(Type, Param);

  const {
    filteredTours,
    filtersApplied,
    applyFilters,
    isLoading,
    error: filterError,
    totalPages: totalFilter,
    currentPage: pageFilter,
    handlePageChange: handlePageChangeFilter,
  } = useFilteredTours();

  // Efecto: aplicar filtros o cambiar página en el hook
  const prevQueryRef = useRef<string>("");
  useEffect(() => {
    if (!isFilteredRoute) return;

    const qsNoPage = new URLSearchParams(sidebarFilters).toString();

    if (qsNoPage !== prevQueryRef.current) {
      applyFilters(sidebarFilters, pageParam);
      prevQueryRef.current = qsNoPage;
    } else if (pageFilter !== pageParam) {
      handlePageChangeFilter(pageParam);
    }
  }, [
    isFilteredRoute,
    sidebarFilters,
    pageParam,
    applyFilters,
    pageFilter,
    handlePageChangeFilter,
  ]);

  // Función que pasa al sidebar para navegar
  const handleApplyFilters = (filtros: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => params.set(k, v));
    params.set("page", "1");
    navigate(`/Filtered?${params.toString()}`);
  };

  // Data para render
  const toursToRender =
    isFilteredRoute && filtersApplied ? filteredTours : productos;
  const renderError = isFilteredRoute ? filterError : null;
  const renderLoading = isFilteredRoute && isLoading;
  const renderTotalPages = isFilteredRoute ? totalFilter : totalNormal;
  const renderCurrentPage = isFilteredRoute ? pageFilter : pageNormal;
  const onPageChange = isFilteredRoute
    ? (p: number) => {
        const qp2 = new URLSearchParams(location.search);
        qp2.set("page", String(p));
        navigate(`/Filtered?${qp2.toString()}`);
      }
    : handlePageChangeNormal;

  return (
    <>
      <Header />

      <div className="cards-container">
        {/*  SIDEBAR */}
        <aside className={`sidebar `}>
          <FilterSidebar
            initialFilters={sidebarFilters}
            onApplyFilters={handleApplyFilters}
          />
        </aside>
        <div className="cards-pagination">
          {renderLoading ? (
            <p>No se encontraron resultados para tu búsqueda</p>
          ) : renderError ? (
            <p style={{ color: "red" }}>{renderError}</p>
          ) : (
            toursToRender.map((producto) => (
              <div
                key={producto.tour_slug}
                className="card"
                onClick={() => handleCardClick(producto.tour_slug)}
              >
                {producto.tour_badge_name && (
                  <span className="promo">{producto.tour_badge_name}</span>
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
                    {producto.tour_duration} Días
                  </div>
                </div>
              </div>
            ))
          )}
          <div className="centerpaginationcardsn">
            {renderTotalPages > 1 && (
              <ResponsivePagination
                current={renderCurrentPage}
                total={renderTotalPages}
                onPageChange={onPageChange}
                className="paginationCards"
                previousLabel="Previous"
                nextLabel="Next"
                pageItemClassName="my-item"
                pageLinkClassName="my-link"
                activeItemClassName="my-active"
                disabledItemClassName="my-disabled"
                navClassName="my-nav"
                previousClassName="previous-justified"
                nextClassName="next-justified"
                narrowBehaviour={combine(dropNav, dropEllipsis)}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CardsWithPagination;
