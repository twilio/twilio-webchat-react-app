variable "region" {
  type        = string
  description = "Default region for AWS"
}
variable "env" {
  type        = string
  description = "Default environment for AWS"
}
variable "profile" {
  type        = string
  description = "Default profile for AWS"
}
variable "ecr_registry_id" {
  type    = string
  default = "331151898531"
}
variable "ecr_repository_name" {
  type = string
}
variable "create_ecr_repository" {
  type    = bool
  default = true
}

variable "vpc_environment" {
  type        = string
  description = "Which of the shared VPCs to deploy into."

  validation {
    condition     = contains(["development", "staging", "production"], var.vpc_environment)
    error_message = "Valid values for vpc_environment are: development, staging, production."
  }
}
variable "terraform_version" {
  type        = string
  description = "Version of terraform to use"
}
variable "commit_hash" {
  type        = string
  description = "Github commit hash"
}
variable "webchat_widget_name" {
  type        = string
  description = "The name of the webchat widget"
  default     = "twilio-webchat-widget"
}

variable "jira_ticket_number" {
  type        = string
  default     = ""
  description = "Jira ticket number that we are using to build a stack in Staging for a particular PR"
}

variable "git_sha" {
  type        = string
  default     = ""
  description = "Git SHA for the current commit"
}

variable "application_container_image_url" {
  type        = string
  description = "URL of the application container image in ECR"
}

variable "server_container_image_url" {
  type        = string
  description = "URL of the server container image in ECR"
}

variable "client_container_image_url" {
  type        = string
  description = "URL of the client container image in ECR"
}

variable "aws_region" {
  type    = string
  default = "eu-west-1"
}

variable "internal_fqdn" {
  type        = string
  default     = ""
  description = "Internal FQDN (private endpoint)"
}

variable "server_internal_fqdn" {
  type        = string
  default     = ""
  description = "Server internal FQDN (private endpoint)"
}

variable "client_internal_fqdn" {
  type        = string
  default     = ""
  description = "Client internal FQDN (private endpoint)"
}

variable "external_fqdn" {
  type        = string
  description = "External FQDN (public endpoint)"
}

variable "fargate_task_cpu" {
  type        = number
  description = "The size of CPU (in Amazon units) to give to the Fargate task. By default, set using environmental variables"
}

variable "fargate_task_memory" {
  type        = number
  description = "The amount of memory (in MB) to give to the Fargate task. By default, set using environmental variables"
}
variable "squad" {
  type    = string
  default = "lions"
}
variable "slack_channel_web_hook" {
  type      = string
  default   = ""
  sensitive = true
}
