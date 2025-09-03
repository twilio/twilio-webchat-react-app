region               = "eu-west-1"
env                  = "production"
profile              = "production"
vpc_environment      = "production"
notify               = ["@slack-alerting-centralised"]
internal_fqdn        = "webchat-widget-internal.anyvan.com"
external_fqdn        = "webchat-widget.anyvan.com"
server_internal_fqdn = "webchat-widget-server-internal.anyvan.com"
client_internal_fqdn = "webchat-widget-client-internal.anyvan.com"
fargate_task_cpu     = 512
fargate_task_memory  = 1024


