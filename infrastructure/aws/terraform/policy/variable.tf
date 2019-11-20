variable "env" {
description = "Which environment do you want (options: dev,prod):"
}

variable "aws_region"{
    type="string"
}
variable "s3_bucket_name" {
  type = "string"
}

variable "aws_accountid" {
  type = "string"
}

variable "aws_application_name" {
  type = "string"
}

variable "aws_circleci_user_name" {
  type = "string"
}

variable "aws_application_group" {
  type = "string"
}

variable "s3_bucket_name_application" {
  type = "string"
}