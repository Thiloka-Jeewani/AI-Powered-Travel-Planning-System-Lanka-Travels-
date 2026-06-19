# 🚀 Quick Start Guide - Lanka Vacations

**Last Updated**: December 6, 2025  
**Status**: ✅ Fully Dockerized | ✅ Production Ready

---

## 📋 Things You Need

### Required Software
- **Docker Desktop** (v20.10+)
  - Download: https://www.docker.com/products/docker-desktop
  - Includes Docker Compose
- **Git** (for cloning the repository)
  - Download: https://git-scm.com/downloads
- **Web Browser** (Chrome, Firefox, or Edge)

### Optional (for Development)
- **Node.js** (v18+) - Only if running without Docker
- **MySQL** (v8.0+) - Only if running without Docker
- **VS Code** - Recommended IDE
  - Extensions: REST Client, Docker, ESLint

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 5GB free space
- **OS**: Windows 10/11, macOS, or Linux
- **Ports**: 8080 (frontend), 5000 (backend), 3307 (MySQL)

---

## 🏃 Quick Start (Docker - Recommended)

### Step 1: Clone the Repository
```bash
git clone https://github.com/viacodos/Project-V.git
cd Project-V
```

### Step 2: Start All Services
```bash
# Option A: Use the startup script (Windows)
start-all.bat

# Option B: Manual Docker Compose
docker-compose up --build -d
```

### Step 3: Wait for Services to Start
```bash
# Check service status
docker-compose ps

# Should show 3 running services:
# - lanka_vacations_frontend (port 8080)
# - lanka_vacations_backend (port 5000)
# - lanka_vacations_db (port 3307)
```

### Step 4: Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000/api/health
- **MySQL**: localhost:3307

**That's it!** 🎉 The application is now running.

---

## 🧪 Verify Everything Works

### 1. Test Backend Health
```bash
curl http://localhost:5000/api/health
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-06T..."
}
```

### 2. Test Database Connection
```bash
# Check if packages are loaded
curl http://localhost:5000/api/packages
```

**Expected**: JSON array with 4 packages

### 3. Test Frontend
Open http://localhost:8080 in your browser

**Expected**:
- ✅ Homepage loads with hero section
- ✅ Navigation menu works
- ✅ Tour packages display with images
- ✅ Map shows destinations
- ✅ Contact form is visible

### 4. Test Expert System
```bash
curl -X POST http://localhost:5000/api/expert-system/recommend \
  -H "Content-Type: application/json" \
  -d "{\"duration\":\"7-10 days\",\"travelerType\":\"Family with kids\",\"interests\":\"Beaches & Relaxation\",\"budget\":\"$2,000 - $3,500\"}"
```

**Expected**: JSON with recommended cities and packages

---

## 🛠️ Docker Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start with rebuild (after code changes)
docker-compose up --build -d

# Start and view logs
docker-compose up
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Check Status
```bash
# List running containers
docker-compose ps

# Check resource usage
docker stats
```

---

## 🔧 Development Workflow

### Making Code Changes

#### Frontend Changes
1. Edit files in `src/`
2. Rebuild frontend container:
   ```bash
   docker-compose up --build -d frontend
   ```
3. Refresh browser (Ctrl+F5)

#### Backend Changes
1. Edit files in `backend/`
2. Restart backend container:
   ```bash
   docker-compose restart backend
   ```
3. Check logs:
   ```bash
   docker-compose logs -f backend
   ```

#### Database Changes
1. Edit `databaseupdated.sql`
2. Rebuild database:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Accessing Containers
```bash
# Access backend shell
docker exec -it lanka_vacations_backend sh

# Access MySQL
docker exec -it lanka_vacations_db mysql -uroot -pAabid2004@ lanka_vacations

# Access frontend (Nginx)
docker exec -it lanka_vacations_frontend sh
```

---

## 🐛 Troubleshooting

### Services Won't Start

**Problem**: `docker-compose up` fails

**Solutions**:
```bash
# 1. Check if ports are already in use
netstat -ano | findstr :8080
netstat -ano | findstr :5000
netstat -ano | findstr :3307

# 2. Stop conflicting services
docker-compose down
docker ps -a  # Check for other containers

# 3. Rebuild from scratch
docker-compose down -v
docker-compose up --build -d
```

