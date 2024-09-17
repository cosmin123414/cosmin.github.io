# <center> Online Store Database Design Using DB2 </center>

<br>
<br>

In this article, I will present the design and implementation of a SQL-based DB2 database tailored for an online electronics store. The system is designed to manage the essential operations of a real-world online store, including managing customer data, product information, orders, payments, shipments, and reviews. The database captures the complex relationships between these entities in a structured and efficient way.

The database schema has been designed with scalability and real-world application in mind. While some aspects have been simplified for practical reasons, it includes all core components required for a fully operational online store. Below, I will explain the key components of the database, its design, and how the different entities interact with one another. The full schema will be provided, as well as an ER diagram to visually represent the relationships between entities.

<br>

## Functional Requirements

The online store database must fulfill several functional requirements to ensure a smooth and efficient operation of the platform. Below is a summary of these requirements:

### Product Management:
 - The database should allow the store to add, update, or remove product listings.
  
 - The system must track product availability (i.e., stock levels) and manage categories for easy product classification.

### Customer Management:
 - Customers must be able to create an account, edit personal information, and store multiple payment methods securely.

 - Each customer should be able to view their order history, update their addresses, and modify their payment preferences.

### Order Processing:
 - The system should support the creation, management, and fulfillment of customer orders.

 - Orders should be tied to customer accounts, and each order can include multiple products.

 - The system must ensure that stock levels are updated after an order is placed.

### Payment Handling:
 - The system must store and process customer payment details securely, ensuring that invoices are generated, linked to the correct customer and order, and marked as paid upon successful payment.

### Shipment Tracking:
 - The system should track shipments associated with customer orders, recording the delivery address, carrier, and delivery status.

### Review and Feedback:
 - The system must allow customers to provide reviews for products they have purchased.

 - Reviews must be tied to both the customer and the product, allowing the store to track feedback for each product.

### Supplier Management:
 - The system must track suppliers and their relationship to the products they provide, ensuring that the store can manage supplier contact information and product pricing effectively.

### Staff Management:
 - The database should allow for the addition, modification, and removal of staff members responsible for various store operations.

 - Staff can be assigned to orders for processing, and supervisors should be linked to their respective staff members.

### Reports and Analytics:
 - The system should support generating reports about orders, payments, inventory levels, and customer behavior to aid in business decisions.
<br>

## Data Entities, and Relationships

The database structure revolves around several key entities, each representing a real-world component of an online store. These entities and their attributes are carefully designed to represent the essential operations and interactions within the system.

### Products
The Product table stores information about all items available in the online store. Each product has attributes such as a unique productID, productName, category, fullPrice, discount, and stock. The archivedFlag attribute is used to indicate whether a product is currently available for purchase.

```sql
CREATE TABLE Product (
    productID INT PRIMARY KEY,
    productName VARCHAR(100),
    category VARCHAR(50),
    fullPrice DECIMAL(10, 2),
    discount DECIMAL(5, 2),
    stock INT,
    archivedFlag BOOLEAN
);
```

### Customers
The Customer table stores customer account information, including a unique customerID, personal details, and login credentials. The system requires customers to create an account before making a purchase, and each customer can be associated with multiple payment methods.

```sql
CREATE TABLE Customer (
    customerID INT PRIMARY KEY,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    preferredLanguage VARCHAR(20),
    address VARCHAR(255)
);
```

### Payment Methods
Customers can have multiple payment methods, which are stored in the PaymentMethod table. Each payment method is linked to a customer and includes details like the card type, number, expiry date, and security code.

```sql
CREATE TABLE PaymentMethod (
    customerID INT,
    cardNumber VARCHAR(16),
    type VARCHAR(20),
    cardExpiryDate DATE,
    securityCode VARCHAR(3),
    PRIMARY KEY (customerID, cardNumber),
    FOREIGN KEY (customerID) REFERENCES Customer(customerID)
);
```

### Orders
Customers can place orders, which are stored in the Order table. Each order is linked to the customer who placed it and includes multiple products via the OrderItem table. The staffID attribute references the staff member responsible for filling the order.

