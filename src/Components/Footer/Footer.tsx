import "./Footer.css";
import telefononegro from "./tel2.svg";
import mailIcon from "./mail.svg";
import LogoSectur from "./sectur.svg";
import ExtraPage from "../Extra/Extra";

const Footer = () => {
  return (
    <>
      <ExtraPage />
      <footer className="footer">
        <div className="footer-section">
          <h3>Llámanos</h3>
          <span>
            <img src={telefononegro} alt="Contact" /> 833-334-40-42
          </span>
          <h3>Correo</h3>
          <p>
            Viajero, tienes una duda, queja o sugerencia, escríbenos al:
            <br />
            <span>
              <img src={mailIcon} alt="Facebook" /> contacto@toursland.mx
            </span>
          </p>
        </div>
        <div className="footer-section">
          <h3>Acerca de nosotros</h3>
          <ul>
            <li>Nuestra historia</li>
            <li>Blogs & Viajes</li>
            <li>Trabaja con nosotros</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Legales</h3>
          <ul>
            <li>Aviso de privacidad</li>
            <li>Términos y Condiciones</li>
            <li>Facturación</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Paga seguro</h3>
          <p>
            Todos los pagos en nuestra web están encriptados y son emitidos con
            seguridad reforzada mediante un protocolo SSL.
          </p>
          <div className="footer-secure">
            <img src={LogoSectur} alt="Sectur" />
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
