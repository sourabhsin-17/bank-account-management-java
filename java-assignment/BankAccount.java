public class BankAccount {
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
}