```sql
CREATE TABLE Order (
    orderID INT PRIMARY KEY,
    customerID INT,
    staffID INT,
    FOREIGN KEY (customerID) REFERENCES Customer(customerID),
    FOREIGN KEY (staffID) REFERENCES Staff(staffID)
);
```

### Order Items
The OrderItem table captures the individual products included in each order. It records the productID, the quantity ordered, and is uniquely identified by the combination of orderID and itemNumber.

```sql
CREATE TABLE OrderItem (
    orderID INT,
    itemNumber INT,
    productID INT,
    quantity INT,
    PRIMARY KEY (orderID, itemNumber),
    FOREIGN KEY (orderID) REFERENCES Order(orderID),
    FOREIGN KEY (productID) REFERENCES Product(productID)
);
```

### Invoices
When a customer finalizes an order, an invoice is generated and stored in the Invoice table. It includes the total amount to be paid, the associated order, and flags indicating whether the invoice has been paid.

```sql
CREATE TABLE Invoice (
    invoiceID INT PRIMARY KEY,
    orderID INT UNIQUE,
    datePosted DATE,
    amount DECIMAL(10, 2),
    paidFlag BOOLEAN,
    FOREIGN KEY (orderID) REFERENCES Order(orderID)
);
```

### Payments and Shipments
Payments are processed through the Payment table, which stores transactions related to invoices. The Shipment table tracks the delivery details once an invoice is paid, including the shipment fee and carrier information.

```sql
CREATE TABLE Payment (
    invoiceID INT,
    customerID INT,
    cardNumber VARCHAR(16),
    transactionDate DATE,
    totalAmount DECIMAL(10, 2),
    PRIMARY KEY (invoiceID),
    FOREIGN KEY (invoiceID) REFERENCES Invoice(invoiceID),
    FOREIGN KEY (customerID) REFERENCES Customer(customerID),
    FOREIGN KEY (cardNumber) REFERENCES PaymentMethod(cardNumber)
);

CREATE TABLE Shipment (
    trackingNumber VARCHAR(20) PRIMARY KEY,
    invoiceID INT UNIQUE,
    address VARCHAR(255),
    deliveredFlag BOOLEAN,
    carrier VARCHAR(50),
    fee DECIMAL(10, 2),
    FOREIGN KEY (invoiceID) REFERENCES Invoice(invoiceID)
);
```

### Suppliers
The Supplier table holds data about suppliers that provide products to the store. Suppliers can be linked to multiple products, and products may have multiple suppliers.

```sql
CREATE TABLE Supplier (
    supplierID INT PRIMARY KEY,
    supplierName VARCHAR(100),
    contactInfo VARCHAR(255)
);

CREATE TABLE SuppliesProduct (
    productID INT,
    supplierID INT,
    price DECIMAL(10, 2),
    PRIMARY KEY (productID, supplierID),
    FOREIGN KEY (productID) REFERENCES Product(productID),
    FOREIGN KEY (supplierID) REFERENCES Supplier(supplierID)
);
```

### Staff
Staff members manage the daily operations of the store. Each staff member can be assigned to fill customer orders, and the Staff table captures their details and organizational structure.

```sql
CREATE TABLE Staff (
    staffID INT PRIMARY KEY,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    position VARCHAR(50),
    department VARCHAR(50),
    supervisorID INT,
    FOREIGN KEY (supervisorID) REFERENCES Staff(staffID)
);
```

### Order Fulfillment
The FillsOrder table tracks which staff member processes each order, establishing a link between the store's staff and customer orders.

```sql
CREATE TABLE FillsOrder (
    staffID INTEGER NOT NULL,
    oid INTEGER NOT NULL,
    PRIMARY KEY(staffID, oid),
    FOREIGN KEY(staffID) REFERENCES staff(staffID),
    FOREIGN KEY(oid) REFERENCES order(oid)
);
```

## ER Diagram
Below is a diagram representing the database, arrows signify many-one relationships, bold arrows represent participation constraints and bold rectangles represent weak entities.

<center>
<div>
<img src="images/diagram.png">
</div>
</center>

## Loading Data
Having created created the database on our server using mostly the code above, we load it with dummy data on which we can experiment and perform queries. We do this with the below SQL code.

