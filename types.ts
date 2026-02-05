
export interface WorkingHour {
  day: string;
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  isOpen: boolean;
}

export interface Staff {
  id: number;
  name: string;
  phone: string;
  email: string;
  workingHours: WorkingHour[];
}

export interface Service {
  id: number;
  name: string;
  category: 'Saç' | 'Makyaj' | 'Tırnak' | 'Cilt' | 'Masaj' | string;
  duration: number; // in minutes
  price: number;
  color: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  totalSpent: number;
  notes?: string;
}

export interface Appointment {
  id: number;
  customerId: number;
  staffId: number;
  serviceIds: number[];
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
}

export interface StaffLeave {
  id: number;
  staffId: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  type: 'Yıllık İzin' | 'Rapor' | 'Ücretsiz İzin' | 'Diğer';
  description?: string;
}

// Seans Takibi İçin Yeni Tipler
export interface SessionPackage {
  id: number;
  customerId: number;
  packageName: string; // Örn: "10 Seans Lazer Epilasyon"
  startDate: string; // YYYY-MM-DD
  
  // Seans Durumları (Görseldeki kutucuklar için)
  totalSessions: number;
  completedSessions: number;
  scheduledSessions: number;
  cancelledSessions: number;
  
  // Finansal Durum
  totalPrice: number;
  paidAmount: number;
}

// Ajanda Notları İçin Yeni Tip
export interface Note {
  id: number;
  title: string;
  subject: string;
  content: string;
  hasReminder: boolean;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'read' | 'unread'; // Okundu / Okunmadı
  creator: string; // Oluşturan kişi
}

// Stats for dashboard
export interface DashboardStats {
  todayAppointments: number;
  weekAppointments: number;
  totalRevenue: number;
  pendingPayment: number;
}
