import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Staff, Service, Customer, Appointment, StaffLeave, WorkingHour, SessionPackage, Note } from '../types';

const defaultWorkingHours: WorkingHour[] = [
  { day: "Pazartesi", startTime: "09:00", endTime: "19:00", isOpen: true },
  { day: "Salı", startTime: "09:00", endTime: "19:00", isOpen: true },
  { day: "Çarşamba", startTime: "09:00", endTime: "19:00", isOpen: true },
  { day: "Perşembe", startTime: "09:00", endTime: "19:00", isOpen: true },
  { day: "Cuma", startTime: "09:00", endTime: "19:00", isOpen: true },
  { day: "Cumartesi", startTime: "10:00", endTime: "18:00", isOpen: true },
  { day: "Pazar", startTime: "00:00", endTime: "00:00", isOpen: false },
];

// Mock Data Definitions
const initialStaff: Staff[] = [
  { id: 1, name: "Ayşe Yılmaz", phone: "0555 111 2233", email: "ayse@salon.com", workingHours: defaultWorkingHours },
  { id: 2, name: "Mehmet Demir", phone: "0555 444 5566", email: "mehmet@salon.com", workingHours: defaultWorkingHours },
  { id: 3, name: "Zeynep Kaya", phone: "0555 777 8899", email: "zeynep@salon.com", workingHours: defaultWorkingHours }
];

const initialServices: Service[] = [
  { id: 1, name: "Saç Kesimi", category: "Saç", duration: 60, price: 500, color: "#FF7676" },
  { id: 2, name: "Saç Boyama", category: "Saç", duration: 120, price: 1000, color: "#FF7676" },
  { id: 3, name: "Fön", category: "Saç", duration: 30, price: 200, color: "#FFD966" },
  { id: 4, name: "Manikür", category: "Tırnak", duration: 30, price: 150, color: "#6B9B37" },
  { id: 5, name: "Pedikür", category: "Tırnak", duration: 45, price: 200, color: "#6B9B37" },
  { id: 6, name: "Günlük Makyaj", category: "Makyaj", duration: 45, price: 400, color: "#5B9BD5" },
  { id: 7, name: "Gece Makyajı", category: "Makyaj", duration: 90, price: 800, color: "#5B9BD5" },
  { id: 8, name: "Cilt Temizliği", category: "Cilt", duration: 60, price: 600, color: "#A67BC6" },
  { id: 9, name: "Peeling", category: "Cilt", duration: 45, price: 500, color: "#A67BC6" },
  { id: 10, name: "Masaj", category: "Masaj", duration: 60, price: 700, color: "#FF9F40" }
];

const initialCustomers: Customer[] = [
  { id: 1, name: "Elif Şahin", phone: "0533 111 2233", email: "elif@gmail.com", totalSpent: 2500 },
  { id: 2, name: "Ahmet Yıldız", phone: "0533 444 5566", email: "ahmet@gmail.com", totalSpent: 1800 },
  { id: 3, name: "Selin Bakır", phone: "0532 123 4567", email: "selin@gmail.com", totalSpent: 4500 },
  { id: 4, name: "Caner Erkin", phone: "0544 987 6543", email: "caner@gmail.com", totalSpent: 1200 },
];

const initialLeaves: StaffLeave[] = [
  { id: 1, staffId: 1, startDate: '2025-08-10', endDate: '2025-08-17', type: 'Yıllık İzin', description: 'Yaz tatili' },
  { id: 2, staffId: 2, startDate: '2025-02-20', endDate: '2025-02-21', type: 'Rapor', description: 'Grip' }
];

