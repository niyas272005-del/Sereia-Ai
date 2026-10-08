import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Bot, User, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import { copyToClipboard } from '../../utils/chatUtils';
import { cn } from '../../utils/cn';
import SmartActionCards from './SmartActionCards';

const ChatMessage = ({ message, isLatestBot }) => {
  const navigate = useNavigate();
  const isBot = message.sender === 'bot';
  const isSevere = message.classification === 'Severe';
  const [isCopied, setIsCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState(isBot && isLatestBot ? '' : message.text);

  // Typing effect for the latest bot message
  useEffect(() => {
    if (!isBot || !isLatestBot) {
      setDisplayedText(message.text);
      return;
    }

    let i = 0;
    const typingInterval = setInterval(() => {
      setDisplayedText(message.text.substring(0, i + 1));
      i++;
      if (i >= message.text.length) clearInterval(typingInterval);
    }, 12);

    return () => clearInterval(typingInterval);
  }, [message.text, isBot, isLatestBot]);

  const handleCopy = async () => {
    const success = await copyToClipboard(message.text);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!isBot) {
    // ── User message — right-aligned bubble ──
    return (
      <div className="flex justify-end px-4 md:px-8 py-3 animate-fade-in">
        <div className="flex items-end gap-2.5 max-w-[78%]">
          <div className="flex flex-col items-end gap-1">
            <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600
              text-white px-4 py-3 rounded-2xl rounded-br-md
              shadow-md shadow-indigo-500/20 text-sm leading-relaxed font-medium">
              {message.text}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1">You</span>
          </div>
          {/* User Avatar */}
          <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700
            flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4">
            <User size={14} />
          </div>
        </div>
      </div>
    );
  }

  const suggestion = message.suggestion_data;
  const exerciseTitle = suggestion?.relaxation_title || suggestion?.exercise_title;

  // ── Bot message — left-aligned with glass card ──
  return (
    <>
    <div className="flex px-4 md:px-8 py-3 gap-3 animate-fade-in">
      {/* AI Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600
            flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Sparkles size={15} />
          </div>
          {isLatestBot && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400
              border-2 border-white dark:border-slate-900" />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 max-w-[85%]">
        {/* Name + Copy */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Sereia</span>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full
              bg-gradient-to-r from-blue-500/10 to-violet-500/10
              text-indigo-600 dark:text-indigo-400 border border-indigo-200/30 dark:border-indigo-500/20">
              AI
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400
              transition-colors p-1 rounded-lg hover:bg-white/60 dark:hover:bg-white/5"
            title="Copy message"
          >
            {isCopied
              ? <Check size={13} className="text-emerald-500" />
              : <Copy size={13} />
            }
          </button>
        </div>

        {/* Safety Alert */}
        {isSevere && (
          <div className="flex items-start gap-3 p-3.5 mb-3
            bg-amber-50/80 dark:bg-amber-500/8 border border-amber-200/60 dark:border-amber-500/20
            rounded-xl backdrop-blur-sm">
            <AlertTriangle size={17} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-amber-700 dark:text-amber-400 mb-0.5">Safety Notice</p>
              <p className="text-amber-600 dark:text-amber-300/80 leading-relaxed">
                We detected content indicating severe distress. Please consider reaching out to professional help or dialing <strong>988</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div className="glass-card-sm px-4 py-3 border border-white/30 dark:border-white/8">
          {/* Left accent line */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-0.5 rounded-full bg-gradient-to-b from-blue-400 to-violet-500 opacity-60" />
            <div className="prose-chat flex-1 text-slate-700 dark:text-slate-200">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => {
                    const isInternal = href?.startsWith('/dashboard') || href?.startsWith('/');
                    if (isInternal) {
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(href);
                          }}
                          className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/50"
                        >
                          <span>{children}</span>
                          <ChevronRight size={12} />
                        </button>
                      );
                    }
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        {children}
                      </a>
                    );
                  }
                }}
              >
                {displayedText}
              </ReactMarkdown>

              {/* Inline Exercise Action Launcher inside message bubble if exercise suggested */}
              {exerciseTitle && (
                <div 
                  onClick={() => navigate(`/dashboard/wellness?open=${encodeURIComponent(exerciseTitle)}`)}
                  className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow">{suggestion.emoji || '✨'}</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Recommended Exercise
                      </p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {exerciseTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform bg-indigo-100 dark:bg-indigo-900/40 px-2.5 py-1 rounded-lg">
                    <span>Start Exercise</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              )}

              {isBot && isLatestBot && displayedText.length < message.text.length && (
                <span className="inline-block w-1.5 h-4 ml-1 rounded-full bg-gradient-to-b from-blue-500 to-violet-500 animate-pulse align-middle" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Smart Action Cards below bot message bubble */}
    {isBot && message.smartActions && message.smartActions.length > 0 && (
      <SmartActionCards actions={message.smartActions} />
    )}
    </>
  );
};

export default ChatMessage;
