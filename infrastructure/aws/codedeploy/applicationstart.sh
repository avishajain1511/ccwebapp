#!/bin/bash

cd /home/centos/webapp/
npm install
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/centos/webapp/cloudwatch-config.json -s
sudo rm -r node_modules
sudo rm -r logs
sudo rm app.log

nohup node server.js >> app.log 2>&1 &

echo "starting application on 3001"