/**
 * @file Tours.tsx
 * @brief Component for displaying tour details.
 * @details This component fetches and displays detailed information about tours, including FAQs and images.
 */

import React, { useState, useEffect, useMemo } from "react";
import "./Tours.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "../../../../node_modules/swiper/swiper.css";
import "../../../../node_modules/swiper/swiper-bundle.min.css";
import "../../../../node_modules/swiper/modules/navigation.css";
import "../../../../node_modules/swiper/modules/pagination.css";
import placeHolderImg from "./placeholder-image.webp";
import placeHolderImg2 from "./placeholder-image2.webp";
import Iconoinicio from "./tours-land.svg";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet as HelmetReact } from "react-helmet-async";
import {
  useTourData,
  useSidebarLogic,
  formatDate,
  useFetchData,
  fmtMXN,
} from "../Hook";
import {
  FaCalendarAlt,
  FaPlane,
  FaUser,
  FaBolt,
  FaClock,
  FaHashtag,
  FaCheckCircle,
  FaMap,
  FaRegImage,
  FaBus,
  FaMapMarkerAlt,
  FaRegFileAlt,
  FaPlus,
  FaMinus,
  FaQuestionCircle,
} from "react-icons/fa";
import { IoPricetag } from "react-icons/io5";
import { useParams, useNavigate } from "react-router-dom";
import { FaqItem, FieldConfig, TourService } from "../Interfaces";
import CreatableSelect from "react-select/creatable";

/**
 * @brief FAQ data for the Tours page.
 * @details Contains questions and answers related to ToursLand services.
 */
