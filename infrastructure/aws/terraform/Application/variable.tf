variable "env" {
description = "Which environment do you want (options: dev,prod):"
}

variable "aws_region"{
    type="string"
}

variable "vpc_id" {
  type = "string"
}

variable "ami_id" {
  type = "string"
}

variable "s3_bucket_name" {
  type = "string"
}

variable "rds_identifier" {
  type = "string"
}

variable "key_name" {
  type = "string"
}

variable "num" {
  type = "string"
}



