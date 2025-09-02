module "datadog_service_definition_yaml" {
  source  = "terraform-registry.anyvan.com/anyvan/datadog_service_definition_yaml/aws"
  version = "~> 1.0"

  service_definition_yaml = <<EOF
schema-version: v2
dd-service: ${var.webchat_widget_name}
team: ${var.squad}
contacts:
  - name: Slack
    type: slack
    contact: https://anyvan.slack.com/archives/C03UNTP33RT
repos:
  - name: Webchat Widget source code
    provider: github
    url: https://github.com/anyvan/twilio-widgets
tags:
  - squad:${var.squad}
EOF
}