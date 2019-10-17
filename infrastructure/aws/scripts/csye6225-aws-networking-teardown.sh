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

	#Getting vpcId
	echo "--Enter the VPC name to delete"


	read vpcName


        vpcid=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=${vpcName}" --query 'Vpcs[*].{id:VpcId}' | jq -r '.[] | .id') &&
        echo The vpc id is "$vpcid"
        VPC_CREATE_STATUS=$?
        echo  "VPC : "
        echo $VPC_CREATE_STATUS        

      if [ -z $vpcid ]; then
                echo " Please pass the correct vpc name"
                exit 1
        fi

	#Deleting  Subnet
	echo "Deleting Subnets"
	subnet=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=${vpcid}")
        
	subnetid1=$(echo -e "$subnet" | jq '.Subnets[0].SubnetId' | tr -d '"')
	subnetid2=$(echo -e "$subnet" | jq '.Subnets[1].SubnetId' | tr -d '"')
	subnetid3=$(echo -e "$subnet" | jq '.Subnets[2].SubnetId' | tr -d '"')
	aws ec2 delete-subnet --subnet-id $subnetid1
          
	aws ec2 delete-subnet --subnet-id $subnetid2
	aws ec2 delete-subnet --subnet-id $subnetid3

    #Getting route-id
    {

        Rname=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$vpcid" --query 'RouteTables[*].{id:Tags}' | jq -r '.[] | .id[].Value') &&
        echo Route table name is "$Rname"
    } && {
        Rid=$(aws ec2 describe-route-tables --filters "Name=tag:Name,Values=$Rname" --query 'RouteTables[*].{id:RouteTableId}' | jq -r '.[] | .id') &&
        
        echo Route table id is "$Rid"
    } || {
        echo "Route table not found. Exiting Script."
        exit 1
    }


    #Deleting route
    {
            aws ec2 delete-route --route-table-id $Rid --destination-cidr-block 0.0.0.0/0 &&
            echo "*Deleted Route*"
    } ||  {
            echo "Unable to delete Route. Exiting script."
            exit 1
    }

    #Deleting route-table
    {
            aws ec2 delete-route-table --route-table-id $Rid &&
            echo "*Deleted Route-Table*"
    } || {
            echo "Unable to delete the Route table. Exiting Script."
            exit 1
    }





    #Getting IG
    {
            Igid=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpcid" --query 'InternetGateways[*].{id:InternetGatewayId}' | jq -r '.[] | .id') &&
            echo Internet gateway ID is "$Igid"
    } || {
            echo "Internet gateway not found. Exiting the script."
            exit 1
    }

    #Dettaching IG
    {
            aws ec2 detach-internet-gateway --internet-gateway-id $Igid --vpc-id $vpcid &&
            echo "*Detached Internet-Gateway with VPC*"
    } || {
            echo "Error detaching the Internet Gateway. Exiting script."
            exit 1
    }
    #DEleting IG
    {
            aws ec2 delete-internet-gateway --internet-gateway-id $Igid &&
            echo "*Deleted Internet Gateway*"
    } || {
            echo "Error deleting Gateway. Exiting the script."
            exit 1
    }


	#Deleting VPCs
	{
		aws ec2 delete-vpc --vpc-id $vpcid &&
		echo "*Deleted VPC*"
	} || {
		echo "Error deleting VPC. Exiting Script."
		exit 1
	}
        
	echo "*Done!*"	
