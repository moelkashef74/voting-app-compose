pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        EKS_CLUSTER_NAME = 'eks-test-cluster'
        ECR_REGISTRY = 'public.ecr.aws/n5k7g9w8'
        DOCKER_IMAGE = 'voting-app'
        DOCKER_TAG = "v1.${BUILD_NUMBER}"
        K8S_DEPLOYMENT_FILE = 'k8s-voting-app/voting-app.yaml'
        SOURCE_REPO = 'https://github.com/moelkashef74/voting-app-compose.git'
    }

    stages {

        stage('Checkout') {
            steps {
                git url: "${SOURCE_REPO}", branch: 'master'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                    -t ${ECR_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} .
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([[$class: 'UsernamePasswordMultiBinding',
                    credentialsId: 'aws-credentials',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {

                    sh '''
                        aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
                        aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
                        aws configure set region $AWS_REGION

                        aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/n5k7g9w8

                        docker push ${ECR_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                    '''
                }
            }
        }

        stage('Update Kubernetes YAML') {
            steps {
                sh '''
                    sed -i "s|image: .*|image: ${ECR_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}|" \
                    ${K8S_DEPLOYMENT_FILE}
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                    aws eks update-kubeconfig \
                    --region ${AWS_REGION} \
                    --name ${EKS_CLUSTER_NAME}

                    kubectl apply -f ${K8S_DEPLOYMENT_FILE}
                '''
            }
        }
    }

    post {
        always {
            sh '''
                docker logout public.ecr.aws || true
            '''
        }
    }
}
