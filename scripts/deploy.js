#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Configuration
const AWS_REGION = process.env.AWS_REGION || 'eu-west-1';
const ECR_REGISTRY_ID = process.env.ECR_REGISTRY_ID || '331151898531';
const ECR_REPOSITORY_NAME = process.env.ECR_REPOSITORY_NAME || 'twilio-webchat-widget/prod';
const ENVIRONMENT = process.env.ENVIRONMENT || 'production';
const GIT_SHA = process.env.CIRCLE_SHA1 || process.env.GIT_SHA || 'latest';

function runCommand(command, options = {}) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      ...options 
    });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

function main() {
  console.log('🚀 Starting deployment...');
  console.log(`Environment: ${ENVIRONMENT}`);
  console.log(`Git SHA: ${GIT_SHA}`);
  console.log(`ECR Repository: ${ECR_REPOSITORY_NAME}`);

  // Build the Docker image
  console.log('\n📦 Building Docker image...');
  const imageTag = `${ECR_REGISTRY_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}:${GIT_SHA}`;
  runCommand(`docker build -t ${imageTag} .`);

  // Login to ECR
  console.log('\n🔐 Logging into ECR...');
  runCommand(`aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com`);

  // Push the image to ECR
  console.log('\n⬆️ Pushing image to ECR...');
  runCommand(`docker push ${imageTag}`);

  // Also tag as latest
  const latestTag = `${ECR_REGISTRY_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}:latest`;
  runCommand(`docker tag ${imageTag} ${latestTag}`);
  runCommand(`docker push ${latestTag}`);

  console.log('\n✅ Deployment completed successfully!');
  console.log(`Image: ${imageTag}`);
  console.log(`Latest: ${latestTag}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
