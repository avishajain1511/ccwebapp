
variable "dependson" {
  default = []
}

resource "null_resource" "depends_on" {
  triggers = {
    dependson = "${join("", var.dependson)}"
  }
}

#getting subnet

data "aws_subnet_ids" "example" {
  vpc_id = "${var.vpc_id}"
  depends_on = [
    "null_resource.depends_on"
  ]
}

# #Creating web security group
/*
  Web Servers
*/
resource "aws_security_group" "web" {
  name        = "application_security_group"
  description = "Allow incoming HTTP connections."

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 32768
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 32768
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "WebServerSG"
  }
  vpc_id = "${var.vpc_id}"

}

#Creating db security group

/*
  Database Servers
*/

resource "aws_security_group" "db" {
    name = "database_security_group"
      vpc_id = "${var.vpc_id}"
    description = "Allow incoming database connections."

    ingress { # MySQL
        from_port = 3306
        to_port = 3306
        protocol = "tcp"
        security_groups = ["${aws_security_group.web.id}"]
    } 
    tags = {
      Name = "DatabaseSG"
    }
}
#Creating s3 bucket

/*
    S3 bucket
*/

resource "aws_s3_bucket" "b" {
  bucket        = "${var.s3_bucket_name}"
  acl           = "private"
  force_destroy = true
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "aws:kms"
      }
    }
  }
  tags = {
    Name        = "webap"
  }

  lifecycle_rule {
    enabled = "true"
    transition {
      days          = 30
      storage_class = "STANDARD_IA" # or "ONEZONE_IA"
    }
  }

}


resource "aws_db_subnet_group" "main" {
  name       = "main"
  subnet_ids = ["${element(tolist(data.aws_subnet_ids.example.ids), 0)}", "${element(tolist(data.aws_subnet_ids.example.ids), 1)}"]
  depends_on = [data.aws_subnet_ids.example]
  tags = {
    Name = "My DB subnet group"
  }
}


resource "aws_db_instance" "default" {
  allocated_storage         = 20
  engine                    = "mysql"
  engine_version            = "5.7"
  instance_class            = "db.t2.medium"
  name                      = "mydb"
  username                  = "dbuser"
  password                  = "Master123"
  parameter_group_name      = "default.mysql5.7"
  publicly_accessible       = "true"
  identifier                = "dbinstance1"
  multi_az                  = "false"
  db_subnet_group_name      = "${aws_db_subnet_group.main.name}"
  final_snapshot_identifier = "dbinstance1-final-snapshot"
  vpc_security_group_ids = ["${aws_security_group.db.id}"]
  skip_final_snapshot       = "true"

  depends_on = [aws_db_subnet_group.main]
}

# creating policies for circleci

resource "aws_iam_policy" "policy1" {
  name        = "CircleCI-Code-Deploy"
  description = "Code Deploy Policy for user circleci"
  policy      = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:RegisterApplicationRevision",
        "codedeploy:GetApplicationRevision"
      ],
      "Resource": [
        "arn:aws:codedeploy:${var.aws_region}:${var.aws_accountid}:application:${var.aws_application_name}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:CreateDeployment",
        "codedeploy:GetDeployment"
      ],
      "Resource": [
        "arn:aws:codedeploy:${var.aws_region}:${var.aws_accountid}:deploymentgroup:${var.aws_application_group}" 
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:GetDeploymentConfig"
      ],
      "Resource": [
        "arn:aws:codedeploy:${var.aws_region}:${var.aws_accountid}:deploymentconfig:${var.aws_application_group}",
        "arn:aws:codedeploy:${var.aws_region}:${var.aws_accountid}:deploymentconfig:CodeDeployDefault.OneAtATime",
        "arn:aws:codedeploy:${var.aws_region}:${var.aws_accountid}:deploymentconfig:CodeDeployDefault.HalfAtATime",
        "arn:aws:codedeploy:${var.aws_region}:${var.aws_accountid}:deploymentconfig:CodeDeployDefault.AllAtOnce"
      ]
    }
  ]
}
EOF
}


resource "aws_iam_policy" "policy2" {
  name        = "CircleCI-Upload-To-S3"
  description = "s3 upload Policy for user circleci"
  policy      = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}

EOF
}