```sql
INSERT INTO Supplier (SID, SName, Contact) VALUES
 (01, 'Apple', 'peoplesupplies@apple.com'),
 (02, 'Corsair', 'corsairproducts@corsair.com'),
 (03, 'HyperX', 'hyperxservices@hx.com'),
 (04, 'Razer', 'customer@razer.com'),
 (05, 'Samsung', 'samsungproducts@ss.com'),
 (06, 'Logitech', 'info@logitech.com'),
 (07, 'SteelSeries', 'contact@steelseries.com')
;

INSERT INTO Product (PID, Archived, PName, Category, FullPrice, Discount, Stock) VALUES
(01, FALSE, 'Apple Airpods', 'Headphones', 200, 0, 15),
(02, FALSE, 'Corsair HS80', 'Headphones', 250, 10, 10),
(03, TRUE, 'HyperX Alloy Core', 'Keyboards', 130, 0, 20),
(04, FALSE, 'Razer DeathAdder', 'Mice', 90, 0, 30),
(05, TRUE, 'Samsung Galaxy', 'Phones', 1000, 0, 20),
(06, TRUE, 'Apple Magic Keyboard', 'Keyboards', 300, 0, 25),
(07, TRUE, 'Razer Viper Ultimate', 'Mice', 200, 0, 15),
(08, TRUE, 'Apple iPhone 14', 'Phones', 1300, 0, 20),
(09, FALSE, 'Logitech G Pro X Superlight', 'Mice', 150, 0, 25),
(10, FALSE, 'SteelSeries Arctis 7', 'Headphones', 150, 70, 20)
;

INSERT INTO SuppliesProduct (PID, SID, Price) VALUES
(01, 01, 200),
(02, 02, 250),
(03, 03, 130),
(04, 04, 90),
(05, 05, 1000),
(06, 01, 300),
(07, 04, 200),
(08, 01, 1300),
(09, 06, 80),
(10, 07, 150)
;

INSERT INTO Customer (CID, FirstName, LastName, Email, Password, Language, Address) VALUES
(101, 'Elon', 'Musk', 'elon.musk101@gmail.com', 'givemejob', 'English', '3630 Rue University'),
(102, 'Walt', 'Disney', 'walt.disknee@gmail.com', 'givemejob2', 'French', '3631 Rue University'),
(103, 'Steve', 'Jobs', 'steve.jobs103@gmail.com', 'password123', 'English', '1 Infinite Loop'),
(104, 'Marie', 'Curie', 'marie.curie104@gmail.com', 'science123', 'Polish', '11 Rue Marie Curie'),
(105, 'Ada', 'Lovelace', 'ada.lovelace105@gmail.com', 'programming', 'English', '12 St. James Square'),
(106, 'Alan', 'Turing', 'alan.turing106@gmail.com', 'enigma123', 'English', '350 Rue Corot'),
(107, 'Grace', 'Hopper', 'grace.hopper107@gmail.com', 'cobol', 'English', '1300 Boul. Robert-Bourassa')
;

INSERT INTO Reviews (CID, PID, RComment, Rating, DatePosted) VALUES
(101, 01, 'I love this product', 10, '2023-12-12'),
(102, 02, 'Très bon produit!', 9, '2024-01-05'),
(103, 03, 'I am impressed with the quality.', 8, '2024-02-10'),
(104, 04, 'Świetny produkt, polecam!', 10, '2024-02-15'),
(105, 05, 'Great service and fast delivery!', 9, '2024-02-20'),
(105, 04, 'Product came three months late and doesn't work', 2, '2024-02-15'),
(106, 09, 'Great mouse for gaming!', 9, '2024-02-22'),
(107, 10, 'Excellent sound quality', 8, '2024-02-23')
;

INSERT INTO PaymentMethod (CID, CardNumber, PType, CardExpiryDate, SecurityCode) VALUES
(101, 260906761, 'Visa', '2025-07-24', 691),
(102, 478956341, 'Visa', '2026-03-18', 783),
(103, 789012345, 'Mastercard', '2025-11-30', 456),
(104, 123456789, 'Visa', '2024-09-15', 321),
(105, 987654321, 'Mastercard', '2026-05-22', 589),
(106, 111122223, 'American Express', '2025-12-01', 123),
(107, 555566667, 'American Express', '2026-05-01', 456)
;

INSERT INTO Order (OID, CID) VALUES
(5431, 101),
(5432, 102),
(5433, 103),
(5434, 104),
(5435, 105),
(5436, 101),
(5437, 106),
(5438, 107)
;

INSERT INTO OrderItem (OID, INumber, PID, Quantity) VALUES
(5431, 1, 01, 2),
(5431, 2, 02, 1),
(5433, 1, 03, 1),
(5433, 2, 04, 4),
(5433, 3, 05, 2),
(5436, 1, 08, 1),
(5437, 1, 09, 1),
(5438, 1, 10, 1)
;

INSERT INTO Invoice (IID, OID, DatePosted, Amount, PaidFlag) VALUES
(901, 5431, '2023-12-11', 400, TRUE),
(902, 5432, '2024-01-03', 250, TRUE),
(903, 5433, '2024-02-10', 130, TRUE),
(904, 5434, '2024-02-14', 360, TRUE),
(905, 5435, '2024-02-19', 1000, TRUE),
(906, 5436, '2024-02-20', 1300, TRUE),
(907, 5437, '2024-02-25', 80, TRUE),
(908, 5438, '2024-02-26', 150, TRUE)
;

INSERT INTO Payment (IID, CID, CardNumber, TransactionDate, TotalAmount) VALUES
(901, 101, 260906761, '2023-12-11', 430),
(902, 102, 478956341, '2024-01-03', 270),
(903, 103, 789012345, '2024-02-10', 145),
(904, 104, 123456789, '2024-02-14', 370),
(905, 105, 987654321, '2024-02-19', 1030),
(906, 101, 260906761, '2024-02-20', 1300),
(907, 106, 111122223, '2024-02-25', 80),
(908, 107, 555566667, '2024-02-26', 150)
;

INSERT INTO Shipment (TNumber, IID, Address, DeliveredFlag, Carrier, Fee) VALUES
(99901, 901, '3630 Rue University', TRUE, 'UPS', 20),
(99902, 902, '3631 Rue University', TRUE, 'UPS', 20),
(99903, 903, '1 Infinite Loop', TRUE, 'FedEx', 15),
(99904, 904, '11 Rue Marie Curie', FALSE, 'UPS', 10),
(99905, 905, '12 St. James Square', TRUE, 'Canada Post', 30),
(99906, 907, '350 Rue Corot', TRUE, 'UPS', 15),
(99907, 908, '1300 Boul. Robert-Bourassa', TRUE, 'UPS', 20)
;

INSERT INTO Staff (StaffID, FirstName, LastName, Position, Department, Supervisor) VALUES
(88801, 'Gaetan', 'Jean-Pierre', 'Product Manager', 'Operations Management', 88802),
(88802, 'Cosmin', 'Cojocaru', 'Associate Product Manager','Operations Management', 88803),
(88803, 'Christian Julian', 'Pili', 'Lead Product Manager', 'Operations Management', 88806),
(88804, 'Jacob', 'Weldon', 'Unpaid Intern', 'Sales', 88801),
(88805, 'Jacob', 'Weldone', 'Unpaid Intern', 'Sales', 88801),
(88806, 'Bob', 'The II', 'CEO', 'All', NULL)
;

INSERT INTO FillsOrder (StaffID, OID) VALUES
(88801, 5431),
(88801, 5432),
(88802, 5433),
(88803, 5434),
(88804, 5435),
(88805, 5437),
(88805, 5438)
;
```
<br>

