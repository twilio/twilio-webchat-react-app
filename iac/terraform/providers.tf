terraform {
  required_version = "~>1.9.5" # we pin the Terraform version to guarantee stability
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">=3.68.0" # we pin the AWS provider version to guarantee stability
    }
    datadog = {
      source = "DataDog/datadog"
    }
  }

  backend "s3" {
    bucket         = "anyvan-terraform-state-file-aws-accounts"      # name of the bucket
    key            = "twilio-webchat-widget.tfstate"                 # name of the state file for this particular terraform stack
    region         = "eu-west-1"                                     # this is the region where the bucket is created. It can be in a different region to where you deploy your resources.
    dynamodb_table = "anyvan-terraform-state-file-lock-aws-accounts" # table where the lock is kept
  }
}

provider "aws" {
  region  = var.region
  profile = var.profile

  default_tags {
    tags = local.default_tags
  }
}

provider "aws" {
  region  = var.region
  profile = "production"
  alias   = "production"

  default_tags {
    tags = local.default_tags
  }
}

provider "aws" {
  region  = var.region
  profile = "horizontal"
  alias   = "horizontal"

  default_tags {
    tags = local.default_tags
  }
}

provider "datadog" {
  // This then require environmental variables DD_API_KEY, DD_APP_KEY and DD_HOST be set
  // These are all set in the circleci anyvan context.
  validate = false
}

data "terraform_remote_state" "top" {
  backend   = "s3"
  workspace = "prod-anyvan_com"

  config = {
    bucket         = "anyvan-terraform-state-file-aws-accounts"
    key            = "iac-terraform-top.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "anyvan-terraform-state-file-lock-aws-accounts"
  }
}

data "terraform_remote_state" "accounts" {
  backend = "s3"

  config = {
    bucket         = "anyvan-terraform-state-file-aws-accounts"
    key            = "iac-terraform-accounts/iac-terraform-accounts.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "anyvan-terraform-state-file-lock-aws-accounts"
  }
}

data "terraform_remote_state" "network" {
  backend   = "s3"
  workspace = "live-${var.vpc_environment}_vpc"

  config = {
    bucket         = "anyvan-terraform-state-file-aws-accounts"
    key            = "iac-terraform-network.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "anyvan-terraform-state-file-lock-aws-accounts"
  }
}