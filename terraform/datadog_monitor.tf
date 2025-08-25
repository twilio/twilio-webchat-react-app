locals {
  team                  = var.squad
  critical_threshold    = 2
  notification_channels = format("%s%s", (var.env == "production" ? "@slack-alerting-centralised " : ""), (local.is_pr_env) ? "@lions-alerts-test" : "@lions_alerts")
  datadog_logs_url      = "https://app.datadoghq.eu/logs?query=service%3A${var.webchat_widget_name}%20env%3A${local.environment_name}%20&cols=host%2Cservice&index=%2A&messageDisplay=inline&refresh_mode=sliding&stream_sort=desc&viz=stream&live=false"
}

module "error_logs_monitor" {
  source  = "terraform-registry.anyvan.com/anyvan/datadog_monitor/aws"
  version = "~> 1.0"

  name               = "Anyvan ${var.webchat_widget_name} Exceptions - ${local.environment_name}"
  message            = "An exception occurred in ${var.webchat_widget_name} logs ${local.notification_channels}${var.env == "production" ? " | @${local.team}-engineers" : ""} \n\n Log message: {{ log.message }} \n\n For more details please check latests logs: \n [Datadog](${local.datadog_logs_url})"
  type               = "log alert"
  query              = "logs(\"service:${var.webchat_widget_name} env:${local.environment_name} status:(error)\").index(\"*\").rollup(\"count\").last(\"15m\") > ${local.critical_threshold}"
  critical_threshold = local.critical_threshold
  enable_logs_sample = true
  tags = [
    "env:${var.env}",
    "team:${local.team}",
    "service:${var.webchat_widget_name}"
  ]
  priority = 3
}

module "cpu_monitor" {
  source  = "terraform-registry.anyvan.com/anyvan/datadog_monitor/aws"
  version = "~> 1.0"

  name               = "Anyvan ${var.webchat_widget_name} CPU usage monitor - ${local.environment_name}"
  message            = "CPU usage of ${var.webchat_widget_name} ${local.notification_channels}${var.env == "production" ? " | @${local.team}-engineers" : ""}"
  type               = "query alert"
  query              = "avg(last_5m):avg:aws.ecs.service.cpuutilization{servicename:${module.app.service_name}} > 90"
  critical_threshold = 90
  notify_no_data     = true
  no_data_timeframe  = 20 // There is a 15+ mins delay in receiving ECS metrices on Datadog
  tags = [
    "env:${var.env}",
    "team:${local.team}",
    "service:${var.webchat_widget_name}"
  ]
  priority = 5
}


module "memory_monitor" {
  source  = "terraform-registry.anyvan.com/anyvan/datadog_monitor/aws"
  version = "~> 1.0"

  name               = "Anyvan ${var.webchat_widget_name} Memory usage monitor - ${local.environment_name}"
  message            = "Memory usage of ${var.webchat_widget_name} ${local.notification_channels}${var.env == "production" ? " | @${local.team}-engineers" : ""}"
  type               = "query alert"
  query              = "avg(last_5m):avg:aws.ecs.service.memory_utilization{servicename:${module.app.service_name}} > 90"
  critical_threshold = 90
  notify_no_data     = true
  no_data_timeframe  = 20 // There is a 15+ mins delay in receiving ECS metrices on Datadog
  tags = [
    "env:${var.env}",
    "team:${local.team}",
    "service:${var.webchat_widget_name}"
  ]
  priority = 5
}
