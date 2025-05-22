// AdminCrudTable.tsx
import React from "react";
import "./admin.css";

type Column = { key: string; label: string };
type Field = { key: string; label: string; type?: string };

// Definimos la forma exacta del hook que esperamos, parametrizado en T
export interface CrudHookReturn<T> {
  data: T[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  form: Record<string, any>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  itemsPerPage: number;
}

interface Props<T> {
  title: string;
  columns: Column[];
  fields: Field[];
  useCrudHook: CrudHookReturn<T>;
}

export default function AdminCrudTable<T>({
  title,
  columns,
  fields,
  useCrudHook,
}: Props<T>) {
  const {
    data,
    total,
    page,
    setPage,
    form,
    handleChange,
    handleSubmit,
    loading,
    itemsPerPage,
  } = useCrudHook;

  // Evitamos “Cargando…” eterno si hay error o array vacío
  const isLoading =
    loading ||
    (Array.isArray(data) && data.length === 0 && total === 0 && page === 1);

  return (
    <div className="admin-table">
      <h2>{title}</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        {fields.map((f) => (
          <input
            key={f.key}
            name={f.key}
            placeholder={f.label}
            value={form[f.key] || ""}
            type={f.type || "text"}
            onChange={handleChange}
            required
          />
        ))}
        <button type="submit">Agregar</button>
      </form>

      {isLoading ? (
        <div>
          Cargando...
          <div style={{ color: "red", fontSize: "0.9em", marginTop: 8 }}>
            {!loading && data.length === 0 && total === 0
              ? "No se pudo cargar la información. Verifica la conexión o permisos."
              : null}
          </div>
        </div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: T, i: number) => (
                <tr key={i}>
                  {columns.map((col) => (
                    // Como row es T, col.key debe existir en T; si no, puedes castear row[col.key] a any
                    <td key={col.key}>{(row as any)[col.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            {Array.from(
              { length: Math.ceil(total / itemsPerPage) },
              (_, idx) => (
                <button
                  key={idx + 1}
                  className={page === idx + 1 ? "active" : ""}
                  onClick={() => setPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
