echo "Enter Stack Name to delete! Make sure it exists."
StackName=$1
echo "Your Current profile"
echo $AWS_PROFILE
echo "Enter the Profile to use"
echo "Supported Profiles : dev, prod"
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
  echo "valid region"
  export AWS_DEFAULT_REGION="$region"
  awalabilityZonea="$AWS_DEFAULT_REGION"a
  awalabilityZoneb="$AWS_DEFAULT_REGION"b
  awalabilityZonec="$AWS_DEFAULT_REGION"c
else
  echo "Not a valid region"
  echo "region supported for this profile : "
  echo $AWS_DEFAULT_REGION
  exit 1
fi

RC=$(aws cloudformation describe-stacks --stack-name $StackName --query Stacks[0].StackId --output text)

if [ $? -eq 0 ]
then
	echo "Deleting the Stack!! It takes about 3 mins"
else
	echo "'$StackName' doesn't exist"
	exit 0
fi

RC1=$(aws cloudformation delete-stack --stack-name $StackName)
sleep 2m
if [ $? -eq 0 ]
then
	echo "Stack Deleted. :->"
else
	echo "Something Went Wrong"
	exit 0
fi