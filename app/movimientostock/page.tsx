"use client";
export const dynamic = "force-dynamic";
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { movimientosStock, productos, proveedores } from '@/lib/mock'

type TipoMovimiento = 'entrada' | 'salida' | 'ajuste'

interface MovimientoStock {
  id: number
  tipo: TipoMovimiento
  productoId: number
  productoNombre: string
  cantidad: number
  fecha: string
  proveedorId?: number
  proveedorNombre?: string
  motivo: string
  usuario: string
  stockAnterior: number
  stockNuevo: number
}

interface Producto {
  id: number
  nombre: string
  stock: number
}

interface Proveedor {
  id: number
  nombre: string
}

const TIPOS: TipoMovimiento[] = ['entrada', 'salida', 'ajuste']

const tipoConfig: Record<TipoMovimiento, { label: string; color: string; bg: string; icon: string }> = {
  entrada: { label: 'Entrada', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: '↑' },
  salida: { label: 'Salida', color: 'text-red-700', bg: 'bg-red-100', icon: '↓' },
  ajuste: { label: 'Ajuste', color: 'text-amber-700', bg: 'bg-amber-100', icon: '⇄' },
}

const emptyForm = (): Omit<MovimientoStock, 'id'> => ({
  tipo: 'entrada',
  productoId: 0,
  productoNombre: '',
  cantidad: 1,
  fecha: new Date().toISOString().slice(0, 10),
  proveedorId: undefined,
  proveedorNombre: undefined,
  motivo: '',
  usuario: 'almacen',
  stockAnterior: 0,
  stockNuevo: 0,
})

