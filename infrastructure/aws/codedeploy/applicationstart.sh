#!/bin/bash

cd /home/centos/webapp/
npm install

nohup node server.js > output.log &

echo "starting application"