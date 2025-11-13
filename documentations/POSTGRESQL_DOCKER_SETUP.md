# PostgreSQL with Docker Desktop Setup Guide
## AdminEstate - Docker-Based PostgreSQL Integration

**Created**: 2025-11-09
**Target**: Windows 10/11 with Docker Desktop
**Estimated Time**: 15-20 minutes
**Advantages**: Isolated, portable, easy cleanup, no Windows installation needed

---

## Why Docker for PostgreSQL?

### Advantages over Native Installation:
- ✅ **No Windows installation** - Runs in container
- ✅ **Isolated environment** - Doesn't affect system
- ✅ **Easy cleanup** - Remove container when done
- ✅ **Portable** - Same setup on any machine
- ✅ **Version control** - Switch PostgreSQL versions easily
- ✅ **Fast setup** - 5 minutes vs 30 minutes
- ✅ **No PATH conflicts** - Container handles everything

---

## Prerequisites

### 1. Docker Desktop Installed

**Check if Docker is installed:**
```cmd
docker --version
```

**Expected output:**
```
Docker version 24.0.7, build afdd53b
```

**If not installed:**
1. Download Docker Desktop for Windows:
   ```
   https://www.docker.com/products/docker-desktop/
   ```
2. Run installer (requires restart)
3. Launch Docker Desktop
4. Wait for "Docker Desktop is running" message

### 2. WSL 2 (Windows Subsystem for Linux)

Docker Desktop requires WSL 2. It's usually installed automatically, but if you get errors:

```powershell
# Run PowerShell as Administrator
wsl --install
wsl --set-default-version 2
```

---

## Step 1: Pull PostgreSQL Docker Image

Open Command Prompt or PowerShell:

```cmd
docker pull postgres:16
```

**Expected output:**
```
16: Pulling from library/postgres
...
Status: Downloaded newer image for postgres:16
docker.io/library/postgres:16
```

**Verify image downloaded:**
```cmd
docker images
```

**Expected output:**
```
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
postgres     16        abc123def456   2 weeks ago   432MB
```

---

## Step 2: Create Docker Network (Optional but Recommended)

Create a dedicated network for AdminEstate services:

```cmd
docker network create adminestate-network
```

**Verify:**
```cmd
docker network ls
```

---

## Step 3: Run PostgreSQL Container

### Option A: Simple Setup (Recommended for Development)

```cmd
docker run -d ^
  --name adminestate-postgres ^
  --network adminestate-network ^
  -e POSTGRES_PASSWORD=admin123 ^
  -e POSTGRES_DB=adminestate ^
  -p 5432:5432 ^
  -v adminestate-pgdata:/var/lib/postgresql/data ^
  postgres:16
```

**Command Breakdown:**
- `-d` - Run in detached mode (background)
- `--name adminestate-postgres` - Container name
- `--network adminestate-network` - Connect to custom network
- `-e POSTGRES_PASSWORD=admin123` - Set postgres user password
- `-e POSTGRES_DB=adminestate` - Auto-create database
- `-p 5432:5432` - Map port 5432 (host:container)
- `-v adminestate-pgdata:/var/lib/postgresql/data` - Persistent volume
- `postgres:16` - Use PostgreSQL 16 image

### Option B: Advanced Setup (With Custom Config)

```cmd
docker run -d ^
  --name adminestate-postgres ^
  --network adminestate-network ^
  -e POSTGRES_PASSWORD=admin123 ^
  -e POSTGRES_DB=adminestate ^
  -e POSTGRES_USER=postgres ^
  -e PGDATA=/var/lib/postgresql/data/pgdata ^
  -p 5432:5432 ^
  -v adminestate-pgdata:/var/lib/postgresql/data ^
  --restart unless-stopped ^
  postgres:16 ^
  -c max_connections=200 ^
  -c shared_buffers=256MB
```

**Additional Options:**
- `--restart unless-stopped` - Auto-restart on Docker Desktop startup
- `-c max_connections=200` - Allow 200 concurrent connections
- `-c shared_buffers=256MB` - Memory buffer size

---

## Step 4: Verify PostgreSQL is Running

### Check Container Status

```cmd
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE         STATUS         PORTS                    NAMES
abc123def456   postgres:16   Up 10 seconds  0.0.0.0:5432->5432/tcp  adminestate-postgres
```

### Check Container Logs

```cmd
docker logs adminestate-postgres
```

**Expected output (last few lines):**
```
...
PostgreSQL init process complete; ready for start up.
...
database system is ready to accept connections
```

---

## Step 5: Connect to PostgreSQL Container

### Option A: Using Docker Exec (psql)

