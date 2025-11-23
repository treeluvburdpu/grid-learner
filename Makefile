#!/usr/bin/env bash
.PHONY: help dev build preview test lint format
NPM_BIN := node_modules/.bin

help: ## Display this help screen
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "}; /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ==============================================================================
# Application Tasks
# ==============================================================================
dev: ## Start the development server
	$(NPM_BIN)/vite

build: ## Build the application for production
	$(NPM_BIN)/vite build

preview: ## Preview the production build locally
	$(NPM_BIN)/vite preview

test: ## Run Vitest tests
	$(NPM_BIN)/vitest run

lint: ## Run ESLint to check for code quality issues
	$(NPM_BIN)/eslint . --ext .ts,.tsx,.js,.jsx --fix

format: ## Run Prettier to format the codebase
	$(NPM_BIN)/prettier --write .
