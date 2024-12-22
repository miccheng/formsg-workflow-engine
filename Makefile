# Define default target
.DEFAULT_GOAL := help
.PHONEY: help build run worker dbmigrate dbseed up stop down ps setup

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Builds all the things
	npx nx run-many -t build -p temporal-workflows temporal-worker formsg-workflow-engine

run: ## Start the NestJS app
	npx nx serve formsg-workflow-engine

worker: ## Run the Temporal worker
	npx nx serve temporal-worker

dbmigrate: ## Run the database migration
	npx nx prisma-push formsg-workflow-engine
	npx nx prisma-generate formsg-workflow-engine

dbseed: ## Run the database seed
	npx nx prisma-seed formsg-workflow-engine --script seed_data.ts

up: ## Start the backing systems
	docker compose up -d

stop: ## Stop the backing systems
	docker compose stop

down: ## Bring down the backing systems
	docker compose down

ps: ## Status of Containers
	docker compose ps

setup: up dbmigrate dbseed ## Initial setup
