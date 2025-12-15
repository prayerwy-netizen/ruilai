import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image as ImageIcon, Loader2, Cpu, Activity, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Message, Equipment, Page } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface ChatInterfaceProps {
    onNavigate: (page: Page) => void;
    setSelectedEquipmentId: (id: string | null) => void;
}

// Mock Data for Visualization
const PRODUCTION_DATA = [
  { time: '08:00', value: 1200 },
  { time: '10:00', value: 1350 },
  { time: '12:00', value: 1100 },
  { time: '14:00', value: 980 }, // Drop
  { time: '16:00', value: 1050 },
  { time: '18:00', value: 1400 },
];

const EQUIPMENTS: Equipment[] = [
  { id: 'eq-1', name: '1号采煤机', model: 'MG500', location: '1201工作面', status: 'normal', manager: '张伟', contact: '13800000001' },
  { id: 'eq-2', name: '3号采煤机', model: 'MG750', location: '1402工作面', status: 'fault', manager: '李强', contact: '13800000002' },
  { id: 'eq-3', name: '2号皮带机', model: 'DSP1000', location: '主斜井', status: 'warning', manager: '王芳', contact: '13800000003' },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNavigate, setSelectedEquipmentId }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: '您好，我是睿来智能体。您可以询问我关于矿井生产、设备状态或安全隐患的问题。例如：“今天产量为什么下降了？”',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedFile) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Create a temporary "thinking" message or just loading state
    try {
      // Prepare history for API (simplified)
      const apiHistory = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
      }));

      const responseText = await generateChatResponse(userMessage.content, selectedFile, apiHistory);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          content: '抱歉，遇到了一些技术问题，请稍后重试。',
          timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleEquipmentClick = (eq: Equipment) => {
      setSelectedEquipmentId(eq.id);
      onNavigate(Page.EQUIPMENT_DETAIL);
  }

  return (
    <div className="flex flex-row h-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Left Column: Chat (35%) */}
      <div className="w-[35%] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10 transition-colors duration-200">
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                }`}
              >
                 {msg.role === 'model' && (
                    <div className="flex items-center space-x-2 mb-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider">
                        <Cpu className="w-3 h-3" />
                        <span>AI Analysis</span>
                    </div>
                 )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed font-normal">
                    {msg.content}
                </div>
                <div className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start mb-4">
                 <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">正在深度思考与分析数据...</span>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
            {selectedFile && (
                <div className="mb-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full inline-flex items-center">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    {selectedFile.name}
                    <button onClick={() => setSelectedFile(null)} className="ml-2 hover:text-blue-800 dark:hover:text-blue-200">×</button>
                </div>
            )}
          <div className="flex items-end space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <label className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                <Paperclip className="w-5 h-5" />
            </label>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                  }
              }}
              placeholder="请输入问题，如：今天产量为什么下降了？"
              className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-slate-700 dark:text-slate-200 text-sm max-h-32 py-2 placeholder-slate-400 dark:placeholder-slate-500"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || (!inputValue.trim() && !selectedFile)}
              className={`p-2 rounded-lg ${
                isLoading || (!inputValue.trim() && !selectedFile)
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
              } transition-all`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Reliable-Agent • Thinking Mode Enabled</span>
          </div>
        </div>
      </div>

      {/* Right Column: Visualization (65%) */}
      <div className="w-[65%] p-6 bg-slate-100 dark:bg-slate-950 overflow-y-auto transition-colors duration-200">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            实时监控看板
        </h2>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Card 1: Production Trend */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">产量趋势 (吨/小时)</h3>
                    <span className="px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded font-medium">异常下降 14:00</span>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={PRODUCTION_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }} wrapperClassName="dark:!bg-slate-800 dark:!text-slate-200" itemStyle={{ color: '#1e293b' }} />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

             {/* Card 2: Equipment Status */}
             <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">关键设备状态</h3>
                </div>
                <div className="space-y-3">
                    {EQUIPMENTS.map(eq => (
                        <div 
                            key={eq.id} 
                            onClick={() => handleEquipmentClick(eq)}
                            className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-3 ${
                                    eq.status === 'normal' ? 'bg-green-500' :
                                    eq.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                }`} />
                                <div>
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{eq.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{eq.location}</div>
                                </div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded font-medium ${
                                eq.status === 'normal' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                eq.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                                {eq.status === 'normal' ? '运行中' : eq.status === 'warning' ? '预警' : '故障'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Card 3: Root Cause Analysis */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
                <AlertOctagon className="w-5 h-5 mr-2 text-orange-500" />
                AI 根因分析：产量下降 (14:23)
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors duration-200">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">事件链追溯</h4>
                    <ul className="space-y-4 relative pl-4 border-l-2 border-slate-200 dark:border-slate-600">
                         <li className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                            <div className="text-xs text-slate-400 mb-1">14:23:05</div>
                            <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">3号采煤机 液压系统压力告警</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">传感器 ID: S-HYD-003 检测到压力突降至 5MPa</div>
                         </li>
                         <li className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                            <div className="text-xs text-slate-400 mb-1">14:23:15</div>
                            <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">设备自动保护停机</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">PLC 触发停机指令，工作面输送机联锁停机</div>
                         </li>
                         <li className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                            <div className="text-xs text-slate-400 mb-1">历史关联</div>
                            <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">5天前 检修记录</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">检修员：李四。记录显示：未对液压管路进行压力测试。</div>
                         </li>
                    </ul>
                </div>
                <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors duration-200">
                     <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">AI 建议措施</h4>
                     <div className="space-y-3">
                         <div className="flex items-start">
                            <div className="bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-xs font-bold px-2 py-0.5 rounded mr-2 mt-0.5">立即</div>
                            <p className="text-sm text-blue-900 dark:text-blue-100">派遣机电科一班前往 1402 工作面检查液压泵站主阀块。</p>
                         </div>
                         <div className="flex items-start">
                            <div className="bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-xs font-bold px-2 py-0.5 rounded mr-2 mt-0.5">预防</div>
                            <p className="text-sm text-blue-900 dark:text-blue-100">将液压管路压力测试纳入“MG750”机型每日巡检必做项。</p>
                         </div>
                         <div className="flex items-start">
                            <div className="bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-xs font-bold px-2 py-0.5 rounded mr-2 mt-0.5">管理</div>
                            <p className="text-sm text-blue-900 dark:text-blue-100">对检修班组进行“液压系统维护”专项培训。</p>
                         </div>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;