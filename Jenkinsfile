pipeline {
  agent any

  environment {
    NODE_ENV = 'test'
    CI = 'true'
    NETLIFY_AUTH_TOKEN = credentials('NETLIFY_TOKEN')
  }

  stages {

    stage('CI & Tests') {
      agent {
        docker {
          image 'mcr.microsoft.com/playwright:v1.58.0-noble'
          args '--network=host'
        }
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

    stage('docker') {
      agent any
      when { branch 'main' }
      environment {
        CI_REGISTRY = 'ghcr.io'
        CI_REGISTRY_USER = 'nabilou-anoir'
        CI_REGISTRY_IMAGE = "${CI_REGISTRY}/${CI_REGISTRY_USER}/chess:latest"
        CI_REGISTRY_PASSWORD = credentials('CI_REGISTRY_PASSWORD')
      }
      steps {
        sh '''
          docker build --network=host -t "$CI_REGISTRY_IMAGE" .
          echo "$CI_REGISTRY_PASSWORD" | docker login "$CI_REGISTRY" -u "$CI_REGISTRY_USER" --password-stdin
          docker push "$CI_REGISTRY_IMAGE"
        '''
      }
    }

    stage('Deploy') {
      agent {
        docker {
          image 'mcr.microsoft.com/playwright:v1.58.0-noble'
          args '--network=host'
        }
      }
      environment {
        NETLIFY_AUTH_TOKEN = credentials('NETLIFY_TOKEN')
        NETLIFY_SITE_ID = 'ba1ba09b-55da-488b-ad8c-8146438cd159'
      }
      when { branch 'main' }
      steps {
        sh '''
          echo "DEPLOY sur main"
          npx netlify deploy --prod --auth "$NETLIFY_AUTH_TOKEN" --site="$NETLIFY_SITE_ID" --dir=dist
        '''
      }
    }
  }
}