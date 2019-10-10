
resource "aws_vpc" "main" {
  count=2
  cidr_block = "${var.vpcCidrBlock}"

  tags = {
      Name = "${var.vpcname}"
  }
}
resource "aws_subnet" "main" {
  count = "${var.subnetCount}"
  availability_zone = "${var.SubnetZones[count.index]}"
  cidr_block        = "${var.SubnetCidrBlock[count.index]}"
  vpc_id            = "${aws_vpc.main.id}"
  map_public_ip_on_launch="true"
  tags =   {
      Name = "${count.index}-csye6225-subnet"
  }
}
resource "aws_internet_gateway" "main" {
  vpc_id = "${aws_vpc.main.id}"

  tags = {
    Name = "terraform-eks-main"
  }
}

resource "aws_route_table" "main" {
  vpc_id = "${aws_vpc.main.id}"

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "${aws_internet_gateway.main.id}"
  }
  tags = {
    Name = "${var.routetablename}+${var.vpcname}+routetable"
  }
}
resource "aws_route_table_association" "main" {
 
 count = "${var.subnetCount}"

  subnet_id      = "${aws_subnet.main.*.id[count.index]}"
  route_table_id = "${aws_route_table.main.id}"
}