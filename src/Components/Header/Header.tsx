import "./Header.css";
import logo from "./Logo-Rec-3.png";
import facebookIcon from "./facebook.svg";
import whatsappIcon from "./telefono.svg";
import telefonoIcon from "./telefono.svg";
import tiktokIcon from "./tiktok.png";
import mailIcon from "./mail.svg";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { MegaMenu } from "primereact/megamenu";
import { useLocation } from "react-router-dom";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useMegaMenuData } from "../Hook";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const location = useLocation();
  const [isMegaMenuOpen2, setIsMegaMenuOpen2] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("PAQUETES");
  const navigate = useNavigate();

  // Obtener datos de la API para el MegaMenu
  const { items: paquetes } = useMegaMenuData("activity");
  const { items: tours } = useMegaMenuData("tour");
  const { items: grupales } = useMegaMenuData("grupal");

  useEffect(() => {
    if (location.pathname.includes("/PAQUETES")) {
      setActiveCategory("PAQUETES");
    } else if (location.pathname.includes("/TOURS")) {
      setActiveCategory("TOURS");
    } else if (location.pathname.includes("/GRUPALES")) {
      setActiveCategory("GRUPALES");
    }
  }, [location.pathname]);

  return (
    <header className="header">
      {/* Barra superior con datos de contacto */}
      <div className="top-bar">
        <div className="contact-info">
          <span>
            <img src={telefonoIcon} alt="Teléfono" /> 833-334-40-42
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

        <nav className="nav-menu">
          <div className="nav-menu-flex">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              INICIO
            </NavLink>

            {/* MegaMenu "LUGARES QUE VER" */}
            <div
              className="megamenu-container2"
              onMouseEnter={() => setIsMegaMenuOpen2(true)}
              onMouseLeave={() => setIsMegaMenuOpen2(false)}
            >
              <MegaMenu
                model={[{ label: "LUGARES QUE VER" }]}
                orientation="horizontal"
                className="custom-megamenu2"
              />
              {isMegaMenuOpen2 && (
                <div className="megamenu-content2">
                  {/* Columna izquierda (categorías) */}
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
                  {/* Columna derecha (productos dinámicos desde la API) */}
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
                            `/tours/${encodeURIComponent(item.TourSlug)}`
                          )
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <img src={item.OgImage} alt={""} />
                        <span>{item.TourName}</span>
                      </div>
                    ))}
                  </div>
                  ;
                </div>
              )}
            </div>

            <NavLink
              to="/Blog"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              BLOG
            </NavLink>

            {/* Mega menú "SOBRE NOSOTROS" */}
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
    </header>
  );
};

export default Header;
