terraform {
  required_version = "~>1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~>5.60"
    }
  }

  backend "s3" {
    region         = "eu-west-1"                                     # this is the region where the bucket is created. It can be in a different region to where you deploy your resources.
    bucket         = "anyvan-terraform-state-file-aws-accounts"      # name of the bucket
    key            = "twilio-webchat-widget.tfstate"                 # name of the state file for this particular terraform stack
    dynamodb_table = "anyvan-terraform-state-file-lock-aws-accounts" # table where the lock is kept
  }
}

provider "aws" {
  region  = var.aws_region
  profile = "horizontal"
  alias   = "horizontal"

  default_tags {
    tags = {
      squad             = "lemurs"
      terraform_version = var.terraform_version
      service           = var.app_name
      env               = "horizontal"
      version           = "1.0"
    }
  }
}
