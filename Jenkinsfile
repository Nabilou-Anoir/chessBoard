pipeline {
  agent {
    docker {
      image 'mcr.microsoft.com/playwright:v1.58.0-noble'
      args '--network=host'
    }
  }

  environment {
    NODE_ENV = 'test'
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Tests unitaires') {
      steps {
        sh 'npm run test'
      }
    }

    stage('Tests UI') {
      steps {
        sh 'npm run test:e2e'
      }
    }
  }
}
