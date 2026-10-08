import React, { useState } from 'react';
import { Search, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const ConversationList = ({ conversations, activeId, setActiveId, onNewChat, onDelete }) => {
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full md:w-64 lg:w-72 flex flex-col h-full shrink-0
      glass-panel border-r border-white/20 dark:border-white/6">

      <div className="p-4 border-b border-white/20 dark:border-white/6 space-y-3 shrink-0">
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
            bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold
            shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30
            hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <Plus size={17} />
          New Chat
        </button>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl transition-all duration-200
              glass-input text-slate-700 dark:text-slate-300 placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-300/50"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-10 px-4">
            <MessageSquare size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {search ? 'No conversations match your search.' : 'No conversations yet.'}
            </p>
          </div>
        ) : (
          filteredConversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={cn(
                "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150",
                activeId === conv.id
                  ? "glass-card-sm border border-white/40 dark:border-white/10 shadow-sm"
                  : "hover:bg-white/50 dark:hover:bg-white/4 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center",
                  activeId === conv.id
                    ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-white/8 text-slate-400 dark:text-slate-500"
                )}>
                  <MessageSquare size={12} />
                </div>
                <div className="truncate min-w-0">
                  <p className={cn(
                    "text-xs font-semibold truncate",
                    activeId === conv.id
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-300"
                  )}>
                    {conv.title}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400
                  opacity-0 group-hover:opacity-100 transition-all duration-150
                  rounded-lg hover:bg-rose-50/80 dark:hover:bg-rose-500/10 flex-shrink-0 ml-1"
                title="Delete chat"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