```cmd
docker exec -it adminestate-postgres psql -U postgres -d adminestate
```

**Expected output:**
```
psql (16.1)
Type "help" for help.

adminestate=#
```

**Test connection:**
```sql
SELECT version();
```

**Expected output:**
```
                                                version
-------------------------------------------------------------------------------------------------------
 PostgreSQL 16.1 (Debian 16.1-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14)
```

**Exit psql:**
```sql
\q
```

### Option B: Using Local psql (If Installed)

If you have psql installed on Windows:

```cmd
psql -h localhost -U postgres -d adminestate
```

Enter password: `admin123`

---

## Step 6: Copy and Run Schema Script

### Method 1: Copy File into Container (Recommended)

**Navigate to backend-python directory:**
```cmd
cd C:\Users\YOUR_USERNAME\adminEstate\backend-python
```

**Copy schema.sql into container:**
```cmd
docker cp schema.sql adminEstate-postgres:/tmp/schema.sql
```

**Execute schema inside container:**
```cmd
docker exec -it adminEstate-postgres psql -U postgres -d adminEstate -f /tmp/schema.sql
```

**Expected output:**
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

### Method 2: Pipe Schema from Host

```cmd
type schema.sql | docker exec -i adminEstate-postgres psql -U postgres -d adminEstate
```

### Method 3: Using Docker Exec with Heredoc

```cmd
docker exec -i adminestate-postgres psql -U postgres -d adminestate < schema.sql
```

---

## Step 7: Verify Schema Created

```cmd
docker exec -it adminEstate-postgres psql -U postgres -d adminEstate
```

**Inside psql:**
```sql
-- List all tables
\dt

-- Expected output:
   Schema |     Name      | Type  |  Owner
  --------+---------------+-------+----------
   public | applications  | table | postgres
   public | documents     | table | postgres
   public | messages      | table | postgres
   public | properties    | table | postgres
   public | tenants       | table | postgres
   public | transactions  | table | postgres
   public | work_orders   | table | postgres

-- Check migration summary view
SELECT * FROM migration_summary;

-- Exit
\q
```

---

## Step 8: Update Python Connection Settings

### Option A: Use Environment Variables

Create `.env` file in `backend-python/`:

```env
# PostgreSQL Docker Container Settings
DB_NAME=adminEstate
DB_USER=postgres
DB_PASSWORD=admin123
DB_HOST=localhost
DB_PORT=5432
```

### Option B: Update db.py Directly

The `db.py` file already reads from environment variables, so just set them:

**Windows Command Prompt:**
```cmd
set DB_PASSWORD=admin123
set DB_HOST=localhost
set DB_PORT=5432
```

**PowerShell:**
```powershell
$env:DB_PASSWORD="admin123"
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
```

---

## Step 9: Run Migration Script

```cmd
cd C:\Users\YOUR_USERNAME\adminEstate\backend-python

python migrate_to_postgres.py
```

**Expected output:**
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
✓ Backup created: ...\src\data.json.backup

[Step 3] Connecting to PostgreSQL...
✓ Connected to PostgreSQL successfully

[Step 4] Migrating 5 properties...
✓ Migrated 5 properties

...

[Step 8] Verifying migration...
✓ All data migrated successfully!

================================================================================
  Migration Completed Successfully!
================================================================================
```

---

## Step 10: Test Connection from Python

```cmd
cd backend-python

python -c "import db; print('Connection test:', 'PASSED' if db.test_connection() else 'FAILED')"
```

**Expected output:**
```
✓ Database connection pool initialized (1-10 connections)
Connection test: PASSED
```

**Check data:**
```cmd
python -c "import db; import json; print(json.dumps(db.get_database_stats(), indent=2))"
```

**Expected output:**
```json
{
  "applications": 1,
  "documents": 0,
  "messages": 2,
  "properties": 5,
  "tenants": 10,
  "transactions": 0,
  "work_orders": 1
}
```

---

## Docker Container Management

### Start Container
```cmd
docker start adminestate-postgres
```

### Stop Container
```cmd
docker stop adminestate-postgres
```

### Restart Container
```cmd
docker restart adminestate-postgres
```

### View Logs (Real-time)
```cmd
docker logs -f adminestate-postgres
```

### View Container Stats
```cmd
docker stats adminestate-postgres
```

### Remove Container (Keeps Data)
```cmd
docker stop adminestate-postgres
docker rm adminestate-postgres
```

### Remove Container + Data (Clean Slate)
```cmd
docker stop adminestate-postgres
docker rm adminestate-postgres
docker volume rm adminestate-pgdata
```

### Recreate Container (Keep Data)
```cmd
# Stop and remove old container
docker stop adminestate-postgres
docker rm adminestate-postgres

