/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import {
  BankAccountInstance,
  ConsoleLine,
  TransactionRecord,
  INITIAL_ACCOUNTS,
  MAIN_DEMO_STEPS,
  BANK_ACCOUNT_JAVA,
  MAIN_JAVA,
  README_MD,
  formatJavaDouble,
  triggerFileDownload,
} from './data/javaAssignmentData';
import { AccountLedgerPane } from './components/AccountLedgerPane';
import { CodeAndConsolePane, WorkbenchTab } from './components/CodeAndConsolePane';

let idCounter = 100;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function createInitialConsole(): ConsoleLine[] {
  return [
    { id: nextId('c'), text: '$ javac BankAccount.java Main.java', tone: 'command' },
    { id: nextId('c'), text: '$ java Main', tone: 'command' },
    { id: nextId('c'), text: 'Click "Run Main.java" or test methods on acc1 / acc2.', tone: 'normal' },
  ];
}

function formatDetailsLines(account: BankAccountInstance): ConsoleLine[] {
  return [
    { id: nextId('c'), text: `Account Number: ${account.accountNumber}`, tone: 'normal' },
    { id: nextId('c'), text: `Account Holder: ${account.accountHolderName}`, tone: 'normal' },
    { id: nextId('c'), text: `Balance: ${formatJavaDouble(account.balance)}`, tone: 'heading' },
    { id: nextId('c'), text: '', tone: 'normal' },
  ];
}

const COMPILE_SNIPPET = `javac BankAccount.java Main.java
java Main`;

const GIT_SNIPPET = `git init
git add BankAccount.java Main.java README.md
git commit -m "Add Bank Account Management System"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main`;

