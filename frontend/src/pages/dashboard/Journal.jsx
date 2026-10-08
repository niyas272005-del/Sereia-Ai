import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { Search, Filter, Sparkles, Check, Save, Clock, PenTool } from 'lucide-react';
import JournalCard from '../../components/dashboard/JournalCard';
import { cn } from '../../utils/cn';

const Journal = () => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showReflection, setShowReflection] = useState(false);
  const textareaRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('focus') === 'today') {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [location.search]);

  // Mock Journal History
  const journalHistory = [
    { id: 1, date: 'Today, 9:00 AM', title: 'Morning Reflections', preview: 'Started the day feeling a bit overwhelmed by my to-do list, but took some time to breathe...', emotion: 'anxious' },
    { id: 2, date: 'Yesterday, 8:30 PM', title: 'A Good Evening', preview: 'Had a wonderful dinner with friends. It really helped take my mind off work.', emotion: 'happy' },
    { id: 3, date: 'Mon, Oct 24', title: 'Feeling Stuck', preview: 'I just can\'t seem to find the motivation to start this new project. I know I need to, but...', emotion: 'sad' },
  ];

  // Auto-save simulation
  useEffect(() => {
    if (!content) return;
    
    setIsSaving(true);
    const timer = setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 1500);

    return () => clearTimeout(timer);
  }, [content]);

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="h-[calc(100vh-80px)] -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8 flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 animate-fade-in-up overflow-hidden">
      
      {/* Left Pane: History */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col shrink-0 h-1/2 md:h-full">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Journal History</h2>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search entries..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {journalHistory.map(entry => (
            <JournalCard key={entry.id} {...entry} />
          ))}
        </div>
      </div>

      {/* Right Pane: Editor */}
      <div className="flex-1 flex flex-col h-1/2 md:h-full bg-white dark:bg-slate-900">
        
        {/* Editor Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 block">Today's Prompt</span>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">What is one thing you are grateful for today?</h3>
          </div>
          <button 
            onClick={() => setShowReflection(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Sparkles size={16} />
            AI Reflection
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative group">
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <input 
              type="text"
              placeholder="Give your entry a title..."
              className="text-3xl font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none mb-6 placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
            
            {/* Toolbar mockup */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="font-serif font-bold cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">B</span>
              <span className="font-serif italic cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">I</span>
              <span className="font-serif underline cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">U</span>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
              <PenTool size={16} className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" />
            </div>

            <TextareaAutosize
              ref={textareaRef}
              minRows={10}
              placeholder="Start writing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 bg-transparent resize-none outline-none text-lg leading-relaxed text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
          </div>

          {/* AI Reflection Overlay */}
          {showReflection && (
            <div className="absolute inset-x-4 top-4 md:right-8 md:left-auto md:w-80 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900/50 animate-fade-in-up z-10">
              <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400 font-semibold">
                <Sparkles size={18} />
                Sereia's Insight
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {content.length < 50 
                  ? "Keep writing! I need a bit more context to provide a meaningful reflection."
                  : "It sounds like you're exploring some deep feelings today. Acknowledging these emotions is a huge step. Notice how you feel after writing this down."}
              </p>
              <button 
                onClick={() => setShowReflection(false)}
                className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Editor Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs font-medium text-slate-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {isSaving ? (
                <>
                  <Save size={14} className="animate-pulse" />
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Check size={14} className="text-green-500" />
                  <span>Saved at {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Not saved yet</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Journal;
