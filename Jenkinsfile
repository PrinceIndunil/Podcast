pipeline {
    agent any

    environment {
        GITHUB_REPO = 'https://github.com/PrinceIndunil/Podcast.git'
        DOCKER_IMAGE_BACKEND = 'loveprince423/tube-server'
        DOCKER_IMAGE_FRONTEND = 'loveprince423/tube-client'
        EC2_USER = 'ubuntu'
        EC2_IP = '13.60.226.71'
        REPO_DIR = '~/Podcast-Deploy' 
    }

    stages {
        stage('Setup and Deploy on EC2') {
            steps {
                script {
                    withCredentials([
                        sshUserPrivateKey(credentialsId: 'quizit-ssh', keyFileVariable: 'SSH_KEY_FILE'),
                        usernamePassword(credentialsId: 'quizit-dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
                    ]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$EC2_USER@$EC2_IP" <<EOF
                            # Ensure dependencies are installed
                            sudo apt-get update -y
                            sudo apt-get install -y git docker.io

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
                            
                            # Set up environment files with correct variable names and ports
                            if [ ! -f $REPO_DIR/server/.env ]; then
                                echo "Creating .env file for backend..."
                                # Changed API_KEY to SERVER_URL with appropriate backend port
                                echo "SERVER_URL=http://${EC2_IP}:8800" > $REPO_DIR/server/.env
                            fi
                            
                            # Set frontend env to point to backend API port (8800)
                            echo "VITE_API_URL=http://${EC2_IP}:8800" > $REPO_DIR/client/.env
                            
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
    restart: always

  frontend:
    image: ${DOCKER_IMAGE_FRONTEND}
    ports:
      - "80:80"
    env_file:
      - ./client/.env
    depends_on:
      - backend
    restart: always
EOC
                            fi
                            
                            # Build and push Docker images
                            cd $REPO_DIR
                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                            
                            # Build backend image
                            docker build -t "$DOCKER_IMAGE_BACKEND" ./server
                            docker push "$DOCKER_IMAGE_BACKEND"
                            
                            # Build frontend image
                            docker build -t "$DOCKER_IMAGE_FRONTEND" ./client
                            docker push "$DOCKER_IMAGE_FRONTEND"
                            
                            # Deploy using docker-compose
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