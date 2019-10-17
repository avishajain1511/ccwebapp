
resource "aws_vpc" "first" {
 
  cidr_block = "${var.vpcCidrBlock}"
enable_dns_support ="true"
enable_dns_hostnames="true"
  tags = {
      Name = "${var.vpcname}"
  }
}

resource "aws_subnet" "first" {
  count = 3
  availability_zone = "${var.SubnetZones[count.index]}"
  cidr_block        = "${var.SubnetCidrBlock[count.index]}"
  vpc_id            = "${aws_vpc.first.id}"
  map_public_ip_on_launch="true"
  tags =   {
      Name = "${count.index}-csye6225-subnet"
  }
}
resource "aws_internet_gateway" "first" {
  vpc_id = "${aws_vpc.first.id}"

  tags = {
    Name = "terraform-eks-first"
  }
}

resource "aws_route_table" "first" {
  vpc_id = "${aws_vpc.first.id}"

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "${aws_internet_gateway.first.id}"
  }
  tags = {
    Name = "${var.vpcname}+routetable"
  }
}
resource "aws_route_table_association" "first" {
 
  count = 3

  subnet_id      = "${aws_subnet.first.*.id[count.index]}"
  route_table_id = "${aws_route_table.first.id}"
}