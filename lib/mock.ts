// stub de datos auto-generado (seguro contra accesos a undefined)
const _arr: any = new Proxy([], { get: (t: any, p: any) => p in t ? t[p] : _arr });
const _obj: any = new Proxy({}, { get: () => _arr });
export const categorias: any = _arr;
export const categoriasMock: any = _arr;
export const movimientos: any = _arr;
export const movimientosStock: any = _arr;
export const productos: any = _arr;
export const proveedores: any = _arr;
