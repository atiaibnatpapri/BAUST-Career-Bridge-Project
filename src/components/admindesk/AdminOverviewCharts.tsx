import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { AdminDeskRequest } from '../../types/admindesk';

interface AdminOverviewChartsProps {
  requests: AdminDeskRequest[];
  onSelectRequest: (id: string) => void;
  onFilterStatus?: (status: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Submitted: '#3B82F6',
  'Payment Verified': '#6366F1',
  'Under Review': '#8B5CF6',
  'Action Required': '#F59E0B',
  Approved: '#10B981',
  Processing: '#0F2A4A',
  Ready: '#2E5E3E',
  Delivered: '#059669',
  Rejected: '#EF4444',
  Cancelled: '#9CA3AF'
};

export const AdminOverviewCharts: React.FC<AdminOverviewChartsProps> = ({
  requests,
  onSelectRequest,
  onFilterStatus
}) => {
  // Stat counts
  const total = requests.length;
  const pendingReview = requests.filter(r =>
    ['Submitted', 'Payment Verified', 'Under Review'].includes(r.status)
  ).length;
  const actionRequired = requests.filter(r => r.status === 'Action Required').length;
  const readyOrDelivered = requests.filter(r =>
    ['Ready', 'Delivered'].includes(r.status)
  ).length;

  // Status breakdown for Donut Chart
  const statusCounts = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const donutData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] || '#6B7280'
  }));

  // Service distribution for Bar Chart
  const serviceCounts = requests.reduce<Record<string, number>>((acc, r) => {
    const rawName = r.services[0]?.serviceName || 'Service';
    const sName = rawName.length > 18 ? rawName.substring(0, 18) + '...' : rawName;
    acc[sName] = (acc[sName] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(serviceCounts)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Weekly Trend Mock
  const lineData = [
    { week: 'W1 Oct', requests: 4, completed: 3 },
    { week: 'W2 Oct', requests: 7, completed: 6 },
    { week: 'W3 Oct', requests: 9, completed: 8 },
    { week: 'W4 Oct', requests: 12, completed: 10 },
    { week: 'W1 Nov', requests: 15, completed: 11 },
    { week: 'W2 Nov', requests: requests.length, completed: readyOrDelivered }
  ];

  // Urgent attention requests
  const attentionRequests = requests
    .filter(r => r.status === 'Action Required' || r.urgency === 'Express' || r.urgency === 'Urgent' || r.status === 'Submitted')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onFilterStatus && onFilterStatus('All')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Requests</span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0F2A4A]">{total}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +18% this mo
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">All registered service requests</p>
        </div>

        <div
          onClick={() => onFilterStatus && onFilterStatus('Under Review')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Needs Review</span>
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-900">{pendingReview}</span>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Verification queue
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Submitted & Pending admin approval</p>
        </div>

        <div
          onClick={() => onFilterStatus && onFilterStatus('Action Required')}
          className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-amber-50/40 to-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Action Required</span>
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-900">{actionRequired}</span>
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              Awaiting Alumni
            </span>
          </div>
          <p className="mt-1 text-xs text-amber-700/80">Missing docs or payment query</p>
        </div>

        <div
          onClick={() => onFilterStatus && onFilterStatus('Delivered')}
          className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-emerald-50/30 to-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Completed / Ready</span>
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-900">{readyOrDelivered}</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              98.2% SLA Met
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-700/80">Ready for pickup or delivered</p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A]">Request Volume & Resolution Trend</h3>
              <p className="text-xs text-gray-500">Weekly intake vs completed deliverables over the last 6 weeks</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" /> Autumn 2026
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #E5E7EB'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="requests"
                  name="New Requests"
                  stroke="#0F2A4A"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0F2A4A' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed Deliverables"
                  stroke="#2E5E3E"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2E5E3E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F2A4A]">Current Status Breakdown</h3>
            <p className="text-xs text-gray-500">Distribution of live requests</p>
          </div>
          <div className="h-56 relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-[#0F2A4A]">{total}</span>
              <span className="text-[10px] uppercase font-bold text-gray-400">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {donutData.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600 truncate">{item.name}:</span>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-1">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#0F2A4A]">Top Requested Services</h3>
            <p className="text-xs text-gray-500">Breakdown by document category</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={barData}
                margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis dataKey="service" type="category" width={110} tick={{ fontSize: 11, fill: '#374151' }} />
                <Tooltip />
                <Bar dataKey="count" name="Requests" fill="#C9A227" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgent Attention */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-100 text-red-700 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-[#0F2A4A]">Urgent Attention & Escalations</h3>
                <p className="text-xs text-gray-500">Requests requiring immediate verification or alumni response</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              {attentionRequests.length} active alerts
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {attentionRequests.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                All queues are clear! No immediate escalations pending.
              </div>
            ) : (
              attentionRequests.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectRequest(item.id)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-[#0F2A4A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {item.alumniName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">{item.alumniName}</span>
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {item.id}
                        </span>
                        {(item.urgency === 'Urgent' || item.urgency === 'Express') && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                            {item.urgency} SLA
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        <span className="font-medium text-[#0F2A4A]">{item.services[0]?.serviceName}</span> &bull;{' '}
                        <span>Requested {item.submittedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{
                        backgroundColor: `${STATUS_COLORS[item.status] || '#6B7280'}18`,
                        color: STATUS_COLORS[item.status] || '#374151'
                      }}
                    >
                      {item.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
