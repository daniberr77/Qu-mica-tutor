import React, { useState, useMemo } from 'react';
import { useChatHistory } from '../../context';
import type { ChatExportFormat } from '../../types';
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Pin,
  Download,
  Edit2,
  Check,
  X,
  FileText,
  FileCode,
  FileCheck,
} from 'lucide-react';

interface ConversationHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationHistoryDrawer: React.FC<ConversationHistoryDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    createNewConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    clearAllConversations,
    downloadConversation,
  } = useChatHistory();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [exportMenuId, setExportMenuId] = useState<string | null>(null);

  const filteredConversations = useMemo(() => {
    return conversations
      .filter((c) => {
        const matchesTitle = c.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = c.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesTitle || matchesTag;
      })
      .sort((a, b) => {
        // Pinned first, then newest updated
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [conversations, searchTerm]);

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    renameConversation(id, editTitle);
    setEditingId(null);
  };

  const handleNewConversation = () => {
    createNewConversation('didactic');
    onClose();
  };

  const handleSelect = (id: string) => {
    selectConversation(id);
    onClose();
  };

  const handleExport = (id: string, format: ChatExportFormat, e: React.MouseEvent) => {
    e.stopPropagation();
    downloadConversation(id, format);
    setExportMenuId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Historial de Consultas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {conversations.length} {conversations.length === 1 ? 'sesión guardada' : 'sesiones guardadas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleNewConversation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Consulta</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en el historial de temas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No se encontraron conversaciones
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Escribe una pregunta a QuimiBot para comenzar un nuevo registro.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingId === conv.id;
              const dateLabel = new Date(conv.updatedAt).toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={conv.id}
                  onClick={() => !isEditing && handleSelect(conv.id)}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(conv.id, e);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="w-full text-xs font-semibold px-2 py-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-slate-900 dark:text-white focus:outline-hidden"
                          />
                          <button
                            onClick={(e) => handleSaveRename(conv.id, e)}
                            className="p-1 text-emerald-600 hover:text-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {conv.pinned && (
                            <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                          <h3
                            className={`text-xs font-semibold truncate ${
                              isActive
                                ? 'text-emerald-900 dark:text-emerald-200'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {conv.title}
                          </h3>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-[10px] font-medium">
                          {conv.mode === 'stepbystep' ? 'Paso a paso' : conv.mode === 'quiz' ? 'Quiz' : 'Didáctico'}
                        </span>
                        <span>•</span>
                        <span>{conv.messages.length} msgs</span>
                        <span>•</span>
                        <span>{dateLabel}</span>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div
                      className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Pin/Unpin */}
                      <button
                        onClick={() => togglePinConversation(conv.id)}
                        title={conv.pinned ? 'Desfijar' : 'Fijar arriba'}
                        className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
                          conv.pinned ? 'text-amber-500' : 'text-slate-400'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {/* Rename */}
                      <button
                        onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                        title="Renombrar sesión"
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Export / Download Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setExportMenuId(exportMenuId === conv.id ? null : conv.id)}
                          title="Descargar conversación"
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {exportMenuId === conv.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-30">
                            <button
                              onClick={(e) => handleExport(conv.id, 'markdown', e)}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 flex items-center gap-2"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-500" />
                              <span>Markdown (.md)</span>
                            </button>
                            <button
                              onClick={(e) => handleExport(conv.id, 'json', e)}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 flex items-center gap-2"
                            >
                              <FileCode className="w-3.5 h-3.5 text-amber-500" />
                              <span>JSON (.json)</span>
                            </button>
                            <button
                              onClick={(e) => handleExport(conv.id, 'text', e)}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 flex items-center gap-2"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Texto (.txt)</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar la conversación "${conv.title}"?`)) {
                            deleteConversation(conv.id);
                          }
                        }}
                        title="Eliminar sesión"
                        className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => {
              if (
                window.confirm(
                  '¿Estás seguro de que deseas vaciar TODO el historial de conversaciones? Esta acción no se puede deshacer.'
                )
              ) {
                clearAllConversations();
              }
            }}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vaciar todo el historial</span>
          </button>

          <span className="text-[11px] text-slate-400">
            Autoguardado en navegador
          </span>
        </div>
      </div>
    </div>
  );
};
