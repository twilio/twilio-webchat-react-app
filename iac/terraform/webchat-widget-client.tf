module "webchat_client" {
  source  = "terraform-registry.anyvan.com/anyvan/ecs_project/aws"
  version = "~>1.6.2"

  app_name                        = "${var.webchat_widget_name}-client"
  env                             = var.env
  jira_ticket_number              = var.jira_ticket_number
  application_container_image_url = var.client_container_image_url
  commit_hash                     = var.git_sha
  region                          = var.aws_region
  profile                         = var.profile
  internal_fqdn                   = local.client_internal_fqdn

  cpu    = var.fargate_task_cpu
  memory = var.fargate_task_memory

  expose_internal = {
    container_port                    = 3000
    health_check_path                 = "/"
    health_check_grace_period_seconds = 300
    listener_port                     = 443
  }

  expose_external = {
    container_port                    = 3000
    health_check_path                 = "/"
    health_check_grace_period_seconds = 240
    listener_port                     = 443
  }

  task_permissions = {
    allow_sm = {
      sm_arns  = []
      key_arns = []
    }
    ecs_task_statements = []
  }

  env_variables = {
    NODE_ENV             = "production"
    PORT                 = "3000"
    REACT_APP_SERVER_URL = "https://${local.server_internal_fqdn}"
  }

  env_secrets      = {}
  enable_appconfig = false
  enable_database  = false

  providers = {
    aws            = aws
    aws.production = aws.production
  }
}