export default function App() {
  const [accounts, setAccounts] = useState<BankAccountInstance[]>(() =>
    INITIAL_ACCOUNTS.map((a) => ({ ...a }))
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc-1');
  const [highlightedAccountId, setHighlightedAccountId] = useState<string | null>(null);
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>(createInitialConsole);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [demoStepIndex, setDemoStepIndex] = useState<number>(-1);
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('console');
  const [copiedCli, setCopiedCli] = useState<'compile' | 'git' | null>(null);

  useEffect(() => {
    if (!copiedCli) return;
    const timer = window.setTimeout(() => setCopiedCli(null), 1500);
    return () => window.clearTimeout(timer);
  }, [copiedCli]);

  const appendConsole = (lines: ConsoleLine[]) => {
    setConsoleLines((prev) => [...prev, ...lines]);
  };

  const addTransaction = (record: Omit<TransactionRecord, 'id'>) => {
    setTransactions((prev) => [{ ...record, id: nextId('tx') }, ...prev]);
  };

  const handleDeposit = (accountId: string, amount: number) => {
    const target = accounts.find((a) => a.id === accountId);
    if (!target) return;

    setSelectedAccountId(accountId);
    setHighlightedAccountId(accountId);
    setActiveTab('console');

    if (!Number.isFinite(amount) || amount <= 0) {
      appendConsole([{ id: nextId('c'), text: 'Deposit amount must be positive.', tone: 'error' }]);
      addTransaction({
        accountNumber: target.accountNumber,
        methodCall: `${target.variableName}.deposit(${formatJavaDouble(amount)})`,
        outcome: 'Invalid Amount',
        resultingBalance: target.balance,
      });
      return;
    }

    const updatedBalance = target.balance + amount;
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, balance: updatedBalance } : a))
    );
    appendConsole([
      {
        id: nextId('c'),
        text: `Deposited ${formatJavaDouble(amount)} to ${target.accountNumber}. New balance: ${formatJavaDouble(updatedBalance)}`,
        tone: 'success',
      },
    ]);
    addTransaction({
      accountNumber: target.accountNumber,
      methodCall: `${target.variableName}.deposit(${formatJavaDouble(amount)})`,
      outcome: 'Deposited',
      resultingBalance: updatedBalance,
    });
  };

  const handleWithdraw = (accountId: string, amount: number) => {
    const target = accounts.find((a) => a.id === accountId);
    if (!target) return;

    setSelectedAccountId(accountId);
    setHighlightedAccountId(accountId);
    setActiveTab('console');

    if (!Number.isFinite(amount) || amount <= 0) {
      appendConsole([
        { id: nextId('c'), text: 'Withdrawal amount must be positive.', tone: 'error' },
      ]);
      addTransaction({
        accountNumber: target.accountNumber,
        methodCall: `${target.variableName}.withdraw(${formatJavaDouble(amount)})`,
        outcome: 'Invalid Amount',
        resultingBalance: target.balance,
      });
      return;
    }

    if (amount > target.balance) {
      appendConsole([
        {
          id: nextId('c'),
          text: `Insufficient balance in ${target.accountNumber}. Available balance: ${formatJavaDouble(target.balance)}`,
          tone: 'error',
        },
      ]);
      addTransaction({
        accountNumber: target.accountNumber,
        methodCall: `${target.variableName}.withdraw(${formatJavaDouble(amount)})`,
        outcome: 'Insufficient Balance',
        resultingBalance: target.balance,
      });
      return;
    }

    const updatedBalance = target.balance - amount;
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, balance: updatedBalance } : a))
    );
    appendConsole([
      {
        id: nextId('c'),
        text: `Withdrawn ${formatJavaDouble(amount)} from ${target.accountNumber}. Remaining balance: ${formatJavaDouble(updatedBalance)}`,
        tone: 'success',
      },
    ]);
    addTransaction({
      accountNumber: target.accountNumber,
      methodCall: `${target.variableName}.withdraw(${formatJavaDouble(amount)})`,
      outcome: 'Withdrawn',
      resultingBalance: updatedBalance,
    });
  };

  const handleCheckBalance = (accountId: string) => {
    const target = accounts.find((a) => a.id === accountId);
    if (!target) return;

    setSelectedAccountId(accountId);
    setActiveTab('console');
    appendConsole([
      {
        id: nextId('c'),
        text: `Account ${target.accountNumber} current balance: ${formatJavaDouble(target.balance)}`,
        tone: 'heading',
      },
    ]);
    addTransaction({
      accountNumber: target.accountNumber,
      methodCall: `${target.variableName}.checkBalance()`,
      outcome: 'Checked',
      resultingBalance: target.balance,
    });
  };

  const handleDisplayDetails = (accountId: string) => {
    const target = accounts.find((a) => a.id === accountId);
    if (!target) return;

    setSelectedAccountId(accountId);
    setActiveTab('console');
    appendConsole(formatDetailsLines(target));
    addTransaction({
      accountNumber: target.accountNumber,
      methodCall: `${target.variableName}.displayDetails()`,
      outcome: 'Displayed',
      resultingBalance: target.balance,
    });
  };

  const handleCreateAccount = (
    accountNumber: string,
    holderName: string,
    initialBalance: number
  ) => {
    const varName = `acc${accounts.length + 1}`;
    const validBalance = initialBalance < 0 ? 0.0 : initialBalance;
    const newAccount: BankAccountInstance = {
      id: nextId('acc'),
      variableName: varName,
      accountNumber,
      accountHolderName: holderName,
      balance: validBalance,
    };

    const lines: ConsoleLine[] = [
      {
        id: nextId('c'),
        text: `> BankAccount ${varName} = new BankAccount("${accountNumber}", "${holderName}", ${formatJavaDouble(initialBalance)});`,
        tone: 'command',
      },
    ];
    if (initialBalance < 0) {
      lines.push({
        id: nextId('c'),
        text: 'Opening balance cannot be negative. Setting balance to 0.0',
        tone: 'error',
      });
    }
    lines.push(...formatDetailsLines(newAccount));

    setAccounts((prev) => [...prev, newAccount]);
    setSelectedAccountId(newAccount.id);
    setActiveTab('console');
    appendConsole(lines);
  };

  const handleRunFullDemo = () => {
    const acc1 = { ...INITIAL_ACCOUNTS[0] };
    const acc2 = { ...INITIAL_ACCOUNTS[1] };

    const lines: ConsoleLine[] = [
      { id: nextId('c'), text: '$ java Main', tone: 'command' },
      { id: nextId('c'), text: 'Initial Account Details:', tone: 'heading' },
      ...formatDetailsLines(acc1),
      ...formatDetailsLines(acc2),
    ];

    const demoTxs: TransactionRecord[] = [];

    // acc1 operations
    acc1.balance += 1500.0;
    lines.push({
      id: nextId('c'),
      text: `Deposited 1500.0 to ${acc1.accountNumber}. New balance: ${formatJavaDouble(acc1.balance)}`,
      tone: 'success',
    });
    demoTxs.unshift({
      id: nextId('tx'),
      accountNumber: acc1.accountNumber,
      methodCall: 'acc1.deposit(1500.0)',
      outcome: 'Deposited',
      resultingBalance: acc1.balance,
    });

    acc1.balance -= 2000.0;
    lines.push({
      id: nextId('c'),
      text: `Withdrawn 2000.0 from ${acc1.accountNumber}. Remaining balance: ${formatJavaDouble(acc1.balance)}`,
      tone: 'success',
    });
    demoTxs.unshift({
      id: nextId('tx'),
      accountNumber: acc1.accountNumber,
      methodCall: 'acc1.withdraw(2000.0)',
      outcome: 'Withdrawn',
      resultingBalance: acc1.balance,
    });

    lines.push({
      id: nextId('c'),
      text: `Insufficient balance in ${acc1.accountNumber}. Available balance: ${formatJavaDouble(acc1.balance)}`,
      tone: 'error',
    });
    demoTxs.unshift({
      id: nextId('tx'),
      accountNumber: acc1.accountNumber,
      methodCall: 'acc1.withdraw(6000.0)',
      outcome: 'Insufficient Balance',
      resultingBalance: acc1.balance,
    });

    lines.push({
      id: nextId('c'),
      text: `Account ${acc1.accountNumber} current balance: ${formatJavaDouble(acc1.balance)}`,
      tone: 'heading',
    });
    lines.push({ id: nextId('c'), text: '', tone: 'normal' });

    // acc2 operations
    acc2.balance += 1000.0;
    lines.push({
      id: nextId('c'),
      text: `Deposited 1000.0 to ${acc2.accountNumber}. New balance: ${formatJavaDouble(acc2.balance)}`,
      tone: 'success',
    });
    demoTxs.unshift({
      id: nextId('tx'),
      accountNumber: acc2.accountNumber,
      methodCall: 'acc2.deposit(1000.0)',
      outcome: 'Deposited',
      resultingBalance: acc2.balance,
    });

    acc2.balance -= 500.0;
    lines.push({
      id: nextId('c'),
      text: `Withdrawn 500.0 from ${acc2.accountNumber}. Remaining balance: ${formatJavaDouble(acc2.balance)}`,
      tone: 'success',
    });
    demoTxs.unshift({
      id: nextId('tx'),
      accountNumber: acc2.accountNumber,
      methodCall: 'acc2.withdraw(500.0)',
      outcome: 'Withdrawn',
      resultingBalance: acc2.balance,
    });

    lines.push({
      id: nextId('c'),
      text: `Account ${acc2.accountNumber} current balance: ${formatJavaDouble(acc2.balance)}`,
      tone: 'heading',
    });
    lines.push({ id: nextId('c'), text: '', tone: 'normal' });
    lines.push({ id: nextId('c'), text: 'Final Account Details:', tone: 'heading' });
    lines.push(...formatDetailsLines(acc1));
    lines.push(...formatDetailsLines(acc2));

    setAccounts([acc1, acc2]);
    setConsoleLines(lines);
    setTransactions(demoTxs);
    setHighlightedAccountId(null);
    setDemoStepIndex(MAIN_DEMO_STEPS.length - 1);
  };

  const handleStepDemo = () => {
    const nextIndex = demoStepIndex + 1 >= MAIN_DEMO_STEPS.length ? 0 : demoStepIndex + 1;

    if (nextIndex === 0) {
      const fresh1 = { ...INITIAL_ACCOUNTS[0] };
      const fresh2 = { ...INITIAL_ACCOUNTS[1] };
      setAccounts([fresh1, fresh2]);
      setTransactions([]);
      setSelectedAccountId('acc-1');
      setHighlightedAccountId('acc-1');
      setConsoleLines([
        { id: nextId('c'), text: '$ java Main  (stepping)', tone: 'command' },
        {
          id: nextId('c'),
          text: `Created acc1 ("${fresh1.accountNumber}", "${fresh1.accountHolderName}", ${formatJavaDouble(fresh1.balance)})`,
          tone: 'success',
        },
      ]);
      setDemoStepIndex(0);
      return;
    }

    const step = MAIN_DEMO_STEPS[nextIndex];
    setDemoStepIndex(nextIndex);

    if (step.action === 'init' && step.targetAccountId === 'acc-2') {
      const acc2 = accounts.find((a) => a.id === 'acc-2') ?? INITIAL_ACCOUNTS[1];
      setSelectedAccountId('acc-2');
      setHighlightedAccountId('acc-2');
      appendConsole([
        {
          id: nextId('c'),
          text: `Created acc2 ("${acc2.accountNumber}", "${acc2.accountHolderName}", ${formatJavaDouble(acc2.balance)})`,
          tone: 'success',
        },
      ]);
      return;
    }

    if (step.action === 'display' && step.targetAccountId === 'both') {
      const acc1 = accounts.find((a) => a.id === 'acc-1') ?? INITIAL_ACCOUNTS[0];
      const acc2 = accounts.find((a) => a.id === 'acc-2') ?? INITIAL_ACCOUNTS[1];
      setHighlightedAccountId(null);
      appendConsole([
        {
          id: nextId('c'),
          text: nextIndex === 2 ? 'Initial Account Details:' : 'Final Account Details:',
          tone: 'heading',
        },
        ...formatDetailsLines(acc1),
        ...formatDetailsLines(acc2),
      ]);
      return;
    }

    if (step.targetAccountId === 'acc-1' || step.targetAccountId === 'acc-2') {
      if (step.action === 'deposit' && step.amount !== undefined) {
        handleDeposit(step.targetAccountId, step.amount);
      } else if (step.action === 'withdraw' && step.amount !== undefined) {
        handleWithdraw(step.targetAccountId, step.amount);
      } else if (step.action === 'check') {
        handleCheckBalance(step.targetAccountId);
      }
    }
  };

  const handleResetAll = () => {
    setAccounts(INITIAL_ACCOUNTS.map((a) => ({ ...a })));
    setSelectedAccountId('acc-1');
    setHighlightedAccountId(null);
    setTransactions([]);
    setConsoleLines(createInitialConsole());
    setDemoStepIndex(-1);
  };

  const handleClearConsole = () => {
    setConsoleLines([{ id: nextId('c'), text: '$ _', tone: 'command' }]);
  };

  const handleDownloadAll = () => {
    triggerFileDownload('BankAccount.java', BANK_ACCOUNT_JAVA);
    window.setTimeout(() => {
      triggerFileDownload('Main.java', MAIN_JAVA);
    }, 150);
    window.setTimeout(() => {
      triggerFileDownload('README.md', README_MD);
    }, 300);
  };

  const handleCopyCli = async (which: 'compile' | 'git', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCli(which);
    } catch {
      setCopiedCli(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-900 flex flex-col">
      {/* 3-Zone Top Bar */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          <a
            href="#workbench"
            className="text-sm font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0"
          >
            BankAccount Studio
          </a>

          <nav
            aria-label="Workspace sections"
            className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600"
          >
            <a
              href="#workbench"
              onClick={() => setActiveTab('console')}
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Workbench
            </a>
            <a
              href="#workbench"
              onClick={() => setActiveTab('BankAccount.java')}
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              BankAccount.java
            </a>
            <a
              href="#workbench"
              onClick={() => setActiveTab('Main.java')}
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Main.java
            </a>
            <a
              href="#cli-guide"
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Run &amp; GitHub
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Download .java Files
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main id="workbench" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-7 space-y-8">
        {/* Compact Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 pb-4 border-b border-zinc-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Bank Account Management System
            </h1>
            <p className="text-xs text-zinc-600 mt-1">
              BankAccount class (accountNumber, accountHolderName, balance) · Parameterized constructor · Independent account objects
            </p>
          </div>
          <div className="text-xs font-mono text-zinc-500 whitespace-nowrap">
            BankAccount.java + Main.java
          </div>
        </div>

        {/* Two-Pane Split: Left Account Ledger / Right Console & Code */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <AccountLedgerPane
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              highlightedAccountId={highlightedAccountId}
              transactions={transactions}
              onSelectAccount={setSelectedAccountId}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
              onCheckBalance={handleCheckBalance}
              onDisplayDetails={handleDisplayDetails}
              onCreateAccount={handleCreateAccount}
              onResetAll={handleResetAll}
            />
          </div>

          <div className="lg:col-span-7">
            <CodeAndConsolePane
              activeTab={activeTab}
              onTabChange={setActiveTab}
              consoleLines={consoleLines}
              demoStepIndex={demoStepIndex}
              onRunFullDemo={handleRunFullDemo}
              onStepDemo={handleStepDemo}
              onClearConsole={handleClearConsole}
            />
          </div>
        </div>

        {/* Compact Compile & GitHub Guide */}
        <section id="cli-guide" className="pt-4 border-t border-zinc-200">
          <h2 className="text-sm font-semibold text-zinc-900 mb-3">
            Compile locally &amp; push to GitHub
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-zinc-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-700">1. Compile &amp; Run</span>
                <button
                  type="button"
                  onClick={() => handleCopyCli('compile', COMPILE_SNIPPET)}
                  className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-950 cursor-pointer"
                >
                  {copiedCli === 'compile' ? (
                    <>
                      <Check className="w-3 h-3 text-teal-700" aria-hidden="true" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" aria-hidden="true" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-zinc-950 text-zinc-200 rounded text-xs font-mono overflow-x-auto leading-relaxed">
                {COMPILE_SNIPPET}
              </pre>
            </div>

            <div className="bg-white border border-zinc-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-700">
                  2. Push to Public GitHub Repository
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCli('git', GIT_SNIPPET)}
                  className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-950 cursor-pointer"
                >
                  {copiedCli === 'git' ? (
                    <>
                      <Check className="w-3 h-3 text-teal-700" aria-hidden="true" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" aria-hidden="true" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-zinc-950 text-zinc-200 rounded text-xs font-mono overflow-x-auto leading-relaxed">
                {GIT_SNIPPET}
              </pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
