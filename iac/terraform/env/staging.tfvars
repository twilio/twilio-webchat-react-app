region               = "eu-west-1"
env                  = "staging"
prefix               = "stage"
profile              = "test1"
ecr_repository_name  = "twilio-webchat-widget/stage"
vpc_environment      = "staging"
notify               = ["@slack-alerting-centralised"]
internal_fqdn        = "stage-webchat-widget-internal.anyvan.com"
external_fqdn        = "webchat-widget-stg.anyvan.com"
server_internal_fqdn = "stage-webchat-widget-server-internal.anyvan.com"
client_internal_fqdn = "stage-webchat-widget-client-internal.anyvan.com"
fargate_task_cpu     = 256
fargate_task_memory  = 512

