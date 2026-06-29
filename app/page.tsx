"use client";
export const dynamic = "force-dynamic";
import { Hero } from "@/components/ui/Hero";
import { POSBoard } from "@/components/ui/POSBoard";
import Link from "next/link";
import { productos, categorias, proveedores, movimientos } from "@/lib/mock";
import {
  Package,
  Tag,
  Truck,
  ArrowUpDown,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from "lucide-react";

const stockBajo = (productos ?? []).filter((p) => p.stock <= p.stockMinimo);
const totalStock = (productos ?? []).reduce((acc, p) => acc + p.stock, 0);
const entradasMes = (movimientos ?? []).filter((m) => m.tipo === "entrada").length;
const salidasMes = (movimientos ?? []).filter((m) => m.tipo === "salida").length;

const movimientosRecientes = [...movimientos]
  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  .slice(0, 8);

function getProductoNombre(id: number) {
  return (productos ?? []).find((p) => p.id === id)?.nombre ?? "—";
}

function getCategoriaNombre(id: number) {
  return (categorias ?? []).find((c) => c.id === id)?.nombre ?? "—";
}

function getProveedorNombre(id: number) {
  return (proveedores ?? []).find((p) => p.id === id)?.nombre ?? "—";
}

interface MetricCardProps {
  titulo: string;
  valor: string | number;
  subtexto: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

function MetricCard({ titulo, valor, subtexto, icon, color, href }: MetricCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{titulo}</p>
          <p className="text-3xl font-bold text-gray-900 mt-0.5">{valor}</p>
          <p className="text-xs text-gray-500 mt-1">{subtexto}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors self-center" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 lg:px-10 lg:py-10">
      <Hero title="Panel de Control" subtitle="Resumen de tu operación de un vistazo." />
      <div className="mt-2"><h2 className="mb-3 text-lg font-semibold text-slate-900">Vista rápida</h2><POSBoard products={[{ id: "p1", name: "Arroz libra", price: 3200, category: "Granos", stock: 12 }, { id: "p2", name: "Aceite 1L", price: 9500, category: "Despensa", stock: 8 }, { id: "p3", name: "Leche litro", price: 4200, category: "Lácteos", stock: 5 }, { id: "p4", name: "Huevos x30", price: 16000, category: "Lácteos", stock: 20 }, { id: "p5", name: "Gaseosa", price: 3500, category: "Bebidas", stock: 3 }, { id: "p6", name: "Jabón", price: 2800, category: "Aseo", stock: 15 }]} /></div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panel de Control</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen general del inventario —{" "}
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <MetricCard
          titulo="Productos"
          valor={productos?.length}
          subtexto={`${totalStock} unidades en stock total`}
          icon={<Package className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50"
          href="/productos"
        />
        <MetricCard
          titulo="Stock Bajo"
          valor={stockBajo?.length}
          subtexto="Productos bajo stock mínimo"
          icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}
          color="bg-amber-50"
          href="/productos"
        />
        <MetricCard
          titulo="Proveedores"
          valor={proveedores?.length}
          subtexto={`${categorias?.length} categorías activas`}
          icon={<Truck className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50"
          href="/proveedores"
        />
        <MetricCard
          titulo="Movimientos"
          valor={movimientos?.length}
          subtexto={`${entradasMes} entradas · ${salidasMes} salidas`}
          icon={<ArrowUpDown className="w-6 h-6 text-violet-600" />}
          color="bg-violet-50"
          href="/movimientos"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Movimientos Recientes</h2>
            <Link href="/movimientos" className="text-xs text-blue-600 hover:underline font-medium">
              Ver todos
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Cantidad</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Proveedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(movimientosRecientes ?? []).map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900 max-w-[180px] truncate">
                      {getProductoNombre(m.productoId)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.tipo === "entrada"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {m.tipo === "entrada" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {(m.tipo ?? "").charAt(0).toUpperCase() + m.tipo.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-700">{m.cantidad}</td>
                    <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(m.fecha).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3 text-gray-500 truncate max-w-[140px]">
                      {m.proveedorId ? getProveedorNombre(m.proveedorId) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Stock Bajo
              </h2>
              <Link href="/productos" className="text-xs text-blue-600 hover:underline font-medium">
                Ver todos
              </Link>
            </div>
            <ul className="divide-y divide-gray-50">
              {stockBajo?.length === 0 && (
                <li className="px-5 py-4 text-sm text-gray-400 text-center">Sin alertas de stock</li>
              )}
              {(stockBajo ?? []).map((p) => (
                <li
                  key={p.id}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-400">{getCategoriaNombre(p.categoriaId)}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="inline-block bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {p.stock} uds
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">mín. {p.stockMinimo}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-500" />
                Categorías
              </h2>
              <Link href="/categorias" className="text-xs text-blue-600 hover:underline font-medium">
                Gestionar
              </Link>
            </div>
            <ul className="divide-y divide-gray-50">
              {(categorias ?? []).map((c) => {
                const count = (productos ?? []).filter((p) => p.categoriaId === c.id).length;
                return (
                  <li
                    key={c.id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-700">{c.nombre}</span>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">
                      {count} prod.
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}