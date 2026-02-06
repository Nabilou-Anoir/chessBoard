pipeline {
  agent {
    docker {
      image 'mcr.microsoft.com/playwright:v1.58.0-noble'
      args '--network=host'
    }
  }

  environment {
    NODE_ENV = 'test'
    CI = 'true'
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
        sh '''
          rm -rf html
          npm run test
        '''
      }
      post {
        always {
          publishHTML(target: [
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'html',
            reportFiles: 'index.html',
            reportName: 'VitestReport'
          ])
        }
      }
    }

    stage('Tests UI') {
      steps {
        sh '''
          rm -rf playwright-report
          npm run test:e2e
        '''
      }
      post {
        always {
          publishHTML(target: [
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'playwright-report',
            reportFiles: 'index.html',
            reportName: 'PlaywrightReport'
          ])
        }
      }
    }
  }
}
