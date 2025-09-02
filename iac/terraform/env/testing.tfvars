region               = "eu-west-1"
env                  = "testing"
prefix               = "test"
profile              = "test1"
ecr_repository_name  = "twilio-webchat-widget/testing"
vpc_environment      = "staging"
notify               = ["@slack-alerting-centralised"]
internal_fqdn        = "test-webchat-widget-internal-<jira-ticket-number>.anyvan.com"
external_fqdn        = "webchat-widget-test-<jira-ticket-number>.anyvan.com"
server_internal_fqdn = "test-webchat-widget-server-internal-<jira-ticket-number>.anyvan.com"
client_internal_fqdn = "test-webchat-widget-client-internal-<jira-ticket-number>.anyvan.com"
fargate_task_cpu     = 256
fargate_task_memory  = 512


