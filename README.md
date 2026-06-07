CLONE the project
Open the terminal within the project
Run npm install first before starting the server

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- TiDB cloud or any local MySQL server
- [Git](https://git-scm.com/) (Git Bash needed for SSL cert generation)

### 1. Clone the repository

```bash
git clone https://github.com/gumani-38/APDS7111w_POE.git
cd APDS7111w_POE
git checkout back-end
```

### 2. Install dependencies

```bash
cd server && cd frontend
npm install
```

### 3. Database setup

1. Start WAMP and open phpMyAdmin (`http://localhost/phpmyadmin`)
2. Set the root password to `rootuser` (matches `databaseConnection.js`)
3. Create a database called `apds7111w_poe`
4. Run the SQL inside `server/DB_Script.sql` to create the `Customers`, `Transactions`, and `Employees` tables
5. Manually seed at least one employee account (it is gitignored as it contains plaintext passwords. Contact group member for the seeding script).
### 3. TiDB cloud Database setup
1. create a TiDB account
2. create a project or cluster instance ensure you select the free tier
3. click on connect that will show the connection string that you can paste in the server folder in config  folder db connection
4. for database name in TiDB cloud select test and ensure in you server config file is test
### 4. Environment variables

Create a file called `.env` inside the `server/` folder:
JWT_SECRET=your_long_random_secret_here
DB_Password=your_TiDB-cloud_password 
CLIENT_URL=your_frontend-url // for cors 
PORT=3500
### 4. Environment in frontend variables
Create a file called `.env` inside the `frontend/` folder:
REACT_APP_BACKEND_URL=your_server_url
### 5. Generate SSL certificate

The server runs on HTTPS, so you need a self-signed certificate. From the `server/` folder, in **Git Bash** (not PowerShell):

```bash
mkdir keys
cd keys
openssl req -nodes -new -x509 -keyout privatekey.pem -out certificate.pem -days 365
```

Press Enter through all the prompts.

### 6. Run the server

```bash
node index.js or nodemon index.js if installed
```

## Employee Dummy Built Credentials
const data = [
      {
        fullName: "Thato Ramokgopa",
        username: "thatoramokgopa@gmail.com",
        password: "Thato@12Ramo*!",
      },
      {
        fullName: "Mpho Mokoena",
        username: "mphomokoena@gmail.com",
        password: "Mpho@12Moko*!",
      },
      {
        fullName: "Sipho Dlamini",
        username: "siphodlamini@gmail.com",
        password: "Sipho@12Dlam*!",
      },
    ];

### 6. Run the frontend
```bash
npm start
```
The server starts at `https://localhost:3500`. Browsers will display a security warning for the self-signed certificate — this is expected. Click **Advanced → Proceed** to continue.


## SONARQUBE & CIRCLE CI DevSecOps

<img width="1919" height="895" alt="image" src="https://github.com/user-attachments/assets/95ff08f9-22c7-4292-9d60-f9f69fbbe444" />

<img width="1913" height="884" alt="image" src="https://github.com/user-attachments/assets/9f34faff-d9af-4dc5-b0b4-8246930aaf5c" />

<img width="1919" height="878" alt="image" src="https://github.com/user-attachments/assets/8972a737-e7f8-41e4-b06d-6045b37e94f4" />

<img width="1916" height="874" alt="image" src="https://github.com/user-attachments/assets/7a7be031-a433-492d-9ff6-60b0fc58ee09" />

<img width="1919" height="882" alt="image" src="https://github.com/user-attachments/assets/9861a267-92b4-4f41-bc6e-0ad17353cf2c" />

<img width="1916" height="864" alt="image" src="https://github.com/user-attachments/assets/89fb2d07-45e8-42d6-a6c7-f4cc10d37a89" />

<img width="1914" height="865" alt="image" src="https://github.com/user-attachments/assets/308da203-3885-41f9-86d4-9da0a6e8fbb6" />







