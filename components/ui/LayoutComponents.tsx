import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Phone } from 'lucide-react';

// --- Utility Functions ---

export const formatPhoneNumber = (phone: string) => {
  if (!phone) return '';
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Check if it starts with 90 (Turkey Code)
  if (digits.startsWith('90')) {
    const rest = digits.substring(2);
    // Format: (+90) 555 123 45 67
    if (rest.length === 10) {
       return `(+90) ${rest.slice(0,3)} ${rest.slice(3,6)} ${rest.slice(6,8)} ${rest.slice(8,10)}`;
    }
    return `(+90) ${rest}`;
  }
  return phone;
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}>
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'black';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'black', 
  className = "",
  type = "button",
  disabled = false,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-6 py-2.5";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    black: "bg-black text-white hover:bg-slate-800 shadow-sm",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
    ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className={`flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all ${props.className}`}
  />
);

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, className, ...props }) => {
  // Gelen değerden (örn: +90 555...) sadece kullanıcının girdiği kısmı (555...) ayıkla.
  const getDisplayValue = (val: string) => {
    if (!val) return '';
    // Sadece rakamları al
    let digits = val.replace(/\D/g, '');
    
    // Eğer başında ülke kodu (90) varsa, bunu gösterimden kaldır
    if (digits.startsWith('90')) {
      digits = digits.substring(2);
    }
    
    // En fazla 10 hane göster
    return digits.slice(0, 10);
  };

  const displayValue = getDisplayValue(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sadece rakamları al
    let rawInput = e.target.value.replace(/\D/g, '');

    // Kullanıcı yanlışlıkla 90 ile başlarsa veya paste yaparsa temizle
    if (rawInput.startsWith('90')) {
      rawInput = rawInput.substring(2);
    }

    // 10 haneye sınırla
    const tenDigits = rawInput.slice(0, 10);
    
    // Kaydederken +90 ekle
    if (tenDigits.length === 0) {
      onChange('');
    } else {
      onChange(`+90 ${tenDigits}`);
    }
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
        <span className="text-slate-500 font-medium bg-slate-50 px-1 rounded text-sm">+90</span>
        <div className="h-4 w-[1px] bg-slate-200 ml-2"></div>
      </div>
      <input
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder="555 123 45 67"
        maxLength={10}
        className={`flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-16 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all font-mono text-slate-900 ${className}`}
        {...props}
      />
    </div>
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <div className="relative">
    <select
      {...props}
      className={`flex h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all ${props.className}`}
    >
      {props.children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = "#6366f1", className }: BadgeProps) => (
  <span 
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${className}`}
    style={{ backgroundColor: `${color}20`, color: color }} 
  >
    {children}
  </span>
);

// --- Custom Date Picker ---

interface DatePickerProps {
  value: string; // YYYY-MM-DD format expectation for value
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = "Tarih Seçin", required }) => {
  const [isOpen, setIsOpen] = useState(false);
  // View date controls which month we are currently looking at
  const [viewDate, setViewDate] = useState(value ? parseISO(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update view date if value changes externally
  useEffect(() => {
    if (value) {
      setViewDate(parseISO(value));
    }
  }, [value]);

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const handleDayClick = (day: Date) => {
    // Return format YYYY-MM-DD to be consistent with HTML date input value
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const generateDays = () => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: tr });
    const endDate = endOfWeek(monthEnd, { locale: tr });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const weekDays = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"];

    // Header (Days of week)
    const header = (
      <div className="grid grid-cols-7 mb-2 border-b border-slate-100 pb-2">
        {weekDays.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-slate-400">
            {d}
          </div>
        ))}
      </div>
    );

    // Days Grid
    const dayGrid = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <>
        {header}
        <div className="grid grid-cols-7 gap-1">
          {dayGrid.map((d, i) => {
            const isSelected = value ? isSameDay(d, parseISO(value)) : false;
            const isCurrentMonth = isSameMonth(d, monthStart);
            
            return (
              <button
                type="button"
                key={i}
                onClick={() => handleDayClick(d)}
                className={`
                  h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-all
                  ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-100'}
                  ${isSelected ? 'bg-black text-white hover:bg-slate-800 shadow-md' : ''}
                `}
              >
                {format(d, "d")}
              </button>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm cursor-pointer hover:border-slate-300 transition-colors"
      >
        <CalendarIcon size={16} className="text-slate-400 mr-2" />
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value ? format(parseISO(value), 'd MMMM yyyy', { locale: tr }) : placeholder}
        </span>
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-[280px] bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
             <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-md text-slate-500">
               <ChevronLeft size={16} />
             </button>
             <span className="text-sm font-bold text-slate-800 capitalize">
               {format(viewDate, 'MMMM yyyy', { locale: tr })}
             </span>
             <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-md text-slate-500">
               <ChevronRight size={16} />
             </button>
          </div>
          {generateDays()}
        </div>
      )}
    </div>
  );
};

// --- Custom Time Picker (24h) ---

interface TimePickerProps {
  value: string; // HH:mm format
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [selectedHour, selectedMinute] = (value || "09:00").split(':');

  // Generate 24 hours
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  // Generate 5 minute intervals (00, 05, 10 ... 55)
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm cursor-pointer hover:border-slate-300 transition-colors"
      >
        <Clock size={16} className="text-slate-400 mr-2" />
        <span className="text-slate-900 font-medium">
          {value || "00:00"}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 flex gap-2 animate-in fade-in zoom-in-95 duration-200 w-[180px]">
          {/* Hours Column */}
          <div className="flex-1 h-48 overflow-y-auto no-scrollbar">
            <div className="text-xs font-bold text-slate-400 mb-1 text-center sticky top-0 bg-white z-10 py-1">Saat</div>
            {hours.map(h => (
              <button
                type="button"
                key={h}
                onClick={() => onChange(`${h}:${selectedMinute || '00'}`)}
                className={`w-full text-center py-1.5 rounded-md text-sm mb-1 transition-colors ${
                  h === selectedHour ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
          
          <div className="w-[1px] bg-slate-100 h-full"></div>
          
          {/* Minutes Column */}
          <div className="flex-1 h-48 overflow-y-auto no-scrollbar">
            <div className="text-xs font-bold text-slate-400 mb-1 text-center sticky top-0 bg-white z-10 py-1">Dk</div>
            {minutes.map(m => (
              <button
                type="button"
                key={m}
                onClick={() => {
                   onChange(`${selectedHour || '09'}:${m}`);
                   setIsOpen(false);
                }}
                className={`w-full text-center py-1.5 rounded-md text-sm mb-1 transition-colors ${
                  m === selectedMinute ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};