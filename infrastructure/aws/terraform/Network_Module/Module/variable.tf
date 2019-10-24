variable "env" {
description = "Which environment do you want (options: dev,prod):"
} 
variable aws_region{
    type="string"
}
variable "vpcname" {
    type="string"
}
variable "vpcCidrBlock" {
  type="string"
}


variable "SubnetZones" {
  type= "list"

}


variable "SubnetCidrBlock" {
  type = "list"

  default=[
    "10.0.4.0/24",
    "10.0.2.0/24",
    "10.0.3.0/24"
  ]
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

