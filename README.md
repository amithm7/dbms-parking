# Parking Management System

A simple application to manage parking spaces

## Requirements

- [NodeJS](https://nodejs.org)
- MySQL

## Installation

```bash
git clone https://github.com/amithm7/dbms-parking.git
cd dbms-parking
npm install
```
Create Database:
> Instructions shown here for mysql linux version
- User: 'parkingAPI'
	- Login as root: `sudo mysql -u root` and create user: `CREATE USER 'parkingAPI'@'localhost' IDENTIFIED BY 'password';`
	- Grant permissions to user on DB 'parkingMS': `GRANT ALL PRIVILEGES ON parkingMS . * TO 'parkingAPI'@'localhost';`
- Database: 'parkingMS'
	- Login as 'parkingAPI': `mysql -u parkingAPI -p` and create DB 'parkingMS': `create database parkingMS;`
	- Use DB 'parkingMS': `use parkingMS;`
- Relational Table Creation:
	```sql
	CREATE TABLE CUSTOMER (
		FIRST_NAME VARCHAR (20),
		LAST_NAME VARCHAR (20),
		PHONE BIGINT PRIMARY KEY
	);

	CREATE TABLE VEHICLE (
		REGISTRATION VARCHAR (10) PRIMARY KEY,
		BRAND VARCHAR (20),
		MODEL VARCHAR (20),
		COLOR VARCHAR (20),
		TYPE CHAR CHECK (TYPE IN ('2', '4')),
		CUS_PHONE BIGINT,
		FOREIGN KEY (CUS_PHONE) REFERENCES CUSTOMER (PHONE)
	);

	CREATE TABLE EMPLOYEE (
		SSN INT PRIMARY KEY,
		FIRST_NAME VARCHAR (20),
		LAST_NAME VARCHAR (20),
		SEX CHAR CHECK (SEX IN ('M', 'F')),
		PHONE BIGINT
	);

	CREATE TABLE PARKING_SPACE (
		AREA VARCHAR (20),
		SLOT_NUMBER INT,
		PRIMARY KEY (AREA, SLOT_NUMBER),
		SLOT_STATUS VARCHAR (2) CHECK (SLOT_STATUS IN ('AV', 'OC')),
		ADMIN_SSN INT,
		FOREIGN KEY (ADMIN_SSN) REFERENCES EMPLOYEE (SSN)
	);

	CREATE TABLE TOKEN (
		NUMBER BIGINT PRIMARY KEY AUTO_INCREMENT,
		ENTRY_TIME DATETIME,
		EXIT_TIME DATETIME,
		BILL_AMOUNT INT,
		VEHICLE_REG VARCHAR (10),
		FOREIGN KEY (VEHICLE_REG) REFERENCES VEHICLE (REGISTRATION),
		PARKING_AREA VARCHAR (20),
		PARKING_SLOT INT,
		FOREIGN KEY (PARKING_AREA, PARKING_SLOT) REFERENCES PARKING_SPACE (AREA, SLOT_NUMBER)
	);
	```
- Create Trigger for bill calculation on vehicle exit: 20 + (5 per hr)
	```sql
	DELIMITER $$
	CREATE OR REPLACE TRIGGER `calculate_bill` BEFORE UPDATE ON `TOKEN` FOR EACH ROW
	BEGIN
	IF NEW.EXIT_TIME IS NOT NULL THEN SET NEW.BILL_AMOUNT = 20 + (TIMESTAMPDIFF(MINUTE, NEW.ENTRY_TIME, NEW.EXIT_TIME) / 60) * 5;
	END IF;
	END;
	$$
	```


## Run Application

```bash
node server.js
```
