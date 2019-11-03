#!/bin/bash

sudo chown centos /home/centos/webapp/
sudo touch /home/centos/webapp/myfile
sudo touch testfile
sudo mv /home/centos/.env /home/centos/webapp/


# sudo systemctl stop tomcat.service

# sudo rm -rf /opt/tomcat/webapps/docs  /opt/tomcat/webapps/examples /opt/tomcat/webapps/host-manager  /opt/tomcat/webapps/manager /opt/tomcat/webapps/ROOT

# sudo chown tomcat:tomcat /opt/tomcat/webapps/ROOT.war

# # cleanup log files
# sudo rm -rf /opt/tomcat/logs/catalina*
# sudo rm -rf /opt/tomcat/logs/*.log
# sudo rm -rf /opt/tomcat/logs/*.txt