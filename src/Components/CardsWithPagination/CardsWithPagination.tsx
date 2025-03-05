import React from "react";
import ResponsivePagination from "react-responsive-pagination";
import "./CardsWithPagination.css";
import { useParams } from "react-router-dom";
import "react-responsive-pagination/themes/classic.css";
import tiktokimage from "../CardsCarrusel/tiktok.png";
import {
  dropEllipsis,
  dropNav,
  combine,
} from "react-responsive-pagination/narrowBehaviour";
import { useProductosPagination } from "../Hook";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";

const CardsCarrusel: React.FC = () => {
  const { Type, Param } = useParams();
  const {
    productos,
    currentPage,
    totalPages,
    handleCardClick,
    handlePageChange,
  } = useProductosPagination(Type, Param);

  return (
    <>
      <Header />
      <div className="tourspaginationheader">
        <h1>
          {Type === "Paquetes" && `${Param}`}
          {Type === "AvailableTours" && `${Param}`}
        </h1>
      </div>
      <div className="cards-pagination">
        {/* Renderizar las tarjetas */}
        {productos.map((producto) => (
          <div
            key={producto.TourSlug}
            className="card"
            onClick={() => handleCardClick(producto.TourSlug)}
          >
            <span className="promo">PROMO</span>
            <img src={tiktokimage} alt={producto.TourName} />
            <div className="card-content">
              <h3>{producto.TourName}</h3>
              <div className="price">{producto.TourPrice}</div>
              <div className="duration">{producto.TourDuration} Días</div>
            </div>
          </div>
        ))}
      </div>
      {/* Paginación */}
      {totalPages > 1 && (
        <ResponsivePagination
          current={currentPage}
          total={totalPages}
          onPageChange={handlePageChange}
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
      <Footer />
    </>
  );
};

export default CardsCarrusel;
