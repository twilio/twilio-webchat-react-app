resource "datadog_dashboard_json" "dashboard_json" {
  dashboard = <<EOF
{
    "title": "Twilio Webchat Widget - ${local.environment_name}",
    "description": "Twilio Webchat Widget Datadog dashboard",
    "widgets": [],
    "template_variables": [],
    "layout_type": "ordered",
    "notify_list": [],
    "reflow_type": "fixed"
}
    EOF
}