resource "aws_iam_policy" "policy3" {
  name        = "circleci-ec2-ami"
  description = "EC2 access for user circleci"
  policy      = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
      "Effect": "Allow",
      "Action" : [
        "ec2:AttachVolume",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:CopyImage",
        "ec2:CreateImage",
        "ec2:CreateKeypair",
        "ec2:CreateSecurityGroup",
        "ec2:CreateSnapshot",
        "ec2:CreateTags",
        "ec2:CreateVolume",
        "ec2:DeleteKeyPair",
        "ec2:DeleteSecurityGroup",
        "ec2:DeleteSnapshot",
        "ec2:DeleteVolume",
        "ec2:DeregisterImage",
        "ec2:DescribeImageAttribute",
        "ec2:DescribeImages",
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:DescribeRegions",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSnapshots",
        "ec2:DescribeSubnets",
        "ec2:DescribeTags",
        "ec2:DescribeVolumes",
        "ec2:DetachVolume",
        "ec2:GetPasswordData",
        "ec2:ModifyImageAttribute",
        "ec2:ModifyInstanceAttribute",
        "ec2:ModifySnapshotAttribute",
        "ec2:RegisterImage",
        "ec2:RunInstances",
        "ec2:StopInstances",
        "ec2:TerminateInstances"
      ],
      "Resource" : "*"
  }]
}
EOF
}

resource "aws_iam_policy_attachment" "circleci-attach1" {
  name       = "circleci-attachment-codedeploy"
  users      = ["${var.aws_circleci_user_name}"]
  #roles      = ["${aws_iam_role.role.name}"]
  #groups     = ["${aws_iam_group.group.name}"]
  policy_arn = "${aws_iam_policy.policy1.arn}"
  depends_on = [aws_iam_policy.policy1]
}

resource "aws_iam_policy_attachment" "circleci-attach2" {
  name       = "circleci-attachment-uploadtos3"
  users      = ["${var.aws_circleci_user_name}"]
  #roles      = ["${aws_iam_role.role.name}"]
  #groups     = ["${aws_iam_group.group.name}"]
  policy_arn = "${aws_iam_policy.policy2.arn}"
  depends_on = [aws_iam_policy.policy2]
}

resource "aws_iam_policy_attachment" "circleci-attach3" {
  name       = "circleci-attachment-ec2-ami"
  users      = ["${var.aws_circleci_user_name}"]
  #roles      = ["${aws_iam_role.role.name}"]
  #groups     = ["${aws_iam_group.group.name}"]
  policy_arn = "${aws_iam_policy.policy3.arn}"
  depends_on = [aws_iam_policy.policy3]
}

# policy for ec2

resource "aws_iam_policy" "policy4" {
  name        = "CodeDeploy-EC2-S3"
  description = "EC2 s3 access policy"
  policy      = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:Get*",
                "s3:List*",
                "s3:Put*",
                "s3:Delete*"
            ],
            "Effect": "Allow",
            "Resource": "*"
        }
    ]
}
EOF
}

resource "aws_iam_policy" "policy5" {
  name        = "Cloudwatchagent-server-policy"
  description = "Permissions required to use AmazonCloudWatchAgent on servers"
  policy      = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudwatch:PutMetricData",
                "ec2:DescribeVolumes",
                "ec2:DescribeTags",
                "logs:PutLogEvents",
                "logs:DescribeLogStreams",
                "logs:DescribeLogGroups",
                "logs:CreateLogStream",
                "logs:CreateLogGroup"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameter"
            ],
            "Resource": "arn:aws:ssm:::parameter/AmazonCloudWatch-*"
        }
    ]
}
EOF
}

resource "aws_iam_policy" "policy6" {
  name        = "SSM-policy"
  description = "The policy for Amazon EC2 Role to enable AWS Systems Manager service core functionality"
  policy      = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:DescribeAssociation",
                "ssm:GetDeployablePatchSnapshotForInstance",
                "ssm:GetDocument",
                "ssm:DescribeDocument",
                "ssm:GetManifest",
                "ssm:GetParameter",
                "ssm:GetParameters",
                "ssm:ListAssociations",
                "ssm:ListInstanceAssociations",
                "ssm:PutInventory",
                "ssm:PutComplianceItems",
                "ssm:PutConfigurePackageResult",
                "ssm:UpdateAssociationStatus",
                "ssm:UpdateInstanceAssociationStatus",
                "ssm:UpdateInstanceInformation"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ssmmessages:CreateControlChannel",
                "ssmmessages:CreateDataChannel",
                "ssmmessages:OpenControlChannel",
                "ssmmessages:OpenDataChannel"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ec2messages:AcknowledgeMessage",
                "ec2messages:DeleteMessage",
                "ec2messages:FailMessage",
                "ec2messages:GetEndpoint",
                "ec2messages:GetMessages",
                "ec2messages:SendReply"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}

