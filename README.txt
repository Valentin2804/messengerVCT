Steps:
 1. Download and setup prerequisites
  - Download MySQL
  - Download Docker Desktop
  - Enable Kubernetes in Docker Desktop
  - Download kubectl
 2. Build an image of the project
  - Change the WORKDIR in the Dockerfile of the project
  - Open a Command Prompt
  - Go to the main directory of the project
  - Run "npm install" for downloading all the dependencies for node.js
  - Create the image using "docker build . -t <username>/<image_name>:<image_tag>"
 3. Setup
  - Assure that there is a MySQL user with name "root" and password "root"
  - Startup MySQL server service
  - Open the mainfest.yaml file and set the container image name in it with the image you previously created
  - Open a terminal
  - Run "kubectl apply -f <path_to_manifestyaml_file>"
  - Run "kubectl get services" to list all services
  - If there is a service called "nodejs-service", than the whole setup was successful
4. Open app
  - Open a browser on the host machine and type localhost:8080
  - If you want to open the app on a machine which is not the host machine:
	* Find the ip of the host machine
	* Type <host_machine_ip_address>:8080 in the browser