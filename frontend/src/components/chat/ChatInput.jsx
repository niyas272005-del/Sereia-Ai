import React, { useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send, Paperclip, Mic, Volume2, ArrowUp } from 'lucide-react';
import { cn } from '../../utils/cn';

const ChatInput = ({ input, setInput, handleSend, isLoading }) => {
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSend();
      }
    }
  };

  const canSend = input.trim() && !isLoading;

  return (
    <div className="px-4 pb-4 pt-3 shrink-0"
      style={{ background: 'transparent' }}
    >
      {/* Main input container */}
      <div className="max-w-3xl mx-auto">
        <div className={cn(
          "relative flex items-end gap-2 p-2 rounded-2xl transition-all duration-200",
          "glass-panel border",
          canSend
            ? "border-indigo-300/40 dark:border-indigo-500/25 shadow-[0_0_0_3px_rgba(99,102,241,0.08)]"
            : "border-white/25 dark:border-white/8"
        )}>

          {/* Left — Attach */}
          <button
            className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400
              hover:bg-white/60 dark:hover:bg-white/8 transition-all duration-200"
            title="Attach file (coming soon)"
            tabIndex={-1}
          >
            <Paperclip size={18} />
          </button>

          {/* Textarea */}
          <TextareaAutosize
            ref={inputRef}
            minRows={1}
            maxRows={6}
            placeholder="Message Sereia AI..."
            className="flex-1 bg-transparent resize-none outline-none py-2 px-1 text-sm
              text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500
              leading-relaxed font-medium scrollbar-thin"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isLoading}
          />

          {/* Right Actions */}
          <div className="flex items-center gap-1 shrink-0 pb-1">
            <button
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400
                hover:bg-white/60 dark:hover:bg-white/8 transition-all duration-200"
              title="Voice input (UI only)"
              tabIndex={-1}
            >
              <Mic size={18} />
            </button>
            <button
              className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400
                hover:bg-white/60 dark:hover:bg-white/8 transition-all duration-200"
              title="Read aloud (UI only)"
              tabIndex={-1}
            >
              <Volume2 size={18} />
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ml-1",
                "transition-all duration-200 shadow-md",
                canSend
                  ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                  : "bg-slate-100 dark:bg-white/6 text-slate-300 dark:text-slate-600 shadow-none cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              <ArrowUp size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Sereia may make mistakes. Always verify important health information.
          </span>
          <span className={cn(
            "text-[11px] font-medium tabular-nums",
            input.length > 1800 ? "text-rose-400" : "text-slate-300 dark:text-slate-600"
          )}>
            {input.length}/2000
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
