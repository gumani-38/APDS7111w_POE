
use apds7111w_poe;

-- create table Customers(
-- customerId int auto_increment primary key ,
-- firstName varchar(50) not null,
-- lastName varchar(50) not null,
-- idNumber varchar(50) not null,
-- accountNumber varchar(50) not null,
-- username varchar(50) unique not null,
-- password  varchar(200) not null
-- );

-- CREATE TABLE Transactions(
--  transactionId INT AUTO_INCREMENT PRIMARY KEY,
--  customerId INT NOT NULL,
--  amount DECIMAL(15,2) NOT NULL,
--  currency VARCHAR(3) NOT NULL,
--  provider VARCHAR(50) NOT NULL DEFAULT 'SWIFT',
--  payeeName VARCHAR(100) NOT NULL,
--  payeeAccountNumber VARCHAR(50) NOT NULL,
--  swiftCode VARCHAR(11) NOT NULL,
--  status VARCHAR(20) NOT NULL DEFAULT 'pending',
--  uetr  VARCHAR(36)  NULL UNIQUE,
--  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--  verifiedAt TIMESTAMP NULL,
--  verifiedBy INT NULL,
--  FOREIGN KEY (customerId) REFERENCES Customers(customerId)
--);

-- CREATE TABLE Employees(
--  employeeId INT AUTO_INCREMENT PRIMARY KEY,
--  fullName VARCHAR(100) NOT NULL,
--  username VARCHAR(50) UNIQUE NOT NULL,
--  password VARCHAR(200) NOT NULL,
--  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--);


-- // employee dummpy data
--  const data = [
--       {
--         fullName: "Thato Ramokgopa",
--         username: "thatoramokgopa@gmail.com",
--         password: "Thato@12Ramo*!",
--       },
--       {
--         fullName: "Mpho Mokoena",
--         username: "mphomokoena@gmail.com",
--         password: "Mpho@12Moko*!",
--       },
--       {
--         fullName: "Sipho Dlamini",
--         username: "siphodlamini@gmail.com",
--         password: "Sipho@12Dlam*!",
--       },
--     ];
-- show tables;

-- select *
-- from customers