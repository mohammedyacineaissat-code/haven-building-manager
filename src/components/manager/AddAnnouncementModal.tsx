import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Pin, 
  Wrench, 
  Users, 
  ShieldAlert, 
  Info, 
  AlertCircle,
  Building2,
  Send
} from 'lucide-react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';

interface AddAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type NoticeCategory = 'info' | 'maintenance' | 'meeting' | 'security' | 'urgent';

export const AddAnnouncementModal: React.FC<AddAnnouncementModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { addNotice, buildings, activeBuildingId } = useBuildingStore();
  const { t } = useLanguageStore();

  const currentBuilding = buildings.find(b => b.id === activeBuildingId) || buildings[0];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('info');
  const [author, setAuthor] = useState(t.announcement_modal.default_author);
  const [isPinned, setIsPinned] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: { id: NoticeCategory; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { id: 'info', label: t.announcement_modal.cat_info, icon: Info, color: 'blue' },
    { id: 'maintenance', label: t.announcement_modal.cat_maintenance, icon: Wrench, color: 'amber' },
    { id: 'meeting', label: t.announcement_modal.cat_meeting, icon: Users, color: 'indigo' },
    { id: 'security', label: t.announcement_modal.cat_security, icon: ShieldAlert, color: 'rose' },
    { id: 'urgent', label: t.announcement_modal.cat_urgent, icon: AlertCircle, color: 'red' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(t.announcement_modal.error_title_required);
      return;
    }

    if (!content.trim()) {
      setError(t.announcement_modal.error_content_required);
      return;
    }

    addNotice({
      buildingId: currentBuilding?.id,
      title: title.trim(),
      content: content.trim(),
      category,
      author: author.trim() || t.announcement_modal.default_author,
      isPinned
    });

    setTitle('');
    setContent('');
    setCategory('info');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 transition-colors">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.announcement_modal.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>{t.announcement_modal.display_for} {currentBuilding?.name}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.announcement_modal.category_label}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.announcement_modal.notice_title_label} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.announcement_modal.notice_title_placeholder}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-semibold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.announcement_modal.message_label} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.announcement_modal.message_placeholder}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 custom-scrollbar"
            />
          </div>

          {/* Author and Pin Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.announcement_modal.author_label}
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={t.announcement_modal.author_placeholder}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Pin className={`w-4 h-4 ${isPinned ? 'text-blue-600 dark:text-blue-500 fill-blue-600 dark:fill-blue-500' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.announcement_modal.pin_to_top}</span>
              </div>
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded cursor-pointer border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              {t.announcement_modal.cancel_btn}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.announcement_modal.publish_btn}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