## SQL Queries

To demonstrate the power and utility of this online store database, we ran several SQL queries to retrieve meaningful data. Below are five example queries that illustrate various functionalities of the database.

### Total Revenue by Product Category
This query calculates the total revenue generated for each product category. It sums the invoice amounts for each product category and returns the total revenue.

```sql
SELECT p.category, SUM(i.amount) AS total_revenue
FROM product p
JOIN orderItem oi ON p.pid = oi.pid
JOIN "order" o ON oi.oid = o.oid
JOIN invoice i ON o.oid = i.oid
GROUP BY p.category;
```
With output:
```
+------------------+---------------+
| category         | total_revenue |
+------------------+---------------+
| Headphones       | 2500          |
| Mice             | 900           |
| Phones           | 2300          |
+------------------+---------------+
```

### Total Revenue by Supplier
This query groups the total revenue by suppliers. It sums the invoice amounts for products provided by each supplier and returns the supplier name and total revenue.

```sql
SELECT s.sid, s.sname, COALESCE(SUM(i.amount), 0) AS total_revenue
FROM supplier s
LEFT JOIN suppliesProduct sp ON s.sid = sp.sid
LEFT JOIN orderItem oi ON sp.pid = oi.pid
LEFT JOIN "order" o ON oi.oid = o.oid
LEFT JOIN invoice i ON o.oid = i.oid
GROUP BY s.sid, s.sname;
```
With output:
```
+-----+-----------------+---------------+
| sid | sname           | total_revenue |
+-----+-----------------+---------------+
|  01 | Apple           | 1600          |
|  02 | Corsair         | 250           |
|  03 | HyperX          | 130           |
+-----+-----------------+---------------+
```

