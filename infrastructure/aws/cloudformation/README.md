Commands:

To create a VPC:
./csye6225-aws-cf-create-stack.sh
./csye6225-aws-cf-create-stack.sh mystack dev us-east-1 10.0.4.0/24 10.0.5.0/24 10.0.6.0/24 10.0.0.0/16

To delete a VPC:
./csye6225-aws-cf-terminate-stack.sh

./csye6225-aws-cf-terminate-stack.sh "stackName" "profile" "region"
./csye6225-aws-cf-terminate-stack.sh mystack dev us-east-1

Example:

Creating:

Enter Stack Name. !!Make sure the stack name does not exists already!!
stack3
Your Current profile
dev
Supported Profiles : dev, prod
Enter the Profile to use
dev
Enter the Region. Ex: us-east-1
us-east-1
valid region : 
Enter subnet cidrblock 1. Ex : 10.0.1.0/24
10.0.1.0/24
Enter subnet cidrblock 2. Ex : 10.0.1.0/24
10.0.2.0/24
Enter subnet cidrblock 3. Ex : 10.0.1.0/24
10.0.3.0/24
Enter vpc cidrblock.. Ex : 10.0.0.0/16
10.0.0.0/16
Received Subnets. Validating template
10.0.1.0/24 is valid.
10.0.2.0/24 is valid.
10.0.3.0/24 is valid.
10.0.0.0/16 is valid.
all validations passed. Preparing for Cloud Formation.
Template is Correct. Please Wait.
Started with creating stack using cloud formation
Stack creation in progress. Please wait. Takes about 3 minutes
 :) .Stack creation complete. :)

Deleting:

Enter Stack Name
stack3
Your Current profile
dev
Enter the Profile to use
dev
Enter the Region
us-east-1
valid region : 
us-east-1c
us-east-1
Deleting the Stack
Stack Deleted

