pipeline {
    agent any

    environment {
        GITHUB_REPO = 'https://github.com/PrinceIndunil/Podcast.git'
        DOCKER_IMAGE_BACKEND = 'loveprince423/tube-server'
        DOCKER_IMAGE_FRONTEND = 'loveprince423/tube-client'
        EC2_USER = 'ubuntu'
        EC2_IP = '13.60.226.71'
        REPO_DIR = '/home/ubuntu/Podcast-Deploy'
    }

    stages {
        stage('Clone Repository on Jenkins') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']],
                          userRemoteConfigs: [[url: "${GITHUB_REPO}"]]])
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker build -t ${DOCKER_IMAGE_BACKEND} ./server'
                    sh 'docker build -t ${DOCKER_IMAGE_FRONTEND} ./client'
                }
            }
        }

        stage('Push Docker Images to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'quizit-dockerhub', 
                                  usernameVariable: 'DOCKER_USER', 
                                  passwordVariable: 'DOCKER_PASS')]) {
                        sh """
                            echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                            docker push ${DOCKER_IMAGE_BACKEND}
                            docker push ${DOCKER_IMAGE_FRONTEND}
                        """
                    }
                }
            }
        }

        stage('Setup and Deploy on EC2') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'quizit-ssh', keyFileVariable: 'SSH_KEY_FILE')]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no -i "${SSH_KEY_FILE}" "${EC2_USER}@${EC2_IP}" '
                                # Ensure dependencies are installed
                                sudo apt-get update -y
                                
                                # Check if Docker is installed, if not install it properly
                                if ! command -v docker &> /dev/null; then
                                    # Install Docker using the official script
                                    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
                                    curl -fsSL https://get.docker.com -o get-docker.sh
                                    sudo sh get-docker.sh
                                fi
                                
                                # Start Docker if not already running
                                sudo systemctl start docker
                                sudo systemctl enable docker
                                
                                # Install Docker Compose if not exists
                                if ! command -v docker-compose &> /dev/null; then
                                    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                                    sudo chmod +x /usr/local/bin/docker-compose
                                    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
                                fi
                                
                                # Setup repository directory
                                mkdir -p ${REPO_DIR}
                                
                                # Handle the repository - clean approach
                                if [ -d "${REPO_DIR}/.git" ]; then
                                    # Backup any existing .env files
                                    [ -f ${REPO_DIR}/client/.env ] && cp ${REPO_DIR}/client/.env ${REPO_DIR}/client/.env.backup
                                    [ -f ${REPO_DIR}/server/.env ] && cp ${REPO_DIR}/server/.env ${REPO_DIR}/server/.env.backup
                                    
                                    # Clean and update repository
                                    cd ${REPO_DIR}
                                    git fetch origin
                                    git reset --hard origin/main
                                    
                                    # Restore backups if they exist
                                    [ -f ${REPO_DIR}/client/.env.backup ] && cp ${REPO_DIR}/client/.env.backup ${REPO_DIR}/client/.env
                                    [ -f ${REPO_DIR}/server/.env.backup ] && cp ${REPO_DIR}/server/.env.backup ${REPO_DIR}/server/.env
                                else
                                    # Fresh clone
                                    rm -rf ${REPO_DIR}
                                    git clone ${GITHUB_REPO} ${REPO_DIR}
                                fi
                                
                                # Ensure server .env file exists with correct URL
                                echo "SERVER_URL=http://${EC2_IP}:8800" > ${REPO_DIR}/server/.env
                                
                                # Ensure client .env file exists with correct API URL
                                echo "VITE_API_URL=http://${EC2_IP}:8800" > ${REPO_DIR}/client/.env
                                
                                # Create docker-compose.yml file
                                cat > ${REPO_DIR}/docker-compose.yml << EOF
version: "3"
services:
  backend:
    image: ${DOCKER_IMAGE_BACKEND}
    ports:
      - "8800:8800"
    env_file:
      - ./server/.env
    restart: unless-stopped
  frontend:
    image: ${DOCKER_IMAGE_FRONTEND}
    ports:
      - "5173:5173"
    env_file:
      - ./client/.env
    depends_on:
      - backend
    restart: unless-stopped
EOF
                                
                                # Pull latest Docker images
                                docker pull "${DOCKER_IMAGE_BACKEND}"
                                docker pull "${DOCKER_IMAGE_FRONTEND}"
                                
                                # Deploy with docker-compose
                                cd ${REPO_DIR}
                                docker-compose down
                                docker-compose up -d
                            '
                        """
                    }
                }
            }
        }
    }
}