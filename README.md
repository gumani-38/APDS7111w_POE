CLONE the project
Open the terminal within the project
Run npm install first before starting the server

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [WAMP](https://www.wampserver.com/en/) or any local MySQL server
- [Git](https://git-scm.com/) (Git Bash needed for SSL cert generation)

### 1. Clone the repository

```bash
git clone https://github.com/gumani-38/APDS7111w_POE.git
cd APDS7111w_POE
git checkout back-end
```

### 2. Install dependencies

```bash
cd server
npm install
```

### 3. Database setup

1. Start WAMP and open phpMyAdmin (`http://localhost/phpmyadmin`)
2. Set the root password to `rootuser` (matches `databaseConnection.js`)
3. Create a database called `apds7111w_poe`
4. Run the SQL inside `server/DB_Script.sql` to create the `Customers`, `Transactions`, and `Employees` tables
5. Manually seed at least one employee account (it is gitignored as it contains plaintext passwords. Contact group member for the seeding script).

### 4. Environment variables

Create a file called `.env` inside the `server/` folder:
JWT_SECRET=your_long_random_secret_here
PORT=3000

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
node index.js
```

The server starts at `https://localhost:3000`. Browsers will display a security warning for the self-signed certificate — this is expected. Click **Advanced → Proceed** to continue.
