"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import Link from "next/link";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  activo: boolean;
}

const mockProveedores: Proveedor[] = [
  {
    id: 1,
    nombre: "Distribuidora Norte S.A.",
    contacto: "Carlos Mendoza",
    email: "cmendoza@disnorte.com",
    telefono: "+52 55 1234 5678",
    direccion: "Av. Industrial 450, CDMX",
    activo: true,
  },
  {
    id: 2,
    nombre: "Importaciones Global",
    contacto: "Laura Ríos",
    email: "lrios@imglobal.mx",
    telefono: "+52 33 9876 5432",
    direccion: "Blvd. Comercio 210, Guadalajara",
    activo: true,
  },
  {
    id: 3,
    nombre: "Proveedora del Centro",
    contacto: "Javier Torres",
    email: "jtorres@provcentro.com",
    telefono: "+52 55 2345 6789",
    direccion: "Calle Morelos 88, Puebla",
    activo: false,
  },
  {
    id: 4,
    nombre: "Suministros Tech MX",
    contacto: "Ana Pérez",
    email: "aperez@sumtech.mx",
    telefono: "+52 81 4567 8901",
    direccion: "Parque Industrial 3, Monterrey",
    activo: true,
  },
  {
    id: 5,
    nombre: "Comercial Velázquez",
    contacto: "Roberto Velázquez",
    email: "rvelazquez@comvel.com",
    telefono: "+52 55 3456 7890",
    direccion: "Eje Central 320, CDMX",
    activo: true,
  },
  {
    id: 6,
    nombre: "Grupo Abastecedor del Sur",
    contacto: "Patricia Lugo",
    email: "plugo@gasur.com.mx",
    telefono: "+52 999 6789 0123",
    direccion: "Periférico Sur 140, Mérida",
    activo: false,
  },
];

const emptyForm: Omit<Proveedor, "id"> = {
  nombre: "",
  contacto: "",
  email: "",
  telefono: "",
  direccion: "",
  activo: true,
};

