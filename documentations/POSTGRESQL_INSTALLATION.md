# PostgreSQL Installation & Setup Guide
## AdminEstate - Windows Installation

**Created**: 2025-11-09
**Target OS**: Windows 10/11
**Estimated Time**: 30-45 minutes

---

## Prerequisites

- Windows 10 or 11
- Administrator access
- 500MB free disk space
- Internet connection

---

## Step 1: Download PostgreSQL

### Option A: Official PostgreSQL Installer (Recommended)

1. **Visit PostgreSQL Download Page**
   ```
   https://www.postgresql.org/download/windows/
   ```

2. **Click "Download the installer"**
   - You'll be redirected to EnterpriseDB

3. **Download PostgreSQL 16.x**
   - Choose latest version (currently 16.1)
   - Select "Windows x86-64" installer
   - File size: ~270MB

### Option B: Using Chocolatey (Advanced)

If you have Chocolatey package manager installed:

```powershell
# Run PowerShell as Administrator
choco install postgresql
```

---

## Step 2: Install PostgreSQL

1. **Run the Installer**
   - Double-click the downloaded `.exe` file
   - Click "Yes" to User Account Control prompt

2. **Setup Wizard - Welcome Screen**
   - Click **Next**

3. **Installation Directory**
   - Default: `C:\Program Files\PostgreSQL\16`
   - Click **Next** (default is fine)

4. **Select Components**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (database management tool)
   - ✅ Stack Builder (optional)
   - ✅ Command Line Tools
   - Click **Next**

5. **Data Directory**
   - Default: `C:\Program Files\PostgreSQL\16\data`
   - Click **Next** (default is fine)

6. **Password**
   - **IMPORTANT**: Set password for `postgres` superuser
   - Example: `admin123` (choose something secure!)
   - **Write this down** - you'll need it later
   - Click **Next**

7. **Port**
   - Default: `5432`
   - Click **Next** (default is fine)

8. **Locale**
   - Default: `[Default locale]`
   - Click **Next**

9. **Summary**
   - Review settings
   - Click **Next** to begin installation

10. **Installation Progress**
    - Wait 3-5 minutes for installation to complete

11. **Completing Setup**
    - Uncheck "Launch Stack Builder at exit" (unless you need extensions)
    - Click **Finish**

---

## Step 3: Verify Installation

### Using Command Prompt

1. **Open Command Prompt** (Win + R → `cmd`)

2. **Check PostgreSQL Version**
   ```cmd
   psql --version
   ```

   **Expected Output:**
   ```
   psql (PostgreSQL) 16.1
   ```

   If command not found, add to PATH:
   - Path: `C:\Program Files\PostgreSQL\16\bin`
   - Add to System Environment Variables

3. **Connect to PostgreSQL**
   ```cmd
   psql -U postgres
   ```

   - Enter the password you set during installation
   - You should see:
     ```
     postgres=#
     ```

4. **Test Connection**
   ```sql
   SELECT version();
   ```

   You should see PostgreSQL version information.

5. **Exit psql**
   ```sql
   \q
   ```

---

## Step 4: Create AdminEstate Database

### Using psql Command Line

1. **Open Command Prompt**

2. **Connect as postgres user**
   ```cmd
   psql -U postgres
   ```

3. **Create Database**
   ```sql
   CREATE DATABASE adminestate;
   ```

   **Expected Output:**
   ```
   CREATE DATABASE
   ```

4. **Verify Database Created**
   ```sql
   \l
   ```

   You should see `adminestate` in the list.

5. **Connect to AdminEstate Database**
   ```sql
   \c adminestate
   ```

   **Expected Output:**
   ```
   You are now connected to database "adminestate" as user "postgres".
   ```

6. **Exit**
   ```sql
   \q
   ```

### Using pgAdmin 4 (GUI Alternative)

1. **Open pgAdmin 4**
   - Start Menu → PostgreSQL 16 → pgAdmin 4

2. **Set Master Password**
   - First time: Create a master password
   - This protects stored PostgreSQL passwords

3. **Connect to Server**
   - Left panel: Servers → PostgreSQL 16
   - Enter postgres password when prompted

4. **Create Database**
   - Right-click "Databases"
   - Select "Create" → "Database..."
   - Database name: `adminestate`
   - Click "Save"

5. **Verify**
   - You should see `adminestate` under Databases

---

## Step 5: Run AdminEstate Schema

### Using Command Line (Recommended)

1. **Navigate to Backend Directory**
   ```cmd
   cd C:\Users\YOUR_USERNAME\adminEstate\backend-python
   ```

2. **Run Schema Script**
   ```cmd
   psql -U postgres -d adminestate -f schema.sql
   ```

   **Expected Output:**
   ```
   DROP TABLE
   DROP TABLE
   ...
   CREATE TABLE
   CREATE INDEX
   ...
   NOTICE: AdminEstate Database Schema Created Successfully
   NOTICE: Tables Created: 7
   NOTICE: Indexes Created: 35+
   ```

