pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'modern-storefront'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        REGISTRY = 'your-docker-registry.io'
        NODE_VERSION = '18'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    npm ci
                '''
            }
        }

        stage('Lint') {
            steps {
                sh '''
                    npm run lint
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    npm run build
                '''
            }
        }

        stage('Build & Tag Docker Image') {
            steps {
                script {
                    docker.build(
                        "${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}",
                        "."
                    )
                    docker.image("${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}").tag("${REGISTRY}/${DOCKER_IMAGE}:latest")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry("https://${REGISTRY}", 'docker-registry-credentials') {
                        docker.image("${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                        docker.image("${REGISTRY}/${DOCKER_IMAGE}:latest").push()
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    echo "Deploying ${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                    # Add your deploy commands here (e.g. kubectl set image, docker stack deploy, etc.)
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed."
        }
    }
}
