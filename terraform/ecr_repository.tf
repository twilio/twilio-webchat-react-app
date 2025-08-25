locals {
  ecr_keep_last_images_count = var.env == "production" ? 40 : 200
}

resource "aws_ecr_repository" "twilio_flex" {
  count    = var.create_ecr_repository ? 1 : 0
  name     = var.ecr_repository_name
  provider = aws.horizontal

  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = tomap({ "Name" = var.ecr_repository_name })
}

resource "aws_ecr_repository_policy" "twilio_flex" {
  policy     = data.aws_iam_policy_document.allows_other_accounts_to_retrieve.json
  repository = aws_ecr_repository.twilio_flex[0].name
  provider   = aws.horizontal
}

data "aws_iam_policy_document" "allows_other_accounts_to_retrieve" {
  statement {
    sid    = "CrossAccountRetrievalPermission"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer"
    ]
    principals {
      type = "AWS"
      identifiers = [
        for account_id in data.terraform_remote_state.accounts.outputs.aws_accounts_ids : "arn:aws:iam::${account_id}:root"
      ]
    }
  }

  statement {
    sid    = "LambdaECRCrossAccountRerievalPermission"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer"
    ]
    principals {
      type = "Service"
      identifiers = [
        "lambda.amazonaws.com"
      ]
    }
    condition {
      test     = "StringLike"
      variable = "aws:sourceArn"
      values = [
        for account_id in data.terraform_remote_state.accounts.outputs.aws_accounts_ids : "arn:aws:lambda:${var.region}:${account_id}:function:*"
      ]
    }
  }
}

resource "aws_ecr_lifecycle_policy" "twilio_flex" {
  repository = aws_ecr_repository.twilio_flex[0].name

  policy = templatefile("${path.module}/files/ecr_retention_policies.json", {
    countLastImages = local.ecr_keep_last_images_count
  })

  provider = aws.horizontal
}
