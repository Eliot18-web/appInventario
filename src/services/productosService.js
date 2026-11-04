import { createResourceService } from './resourceService'

export const productosService = createResourceService('productos', [
  { id: 1, nombre: 'Laptop Lenovo ThinkPad', descripcion: 'Portátil para oficina', precio: 2899, stock: 12, categoria: 'Equipos de cómputo', categoria_id: 1 },
  { id: 2, nombre: 'Mouse inalámbrico', descripcion: 'Conexión USB', precio: 59.9, stock: 4, categoria: 'Accesorios', categoria_id: 2 },
  { id: 3, nombre: 'Monitor LED 24 pulgadas', descripcion: 'Resolución Full HD', precio: 679, stock: 8, categoria: 'Equipos de cómputo', categoria_id: 1 },
])
