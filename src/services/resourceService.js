import api from './api'

const stores = new Map()

export function createResourceService(resource, initialItems = []) {
  stores.set(resource, initialItems.map((item) => ({ ...item })))
  const isMissingEndpoint = (error) => error?.response?.status === 404

  const list = async (params = {}) => {
    try {
      const response = await api.get(`/api/${resource}`, { params })
      return {
        data: response.data.data,
        pagination: response.data.pagination,
        total: response.data.pagination?.total ?? response.data.total,
      }
    } catch (error) {
      if (!isMissingEndpoint(error)) throw error
      // TODO: Replace this in-memory fallback when the API endpoint is available.
      const items = stores.get(resource) ?? []
      const search = String(params.search ?? '').toLocaleLowerCase()
      const filtered = search
        ? items.filter((item) => Object.values(item).some((value) => String(value ?? '').toLocaleLowerCase().includes(search)))
        : items
      const page = Number(params.page) || 1
      const limit = Number(params.limit) || 10
      return { data: filtered.slice((page - 1) * limit, page * limit), total: filtered.length, page, limit }
    }
  }

  const create = async (item) => {
    try {
      const response = await api.post(`/api/${resource}`, item)
      return response.data.data ?? response.data
    } catch (error) {
      if (!isMissingEndpoint(error)) throw error
      // TODO: Remove the mock write when the API endpoint is available.
      const items = stores.get(resource) ?? []
      const created = { ...item, id: Date.now() }
      stores.set(resource, [created, ...items])
      return created
    }
  }

  const update = async (id, item) => {
    try {
      const response = await api.put(`/api/${resource}/${id}`, item)
      return response.data.data ?? response.data
    } catch (error) {
      if (!isMissingEndpoint(error)) throw error
      // TODO: Remove the mock write when the API endpoint is available.
      const updated = { ...item, id }
      stores.set(resource, (stores.get(resource) ?? []).map((entry) => String(entry.id) === String(id) ? updated : entry))
      return updated
    }
  }

  const remove = async (id) => {
    try {
      const response = await api.delete(`/api/${resource}/${id}`)
      return response.data.data ?? response.data
    } catch (error) {
      if (!isMissingEndpoint(error)) throw error
      // TODO: Remove the mock write when the API endpoint is available.
      stores.set(resource, (stores.get(resource) ?? []).filter((entry) => String(entry.id) !== String(id)))
      return { id }
    }
  }

  return { list, create, update, remove }
}

export function getItems(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

export function getTotal(payload, items) {
  return Number(payload?.total ?? payload?.totalItems ?? payload?.count ?? payload?.pagination?.total ?? payload?.data?.total ?? items.length)
}

export function getErrorMessage(error, fallback) {
  if (error?.response?.status === 401) {
    return 'Tu sesión expiró. Inicia sesión nuevamente.'
  }
  if (error?.response?.status === 403) {
    return 'No tienes permisos para realizar esta acción.'
  }

  const responseData = error?.response?.data
  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors
      .map(({ field, message }) => [field, message].filter(Boolean).join(': '))
      .join(' · ')
  }
  return responseData?.message ?? responseData?.error ?? error?.message ?? fallback
}
