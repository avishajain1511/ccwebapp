#data "aws_availability_zones" "available" {
#  state = "available"
#}

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

resource "aws_instance" "web-1" {
  ami               = "${var.ami_id}"
  instance_type     = "t2.micro"
  # availability_zone = "${data.aws_availability_zones.available.names["${var.num}"]}"
  key_name          = "${var.key_name}"
  ebs_block_device {
    device_name           = "/dev/sda1"
    volume_size           = "20"
    volume_type           = "gp2"
    delete_on_termination = "true"
  }


  tags = {
    ame = "HelloWorld"
  }
  vpc_security_group_ids = ["${aws_security_group.web.id}"]

  associate_public_ip_address = true
  source_dest_check           = false
  subnet_id                   = "${element(tolist(data.aws_subnet_ids.example.ids), 0)}"
    depends_on=["aws_db_instance.default"]
}

resource "aws_dynamodb_table" "basic-dynamodb-table" {
  name           = "csye6225"
  hash_key       = "id"
  read_capacity  = 20
  write_capacity = 20
  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_eip" "web-1" {
  instance = "${aws_instance.web-1.id}"
  vpc      = true
}