### Top 3 Customers by Total Spending
This query finds the top 3 customers by summing the total amount they spent.

```sql
SELECT c.firstName, c.lastName, SUM(p.totalAmount) AS total_spent
FROM customer c
JOIN payment p ON c.cid = p.cid
GROUP BY c.firstName, c.lastName
ORDER BY total_spent DESC
LIMIT 3;
```
With output:
```
+------------+------------+-------------+
| firstName  | lastName   | total_spent |
+------------+------------+-------------+
| Elon       | Musk       | 2000        |
| Ada        | Lovelace   | 1500        |
| Steve      | Jobs       | 1300        |
+------------+------------+-------------+
```

### Average Product Rating and Total Reviews
This query finds the average rating and total reviews for each product.

```sql
SELECT p.pname, AVG(r.rating) AS avg_rating, COUNT(r.rcomment) AS total_reviews
FROM product p
LEFT JOIN reviews r ON p.pid = r.pid
GROUP BY p.pname;
```
with output:
```
+---------------------+-------------+--------------+
| pname               | avg_rating  | total_reviews|
+---------------------+-------------+--------------+
| Apple Airpods       | 9.0         | 3            |
| Logitech G Pro X    | 9.0         | 2            |
| Samsung Galaxy      | 8.0         | 1            |
+---------------------+-------------+--------------+
```

###  Customers Who Purchased Phones
This query retrieves the names and emails of customers who have purchased phones.

```sql
SELECT DISTINCT c.firstName, c.lastName, c.email
FROM customer c
JOIN "order" o ON c.cid = o.cid
JOIN orderItem oi ON o.oid = oi.oid
JOIN product p ON oi.pid = p.pid
WHERE p.category = 'Phones';
```
With output:
```
+------------+------------+---------------------------+
| firstName  | lastName   | email                     |
+------------+------------+---------------------------+
| Elon       | Musk       | elon.musk101@gmail.com    |
| Steve      | Jobs       | steve.jobs103@gmail.com   |
+------------+------------+---------------------------+
```

<br>

## SQL Modifications
We implemented database modifications to simulate real-world scenarios in the online store.

### Simulating a Customer Placing an Order
In this modification, a customer places an order for two Apple AirPods and one Apple iPhone 14. The stock levels are updated, and the total amount is calculated and reflected in an invoice.

