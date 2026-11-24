import React, { useState, useEffect, useRef } from 'react';
import { Play, SkipForward, Trash2, Copy, Check, Download } from 'lucide-react';
import {
  ConsoleLine,
  BANK_ACCOUNT_JAVA,
  MAIN_JAVA,
  README_MD,
  MAIN_DEMO_STEPS,
  triggerFileDownload,
} from '../data/javaAssignmentData';

export type WorkbenchTab = 'console' | 'BankAccount.java' | 'Main.java' | 'README.md';

interface CodeAndConsolePaneProps {
  activeTab: WorkbenchTab;
  onTabChange: (tab: WorkbenchTab) => void;
  consoleLines: ConsoleLine[];
  demoStepIndex: number;
  onRunFullDemo: () => void;
  onStepDemo: () => void;
  onClearConsole: () => void;
}

const JAVA_KEYWORDS = new Set([
  'public',
  'private',
  'class',
  'void',
  'static',
  'new',
  'if',
  'else',
  'return',
  'this',
]);

const JAVA_TYPES = new Set(['String', 'double', 'BankAccount', 'System']);

function renderCodeLine(line: string, isMarkdown: boolean): React.ReactNode {
  if (isMarkdown) {
    if (line.startsWith('#')) {
      return <span className="text-zinc-100 font-semibold">{line}</span>;
    }
    return <span className="text-zinc-300">{line}</span>;
  }

  const trimmed = line.trim();
  if (trimmed.startsWith('//')) {
    return <span className="text-zinc-500">{line}</span>;
  }

  const tokenRegex = /(\/\/.*$|"(?:\\.|[^"\\])*"|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`p-${keyCounter++}`} className="text-zinc-400">
          {line.slice(lastIndex, match.index)}
        </span>
      );
    }

    const token = match[0];
    if (token.startsWith('//')) {
      nodes.push(
        <span key={`c-${keyCounter++}`} className="text-zinc-500">
          {token}
        </span>
      );
    } else if (token.startsWith('"')) {
      nodes.push(
        <span key={`s-${keyCounter++}`} className="text-emerald-300">
          {token}
        </span>
      );
    } else if (/^\d/.test(token)) {
      nodes.push(
        <span key={`n-${keyCounter++}`} className="text-amber-300">
          {token}
        </span>
      );
    } else if (JAVA_KEYWORDS.has(token)) {
      nodes.push(
        <span key={`k-${keyCounter++}`} className="text-sky-300">
          {token}
        </span>
      );
    } else if (JAVA_TYPES.has(token)) {
      nodes.push(
        <span key={`t-${keyCounter++}`} className="text-teal-300">
          {token}
        </span>
      );
    } else {
      nodes.push(
        <span key={`i-${keyCounter++}`} className="text-zinc-100">
          {token}
        </span>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    nodes.push(
      <span key={`tail-${keyCounter++}`} className="text-zinc-400">
        {line.slice(lastIndex)}
      </span>
    );
  }

  return nodes.length > 0 ? nodes : '\u00A0';
}

export const CodeAndConsolePane: React.FC<CodeAndConsolePaneProps> = ({
  activeTab,
  onTabChange,
  consoleLines,
  demoStepIndex,
  onRunFullDemo,
  onStepDemo,
  onClearConsole,
}) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab === 'console') {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [consoleLines, activeTab]);

  useEffect(() => {
    if (!copiedFile) return;
    const timer = window.setTimeout(() => setCopiedFile(null), 1600);
    return () => window.clearTimeout(timer);
  }, [copiedFile]);

  const files: Record<Exclude<WorkbenchTab, 'console'>, string> = {
    'BankAccount.java': BANK_ACCOUNT_JAVA,
    'Main.java': MAIN_JAVA,
    'README.md': README_MD,
  };

  const activeFileContent = activeTab !== 'console' ? files[activeTab] : '';
  const currentStep =
    demoStepIndex >= 0 && demoStepIndex < MAIN_DEMO_STEPS.length
      ? MAIN_DEMO_STEPS[demoStepIndex]
      : null;

  const handleCopyFile = async () => {
    if (activeTab === 'console') return;
    try {
      await navigator.clipboard.writeText(activeFileContent);
      setCopiedFile(activeTab);
    } catch {
      setCopiedFile(null);
    }
  };

  const tabs: { id: WorkbenchTab; label: string }[] = [
    { id: 'console', label: 'Console' },
    { id: 'BankAccount.java', label: 'BankAccount.java' },
    { id: 'Main.java', label: 'Main.java' },
    { id: 'README.md', label: 'README.md' },
  ];

  return (
    <div className="bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-md overflow-hidden flex flex-col">
      {/* Unified IDE Tab Header */}
      <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label="Workbench view" className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Context Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeTab === 'console' ? (
            <>
              <button
                type="button"
                onClick={onRunFullDemo}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-teal-700 hover:bg-teal-600 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-3 h-3" aria-hidden="true" />
                Run Main.java
              </button>
              <button
                type="button"
                onClick={onStepDemo}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <SkipForward className="w-3 h-3" aria-hidden="true" />
                {demoStepIndex < 0
                  ? 'Step'
                  : demoStepIndex + 1 >= MAIN_DEMO_STEPS.length
                    ? 'Restart'
                    : `Step (${demoStepIndex + 2}/${MAIN_DEMO_STEPS.length})`}
              </button>
              <button
                type="button"
                onClick={onClearConsole}
                title="Clear console"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                Clear
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCopyFile}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedFile === activeTab ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" aria-hidden="true" />
                    Copy
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => triggerFileDownload(activeTab, activeFileContent)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3 h-3" aria-hidden="true" />
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Console vs Code Viewport */}
      {activeTab === 'console' ? (
        <div className="flex flex-col">
          {currentStep && (
            <div className="px-4 py-2 bg-zinc-900/70 border-b border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto">
              <span className="text-zinc-500 mr-2">&gt;</span>
              {currentStep.statement}
            </div>
          )}
          <div
            aria-live="polite"
            className="p-4 font-mono text-xs leading-6 h-[490px] overflow-y-auto space-y-0.5"
          >
            {consoleLines.map((line) => {
              let color = 'text-zinc-300';
              if (line.tone === 'command') color = 'text-zinc-400';
              if (line.tone === 'heading') color = 'text-white font-medium';
              if (line.tone === 'success') color = 'text-emerald-300';
              if (line.tone === 'error') color = 'text-rose-400';

              return (
                <div key={line.id} className={`${color} whitespace-pre-wrap break-words`}>
                  {line.text === '' ? '\u00A0' : line.text}
                </div>
              );
            })}
            <div ref={consoleEndRef} />
          </div>
        </div>
      ) : (
        <div className="h-[526px] overflow-auto py-3">
          <table className="w-full border-collapse font-mono text-xs leading-6">
            <tbody>
              {activeFileContent.split('\n').map((line, index) => (
                <tr key={index + 1} className="hover:bg-zinc-900/70">
                  <td className="select-none text-right pr-4 pl-4 text-zinc-600 tabular-nums w-11 align-top">
                    {index + 1}
                  </td>
                  <td className="pr-5 whitespace-pre align-top">
                    {renderCodeLine(line, activeTab === 'README.md')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