export default function MovimientoStockPage() {
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>(movimientosStock as MovimientoStock[])
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<MovimientoStock | null>(null)
  const [form, setForm] = useState<Omit<MovimientoStock, 'id'>>(emptyForm())
  const [filtroTipo, setFiltroTipo] = useState<TipoMovimiento | 'todos'>('todos')
  const [filtroTexto, setFiltroTexto] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const prodList = productos as Producto[]
  const provList = proveedores as Proveedor[]

  const filtrados = useMemo(() => {
    return (movimientos ?? []).filter((m) => {
      const matchTipo = filtroTipo === 'todos' || m.tipo === filtroTipo
      const matchTexto =
        filtroTexto === '' ||
        (m.productoNombre ?? "").toLowerCase().includes(filtroTexto.toLowerCase()) ||
        (m.motivo ?? "").toLowerCase().includes(filtroTexto.toLowerCase()) ||
        (m.usuario ?? "").toLowerCase().includes(filtroTexto.toLowerCase())
      return matchTipo && matchTexto
    })
  }, [movimientos, filtroTipo, filtroTexto])

  const resumen = useMemo(() => {
    const entradas = (movimientos ?? []).filter((m) => m.tipo === 'entrada').reduce((a, m) => a + m.cantidad, 0)
    const salidas = (movimientos ?? []).filter((m) => m.tipo === 'salida').reduce((a, m) => a + m.cantidad, 0)
    const ajustes = (movimientos ?? []).filter((m) => m.tipo === 'ajuste').length
    return { entradas, salidas, ajustes, total: movimientos?.length }
  }, [movimientos])

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.productoId || form.productoId === 0) e.productoId = 'Selecciona un producto'
    if (!form.cantidad || form.cantidad <= 0) e.cantidad = 'La cantidad debe ser mayor a 0'
    if (!(form.motivo ?? "").trim()) e.motivo = 'El motivo es obligatorio'
    if (!form.fecha) e.fecha = 'La fecha es obligatoria'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleProductoChange(productoId: number) {
    const prod = (prodList ?? []).find((p) => p.id === productoId)
    if (!prod) return
    const stockActual = prod.stock
    const nuevaCantidad = form.cantidad
    const nuevoStock =
      form.tipo === 'entrada'
        ? stockActual + nuevaCantidad
        : form.tipo === 'salida'
        ? Math.max(0, stockActual - nuevaCantidad)
        : stockActual + nuevaCantidad

    setForm((f) => ({
      ...f,
      productoId,
      productoNombre: prod.nombre,
      stockAnterior: stockActual,
      stockNuevo: nuevoStock,
    }))
  }

  function handleTipoChange(tipo: TipoMovimiento) {
    const prod = (prodList ?? []).find((p) => p.id === form.productoId)
    const stockActual = prod?.stock ?? form.stockAnterior
    const nuevaCantidad = form.cantidad
    const nuevoStock =
      tipo === 'entrada'
        ? stockActual + nuevaCantidad
        : tipo === 'salida'
        ? Math.max(0, stockActual - nuevaCantidad)
        : stockActual + nuevaCantidad

    setForm((f) => ({ ...f, tipo, stockAnterior: stockActual, stockNuevo: nuevoStock }))
  }

  function handleCantidadChange(cantidad: number) {
    const prod = (prodList ?? []).find((p) => p.id === form.productoId)
    const stockActual = prod?.stock ?? form.stockAnterior
    const nuevoStock =
      form.tipo === 'entrada'
        ? stockActual + cantidad
        : form.tipo === 'salida'
        ? Math.max(0, stockActual - cantidad)
        : stockActual + cantidad

    setForm((f) => ({ ...f, cantidad, stockAnterior: stockActual, stockNuevo: nuevoStock }))
  }

  function handleProveedorChange(proveedorId: number) {
    const prov = (provList ?? []).find((p) => p.id === proveedorId)
    setForm((f) => ({
      ...f,
      proveedorId: proveedorId || undefined,
      proveedorNombre: prov?.nombre ?? undefined,
    }))
  }

  function openNuevo() {
    setEditando(null)
    setForm(emptyForm())
    setErrors({})
    setShowModal(true)
  }

  function openEditar(mov: MovimientoStock) {
    setEditando(mov)
    setForm({ ...mov })
    setErrors({})
    setShowModal(true)
  }

  function handleGuardar() {
    if (!validate()) return
    if (editando) {
      setMovimientos((prev) => (prev ?? []).map((m) => (m.id === editando.id ? { ...form, id: editando.id } : m)))
    } else {
      const newId = movimientos?.length > 0 ? Math.max(...movimientos.map((m) => m.id)) + 1 : 1
      setMovimientos((prev) => [{ ...form, id: newId }, ...prev])
    }
    setShowModal(false)
    setEditando(null)
    setForm(emptyForm())
  }

  function handleEliminar(id: number) {
    setMovimientos((prev) => (prev ?? []).filter((m) => m.id !== id))
    setConfirmDelete(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Movimientos de Stock</h1>
            <p className="text-sm text-gray-500">Registro de entradas, salidas y ajustes de inventario</p>
          </div>
        </div>
        <button
          onClick={openNuevo}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Movimiento
        </button>
      </header>

      <main className="px-6 py-6 max-w-7xl mx-auto space-y-6">
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-lg">
              #
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Movimientos</p>
              <p className="text-2xl font-bold text-gray-900">{resumen.total}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-lg">
              ↑
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Unidades Entradas</p>
              <p className="text-2xl font-bold text-emerald-600">{resumen.entradas}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold text-lg">
              ↓
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Unidades Salidas</p>
              <p className="text-2xl font-bold text-red-600">{resumen.salidas}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-bold text-lg">
              ⇄
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Ajustes</p>
              <p className="text-2xl font-bold text-amber-600">{resumen.ajustes}</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar por producto, motivo o usuario..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['todos', ...TIPOS] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  filtroTipo === tipo
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {tipo === 'todos'
                  ? 'Todos'
                  : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">
              Registros{' '}
              <span className="text-sm font-normal text-gray-400">
                ({filtrados?.length} de {movimientos?.length})
              </span>
            </h2>
          </div>
          {filtrados?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="font-medium">No hay movimientos que coincidan</p>
              <p className="text-sm mt-1">Ajusta los filtros o crea un nuevo movimiento</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Cantidad</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Proveedor</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Motivo</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(filtrados ?? []).map((mov) => {
                    const cfg = tipoConfig[mov.tipo]
                    return (
                      <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{mov.id}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
                          >
                            <span>{cfg.icon}</span>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{mov.productoNombre}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-bold ${
                              mov.tipo === 'entrada'
                                ? 'text-emerald-600'
                                : mov.tipo === 'salida'
                                ? 'text-red-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {mov.tipo === 'salida' ? '-' : '+'}
                            {mov.cantidad}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="font-mono">{mov.stockAnterior}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="font-mono font-semibold text-gray-800">{mov.stockNuevo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{mov.proveedorNombre ?? '—'}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{mov.motivo}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium ${
                              mov.usuario === 'administracion'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {mov.usuario}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{mov.fecha}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditar(mov)}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => setConfirmDelete(mov.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Crear / Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editando ? 'Editar Movimiento' : 'Nuevo Movimiento'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimiento</label>
                <div className="grid grid-cols-3 gap-2">
                  {(TIPOS ?? []).map((tipo) => {
                    const cfg = tipoConfig[tipo]
                    return (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => handleTipoChange(tipo)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                          form.tipo === tipo
                            ? `border-current ${cfg.bg} ${cfg.color}`
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-base">{cfg.icon}</span>
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Producto *</label>
                <select
                  value={form.productoId}
                  onChange={(e) => handleProductoChange(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${
                    errors.productoId ? 'border-red-400' : 'border-gray-200'
                  }`}
                >
                  <option value={0}>Seleccionar producto...</option>
                  {(prodList ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (stock: {p.stock})
                    </option>
                  ))}
                </select>
                {errors.productoId && <p className="mt-1 text-xs text-red-500">{errors.productoId}</p>}
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad *</label>
                <input
                  type="number"
                  min={1}
                  value={form.cantidad}
                  onChange={(e) => handleCantidadChange(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.cantidad ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.cantidad && <p className="mt-1 text-xs text-red-500">{errors.cantidad}</p>}
                {form.productoId > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Stock previo: <span className="font-semibold">{form.stockAnterior}</span> → Nuevo:{' '}
                    <span
                      className={`font-bold ${
                        form.tipo === 'entrada'
                          ? 'text-emerald-600'
                          : form.tipo === 'salida'
                          ? 'text-red-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {form.stockNuevo}
                    </span>
                  </p>
                )}
              </div>

              {/* Proveedor (solo entradas) */}
              {form.tipo === 'entrada' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Proveedor</label>
                  <select
                    value={form.proveedorId ?? 0}
                    onChange={(e) => handleProveedorChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value={0}>Sin proveedor</option>
                    {(provList ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha *</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.fecha ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.fecha && <p className="mt-1 text-xs text-red-500">{errors.fecha}</p>}
              </div>

              {/* Usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
                <select
                  value={form.usuario}
                  onChange={(e) => setForm((f) => ({ ...f, usuario: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="almacen">almacen</option>
                  <option value="administracion">administracion</option>
                </select>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo / Descripción *</label>
                <textarea
                  rows={3}
                  value={form.motivo}
                  onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
                  placeholder="Describe el motivo del movimiento..."
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                    errors.motivo ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.motivo && <p className="mt-1 text-xs text-red-500">{errors.motivo}</p>}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
              >
                {editando ? 'Guardar Cambios' : 'Registrar Movimiento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Eliminar Movimiento</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Esta acción no se puede deshacer. ¿Confirmas la eliminación del movimiento{' '}
                  <span className="font-semibold text-gray-700">#{confirmDelete}</span>?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(confirmDelete)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}