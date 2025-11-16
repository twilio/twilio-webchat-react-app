locals {
  default_tags = {
    env               = var.env
    terraform_version = var.terraform_version
    squad             = "Lions"
    project           = "twilio-webchat-widget"
    service           = "webchat-widget"
    version           = var.commit_hash
  }

  is_pr_env     = var.env == "development"
  is_production = var.env == "production"


  environment_name = "${var.env}${var.jira_ticket_number}"
  suffix_map = {
    production = "",
    staging    = "-stg"
    testing    = "-dev${var.jira_ticket_number}"
  }

  internal_fqdn = var.env == "development" ? replace(var.internal_fqdn, "<jira-ticket-number>", var.jira_ticket_number) : var.internal_fqdn
  external_fqdn = var.env == "development" ? replace(var.external_fqdn, "<jira-ticket-number>", var.jira_ticket_number) : var.external_fqdn

  # Server and Client specific FQDNs
  server_internal_fqdn = var.env == "development" ? replace(var.server_internal_fqdn, "<jira-ticket-number>", var.jira_ticket_number) : var.server_internal_fqdn
  client_internal_fqdn = var.env == "development" ? replace(var.client_internal_fqdn, "<jira-ticket-number>", var.jira_ticket_number) : var.client_internal_fqdn
}