# Create new container (uses existing volume)
docker run -d ^
  --name adminestate-postgres ^
  -e POSTGRES_PASSWORD=admin123 ^
  -e POSTGRES_DB=adminestate ^
  -p 5432:5432 ^
  -v adminestate-pgdata:/var/lib/postgresql/data ^
  postgres:16
```

---

## Docker Compose Setup (Advanced)

For easier management, create `docker-compose.yml` in `backend-python/`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: adminestate-postgres
    environment:
      POSTGRES_DB: adminestate
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: admin123
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - adminestate-pgdata:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    networks:
      - adminestate-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  adminestate-pgdata:
    driver: local

networks:
  adminestate-network:
    driver: bridge
```

### Using Docker Compose

**Start PostgreSQL:**
```cmd
cd backend-python
docker-compose up -d
```

**Stop PostgreSQL:**
```cmd
docker-compose down
```

**Stop + Remove Data:**
```cmd
docker-compose down -v
```

**View Logs:**
```cmd
docker-compose logs -f postgres
```

**Restart:**
```cmd
docker-compose restart
```

---

## Accessing PostgreSQL GUI Tools

### pgAdmin 4 (Docker Container)

Run pgAdmin alongside PostgreSQL:

```cmd
docker run -d ^
  --name adminestate-pgadmin ^
  --network adminestate-network ^
  -p 8080:80 ^
  -e PGADMIN_DEFAULT_EMAIL=admin@adminestate.com ^
  -e PGADMIN_DEFAULT_PASSWORD=admin123 ^
  dpage/pgadmin4
```

**Access pgAdmin:**
1. Open browser: `http://localhost:8080`
2. Login: `admin@adminestate.com` / `admin123`
3. Add Server:
   - Name: AdminEstate
   - Host: `adminestate-postgres` (container name)
   - Port: `5432`
   - Username: `postgres`
   - Password: `admin123`

### DBeaver (Desktop Application)

1. Download DBeaver: https://dbeaver.io/download/
2. Install and open
3. New Connection → PostgreSQL
4. Settings:
   - Host: `localhost`
   - Port: `5432`
   - Database: `adminestate`
   - Username: `postgres`
   - Password: `admin123`

---

## Backup and Restore with Docker

### Backup Database

```cmd
docker exec adminestate-postgres pg_dump -U postgres adminestate > adminestate_backup.sql
```

**Or with timestamp:**
```cmd
docker exec adminestate-postgres pg_dump -U postgres adminestate > adminestate_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql
```

### Restore Database

```cmd
docker exec -i adminestate-postgres psql -U postgres -d adminestate < adminestate_backup.sql
```

### Backup to Docker Volume

```cmd
docker exec adminestate-postgres pg_dump -U postgres -F c -b -v -f /tmp/backup.dump adminestate
docker cp adminestate-postgres:/tmp/backup.dump ./adminestate_backup.dump
```

### Restore from Docker Volume

```cmd
docker cp ./adminestate_backup.dump adminestate-postgres:/tmp/backup.dump
docker exec adminestate-postgres pg_restore -U postgres -d adminestate -v /tmp/backup.dump
```

---

## Troubleshooting

### Issue: "Cannot connect to Docker daemon"

**Solution**: Start Docker Desktop
1. Press Win key
2. Type "Docker Desktop"
3. Launch application
4. Wait for "Docker Desktop is running"

### Issue: "Port 5432 already in use"

**Solution**: Use different port or stop conflicting service

**Check what's using port 5432:**
```cmd
netstat -ano | findstr :5432
```

**Use different port:**
```cmd
docker run -d ^
  --name adminestate-postgres ^
  -e POSTGRES_PASSWORD=admin123 ^
  -e POSTGRES_DB=adminestate ^
  -p 5433:5432 ^
  -v adminestate-pgdata:/var/lib/postgresql/data ^
  postgres:16
```

Then update `.env`:
```env
DB_PORT=5433
```

### Issue: "Container exits immediately"

**Check logs:**
```cmd
docker logs adminestate-postgres
```

**Common causes:**
- Invalid environment variables
- Permission issues with volume
- Corrupted data directory

**Solution - Fresh start:**
```cmd
docker stop adminestate-postgres
docker rm adminestate-postgres
docker volume rm adminestate-pgdata
# Recreate container with commands from Step 3
```

### Issue: "psql: connection refused"

**Check container is running:**
```cmd
docker ps
```

**Check container logs:**
```cmd
docker logs adminestate-postgres
```

**Restart container:**
```cmd
docker restart adminestate-postgres
```

### Issue: Python connection fails

