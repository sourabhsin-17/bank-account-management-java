export interface BankAccountInstance {
  id: string;
  variableName: string;
  accountNumber: string;
  accountHolderName: string;
  balance: number;
}

export interface ConsoleLine {
  id: string;
  text: string;
  tone: 'normal' | 'success' | 'error' | 'heading' | 'command';
}

export interface TransactionRecord {
  id: string;
  accountNumber: string;
  methodCall: string;
  outcome: 'Deposited' | 'Withdrawn' | 'Insufficient Balance' | 'Invalid Amount' | 'Checked' | 'Displayed';
  resultingBalance: number;
}

export const BANK_ACCOUNT_JAVA = `public class BankAccount {
    private String accountNumber;
    private String accountHolderName;
    private double balance;

    // Parameterized constructor
    public BankAccount(String accountNumber, String accountHolderName, double balance) {
        this.accountNumber = accountNumber;
        this.accountHolderName = accountHolderName;
        if (balance < 0) {
            System.out.println("Opening balance cannot be negative. Setting balance to 0.0");
            this.balance = 0.0;
        } else {
            this.balance = balance;
        }
    }

    public void deposit(double amount) {
        if (amount <= 0) {
            System.out.println("Deposit amount must be positive.");
            return;
        }
        balance += amount;
        System.out.println("Deposited " + amount + " to " + accountNumber + ". New balance: " + balance);
    }

    public void withdraw(double amount) {
        if (amount <= 0) {
            System.out.println("Withdrawal amount must be positive.");
            return;
        }
        if (amount > balance) {
            System.out.println("Insufficient balance in " + accountNumber + ". Available balance: " + balance);
            return;
        }
        balance -= amount;
        System.out.println("Withdrawn " + amount + " from " + accountNumber + ". Remaining balance: " + balance);
    }

    public void checkBalance() {
        System.out.println("Account " + accountNumber + " current balance: " + balance);
    }

    public void displayDetails() {
        System.out.println("Account Number: " + accountNumber);
        System.out.println("Account Holder: " + accountHolderName);
        System.out.println("Balance: " + balance);
        System.out.println();
    }
}`;

export const MAIN_JAVA = `public class Main {
    public static void main(String[] args) {
        // Create two independent BankAccount objects
        BankAccount acc1 = new BankAccount("SB101", "Rohan Mehta", 5000.0);
        BankAccount acc2 = new BankAccount("SB102", "Sneha Iyer", 2500.0);

        System.out.println("Initial Account Details:");
        acc1.displayDetails();
        acc2.displayDetails();

        // Operations on first account
        acc1.deposit(1500.0);
        acc1.withdraw(2000.0);
        acc1.withdraw(6000.0); // Should show insufficient balance
        acc1.checkBalance();

        System.out.println();

        // Operations on second account
        acc2.deposit(1000.0);
        acc2.withdraw(500.0);
        acc2.checkBalance();

        System.out.println("\\nFinal Account Details:");
        acc1.displayDetails();
        acc2.displayDetails();
    }
}`;

export const README_MD = `# Bank Account Management System

Simple Java OOP program implementing a \`BankAccount\` class and a \`Main\` driver class.

## Files

- \`BankAccount.java\` - defines \`accountNumber\`, \`accountHolderName\`, \`balance\`, constructor, and \`deposit\`, \`withdraw\`, \`checkBalance\`, \`displayDetails\` methods.
- \`Main.java\` - creates two \`BankAccount\` objects, runs deposit and withdrawal operations on both, and prints the final balances.

## Run

\`\`\`bash
javac BankAccount.java Main.java
java Main
\`\`\``;

export const INITIAL_ACCOUNTS: BankAccountInstance[] = [
  {
    id: 'acc-1',
    variableName: 'acc1',
    accountNumber: 'SB101',
    accountHolderName: 'Rohan Mehta',
    balance: 5000.0,
  },
  {
    id: 'acc-2',
    variableName: 'acc2',
    accountNumber: 'SB102',
    accountHolderName: 'Sneha Iyer',
    balance: 2500.0,
  },
];

export interface DemoStep {
  statement: string;
  targetAccountId: 'acc-1' | 'acc-2' | 'both';
  action: 'init' | 'display' | 'deposit' | 'withdraw' | 'check';
  amount?: number;
}

export const MAIN_DEMO_STEPS: DemoStep[] = [
  {
    statement: 'BankAccount acc1 = new BankAccount("SB101", "Rohan Mehta", 5000.0);',
    targetAccountId: 'acc-1',
    action: 'init',
  },
  {
    statement: 'BankAccount acc2 = new BankAccount("SB102", "Sneha Iyer", 2500.0);',
    targetAccountId: 'acc-2',
    action: 'init',
  },
  {
    statement: 'acc1.displayDetails(); acc2.displayDetails();',
    targetAccountId: 'both',
    action: 'display',
  },
  {
    statement: 'acc1.deposit(1500.0);',
    targetAccountId: 'acc-1',
    action: 'deposit',
    amount: 1500,
  },
  {
    statement: 'acc1.withdraw(2000.0);',
    targetAccountId: 'acc-1',
    action: 'withdraw',
    amount: 2000,
  },
  {
    statement: 'acc1.withdraw(6000.0);',
    targetAccountId: 'acc-1',
    action: 'withdraw',
    amount: 6000,
  },
  {
    statement: 'acc1.checkBalance();',
    targetAccountId: 'acc-1',
    action: 'check',
  },
  {
    statement: 'acc2.deposit(1000.0);',
    targetAccountId: 'acc-2',
    action: 'deposit',
    amount: 1000,
  },
  {
    statement: 'acc2.withdraw(500.0);',
    targetAccountId: 'acc-2',
    action: 'withdraw',
    amount: 500,
  },
  {
    statement: 'acc2.checkBalance();',
    targetAccountId: 'acc-2',
    action: 'check',
  },
  {
    statement: 'acc1.displayDetails(); acc2.displayDetails();',
    targetAccountId: 'both',
    action: 'display',
  },
];

export function formatJavaDouble(value: number): string {
  return Number.isInteger(value) ? `${value}.0` : String(Number(value.toFixed(2)));
}

export function formatAmountDisplay(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function triggerFileDownload(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
