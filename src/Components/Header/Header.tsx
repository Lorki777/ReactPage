import "./Header.css";
import logo from "./Logo-Rec-3.png";
import facebookIcon from "./facebook.svg";
import whatsappIcon from "./telefono.svg";
import telefonoIcon from "./telefono.svg";
import tiktokIcon from "./tiktok.png";
import mailIcon from "./mail.svg";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { MegaMenu } from "primereact/megamenu";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

interface Attraction {
  label: string;
  icon: string;
}

const links = [
  { path: "/", label: "INICIO" },
  { path: "/Paquetes", label: "PAQUETES" },
  { path: "/Tours", label: "TOURS" },
  { path: "/Grupales", label: "GRUPALES" },
  { path: "/Blog", label: "BLOG" },
];

const categories: Record<string, Attraction[]> = {
  "Mejores atracciones": [
    { label: "Castillo de Chenonceau", icon: "pi pi-image" },
    { label: "Castillo de Amboise", icon: "pi pi-image" },
    { label: "Catedral de Tours", icon: "pi pi-image" },
    { label: "Castillo de Langeais", icon: "pi pi-map-marker" },
    { label: "Castillo de l'Islette", icon: "pi pi-map-marker" },
    { label: "Castillo de Chenonceau2", icon: "pi pi-image" },
    { label: "Castillo de Amboise2", icon: "pi pi-image" },
    { label: "Catedral de Tours2", icon: "pi pi-image" },
    { label: "Castillo de Langeais2", icon: "pi pi-map-marker" },
    { label: "Castillo de l'Islette2", icon: "pi pi-map-marker" },
  ],
  "Tipos de atracciones": [
    { label: "Tours por palacios y castillos", icon: "pi pi-compass" },
    { label: "Patrimonio de la UNESCO", icon: "pi pi-globe" },
    { label: "Museos y exposiciones", icon: "pi pi-building" },
    { label: "Excursiones de varios días", icon: "pi pi-calendar" },
  ],
};

const Header = () => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string>(
    "Mejores atracciones"
  );

  const items2 = [
    {
      label: "LUGARES QUE VER",
    },
  ];

  const items = [
    {
      label: "Lugares que ver",
      items: [
        {
          label: "Mejores atracciones",
          command: () => setActiveCategory("Mejores atracciones"),
        },
        {
          label: "Tipos de atracciones",
          command: () => setActiveCategory("Tipos de atracciones"),
        },
      ],
    },
  ];

  return (
    <header className="header">
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
      <div className="logo-bar">
        <div className="logo">
          <img src={logo} alt="ToursLand Logo" />
        </div>
        <nav className="nav-menu">
          <div className="nav-menu-flex">
            <div
              className="megamenu-container2"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <MegaMenu
                model={items2}
                orientation="horizontal"
                className="custom-megamenu2"
              />
              {isMegaMenuOpen && (
                <div className="megamenu-content2">
                  <div className="megamenu-left2">
                    {items[0].items.map((item) => (
                      <div
                        key={item.label}
                        className={`menu-category2 ${
                          activeCategory === item.label ? "active" : ""
                        }`}
                        onMouseEnter={() => setActiveCategory(item.label)}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                  <div className="megamenu-right2">
                    {categories[activeCategory]?.map((attraction) => (
                      <div key={attraction.label} className="attraction-item">
                        <i className={attraction.icon}></i> {attraction.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {link.label}
              </NavLink>
            ))}
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
