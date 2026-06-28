// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  address: string | null;
  role: 'user' | 'livestock_farmer' | 'receptionist' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: string;
}

// Pet / Livestock types
export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  birthDate: Date | null;
  weight: number | null;
  color: string | null;
  photo: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PetFormData {
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  birthDate?: string;
  weight?: number;
  color?: string;
  photo?: string;
  notes?: string;
}

// Veterinarian types
export interface Veterinarian {
  id: string;
  name: string;
  specialization: string;
  clinic: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  photo: string | null;
  qualification: string | null;
  experience: number | null;
  rating: number;
  reviewCount: number;
  consultationFee: number | null;
  availability: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  [key: string]: { start: string; end: string } | null;
}

// Appointment types
export interface Appointment {
  id: string;
  userId: string;
  petId: string;
  vetId: string;
  date: Date;
  time: string;
  duration: number;
  reason: string | null;
  type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  fee: number | null;
  createdAt: Date;
  updatedAt: Date;
  pet?: Pet;
  vet?: Veterinarian;
}

export interface AppointmentFormData {
  petId: string;
  vetId: string;
  date: string;
  time: string;
  duration?: number;
  reason?: string;
  type?: string;
  notes?: string;
}

// Vaccination types
export interface Vaccination {
  id: string;
  petId: string;
  userId: string;
  name: string;
  type: string | null;
  manufacturer: string | null;
  dateAdministered: Date | null;
  nextDueDate: Date | null;
  veterinarian: string | null;
  clinic: string | null;
  batchNumber: string | null;
  notes: string | null;
  status: 'scheduled' | 'completed' | 'overdue' | 'cancelled';
  reminderSent: boolean;
  reminderDays: number;
  createdAt: Date;
  updatedAt: Date;
  pet?: Pet;
}

export interface VaccinationFormData {
  petId: string;
  name: string;
  type?: string;
  manufacturer?: string;
  dateAdministered?: string;
  nextDueDate?: string;
  veterinarian?: string;
  clinic?: string;
  batchNumber?: string;
  notes?: string;
  reminderDays?: number;
}

// Marketplace types
export interface MarketplaceProduct {
  id: string;
  farmerId: string;
  title: string;
  description: string;
  category: 'milk_dairy' | 'fresh_meat' | 'live_animals' | 'animal_feed' | 'equipment';
  price: number;
  unit: string;
  stock: number;
  images: string[];
  farmerName?: string;
  farmerPhone?: string;
  createdAt: Date;
}

export interface MarketplaceOrder {
  id: string;
  buyerId: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  shippingAddress: string;
  createdAt: Date;
  items?: MarketplaceOrderItem[];
}

export interface MarketplaceOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: MarketplaceProduct;
}

// Feedback types
export interface Feedback {
  id: string;
  userId: string;
  rating: number;
  category: string;
  subject: string | null;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  adminResponse: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface FeedbackFormData {
  rating: number;
  category: string;
  subject?: string;
  message: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'vaccination' | 'appointment' | 'system' | 'marketplace';
  title: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Stats types
export interface DashboardStats {
  totalPets: number;
  totalAppointments: number;
  upcomingVaccinations: number;
  totalMarketplaceOrders?: number;
}