### Frontend Shows "Cannot connect to backend"

**Problem**: API calls fail with CORS or connection errors

**Solutions**:
```bash
# 1. Check backend is running
docker-compose ps

# 2. Check backend logs
docker-compose logs backend

# 3. Verify backend health
curl http://localhost:5000/api/health

# 4. Restart backend
docker-compose restart backend
```

### Database Connection Error

**Problem**: Backend logs show "ER_ACCESS_DENIED_ERROR"

**Solutions**:
```bash
# 1. Check MySQL is healthy
docker-compose ps

# 2. Wait for MySQL to initialize (first run takes ~30s)
docker-compose logs mysql

# 3. Verify database exists
docker exec -it lanka_vacations_db mysql -uroot -pAabid2004@ -e "SHOW DATABASES;"

# 4. Reimport database
docker-compose down -v
docker-compose up -d
```

### Packages Not Loading

**Problem**: Frontend shows empty package list

**Solutions**:
```bash
# 1. Check if data exists
curl http://localhost:5000/api/packages

# 2. Check database
docker exec -it lanka_vacations_db mysql -uroot -pAabid2004@ lanka_vacations -e "SELECT COUNT(*) FROM packages;"

# 3. Reimport SQL file
docker exec -i lanka_vacations_db mysql -uroot -pAabid2004@ lanka_vacations < databaseupdated.sql
```

### Port Already in Use

**Problem**: "Bind for 0.0.0.0:8080 failed: port is already allocated"

**Solutions**:
```bash
# 1. Find process using the port
netstat -ano | findstr :8080

# 2. Kill the process (replace PID)
taskkill /PID <PID> /F

# 3. Or change port in docker-compose.yml
# Change "8080:80" to "8081:80"
```

### Docker Out of Space

**Problem**: "no space left on device"

**Solutions**:
```bash
# Clean up unused containers and images
docker system prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
docker system df
```

---

## 📊 Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Nginx)                                        │
│  http://localhost:8080                                   │
│  - Serves React app                                      │
│  - Static file caching                                   │
└─────────────────────────────────────────────────────────┘
                        ↓ API Calls
┌─────────────────────────────────────────────────────────┐
│  Backend (Node.js/Express)                               │
│  http://localhost:5000                                   │
│  - REST API endpoints                                    │
│  - Expert system                                         │
│  - PDF generation                                        │
│  - Chatbot service                                       │
└─────────────────────────────────────────────────────────┘
                        ↓ SQL Queries
┌─────────────────────────────────────────────────────────┐
│  MySQL Database                                          │
│  localhost:3307                                          │
│  - destinations, packages, hotels                        │
│  - users, bookings                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Testing Checklist

Before reporting issues, verify:

- [ ] Docker Desktop is running
- [ ] All 3 containers are running (`docker-compose ps`)
- [ ] Backend health check passes (http://localhost:5000/api/health)
- [ ] Frontend loads (http://localhost:8080)
- [ ] Packages API returns data (http://localhost:5000/api/packages)
- [ ] No errors in backend logs (`docker-compose logs backend`)
- [ ] Browser console has no errors (F12)
- [ ] Ports 8080, 5000, 3307 are not in use by other apps

---

## 🚀 Quick Commands Reference

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart backend
docker-compose restart backend

# Rebuild frontend
docker-compose up --build -d frontend

# Access MySQL
docker exec -it lanka_vacations_db mysql -uroot -pAabid2004@ lanka_vacations

# Clean restart
docker-compose down -v && docker-compose up --build -d

# Check status
docker-compose ps
```

---

## 📚 Additional Resources

- **Tech Stack**: See `TECH_STACK.md`
- **Best Practices**: See `BEST_PRACTICES.md`
- **Expert System**: See `EXPERT_SYSTEM.md`
- **Map Integration**: See `MAP_INTEGRATION.md`
- **API Testing**: See `EXPERT_SYSTEM_API_TEST.http`
- **Changes Log**: See `CHANGES_BY_MESANDU.md`

---

## 📞 Need Help?

1. Check Docker logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Check browser console (F12) for frontend errors
4. Review troubleshooting section above
5. Check documentation files for specific features

---

**Happy Coding!** 🎉
