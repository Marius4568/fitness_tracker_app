# Fitness Tracker - DevOps Project

A full-stack fitness tracking application demonstrating Infrastructure as Code, containerization, and automated CI/CD deployment.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     AWS EC2 Instance                     │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Frontend   │  │   Backend    │  │  PostgreSQL  │  │
│  │   (Nginx)    │──│  (Node.js)   │──│   Database   │  │
│  │   Port 80    │  │  Port 5000   │  │  Port 5432   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
                        ▲
                        │
                   Internet Access
```

## 🚀 Technologies Used

**Infrastructure:**
- **Terraform**: Infrastructure provisioning (EC2, Security Groups, SSH Keys)
- **Ansible**: Configuration management and deployment automation
- **AWS EC2**: Cloud hosting (eu-central-1 region)

**Application Stack:**
- **Frontend**: React + Vite, served by Nginx
- **Backend**: Node.js + Express
- **Database**: PostgreSQL 15
- **Containerization**: Docker + Docker Compose

**CI/CD:**
- **GitHub Actions**: Automated build and deployment pipeline
- **Docker Hub**: Container image registry

## 📋 Prerequisites

- AWS Account with IAM user credentials
- Terraform >= 1.6
- Ansible >= 2.16 (via WSL on Windows)
- Docker Desktop
- Node.js 22+
- Git

## 🛠️ Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/fitness_tracker_app.git
cd fitness_tracker_app
```

### 2. Run Locally with Docker Compose

```bash
# Start all services
docker-compose up --build

# Access application
# Frontend: http://localhost
# Backend API: http://localhost:5000
# Database: localhost:5432
```

## 🌐 Production Deployment

### Infrastructure Provisioning (Terraform)

```bash
cd terraform

# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Create infrastructure
terraform apply

# Note the output: instance_public_ip and ssh_connection_command
```

### Server Configuration (Ansible)

```bash
cd ../ansible

# Update inventory.ini with EC2 public IP
# Edit: ansible_ssh_private_key_file path if needed

# Test connectivity
ansible fitness_tracker -i inventory.ini -m ping

# Deploy application
ansible-playbook -i inventory.ini playbook.yml
```

### CI/CD Setup (GitHub Actions)

**Required GitHub Secrets:**
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub access token
- `EC2_SSH_KEY`: Private SSH key contents
- `EC2_HOST`: EC2 instance public IP

**Workflow triggers automatically on:**
- Push to `master` branch
- Manual workflow dispatch

## 📊 Monitoring & Health Checks

**Health Check Endpoint:**
```bash
curl http://YOUR_EC2_IP/health
```

**Check Running Containers:**
```bash
ssh ubuntu@YOUR_EC2_IP "docker ps"
```

**View Application Logs:**
```bash
ssh ubuntu@YOUR_EC2_IP "docker-compose -f /home/ubuntu/fitness-tracker/docker-compose.yml logs"
```

## 🔒 Security Features

- Encrypted EBS volumes
- Security group rules limiting access
- SSH key-based authentication
- Environment variables for sensitive data
- IAM user with least-privilege permissions

## 📁 Project Structure

```
fitness_tracker_app/
├── .github/
│   └── workflows/
│       └── deploy.yml           # CI/CD pipeline
├── terraform/
│   ├── main.tf                  # Infrastructure definition
│   ├── outputs.tf               # Output values
│   └── fitness-tracker-key.pem  # SSH private key (gitignored)
├── ansible/
│   ├── inventory.ini            # Server inventory
│   └── playbook.yml             # Configuration playbook
├── fitness-tracker-frontend/
│   ├── src/                     # React source code
│   ├── Dockerfile               # Frontend container
│   └── nginx.conf               # Nginx configuration
├── fitness-tracker-backend/
│   ├── server.js                # Express API server
│   ├── Dockerfile               # Backend container
│   └── package.json             # Node dependencies
├── docker-compose.yml           # Multi-container orchestration
├── init.sql                     # Database initialization
└── README.md                    # This file
```

## 🎯 Features

- **Exercise Logging**: Add exercises with rep counts
- **Persistent Storage**: PostgreSQL database with Docker volumes
- **Real-time Updates**: Automatic UI refresh after operations
- **Statistics**: View total exercises and reps
- **Responsive Design**: Works on desktop and mobile

## 🔄 Deployment Workflow

1. Developer pushes code to GitHub
2. GitHub Actions triggers automatically
3. Docker images built for frontend and backend
4. Images pushed to Docker Hub
5. Workflow SSHs into EC2 instance
6. Latest images pulled and containers restarted
7. Application updated with zero downtime

## 📝 API Endpoints

- `GET /health` - Health check with database connectivity test
- `GET /api/exercises` - List all exercises
- `POST /api/exercises` - Create new exercise
- `DELETE /api/exercises/:id` - Delete exercise
- `GET /api/stats` - Get exercise statistics

## 🧹 Cleanup

**Stop EC2 instance (preserves data):**
```bash
# Via AWS Console: EC2 → Instances → Stop Instance
```

**Destroy all infrastructure:**
```bash
cd terraform
terraform destroy
```

## 🚧 Future Improvements

- HTTPS with Let's Encrypt SSL certificates
- Custom domain name with Route 53
- CloudWatch monitoring and alarms
- Multi-environment setup (dev/staging/prod)
- Automated backup strategy for database
- Load balancer for high availability
- Auto-scaling based on traffic

## 👤 Author

Created as a DevOps course project demonstrating:
- Infrastructure as Code principles
- Container orchestration
- Automated CI/CD pipelines
- Cloud deployment best practices

## 📄 License

This project is for educational purposes.