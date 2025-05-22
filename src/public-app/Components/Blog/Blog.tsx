import React from "react";
import "./Blog.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet as HelmetReact } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import ResponsivePagination from "react-responsive-pagination";
import { useBlogsPagination, useRecentBlogs } from "../Hook";
import Anuncio from "./ANUNCIOS-02.webp";
import Diamante from "./diamante.svg";
import ToursLandLogo from "./ToursLand-Logo.png";
import {
  dropEllipsis,
  dropNav,
  combine,
} from "react-responsive-pagination/narrowBehaviour";

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const {
    blogs,
    currentPage,
    totalPages,
    handlePageChange,
    error: pageError,
  } = useBlogsPagination();
  const { recent, error: recentError } = useRecentBlogs();

  return (
    <>
      <HelmetReact>
        <title>TourStories</title>
      </HelmetReact>
      <Header />

      <div className="PortadaBlog">
        <h3>TourStories</h3>
      </div>

      <div className="experienciablog">
        {/* ── SIDEBAR IZQUIERDO ───────────────── */}
        <div className="experienciablog1">
          {/* Buscador (puedes integrarlo con lógica más adelante) */}
          <div className="barra-busqueda-blog">
            <input
              type="text"
              placeholder="Buscar"
              className="input-busqueda-blog"
            />
            <button className="boton-busqueda-blog">BUSCAR</button>
          </div>
          <div className="ConoceTourStories">
            <h2>CONÓCE TOURSTORIES</h2>
            <p>Noticias y consejos del mundo de los viajes.</p>
          </div>
          <div className="PostsRec">
            <h2>POSTS RECIENTES</h2>
            {recentError && <p>Error al cargar recientes</p>}
            <ul>
              {recent.map((b) => (
                <li key={b.blog_id}>
                  <a
                    className="containerBlogRecomendations"
                    onClick={() => navigate(`/blog/${b.blog_id}`)}
                  >
                    <div className="imageBlogRecomendations">
                      <img src={b.blog_featured_image} alt={b.title} />
                    </div>
                    {b.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── LISTADO CENTRAL ───────────────────── */}
        <div className="experienciablog2">
          {pageError && <p style={{ color: "red" }}>Error al cargar blogs</p>}
          {blogs.map((b) => (
            <div
              key={b.blog_id}
              className="cardBlog"
              onClick={() => navigate(`/blog/${b.blog_id}`)}
            >
              <div className="imagenBlog">
                <img src={b.blog_featured_image} alt={b.title} />
              </div>
              <div className="contentBlog">
                <span className="titleBlog">{b.title}</span>
                <p className="descBlog">{b.blog_description}</p>
                <button
                  className="actionBlog"
                  onClick={(e) => {
                    e.stopPropagation(); // evita que llegue al div padre
                    navigate(`/blog/${b.blog_id}`);
                  }}
                >
                  Leer Más <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          ))}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="centerpaginationcardsn">
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
            </div>
          )}
        </div>
        <div className="Canal-Whats" /*Apartado Canal Whats*/>
          <div className="Img-Canal-Whats">
            <img src={Anuncio} alt="" />
          </div>
          <div className="Unete-Canal">
            <h3>¿Quieres recibir ofertas?</h3>
            <h2>¡Únete a nuestro canal de WhatsApp!</h2>
            <img src={Diamante} alt="" />
            <button className="Boton-Canal">Únete aquí al canal</button>
            <div className="LogoToursLandCanal">
              <img src={ToursLandLogo} alt="" />
            </div>
          </div>
          {/* ── SIDEBAR DERECHO ───────────────────── */}
          <div className="experienciablog3">
            <h3>TOURSLAND</h3>
            <p>Entérate de lo más reciente en viajes.</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Blog;
