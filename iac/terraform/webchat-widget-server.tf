module "webchat_server" {
  source  = "terraform-registry.anyvan.com/anyvan/ecs_project/aws"
  version = "~>1.6.2"

  app_name                        = "${var.webchat_widget_name}-server"
  env                             = var.env
  jira_ticket_number              = var.jira_ticket_number
  application_container_image_url = var.server_container_image_url
  commit_hash                     = var.git_sha
  region                          = var.aws_region
  profile                         = var.profile
  internal_fqdn                   = local.server_internal_fqdn

  cpu    = var.fargate_task_cpu
  memory = var.fargate_task_memory

  expose_internal = {
    container_port                    = 3002
    health_check_path                 = "/initWebchat"
    health_check_grace_period_seconds = 300
    listener_port                     = 443
  }

  expose_external = {
    container_port                    = 3002
    health_check_path                 = "/initWebchat"
    health_check_grace_period_seconds = 240
    listener_port                     = 443
  }

  task_permissions = {
    allow_sm = {
      sm_arns = [
        data.aws_secretsmanager_secret.twilio-secrets.arn
      ]
      key_arns = []
    }
    ecs_task_statements = []
  }
  
  env_variables = {
    NODE_ENV = "production"
  }

  env_secrets      = {}
  enable_appconfig = false
  enable_database  = false

  providers = {
    aws            = aws
    aws.production = aws.production
  }
}
