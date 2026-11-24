public class Main {
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

        System.out.println("\nFinal Account Details:");
        acc1.displayDetails();
        acc2.displayDetails();
    }
}
