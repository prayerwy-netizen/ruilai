import React, { useState } from 'react';
import { DataSource } from '../types';
import { Database, Plus, RefreshCw, Trash2, Eye } from 'lucide-react';

const MOCK_SOURCES: DataSource[] = [
  { id: '1', name: '人员定位系统', type: 'MySQL', status: 'connected', count: 1240, lastSync: '10 分钟前' },
  { id: '2', name: '安全监控系统', type: 'SQL Server', status: 'connected', count: 45000, lastSync: '实时' },
  { id: '3', name: '视频监控流', type: 'API', status: 'error', count: 0, lastSync: '2 小时前' },
];

const DataGovernance: React.FC = () => {
  const [sources, setSources] = useState<DataSource[]>(MOCK_SOURCES);
  const [showModal, setShowModal] = useState(false);

  const addSource = () => {
      // Mock addition
      const newSource: DataSource = {
          id: Date.now().toString(),
          name: '新生产系统数据源',
          type: 'PostgreSQL',
          status: 'connected',
          count: 500,
          lastSync: '刚刚'
      };
      setSources([...sources, newSource]);
      setShowModal(false);
  }

  return (
    <div className="p-8 h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto transition-colors duration-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">数据时空对齐</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">管理与 AI 智能体连接的多源异构数据</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>添加数据源</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">数据源名称</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">类型</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">状态</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">记录数</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">最后同步</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sources.map((source) => (
              <tr key={source.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                        <Database className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{source.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{source.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    source.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        source.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    {source.status === 'connected' ? '已连接' : '连接失败'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-mono">{source.count.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{source.lastSync}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" title="预览">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400" title="同步">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400" title="删除">
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">数据预览 (人员定位系统)</h3>
          <div className="overflow-x-auto">
             <table className="min-w-full text-sm text-left text-slate-600 dark:text-slate-400">
                 <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800">
                     <tr>
                         <th className="px-4 py-2">工号</th>
                         <th className="px-4 py-2">姓名</th>
                         <th className="px-4 py-2">当前位置</th>
                         <th className="px-4 py-2">入井时间</th>
                     </tr>
                 </thead>
                 <tbody>
                     <tr className="border-b border-slate-100 dark:border-slate-800">
                         <td className="px-4 py-2">1001</td>
                         <td className="px-4 py-2">张三</td>
                         <td className="px-4 py-2">1201工作面</td>
                         <td className="px-4 py-2">07:30:00</td>
                     </tr>
                     <tr className="border-b border-slate-100 dark:border-slate-800">
                         <td className="px-4 py-2">1002</td>
                         <td className="px-4 py-2">李四</td>
                         <td className="px-4 py-2">主巷道</td>
                         <td className="px-4 py-2">07:35:10</td>
                     </tr>
                     <tr>
                         <td className="px-4 py-2 text-slate-400 dark:text-slate-500 italic" colSpan={4}>... 显示前 100 条数据</td>
                     </tr>
                 </tbody>
             </table>
          </div>
      </div>

      {showModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-[500px] shadow-2xl transition-colors">
                  <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">接入新数据源</h2>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">名称</label>
                          <input type="text" className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="例如：生产管理系统" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">类型</label>
                          <select className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                              <option>MySQL</option>
                              <option>PostgreSQL</option>
                              <option>SQL Server</option>
                              <option>REST API</option>
                          </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Host</label>
                            <input type="text" className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="192.168.1.100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Port</label>
                            <input type="text" className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="3306" />
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded text-xs text-slate-500 dark:text-slate-400">
                          安全提示：密码将通过加密通道传输，睿来智能体仅拥有读取权限。
                      </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                      <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">取消</button>
                      <button onClick={addSource} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">保存并连接</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DataGovernance;