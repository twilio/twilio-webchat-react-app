variable "app_name" {
  type        = string
  description = "Name of the application. This will be used for configuring infrastructure "
}

variable "aws_region" {
  type    = string
  default = "eu-west-1"
}

variable "terraform_version" {
  type        = string
  description = "Version of Terraform to use"
}