```sql
-- Insert a new order for customer with ID 101
INSERT INTO "order" (oid, cid)
SELECT MAX(oid) + 1, 101 FROM "order";

-- Insert order items for the new order
INSERT INTO orderItem (oid, inumber, pid, quantity)
SELECT MAX(o.oid), 1, p.pid, 2
FROM product p, "order" o
WHERE p.pname = 'Apple Airpods';

INSERT INTO orderItem (oid, inumber, pid, quantity)
SELECT MAX(o.oid), 2, p.pid, 1
FROM product p, "order" o
WHERE p.pname = 'Apple iPhone 14';

-- Insert a new invoice
INSERT INTO invoice (iid, oid, datePosted, amount, paidFlag)
VALUES ((SELECT MAX(iid) + 1 FROM invoice), (SELECT MAX(oid) FROM "order"), '2024-02-22', NULL, FALSE);

-- Update the invoice with the total amount
UPDATE invoice
SET amount = (SELECT SUM((p.fullPrice - p.discount) * oi.quantity)
              FROM product p
              JOIN orderItem oi ON p.pid = oi.pid
              WHERE oi.oid = (SELECT MAX(oid) FROM "order"))
WHERE iid = (SELECT MAX(iid) FROM invoice);

-- Update stock levels for the products in the order
UPDATE product SET stock = stock - 2 WHERE pname = 'Apple Airpods';
UPDATE product SET stock = stock - 1 WHERE pname = 'Apple iPhone 14';

```

### Simulating a Sale on Headphones
In this modification, a sale is applied to all products in the "Headphones" category by increasing their discount by 20%, with a cap of 70%.

```sql
UPDATE product
SET discount = discount + 20
WHERE category = 'Headphones' AND discount < 70;
```
<br>

## Views
To simplify querying and enhance performance, we created two views that aggregate data across multiple tables.

### Customer Information View
This view lists basic customer details, including their unique customer ID, first and last names, and email addresses.

```sql
CREATE VIEW CustomersView AS 
SELECT cid, firstName, lastName, email 
FROM customer;
```

### Product Sales View
This view provides a summary of total sales for each product, including the product name, category, and the total quantity sold.

```sql
CREATE VIEW ProductSalesView AS 
SELECT p.pname, p.category, SUM(oi.quantity) AS total_sold 
FROM product p 
JOIN orderItem oi ON p.pid = oi.pid 
GROUP BY p.pname, p.category;
```

Both views make data retrieval more efficient and allow for easier analysis of customer and product data. They also provide a simplified interface for frequently accessed information.

<br>

## Application Program
The following is a Java application program that interacts with the DB2 database to perform several key functions such as adding suppliers, looking up orders, and viewing product reviews. The program is designed to be used by store employees and includes menu-driven functionality. Below is the code and description of each section.

