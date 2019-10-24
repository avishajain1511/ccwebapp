

module "vpc" {
 
  source = "../../Network_Module/"

  vpcCidrBlock = "${var.vpcCidrBlock}"
  vpcname = "${var.vpcname}"
  SubnetZones = "${var.SubnetZones}"
  SubnetCidrBlock = "${var.SubnetCidrBlock}"
  env="${var.env}"
  aws_region="${var.aws_region}"
}

module "application" {

  source = "../../Application/"
 
  env="${var.env}"
  aws_region="${var.aws_region}"
  vpc_id="${module.vpc.vpc_id}"
  ami_id="${var.ami_id}"
  s3_bucket_name="${var.s3_bucket_name}"
  rds_identifier="${var.rds_identifier}"
  key_name="${var.key_name}"

  dependson = ["${module.vpc.subnet_id}"]

}

