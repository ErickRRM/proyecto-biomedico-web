import api from './api'

export const getUsers = () =>
  api.get('/admin/users')

export const createUser = (data) =>
  api.post('/admin/users', data)

export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data)

export const toggleUser = (id) =>
  api.patch(`/admin/users/${id}/toggle`)