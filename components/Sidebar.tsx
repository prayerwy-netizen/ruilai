import React from 'react';
import { MessageSquare, Share2, Database, LayoutDashboard, Settings, Hexagon } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const navItems = [
    { id: Page.CHAT, label: '智能对话', icon: MessageSquare },
    { id: Page.GRAPH, label: '知识图谱', icon: Share2 },
    { id: Page.DATA_GOVERNANCE, label: '数据时空对齐', icon: Database },
    { id: Page.DASHBOARD, label: '数据大屏', icon: LayoutDashboard },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full flex-shrink-0 transition-all duration-300">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Hexagon className="w-5 h-5 text-white fill-current" />
        </div>
        <span className="text-xl font-bold tracking-wide">睿来智能体</span>
      </div>

      <nav className="flex-1 py-6 space-y-2 px-3">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 text-slate-400 hover:text-white cursor-pointer px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
          <Settings className="w-5 h-5" />
          <span>系统设置</span>
        </div>
        <div className="mt-4 px-4 text-xs text-slate-600">
          v1.0.0 Enterprise Edition
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
