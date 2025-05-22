import React, { useEffect, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "./FilterSidebar.css";
import { useMinMaxProducts, useFetchLocations } from "../Hook";
import DatePickerInput from "../Calendar/DatePickerInput";

interface FilterSidebarProps {
  initialFilters: Record<string, string>;
  onApplyFilters: (filters: Record<string, string>) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  initialFilters,
  onApplyFilters,
}) => {
  const { minmaxproducts } = useMinMaxProducts();
  const { locations: continents } = useFetchLocations("continents");
  const { locations: countries } = useFetchLocations("countries");

  // Estado local, inicializado con los valores de URL o con defaults
  const [filters, setFilters] = useState<any>({
    continent: initialFilters.continent || "",
    country: initialFilters.country || "",
    min_price: initialFilters.min_price ? Number(initialFilters.min_price) : 0,
    max_price: initialFilters.max_price ? Number(initialFilters.max_price) : 0,
    min_days: initialFilters.min_days ? Number(initialFilters.min_days) : 1,
    max_days: initialFilters.max_days ? Number(initialFilters.max_days) : 10,
    start_date: initialFilters.start_date || "",
    end_date: initialFilters.end_date || "",
    month: initialFilters.month || "",
    showFilters: false,
  });

  // Cuando llegan los rangos mínimos/máximos, los usamos si no vienen en initialFilters
  useEffect(() => {
    if (minmaxproducts) {
      setFilters((prev: any) => ({
        ...prev,
        min_price: initialFilters.min_price
          ? Number(initialFilters.min_price)
          : minmaxproducts.min_price,
        max_price: initialFilters.max_price
          ? Number(initialFilters.max_price)
          : minmaxproducts.max_price,
        min_days: initialFilters.min_days
          ? Number(initialFilters.min_days)
          : minmaxproducts.min_days,
        max_days: initialFilters.max_days
          ? Number(initialFilters.max_days)
          : minmaxproducts.max_days,
      }));
    }
  }, [minmaxproducts, initialFilters]);

  // Si cambian los filtros desde URL, los sincronizamos
  useEffect(() => {
    setFilters((prev: any) => ({
      ...prev,
      continent: initialFilters.continent || prev.continent,
      country: initialFilters.country || prev.country,
      start_date: initialFilters.start_date || prev.start_date,
      end_date: initialFilters.end_date || prev.end_date,
      month: initialFilters.month || prev.month,
    }));
  }, [initialFilters]);

  const handleChange = (field: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "" && v != null) params[k] = String(v);
    });
    params.page = "1";
    onApplyFilters(params);
  };

  return (
    <aside className="filter-sidebar">
      <button
        className="toggle-button"
        onClick={() => handleChange("showFilters", !filters.showFilters)}
      >
        {filters.showFilters ? "Ocultar filtros" : "Mostrar filtros"}
      </button>

      {filters.showFilters && (
        <div className="filters-wrapper">
          <h3>Filtrar</h3>

          <label>Continente</label>
          <select
            value={filters.continent}
            onChange={(e) => handleChange("continent", e.target.value)}
          >
            <option value="">Todos</option>
            {continents.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <label>País</label>
          <select
            value={filters.country}
            onChange={(e) => handleChange("country", e.target.value)}
          >
            <option value="">Todos</option>
            {countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <label>Precio</label>
          <Slider
            range
            min={minmaxproducts?.min_price}
            max={minmaxproducts?.max_price}
            value={[filters.min_price, filters.max_price]}
            onChange={(val) => {
              if (Array.isArray(val)) {
                handleChange("min_price", val[0]);
                handleChange("max_price", val[1]);
              }
            }}
          />
          <div>
            ${filters.min_price} - ${filters.max_price}
          </div>

          <label>Duración</label>
          <Slider
            range
            min={minmaxproducts?.min_days}
            max={minmaxproducts?.max_days}
            value={[filters.min_days, filters.max_days]}
            onChange={(val) => {
              if (Array.isArray(val)) {
                handleChange("min_days", val[0]);
                handleChange("max_days", val[1]);
              }
            }}
          />
          <div>
            {filters.min_days} - {filters.max_days} días
          </div>

          <DatePickerInput
            label="Desde"
            value={filters.start_date}
            onChange={(val) => handleChange("start_date", val)}
          />

          <label>Mes</label>
          <select
            value={filters.month}
            onChange={(e) => handleChange("month", e.target.value)}
          >
            <option value="">Todos</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {new Date(0, i).toLocaleString("es-MX", { month: "long" })}
              </option>
            ))}
          </select>

          <button className="apply-button" onClick={handleApply}>
            Buscar
          </button>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
