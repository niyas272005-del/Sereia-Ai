import React from 'react';
import { Download, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { exportChat } from '../../utils/chatUtils';
import Button from '../common/Button';

const ChatSidebar = ({ currentMessages }) => {
  const hasMessages = currentMessages && currentMessages.length > 0;

  return (
    <div className="hidden xl:flex w-72 flex-col shrink-0 h-full
      glass-panel border-l border-white/20 dark:border-white/6">

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/20 dark:border-white/6">
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600
            flex items-center justify-center shadow-sm">
            <Sparkles size={12} className="text-white" />
          </div>
          AI Status
        </h3>
      </div>

      <div className="flex-1 p-5 space-y-5 overflow-y-auto scrollbar-thin">

        {/* Connection Status */}
        <div className="quantum-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Sereia is online</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            Connected to secure NLP engine. End-to-end encrypted.
          </p>
        </div>

        {/* Conversation Summary */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Conversation Summary
          </h4>
          {hasMessages ? (
            <div className="quantum-card p-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "User is discussing work-related stress and feeling overwhelmed. Guided through mindful breathing exercises."
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic leading-relaxed pl-1">
              Start a conversation to see AI-generated insights here.
            </p>
          )}
        </div>

        {/* Tools */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Tools
          </h4>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-start"
            onClick={() => exportChat(currentMessages, 'Sereia-Chat')}
            disabled={!hasMessages}
          >
            <Download size={14} className="mr-2 flex-shrink-0" />
            Export Conversation
          </Button>
        </div>
      </div>

      {/* Crisis footer */}
      <div className="p-4 border-t border-white/20 dark:border-white/6">
        <div className="quantum-card p-3.5 flex items-start gap-3">
          <ShieldCheck size={16} className="flex-shrink-0 mt-0.5 text-indigo-500 dark:text-indigo-400" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            In a crisis? Call <strong className="text-slate-700 dark:text-slate-200">988</strong> immediately. Sereia is not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