const initialSessionPackages: SessionPackage[] = [
  { 
    id: 1, 
    customerId: 3, 
    packageName: "10 Seans Lazer Epilasyon (Tüm Vücut)", 
    startDate: "2025-01-15", 
    totalSessions: 10, 
    completedSessions: 2, 
    scheduledSessions: 1, 
    cancelledSessions: 0, 
    totalPrice: 5000, 
    paidAmount: 2500 
  },
  { 
    id: 2, 
    customerId: 1, 
    packageName: "8 Seans Cilt Bakım Kürü", 
    startDate: "2025-02-01", 
    totalSessions: 8, 
    completedSessions: 0, 
    scheduledSessions: 2, 
    cancelledSessions: 0, 
    totalPrice: 3200, 
    paidAmount: 3200 
  },
  { 
    id: 3, 
    customerId: 2, 
    packageName: "10 Seans G5 Masajı", 
    startDate: "2024-12-10", 
    totalSessions: 10, 
    completedSessions: 5, 
    scheduledSessions: 0, 
    cancelledSessions: 1, 
    totalPrice: 4000, 
    paidAmount: 4000 
  }
];

const today = new Date().toISOString().split('T')[0];

const initialNotes: Note[] = [
  {
    id: 1,
    title: "Elektrik",
    subject: "Son Ödeme",
    content: "Ödeme tarihi geçmeden öde!",
    hasReminder: true,
    date: today,
    time: "13:00",
    status: "read",
    creator: "Mehmet Demir"
  },
  {
    id: 2,
    title: "Ürün",
    subject: "Lazer Kremi",
    content: "Ödemesi yapıldı.",
    hasReminder: true,
    date: today,
    time: "16:30",
    status: "read",
    creator: "Ayşe Yılmaz"
  },
  {
    id: 3,
    title: "Müşteri Alacağı",
    subject: "Tırnak Ödemesi",
    content: "500 tl alınacak.",
    hasReminder: true,
    date: today,
    time: "16:00",
    status: "unread",
    creator: "Zeynep Kaya"
  },
  {
    id: 4,
    title: "Ön Görüşme",
    subject: "Teyit araması yap",
    content: "Lazer paketini anlat.",
    hasReminder: true,
    date: today,
    time: "17:00",
    status: "read",
    creator: "Mehmet Demir"
  }
];

const initialAppointments: Appointment[] = [
  {
    id: 1,
    customerId: 1,
    staffId: 1,
    serviceIds: [1, 3],
    date: today,
    startTime: "10:00",
    endTime: "11:30",
    totalPrice: 700,
    status: "confirmed",
    notes: "Katları kısa kessin"
  },
  {
    id: 2,
    customerId: 2,
    staffId: 2,
    serviceIds: [10],
    date: today,
    startTime: "14:00",
    endTime: "15:00",
    totalPrice: 700,
    status: "pending",
    notes: "Bel ağrısı var"
  },
  {
    id: 3,
    customerId: 3,
    staffId: 3,
    serviceIds: [4, 5],
    date: today,
    startTime: "09:00",
    endTime: "10:15",
    totalPrice: 350,
    status: "completed",
    notes: ""
  }
];

