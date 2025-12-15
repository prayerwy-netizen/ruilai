import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Users, TrendingUp, Activity } from 'lucide-react';

interface DashboardProps {
    isDarkMode: boolean;
}

const BAR_DATA = [
  { name: 'Mon', output: 4000 },
  { name: 'Tue', output: 3000 },
  { name: 'Wed', output: 2000 },
  { name: 'Thu', output: 2780 },
  { name: 'Fri', output: 1890 },
  { name: 'Sat', output: 2390 },
  { name: 'Sun', output: 3490 },
];

const PIE_DATA = [
  { name: '正常', value: 85 },
  { name: '预警', value: 10 },
  { name: '故障', value: 5 },
];
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC<DashboardProps> = ({ isDarkMode }) => {
  // Determine chart colors based on mode
  const axisColor = isDarkMode ? "#94a3b8" : "#64748b";
  const tooltipBg = isDarkMode ? '#1e293b' : '#ffffff';
  const tooltipText = isDarkMode ? '#fff' : '#1e293b';

  return (
    <div className="p-6 bg-slate-100 dark:bg-slate-900 min-h-full text-slate-900 dark:text-white transition-colors duration-200">
      <div className="mb-6">
          <h1 className="text-2xl font-bold">煤矿生产全景驾驶舱</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time Production Monitoring System</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
             <div className="flex items-center justify-between mb-2">
                 <span className="text-slate-500 dark:text-slate-400 text-sm">今日产量</span>
                 <TrendingUp className="text-blue-500 dark:text-blue-400 w-4 h-4" />
             </div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">4,285 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">吨</span></div>
             <div className="text-xs text-red-500 dark:text-red-400 mt-1">↓ 12% 较昨日</div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
             <div className="flex items-center justify-between mb-2">
                 <span className="text-slate-500 dark:text-slate-400 text-sm">瓦斯浓度(Avg)</span>
                 <Activity className="text-green-500 dark:text-green-400 w-4 h-4" />
             </div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">0.32 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">%</span></div>
             <div className="text-xs text-green-500 dark:text-green-400 mt-1">正常</div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
             <div className="flex items-center justify-between mb-2">
                 <span className="text-slate-500 dark:text-slate-400 text-sm">井下人数</span>
                 <Users className="text-yellow-500 dark:text-yellow-400 w-4 h-4" />
             </div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">124 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">人</span></div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
             <div className="flex items-center justify-between mb-2">
                 <span className="text-slate-500 dark:text-slate-400 text-sm">今日告警</span>
                 <AlertTriangle className="text-red-500 dark:text-red-400 w-4 h-4" />
             </div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">3 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">次</span></div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[400px]">
          {/* Main Chart */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm col-span-2 flex flex-col transition-colors">
              <h3 className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-300">最近7天产量趋势</h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={BAR_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} vertical={false} />
                    <XAxis dataKey="name" stroke={axisColor} />
                    <YAxis stroke={axisColor} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: tooltipBg, border: 'none', color: tooltipText, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                    />
                    <Bar dataKey="output" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
              <h3 className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-300">设备健康状态分布</h3>
              <div className="flex-1 w-full min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={PIE_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        >
                        {PIE_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: 'none', color: tooltipText, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                          <div className="text-3xl font-bold text-slate-800 dark:text-white">95%</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">健康率</div>
                      </div>
                  </div>
              </div>
              <div className="flex justify-center space-x-4 mt-4 text-xs">
                  {PIE_DATA.map((entry, index) => (
                      <div key={entry.name} className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: PIE_COLORS[index]}}></div>
                          <span className="text-slate-600 dark:text-slate-400">{entry.name}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
               <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">AI 智能洞察</h3>
               <div className="space-y-3">
                   <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                       <span className="font-bold text-blue-600 dark:text-blue-400">预测：</span> 2号通风机振动数据呈上升趋势，建议在未来48小时内进行检查，可能存在轴承磨损风险。
                   </div>
                   <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-sm text-slate-600 dark:text-slate-300 flex justify-between items-center">
                       <span>今日早班能耗同比下降 5%，优化策略生效中。</span>
                       <span className="text-xs text-slate-500 dark:text-slate-400">08:00</span>
                   </div>
               </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
              <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">最新事件</h3>
              <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                  <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="py-2">时间</th>
                          <th className="py-2">事件</th>
                          <th className="py-2">状态</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr className="border-b border-slate-100 dark:border-slate-700/50">
                          <td className="py-2">14:23</td>
                          <td className="py-2 text-slate-800 dark:text-white">3号采煤机故障停机</td>
                          <td className="py-2"><span className="text-red-500 dark:text-red-400">处理中</span></td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-700/50">
                          <td className="py-2">10:15</td>
                          <td className="py-2 text-slate-800 dark:text-white">1201巷道瓦斯预警</td>
                          <td className="py-2"><span className="text-green-500 dark:text-green-400">已恢复</span></td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;