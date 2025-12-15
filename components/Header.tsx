import React, { useEffect, useState } from 'react';
import { Bell, Search, User, Key, Moon, Sun, X } from 'lucide-react';

interface HeaderProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  const [hasKey, setHasKey] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    const key = localStorage.getItem('GEMINI_API_KEY');
    setHasKey(!!key);
  }, []);

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKeyInput.trim());
      setHasKey(true);
      setShowKeyModal(false);
      setApiKeyInput('');
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setHasKey(false);
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0 z-20 transition-colors duration-200">
        <div className="flex items-center w-96 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 transition-colors duration-200">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="全局搜索 (如: 1201工作面)"
            className="bg-transparent border-none text-sm w-full focus:outline-none text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center space-x-4">
          {!hasKey ? (
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-800 rounded text-xs hover:bg-amber-100 dark:hover:bg-amber-900/50"
            >
              <Key className="w-3 h-3 mr-1" />
              配置 API Key
            </button>
          ) : (
            <button
              onClick={handleRemoveKey}
              className="flex items-center px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-500 border border-green-200 dark:border-green-800 rounded text-xs hover:bg-green-100 dark:hover:bg-green-900/50"
            >
              <Key className="w-3 h-3 mr-1" />
              API Key 已配置 (点击移除)
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
          <div className="flex items-center space-x-2 pl-4 border-l border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-slate-800 dark:text-slate-200">管理员</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">调度中心</div>
            </div>
          </div>
        </div>
      </header>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">配置 Gemini API Key</h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              请输入您的 Google Gemini API Key。您可以从
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline mx-1"
              >
                Google AI Studio
              </a>
              免费获取。
            </p>

            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="输入 API Key (例: AIzaSy...)"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg mb-4 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveKey();
                }
              }}
            />

            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                ⚠️ 您的 API Key 仅存储在浏览器本地 (localStorage),不会上传到任何服务器。
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowKeyModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                取消
              </button>
              <button
                onClick={handleSaveKey}
                disabled={!apiKeyInput.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed dark:disabled:bg-slate-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
