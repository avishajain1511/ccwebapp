Commands:

To create a VPC:
./csye6225-aws-networking-setup.sh dev us-east-1 myvpc 10.0.0.0/16 10.0.1.0/24 10.0.2.0/24 10.0.3.0/24

./csye6225-aws-networking-setup.sh prod us-east-2 myvpc 10.0.0.0/16 10.0.1.0/24 10.0.2.0/24 10.0.3.0/24

To delete a VPC:
./csye6225-aws-cf-terminate-stack.sh

./csye6225-aws-networking-teardown.sh "profile-name" "region"
ex. - ./csye6225-aws-networking-teardown.sh dev us-east-1

Example:

Your Current profile
dev
Supported Profiles : dev, prod

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
