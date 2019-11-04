#!/bin/bash

cd /home/centos/webapp/
npm install

nohup node server.js >> app.log 2>&1 &

echo "starting application on 3001"