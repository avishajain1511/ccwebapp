STACK_NAME=$1
echo "Your Current profile"
echo $AWS_PROFILE
echo "Enter the Profile to use"
profile=$1
AWS_PROFILE=$profile

if [[ "$AWS_PROFILE" = "dev" ]];then
  AWS_DEFAULT_REGION="us-east-1"
  export AWS_PROFILE="dev"
elif [[ "$AWS_PROFILE" = "prod" ]];then
  AWS_DEFAULT_REGION="us-east-2"
  export AWS_PROFILE="prod"
  echo $AWS_PROFILE
else
  echo "Not a valid profile"
  echo "valid profiles are : prod , dev"
  exit 1
fi


echo "Enter the Region"
region=$2
if [ "$region" = "$AWS_DEFAULT_REGION" ];then
  echo "valid region : "
  export AWS_DEFAULT_REGION="$region"
  echo $region
else
  echo "Not a valid region"
  echo "region supported : "
  echo $AWS_DEFAULT_REGION
  exit 1
fi


echo "Enter VPC Name"
vpcname=$3
echo "Enter VPC cidr block"
vpccidrblock=$4
REGEX="^([0-9]{1,3}\\.){3}[0-9]{1,3}[\/]{1}([0-9]|[1][6])?$"
SUBNETREGEX="^([0-9]{1,3}\\.){3}[0-9]{1,3}[\/]{1}([0-9]|[2][4])?$"


if echo $vpccidrblock | grep -qP "$REGEX"; then
  echo "$vpccidrblock is valid."
else
  echo "$vpccidrblock Error! Cidr is not valid."
  exit 1
fi

# echo "Creating Subnet1"
echo "Enter CIDR block details for subnet1"
subnet1_cidr1=$5
echo "Enter availability zone"
subnet1_az1="$AWS_DEFAULT_REGION"a
echo $subnet1_az1

if echo $subnet1_cidr1 | grep -qP "$SUBNETREGEX"; then
  echo "$subnet1_cidr1 is valid."
else
  echo "$subnet1_cidr1 Error! Cidr is not valid."
  exit 1
fi


# echo "Creating Subnet2"
echo "Enter CIDR block details for subnet2"
subnet2_cidr2=$6
echo "Enter availability zone"
subnet2_az2="$AWS_DEFAULT_REGION"b
echo $subnet2_az2

if echo $subnet2_cidr2 | grep -qP "$SUBNETREGEX"; then
  echo "$subnet2_cidr2 is valid."
else
  echo "$subnet2_cidr2 Error! Cidr is not valid."
  exit 1
fi

# echo "Creating Subnet3"
echo "Enter CIDR block details for subnet3"
subnet3_cidr3=$7
echo "Enter availability zone"
subnet3_az3="$AWS_DEFAULT_REGION"c
echo $subnet3_az3
if echo $subnet3_cidr3 | grep -qP "$SUBNETREGEX"; then
  echo "$subnet3_cidr3 is valid."
else
  echo "$subnet3_cidr3 Error! Cidr is not valid."
  exit 1
fi

echo "Creating VPC"
VPCid=`aws ec2 create-vpc --cidr-block $vpccidrblock --query 'Vpc.VpcId' --output text`
 aws ec2 create-tags --resources $VPCid --tags Key=Name,Value=$vpcname-csye6225-vpc


VPC_CREATE_STATUS=$?
echo $VPC_CREATE_STATUS
if [ $VPC_CREATE_STATUS -ne 0 ]; then
  echo "Error:VPC not created!!"
  echo " $VPC_ID "
	exit $VPC_CREATE_STATUS
else
  echo "Vpc created-> Vpc Id:  "$VPCid
  echo " VPC ID '$VPC_ID' CREATED in '$region' region."
fi

subnet1_id=`aws ec2 create-subnet --vpc-id $VPCid --cidr-block $subnet1_cidr1 --availability-zone $subnet1_az1 --query 'Subnet.SubnetId' --output text`
aws ec2 create-tags --resources $subnet1_id --tags Key=Name,Value=$STACK_NAME-subnet1

SUBNET_CREATE_STATUS=$?
if [ $SUBNET_CREATE_STATUS -ne 0 ]; then
  echo "Error:subnet not created!!"
  echo " $subnet1_id "
	exit $SUBNET_CREATE_STATUS
fi

subnet2_id=`aws ec2 create-subnet --vpc-id $VPCid --cidr-block $subnet2_cidr2 --availability-zone $subnet2_az2 --query 'Subnet.SubnetId' --output text`
aws ec2 create-tags --resources $subnet2_id --tags Key=Name,Value=$STACK_NAME-subnet2

SUBNET_CREATE_STATUS=$?
if [ $SUBNET_CREATE_STATUS -ne 0 ]; then
  echo "Error:subnet not created!!"
  echo " $subnet2_id "
	exit $SUBNET_CREATE_STATUS
fi

subnet3_id=`aws ec2 create-subnet --vpc-id $VPCid --cidr-block $subnet3_cidr3 --availability-zone $subnet3_az3 --query 'Subnet.SubnetId' --output text`
aws ec2 create-tags --resources $subnet3_id --tags Key=Name,Value=$STACK_NAME-subnet3

SUBNET_CREATE_STATUS=$?
if [ $SUBNET_CREATE_STATUS -ne 0 ]; then
  echo "Error:subnet not created!!"
  echo " $subnet3_id "
	exit $SUBNET_CREATE_STATUS
fi

echo "Creating InternetGateway"
InternetGatewayId=`aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text`
aws ec2 create-tags --resources $InternetGatewayId --tags Key=Name,Value=$vpcname-csye6225-InternetGateway

echo "Attaching the internet gateway to vpc"
aws ec2 attach-internet-gateway --internet-gateway-id $InternetGatewayId --vpc-id $VPCid

echo "creating route table"
routeTableId=`aws ec2 create-route-table --vpc-id $VPCid --query 'RouteTable.RouteTableId' --output text`
aws ec2 create-tags --resources $routeTableId --tags Key=Name,Value=$vpcname-csye6225-public-route-table
SUBNET_CREATE_STATUS=$?
 
aws ec2 create-route --route-table-id $routeTableId --destination-cidr-block 0.0.0.0/0 --gateway-id $InternetGatewayId
SUBNET_CREATE_STATUS=$?

aws ec2 associate-route-table --subnet-id $subnet1_id --route-table-id $routeTableId
echo "subnet is associated with route table"
SUBNET_CREATE_STATUS=$?

aws ec2 associate-route-table --subnet-id $subnet2_id --route-table-id $routeTableId
echo "subnet is associated with route table"
SUBNET_CREATE_STATUS=$?

aws ec2 associate-route-table --subnet-id $subnet3_id --route-table-id $routeTableId
echo "subnet is associated with route table"

SUBNET_CREATE_STATUS=$?

echo "Task completed successfully"

