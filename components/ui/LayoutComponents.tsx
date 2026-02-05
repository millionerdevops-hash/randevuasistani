import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Phone, ChevronDown, Check } from 'lucide-react';

// --- Utility Functions ---

export const formatPhoneNumber = (phone: string) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('90')) {
    const rest = digits.substring(2);
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
  const baseStyle = "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-6 py-2.5 min-h-[44px] md:min-h-[40px]"; // Touch target optimized
  
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

// UPDATED: Changed text-base to text-sm for better mobile sizing
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
  const getDisplayValue = (val: string) => {
    if (!val) return '';
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('90')) {
      digits = digits.substring(2);
    }
    return digits.slice(0, 10);
  };

  const displayValue = getDisplayValue(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawInput = e.target.value.replace(/\D/g, '');
    if (rawInput.startsWith('90')) {
      rawInput = rawInput.substring(2);
    }
    const tenDigits = rawInput.slice(0, 10);
    if (tenDigits.length === 0) {
      onChange('');
    } else {
      onChange(`+90 ${tenDigits}`);
    }
  };

  // UPDATED: Changed text-base to text-sm
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

// Original Native Select (Kept for compatibility where children are used directly)
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <div className="relative">
    <select
      {...props}
      className={`flex h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all ${props.className}`}
    >
      {props.children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
      <ChevronDown size={16} />
    </div>
  </div>
);

// --- NEW CUSTOM SELECT ---

export interface SelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  icon?: React.ElementType; 
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Seçiniz", 
  className = "",
  icon: Icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Sadece desktop modunda (absolute olduğu zaman) dışarı tıklamayı kontrol et.
      // Mobilde backdrop zaten bu işi yapıyor.
      if (window.innerWidth >= 768 && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  // FIXED: Removed h-full from button, used h-11 for consistent height
  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 flex items-center justify-between text-sm transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-black/5"
      >
         <span className={`truncate flex items-center gap-2 ${selectedOption ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
           {Icon && <Icon size={16} className="text-slate-400" />}
           {selectedOption ? selectedOption.label : placeholder}
         </span>
         <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
            {/* Mobile Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] md:hidden animate-in fade-in" onClick={() => setIsOpen(false)}></div>
            
            {/* Dropdown Content */}
            <div className={`
                bg-white border border-slate-100 rounded-xl shadow-xl overflow-y-auto animate-in fade-in zoom-in-95 origin-top
                fixed md:absolute z-[75]
                left-4 right-4 top-1/2 -translate-y-1/2 max-h-[60vh] md:max-h-[250px] md:top-full md:left-0 md:right-0 md:mt-2 md:translate-y-0 md:w-full
            `}>
                <div className="sticky top-0 bg-white border-b border-slate-50 p-3 md:hidden flex justify-between items-center">
                    <span className="font-bold text-slate-800">{placeholder}</span>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 text-sm">Kapat</button>
                </div>
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => { onChange(opt.value); setIsOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                            opt.value === value ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700 font-medium'
                        }`}
                    >
                        {opt.label}
                        {opt.value === value && <Check size={16} className="shrink-0" />}
                    </button>
                ))}
            </div>
        </>
      )}
    </div>
  )
}

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
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = "Tarih Seçin", required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? parseISO(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth >= 768 && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setViewDate(parseISO(value));
    }
  }, [value]);

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const handleDayClick = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const generateDays = () => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: tr });
    const endDate = endOfWeek(monthEnd, { locale: tr });

    const dayGrid = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"];

    return (
      <>
        <div className="grid grid-cols-7 mb-2 border-b border-slate-100 pb-2">
          {weekDays.map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-slate-400">
              {d}
            </div>
          ))}
        </div>
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

  // UPDATED: Changed text-base to text-sm
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

      {isOpen && (
        <>
            {/* Mobile Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] md:hidden animate-in fade-in" onClick={() => setIsOpen(false)}></div>

            <div className={`
                bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200 z-[75]
                fixed md:absolute 
                top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] md:top-full md:left-0 md:translate-x-0 md:translate-y-0 md:mt-2 md:w-[280px]
            `}>
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
                <div className="mt-4 pt-3 border-t border-slate-100 md:hidden">
                    <button onClick={() => setIsOpen(false)} className="w-full py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">Kapat</button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

// --- Custom Time Picker (24h) ---

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth >= 768 && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [selectedHour, selectedMinute] = (value || "09:00").split(':');
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  // UPDATED: Changed text-base to text-sm
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
        <>
            {/* Mobile Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] md:hidden animate-in fade-in" onClick={() => setIsOpen(false)}></div>

            <div className={`
                bg-white rounded-xl shadow-xl border border-slate-100 p-2 flex gap-2 animate-in fade-in zoom-in-95 duration-200 z-[75]
                fixed md:absolute
                top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:h-auto md:w-[180px] md:top-full md:left-0 md:translate-x-0 md:translate-y-0 md:mt-2
            `}>
                <div className="flex-1 overflow-y-auto no-scrollbar h-full md:h-48">
                    <div className="text-xs font-bold text-slate-400 mb-1 text-center sticky top-0 bg-white z-10 py-1">Saat</div>
                    {hours.map(h => (
                    <button
                        type="button"
                        key={h}
                        onClick={() => onChange(`${h}:${selectedMinute || '00'}`)}
                        className={`w-full text-center py-2 md:py-1.5 rounded-md text-sm mb-1 transition-colors ${
                        h === selectedHour ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {h}
                    </button>
                    ))}
                </div>
                <div className="w-[1px] bg-slate-100 h-full"></div>
                <div className="flex-1 overflow-y-auto no-scrollbar h-full md:h-48">
                    <div className="text-xs font-bold text-slate-400 mb-1 text-center sticky top-0 bg-white z-10 py-1">Dk</div>
                    {minutes.map(m => (
                    <button
                        type="button"
                        key={m}
                        onClick={() => {
                            onChange(`${selectedHour || '09'}:${m}`);
                            // Keep open for convenience or close? Let's close on minute select for desktop feeling, but maybe keep open on mobile?
                            // Let's close for both for speed.
                            setIsOpen(false);
                        }}
                        className={`w-full text-center py-2 md:py-1.5 rounded-md text-sm mb-1 transition-colors ${
                        m === selectedMinute ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {m}
                    </button>
                    ))}
                </div>
            </div>
        </>
      )}
    </div>
  );
};