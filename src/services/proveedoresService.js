import { createResourceService } from './resourceService'

export const proveedoresService = createResourceService('proveedores', [
  { id: 1, razon_social: 'Tecnología Andina S.A.C.', contacto: 'María López', telefono: '01 555 0142', email: 'ventas@tecnologiaandina.pe' },
  { id: 2, razon_social: 'Distribuidora Central', contacto: 'Carlos Ruiz', telefono: '01 555 0276', email: 'contacto@dcentral.pe' },
])
