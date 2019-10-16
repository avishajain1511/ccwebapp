echo "Enter Stack Name. !!Make sure the stack name does not exists already!!"
StackName=$1
echo "Your Current profile"
echo $AWS_PROFILE
echo "Supported Profiles : dev, prod"
echo "Enter the Profile to use"
profile=$2
AWS_PROFILE=$profile

if [[ "$AWS_PROFILE" = "dev" ]];then
  AWS_DEFAULT_REGION="us-east-1"
  export AWS_PROFILE="dev"
elif [[ "$AWS_PROFILE" = "prod" ]];then
  AWS_DEFAULT_REGION="us-east-2"
  export AWS_PROFILE="prod"
else
  echo "Not a valid profile"
  echo "valid profiles are : prod , dev"
  exit 1
fi

echo "Enter the Region. Ex: us-east-1"
region=$3
if [ "$region" = "$AWS_DEFAULT_REGION" ];then
  echo "valid region : "
  export AWS_DEFAULT_REGION="$region"
  awalabilityZonea="$AWS_DEFAULT_REGION"a
  awalabilityZoneb="$AWS_DEFAULT_REGION"b
  awalabilityZonec="$AWS_DEFAULT_REGION"c
else
  echo "Not a valid region"
  echo "region supported for this profile: "
  echo $AWS_DEFAULT_REGION
  exit 1
fi

echo "Enter subnet cidrblock 1. Ex : 10.0.1.0/24"
CidrBlock1=$4
echo "Enter subnet cidrblock 2. Ex : 10.0.2.0/24"
CidrBlock2=$5
echo "Enter subnet cidrblock 3. Ex : 10.0.3.0/24"
CidrBlock3=$6
echo "Enter vpc cidrblock.. Ex : 10.0.0.0/16"
VPCCidrBlock=$7
echo "Received Subnets. Validating template"
SUBNETREGEX="^([0-9]{1,3}\\.){3}[0-9]{1,3}[\/]{1}([0-9]|[2][4])?$"
REGEX="^([0-9]{1,3}\\.){3}[0-9]{1,3}[\/]{1}([0-9]|[1][6])?$"


if echo $CidrBlock1 | grep -qP "$SUBNETREGEX" ; then
  echo "$CidrBlock1 is valid."
else
  echo "$CidrBlock1 Error! Cidr is not valid."
  exit 1
fi

if echo $CidrBlock2 | grep -qP "$SUBNETREGEX" ; then
  echo "$CidrBlock2 is valid."
else
  echo "$CidrBlock2 Error! Cidr is not valid."
  exit 1
fi

if echo $CidrBlock3 | grep -qP "$SUBNETREGEX" ; then
  echo "$CidrBlock3 is valid."
else
  echo "$CidrBlock3 Error! Cidr is not valid."
  exit 1
fi

if echo $VPCCidrBlock | grep -qP "$REGEX" ; then
  echo "$VPCCidrBlock is valid."
else
  echo "$VPCCidrBlock Error! Cidr is not valid."
  exit 1
fi

echo "all validations passed. Preparing for Cloud Formation."
RC=$(aws cloudformation validate-template --template-body file://./csye6225-cf-networking.json)

if [ $? -eq 0 ]
then
	echo "Template is Correct. Please Wait."
else
	echo "Ah OH! Invalid Template. Please refer the manual"
	exit 0
fi

RC1=$(aws cloudformation create-stack --stack-name $StackName --template-body file://./csye6225-cf-networking.json --parameters ParameterKey=VPCNAME,ParameterValue=$StackName-csye6225-vpc ParameterKey=IGWNAME,ParameterValue=$StackName-csye6225-IG ParameterKey=PUBLICROUTETABLENAME,ParameterValue=$StackName-csye6225-rt ParameterKey=subnetname1,ParameterValue=$StackName-csye6225-subnetname1 ParameterKey=subnetname2,ParameterValue=$StackName-csye6225-subnetname2 ParameterKey=subnetname3,ParameterValue=$StackName-csye6225-subnetname3 ParameterKey=CidrBlock1,ParameterValue=$CidrBlock1 ParameterKey=CidrBlock2,ParameterValue=$CidrBlock2 ParameterKey=CidrBlock3,ParameterValue=$CidrBlock3 ParameterKey=VPCCidrBlock,ParameterValue=$VPCCidrBlock ParameterKey=awalabilityZonea,ParameterValue=$awalabilityZonea ParameterKey=awalabilityZoneb,ParameterValue=$awalabilityZoneb ParameterKey=awalabilityZonec,ParameterValue=$awalabilityZonec)
if [ $? -eq 0 ]
then
	echo "Started with creating stack using cloud formation"
else
	echo "Stack Formation Failed"
	exit 0
fi

echo "Stack creation in progress. Please wait. Takes about 3 minutes"
aws cloudformation wait stack-create-complete --stack-name $StackName
STACKDETAILS=$(aws cloudformation describe-stacks --stack-name $StackName --query Stacks[0].StackId --output text)
if [ $? -eq 0 ]
then
	echo " :) .Stack creation complete. :)"
else
	echo "!!!!!!!!Not Created,Something went wrong"
	exit 0
fi