const faqData: FaqItem[] = [
  {
    question: "¿Cuál es la ubicación de ToursLand?",
    answer: (
      <>
        <p>Nos encontramos dando servicio para ti en 3 ciudades:</p>
        <ul>
          <li>Ciudad de México</li>
          <li>Monterrey</li>
          <li>Tampico</li>
        </ul>
        <p>833-334-40-42</p>
        <p>
          Para podernos visitar en cualquiera de nuestras oficinas debes agendar
          una cita a cualquiera de nuestro teléfono oficial.
        </p>
      </>
    ),
  },
  {
    question: "¿Cuál es el horario de atención a clientes?",
    answer: (
      <>
        <p>Nuestro horario de atención es de Lunes a Viernes de 8 am a 11 pm</p>
        <p>Los fines de semana Sábado y Domingo de 8 am a 2 pm</p>
        <p>
          Cuando estás en un viaje la atención es personalizada y es de 24
          horas.
        </p>
      </>
    ),
  },
  {
    question: "¿Cuales son los WhatsApp oficiales donde pueda comunicarme?",
    answer: (
      <>
        <p>
          Aquí te dejamos nuestro único WhatsApp disponible y vigente, recuerda
          viajero que nunca te contactaremos de algún otro número que no sean
          nuestros teléfonos oficiales.
        </p>
        <p>833-334-40-42</p>
      </>
    ),
  },
  {
    question:
      "¿Realizan cotizaciones especiales como Luna de Miel, XVs y Empresariales?",
    answer: (
      <>
        <p>
          ¡Claro que sí! Manejamos cotizaciones grupales, empresariales,
          recomendamos las mejores lunas de miel y te ayudamos a vivir el sueño
          de los XVs.
        </p>
        <p>
          Todo es 100% organizado por ToursLand y te llevaremos de la mano a
          cualquier destino que quieras visitar. Solo escríbenos un WhatsApp o
          mándanos un correo a <strong>contacto@toursland.mx</strong> y con
          gusto te estaremos atendiendo.
        </p>
      </>
    ),
  },
  {
    question: "¿Cómo reservo mi viaje?",
    answer: (
      <>
        <p>
          Es muy fácil, solo es cuestión de que dentro de nuestro sitio web
          decidas cómo quieres reservarlo: por medio de transferencia, pago
          directamente en banco, o pago con tarjeta de crédito y débito.
        </p>
        <p>
          Una vez realizado el proceso, estaremos en contacto y te llegará a tu
          correo electrónico todo el contrato y los términos y condiciones que
          manejamos para confirmar tu viaje.
        </p>
        <p>¡Y listo, vámonos! Tu viaje ya se encuentra confirmado.</p>
        <p>
          Para cualquier duda comunícate a nuestro WhatsApp, con gusto te
          atenderemos.
        </p>
      </>
    ),
  },
  {
    question: "¿Con cuánto puedo reservar mi paquete?",
    answer: (
      <>
        <p>
          Puedes reservarlo desde el 10% del costo total de acuerdo al paquete
          que hayas elegido y liquidarlo 1 mes antes de tu salida.
        </p>
        <p>
          Es importante que siempre mantengas activa tu reserva con nuestro plan
          de pagos quincenales o mensuales; depende de cómo lo decidas.
        </p>
      </>
    ),
  },
  {
    question: "¿Hasta cuándo puedo pagar mi paquete de viaje?",
    answer: (
      <>
        <p>
          Deberás liquidarlo exactamente 30 días antes de tu salida y nosotros
          te estaremos enviando la finalidad de detalles de tu paquete de viaje,
          las mejores recomendaciones al llegar a tu destino y te acompañaremos
          en todo el viaje para que sea lo más fácil para ti.
        </p>
      </>
    ),
  },
  {
    question: "¿Cómo se manejan los Meses Sin Intereses?",
    answer: (
      <>
        <p>
          Manejamos 3, 6, 9, 12 y hasta 18 meses sin intereses; tú podrás elegir
          de acuerdo a la modalidad de tu tarjeta de banco al momento de pagar
          tu viaje dentro de nuestra plataforma.
        </p>
        <p>
          Si tienes dudas, comunícate directamente con nosotros; estaremos para
          asistirte en tu reserva mediante WhatsApp o línea telefónica.
        </p>
      </>
    ),
  },
  {
    question: "¿Cómo funciona el Invita a 20 amigos y viaja gratis?",
    answer: (
      <>
        <p>
          Es muy fácil, solo invita a 20 amigos, compañeros, familia, etc. Cada
          uno de ellos deberá dar el 30% de su reserva. Para iniciar el proceso,
          notifícanos a cualquiera de nuestros números de WhatsApp oficial para
          nosotros empezar a acompañarte en la reserva.
        </p>
        <p>
          Si son 20 personas, tu viaje es completamente gratis (solo tus gastos
          personales como comidas, cenas, souvenirs y propinas corren por tu
          cuenta).
        </p>
        <p>¡Éxito! 😀</p>
      </>
    ),
  },
];

