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
        stage('Clone Repository') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'quizit-ssh', keyFileVariable: 'SSH_KEY_FILE')]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$EC2_USER@$EC2_IP" <<EOF
                            # Ensure dependencies are installed
                            sudo apt-get update -y
                            sudo apt-get install -y git docker.io

                            # Remove existing repo if needed
                            rm -rf $REPO_DIR

                            # Clone the repository
                            git clone ${GITHUB_REPO} $REPO_DIR
EOF
                        """
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker build -t "$DOCKER_IMAGE_BACKEND" ./server'
                    sh 'docker build -t "$DOCKER_IMAGE_FRONTEND" ./frontend'
                }
            }
        }

        stage('Push Docker Images to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'quizit-dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh """
                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                            docker push "$DOCKER_IMAGE_BACKEND"
                            docker push "$DOCKER_IMAGE_FRONTEND"
                        """
                    }
                }
            }
        }

        stage('Setup and Clone on EC2') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'quizit-ssh', keyFileVariable: 'SSH_KEY_FILE')]) {
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
EOF
                        """
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'quizit-ssh', keyFileVariable: 'SSH_KEY_FILE')]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$EC2_USER@$EC2_IP" <<EOF
                                # Navigate to repo
                                cd $REPO_DIR

                                # Ensure .env file for backend exists
                                if [ ! -f server/.env ]; then
                                    echo "Creating .env file for backend..."
                                    echo "API_KEY=your_value_here" > server/.env  # Replace with actual values
                                fi

                                # Ensure frontend .env file exists
                                echo "VITE_API_URL=http://${EC2_IP}:5173" > frontend/.env

                                # Build frontend
                                cd frontend
                                rm -rf dist node_modules
                                npm install
                                npm run build

                                # Pull latest Docker images
                                docker pull "$DOCKER_IMAGE_BACKEND"
                                docker pull "$DOCKER_IMAGE_FRONTEND"

                                # Restart containers
                                cd $REPO_DIR
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
