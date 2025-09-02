# Twilio Webchat Widget Terraform Configuration

This Terraform configuration deploys the Twilio Webchat Widget as two separate ECS services:

## Architecture

### Services
1. **Webchat Server** (`webchat-widget-server.tf`)
   - Express.js backend API
   - Port: 3002
   - Health check: `/initWebchat`
   - Handles Twilio Conversations, TaskRouter, and rating functionality

2. **Webchat Client** (`webchat-widget-client.tf`)
   - React frontend application
   - Port: 3000
   - Health check: `/`
   - Serves the webchat widget interface

### Networking
- **Server Internal FQDN**: `webchat-widget-server-internal.anyvan.com`
- **Client Internal FQDN**: `webchat-widget-client-internal.anyvan.com`
- **Client → Server Communication**: Client connects to server via internal FQDN

## Deployment

### Prerequisites
- AWS CLI configured with appropriate profile
- Terraform installed
- Docker images built and pushed to ECR

### Environment Variables Required
- `server_container_image_url`: ECR URL for server container
- `client_container_image_url`: ECR URL for client container
- `server_internal_fqdn`: Internal FQDN for server service
- `client_internal_fqdn`: Internal FQDN for client service

### Commands

#### Production
```bash
cd terraform
terraform init
terraform plan -var-file=env/production.tfvars
terraform apply -var-file=env/production.tfvars
```

#### Staging
```bash
cd terraform
terraform init
terraform plan -var-file=env/staging.tfvars
terraform apply -var-file=env/staging.tfvars
```

#### Testing (PR Environment)
```bash
cd terraform
terraform init
terraform plan -var-file=env/testing.tfvars
terraform apply -var-file=env/testing.tfvars
```

## Configuration Files

### Main Configuration
- `webchat-widget-server.tf`: Server ECS service configuration
- `webchat-widget-client.tf`: Client ECS service configuration
- `variables.tf`: Variable definitions
- `locals.tf`: Local variable calculations
- `providers.tf`: Terraform provider configuration

### Environment-Specific
- `env/production.tfvars`: Production environment variables
- `env/staging.tfvars`: Staging environment variables
- `env/testing.tfvars`: Testing environment variables

### Monitoring
- `datadog_monitor.tf`: Datadog monitoring configuration
- `datadog_dashboard.tf`: Datadog dashboard configuration
- `datadog_service_definition.tf`: Datadog service definition

## Container Images

### Server Container
- **Dockerfile**: `Dockerfile.server`
- **Port**: 3002
- **Environment**: Node.js with Express.js
- **Features**: Twilio API integration, rating system, TaskRouter

### Client Container
- **Dockerfile**: `Dockerfile.client`
- **Port**: 3000
- **Environment**: Node.js with React
- **Features**: Webchat widget UI, real-time messaging

## Secrets Management
- Twilio credentials stored in AWS Secrets Manager
- Referenced via `data.aws_secretsmanager_secret.twilio-secrets.arn`

## Monitoring
- CPU and Memory monitoring for both services
- Error log monitoring
- Datadog integration for metrics and logs

## Scaling
- Both services use Fargate for serverless container management
- CPU and Memory limits configurable per environment
- Auto-scaling based on demand
