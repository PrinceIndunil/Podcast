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
                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
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
                            ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$EC2_USER@$EC2_IP" <<'EOF'
                                # Ensure dependencies are installed
                                sudo apt-get update -y
                                sudo apt-get install -y git docker.io curl

                                # Start Docker if not already running
                                sudo systemctl start docker
                                sudo systemctl enable docker

                                # Install Docker Compose if not exists
                                if ! [ -x "\$(command -v docker-compose)" ]; then
                                    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
                                    sudo chmod +x /usr/local/bin/docker-compose
                                    sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
                                fi

                                # Clone or pull latest changes
                                if [ -d "$REPO_DIR/.git" ]; then
                                    cd $REPO_DIR
                                    git reset --hard
                                    git pull
                                else
                                    rm -rf $REPO_DIR
                                    git clone ${GITHUB_REPO} $REPO_DIR
                                fi

                                # Ensure backend .env file exists
                                if [ ! -f $REPO_DIR/server/.env ]; then
                                    echo "SERVER_URL=http://${EC2_IP}:8800" > $REPO_DIR/server/.env
                                fi

                                # Ensure frontend .env file exists
                                if ! grep -q "VITE_API_URL=" $REPO_DIR/client/.env; then
                                    echo "VITE_API_URL=http://${EC2_IP}:8800" >> $REPO_DIR/client/.env
                                fi

                                # Verify docker-compose.yml exists, or create a basic one if needed
                                if [ ! -f $REPO_DIR/docker-compose.yml ]; then
                                    echo "Creating docker-compose.yml file..."
                                    cat > $REPO_DIR/docker-compose.yml <<EOC
                                    version: '3'
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
                                    EOC
                                fi

                                # Pull latest Docker images
                                docker pull "${DOCKER_IMAGE_BACKEND}"
                                docker pull "${DOCKER_IMAGE_FRONTEND}"

                                # Restart containers
                                docker-compose down
                                docker-compose up -d
                            EOF
                        """
                    }
                }
            }
        }
    }
}
