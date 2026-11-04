import { createResourceService } from './resourceService'

export const categoriasService = createResourceService('categorias', [
  { id: 1, nombre: 'Equipos de cómputo', descripcion: 'Computadoras y periféricos', cantidad_productos: 2 },
  { id: 2, nombre: 'Accesorios', descripcion: 'Accesorios de oficina', cantidad_productos: 1 },
  { id: 3, nombre: 'Útiles de oficina', descripcion: 'Material de escritorio', cantidad_productos: 0 },
])
