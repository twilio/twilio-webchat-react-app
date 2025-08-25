data "aws_secretsmanager_secret" "twilio-secrets" {
  name = local.is_production ? "prod-twilio-flex-secret" : "stage-twilio-flex-secret"
}


