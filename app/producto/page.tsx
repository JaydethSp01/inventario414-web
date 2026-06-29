"use client";
export const dynamic = "force-dynamic";
import { useState, useMemo } from "react";
import Link from "next/link";
import { productos as productosMock, categorias as categoriasMock, proveedores as proveedoresMock } from "@/lib/mock";

interface Producto {
  id: number;
  nombre: string;
  sku: string;
  descripcion: string;
  precio: number;
  costo: number;
  stock: number;
  stockMinimo: number;
  categoriaId: number;
  categoriaNombre: string;
  proveedorId: number;
  proveedorNombre: string;
  activo: boolean;
}

interface FormState {
  nombre: string;
  sku: string;
  descripcion: string;
  precio: string;
  costo: string;
  stock: string;
  stockMinimo: string;
  categoriaId: string;
  proveedorId: string;
  activo: boolean;
}

const FORM_EMPTY: FormState = {
  nombre: "",
  sku: "",
  descripcion: "",
  precio: "",
  costo: "",
  stock: "",
  stockMinimo: "",
  categoriaId: "",
  proveedorId: "",
  activo: true,
};

function productoToForm(p: Producto): FormState {
  return {
    nombre: p.nombre,
    sku: p.sku,
    descripcion: p.descripcion,
    precio: String(p.precio),
    costo: String(p.costo),
    stock: String(p.stock),
    stockMinimo: String(p.stockMinimo),
    categoriaId: String(p.categoriaId),
    proveedorId: String(p.proveedorId),
    activo: p.activo,
  };
}

