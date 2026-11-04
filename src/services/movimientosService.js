import { createResourceService } from './resourceService'

export const movimientosService = createResourceService('movimientos', [
  { id: 1, fecha: '2026-10-28T15:40:00', producto: 'Laptop Lenovo ThinkPad', tipo: 'Entrada', cantidad: 5, usuario: 'María López' },
  { id: 2, fecha: '2026-10-28T13:15:00', producto: 'Mouse inalámbrico', tipo: 'Salida', cantidad: 2, usuario: 'Administrador' },
  { id: 3, fecha: '2026-10-27T09:30:00', producto: 'Monitor LED 24 pulgadas', tipo: 'Ajuste', cantidad: 1, usuario: 'María López' },
])

export const registrarMovimiento = (movimiento) => movimientosService.create(movimiento)
