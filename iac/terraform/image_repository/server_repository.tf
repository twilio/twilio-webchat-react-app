module "ecr_repository" {
  source  = "terraform-registry.anyvan.com/anyvan/ecr_repository/aws"
  version = "1.1.0"

  providers = {
    aws = aws.horizontal
  }
  ecr_repository_name       = "${var.app_name}/twilio-webchat-server"
  allow_cross_account_fetch = true

  lifecycle_policy = <<EOF
    {
      "rules": [
        {
          "description": "prevent removing latest two production images",
          "rulePriority": 1,
          "action": {
            "type": "expire"
          },
          "selection": {
            "countType": "imageCountMoreThan",
            "countNumber": 2,
            "tagStatus": "tagged",
            "tagPatternList": [
              "production*"
            ]
          }
        },
        {
          "description": "prevent removing latest two staging images",
          "rulePriority": 2,
          "action": {
            "type": "expire"
          },
          "selection": {
            "countType": "imageCountMoreThan",
            "countNumber": 2,
            "tagStatus": "tagged",
            "tagPatternList": [
              "staging*"
            ]
          }
        },
        {
          "description": "remove old pull_request images",
          "rulePriority": 3,
          "action": {
            "type": "expire"
          },
          "selection": {
            "countType": "sinceImagePushed",
            "countUnit": "days",
            "countNumber": 14,
            "tagStatus": "tagged",
            "tagPrefixList": [
              "pull_request"
            ]
          }
        },
        {
          "description": "remove any old images over 1 year",
          "rulePriority": 10,
          "action": {
            "type": "expire"
          },
          "selection": {
            "tagStatus": "any",
            "countType": "sinceImagePushed",
            "countUnit": "days",
            "countNumber": 365
          }
        }
      ]
    }
  EOF
}