interface AppState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  
  // UI State
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  isMobileMenuOpen: boolean; // Yeni
  toggleMobileMenu: () => void; // Yeni
  closeMobileMenu: () => void; // Yeni

  staff: Staff[];
  services: Service[];
  customers: Customer[];
  appointments: Appointment[];
  leaves: StaffLeave[];
  sessionPackages: SessionPackage[];
  notes: Note[];
  
  // Actions
  addAppointment: (appointment: Omit<Appointment, 'id'>) => boolean; 
  updateAppointment: (id: number, data: Partial<Appointment>) => void;
  deleteAppointment: (id: number) => void;
  checkAvailability: (staffId: number, date: string, startTime: string, endTime: string, excludeId?: number) => boolean;
  
  addCustomer: (customer: Omit<Customer, 'id' | 'totalSpent'>) => void;
  deleteCustomer: (id: number) => void;
  updateCustomer: (id: number, data: Partial<Customer>) => void;
  
  addService: (service: Omit<Service, 'id'>) => void;
  deleteService: (id: number) => void;
  updateService: (id: number, data: Partial<Service>) => void;

  updateStaff: (id: number, data: Partial<Staff>) => void;

  addLeave: (leave: Omit<StaffLeave, 'id'>) => void;
  deleteLeave: (id: number) => void;

  // Session Package Actions
  addSessionPackage: (pkg: Omit<SessionPackage, 'id'>) => void;
  deleteSessionPackage: (id: number) => void;

  // Note Actions
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (id: number, data: Partial<Note>) => void;
  deleteNote: (id: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),
      
      // UI Defaults
      isSidebarExpanded: false,
      toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
      isMobileMenuOpen: false,
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),

      staff: initialStaff,
      services: initialServices,
      customers: initialCustomers,
      appointments: initialAppointments,
      leaves: initialLeaves,
      sessionPackages: initialSessionPackages,
      notes: initialNotes,

      checkAvailability: (staffId, date, startTime, endTime, excludeId) => {
        const { appointments } = get();
        // Convert times to comparable numbers (minutes from midnight)
        const getMinutes = (t: string) => {
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m;
        };

        const newStart = getMinutes(startTime);
        const newEnd = getMinutes(endTime);

        const conflict = appointments.find(apt => {
          if (apt.id === excludeId) return false;
          if (apt.staffId !== staffId) return false;
          if (apt.date !== date) return false;
          if (apt.status === 'cancelled') return false;

          const aptStart = getMinutes(apt.startTime);
          const aptEnd = getMinutes(apt.endTime);

          return (newStart < aptEnd && newEnd > aptStart);
        });

        return !conflict;
      },

      addAppointment: (data) => {
        const { checkAvailability, customers, appointments } = get();
        if (!checkAvailability(data.staffId, data.date, data.startTime, data.endTime)) {
          return false; // Conflict detected
        }

        const id = Math.max(0, ...appointments.map(a => a.id)) + 1;
        
        // Update customer total spent
        const customerIndex = customers.findIndex(c => c.id === data.customerId);
        let newCustomers = [...customers];
        if (customerIndex !== -1) {
          newCustomers[customerIndex] = {
            ...newCustomers[customerIndex],
            totalSpent: newCustomers[customerIndex].totalSpent + data.totalPrice
          };
        }

        set({
          appointments: [...appointments, { ...data, id }],
          customers: newCustomers
        });
        return true;
      },

      updateAppointment: (id, data) => set((state) => ({
        appointments: state.appointments.map((appt) => 
          appt.id === id ? { ...appt, ...data } : appt
        )
      })),

      deleteAppointment: (id) => set((state) => ({
        appointments: state.appointments.filter((appt) => appt.id !== id)
      })),

      addCustomer: (data) => set((state) => ({
        customers: [...state.customers, { ...data, id: Math.max(0, ...state.customers.map(c => c.id)) + 1, totalSpent: 0 }]
      })),

      updateCustomer: (id, data) => set((state) => ({
        customers: state.customers.map(c => c.id === id ? { ...c, ...data } : c)
      })),

      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      })),

      addService: (data) => set((state) => ({
        services: [...state.services, { ...data, id: Math.max(0, ...state.services.map(s => s.id)) + 1 }]
      })),

      deleteService: (id) => set((state) => ({
        services: state.services.filter(s => s.id !== id)
      })),

      updateService: (id, data) => set((state) => ({
        services: state.services.map(s => s.id === id ? { ...s, ...data } : s)
      })),

      updateStaff: (id, data) => set((state) => ({
        staff: state.staff.map(s => s.id === id ? { ...s, ...data } : s)
      })),

      addLeave: (data) => set((state) => ({
        leaves: [...state.leaves, { ...data, id: Math.max(0, ...state.leaves.map(l => l.id)) + 1 }]
      })),

      deleteLeave: (id) => set((state) => ({
        leaves: state.leaves.filter(l => l.id !== id)
      })),

      addSessionPackage: (data) => set((state) => ({
        sessionPackages: [...state.sessionPackages, { ...data, id: Math.max(0, ...state.sessionPackages.map(p => p.id)) + 1 }]
      })),

      deleteSessionPackage: (id) => set((state) => ({
        sessionPackages: state.sessionPackages.filter(p => p.id !== id)
      })),

      addNote: (data) => set((state) => ({
        notes: [...state.notes, { ...data, id: Math.max(0, ...state.notes.map(n => n.id)) + 1 }]
      })),

      updateNote: (id, data) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, ...data } : n)
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id)
      })),
    }),
    {
      name: 'salon-storage', 
    }
  )
);