3. **Verify Tables Created**
   ```cmd
   psql -U postgres -d adminestate
   ```

   ```sql
   \dt
   ```

   **Expected Output:**
   ```
   List of relations
   Schema |     Name      | Type  |  Owner
   -------+---------------+-------+----------
   public | applications  | table | postgres
   public | documents     | table | postgres
   public | messages      | table | postgres
   public | properties    | table | postgres
   public | tenants       | table | postgres
   public | transactions  | table | postgres
   public | work_orders   | table | postgres
   ```

4. **Exit**
   ```sql
   \q
   ```

### Using pgAdmin 4 (GUI Alternative)

1. **Open pgAdmin 4**
2. **Connect to adminestate database**
3. **Tools → Query Tool**
4. **Open schema.sql**
   - File → Open
   - Navigate to: `backend-python\schema.sql`
5. **Execute**
   - Click ⚡ (Execute) button or press F5
6. **Check Output**
   - Should see "Query returned successfully" messages

---

## Step 6: Install Python PostgreSQL Driver

1. **Open Command Prompt**

2. **Navigate to Backend Directory**
   ```cmd
   cd C:\Users\YOUR_USERNAME\adminEstate\backend-python
   ```

3. **Install psycopg2**
   ```cmd
   pip install psycopg2-binary
   ```

   **Expected Output:**
   ```
   Collecting psycopg2-binary
   ...
   Successfully installed psycopg2-binary-2.9.9
   ```

4. **Verify Installation**
   ```cmd
   python -c "import psycopg2; print('psycopg2 version:', psycopg2.__version__)"
   ```

   **Expected Output:**
   ```
   psycopg2 version: 2.9.9 (dt dec pq3 ext lo64)
   ```

---

## Step 7: Set Database Password (Environment Variable)

### Option A: Set Temporarily (This Session Only)

```cmd
set POSTGRES_PASSWORD=your_password_here
```

### Option B: Set Permanently (Recommended)

1. **Open System Properties**
   - Win + R → `sysdm.cpl`

2. **Advanced → Environment Variables**

3. **User Variables → New**
   - Variable name: `POSTGRES_PASSWORD`
   - Variable value: `your_postgres_password`
   - Click OK

4. **Restart Command Prompt**

5. **Verify**
   ```cmd
   echo %POSTGRES_PASSWORD%
   ```

### Option C: Create .env File (Most Secure)

