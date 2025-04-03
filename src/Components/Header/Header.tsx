import "./Header.css";
import logo from "./Logo-Rec-3.png";
import facebookIcon from "./facebook.svg";
import whatsappIcon from "./telefono.svg";
import telefonoIcon from "./telefono.svg";
import tiktokIcon from "./tiktok.png";
import mailIcon from "./mail.svg";
import { NavLink } from "react-router-dom";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { MegaMenu } from "primereact/megamenu";
import { useLocation } from "react-router-dom";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useMegaMenuData } from "../Hook";
import { useNavigate } from "react-router-dom";
import IconoTodosLosTours from "./TODOS LOS TOURS.svg";

const Header = () => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMegaMenuOpen2, setIsMegaMenuOpen2] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("PAQUETES");

  const [showMobileMenu, setShowMobileMenu] = useState(false); // <--- NUEVO ESTADO

  const location = useLocation();
  const navigate = useNavigate();

  // Obtener datos de la API
  const { items: paquetes } = useMegaMenuData("package");
  const { items: tours } = useMegaMenuData("activity");
  const { items: grupales } = useMegaMenuData("group");

  // Actualizar categoría activa según la ruta
  useEffect(() => {
    if (location.pathname.includes("/PAQUETES")) {
      setActiveCategory("PAQUETES");
    } else if (location.pathname.includes("/TOURS")) {
      setActiveCategory("TOURS");
    } else if (location.pathname.includes("/GRUPALES")) {
      setActiveCategory("GRUPALES");
    }
  }, [location.pathname]);

  // Referencia para posicionar el Megamenu 2
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState<number>(0);

  const recalcOffset = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOffset(rect.left);
    }
  };

  function widthScrollbar(): number {
    const div = document.createElement("div");
    div.style.overflow = "scroll";
    div.style.width = "100px";
    div.style.height = "100px";
    div.style.position = "absolute";
    div.style.top = "-9999px";
    document.body.appendChild(div);
    const scrollbarWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return scrollbarWidth;
  }

  const scrollbarWidth = widthScrollbar();

  useLayoutEffect(() => {
    recalcOffset();
    window.addEventListener("load", recalcOffset);
    return () => window.removeEventListener("load", recalcOffset);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      recalcOffset();
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => recalcOffset();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="header">
      {/* Barra superior */}
      <div className="top-bar">
        <div className="contact-info">
          <span>
            <img src={telefonoIcon} alt="Teléfono" /> 833-334-4042
          </span>
          <span>
            <img src={mailIcon} alt="Correo" /> contacto@toursland.mx
          </span>
          <span>Síguenos</span>
          <span>
            <img src={facebookIcon} alt="Facebook" />
          </span>
          <span>
            <img src={whatsappIcon} alt="WhatsApp" />
          </span>
          <span>
            <img src={tiktokIcon} alt="TikTok" />
          </span>
        </div>
        <div className="auth-buttons">
          <button className="btn-login">Iniciar sesión</button>
          <button className="btn-register">Registrarse</button>
        </div>
      </div>
      <hr />

      {/* Barra con logo y menú principal */}
      <div className="logo-bar">
        <div className="logo">
          <img src={logo} alt="ToursLand Logo" />
        </div>

        {/* Ícono de menú hamburguesa (SOLO SE MUESTRA EN MÓVIL) */}
        <div
          className="hamburger-icon"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {/* Usamos PrimeIcons para el ícono, o podría ser cualquier SVG */}
          <i className="pi pi-bars" style={{ fontSize: "1.5rem" }} />
        </div>

        {/* Menú normal (DESKTOP) */}
        <nav className="nav-menu">
          <div className="nav-menu-flex">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              INICIO
            </NavLink>

            {/* MegaMenu LUGARES QUE VER */}
            <div
              className="megamenu-container2"
              ref={containerRef}
              onMouseEnter={() => setIsMegaMenuOpen2(true)}
              onMouseLeave={() => setIsMegaMenuOpen2(false)}
            >
              <MegaMenu
                model={[
                  {
                    label: "LUGARES QUE VER",
                    template: (item) => {
                      return (
                        <span className="custom-megamenu2">{item.label}</span>
                      );
                    },
                  },
                ]}
              />
              {isMegaMenuOpen2 && (
                <div
                  className="megamenu-content2"
                  style={{
                    left: `-${offset}px`,
                    width: `calc(100vw - ${scrollbarWidth}px)`,
                  }}
                >
                  <div className="megamenu-left2">
                    {["PAQUETES", "TOURS", "GRUPALES"].map((category) => (
                      <NavLink
                        key={category}
                        to={`/${category}`}
                        className={`menu-category2 ${
                          activeCategory === category ? "active" : ""
                        }`}
                        onMouseEnter={() => setActiveCategory(category)}
                      >
                        <input
                          type="radio"
                          checked={activeCategory === category}
                          readOnly
                        />
                        {category}
                      </NavLink>
                    ))}
                  </div>
                  <div className="megamenu-right2">
                    {(activeCategory === "PAQUETES"
                      ? paquetes
                      : activeCategory === "TOURS"
                      ? tours
                      : grupales
                    ).map((item) => (
                      <div
                        key={item.TourSlug}
                        className="attraction-item"
                        onClick={() =>
                          navigate(
                            `/Productos/${encodeURIComponent(item.TourSlug)}`
                          )
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <img src={tiktokIcon} alt="" />
                        <span>{item.TourName}</span>
                      </div>
                    ))}
                    <NavLink
                      to={
                        activeCategory === "PAQUETES"
                          ? "/PAQUETES"
                          : activeCategory === "TOURS"
                          ? "/TOURS"
                          : "/GRUPALES"
                      }
                    >
                      <img
                        loading="lazy"
                        src={IconoTodosLosTours}
                        alt="Icono de todos los tours"
                        className="attraction-item"
                        style={{
                          maxWidth: "240px",
                          minWidth: "100px",
                          width: "100%",
                          maxHeight: "50px",
                          minHeight: "25px",
                          height: "auto",
                          cursor: "pointer",
                        }}
                      />
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/Blog"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              BLOG
            </NavLink>

            {/* Mega menú SOBRE NOSOTROS */}
            <div
              className="mega-menu-container"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <span className="mega-menu-trigger">SOBRE NOSOTROS</span>
              {isMegaMenuOpen && (
                <div className="mega-menu">
                  <NavLink to="/Conocenos" className="mega-menu-item">
                    CONÓCENOS
                  </NavLink>
                  <NavLink to="/Expertos" className="mega-menu-item">
                    EXPERTOS
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Menú móvil (SOLO SE MUESTRA EN PANTALLAS PEQUEÑAS) */}
      <div className={`mobile-menu ${showMobileMenu ? "open" : ""}`}>
        <NavLink
          to="/"
          onClick={() => setShowMobileMenu(false)}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          INICIO
        </NavLink>

        {/* Sección LUGARES QUE VER con submenú anidado (opcional) */}
        <div className="mobile-submenu">
          <span className="mobile-submenu-title">LUGARES QUE VER</span>
          <div className="mobile-submenu-items">
            {["PAQUETES", "TOURS", "GRUPALES"].map((category) => (
              <NavLink
                key={category}
                to={`/${category}`}
                onClick={() => setShowMobileMenu(false)}
              >
                {category}
              </NavLink>
            ))}
            <NavLink
              to="/Blog"
              onClick={() => setShowMobileMenu(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              BLOG
            </NavLink>
          </div>
        </div>

        <div className="mobile-submenu">
          <span className="mobile-submenu-title">SOBRE NOSOTROS</span>
          <div className="mobile-submenu-items">
            <NavLink to="/Conocenos" onClick={() => setShowMobileMenu(false)}>
              CONÓCENOS
            </NavLink>
            <NavLink to="/Expertos" onClick={() => setShowMobileMenu(false)}>
              EXPERTOS
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
