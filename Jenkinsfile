pipeline {
    agent any

    environment {
        BACKEND_IMAGE = 'loveprince423/tube-server'
        FRONTEND_IMAGE = 'loveprince423/tube-client'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url:'https://github.com/PrinceIndunil/Podcast.git'
            }
        }

        stage('Set Docker Tag') {
            steps {
                script {
                    def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    echo "Git Commit Hash: ${commitHash}"
                    env.DOCKER_TAG = commitHash
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        script {
                            echo "Building Backend Docker Image: $BACKEND_IMAGE:$DOCKER_TAG"
                            def backendStatus = sh(script: "docker build -t $BACKEND_IMAGE:$DOCKER_TAG ./server", returnStatus: true)
                            if (backendStatus != 0) {
                                error "Backend Docker build failed!"
                            }
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        script {
                            echo "Building Frontend Docker Image: $FRONTEND_IMAGE:$DOCKER_TAG"
                            def frontendStatus = sh(script: "docker build -t $FRONTEND_IMAGE:$DOCKER_TAG ./client", returnStatus: true)
                            if (frontendStatus != 0) {
                                error "Frontend Docker build failed!"
                            }
                        }
                    }
                }
            }
        }

        stage('Stop and Remove Existing Containers') {
            steps {
                script {
                    echo "Stopping and removing existing containers..."
                    sh "docker stop tube-server-1 || true && docker rm tube-server-1 || true"
                    sh "docker stop tube-client-1 || true && docker rm tube-client-1 || true"
                }
            }
        }

        stage('Run Backend and Frontend Containers') {
            steps {
                script {
                    echo "Starting Backend Container..."
                    sh "docker run --rm -d --name tube-server-1 -p 8800:8800 $BACKEND_IMAGE:$DOCKER_TAG"

                    echo "Starting Frontend Container..."
                    sh "docker run --rm -d --name tube-client-1 -p 5173:5173 $FRONTEND_IMAGE:$DOCKER_TAG"
                }
            }
        }

        stage('Clean Up Unused Containers & Images') {
            steps {
                script {
                    echo "Cleaning up unused Docker resources..."
                    sh "docker container prune -f"
                    sh "docker image prune -f --filter 'dangling=true'"
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        echo "Logging into Docker Hub..."
                        sh "echo $DOCKER_PASS | docker login --username $DOCKER_USER --password-stdin"

                        echo "Pushing Backend Image..."
                        sh "docker push $BACKEND_IMAGE:$DOCKER_TAG"

                        echo "Pushing Frontend Image..."
                        sh "docker push $FRONTEND_IMAGE:$DOCKER_TAG"
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}