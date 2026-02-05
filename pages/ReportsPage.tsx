import React from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/LayoutComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Star, ChevronRight } from 'lucide-react';

// Custom Tooltip for Bar Charts (Money)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-sm z-50 min-w-[120px]">
        <p className="font-bold text-slate-900 mb-1">{label}</p>
        <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500 text-xs font-medium">Kazanç:</span>
            <p className="font-bold text-indigo-600">
            {payload[0].value.toLocaleString()} ₺
            </p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Pie Chart (Percentage/Count)
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-sm z-50">
        <p className="font-bold text-slate-900 mb-1">{data.name}</p>
        <p className="font-medium text-indigo-600">
          %{data.value}
        </p>
      </div>
    );
  }
  return null;
};

export const ReportsPage = () => {
  const { appointments, services, staff } = useStore();

  // Category Revenue Data
  const categoryData = services.reduce((acc: any[], service) => {
    const category = service.category;
    const categoryRevenue = appointments.reduce((sum, apt) => {
      if (apt.serviceIds.includes(service.id)) {
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
  }, []);

  // Staff Performance Data
  const staffData = staff.map(s => {
    const revenue = appointments
      .filter(a => a.staffId === s.id)
      .reduce((sum, a) => sum + a.totalPrice, 0);
    const count = appointments.filter(a => a.staffId === s.id).length;
    return { name: s.name.split(' ')[0], revenue, count };
  });

  // Mock Occupancy Data (Doluluk Oranı)
  const occupancyData = [
    { name: 'Dolu', value: 65 },
    { name: 'Boş', value: 35 },
  ];

  // Mock Reminders Data
  const reminders = [
    {
      id: 1,
      customerName: "Ayşe Demir",
      message: "Randevu Onayı",
      time: "Yarın 09:00",
      status: "Kuyrukta",
      avatarId: 32
    },
    {
      id: 2,
      customerName: "Mehmet Yılmaz",
      message: "Hatırlatma (24 Saat)",
      time: "Bugün 14:30",
      status: "Gönderildi",
      avatarId: 12
    },
    {
      id: 3,
      customerName: "Zeynep Kaya",
      message: "Teşekkür Mesajı",
      time: "Dün 18:00",
      status: "Gönderilemedi",
      avatarId: 45
    }
  ];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Gönderildi':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Gönderilemedi':
        return 'bg-red-100 text-red-700 border-red-200';
      default: // Kuyrukta
        return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  const totalRevenue = appointments.reduce((sum, apt) => sum + apt.totalPrice, 0);
  const totalAppts = appointments.length;

  const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];
  // Colors for Pie Chart: Green and Slate-300
  const occupancyColors = ['#10b981', '#cbd5e1'];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Standardized Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Gelir & Performans Raporları</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Raporlar</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-500">Toplam Ciro</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{totalRevenue.toLocaleString()} ₺</p>
          <div className="text-xs text-green-600 mt-1">▲ Geçen aya göre %12 artış</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-500">Toplam Randevu</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{totalAppts}</p>
          <div className="text-xs text-green-600 mt-1">▲ Geçen aya göre %5 artış</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-500">Ortalama Sepet</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{(totalRevenue / (totalAppts || 1)).toFixed(0)} ₺</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-500">Müşteri Memnuniyeti</h3>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-3xl font-bold text-slate-800">4.9</p>
            <Star className="text-yellow-400 fill-yellow-400" size={28} />
          </div>
          <div className="text-xs text-slate-400 mt-1">5.0 üzerinden</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 h-[400px] flex flex-col">
          <h3 className="font-bold text-lg mb-2">Kategori Bazlı Gelir</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                    interval={0}
                />
                <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}₺`} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc', opacity: 0.5}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} activeBar={false}>
                    {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 h-[400px] flex flex-col">
          <h3 className="font-bold text-lg mb-2">Personel Performansı (Ciro)</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    width={80}
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc', opacity: 0.5}} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} activeBar={false} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="p-6 h-[300px] flex flex-col">
            <h3 className="font-bold text-lg mb-2">Doluluk Oranı</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    >
                    {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={occupancyColors[index % occupancyColors.length]} />
                    ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value, entry: any) => (
                            <span className="text-slate-600 font-medium ml-1">
                                %{entry.payload.value} {value}
                            </span>
                        )}
                    />
                </PieChart>
                </ResponsiveContainer>
            </div>
         </Card>
         
         <Card className="p-6 lg:col-span-2">
            <h3 className="font-bold text-lg mb-4">Yaklaşan Otomatik Hatırlatmalar</h3>
            <div className="space-y-4">
               {reminders.map(item => (
                 <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                       <img 
                          src={`https://i.pravatar.cc/150?img=${item.avatarId}`} 
                          alt={item.customerName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                       />
                       <div>
                          <div className="text-sm font-bold text-slate-800">{item.customerName} <span className="font-normal text-slate-500">- {item.message}</span></div>
                          <div className="text-xs text-slate-500">Planlanan: {item.time}</div>
                       </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${getStatusStyle(item.status)}`}>
                        {item.status}
                    </span>
                 </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  );
};