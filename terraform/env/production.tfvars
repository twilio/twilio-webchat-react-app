region              = "eu-west-1"
env                 = "production"
prefix              = "prod"
profile             = "production"
ecr_repository_name = "twilio-webchat-widget/prod"
vpc_environment     = "production"
notify              = ["@slack-alerting-centralised"]
internal_fqdn       = "webchat-widget-internal.anyvan.com"
external_fqdn       = "webchat-widget.anyvan.com"
fargate_task_cpu    = 512
fargate_task_memory = 1024


