import { useCallback, useEffect, useState } from "react";
import api from "../../servieces/api.js";

const initialForm = {
  id: null,
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
};

const CrudProductos = () => {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const obtenerProductos = useCallback(async () => {
    try {
      const response = await api.get("/productos");
      setProductos(response.data);
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudieron cargar los productos.",
      );
    }
  }, []);

  useEffect(() => {
    let componenteActivo = true;

    api.get("/productos")
      .then((response) => {
        if (componenteActivo) {
          setProductos(response.data);
        }
      })
      .catch((requestError) => {
        if (componenteActivo) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No se pudieron cargar los productos.",
          );
        }
      })
      .finally(() => {
        if (componenteActivo) {
          setCargando(false);
        }
      });

    return () => {
      componenteActivo = false;
    };
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (form.id) {
        await api.put(`/productos/${form.id}`, form);
      } else {
        await api.post("/productos", form);
      }

      setForm(initialForm);
      await obtenerProductos();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo guardar el producto.",
      );
    }
  };

  const handleEdit = (producto) => {
    setForm({
      id: producto.id,
      nombre: producto.nombre ?? "",
      descripcion: producto.descripcion ?? "",
      precio: producto.precio ?? "",
      stock: producto.stock ?? "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) {
      return;
    }

    setError("");
    try {
      await api.delete(`/productos/${id}`);
      await obtenerProductos();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo eliminar el producto.",
      );
    }
  };

  return (
    <div className="container inventory-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">INVENTARIO</span>
          <h1>Gestión de productos</h1>
          <p>Administra tus productos, precios y niveles de stock desde un solo lugar.</p>
        </div>
        <div className="product-count" aria-label={`${productos.length} productos registrados`}>
          <span className="product-count-value">{productos.length}</span>
          <span className="product-count-label">productos<br />registrados</span>
        </div>
      </header>

      {error && (
        <div className="alert alert-danger inventory-alert" role="alert">
          <span className="alert-icon" aria-hidden="true">!</span>
          <span>{error}</span>
        </div>
      )}

      <div className="row inventory-layout">
        <div className="col-lg-4">
          <section className="inventory-card form-card">
            <div className="section-heading">
              <span className="section-icon form-icon" aria-hidden="true">{form.id ? "✎" : "+"}</span>
              <div>
              <h2>{form.id ? "Editar producto" : "Nuevo producto"}</h2>
              <p>{form.id ? "Actualiza la información del producto." : "Completa los datos para agregarlo al inventario."}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="mb-3">
              <label htmlFor="nombre" className="form-label">Nombre del producto</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                className="form-control"
                placeholder="Ej. Cuaderno universitario"
                value={form.nombre}
                onChange={handleChange}
                required
              />
              </div>
              <div className="mb-3">
              <label htmlFor="descripcion" className="form-label">Descripción <span className="optional-label">Opcional</span></label>
              <input
                id="descripcion"
                type="text"
                name="descripcion"
                className="form-control"
                placeholder="Detalles adicionales"
                value={form.descripcion}
                onChange={handleChange}
              />
              </div>
              <div className="row">
              <div className="col-sm-6 mb-3">
                <label htmlFor="precio" className="form-label">Precio (S/)</label>
              <input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                name="precio"
                className="form-control"
                placeholder="0.00"
                value={form.precio}
                onChange={handleChange}
                required
              />
              </div>
              <div className="col-sm-6 mb-3">
                <label htmlFor="stock" className="form-label">Unidades</label>
              <input
                id="stock"
                type="number"
                min="0"
                name="stock"
                className="form-control"
                placeholder="0"
                value={form.stock}
                onChange={handleChange}
                required
              />
              </div>
              </div>
              <div className="form-actions">
              <button type="submit" className="btn btn-primary submit-button">
                {form.id ? "Guardar cambios" : "Agregar producto"}
              </button>
              {form.id && (
                <button
                  type="button"
                  className="btn btn-light cancel-button"
                  onClick={() => setForm(initialForm)}
                >
                  Cancelar
                </button>
              )}
              </div>
            </form>
          </section>
        </div>
        <div className="col-lg-8">
          <section className="inventory-card list-card">
            <div className="list-heading">
              <div className="section-heading">
              <span className="section-icon list-icon" aria-hidden="true">▤</span>
              <div>
                <h2>Productos</h2>
                <p>Listado completo de artículos registrados.</p>
              </div>
              </div>
              <span className="list-count">{productos.length} en total</span>
            </div>
            <div className="table-responsive">
              <table className="table inventory-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Producto</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Stock</th>
                  <th scope="col" className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <span className="loading-spinner" aria-hidden="true" />
                      Cargando productos...
                    </td>
                  </tr>
                ) : productos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <span className="empty-state-icon" aria-hidden="true">▤</span>
                      <strong>Aún no hay productos</strong>
                      <span>Agrega el primer producto con el formulario.</span>
                    </td>
                  </tr>
                ) : (
                  productos.map((producto) => (
                    <tr key={producto.id}>
                      <td><span className="product-id">#{producto.id}</span></td>
                      <td>
                        <span className="product-name">{producto.nombre}</span>
                        {producto.descripcion && <span className="product-description">{producto.descripcion}</span>}
                      </td>
                      <td className="product-price">S/ {Number(producto.precio).toFixed(2)}</td>
                      <td>
                        <span className={`stock-badge ${Number(producto.stock) === 0 ? "stock-empty" : ""}`}>
                          {producto.stock} unidades
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn btn-sm action-button edit-button"
                            onClick={() => handleEdit(producto)}
                            aria-label={`Editar ${producto.nombre}`}
                            title="Editar producto"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm action-button delete-button"
                            onClick={() => handleDelete(producto.id)}
                            aria-label={`Eliminar ${producto.nombre}`}
                            title="Eliminar producto"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            </div>
            <div className="list-footer">
              Mostrando <strong>{productos.length}</strong> {productos.length === 1 ? "producto" : "productos"}
            </div>
          </section>
        </div>
      </div>
      <footer className="page-footer">Panel de inventario <span>·</span> SENATI</footer>
    </div>
  );
};

export default CrudProductos;
