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
    NETLIFY_AUTH_TOKEN = credentials('NETLIFY_TOKEN')
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

    stage('Deploy') {
      environment {
        NETLIFY_AUTH_TOKEN = credentials('NETLIFY_TOKEN')
        NETLIFY_SITE_ID = 'ba1ba09b-55da-488b-ad8c-8146438cd159'
      }
      when {
        branch 'main'
      }
      steps {
        sh '''
          echo "DEPLOY sur main"
          npx netlify deploy --prod --auth "$NETLIFY_AUTH_TOKEN" --site="$NETLIFY_SITE_ID" --dir=dist
        '''
      }
    }
  }
}
