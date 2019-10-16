

module "vpc" {
 
  source = "../"

  vpcCidrBlock = "${var.vpcCidrBlock}"
  vpcname = "${var.vpcname}"
  SubnetZones = "${var.SubnetZones}"
  SubnetCidrBlock = "${var.Cidrblock}"
}