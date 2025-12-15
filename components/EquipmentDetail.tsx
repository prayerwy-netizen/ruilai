import React from 'react';
import { ArrowLeft, Thermometer, Activity, Zap, Wrench } from 'lucide-react';

interface EquipmentDetailProps {
  id: string;
  onBack: () => void;
}

const EquipmentDetail: React.FC<EquipmentDetailProps> = ({ id, onBack }) => {
  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 sticky top-0 z-10 shadow-sm transition-colors">
        <button onClick={onBack} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">3号采煤机 (MG750)</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
              <span>位置: 1402工作面</span>
              <span>•</span>
              <span>负责人: 李强</span>
              <span>•</span>
              <span className="flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded font-medium">
                <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-500 mr-2"></span>
                当前状态: 故障停机
              </span>
            </div>
          </div>
          <div className="text-right">
             <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">生成维修工单</button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Real-time Indicators */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
             <div className="flex items-center text-slate-500 dark:text-slate-400 mb-2">
                <Thermometer className="w-4 h-4 mr-2" />
                <span className="text-sm">电机温度</span>
             </div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">85°C</div>
             <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-3">
                 <div className="bg-yellow-500 h-1.5 rounded-full" style={{width: '80%'}}></div>
             </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
             <div className="flex items-center text-slate-500 dark:text-slate-400 mb-2">
                <Activity className="w-4 h-4 mr-2" />
                <span className="text-sm">振动 (mm/s)</span>
             </div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">4.2</div>
             <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-3">
                 <div className="bg-green-500 h-1.5 rounded-full" style={{width: '40%'}}></div>
             </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
             <div className="flex items-center text-slate-500 dark:text-slate-400 mb-2">
                <Zap className="w-4 h-4 mr-2" />
                <span className="text-sm">电流 (A)</span>
             </div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">0</div>
             <div className="text-xs text-red-500 dark:text-red-400 mt-1">停机状态</div>
          </div>
        </div>

        {/* AI Predictive Maintenance */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-2 flex items-center">
                <Wrench className="w-5 h-5 mr-2" />
                Gemini 预测性维护建议
            </h3>
            <p className="mb-4 opacity-90">基于过去 30 天的运行数据分析，该设备液压系统故障概率为 89%。</p>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm space-y-2 text-sm">
                <div className="flex items-start">
                    <div className="bg-white/20 px-2 py-0.5 rounded text-xs mr-2 mt-0.5">建议 1</div>
                    <p>检查液压泵站主溢流阀，可能存在卡滞。</p>
                </div>
                <div className="flex items-start">
                    <div className="bg-white/20 px-2 py-0.5 rounded text-xs mr-2 mt-0.5">建议 2</div>
                    <p>更换液压油过滤器，检测到油液污染度接近临界值。</p>
                </div>
            </div>
        </div>

        {/* History Tabs Mock */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-[300px] transition-colors">
            <div className="border-b border-slate-200 dark:border-slate-800 px-6">
                <div className="flex space-x-8">
                    <button className="py-4 border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-medium text-sm">检修记录</button>
                    <button className="py-4 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium text-sm">故障历史</button>
                    <button className="py-4 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium text-sm">备件消耗</button>
                </div>
            </div>
            <div className="p-6">
                <div className="relative pl-6 border-l border-slate-200 dark:border-slate-700 space-y-8">
                    <div className="relative">
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900"></div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">2023-10-20 09:30</div>
                        <div className="text-slate-800 dark:text-slate-200 font-medium">季度常规检修</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">执行人：检修一班。更换了截齿 20 个，补充润滑油。</div>
                    </div>
                    <div className="relative">
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900"></div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">2023-10-15 14:00</div>
                        <div className="text-slate-800 dark:text-slate-200 font-medium">临时故障处理</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">执行人：张伟。处理变频器过热报警，清理散热片。</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;