variable "vpcname"{
    type="string"
    }
variable aws_region{
    type="string"
    }
variable "subnetCount"{
  type="string"
}
variable "routetablename" {
  type="string"
}
variable "vpcCidrBlock" {
  type="string"
  
}

variable "env" {
description = "Which environment do you want (options: dev,prod):"
} 

variable "SubnetCidrBlock" {
  type = "list"
}

variable "SubnetZones" {
  type="list"
}



