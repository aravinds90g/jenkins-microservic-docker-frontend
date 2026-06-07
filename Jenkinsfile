pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'modern-storefront'
        CONTAINER_NAME = 'modern-storefront'
        HOST_PORT = '3000'
        NEXT_PUBLIC_API_URL = 'http://localhost:5000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \\
                      --build-arg NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \\
                      -t ${DOCKER_IMAGE}:latest .
                '''
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                    docker rm -f ${CONTAINER_NAME} || true
                    docker run -d --name ${CONTAINER_NAME} -p ${HOST_PORT}:3000 ${DOCKER_IMAGE}:latest
                '''
            }
        }

        stage('Verify Container') {
            steps {
                sh '''
                    sleep 3
                    docker ps --filter name=${CONTAINER_NAME} --format "{{.ID}} {{.Status}}"
                    curl -s -o /dev/null -w "%{http_code}" http://localhost:${HOST_PORT}
                '''
            }
        }
    }

    post {
        always {
            sh '''
                docker rm -f ${CONTAINER_NAME} || true
            '''
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