```python
import java.sql.*;
import java.util.Locale;
import java.util.Scanner;
import java.util.Map;
import java.util.HashMap;

class storeJDBC {
    public static void main(String[] args) throws SQLException {
        String tableName = "";
        int sqlCode = 0;
        String sqlState = "00000";

        if (args.length > 0)
            tableName += args[0];
        else
            tableName += "exampletbl";

        try {
            DriverManager.registerDriver(new com.ibm.db2.jcc.DB2Driver());
        } catch (Exception cnfe) {
            System.out.println("Class not found");
        }

        String url = "jdbc:db2://winter2024-comp421.cs.mcgill.ca:50000/comp421";
        String your_userid = null;
        String your_password = null;

        if (your_userid == null && (your_userid = System.getenv("SOCSUSER")) == null) {
            System.err.println("Error!! do not have a password to connect to the database!");
            System.exit(1);
        }
        if (your_password == null && (your_password = System.getenv("SOCSPASSWD")) == null) {
            System.err.println("Error!! do not have a password to connect to the database!");
            System.exit(1);
        }

        Connection con = DriverManager.getConnection(url, your_userid, your_password);
        Statement statement = con.createStatement();
        Scanner scanner = new Scanner(System.in);

        System.out.println("Order System Main Menu");
        System.out.println("\t1. Add Supplier");
        System.out.println("\t2. Add Order");
        System.out.println("\t3. Look Up Order");
        System.out.println("\t4. Look Up Employees");
        System.out.println("\t5. Product Reviews");
        System.out.println("\t6. Quit");

        boolean quit = false;
        while (!quit) {
            System.out.println("Please Enter Your Option: ");
            String choice = scanner.nextLine();

            System.out.println("You selected " + choice);
            switch (choice.toLowerCase(Locale.ROOT)) {
                case "1":
                case "add supplier":
                    System.out.println("What is the supplier ID?");
                    String sid = scanner.nextLine();
                    System.out.println("What is the supplier name?");
                    String sname = scanner.nextLine();
                    System.out.println("What is the supplier contact information?");
                    String scontact = scanner.nextLine();
                    try {
                        String addSupplier = "INSERT INTO Supplier VALUES (" + sid + ", '" + sname + "', '" + scontact + "');";
                        statement.executeUpdate(addSupplier);
                        System.out.println("DONE");
                    } catch (SQLException e) {
                        System.out.println("Code: " + e.getErrorCode() + "  sqlState: " + e.getSQLState());
                        System.out.println(e);
                    }
                    break;

                case "2":
                case "add order":
                    System.out.println("What is the order ID you want to add?");
                    String orderID = scanner.nextLine();
                    System.out.println("What is the customer ID associated with the order?");
                    String customer = scanner.nextLine();
                    try {
                        String addOrder = "INSERT INTO Order VALUES (" + orderID + ", " + customer + ");";
                        statement.executeUpdate(addOrder);
                        System.out.println("DONE");
                    } catch (SQLException e) {
                        System.out.println("Code: " + e.getErrorCode() + "  sqlState: " + e.getSQLState());
                        System.out.println(e);
                    }
                    break;

                case "3":
                case "look up order":
                    System.out.println("What is the order ID you are looking for?");
                    String oid = scanner.nextLine();
                    try {
                        String orderLook = "SELECT * FROM order WHERE oid = " + oid + ";";
                        java.sql.ResultSet rs = statement.executeQuery(orderLook);
                        while (rs.next()) {
                            System.out.println("Order ID: " + rs.getString(1));
                            System.out.println("Customer ID: " + rs.getInt(2));
                        }
                        System.out.println("DONE");
                    } catch (SQLException e) {
                        System.out.println("Code: " + e.getErrorCode() + "  sqlState: " + e.getSQLState());
                        System.out.println(e);
                    }
                    break;

                case "4":
                case "look up employees":
                    try {
                        String query = "SELECT DISTINCT position FROM staff;";
                        java.sql.ResultSet positions = statement.executeQuery(query);
                        System.out.println("Positions:");
                        while (positions.next()) {
                            System.out.println("\t" + positions.getString(1));
                        }
                        System.out.println("DONE");
                    } catch (SQLException e) {
                        System.out.println("Code: " + e.getErrorCode() + "  sqlState: " + e.getSQLState());
                        System.out.println(e);
                    }
                    break;

                case "5":
                case "product reviews":
                    System.out.println("What is the product ID?");
                    String pid = scanner.nextLine();
                    try {
                        String reviewQuery = "SELECT rcomment, rating FROM reviews WHERE pid = " + pid + ";";
                        java.sql.ResultSet rs = statement.executeQuery(reviewQuery);
                        while (rs.next()) {
                            System.out.println("Comment: " + rs.getString(1));
                            System.out.println("Rating: " + rs.getInt(2));
                        }
                        System.out.println("DONE");
                    } catch (SQLException e) {
                        System.out.println("Code: " + e.getErrorCode() + "  sqlState: " + e.getSQLState());
                        System.out.println(e);
                    }
                    break;

                case "6":
                case "quit":
                    System.out.println("Bye! Have a great day!");
                    statement.close();
                    con.close();
                    quit = true;
                    break;

                default:
                    System.out.println("Invalid Selection");
                    break;
            }
        }
        scanner.close();
    }
}

```

Upon running the Java program, the user is presented with a menu of options to interact with the online store's database:

```
Order System Main Menu:
    1. Add Supplier
    2. Add Order
    3. Look Up Order
    4. Look Up Employees
    5. Product Reviews
    6. Quit
Please Enter Your Option:

```
Below are a couple of example sample interactions one could have with the program:

```
Please Enter Your Option:
1
You selected 1
What is the supplier ID?
1
What is the supplier name?
Apple
What is the supplier contact information?
peoplesupplies@apple.com
DONE
```
```
Please Enter Your Option:
2
You selected 2
What is the order ID you want to add?
5432
What is the customer ID associated with the order?
102
DONE
```
```
Please Enter Your Option:
3
You selected 3
What is the order ID you are looking for?
5432
Order ID: 5432
Customer ID: 102
Item Number: 1
Product ID: 02
Quantity: 1
DONE
```
```
Please Enter Your Option:
6
You selected 6
Bye! Have a great day!
```

