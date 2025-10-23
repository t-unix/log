# Log - Asset Management System

A modern, open-source asset management application for organizations built with Vue 3, TypeScript, and Express. Track assets, manage loans, report issues, and maintain comprehensive activity logs with mobile-optimized UI.

## Features

### Core Functionality
- **Asset Management** - Complete asset catalog with metadata, categories, serial numbers, and photo attachments
- **Loan Tracking** - Check out assets to members with expected return dates and return tracking
- **Issue Reporting** - Log and track issues with severity levels and status management
- **Activity Logbook** - Comprehensive audit trail of all system activities
- **Photo Capture** - Upload photos or capture directly from device camera

### Security & Authentication
- **OAuth Integration** - Sign in with GitHub, Google, or Apple
- **Role-Based Access Control** - Manage permissions per organization
- **JWT Authentication** - Secure API access with token-based auth
- **Session Management** - Persistent user sessions

### Modern UI/UX
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Progressive Web App** - Mobile-first design with app-like experience
- **Modern UI Components** - Clean, intuitive interface following best practices
- **Dark Mode Ready** - Theme support built-in

## Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Pinia** - State management
- **Vue Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **TypeScript** - Type-safe backend
- **PostgreSQL** - Relational database
- **Passport.js** - OAuth authentication

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Local development orchestration
- **Kubernetes** - Container orchestration
- **Helm** - Kubernetes package manager
- **Nginx** - Web server and reverse proxy

## Getting Started

### Prerequisites
- Node.js 20+ (for local development)
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 16+ (if running without Docker)

### Local Development (with Docker)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd log
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your OAuth credentials
   ```

3. **Start the application**
   ```bash
   make docker-up
   # Or: docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

5. **View logs**
   ```bash
   make docker-logs
   # Or: docker-compose logs -f
   ```

### Local Development (without Docker)

1. **Install dependencies**
   ```bash
   make install
   # Or: npm install && cd frontend && npm install && cd ../backend && npm install
   ```

2. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb logdb

   # Run migrations
   cd backend
   npm run migrate
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   make dev
   # Or: npm run dev (runs both frontend and backend)
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Deployment

### Docker Deployment

#### Build Images
```bash
make docker-build
# Or: docker-compose build
```

#### Production Configuration
```bash
# Edit docker-compose.yml for production settings
# Update environment variables
# Configure volumes for persistence
```

#### Deploy
```bash
docker-compose up -d
```

### Kubernetes Deployment with Helm

#### Prerequisites
- Kubernetes cluster (EKS, GKE, AKS, or local minikube)
- kubectl configured
- Helm 3+ installed

#### Install PostgreSQL (if needed)
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgresql bitnami/postgresql \
  --set auth.username=loguser \
  --set auth.password=changeme \
  --set auth.database=logdb \
  --namespace log --create-namespace
```

#### Configure Helm Values
```bash
cd helm/log-asset-management
cp values.yaml values-prod.yaml
# Edit values-prod.yaml with your settings:
# - Domain name
# - OAuth credentials
# - Resource limits
# - Ingress configuration
```

#### Deploy with Helm
```bash
# Install
helm install log-asset-management ./helm/log-asset-management \
  --values ./helm/log-asset-management/values-prod.yaml \
  --namespace log --create-namespace

# Upgrade
helm upgrade log-asset-management ./helm/log-asset-management \
  --values ./helm/log-asset-management/values-prod.yaml \
  --namespace log

# Uninstall
helm uninstall log-asset-management --namespace log
```

#### Verify Deployment
```bash
# Check pods
kubectl get pods -n log

# Check services
kubectl get services -n log

# Check ingress
kubectl get ingress -n log

# View logs
kubectl logs -f deployment/log-asset-management-backend -n log
```

## OAuth Configuration

### GitHub OAuth
1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3001/api/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

### Google OAuth
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new OAuth 2.0 Client ID
3. Set Authorized redirect URI to: `http://localhost:3001/api/auth/google/callback`
4. Copy Client ID and Client Secret to `.env`

### Apple OAuth
1. Go to https://developer.apple.com/
2. Create a Sign In with Apple service
3. Configure your app and domain
4. Copy Client ID and Client Secret to `.env`

## Project Structure

```
log/
├── frontend/                # Vue 3 frontend application
│   ├── src/
│   │   ├── components/     # Reusable Vue components
│   │   ├── views/          # Page components
│   │   ├── stores/         # Pinia state stores
│   │   ├── router/         # Vue Router configuration
│   │   └── style.css       # Global styles
│   ├── Dockerfile          # Frontend container image
│   └── nginx.conf          # Nginx configuration
├── backend/                # Express backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── db/             # Database schema and migrations
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Application entry point
│   └── Dockerfile          # Backend container image
├── helm/                   # Kubernetes Helm chart
│   └── log-asset-management/
│       ├── Chart.yaml      # Chart metadata
│       ├── values.yaml     # Default configuration
│       └── templates/      # Kubernetes manifests
├── docker-compose.yml      # Docker Compose configuration
├── .env.example           # Environment variables template
├── Makefile               # Build and deployment commands
└── README.md              # This file
```

## Development Commands

```bash
# Install dependencies
make install

# Run development servers
make dev

# Build for production
make build

# Docker operations
make docker-build      # Build images
make docker-up         # Start containers
make docker-down       # Stop containers
make docker-logs       # View logs

# Kubernetes operations
make helm-install      # Install Helm chart
make helm-upgrade      # Upgrade deployment
make helm-uninstall    # Remove deployment

# Clean up
make clean            # Remove build artifacts
```

## API Documentation

### Authentication Endpoints
- `GET /api/auth/github` - GitHub OAuth login
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/apple` - Apple OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Asset Endpoints
- `GET /api/assets` - List all assets
- `GET /api/assets/:id` - Get asset details
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Loan Endpoints
- `GET /api/loans` - List all loans
- `POST /api/loans` - Create new loan
- `POST /api/loans/:id/return` - Return loaned asset

### Issue Endpoints
- `GET /api/issues` - List all issues
- `POST /api/issues` - Report new issue
- `PATCH /api/issues/:id/status` - Update issue status

### Logbook Endpoints
- `GET /api/logbook` - Get activity logs

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Acknowledgments

- Vue.js team for the amazing framework
- Express.js community
- All contributors and supporters