**Verify connection settings:**
```cmd
python -c "import os; print(f'Host: {os.getenv(\"DB_HOST\", \"localhost\")}'); print(f'Port: {os.getenv(\"DB_PORT\", \"5432\")}'); print(f'Password: {os.getenv(\"DB_PASSWORD\", \"not set\")}')"
```

**Test with psql:**
```cmd
docker exec -it adminestate-postgres psql -U postgres -d adminestate -c "SELECT 1"
```

---

## Performance Tuning

### Increase Container Resources

Docker Desktop → Settings → Resources:
- **CPUs**: 2-4 cores
- **Memory**: 4-8 GB
- **Disk**: 20 GB minimum

### PostgreSQL Configuration

Edit `docker-compose.yml` command section:

```yaml
command:
  - postgres
  - -c
  - max_connections=200
  - -c
  - shared_buffers=512MB
  - -c
  - effective_cache_size=1536MB
  - -c
  - work_mem=16MB
  - -c
  - maintenance_work_mem=128MB
```

---

## Production Considerations

### Security Enhancements

1. **Change default password:**
   ```cmd
   docker exec -it adminestate-postgres psql -U postgres
   ```
   ```sql
   ALTER USER postgres PASSWORD 'your_strong_password_here';
   \q
   ```

2. **Create dedicated user:**
   ```sql
   CREATE USER adminestate_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE adminestate TO adminestate_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO adminestate_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO adminestate_user;
   ```

3. **Use secrets management:**
   - Docker secrets
   - Azure Key Vault
   - AWS Secrets Manager

### Data Persistence

Your data is safe in the `adminestate-pgdata` volume even if:
- Container is stopped
- Container is removed
- Docker Desktop restarts
- Computer restarts

**Verify volume exists:**
```cmd
docker volume ls
```

**Inspect volume:**
```cmd
docker volume inspect adminestate-pgdata
```

**Backup volume:**
```cmd
docker run --rm -v adminestate-pgdata:/data -v %cd%:/backup alpine tar czf /backup/pgdata_backup.tar.gz /data
```

---

## Comparison: Docker vs Native Installation

| Feature | Docker | Native Windows Install |
|---------|--------|----------------------|
| Setup Time | 5-10 minutes | 30-45 minutes |
| Disk Space | ~500MB | ~1GB |
| Isolation | ✅ Full isolation | ❌ System-wide |
| Cleanup | ✅ One command | ❌ Manual uninstall |
| Version Switch | ✅ Easy (change tag) | ❌ Reinstall needed |
| Backup | ✅ Volume snapshots | ⚠️ Manual pg_dump |
| Portability | ✅ Works anywhere | ❌ Windows only |
| Performance | ⚠️ Slight overhead | ✅ Native speed |
| GUI Tools | ⚠️ Extra container | ✅ pgAdmin included |

**Recommendation**: Use Docker for development, native install for production servers.

---

## Next Steps

After successful Docker setup:

1. ✅ Docker Desktop running
2. ✅ PostgreSQL container running
3. ✅ Database `adminestate` created
4. ✅ Schema tables created (7 tables)
5. ✅ Data migrated from JSON
6. ✅ Python driver connected
7. ⏳ **Next**: Update `app_simple.py` to use PostgreSQL
8. ⏳ **Next**: Test with AdminEstate frontend
9. ⏳ **Next**: Test with Tenant Portal

---

## Quick Reference Commands

```cmd
# Start PostgreSQL
docker start adminestate-postgres

# Stop PostgreSQL
docker stop adminestate-postgres

# View logs
docker logs -f adminestate-postgres

# Access psql
docker exec -it adminestate-postgres psql -U postgres -d adminestate

# Run migration
cd backend-python
python migrate_to_postgres.py

# Test connection
python -c "import db; print('✓ Connected' if db.test_connection() else '✗ Failed')"

# Backup
docker exec adminestate-postgres pg_dump -U postgres adminestate > backup.sql

# Restore
docker exec -i adminestate-postgres psql -U postgres -d adminestate < backup.sql
```

---

## Resources

- **Docker Documentation**: https://docs.docker.com/
- **PostgreSQL Docker Image**: https://hub.docker.com/_/postgres
- **Docker Compose**: https://docs.docker.com/compose/
- **AdminEstate Schema**: [POSTGRESQL_SCHEMA.md](POSTGRESQL_SCHEMA.md)
- **Migration Guide**: [POSTGRESQL_INSTALLATION.md](POSTGRESQL_INSTALLATION.md)

---

**Docker Setup Complete!** 🐳🎉

PostgreSQL is now running in an isolated container, ready for AdminEstate integration.