<br>

## Visualizations

In this section, we will present two visualizations based on the online store's data. These visualizations provide insights into the performance of suppliers and the relationship between product ratings and sales volumes. Each visualization is generated from SQL queries and further visualized using Python scripts for clarity and analysis.

### Gross Revenue by Supplier

Our first visualization showcases the gross revenue generated from each supplier. This visualization allows the store to assess which suppliers contribute the most to the store's overall profitability. Suppliers with higher gross revenues may be prioritized for future orders, whereas those with lower revenues might require further evaluation.

The gross revenue for each supplier is calculated by considering the quantity of products sold, the selling price, the product's discount, and the cost of obtaining the product from the supplier. The SQL query below was used to extract the necessary data, and the results were exported to a CSV file for visualization.

```sql
EXPORT TO vis1.csv OF DEL MODIFIED BY NOCHARDEL
SELECT s.sname,
       SUM(o.quantity * (p.fullPrice * (1 - p.discount / 100) - sp.price)) AS GrossRevenue
FROM suppliesProduct sp,
     product p,
     supplier s,
     orderItem o
WHERE sp.sid = s.sid
  AND sp.pid = p.pid
  AND p.pid = o.pid
GROUP BY s.sname;
```
The bar chart below visualizes the data, illustrating the gross revenue contributed by each supplier.
<center> <img src="images/vis1.png" alt="Gross Revenue by Supplier" width="70%"> </center>


### Product Rating vs. Sales Volume

The second visualization explores the relationship between the average product rating provided by reviewers and the corresponding sales volume. The goal is to understand whether higher-rated products tend to sell better. This analysis helps the store decide which products to promote based on customer feedback and sales performance.

The SQL query below retrieves the total units sold, average rating, product name, and category for each product. This data is then exported to a CSV file for further analysis.

```sql
EXPORT TO vis2.csv OF DEL MODIFIED BY NOCHARDEL
SELECT SUM(o.quantity) AS volume,
       AVG(r.rating) AS avgrating,
       p.pname,
       p.category
FROM orderItem o,
     reviews r,
     product p
WHERE o.pid = p.pid
  AND r.pid = p.pid
GROUP BY p.pname, p.category;
```

The scatter plot below illustrates the relationship between product ratings and sales volume, with each point representing a product. The points are colored by category, and a least-squares regression line has been added to highlight the trend.

<center> <img src="images/vis2.png" alt="Product Rating vs. Sales Volume" width="75%"> </center>

These visualizations provide valuable insights into both the store's suppliers and the relationship between customer satisfaction and product performance. The ability to visualize such data can assist in making more informed business decisions.

<br>

## Conclusion

In this article, we explored the design and implementation of a comprehensive online store database using DB2, tailored for managing a variety of real-world business operations. Through this system, we efficiently handled essential tasks such as product management, customer interactions, order processing, and supplier tracking. The carefully constructed schema captures the complex relationships between different entities, ensuring data integrity and scalability as the business grows.

We also explored various SQL queries, modifications, and views that allow for efficient data retrieval and operations within the system. The application program written in Java further demonstrated how the store's employees can interact with the database for day-to-day operations such as adding suppliers, managing orders, and viewing product reviews.

Additionally, we showcased key visualizations that offer valuable insights into business performance. By examining gross revenue by supplier and the relationship between product ratings and sales volume, the store can make more informed decisions regarding product promotions, supplier relations, and inventory management.

This project demonstrates the robustness and flexibility of SQL-based databases in managing real-world business needs. With the foundation laid by this database, future expansions and improvements, such as integrating machine learning models or advanced analytics, can further enhance the store's performance and customer satisfaction.

<br>

## Acknowledgments

This project is based on an assignment from a database class (COMP 421) at McGill university in spring of 2024. That assignment was a group project and contributed to by my peers Gaetan Jean-Pierre, Christian Julian Pili, and Jacob Weldon. This article is however entirely my own.