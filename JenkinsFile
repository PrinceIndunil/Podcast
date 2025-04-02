pipeline {
    agent any

    environment {
        GITHUB_REPO = 'https://github.com/PrinceIndunil/Podcast.git'
        DOCKER_IMAGE_BACKEND = 'loveprince423/tube-server'
        DOCKER_IMAGE_FRONTEND = 'loveprince423/tube-client'
        EC2_USER = 'ubuntu'
        EC2_IP = '16.171.200.66'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: "${GITHUB_REPO}"
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

        stage('Clone Repo on EC2') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'quizit-ssh', keyFileVariable: 'SSH_KEY_FILE')]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$EC2_USER@$EC2_IP" <<EOF
                            # Ensure dependencies are installed
                            sudo apt-get update -y
                            sudo apt-get install -y git docker.io docker-compose

                            # Clone or pull the latest repo
                            if [ -d "~/Quizit-Web-Project" ]; then
                                cd ~/Quizit-Web-Project
                                git pull
                            else
                                git clone ${GITHUB_REPO} ~/Quizit-Web-Project
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
                                cd ~/Quizit-Web-Project

                                # Update frontend .env file
                                echo "VITE_API_URL=http://${EC2_IP}:5173" > ~/Quizit-Web-Project/frontend/.env

                                # Build frontend
                                cd ~/Quizit-Web-Project/frontend
                                rm -rf dist node_modules
                                npm install
                                npm run build

                                # Pull latest Docker images
                                docker pull "$DOCKER_IMAGE_BACKEND"
                                docker pull "$DOCKER_IMAGE_FRONTEND"

                                # Start containers
                                cd ~/Quizit-Web-Project
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