resource "aws_iam_role" "role1" {
  name = "CodeDeployEC2ServiceRole"
  description = "Allows EC2 instances to call AWS services on your behalf"

  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "ec2.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
}
EOF
}

resource "aws_codedeploy_app" "app" {
  name = "csye6225-webapp"
}

resource "aws_codedeploy_deployment_group" "example" {
    depends_on = [aws_codedeploy_app.app]

  app_name="csye6225-webapp"
  deployment_group_name="csye6225-webapp-deployment"
  service_role_arn       = "${aws_iam_role.role2.arn}"
  deployment_config_name = "CodeDeployDefault.AllAtOnce"
  deployment_style {
    deployment_type   = "IN_PLACE"
    deployment_option = "WITHOUT_TRAFFIC_CONTROL"
  }

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }
ec2_tag_set {
  ec2_tag_filter {
    key   = "name"
    type  = "KEY_AND_VALUE"
    value = "Codedeploy_ec2"
  }
}

}


resource "aws_iam_role_policy_attachment" "role1-attach4" {
  role       = "${aws_iam_role.role1.name}"
  policy_arn = "${aws_iam_policy.policy4.arn}"
}

resource "aws_iam_role_policy_attachment" "role1-attach5" {
  role       = "${aws_iam_role.role1.name}"
  policy_arn = "${aws_iam_policy.policy5.arn}"
}

resource "aws_iam_role_policy_attachment" "role1-attach6" {
  role       = "${aws_iam_role.role1.name}"
  policy_arn = "${aws_iam_policy.policy6.arn}"
}

resource "aws_iam_instance_profile" "role1_profile" {
  name = "CodeDeployEC2ServiceRole"
  role = "${aws_iam_role.role1.name}"
}

resource "aws_iam_role" "role2" {
  name = "CodeDeployServiceRole"
  description = "Allows CodeDeploy to call AWS services such as Auto Scaling on your behalf"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "codedeploy.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}


resource "aws_iam_role_policy_attachment" "codedeploy_service" {
  role       = "${aws_iam_role.role2.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
}

resource "aws_s3_bucket" "code_deploy" {
  bucket        = "${var.s3_bucket_name_application}"
  acl           = "private"
  force_destroy = true
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "aws:kms"
      }
    }
  }
  tags = {
    Name        = "codedeploy"
  }

  lifecycle_rule {
    enabled = "true"
    noncurrent_version_expiration {
      days = 60
    }
    expiration {
      days = 60
    }
  }

}

resource "aws_instance" "web-1" {
  ami               = "${var.ami_id}"
  instance_type     = "t2.micro"
  key_name          = "${var.key_name}"
  #user_data         = "${file("install_codedeploy_agent.sh")}"
  #echo host=${var.end_point} >> .env
  user_data         = <<-EOF
                      #!/bin/bash -ex
                      exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
                      echo BEGIN
                      date '+%Y-%m-%d %H:%M:%S'
                      echo END
                      sudo yum update -y
                      sudo yum install ruby -y
                      sudo yum install wget -y
                      cd /home/centos
                      wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
                      chmod +x ./install
                      sudo ./install auto
                      sudo service codedeploy-agent status
                      sudo service codedeploy-agent start
                      sudo service codedeploy-agent status
                      echo host=${aws_db_instance.default.address} >> .env
                      echo bucket=${var.s3_bucket_name} >> .env
                      chmod 777 .env
                      mkdir webapp
                      chmod 777 webapp
  EOF
  ebs_block_device {
    device_name           = "/dev/sda1"
    volume_size           = "20"
    volume_type           = "gp2"
    delete_on_termination = "true"
  }
  iam_instance_profile="${aws_iam_instance_profile.role1_profile.name}"


  tags = {
    name = "Codedeploy_ec2"
  }
  vpc_security_group_ids = ["${aws_security_group.web.id}"]

  associate_public_ip_address = true
  source_dest_check           = false
  subnet_id                   = "${element(tolist(data.aws_subnet_ids.example.ids), 0)}"
  depends_on=["aws_db_instance.default"]
}

