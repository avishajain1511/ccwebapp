Commands:

To create a VPC:
./csye6225-aws-cf-create-stack.sh

To delete a VPC:
./csye6225-aws-cf-terminate-stack.sh

Example:

Your Current profile
dev
Supported Profiles : dev, prod
Enter the Profile to use
dev
Enter the Region. Ex: us-east-1
us-east-1
valid region : 
Enter VPC Name
vpcname: any string for valid name
Enter VPC cidr block
Ex: 10.0.0.0/16 
Enter subnet name 1
subnet name: any string for valid name
Enter subnet cidrblock 1. Ex : 10.0.1.0/24
10.0.1.0/24
Enter subnet name 2
subnet name: any string for valid name
Enter subnet cidrblock 2. Ex : 10.0.1.0/24
10.0.2.0/24
Enter subnet name 3
subnet name: any string for valid name
Enter subnet cidrblock 3. Ex : 10.0.1.0/24
10.0.3.0/24

Creating VPC
Creating InternetGateway
Attaching the internet gateway to vpc
Received Subnets. Validating template
creating route table
subnet is associated with route table
subnet is associated with route table
subnet is associated with route table
Task completed successfully

Deleting:

Your Current profile
dev
Enter the Profile to use
dev
Enter the Region
us-east-1
valid region : 
us-east-1c
us-east-1
--Enter the VPC name to delete
Enter full name of VPC
Deleting Subnets
Deleted Route
Deleted Route-Table
Detached Internet-Gateway with VPC
Deleted Internet Gateway
Deleted VPC