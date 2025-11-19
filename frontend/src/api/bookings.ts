import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export const createBooking = async (bookingData: { overview: number; package: number; preferred_date: string }) => {
  const res = await axios.post(`${API_BASE}/book/`, bookingData);
  return res.data;
};

export const getBuyerOrders = async () => {
  const res = await axios.get(`${API_BASE}/orders/`);
  return res.data;
};

export const getSellerBookings = async () => {
  const res = await axios.get(`${API_BASE}/seller/bookings/`);
  return res.data;
};

export const updateBookingStatus = async (bookingId: number, status: string) => {
  const res = await axios.post(`${API_BASE}/booking/update/${bookingId}/${status}/`);
  return res.data;
};