export default function ProductoPage() {
  const [productos, setProductos] = useState<Producto[]>(productosMock);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroActivo, setFiltroActivo] = useState<"todos" | "activo" | "inactivo">("todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(FORM_EMPTY);
  const [errores, setErrores] = useState<Partial<FormState>>({});
  const [confirmEliminarId, setConfirmEliminarId] = useState<number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const POR_PAGINA = 8;

  const productosFiltrados = useMemo(() => {
    return (productos ?? []).filter((p) => {
      const matchBusqueda =
        (p.nombre ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.sku ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.categoriaNombre ?? "").toLowerCase().includes(busqueda.toLowerCase());
      const matchCategoria = filtroCategoria === "" || String(p.categoriaId) === filtroCategoria;
      const matchActivo =
        filtroActivo === "todos" ||
        (filtroActivo === "activo" && p.activo) ||
        (filtroActivo === "inactivo" && !p.activo);
      return matchBusqueda && matchCategoria && matchActivo;
    });
  }, [productos, busqueda, filtroCategoria, filtroActivo]);

  const totalPaginas = Math.ceil(productosFiltrados?.length / POR_PAGINA);
  const productosPagina = productosFiltrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  const estadisticas = useMemo(() => ({
    total: productos?.length,
    activos: (productos ?? []).filter((p) => p.activo).length,
    stockBajo: (productos ?? []).filter((p) => p.stock <= p.stockMinimo && p.activo).length,
    sinStock: (productos ?? []).filter((p) => p.stock === 0).length,
  }), [productos]);

  function abrirCrear() {
    setEditandoId(null);
    setForm(FORM_EMPTY);
    setErrores({});
    setModalAbierto(true);
  }

  function abrirEditar(p: Producto) {
    setEditandoId(p.id);
    setForm(productoToForm(p));
    setErrores({});
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(FORM_EMPTY);
    setErrores({});
  }

  function validarForm(): boolean {
    const nuevosErrores: Partial<FormState> = {};
    if (!(form.nombre ?? "").trim()) nuevosErrores.nombre = "Nombre requerido";
    if (!(form.sku ?? "").trim()) nuevosErrores.sku = "SKU requerido";
    if (!form.precio || isNaN(Number(form.precio)) || Number(form.precio) < 0)
      nuevosErrores.precio = "Precio inválido";
    if (!form.costo || isNaN(Number(form.costo)) || Number(form.costo) < 0)
      nuevosErrores.costo = "Costo inválido";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      nuevosErrores.stock = "Stock inválido";
    if (!form.stockMinimo || isNaN(Number(form.stockMinimo)) || Number(form.stockMinimo) < 0)
      nuevosErrores.stockMinimo = "Stock mínimo inválido";
    if (!form.categoriaId) nuevosErrores.categoriaId = "Categoría requerida";
    if (!form.proveedorId) nuevosErrores.proveedorId = "Proveedor requerido";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function guardar() {
    if (!validarForm()) return;
    const cat = (categoriasMock ?? []).find((c) => c.id === Number(form.categoriaId));
    const prov = (proveedoresMock ?? []).find((p) => p.id === Number(form.proveedorId));
    if (!cat || !prov) return;

    if (editandoId !== null) {
      setProductos((prev) =>
        (prev ?? []).map((p) =>
          p.id === editandoId
            ? {
                ...p,
                nombre: (form.nombre ?? "").trim(),
                sku: (form.sku ?? "").trim().toUpperCase(),
                descripcion: (form.descripcion ?? "").trim(),
                precio: Number(form.precio),
                costo: Number(form.costo),
                stock: Number(form.stock),
                stockMinimo: Number(form.stockMinimo),
                categoriaId: cat.id,
                categoriaNombre: cat.nombre,
                proveedorId: prov.id,
                proveedorNombre: prov.nombre,
                activo: form.activo,
              }
            : p
        )
      );
    } else {
      const nuevoId = Math.max(0, ...productos.map((p) => p.id)) + 1;
      setProductos((prev) => [
        ...prev,
        {
          id: nuevoId,
          nombre: (form.nombre ?? "").trim(),
          sku: (form.sku ?? "").trim().toUpperCase(),
          descripcion: (form.descripcion ?? "").trim(),
          precio: Number(form.precio),
          costo: Number(form.costo),
          stock: Number(form.stock),
          stockMinimo: Number(form.stockMinimo),
          categoriaId: cat.id,
          categoriaNombre: cat.nombre,
          proveedorId: prov.id,
          proveedorNombre: prov.nombre,
          activo: form.activo,
        },
      ]);
    }
    cerrarModal();
  }

  function eliminar(id: number) {
    setProductos((prev) => (prev ?? []).filter((p) => p.id !== id));
    setConfirmEliminarId(null);
  }

  function cambiarForm(campo: keyof FormState, valor: string | boolean) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  }

  function toggleActivo(id: number) {
    setProductos((prev) =>
      (prev ?? []).map((p) => (p.id === id ? { ...p, activo: !p.activo } : p))
    );
  }

  const margenColor = (precio: number, costo: number) => {
    const margen = costo > 0 ? ((precio - costo) / costo) * 100 : 0;
    if (margen >= 40) return "text-green-600";
    if (margen >= 20) return "text-yellow-600";
    return "text-red-500";
  };

  const stockColor = (stock: number, stockMinimo: number) => {
    if (stock === 0) return "bg-red-100 text-red-700";
    if (stock <= stockMinimo) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-xl font-semibold text-slate-800">Productos</h1>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            {[
              { href: "/producto", label: "Productos" },
              { href: "/categoria", label: "Categorías" },
              { href: "/proveedor", label: "Proveedores" },
              { href: "/movimiento", label: "Movimientos" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  item.href === "/producto"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total productos", value: estadisticas.total, color: "text-slate-800", bg: "bg-white", icon: "📦" },
            { label: "Activos", value: estadisticas.activos, color: "text-green-700", bg: "bg-green-50", icon: "✅" },
            { label: "Stock bajo", value: estadisticas.stockBajo, color: "text-yellow-700", bg: "bg-yellow-50", icon: "⚠️" },
            { label: "Sin stock", value: estadisticas.sinStock, color: "text-red-700", bg: "bg-red-50", icon: "🚨" },
          ].map((kpi) => (
            <div key={kpi.label} className={`${kpi.bg} rounded-xl border border-slate-200 p-4 flex items-center gap-3`}>
              <span className="text-2xl">{kpi.icon}</span>
              <div>
                <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nombre, SKU o categoría..."
                  value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filtroCategoria}
                onChange={(e) => { setFiltroCategoria(e.target.value); setPaginaActual(1); }}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              >
                <option value="">Todas las categorías</option>
                {(categoriasMock ?? []).map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                ))}
              </select>
              <select
                value={filtroActivo}
                onChange={(e) => { setFiltroActivo(e.target.value as typeof filtroActivo); setPaginaActual(1); }}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Solo activos</option>
                <option value="inactivo">Solo inactivos</option>
              </select>
            </div>
            <button
              onClick={abrirCrear}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo producto
            </button>
          </div>
          {productosFiltrados?.length !== productos?.length && (
            <p className="mt-2 text-xs text-slate-500">
              Mostrando {productosFiltrados?.length} de {productos?.length} productos
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 w-10">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Producto</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">SKU</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Categoría</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Proveedor</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Costo</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Precio</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Margen</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Stock</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Estado</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productosPagina?.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span className="font-medium">No se encontraron productos</span>
                        <span className="text-xs">Intenta con otros filtros de búsqueda</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  (productosPagina ?? []).map((producto, idx) => {
                    const margen =
                      producto.costo > 0
                        ? (((producto.precio - producto.costo) / producto.costo) * 100).toFixed(1)
                        : "—";
                    return (
                      <tr
                        key={producto.id}
                        className={`hover:bg-slate-50 transition-colors ${!producto.activo ? "opacity-60" : ""}`}
                      >
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {(paginaActual - 1) * POR_PAGINA + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-800">{producto.nombre}</p>
                            {producto.descripcion && (
                              <p className="text-xs text-slate-400 truncate max-w-[180px]">{producto.descripcion}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {producto.sku}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {producto.categoriaNombre}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{producto.proveedorNombre}</td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          ${(producto.costo ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          ${(producto.precio ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${margenColor(producto.precio, producto.costo)}`}>
                          {margen !== "—" ? `${margen}%` : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${stockColor(producto.stock, producto.stockMinimo)}`}>
                            {producto.stock} uds
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleActivo(producto.id)}
                            title={producto.activo ? "Desactivar" : "Activar"}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                              producto.activo ? "bg-green-500" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                producto.activo ? "translate-x-4" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => abrirEditar(producto)}
                              title="Editar"
                              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setConfirmEliminarId(producto.id)}
                              title="Eliminar"
                              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Página {paginaActual} de {totalPaginas} · {productosFiltrados?.length} resultados
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 text-sm rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPaginaActual(n)}
                    className={`px-3 py-1 text-sm rounded border transition-colors ${
                      n === paginaActual
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1 text-sm rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cerrarModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editandoId !== null ? "Editar producto" : "Nuevo producto"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editandoId !== null
                    ? "Modifica los campos y guarda los cambios"
                    : "Completa la información para registrar el producto"}
                </p>
              </div>
              <button
                onClick={cerrarModal}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => cambiarForm("nombre", e.target.value)}
                    placeholder="Ej. Tornillo hexagonal M8"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errores.nombre ? "border-red-400 bg-red-50" : "border-slate-200"
                    }`}
                  />
                  {errores.nombre && <p className="mt-1 text-xs text-red-500">{errores.nombre}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => cambiarForm("sku", e.target.value)}
                    placeholder="Ej. TORN-M8-001"
                    className={`w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errores.sku ? "border-red-400 bg-red-50" : "border-slate-200"
                    }`}
                  />
                  {errores.sku && <p className="mt-1 text-xs text-red-500">{errores.sku}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => cambiarForm("descripcion", e.target.value)}
                  placeholder="Descripción breve del producto..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.categoriaId}
                    onChange={(e) => cambiarForm("categoriaId", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                      errores.categoriaId ? "border-red-400 bg-red-50" : "border-slate-200"
                    }`}
                  >
                    <option value="">Seleccionar categoría</option>
                    {(categoriasMock ?? []).map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                    ))}
                  </select>
                  {errores.categoriaId && <p className="mt-1 text-xs text-red-500">{errores.categoriaId}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Proveedor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.proveedorId}
                    onChange={(e) => cambiarForm("proveedorId", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                      errores.proveedorId ? "border-red-400 bg-red-50" : "border-slate-200"
                    }`}
                  >
                    <option value="">Seleccionar proveedor</option>
                    {(proveedoresMock ?? []).map((p) => (
                      <option key={p.id} value={String(p.id)}>{p.nombre}</option>
                    ))}
                  </select>
                  {errores.proveedorId && <p className="mt-1 text-xs text-red-500">{errores.proveedorId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Costo ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costo}
                    onChange={(e) => cambiarForm("costo", e.target.value)}
                    placeholder="0.00"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errores.costo ? "border-red-400 bg-red-50" : "border-slate-200"
                    }`}
                  />
                  {errores.costo && <p className="mt-1 text-xs text-red-500">{errores.costo}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Precio ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio}
                    onChange={(e) => cambiarForm("precio", e.target.value)}
                    placeholder="0.00"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errores.precio ? "border-red-400 bg-red-50" : "border-slate-200"
                    }`}
                  />
                  {errores.precio && <p className="mt-1 text-xs text-red-500">{errores.precio}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Stock actual <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => cambiarForm("stock", e.target.value)}
                    placeholder="0"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errores.stock ? "border-red-400 bg-red-50" : "border-slate-200"
                    }`}
                  />
                  {errores.stock && <p className="mt-1 text-xs text-red-500">{errores.stock}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Stock mín. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockMinimo}
                    onChange={(e) => cambiarForm("stockMinimo", e.target.value)}
                    placeholder="0"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errores.stockMinimo ? "border-red-400 bg-red-50" : "border-slate-200"
                    }`}
                  />
                  {errores.stockMinimo && <p className="mt-1 text-xs text-red-500">{errores.stockMinimo}</p>}
                </div>
              </div>

              {form.precio && form.costo && Number(form.costo) > 0 && (
                <div className="bg-slate-50 rounded-lg px-4 py-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-slate-500">Margen calculado:</span>
                  <span className={`text-sm font-semibold ${margenColor(Number(form.precio), Number(form.costo))}`}>
                    {(((Number(form.precio) - Number(form.costo)) / Number(form.costo)) * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-400">
                    (${(Number(form.precio) - Number(form.costo)).toFixed(2)} de utilidad por unidad)
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">Producto activo</p>
                  <p className="text-xs text-slate-400">Los productos inactivos no aparecen en pedidos ni movimientos</p>
                </div>
                <button
                  type="button"
                  onClick={() => cambiarForm("activo", !form.activo)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.activo ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.activo ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {editandoId !== null ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmEliminarId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmEliminarId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Eliminar producto</h3>
                <p className="text-sm text-slate-500 mt-1">
                  ¿Estás seguro de que deseas eliminar{" "}
                  <span className="font-semibold text-slate-700">
                    {(productos ?? []).find((p) => p.id === confirmEliminarId)?.nombre}
                  </span>
                  ? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirmEliminarId(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => eliminar(confirmEliminarId)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}