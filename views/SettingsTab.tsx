
import React, { useState, useRef, useMemo } from 'react';
import { Task, DayData, HOURS } from '../types';
import { TaskEditorModal } from '../components/TaskEditorModal';
import { Plus, Download, Upload, Smartphone, ChevronRight, Trash2, AlertTriangle, ArrowUp, ArrowDown, ListOrdered, Share, Sparkles } from 'lucide-react';
import { subDays, eachDayOfInterval } from 'date-fns';
import { formatDate, cn } from '../utils';

interface SettingsTabProps {
  tasks: Task[];
  categoryOrder: string[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateCategoryOrder: (newOrder: string[]) => void;
  showInstallButton: boolean;
  onInstall: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onClearData: () => void;
  allSchedules: Record<string, DayData>;
  allRecords: Record<string, DayData>;
  currentDate: Date;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  tasks,
  categoryOrder,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateCategoryOrder,
  showInstallButton,
  onInstall,
  onExportData,
  onImportData,
  onClearData,
  allSchedules,
  allRecords,
  currentDate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 检测是否是 iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

  const sortedCategories = useMemo(() => {
    const existingCats = Array.from(new Set(tasks.map(t => t.category || '未分类')));
    const ordered = categoryOrder.filter(c => existingCats.includes(c));
    const others = existingCats.filter(c => !categoryOrder.includes(c));
    return [...ordered, ...others];
  }, [tasks, categoryOrder]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleSave = (task: Task) => {
    if (editingTask) onUpdateTask(task);
    else onAddTask(task);
    setIsModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportData(file);
    if (e.target) e.target.value = '';
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sortedCategories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    onUpdateCategoryOrder(newOrder);
  };

  return (
    <div className="h-full bg-stone-50 overflow-y-auto custom-scrollbar relative">
      <div className="relative z-10 px-5 pt-6 pb-2 flex justify-between items-center">
        <h2 className="text-xl font-black text-stone-800 tracking-tight">配置与应用</h2>
        <div className="flex gap-2">
            <button onClick={handleNew} className="bg-stone-900 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-800 transition-all active:scale-95 shadow-sm">
                <Plus size={16} />
            </button>
        </div>
      </div>

      <div className="relative z-10 px-5 pb-24 space-y-6 pt-2">
        
        {/* PWA 显著安装区域 */}
        {!isStandalone && (
            <div className="bg-indigo-600 rounded-[2rem] p-5 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Smartphone size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">安装到桌面</h3>
                            <p className="text-[10px] text-indigo-100 font-medium opacity-80">享受全屏沉浸体验与离线访问</p>
                        </div>
                    </div>
                    
                    {showInstallButton ? (
                        <button 
                            onClick={onInstall}
                            className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                        >
                            <Download size={16} /> 立即安装应用
                        </button>
                    ) : isIOS ? (
                        <div className="bg-white/10 p-3 rounded-xl border border-white/20 flex flex-col gap-2">
                            <p className="text-[10px] font-bold leading-tight flex items-center gap-2">
                                <Share size={12} className="shrink-0" />
                                1. 点击浏览器下方的“分享”按钮
                            </p>
                            <p className="text-[10px] font-bold leading-tight flex items-center gap-2">
                                <Plus size={12} className="shrink-0 border rounded-[2px]" />
                                2. 选择“添加到主屏幕”
                            </p>
                        </div>
                    ) : (
                        <div className="text-[10px] font-bold bg-white/10 p-3 rounded-xl border border-white/10 italic opacity-70">
                            通过浏览器菜单手动选择“安装应用”
                        </div>
                    )}
                </div>
            </div>
        )}

        {isStandalone && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2 bg-emerald-500 text-white rounded-full">
                    <Sparkles size={16} />
                </div>
                <div>
                    <span className="text-xs font-black text-emerald-800">已作为独立应用运行</span>
                    <p className="text-[10px] text-emerald-600 font-medium">您正在体验 ChronosFlow 的最佳模式</p>
                </div>
            </div>
        )}

        {/* 任务分类管理 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <h3 className="text-[9px] font-black text-stone-400 uppercase tracking-widest">任务池管理</h3>
             <button 
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                className={cn("text-[9px] font-black px-2 py-1 rounded-lg border transition-all", showCategoryManager ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-400 border-stone-200")}
             >
                排序模式
             </button>
          </div>

          <div className="space-y-5">
             {sortedCategories.map(cat => (
                <div key={cat} className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{cat}</span>
                        {showCategoryManager && (
                            <div className="flex gap-1 ml-auto">
                                <button onClick={() => moveCategory(sortedCategories.indexOf(cat), 'up')} className="p-1 text-stone-300 hover:text-stone-800"><ArrowUp size={12}/></button>
                                <button onClick={() => moveCategory(sortedCategories.indexOf(cat), 'down')} className="p-1 text-stone-300 hover:text-stone-800"><ArrowDown size={12}/></button>
                            </div>
                        )}
                        <div className="h-px bg-stone-100 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {tasks.filter(t => (t.category || '未分类') === cat).map(task => (
                            <div 
                                key={task.id} 
                                onClick={() => handleEdit(task)}
                                className="bg-white rounded-xl p-2.5 border border-stone-200 flex items-center gap-2 group cursor-pointer hover:border-stone-400 transition-all"
                            >
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.color }} />
                                <span className="text-[11px] font-bold text-stone-700 truncate">{task.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
             ))}
          </div>
        </section>

        {/* 备份与恢复 */}
        <section className="space-y-3">
            <h3 className="text-[9px] font-black text-stone-400 uppercase tracking-widest px-1">数据维护</h3>
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
                <button onClick={onExportData} className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-stone-100 rounded-lg text-stone-600"><Download size={16} /></div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-stone-800">导出备份</p>
                            <p className="text-[9px] text-stone-400">将数据保存为本地 JSON 文件</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-stone-300" />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-stone-100 rounded-lg text-stone-600"><Upload size={16} /></div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-stone-800">恢复备份</p>
                            <p className="text-[9px] text-stone-400">从本地备份文件恢复所有数据</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-stone-300" />
                </button>
                <input type="file" ref={fileInputRef} hidden accept=".json" onChange={handleFileChange} />
                
                <button 
                    onClick={() => {
                        if (showClearConfirm) { onClearData(); setShowClearConfirm(false); }
                        else setShowClearConfirm(true);
                    }} 
                    className={cn("w-full p-4 flex items-center justify-between transition-colors", showClearConfirm ? "bg-rose-50" : "hover:bg-stone-50")}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", showClearConfirm ? "bg-rose-500 text-white" : "bg-stone-100 text-stone-600")}>
                            {showClearConfirm ? <AlertTriangle size={16} /> : <Trash2 size={16} />}
                        </div>
                        <div className="text-left">
                            <p className={cn("text-xs font-bold", showClearConfirm ? "text-rose-600" : "text-stone-800")}>
                                {showClearConfirm ? "再次点击确认清空" : "清空所有数据"}
                            </p>
                            <p className="text-[9px] text-stone-400">重置所有任务、日程和记录</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-stone-300" />
                </button>
            </div>
        </section>
      </div>

      <TaskEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        onSave={handleSave}
        onDelete={onDeleteTask}
      />
    </div>
  );
};
