import { createResourceService } from './resourceService'

export const usuariosService = createResourceService('usuarios', [
  { id: 1, nombre: 'Administrador', email: 'admin@senati.edu.pe', rol: 'Administrador', estado: 'Activo' },
  { id: 2, nombre: 'María López', email: 'maria@senati.edu.pe', rol: 'Almacén', estado: 'Activo' },
  { id: 3, nombre: 'Carlos Ruiz', email: 'carlos@senati.edu.pe', rol: 'Consulta', estado: 'Inactivo' },
])
