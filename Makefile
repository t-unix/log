.PHONY: help install dev build docker-build docker-up docker-down test-e2e test-e2e-ui helm-install helm-uninstall clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies for frontend and backend
	@echo "📦 Installing dependencies..."
	npm install
	cd frontend && npm install
	cd backend && npm install

dev: ## Run development servers
	@echo "🚀 Starting development servers..."
	npm run dev

build: ## Build frontend and backend
	@echo "🏗️  Building applications..."
	cd frontend && npm run build
	cd backend && npm run build

docker-build: ## Build Docker images
	@echo "🐳 Building Docker images..."
	docker-compose build

docker-up: ## Start Docker containers
	@echo "🚀 Starting Docker containers..."
	docker-compose up -d
	@echo "✅ Services are running:"
	@echo "   - Frontend: http://localhost:3000"
	@echo "   - Backend:  http://localhost:3001"
	@echo "   - Database: localhost:5432"

docker-down: ## Stop Docker containers
	@echo "🛑 Stopping Docker containers..."
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

test-e2e: ## Run end-to-end tests (headless)
	@echo "🧪 Running E2E tests..."
	cd e2e-tests && npm test

test-e2e-ui: ## Run end-to-end tests with UI
	@echo "🧪 Running E2E tests with UI..."
	cd e2e-tests && npm run test:ui

test-e2e-setup: ## Install E2E test dependencies
	@echo "📦 Installing E2E test dependencies..."
	cd e2e-tests && npm install && npm run install-browsers

helm-install: ## Install Helm chart
	@echo "☸️  Installing Helm chart..."
	helm install log-asset-management ./helm/log-asset-management \
		--create-namespace \
		--namespace log

helm-upgrade: ## Upgrade Helm chart
	@echo "☸️  Upgrading Helm chart..."
	helm upgrade log-asset-management ./helm/log-asset-management \
		--namespace log

helm-uninstall: ## Uninstall Helm chart
	@echo "🗑️  Uninstalling Helm chart..."
	helm uninstall log-asset-management --namespace log

clean: ## Clean build artifacts and dependencies
	@echo "🧹 Cleaning..."
	rm -rf node_modules frontend/node_modules backend/node_modules
	rm -rf frontend/dist backend/dist
	rm -rf coverage