export default function ProveedorPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>(mockProveedores);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Proveedor | null>(null);
  const [form, setForm] = useState<Omit<Proveedor, "id">>(emptyForm);
  const [errores, setErrores] = useState<Partial<Record<keyof Omit<Proveedor, "id">, string>>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const filtrados = (proveedores ?? []).filter(
    (p) =>
      (p.nombre ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.contacto ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const abrirCrear = () => {
    setEditando(null);
    setForm(emptyForm);
    setErrores({});
    setShowModal(true);
  };

  const abrirEditar = (p: Proveedor) => {
    setEditando(p);
    const { id, ...rest } = p;
    setForm(rest);
    setErrores({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditando(null);
    setForm(emptyForm);
    setErrores({});
  };

  const validar = (): boolean => {
    const nuevosErrores: Partial<Record<keyof Omit<Proveedor, "id">, string>> = {};
    if (!(form.nombre ?? "").trim()) nuevosErrores.nombre = "El nombre es obligatorio.";
    if (!(form.contacto ?? "").trim()) nuevosErrores.contacto = "El contacto es obligatorio.";
    if (!(form.email ?? "").trim()) {
      nuevosErrores.email = "El email es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevosErrores.email = "Email inválido.";
    }
    if (!(form.telefono ?? "").trim()) nuevosErrores.telefono = "El teléfono es obligatorio.";
    if (!(form.direccion ?? "").trim()) nuevosErrores.direccion = "La dirección es obligatoria.";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardar = () => {
    if (!validar()) return;
    if (editando) {
      setProveedores((prev) =>
        (prev ?? []).map((p) => (p.id === editando.id ? { ...form, id: editando.id } : p))
      );
    } else {
      const nuevoId = Math.max(0, ...proveedores.map((p) => p.id)) + 1;
      setProveedores((prev) => [...prev, { ...form, id: nuevoId }]);
    }
    cerrarModal();
  };

  const eliminar = (id: number) => {
    setProveedores((prev) => (prev ?? []).filter((p) => p.id !== id));
    setConfirmDelete(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errores[name as keyof typeof errores]) {
      setErrores((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const activos = (proveedores ?? []).filter((p) => p.activo).length;
  const inactivos = proveedores?.length - activos;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col shrink-0">
          <div className="px-6 py-5 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <BuildingStorefrontIcon className="w-8 h-8 text-indigo-400" />
              <div>
                <p className="text-sm font-bold text-white leading-none">StockControl</p>
                <p className="text-xs text-slate-400 mt-0.5">Sistema de Inventario</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {[
              { label: "Dashboard", href: "/" },
              { label: "Productos", href: "/producto" },
              { label: "Categorías", href: "/categoria" },
              { label: "Proveedores", href: "/proveedor" },
              { label: "Movimientos de Stock", href: "/movimiento" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  href === "/proveedor"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="px-6 py-4 border-t border-slate-700">
            <p className="text-xs text-slate-500">© 2026 StockControl</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          {/* Breadcrumb */}
          <div className="text-sm text-slate-400 mb-6">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700 font-medium">Proveedores</span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Proveedores</h1>
              <p className="text-slate-500 text-sm mt-1">Gestión del catálogo de proveedores</p>
            </div>
            <button
              onClick={abrirCrear}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Nuevo Proveedor
            </button>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{proveedores?.length}</p>
              <p className="text-xs text-slate-400 mt-1">proveedores registrados</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Activos</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{activos}</p>
              <p className="text-xs text-slate-400 mt-1">en operación</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Inactivos</p>
              <p className="text-3xl font-bold text-slate-400 mt-1">{inactivos}</p>
              <p className="text-xs text-slate-400 mt-1">suspendidos</p>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-slate-700">
                Listado ({filtrados?.length})
              </h2>
              <div className="relative w-72">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, contacto o email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Empresa</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contacto</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Teléfono</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Dirección</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtrados?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm">
                        No se encontraron proveedores con ese criterio de búsqueda.
                      </td>
                    </tr>
                  ) : (
                    (filtrados ?? []).map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">{p.id}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800">{p.nombre}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{p.contacto}</td>
                        <td className="px-6 py-4">
                          <a href={`mailto:${p.email}`} className="text-indigo-600 hover:underline">
                            {p.email}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{p.telefono}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">{p.direccion}</td>
                        <td className="px-6 py-4 text-center">
                          {p.activo ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs font-medium px-2.5 py-1 rounded-full">
                              <XCircleIcon className="w-3.5 h-3.5" />
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => abrirEditar(p)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                              title="Editar"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(p.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Crear / Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {editando ? "Editar Proveedor" : "Nuevo Proveedor"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editando ? `Modificando: ${editando.nombre}` : "Completa los datos del proveedor"}
                </p>
              </div>
              <button
                onClick={cerrarModal}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nombre de la empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Distribuidora Norte S.A."
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errores.nombre ? "border-red-400 bg-red-50" : "border-slate-200"
                  }`}
                />
                {errores.nombre && <p className="text-xs text-red-500 mt-1">{errores.nombre}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Persona de contacto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contacto"
                  value={form.contacto}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errores.contacto ? "border-red-400 bg-red-50" : "border-slate-200"
                  }`}
                />
                {errores.contacto && <p className="text-xs text-red-500 mt-1">{errores.contacto}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="+52 55 0000 0000"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errores.telefono ? "border-red-400 bg-red-50" : "border-slate-200"
                  }`}
                />
                {errores.telefono && <p className="text-xs text-red-500 mt-1">{errores.telefono}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contacto@empresa.com"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errores.email ? "border-red-400 bg-red-50" : "border-slate-200"
                  }`}
                />
                {errores.email && <p className="text-xs text-red-500 mt-1">{errores.email}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Calle, número, ciudad"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errores.direccion ? "border-red-400 bg-red-50" : "border-slate-200"
                  }`}
                />
                {errores.direccion && <p className="text-xs text-red-500 mt-1">{errores.direccion}</p>}
              </div>

              <div className="col-span-2">
                <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={form.activo}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Proveedor activo</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                {editando ? "Guardar cambios" : "Crear proveedor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-2">¿Eliminar proveedor?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Esta acción no se puede deshacer. El proveedor será eliminado permanentemente del sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminar(confirmDelete)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}