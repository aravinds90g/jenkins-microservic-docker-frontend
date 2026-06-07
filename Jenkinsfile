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
                    echo "Waiting for application to be ready..."
                    for i in $(seq 1 30); do
                        code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${HOST_PORT} || true)
                        if [ "$code" = "200" ] || [ "$code" = "302" ] || [ "$code" = "301" ]; then
                            echo "Application is ready (HTTP $code)"
                            exit 0
                        fi
                        echo "Waiting... (attempt $i, HTTP $code)"
                        sleep 2
                    done
                    echo "Application failed to start within 60 seconds"
                    echo "--- Container logs ---"
                    docker logs ${CONTAINER_NAME} 2>&1 || true
                    echo "----------------------"
                    exit 1
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
            sh '''
                docker logs ${CONTAINER_NAME} 2>&1 || true
            '''
            echo "Pipeline failed."
        }
    }
}