1. **Create .env file in backend-python/**
   ```
   POSTGRES_PASSWORD=your_password_here
   DB_NAME=adminestate
   DB_USER=postgres
   DB_HOST=localhost
   DB_PORT=5432
   ```

2. **Install python-dotenv**
   ```cmd
   pip install python-dotenv
   ```

3. **Update db.py** (already configured to read from environment)

---

## Step 8: Run Data Migration

1. **Open Command Prompt**

2. **Navigate to Backend Directory**
   ```cmd
   cd C:\Users\YOUR_USERNAME\adminEstate\backend-python
   ```

3. **Run Migration Script**
   ```cmd
   python migrate_to_postgres.py
   ```

   **Expected Output:**
   ```
   ================================================================================
     AdminEstate - JSON to PostgreSQL Migration
   ================================================================================

   [Step 1] Reading data.json file...
   ✓ Loaded data.json successfully
      - Properties: 5
      - Tenants: 10
      - Work Orders: 1
      - Messages: 2
      - Applications: 1

   [Step 2] Creating backup of data.json...
   ✓ Backup created: C:\Users\...\src\data.json.backup

   [Step 3] Connecting to PostgreSQL...
   ✓ Connected to PostgreSQL successfully

   [Step 4] Migrating 5 properties...
   ✓ Migrated 5 properties

   [Step 5] Migrating 10 tenants...
   ✓ Migrated 10 tenants

   [Step 6] Migrating 1 work orders...
   ✓ Migrated 1 work orders

   [Step 7] Migrating 2 messages...
   ✓ Migrated 2 messages

   [Step 8] Migrating 1 applications...
   ✓ Migrated 1 applications

   [Step 9] Verifying migration...

   Migration Summary:
   --------------------------------------------------
   ✓ applications       | Expected:   1 | Actual:   1
   ✓ documents          | Expected:   0 | Actual:   0
   ✓ messages           | Expected:   2 | Actual:   2
   ✓ properties         | Expected:   5 | Actual:   5
   ✓ tenants            | Expected:  10 | Actual:  10
   ✓ transactions       | Expected:   0 | Actual:   0
   ✓ work_orders        | Expected:   1 | Actual:   1
   --------------------------------------------------
   ✓ All data migrated successfully!

   ================================================================================
     Migration Completed Successfully!
   ================================================================================

   Next Steps:
   1. Update backend-python/app_simple.py to use PostgreSQL
   2. Test API endpoints with both AdminEstate and Tenant Portal
   3. Keep data.json.backup for rollback if needed
   ```

4. **Verify Data in PostgreSQL**
   ```cmd
   psql -U postgres -d adminestate
   ```

   ```sql
   SELECT * FROM migration_summary;
   ```

   **Expected Output:**
   ```
    table_name    | row_count
   ---------------+-----------
    applications  |         1
    documents     |         0
    messages      |         2
    properties    |         5
    tenants       |        10
    transactions  |         0
    work_orders   |         1
   ```

---

## Step 9: Test Database Connection

1. **Open Command Prompt**

2. **Navigate to Backend Directory**
   ```cmd
   cd C:\Users\YOUR_USERNAME\adminEstate\backend-python
   ```

3. **Test Connection**
   ```cmd
   python -c "import db; print('Connection test:', 'PASSED' if db.test_connection() else 'FAILED')"
   ```

   **Expected Output:**
   ```
   ✓ Database connection pool initialized (1-10 connections)
   Connection test: PASSED
   ```

4. **Check Database Stats**
   ```cmd
   python -c "import db; import json; print(json.dumps(db.get_database_stats(), indent=2))"
   ```

   **Expected Output:**
   ```json
   {
     "properties": 5,
     "tenants": 10,
     "work_orders": 1,
     "messages": 2,
     "applications": 1,
     "transactions": 0,
     "documents": 0
   }
   ```

---

## Troubleshooting

### Issue: "psql: command not found"

**Solution**: Add PostgreSQL to PATH

1. Open System Properties (Win + R → `sysdm.cpl`)
2. Advanced → Environment Variables
3. System Variables → Path → Edit
4. Add New: `C:\Program Files\PostgreSQL\16\bin`
5. Click OK → Restart Command Prompt

### Issue: "password authentication failed"

**Solution**: Reset postgres password

1. Find `pg_hba.conf`:
   - Location: `C:\Program Files\PostgreSQL\16\data\pg_hba.conf`

2. Edit file (as Administrator):
   ```
   # Change from:
   host    all             all             127.0.0.1/32            scram-sha-256

   # To:
   host    all             all             127.0.0.1/32            trust
   ```

3. Restart PostgreSQL:
   ```cmd
   net stop postgresql-x64-16
   net start postgresql-x64-16
   ```

4. Reset password:
   ```cmd
   psql -U postgres
   ALTER USER postgres PASSWORD 'new_password';
   \q
   ```

5. Revert `pg_hba.conf` back to `scram-sha-256`

6. Restart PostgreSQL again

### Issue: "psycopg2 ImportError"

**Solution**: Install psycopg2-binary

```cmd
pip uninstall psycopg2
pip install psycopg2-binary
```

### Issue: "database adminestate does not exist"

**Solution**: Create database

```cmd
psql -U postgres
CREATE DATABASE adminestate;
\q
```

### Issue: Migration script fails

**Solution**: Check logs and verify:

1. PostgreSQL is running
2. Database `adminestate` exists
3. Schema was created successfully (`\dt` shows tables)
4. Password is correct in environment variable

---

## Next Steps

After successful installation and migration:

1. ✅ PostgreSQL installed and running
2. ✅ Database `adminestate` created
3. ✅ Schema tables created (7 tables)
4. ✅ Data migrated from JSON
5. ✅ Python driver installed
6. ⏳ **Next**: Update `app_simple.py` to use PostgreSQL
7. ⏳ **Next**: Test API endpoints
8. ⏳ **Next**: Test with AdminEstate frontend
9. ⏳ **Next**: Test with Tenant Portal

---

## Useful PostgreSQL Commands

### Connect to Database
```cmd
psql -U postgres -d adminestate
```

### List Databases
```sql
\l
```

### List Tables
```sql
\dt
```

### Describe Table
```sql
\d properties
```

### View Table Data
```sql
SELECT * FROM properties;
SELECT * FROM tenants;
SELECT * FROM messages;
```

### Check Row Counts
```sql
SELECT * FROM migration_summary;
```

### Exit psql
```sql
\q
```

---

## Backup and Restore

### Backup Database
```cmd
pg_dump -U postgres -d adminestate > adminestate_backup.sql
```

### Restore Database
```cmd
psql -U postgres -d adminestate < adminestate_backup.sql
```

---

## Security Recommendations

1. **Change default postgres password** immediately after installation
2. **Use environment variables** for passwords (never hardcode)
3. **Create dedicated database user** (don't use `postgres` superuser in production)
4. **Enable SSL connections** for production
5. **Restrict pg_hba.conf** to specific IP addresses
6. **Regular backups** using `pg_dump`

---

## Resources

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **psycopg2 Documentation**: https://www.psycopg.org/docs/
- **pgAdmin Documentation**: https://www.pgadmin.org/docs/
- **AdminEstate Schema**: [POSTGRESQL_SCHEMA.md](POSTGRESQL_SCHEMA.md)

---

**Installation Complete!** 🎉

You're now ready to run AdminEstate with PostgreSQL.
