pipeline {
    agent any

    parameters {
        string(name: 'BRANCH', defaultValue: 'main')
    }

    environment {
        ANDROID_KEYSTORE    = credentials('android-keystore')
        KEYSTORE_PASSWORD   = credentials('android-keystore-password')
        KEY_ALIAS           = credentials('android-key-alias')
        KEY_PASSWORD        = credentials('android-key-password')
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Install') {
            steps {
                dir('mobile') { sh 'npm ci' }
            }
        }

        stage('Build Web Assets') {
            steps {
                dir('mobile') { sh 'npm run build' }
            }
        }

        stage('Capacitor Sync') {
            steps {
                dir('mobile') { sh 'npx cap sync android' }
            }
        }

        stage('Android Release Build') {
            steps {
                dir('mobile/android') {
                    sh """
                        ./gradlew assembleRelease \
                            -Pandroid.injected.signing.store.file=${ANDROID_KEYSTORE} \
                            -Pandroid.injected.signing.store.password=${KEYSTORE_PASSWORD} \
                            -Pandroid.injected.signing.key.alias=${KEY_ALIAS} \
                            -Pandroid.injected.signing.key.password=${KEY_PASSWORD}
                    """
                }
            }
        }

        stage('Archive APK') {
            steps {
                archiveArtifacts artifacts: 'mobile/android/app/build/outputs/apk/release/*.apk'
            }
        }
    }

    post {
        failure { echo "Mobile build failed" }
    }
}
