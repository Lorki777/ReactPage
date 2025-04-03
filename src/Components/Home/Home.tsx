import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import CardsCarrusel from "../CardsCarrusel/CardsCarrusel";
import "./Home.css";
import Inicioimg from "./inicio.webp";
import Asia from "./ASIA.webp";
import Europa from "./EUROPA.webp";
import Latinoamerica from "./LATINOAMERICA.webp";
import Mexico from "./MEXICO.webp";
import Norteamerica from "./NUEVAYORK.webp";
import PlayasMexico from "./PLAYASMEXICO.webp";
import Icono1 from "./Recurso-1.svg";
import Icono2 from "./Recurso-2.svg";
import Icono3 from "./Recurso-3.svg";
import IconoTodosLosTours from "./TODOS LOS TOURS.svg";
import { Helmet as HelmetReact } from "react-helmet-async";
import FacebookPagePlugin from "../Facebook/FacebookPagePlugin";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMinMaxProducts } from "../Hook";
import "rc-slider/assets/index.css";
import "rc-slider/assets/index.css";
import Slider from "rc-slider";

const continentes = [
  { nombre: "Europa", tours: 7, imagen: Europa, area: "europa" },
  { nombre: "Asia", tours: 0, imagen: Asia, area: "asia" },
  {
    nombre: "Latinoamérica",
    tours: 3,
    imagen: Latinoamerica,
    area: "latinoamerica",
  },
  { nombre: "México", tours: 40, imagen: Mexico, area: "mexico" },
  {
    nombre: "Playas de México",
    tours: 15,
    imagen: PlayasMexico,
    area: "playasdemexico",
  },
  {
    nombre: "Norteamérica",
    tours: 4,
    imagen: Norteamerica,
    area: "norteamerica",
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  // Estados para controlar apertura/cierre de cada dropdown
  const [openDestination, setOpenDestination] = useState(false);
  const [openActivities, setOpenActivities] = useState(false);
  const [openDuration, setOpenDuration] = useState(false);
  const [openBudget, setOpenBudget] = useState(false);
  const MinMaxProductsData = useMinMaxProducts();

  // Estado para almacenar la selección actual
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");

  const minmaxminprecio =
    Math.floor((MinMaxProductsData.minmaxproducts?.minprecio || 0) / 100) * 100;
  const minmaxmaxprecio = MinMaxProductsData.minmaxproducts?.maxprecio;
  const minmaxminduracion = MinMaxProductsData.minmaxproducts?.mindias;
  const minmaxmaxduracion = MinMaxProductsData.minmaxproducts?.maxdias;

  // Para sliders
  const [duration, setDuration] = useState<[number, number]>([
    minmaxminduracion || 0,
    minmaxmaxduracion || 10,
  ]);

  const [budget, setBudget] = useState<[number, number]>([
    minmaxminprecio || 100,
    minmaxmaxprecio || 16000,
  ]);

  // Opciones de destinos (ejemplo)
  const destinationOptions = [
    { value: "", label: "Destinos" },
    { value: "mexico", label: "México" },
    { value: "peru", label: "Perú" },
    { value: "colombia", label: "Colombia" },
    { value: "espana", label: "España" },
  ];

  // Opciones de actividades (ejemplo)
  const activitiesOptions = [
    { value: "", label: "Actividades" },
    { value: "hiking", label: "Hiking" },
    { value: "hot_air_balloon", label: "Hot Air Balloon" },
    { value: "jungle_safari", label: "Jungle Safari" },
    { value: "paragliding", label: "Paragliding" },
    { value: "peak_climbing", label: "Peak Climbing" },
    { value: "scuba_diving", label: "Scuba Diving" },
    { value: "sightseeing", label: "Sightseeing" },
    { value: "travel", label: "Travel" },
  ];

  // Manejadores para sliders

  const handleSelecDestination = (value: string) => {
    setSelectedDestination(value);
    setOpenDestination(false);
  };

  // Manejo de selección de actividad
  const handleSelectActivity = (value: string) => {
    setSelectedActivity(value);
    setOpenActivities(false);
  };

  // Navegación cuando seleccionamos un destino
  const handleDestinationClick = (area: string) => {
    navigate(`/AvailableTours/${area}`);
  };

  // Dentro del componente Home
  React.useEffect(() => {
    if (minmaxminduracion && minmaxmaxduracion) {
      setDuration([minmaxminduracion, minmaxmaxduracion]);
    }
    if (minmaxminprecio && minmaxmaxprecio) {
      setBudget([minmaxminprecio, minmaxmaxprecio]);
    }
  }, [minmaxminduracion, minmaxmaxduracion, minmaxminprecio, minmaxmaxprecio]);

  return (
    <>
      <HelmetReact>
        {/* Meta etiquetas dinámicas */}
        <title>Tours</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Toursland" />
        <meta
          name="copyright"
          content="© Toursland. Todos los derechos reservados."
        />
        <meta name="description" content="" />
        <meta name="keywords" content="" />
        <link rel="canonical" href="" />
        <meta name="robots" content="" />

        {/* Meta etiquetas dinámicas para redes sociales */}
        <meta property="og:title" content="" />
        <meta property="og:description" content="" />
        <meta property="og:image" content="" />
        <meta property="og:url" content="" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Toursland" />
        <meta property="og:image:alt" content="Descripción de la imagen" />
      </HelmetReact>
      <Header />

      <div className="homeheader">
        <img
          loading="lazy"
          src={Inicioimg}
          alt="Imagen de inicio"
          width="1920"
          height="1080"
        />
      </div>

      <div className="search-bar-container">
        <div className="search-bar">
          {/* ======= Destination (Dropdown personalizado) ======= */}
          <div className="dropdown-container">
            <div
              className="dropdown-header"
              onClick={() => {
                setOpenDestination(!openDestination);
                setOpenActivities(false);
                setOpenDuration(false);
                setOpenBudget(false);
              }}
            >
              <i
                className="fa fa-map-marker-alt dropdown-icon"
                aria-hidden="true"
              />
              <span className="dropdown-title">
                {destinationOptions.find(
                  (opt) => opt.value === selectedDestination
                )?.label || "Seleccione Destination"}{" "}
                <span className="arrow-symbol">
                  {openDestination ? "▲" : "▼"}
                </span>
              </span>
              <i
                className={`fa fa-chevron-down dropdown-arrow ${
                  openDestination ? "open" : ""
                }`}
                aria-hidden="true"
              />
            </div>

            {openDestination && (
              <ul className="dropdown-menu">
                {destinationOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelecDestination(option.value)}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ======= Activities (Dropdown personalizado) ======= */}
          <div className="dropdown-container">
            <div
              className="dropdown-header"
              onClick={() => {
                setOpenActivities(!openActivities);
                setOpenDestination(false);
                setOpenDuration(false);
                setOpenBudget(false);
              }}
            >
              <i className="fa fa-hiking dropdown-icon" aria-hidden="true" />
              <span className="dropdown-title">
                {activitiesOptions.find((opt) => opt.value === selectedActivity)
                  ?.label || "Seleccione Activities"}{" "}
                <span className="arrow-symbol">
                  {openActivities ? "▲" : "▼"}
                </span>
              </span>
              <i
                className={`fa fa-chevron-down dropdown-arrow ${
                  openActivities ? "open" : ""
                }`}
                aria-hidden="true"
              />
            </div>

            {openActivities && (
              <ul className="dropdown-menu">
                {activitiesOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelectActivity(option.value)}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ======= Duration (Range slider doble) ======= */}
          <div className="dropdown-container">
            <div
              className="dropdown-header"
              onClick={() => {
                setOpenDuration(!openDuration);
                setOpenDestination(false);
                setOpenActivities(false);
                setOpenBudget(false);
              }}
            >
              <i className="fa fa-calendar-alt dropdown-icon" />
              <span className="dropdown-title">
                {`${duration[0]} - ${duration[1]} Días`}
                <span className="arrow-symbol">{openDuration ? "▲" : "▼"}</span>
              </span>
            </div>

            {openDuration && (
              <div className="dropdown-body range-dropdown">
                <Slider
                  range
                  min={minmaxminduracion}
                  max={minmaxmaxduracion}
                  value={duration}
                  onChange={(value) => {
                    if (Array.isArray(value) && value.length === 2) {
                      setDuration([value[0], value[1]]);
                    }
                  }}
                />
                <div className="range-values">
                  <span>{duration[0]} Días</span>
                  <span>{duration[1]} Días</span>
                </div>
              </div>
            )}
          </div>

          {/* ======= Budget (Range slider doble) ======= */}
          <div className="dropdown-container">
            <div
              className="dropdown-header"
              onClick={() => {
                setOpenBudget(!openBudget);
                setOpenDestination(false);
                setOpenActivities(false);
                setOpenDuration(false);
              }}
            >
              <i className="fa fa-dollar-sign dropdown-icon" />
              <span className="dropdown-title">
                {`$${budget[0]} - $${budget[1]}`}
                <span className="arrow-symbol">{openBudget ? "▲" : "▼"}</span>
              </span>
            </div>

            {openBudget && (
              <div className="dropdown-body range-dropdown">
                <Slider
                  range
                  min={minmaxminprecio}
                  max={minmaxmaxprecio}
                  value={budget}
                  onChange={(value) => {
                    if (Array.isArray(value) && value.length === 2) {
                      setBudget([value[0], value[1]]);
                    }
                  }}
                  step={100}
                />
                <div className="range-values">
                  <span>${budget[0]}</span>
                  <span>${budget[1]}</span>
                </div>
              </div>
            )}
          </div>

          {/* Botón SEARCH */}
          <button className="search-button">Buscar</button>
        </div>

        <div className="info-section">
          <div className="info-item">
            <div className="icon-placeholder">
              <img
                loading="lazy"
                src={Icono3}
                alt="Icono destino"
                width="40"
                height="40"
              />
            </div>
            <div>
              <h3>
                DESTINO,
                <span className="azuloscuro-placeholder"> EL MUNDO</span>
              </h3>
              <p>Contamos con un gran catálogo de sitios escogidos para ti</p>
            </div>
          </div>
          <div className="info-item">
            <div className="icon-placeholder">
              <img
                loading="lazy"
                src={Icono2}
                alt="Icono precios"
                width="40"
                height="40"
              />
            </div>
            <div>
              <h3>
                LOS <span className="azuloscuro-placeholder">MEJORES</span>{" "}
                PRECIOS
              </h3>
              <p>Descuentos y promociones todas las semanas</p>
            </div>
          </div>
          <div className="info-item">
            <div className="icon-placeholder">
              <img
                loading="lazy"
                src={Icono1}
                alt="Icono servicio"
                width="40"
                height="40"
              />
            </div>
            <div>
              <h3>
                SERVICIO{" "}
                <span className="azuloscuro-placeholder">PERSONALIZADO</span>
              </h3>
              <p>Tenemos un plan para cada uno de nuestros clientes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="divisiongeneralhomesecciones">
        <div className="TodosTours">
          <h2>&#128205;Ofertas de viajes</h2>
          <img
            loading="lazy"
            src={IconoTodosLosTours}
            alt="Icono de todos los tours"
            style={{
              maxWidth: "240px",
              minWidth: "100px",
              width: "100%",
              maxHeight: "50px",
              minHeight: "25px",
              height: "auto",
            }}
          />
        </div>

        <CardsCarrusel filter="ofertas" />
      </div>
      <hr />
      <div className="divisiongeneralhomesecciones">
        <div className="TodosTours">
          <h2>&#128205;Mejores destinos para viajar</h2>
          <img
            loading="lazy"
            src={IconoTodosLosTours}
            alt="Icono de todos los tours"
            width="240"
            height="50"
          />
        </div>

        <div className="Continentes-container">
          {continentes.map((continente) => (
            <div
              key={continente.nombre}
              className={`Continentes-card ${continente.area}`}
              style={{ backgroundImage: `url(${continente.imagen})` }}
              onClick={() => handleDestinationClick(continente.area)}
            >
              <div className="Continentes-name">
                <h3>{continente.nombre}</h3>
                <p className="Continentes-tours-vertodo">
                  Ver todos los tours
                </p>{" "}
              </div>
              <div className="Continentes-content">
                <p className="Continentes-tours">{continente.tours} tours</p>
              </div>
            </div>
          ))}
        </div>

        <CardsCarrusel filter="mejoresdestinos" />
      </div>

      <hr />

      <h2>Galería de fotos</h2>

      <div id="ptw-container" className="ptw-menu-vertical">
        <script
          type="text/javascript"
          src="https://widgets.priceres.com.mx/travel-agencyweb/jsonpBooker/startWidget?container=ptw-container&UseConfigs=false&WhiteLabelId=toursland-agency"
        ></script>
      </div>

      <FacebookPagePlugin />

      <Footer />
    </>
  );
};

export default Home;
