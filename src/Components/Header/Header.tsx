import "./Header.css";
import logo from "./Logo-Rec-3.png";
import facebookIcon from "./facebook.svg";
import whatsappIcon from "./telefono.svg";
import telefonoIcon from "./telefono.svg";
import tiktokIcon from "./tiktok.png";
import mailIcon from "./mail.svg";
import { NavLink } from "react-router-dom";

const links = [
  { path: "/", label: "INICIO" },
  { path: "/Paquetes", label: "PAQUETES" },
  { path: "/Tours", label: "TOURS" },
  { path: "/Grupales", label: "GRUPALES" },
  { path: "/Blog", label: "BLOG" },
  { path: "/Conocenos", label: "CONÓCENOS" },
  { path: "/Expertos", label: "EXPERTOS" },
];

const Header = () => {
  return (
    <header className="header">
      <div className="top-bar">
        <div className="contact-info">
          <span>
            <img src={telefonoIcon} alt="Facebook" /> 833-334-40-42
          </span>
          <span>
            <img src={mailIcon} alt="Facebook" /> contacto@toursland.mx
          </span>
          <span>Síguenos</span>
          {/* Iconos de redes sociales */}
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
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
