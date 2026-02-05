import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/LayoutComponents';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend, AreaChart, Area 
} from 'recharts';
import { Star, ChevronRight, TrendingUp, Users, Clock, AlertCircle } from 'lucide-react';
import { format, subDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';

// --- Custom Tooltips ---

const CustomMoneyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2.5 border border-slate-100 shadow-xl rounded-xl text-xs sm:text-sm z-50 min-w-[100px]">
        <p className="font-bold text-slate-900 mb-1">{label}</p>
        <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500 font-medium">Değer:</span>
            <p className="font-bold text-indigo-600">
            {typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value} ₺
            </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomCountTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2.5 border border-slate-100 shadow-xl rounded-xl text-xs sm:text-sm z-50 min-w-[100px]">
          <p className="font-bold text-slate-900 mb-1">{label}</p>
          <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">Adet:</span>
              <p className="font-bold text-slate-800">
              {payload[0].value}
              </p>
          </div>
        </div>
      );
    }
    return null;
  };

export const ReportsPage = () => {
  const { appointments, services, staff } = useStore();

  // --- 1. KPI Calculations ---
  const totalRevenue = appointments.reduce((sum, apt) => sum + apt.totalPrice, 0);
  const totalAppts = appointments.length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;
  const cancelledAppts = appointments.filter(a => a.status === 'cancelled').length;
  
  const completionRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0;
  const cancellationRate = totalAppts > 0 ? Math.round((cancelledAppts / totalAppts) * 100) : 0;

  // --- 2. Revenue Trend (Last 7 Days) ---
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayRevenue = appointments
            .filter(apt => isSameDay(parseISO(apt.date), date) && apt.status !== 'cancelled')
            .reduce((sum, apt) => sum + apt.totalPrice, 0);
        
        data.push({
            name: format(date, 'd MMM', { locale: tr }),
            revenue: dayRevenue
        });
    }
    return data;
  }, [appointments]);

  // --- 3. Revenue by Category ---
  const categoryData = useMemo(() => {
      return services.reduce((acc: any[], service) => {
        const category = service.category;
        const categoryRevenue = appointments.reduce((sum, apt) => {
          if (apt.serviceIds.includes(service.id) && apt.status !== 'cancelled') {
            return sum + service.price;
          }
          return sum;
        }, 0);

        const existingCat = acc.find(c => c.name === category);
        if (existingCat) {
          existingCat.value += categoryRevenue;
        } else {
          acc.push({ name: category, value: categoryRevenue });
        }
        return acc;
      }, []).sort((a,b) => b.value - a.value);
  }, [services, appointments]);

  // --- 4. Staff Performance ---
  const staffData = useMemo(() => {
    return staff.map(s => {
        const revenue = appointments
          .filter(a => a.staffId === s.id && a.status === 'completed')
          .reduce((sum, a) => sum + a.totalPrice, 0);
        return { name: s.name.split(' ')[0], revenue };
      }).sort((a,b) => b.revenue - a.revenue);
  }, [staff, appointments]);

  // --- 5. Status Distribution ---
  const statusData = [
    { name: 'Tamamlanan', value: completedAppts, color: '#10b981' },
    { name: 'İptal', value: cancelledAppts, color: '#ef4444' },
    { name: 'Bekleyen', value: totalAppts - completedAppts - cancelledAppts, color: '#f59e0b' },
  ];

  // --- 6. Top Services (Most Popular) ---
  const topServices = useMemo(() => {
      const serviceCounts: Record<number, number> = {};
      appointments.forEach(apt => {
          apt.serviceIds.forEach(id => {
              serviceCounts[id] = (serviceCounts[id] || 0) + 1;
          });
      });

      return Object.entries(serviceCounts)
        .map(([id, count]) => {
            const service = services.find(s => s.id === Number(id));
            return {
                name: service?.name || 'Bilinmeyen',
                count: count,
                revenue: count * (service?.price || 0),
                category: service?.category
            };
        })
        .sort((a,b) => b.count - a.count)
        .slice(0, 5);
  }, [appointments, services]);

  // --- 7. Busiest Hours ---
  const busyHoursData = useMemo(() => {
      const hours: Record<string, number> = {};
      appointments.forEach(apt => {
          const hour = apt.startTime.split(':')[0] + ":00";
          hours[hour] = (hours[hour] || 0) + 1;
      });
      
      return Object.entries(hours)
        .map(([hour, count]) => ({ name: hour, count }))
        .sort((a,b) => parseInt(a.name) - parseInt(b.name));
  }, [appointments]);


  const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in pb-20 md:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-4">
        <div>
           <h1 className="text-xl md:text-2xl font-bold text-slate-900">Raporlar</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Performans</span>
           </div>
        </div>
      </div>

      {/* KPI Cards - 2x2 Grid on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        
        {/* Total Revenue */}
        <Card className="p-4 md:p-6 relative overflow-hidden group flex flex-col justify-between h-full">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-xs md:text-sm font-medium text-slate-500">Toplam Ciro</h3>
                <p className="text-xl md:text-3xl font-bold text-indigo-600 mt-1 md:mt-2 truncate">
                   {totalRevenue.toLocaleString()}₺
                </p>
             </div>
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 hidden md:flex">
                 <TrendingUp size={24} />
             </div>
          </div>
          <div className="text-[10px] md:text-xs text-green-600 mt-2 font-medium bg-green-50 px-2 py-1 rounded w-fit">
              ▲ %12 artış
          </div>
        </Card>
        
        {/* Completion Rate */}
        <Card className="p-4 md:p-6 flex flex-col justify-between h-full">
          <div>
              <h3 className="text-xs md:text-sm font-medium text-slate-500">Tamamlanan</h3>
              <p className="text-xl md:text-3xl font-bold text-slate-800 mt-1 md:mt-2">%{completionRate}</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
             <div className="bg-green-500 h-full rounded-full" style={{ width: `${completionRate}%` }}></div>
          </div>
        </Card>

        {/* Cancellation Rate */}
        <Card className="p-4 md:p-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xs md:text-sm font-medium text-slate-500">İptal Oranı</h3>
            <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                <p className="text-xl md:text-3xl font-bold text-slate-800">%{cancellationRate}</p>
                {cancellationRate > 15 && <AlertCircle size={16} className="text-red-500" />}
            </div>
          </div>
          <div className="text-[10px] md:text-xs text-slate-400 mt-1 truncate">Ort: %10</div>
        </Card>

        {/* Customer Satisfaction */}
        <Card className="p-4 md:p-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xs md:text-sm font-medium text-slate-500">Memnuniyet</h3>
            <div className="flex items-center gap-2 mt-1 md:mt-2">
                <p className="text-xl md:text-3xl font-bold text-slate-800">4.9</p>
                <Star className="text-yellow-400 fill-yellow-400 w-5 h-5 md:w-7 md:h-7" />
            </div>
          </div>
          <div className="text-[10px] md:text-xs text-slate-400 mt-1 truncate">58 yorum</div>
        </Card>
      </div>

      {/* Row 1: Revenue Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Revenue Trend (Area Chart) */}
        <Card className="p-4 md:p-6 lg:col-span-2 h-[280px] md:h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4 md:mb-6">
             <h3 className="font-bold text-base md:text-lg text-slate-800">7 Günlük Gelir</h3>
             <span className="text-[10px] md:text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">Günlük</span>
          </div>
          <div className="flex-1 w-full min-h-0 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        dy={10}
                        interval="preserveStartEnd" // Prevent label overlap
                    />
                    <YAxis 
                        hide={false}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `${val/1000}k`}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        width={30}
                    />
                    <Tooltip content={<CustomMoneyTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue by Category (Bar Chart) */}
        <Card className="p-4 md:p-6 h-[280px] md:h-[400px] flex flex-col">
          <h3 className="font-bold text-base md:text-lg text-slate-800 mb-4 md:mb-6">Kategori Geliri</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
                        width={70}
                    />
                    <Tooltip content={<CustomMoneyTooltip />} cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2: Status Distribution & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
         {/* Status Distribution (Donut Chart) */}
         <Card className="p-4 md:p-6 h-[300px] md:h-[350px] flex flex-col">
            <h3 className="font-bold text-base md:text-lg text-slate-800 mb-2">Durum Analizi</h3>
            <div className="flex-1 w-full min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                    <div className="text-center">
                        <span className="text-2xl md:text-3xl font-bold text-slate-800">{totalAppts}</span>
                        <div className="text-[10px] md:text-xs text-slate-400">Toplam</div>
                    </div>
                </div>
            </div>
         </Card>

         {/* Peak Hours (Bar Chart) */}
         <Card className="p-4 md:p-6 lg:col-span-2 h-[280px] md:h-[350px] flex flex-col">
            <h3 className="font-bold text-base md:text-lg text-slate-800 mb-4 md:mb-6 flex items-center gap-2">
                <Clock size={18} className="text-slate-400"/> En Yoğun Saatler
            </h3>
            <div className="flex-1 w-full min-h-0 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={busyHoursData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            interval={1} // Show every other label on mobile if needed
                        />
                        <Tooltip content={<CustomCountTooltip />} cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </Card>
      </div>

      {/* Row 3: Top Services & Staff Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
         {/* Top Services Table */}
         <Card className="p-4 md:p-6">
            <h3 className="font-bold text-base md:text-lg text-slate-800 mb-4 flex items-center gap-2">
                <Star size={18} className="text-yellow-500 fill-yellow-500"/> Popüler Hizmetler
            </h3>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <table className="w-full text-xs md:text-sm text-left min-w-[300px]">
                    <thead className="text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="pb-3 pl-2">Hizmet Adı</th>
                            <th className="pb-3 text-center">Adet</th>
                            <th className="pb-3 text-right pr-2">Ciro</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {topServices.map((service, i) => (
                            <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                <td className="py-3 pl-2">
                                    <div className="font-semibold text-slate-800 truncate max-w-[120px] md:max-w-none">{service.name}</div>
                                    <div className="text-[10px] md:text-xs text-slate-400">{service.category}</div>
                                </td>
                                <td className="py-3 text-center">
                                    <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] md:text-xs font-bold">
                                        {service.count}
                                    </span>
                                </td>
                                <td className="py-3 text-right pr-2 font-mono font-medium text-indigo-600">
                                    {service.revenue.toLocaleString()} ₺
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </Card>

         {/* Staff Performance (Bar Chart) */}
         <Card className="p-4 md:p-6 h-[300px] md:h-[400px] flex flex-col">
            <h3 className="font-bold text-base md:text-lg text-slate-800 mb-2 flex items-center gap-2">
                <Users size={18} className="text-slate-400"/> Personel Sıralaması
            </h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={staffData} layout="vertical" margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                        width={60}
                    />
                    <Tooltip content={<CustomMoneyTooltip />} cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </Card>
      </div>
    </div>
  );
};