const useTourAvailability = () => {
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

// Componente principal
const Tours: React.FC = () => {
  const navigate = useNavigate();
  const { product, titles, items, pointItinerary, openDay, setOpenDay } =
    useTourData();
  const { sidebarPosition, activeTab, handleTabClick } = useSidebarLogic();

  const [selectedTab, setSelectedTab] = useState<"reserva" | "cotizacion">(
    "reserva"
  );

  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  // Estado para los datos del formulario
  const [formData, setFormData] = useState<Record<string, string>>({
    date: "",
    departure: "",
    adults: "",
    children: "",
    schedule: "",
    quantity: "",
  });

  // Obtenemos la disponibilidad desde el backend
  const {
    salidaDesde,
    horarios,
    ninosAdultosCantidad,
    reservationDates,
    services,
  } = useTourAvailability();

  // ========== DETECTAMOS SI HAY DISPONIBILIDAD PARA ADULTOS, NIÑOS, CANTIDAD Y PRECIO NIÑOS ==========
  const canHaveAdults = useMemo(() => {
    return ninosAdultosCantidad.some((av) => av.adult_available === 1);
  }, [ninosAdultosCantidad]);

  const canHaveNinos = useMemo(() => {
    return ninosAdultosCantidad.some((av) => av.child_available === 1);
  }, [ninosAdultosCantidad]);

  const canHaveCantidad = useMemo(() => {
    return ninosAdultosCantidad.some((av) => av.quantity_available === 1);
  }, [ninosAdultosCantidad]);

  // ========== FECHAS ==========

  const dateOptions = useMemo(() => {
    const validDates = Array.from(
      new Set(
        reservationDates
          .map((av) => av.reservation_date)
          .filter((val) => val && val.trim() !== "")
      )
    );
    return [
      { value: "", text: "Fecha de salida" },
      ...validDates.map((iso) => ({ value: iso, text: formatDate(iso) })),
    ];
  }, [reservationDates]);

  // ========== LUGARES DE SALIDA ==========
  const departureOptions = useMemo(() => {
    const validDepartures = Array.from(
      new Set(
        salidaDesde
          .map((av) => av.city_name)
          .filter((val) => val && val.trim() !== "")
      )
    );
    return [
      { value: "", text: "Salida desde" },
      ...validDepartures.map((dep) => ({
        value: dep,
        text: dep.toUpperCase(),
      })),
    ];
  }, [salidaDesde]);

  // ========== HORARIOS ==========
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    let h = parseInt(hour);
    const suffix = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return minute === "00" ? `${h} ${suffix}` : `${h}:${minute} ${suffix}`;
  };

  const scheduleOptions = useMemo(() => {
    const validSchedules = Array.from(
      new Set(horarios.map((av) => av.time).filter((val) => val?.trim()))
    );
    return [
      { value: "", text: "Horario" },
      ...validSchedules.map((sch) => ({ value: sch, text: formatTime(sch) })),
    ];
  }, [horarios]);

  // ========== CONFIG DINÁMICA DE CAMPOS ==========
  const [dynamicFieldsConfig, setDynamicFieldsConfig] = useState<FieldConfig[]>(
    []
  );

  useEffect(() => {
    const newConfig: FieldConfig[] = [];

    if (dateOptions.length > 1) {
      newConfig.push({
        id: "date",
        label: "Fecha de salida",
        icon: FaCalendarAlt,
        options: dateOptions,
      });
    }

    const groupedServices = services.reduce((acc, svc) => {
      const key = svc.service_type_name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(svc);
      return acc;
    }, {} as Record<string, TourService[]>);

    Object.entries(groupedServices as Record<string, TourService[]>).forEach(
      ([typeName, group]) => {
        const options = [
          { value: "", text: group[0].service_type_name }, // Primera opción genérica
          ...group.map((s) => ({
            value: s.service_id.toString(),
            text: s.city_name ?? s.service_name ?? "Servicio",
          })),
        ];

        newConfig.push({
          id: `service_${group[0].service_type_id}`,
          label: typeName,
          icon: FaMapMarkerAlt,
          options,
        });
      }
    );

    if (canHaveAdults || canHaveNinos) {
      const adultsField: FieldConfig = {
        id: "adults",
        label: "Adultos",
        icon: FaUser,
        options: [
          { value: "", text: "Adultos" },
          { value: "1", text: "1" },
          { value: "2", text: "2" },
          { value: "3", text: "3" },
        ],
      };

      if (canHaveNinos) {
        adultsField.group = [
          {
            id: "children",
            label: "Niños",
            icon: null,
            options: [
              { value: "", text: "Niños" },
              { value: "0", text: "0" },
              { value: "1", text: "1" },
              { value: "2", text: "2" },
            ],
            optional: true,
          },
        ];
      }

      newConfig.push(adultsField);
    }

    if (scheduleOptions.length > 1) {
      newConfig.push({
        id: "schedule",
        label: "Horario",
        icon: FaClock,
        options: scheduleOptions,
      });
    }

    if (canHaveCantidad) {
      newConfig.push({
        id: "quantity",
        label: "Cantidad",
        icon: FaHashtag,
        options: [
          { value: "", text: "Cantidad" },
          { value: "1", text: "1" },
          { value: "2", text: "2" },
          { value: "3", text: "3" },
        ],
      });
    }

    newConfig.push({
      id: "buy",
      type: "button",
      icon: FaBolt,
      buttonText: "COMPRAR",
    });

    setDynamicFieldsConfig(newConfig);
  }, [
    dateOptions,
    departureOptions,
    scheduleOptions,
    canHaveAdults,
    canHaveNinos,
    canHaveCantidad,
    services,
  ]);

  // Lógica para mostrar/ocultar campos según si el anterior está completado
  const shouldShowField = (i: number) => {
    for (let j = 0; j < i; j++) {
      const field = dynamicFieldsConfig[j];
      if (field.type !== "button" && !field.optional) {
        if (!formData[field.id]) return false;
      }
    }
    return true;
  };

  const handleFieldChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleBooking = () => {
    const { date, departure, schedule, adults, children, quantity } = formData;

    const fieldIds = dynamicFieldsConfig.map((f) => f.id);
    function isRequired(id: string) {
      if (id === "buy") return false;
      return true;
    }

    for (const id of fieldIds) {
      const index = dynamicFieldsConfig.findIndex((f) => f.id === id);
      if (isRequired(id) && shouldShowField(index) && !formData[id]) {
        const label = dynamicFieldsConfig[index]?.label || id;
        alert(`Por favor completa el campo "${label}"`);
        return;
      }
    }

    const payload = {
      date,
      departure,
      schedule,
      adultos: adults ? parseInt(adults) : 0,
      ninos: children ? parseInt(children) : 0,
      cantidad: quantity ? parseInt(quantity) : 0,
      tourslug: product?.tour_slug,
      tourname: product?.tour_name,
      tourprice: finalprice,
    };

    // Guardamos la info en el localStorage (u otro almacenamiento si prefieres)
    localStorage.setItem("bookingInfo", JSON.stringify(payload));
    navigate(`/Payment`);
  };

  let basePrice = product?.tour_price;
  const adultCount = parseInt(formData.adults || "0");
  const childCount = parseInt(formData.children || "0");

  if (services.length) {
    Object.keys(formData).forEach((key) => {
      if (key.startsWith("service_")) {
        const selected = services.find(
          (s) => s.service_id.toString() === formData[key]
        );
        if (selected) {
          basePrice =
            adultCount * selected.adult_price +
            childCount * selected.child_price;
        }
      }
    });
  } else {
    basePrice =
      adultCount * (product?.tour_price ?? 0) +
      childCount * parseFloat(formData?.precioninos ?? "0");
  }

  const finalprice = formData.quantity
    ? (basePrice || 0) * parseInt(formData.quantity, 10)
    : basePrice;

  useEffect(() => {
    let updated = false;
    const newFormData = { ...formData };

    dynamicFieldsConfig.forEach((field, i) => {
      if (!shouldShowField(i) && formData[field.id]) {
        newFormData[field.id] = "";
        if (field.group) {
          field.group.forEach((sub) => {
            newFormData[sub.id] = "";
          });
        }
        updated = true;
      }
    });

    if (updated) {
      setFormData(newFormData);
    }
  }, [formData, dynamicFieldsConfig]);

  return (
    <>
      {product && (
        <>
          <HelmetReact>
            <title>{product.meta_title}</title>
            <meta charSet="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <meta name="author" content="Toursland" />
            <meta
              name="copyright"
              content="© Toursland. Todos los derechos reservados."
            />
            <meta name="description" content={product.meta_description} />
            <link rel="canonical" href={product.canonical_url} />
            <meta name="robots" content={product.meta_robots} />
            <meta property="og:title" content={product.og_title} />
            <meta property="og:description" content={product.og_description} />
            <meta property="og:image" content={product.og_image} />
            <meta property="og:url" content={product.canonical_url} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Toursland" />
            <meta property="og:image:alt" content="Descripción de la imagen" />
          </HelmetReact>

          <Header />
          <div className="tourheader">
            <h1>{product.tour_name}</h1>
          </div>

          <div className="tour-details-bar">
            <div className="tour-details2-bar">
              {/* Mostrar solo si TourDuration es un número mayor a 0 */}
              {product.tour_duration && product.tour_duration > 0 && (
                <div className="detail-item">
                  <span role="img" aria-label="clock">
                    <FaClock />
                  </span>
                  <span>Tour de: {product.tour_duration + " Días"}</span>
                </div>
              )}

              {/* Mostrar solo si hay opciones de salida (más allá del placeholder) */}
              {departureOptions.length > 1 && (
                <div className="detail-item">
                  <span role="img" aria-label="plane">
                    <FaPlane />
                  </span>
                  <span>
                    Saliendo desde:{" "}
                    {departureOptions
                      .slice(1)
                      .map((option) => option.text)
                      .join(", ")}
                  </span>
                </div>
              )}

              {/* Mostrar solo si Llegada existe y no está vacía */}
              {product.city_name && product.city_name.trim() !== "" && (
                <div className="detail-item">
                  <span role="img" aria-label="ship">
                    <FaMapMarkerAlt />
                  </span>
                  <span>Destino a: {product.city_name}</span>
                </div>
              )}

              {/* Mostrar solo si EdadMinima existe y, al convertirla a número, es mayor a 0 */}
              {product.min_age && Number(product.min_age) > 0 && (
                <div className="detail-item">
                  <span role="img" aria-label="user">
                    <FaUser />
                  </span>
                  <span>Edad Mínima: {product.min_age}+</span>
                </div>
              )}
            </div>
          </div>

          <div className="tour-tabs">
            <ul>
              <li
                className={
                  activeTab === "tourdetails-section" ? "active-tab" : ""
                }
                onClick={() => handleTabClick("tourdetails-section")}
              >
                <a href="#tourdetails-section">Detalles</a>
              </li>
              <li
                className={activeTab === "tour-carrusel" ? "active-tab" : ""}
                onClick={() => handleTabClick("tour-carrusel")}
              >
                <a href="#tour-carrusel">Fotos</a>
              </li>
              <li
                className={activeTab === "tour-mapa" ? "active-tab" : ""}
                onClick={() => handleTabClick("tour-mapa")}
              >
                <a href="#tour-mapa">Mapa</a>
              </li>
              <li
                className={activeTab === "faq-section" ? "active-tab" : ""}
                onClick={() => handleTabClick("faq-section")}
              >
                <a href="#faq-section">FAQ</a>
              </li>
              <li
                className={activeTab === "reviews-section" ? "active-tab" : ""}
                onClick={() => handleTabClick("reviews-section")}
              >
                <a href="#reviews-section">Reseñas</a>
              </li>
            </ul>
          </div>

          <div className="tourinfo-container">
            <img src={Iconoinicio} alt="Icono de Tours" className="ToursIcon" />
            <section className="tourdetails-section">
              {product.tour_description.length > 0 && (
                <>
                  <div id="tourdetails-section">
                    <h2>
                      <FaRegFileAlt />
                      Detalles del Paquete
                    </h2>
                    <p>{product.tour_description}</p>
                    <hr className="Tourseparation" />
                  </div>
                </>
              )}

              {titles.map((title) => (
                <div key={title.list_title_id}>
                  <div className="TourListSeparation">
                    <h3 className="tourlisth2">{title.list_title_text}</h3>
                    <ul>
                      {items.map((item, i) => (
                        <li key={i}>
                          <FaCheckCircle
                            style={{ color: "#0087f5", marginRight: "0.5rem" }}
                          />
                          {item.item_text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <hr className="Tourseparation" />
                </div>
              ))}

              {pointItinerary.length > 0 && (
                <>
                  <section className="touritinerary">
                    <h2>
                      <span role="img" aria-label="bus">
                        <FaBus />
                      </span>{" "}
                      Itinerario
                    </h2>
                    <div className="touritineraryitems">
                      {pointItinerary.map(
                        ({ day, description: descriptionitinerary }) => (
                          <div
                            key={day}
                            className={`day ${openDay === day ? "open" : ""}`}
                            onClick={() =>
                              setOpenDay(openDay === day ? null : day)
                            }
                          >
                            <h3>
                              Día {day}{" "}
                              <span>{openDay === day ? "▲" : "▼"}</span>
                            </h3>
                            {openDay === day && <p>{descriptionitinerary}</p>}
                          </div>
                        )
                      )}
                    </div>
                  </section>
                  <hr className="Tourseparation" />
                </>
              )}
              <div id="tour-carrusel" className="tour-carrusel">
                <h2>
                  <FaRegImage />
                  Fotos
                </h2>
                <Swiper
                  modules={[Pagination]}
                  slidesPerView={1}
                  pagination={{ clickable: true, dynamicBullets: true }}
                >
                  <SwiperSlide>
                    <img src={placeHolderImg} alt="Carrusel de fotos" />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src={placeHolderImg2} alt="Carrusel de fotos" />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src={placeHolderImg} alt="Carrusel de fotos" />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src={placeHolderImg2} alt="Carrusel de fotos" />
                  </SwiperSlide>
                </Swiper>
              </div>

              {product.tour_map && (
                <>
                  <hr className="Tourseparation" />

                  <h2>
                    <FaMap />
                    Mapa
                  </h2>
                  <div id="tour-mapa">
                    <div className="tour-mapa">
                      <iframe
                        src={product.tour_map}
                        width="100%"
                        height="100%"
                        style={{
                          borderRadius: "10px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                        loading="lazy"
                        aria-label="Mapa interactivo mostrando Estambul y Dubái"
                        title="Mapa interactivo de Google Maps"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </>
              )}

              <div className="faq-container" id="faq-section">
                <h2>
                  <FaQuestionCircle />
                  Preguntas Frecuentes
                </h2>
                {faqData.map((item, index) => {
                  const isOpen = activeIndex === index;
                  return (
                    <div
                      className={`faq-item ${isOpen ? "open" : ""}`}
                      key={`faq-${index}`}
                    >
                      <div
                        className="faq-question"
                        onClick={() => toggleFaq(index)}
                      >
                        <span className="faq-icon">
                          {isOpen ? <FaMinus /> : <FaPlus />}
                        </span>
                        {item.question}
                      </div>
                      {isOpen && (
                        <div className="faq-answer">{item.answer}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <aside
              className={`tour-sidebar ${
                sidebarPosition === "sticky" ? "sticky" : "absolute"
              }`}
            >
              <div className="tour-sidebar">
                <h3 className="tour-sidebar-title">Precio por persona</h3>
                <div className="tour-sidebar-subtitle">
                  <IoPricetag />
                  Desde <span>{fmtMXN.format(finalprice!)}</span>
                </div>
                <div className="tour-sidebar-tabs">
                  <button
                    className={
                      selectedTab === "reserva"
                        ? "active-tab-button-sidebar"
                        : ""
                    }
                    onClick={() => setSelectedTab("reserva")}
                  >
                    Reserva
                  </button>
                  <button
                    className={
                      selectedTab === "cotizacion"
                        ? "active-tab-button-sidebar"
                        : ""
                    }
                    onClick={() => setSelectedTab("cotizacion")}
                  >
                    Cotización
                  </button>
                </div>

                {selectedTab === "reserva" && (
                  <div className="tour-sidebar-reservation new-layout">
                    {dynamicFieldsConfig.map((field, index) => {
                      // Campos numéricos: "adults", "children", "quantity"
                      const numericFields = ["adults", "children", "quantity"];
                      const isNumberField = numericFields.includes(field.id);

                      if (field.type !== "button" && !shouldShowField(index)) {
                        return null;
                      }

                      const numericOptions = field.options?.map((opt) => ({
                        value: opt.value,
                        label: opt.text,
                      }));

                      return (
                        <div key={field.id} className="sidebar-step">
                          {field.icon && (
                            <div className="icon-container">
                              {React.createElement(field.icon)}
                            </div>
                          )}
                          <div className="step-content">
                            {field.type === "button" ? (
                              <button
                                className="tour-sidebar-button"
                                onClick={handleBooking}
                              >
                                {field.buttonText}
                              </button>
                            ) : (
                              <>
                                {isNumberField ? (
                                  <CreatableSelect
                                    inputId={field.id}
                                    classNamePrefix="custom-select"
                                    options={numericOptions}
                                    value={
                                      numericOptions?.find(
                                        (o) =>
                                          String(o.value) ===
                                          String(formData[field.id])
                                      ) ||
                                      (formData[field.id]
                                        ? {
                                            value: formData[field.id],
                                            label: formData[field.id],
                                          }
                                        : null)
                                    }
                                    // Cuando el usuario selecciona un valor existente
                                    onChange={(selected) => {
                                      handleFieldChange(
                                        field.id,
                                        selected?.value || ""
                                      );
                                      setInputValues((prev) => ({
                                        ...prev,
                                        [field.id]: "",
                                      }));
                                    }}
                                    // Cuando el usuario crea un valor nuevo con Enter
                                    onCreateOption={(newVal) => {
                                      // Validar dígitos también aquí
                                      if (/^[0-9]*$/.test(newVal)) {
                                        handleFieldChange(field.id, newVal);
                                        // Tras crearlo, limpiamos el inputValues
                                        setInputValues((prev) => ({
                                          ...prev,
                                          [field.id]: "",
                                        }));
                                      }
                                      // Si no es numérico, no hacemos nada
                                    }}
                                    // Cada vez que escribe, solo guardamos dígitos en inputValues
                                    onInputChange={(inputValue, { action }) => {
                                      if (action === "input-change") {
                                        if (/^[0-9]*$/.test(inputValue)) {
                                          setInputValues((prev) => ({
                                            ...prev,
                                            [field.id]: inputValue,
                                          }));
                                        }
                                      }
                                    }}
                                    // Al perder el foco, confirmamos si había texto pendiente en inputValues
                                    onBlur={() => {
                                      if (
                                        inputValues[field.id] &&
                                        inputValues[field.id] !==
                                          formData[field.id]
                                      ) {
                                        handleFieldChange(
                                          field.id,
                                          inputValues[field.id]
                                        );
                                        setInputValues((prev) => ({
                                          ...prev,
                                          [field.id]: "",
                                        }));
                                      }
                                    }}
                                    // Le decimos a CreatableSelect qué mostrar
                                    inputValue={
                                      inputValues[field.id] !== undefined
                                        ? inputValues[field.id]
                                        : formData[field.id] || ""
                                    }
                                    isSearchable
                                    placeholder={field.label}
                                    isClearable
                                  />
                                ) : (
                                  /* Campo normal (no numérico) */
                                  <select
                                    id={field.id}
                                    className="tour-sidebar-select"
                                    value={formData[field.id] || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        field.id,
                                        e.target.value
                                      )
                                    }
                                  >
                                    {field.options?.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.text}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                {field.group &&
                                  field.group.map((subField) => {
                                    // Mismo patrón para subcampos ("children", por ejemplo)
                                    const isNumberSub = numericFields.includes(
                                      subField.id
                                    );
                                    const subOptions = subField.options?.map(
                                      (opt) => ({
                                        value: opt.value,
                                        label: opt.text,
                                      })
                                    );

                                    return isNumberSub ? (
                                      <CreatableSelect
                                        key={subField.id}
                                        inputId={subField.id}
                                        classNamePrefix="custom-select"
                                        options={subOptions}
                                        value={
                                          subOptions?.find(
                                            (o) =>
                                              String(o.value) ===
                                              String(formData[subField.id])
                                          ) ||
                                          (formData[subField.id]
                                            ? {
                                                value: formData[subField.id],
                                                label: formData[subField.id],
                                              }
                                            : null)
                                        }
                                        onChange={(selected) => {
                                          handleFieldChange(
                                            subField.id,
                                            selected?.value || ""
                                          );
                                          setInputValues((prev) => ({
                                            ...prev,
                                            [subField.id]: "",
                                          }));
                                        }}
                                        onCreateOption={(newVal) => {
                                          if (/^[0-9]*$/.test(newVal)) {
                                            handleFieldChange(
                                              subField.id,
                                              newVal
                                            );
                                            setInputValues((prev) => ({
                                              ...prev,
                                              [subField.id]: "",
                                            }));
                                          }
                                        }}
                                        onInputChange={(
                                          inputValue,
                                          { action }
                                        ) => {
                                          if (action === "input-change") {
                                            if (/^[0-9]*$/.test(inputValue)) {
                                              setInputValues((prev) => ({
                                                ...prev,
                                                [subField.id]: inputValue,
                                              }));
                                            }
                                          }
                                        }}
                                        onBlur={() => {
                                          if (
                                            inputValues[subField.id] &&
                                            inputValues[subField.id] !==
                                              formData[subField.id]
                                          ) {
                                            handleFieldChange(
                                              subField.id,
                                              inputValues[subField.id]
                                            );
                                            setInputValues((prev) => ({
                                              ...prev,
                                              [subField.id]: "",
                                            }));
                                          }
                                        }}
                                        inputValue={
                                          inputValues[subField.id] !== undefined
                                            ? inputValues[subField.id]
                                            : formData[subField.id] || ""
                                        }
                                        isSearchable
                                        placeholder={subField.label}
                                        isClearable
                                      />
                                    ) : (
                                      /* Subcampo no numérico */
                                      <select
                                        key={subField.id}
                                        id={subField.id}
                                        className="tour-sidebar-select"
                                        value={formData[subField.id] || ""}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            subField.id,
                                            e.target.value
                                          )
                                        }
                                      >
                                        {subField.options?.map((opt) => (
                                          <option
                                            key={opt.value}
                                            value={opt.value}
                                          >
                                            {opt.text}
                                          </option>
                                        ))}
                                      </select>
                                    );
                                  })}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedTab === "cotizacion" && (
                  <div className="tour-sidebar-quotation">
                    <div className="tour-sidebar-form-group">
                      <label htmlFor="nombre">Nombre*</label>
                      <input type="text" id="nombre" required />
                    </div>
                    <div className="tour-sidebar-form-group">
                      <label htmlFor="correo">Correo*</label>
                      <input type="email" id="correo" required />
                    </div>
                    <div className="tour-sidebar-form-group">
                      <label htmlFor="celular">Celular*</label>
                      <input type="tel" id="celular" required />
                    </div>
                    <div className="tour-sidebar-form-group-checkbox">
                      <input type="checkbox" id="terminos" required />
                      <label htmlFor="terminos">
                        Estoy de acuerdo con las{" "}
                        <a href="/Terminos">Condiciones del servicio</a> y la{" "}
                        <a href="/Aviso">Política de privacidad</a>.
                      </label>
                    </div>
                    <button className="tour-sidebar-button">
                      ENVIAR CONSULTA
                    </button>
                  </div>
                )}
                <div className="tour-sidebar-wishlist">
                  <a href="#" className="tour-sidebar-link">
                    Guardar en lista de deseos
                  </a>
                  <span className="tour-sidebar-likes">401</span>
                </div>
              </div>

              <div className="tour-sidebar-contact">
                <p>¿Tienes una pregunta?</p>
                <p>
                  Llama al{" "}
                  <a href="tel:+8333344042" className="tour-sidebar-link">
                    833 334 4042
                  </a>
                </p>
                <p>
                  O envía un correo a{" "}
                  <a
                    href="mailto:contacto@toursland.mx"
                    className="tour-sidebar-link"
                  >
                    contacto@toursland.mx
                  </a>
                </p>
              </div>
            </aside>
          </div>
          <Footer />
        </>
      )}
    </>
  );
};

export default Tours;
