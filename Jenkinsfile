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
                          userRemoteConfigs: [[url: GITHUB_REPO]]])
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker build -t "$DOCKER_IMAGE_BACKEND" ./server'
                    sh 'docker build -t "$DOCKER_IMAGE_FRONTEND" ./client'
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
                            docker push "$DOCKER_IMAGE_BACKEND"
                            docker push "$DOCKER_IMAGE_FRONTEND"
                        """
                    }
                }
            }
        }

        stage('Setup and Deploy on EC2') {
            steps {
                script {
                    withCredentials([
                        sshUserPrivateKey(credentialsId: 'quizit-ssh', keyFileVariable: 'SSH_KEY_FILE'),
                        usernamePassword(credentialsId: 'mongo-credentials', usernameVariable: 'MONGO_USER', passwordVariable: 'MONGO_PASS')
                    ]) {
                        def MONGO_URI = "mongodb+srv://${MONGO_USER}:${MONGO_PASS}@cluster0.3arcf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
                        
                        sh """
                            ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$EC2_USER@$EC2_IP" '
                                set -e  # Exit on error

                                # Update and install necessary dependencies
                                sudo apt-get update -y
                                sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

                                # Ensure Docker is installed
                                if ! command -v docker &> /dev/null; then
                                    curl -fsSL https://get.docker.com | sudo sh
                                    sudo systemctl enable docker
                                    sudo systemctl start docker
                                fi

                                # Ensure Docker Compose is installed
                                if ! command -v docker-compose &> /dev/null; then
                                    sudo apt install docker-compose -y
                                fi

                                # Add current user to the Docker group
                                sudo usermod -aG docker \$USER

                                # Setup repository directory
                                mkdir -p $REPO_DIR
                                cd $REPO_DIR

                                # Clone or update repository
                                if [ -d "$REPO_DIR/.git" ]; then
                                    git fetch origin
                                    git reset --hard origin/main
                                else
                                    rm -rf $REPO_DIR
                                    git clone $GITHUB_REPO $REPO_DIR
                                fi

                                # Restore or create .env files
                                echo "SERVER_URL=http://$EC2_IP:8800" > $REPO_DIR/server/.env
                                echo "MONGO_URI=$MONGO_URI" >> $REPO_DIR/server/.env
                                echo "VITE_API_URL=http://$EC2_IP:8800" > $REPO_DIR/client/.env

                                # Create docker-compose.yml file
                                cat > $REPO_DIR/docker-compose.yml << EOC
version: "3"
services:
  backend:
    image: $DOCKER_IMAGE_BACKEND
    ports:
      - "8800:8800"
    env_file:
      - ./server/.env
    restart: unless-stopped

  frontend:
    image: $DOCKER_IMAGE_FRONTEND
    ports:
      - "5173:5173"
    env_file:
      - ./client/.env
    depends_on:
      - backend
    restart: unless-stopped
EOC

                                # Pull latest images and clean up unused containers
                                docker system prune -f
                                docker-compose pull
                                docker-compose down
                                docker-compose up -d
                            '
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Deployment Successful!"
        }
        failure {
            echo "Deployment Failed! Check logs for errors."
        }
    }
}
