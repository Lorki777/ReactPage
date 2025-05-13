// AddProductForm.tsx (puedes agregarlo en la carpeta de components)
import React, { useState } from "react";
import { useAddProduct } from "../Hook";

const AddProductForm: React.FC = () => {
  const [formData, setFormData] = useState({
    tour_name: "",
    tour_description: "",
    tour_slug: "",
    tour_duration: "",
    tour_map: "",
    meta_title: "",
    meta_description: "",
    canonical_url: "",
    meta_robots_id: "",
    seo_friendly_url: "",
    og_title: "",
    og_description: "",
    og_image: "",
    schema_markup: "",
    breadcrumb_path: "",
    city_id: "",
    state_id: "",
    country_id: "",
    continent_id: "",
    destination_id: "",
    homepage_category_id: "",
    is_public: "1",
    arrival_city_id: "",
    min_age: "",
    tour_badge_id: "",
    product_type_id: "",
  });

  const { addProduct, loading, error } = useAddProduct();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await addProduct(formData);
      alert("Producto creado exitosamente con ID: " + result.productId);
      // Opcional: reiniciar el formulario
      setFormData({
        tour_name: "",
        tour_description: "",
        tour_slug: "",
        tour_duration: "",
        tour_map: "",
        meta_title: "",
        meta_description: "",
        canonical_url: "",
        meta_robots_id: "",
        seo_friendly_url: "",
        og_title: "",
        og_description: "",
        og_image: "",
        schema_markup: "",
        breadcrumb_path: "",
        city_id: "",
        state_id: "",
        country_id: "",
        continent_id: "",
        destination_id: "",
        homepage_category_id: "",
        is_public: "1",
        arrival_city_id: "",
        min_age: "",
        tour_badge_id: "",
        product_type_id: "",
      });
    } catch (err) {
      console.error("Error al enviar el formulario:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Agregar Nuevo Producto/Tour</h2>
      <div>
        <label>Nombre del Tour:</label>
        <input
          type="text"
          name="tour_name"
          value={formData.tour_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Descripción:</label>
        <textarea
          name="tour_description"
          value={formData.tour_description}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Slug:</label>
        <input
          type="text"
          name="tour_slug"
          value={formData.tour_slug}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Duración del Tour (días):</label>
        <input
          type="number"
          name="tour_duration"
          value={formData.tour_duration}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Mapa del Tour (URL):</label>
        <input
          type="text"
          name="tour_map"
          value={formData.tour_map}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Meta Title:</label>
        <input
          type="text"
          name="meta_title"
          value={formData.meta_title}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Meta Description:</label>
        <textarea
          name="meta_description"
          value={formData.meta_description}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Canonical URL:</label>
        <input
          type="text"
          name="canonical_url"
          value={formData.canonical_url}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Meta Robots ID:</label>
        <input
          type="number"
          name="meta_robots_id"
          value={formData.meta_robots_id}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>SEO Friendly URL:</label>
        <input
          type="text"
          name="seo_friendly_url"
          value={formData.seo_friendly_url}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>OG Title:</label>
        <input
          type="text"
          name="og_title"
          value={formData.og_title}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>OG Description:</label>
        <textarea
          name="og_description"
          value={formData.og_description}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>OG Image (URL):</label>
        <input
          type="text"
          name="og_image"
          value={formData.og_image}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Schema Markup:</label>
        <textarea
          name="schema_markup"
          value={formData.schema_markup}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Breadcrumb Path:</label>
        <input
          type="text"
          name="breadcrumb_path"
          value={formData.breadcrumb_path}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>City ID:</label>
        <input
          type="number"
          name="city_id"
          value={formData.city_id}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>State ID:</label>
        <input
          type="number"
          name="state_id"
          value={formData.state_id}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Country ID:</label>
        <input
          type="number"
          name="country_id"
          value={formData.country_id}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Continent ID:</label>
        <input
          type="number"
          name="continent_id"
          value={formData.continent_id}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Destination ID:</label>
        <input
          type="number"
          name="destination_id"
          value={formData.destination_id}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Homepage Category ID:</label>
        <input
          type="number"
          name="homepage_category_id"
          value={formData.homepage_category_id}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>¿Es público? (1/0):</label>
        <input
          type="text"
          name="is_public"
          value={formData.is_public}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Arrival City ID:</label>
        <input
          type="number"
          name="arrival_city_id"
          value={formData.arrival_city_id}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Min Age:</label>
        <input
          type="number"
          name="min_age"
          value={formData.min_age}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Tour Badge ID:</label>
        <input
          type="number"
          name="tour_badge_id"
          value={formData.tour_badge_id}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Product Type ID:</label>
        <input
          type="number"
          name="product_type_id"
          value={formData.product_type_id}
          onChange={handleChange}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Cargando..." : "Agregar Producto"}
      </button>
      {error && <p>Error: {error}</p>}
    </form>
  );
};

export default AddProductForm;
