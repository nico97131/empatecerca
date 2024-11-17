import api from './api';

export const getAllVolunteers = async () => {
  const response = await api.get('/volunteers');
  return response.data;
};

export const getVolunteer = async (id: string) => {
  const response = await api.get(`/volunteers/${id}`);
  return response.data;
};

export const createVolunteer = async (volunteerData: any) => {
  const response = await api.post('/volunteers', volunteerData);
  return response.data;
};

export const updateVolunteer = async (id: string, volunteerData: any) => {
  const response = await api.put(`/volunteers/${id}`, volunteerData);
  return response.data;
};

export const deleteVolunteer = async (id: string) => {
  const response = await api.delete(`/volunteers/${id}`);
  return response.data;
};

export const updateAvailability = async (id: string, availability: string[]) => {
  const response = await api.put(`/volunteers/${id}/availability`, { availability });
  return response.data;
};

export const getVolunteerGroups = async (id: string) => {
  const response = await api.get(`/volunteers/${id}/groups`);
  return response.data;
};