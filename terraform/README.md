# Twilio Webchat Widget - Terraform Deployment

This directory contains the Terraform configuration for deploying the Twilio Webchat Widget to AWS ECS.

## Overview

The deployment consists of:
- **ECS Fargate Service**: Runs the webchat widget container
- **Application Load Balancer**: Provides HTTP/HTTPS access
- **ECR Repository**: Stores Docker images
- **Secrets Manager**: Stores Twilio credentials
- **Datadog Monitoring**: Error logs, CPU, and memory monitoring

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform installed (version ~>1.9.5)
3. Docker installed for building images
4. Access to the Anyvan AWS accounts

## Environment Configuration

The deployment supports three environments:

### Production
```bash
terraform workspace select production
terraform plan -var-file=env/production.tfvars
terraform apply -var-file=env/production.tfvars
```

### Staging
```bash
terraform workspace select staging
terraform plan -var-file=env/staging.tfvars
terraform apply -var-file=env/staging.tfvars
```

### Testing (PR environments)
```bash
terraform workspace select testing-<jira-ticket>
terraform plan -var-file=env/testing.tfvars -var="jira_ticket_number=<jira-ticket>"
terraform apply -var-file=env/testing.tfvars -var="jira_ticket_number=<jira-ticket>"
```

## Deployment Process

1. **Build and Push Docker Image**:
   ```bash
   # Set environment variables
   export ENVIRONMENT=production
   export ECR_REPOSITORY_NAME=twilio-webchat-widget/prod
   export GIT_SHA=$(git rev-parse HEAD)
   
   # Run deployment script
   node scripts/deploy.js
   ```

2. **Deploy Infrastructure**:
   ```bash
   cd terraform
   terraform init
   terraform plan -var-file=env/production.tfvars -var="git_sha=$GIT_SHA"
   terraform apply -var-file=env/production.tfvars -var="git_sha=$GIT_SHA"
   ```

## Configuration

### Environment Variables

The following environment variables can be set in the `.tfvars` files:

- `region`: AWS region (default: eu-west-1)
- `env`: Environment name (production/staging/testing)
- `profile`: AWS profile to use
- `ecr_repository_name`: ECR repository name
- `vpc_environment`: VPC environment to deploy into
- `internal_fqdn`: Internal FQDN for the service
- `external_fqdn`: External FQDN for the service
- `fargate_task_cpu`: CPU allocation for the task
- `fargate_task_memory`: Memory allocation for the task

### Health Checks

The service uses the `/initWebchat` endpoint for health checks, which is the main API endpoint for initializing webchat sessions.

### Monitoring

The deployment includes Datadog monitoring for:
- Error logs (threshold: 2 errors in 15 minutes)
- CPU usage (threshold: 90%)
- Memory usage (threshold: 90%)

## Architecture

```
Internet → ALB → ECS Fargate → Webchat Widget Container (Port 3002)
                                    ↓
                            Secrets Manager (Twilio credentials)
```

## Troubleshooting

### Common Issues

1. **Health Check Failures**: Ensure the `/initWebchat` endpoint is responding correctly
2. **Container Startup Issues**: Check container logs in CloudWatch
3. **Secrets Access**: Verify the ECS task has access to the Twilio secrets in Secrets Manager

### Logs

- **Application Logs**: CloudWatch Logs group named after the service
- **Datadog Logs**: Available in Datadog with service name `twilio-webchat-widget`

### Scaling

The service can be scaled by modifying the `desired_count` parameter in the ECS service configuration.

## Security

- The service runs in a private subnet
- Access is controlled via ALB security groups
- Twilio credentials are stored in AWS Secrets Manager
- The container runs as a non-root user
