import React, { useState } from 'react';
import { Plus, RotateCcw, AlertCircle, Check } from 'lucide-react';
import {
  BankAccountInstance,
  TransactionRecord,
  formatAmountDisplay,
} from '../data/javaAssignmentData';

interface AccountLedgerPaneProps {
  accounts: BankAccountInstance[];
  selectedAccountId: string;
  highlightedAccountId: string | null;
  transactions: TransactionRecord[];
  onSelectAccount: (id: string) => void;
  onDeposit: (accountId: string, amount: number) => void;
  onWithdraw: (accountId: string, amount: number) => void;
  onCheckBalance: (accountId: string) => void;
  onDisplayDetails: (accountId: string) => void;
  onCreateAccount: (accountNumber: string, holderName: string, initialBalance: number) => void;
  onResetAll: () => void;
}

export const AccountLedgerPane: React.FC<AccountLedgerPaneProps> = ({
  accounts,
  selectedAccountId,
  highlightedAccountId,
  transactions,
  onSelectAccount,
  onDeposit,
  onWithdraw,
  onCheckBalance,
  onDisplayDetails,
  onCreateAccount,
  onResetAll,
}) => {
  const [amountInput, setAmountInput] = useState<string>('1000');
  const [showNewForm, setShowNewForm] = useState<boolean>(false);
  const [newAccNumber, setNewAccNumber] = useState<string>('SB103');
  const [newHolderName, setNewHolderName] = useState<string>('');
  const [newBalance, setNewBalance] = useState<string>('1500');
  const [formError, setFormError] = useState<string | null>(null);

  const selectedAccount =
    accounts.find((a) => a.id === selectedAccountId) ?? accounts[0];

  const parsedAmount = (() => {
    const val = Number.parseFloat(amountInput);
    return Number.isFinite(val) ? val : 0;
  })();

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = newAccNumber.trim();
    const name = newHolderName.trim();
    const bal = Number.parseFloat(newBalance);

    if (!num || !name) {
      setFormError('Enter both account number and holder name.');
      return;
    }
    if (accounts.some((a) => a.accountNumber.toLowerCase() === num.toLowerCase())) {
      setFormError(`Account ${num} already exists.`);
      return;
    }
    if (!Number.isFinite(bal)) {
      setFormError('Enter a valid number for opening balance.');
      return;
    }

    setFormError(null);
    onCreateAccount(num, name, bal);
    setNewAccNumber(`SB${101 + accounts.length + 1}`);
    setNewHolderName('');
    setNewBalance('1500');
    setShowNewForm(false);
  };

  return (
    <div className="space-y-5">
      {/* BankAccount Instances Table / Selector */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900 whitespace-nowrap">
              BankAccount Instances
            </h2>
            <span className="text-xs text-zinc-500 font-mono tabular-nums">
              {accounts.length} active
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowNewForm((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-300 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              {showNewForm ? 'Cancel' : 'New Object'}
            </button>
            <button
              type="button"
              onClick={onResetAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-300 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {showNewForm && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-4 bg-zinc-50 border-b border-zinc-200 space-y-3"
          >
            <div className="text-xs font-mono text-zinc-600">
              new BankAccount(accountNumber, accountHolderName, balance)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="acc-num" className="block text-xs text-zinc-600 mb-1">
                  accountNumber
                </label>
                <input
                  id="acc-num"
                  type="text"
                  value={newAccNumber}
                  onChange={(e) => setNewAccNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div>
                <label htmlFor="acc-name" className="block text-xs text-zinc-600 mb-1">
                  accountHolderName
                </label>
                <input
                  id="acc-name"
                  type="text"
                  value={newHolderName}
                  onChange={(e) => setNewHolderName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div>
                <label htmlFor="acc-bal" className="block text-xs text-zinc-600 mb-1">
                  balance
                </label>
                <input
                  id="acc-bal"
                  type="number"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>
            {formError && (
              <p className="text-xs text-red-700 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {formError}
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
              >
                Create Instance
              </button>
            </div>
          </form>
        )}

        {/* Account Rows */}
        <div className="divide-y divide-zinc-200">
          {accounts.map((acc) => {
            const isSelected = selectedAccount?.id === acc.id;
            const isActiveStep = highlightedAccountId === acc.id;

            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => onSelectAccount(acc.id)}
                className={`w-full text-left px-4 py-3.5 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50/60'
                    : isActiveStep
                      ? 'bg-zinc-50'
                      : 'hover:bg-zinc-50'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                    <span className="text-zinc-900 font-medium">{acc.variableName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{acc.accountNumber}</span>
                    {isSelected && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-teal-800 font-sans font-medium">Selected</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-zinc-900 mt-0.5 truncate">
                    {acc.accountHolderName}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-zinc-500">Balance</div>
                  <div className="text-base font-semibold font-mono tabular-nums text-zinc-900">
                    {formatAmountDisplay(acc.balance)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Account Operations */}
        {selectedAccount && (
          <div className="p-4 bg-zinc-50/70 border-t border-zinc-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <span>
                Target object:{' '}
                <code className="font-mono text-zinc-900 font-medium">
                  {selectedAccount.variableName} ({selectedAccount.accountNumber})
                </code>
              </span>
              <span className="font-mono tabular-nums text-zinc-700">
                balance = {selectedAccount.balance.toFixed(1)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <label htmlFor="tx-amount" className="sr-only">
                  Amount
                </label>
                <input
                  id="tx-amount"
                  type="number"
                  step="50"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="Amount"
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-zinc-300 rounded focus:outline-none focus:border-teal-700"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDeposit(selectedAccount.id, parsedAmount)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  deposit()
                </button>
                <button
                  type="button"
                  onClick={() => onWithdraw(selectedAccount.id, parsedAmount)}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-300 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  withdraw()
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onCheckBalance(selectedAccount.id)}
                className="px-3 py-1.5 text-xs font-mono text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 border border-zinc-300 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                checkBalance()
              </button>
              <button
                type="button"
                onClick={() => onDisplayDetails(selectedAccount.id)}
                className="px-3 py-1.5 text-xs font-mono text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 border border-zinc-300 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                displayDetails()
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Method Call Log */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="px-4 py-2.5 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-800">Operation History</h3>
          <span className="text-xs font-mono tabular-nums text-zinc-500">
            {transactions.length} calls
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="px-4 py-6 text-xs text-zinc-500 text-center">
            No method calls yet. Use the controls above or run Main.java on the right.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                  <th className="py-2 px-3 font-medium">Method Call</th>
                  <th className="py-2 px-3 font-medium">Outcome</th>
                  <th className="py-2 px-3 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {transactions.slice(0, 7).map((tx) => {
                  const isErr =
                    tx.outcome === 'Insufficient Balance' || tx.outcome === 'Invalid Amount';
                  const isOk = tx.outcome === 'Deposited' || tx.outcome === 'Withdrawn';

                  return (
                    <tr key={tx.id}>
                      <td className="py-2 px-3 font-mono text-zinc-800 whitespace-nowrap">
                        {tx.methodCall}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {isErr ? (
                          <span className="inline-flex items-center gap-1 text-red-700 font-medium">
                            <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                            {tx.outcome}
                          </span>
                        ) : isOk ? (
                          <span className="inline-flex items-center gap-1 text-teal-800 font-medium">
                            <Check className="w-3 h-3 shrink-0" aria-hidden="true" />
                            {tx.outcome}
                          </span>
                        ) : (
                          <span className="text-zinc-600">{tx.outcome}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums text-right text-zinc-900 whitespace-nowrap">
                        {formatAmountDisplay(tx.resultingBalance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
