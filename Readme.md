Full-Stack Application (Spring Boot + Angular)

A full-stack web application consisting of all the points of the assignment:


Backend: Spring Boot (Gradle) REST API

Frontend: Angular SPA

Local File Storage: Configurable via application.yml

API Documentation: Swagger UI

📁 Project Structure
.
├── backend/         # Spring Boot application (Gradle)
├── frontend/        # Angular application
├── docker-data/     # (optional) docker volumes / runtime data
├── scripts/         # helper scripts (optional)
├── .vscode/         # editor settings
├── .git/            # Git repository
└── README.md        # this file

🚀 Prerequisites
Backend Requirements

Java 17+

Gradle (or the gradlew wrapper included in project)

Frontend Requirements

Node.js (LTS recommended)

npm

Angular CLI:

npm install -g @angular/cli

⚙️ Backend Setup (Spring Boot + Gradle)
1. Navigate to backend folder
cd backend

2. Configure application.yml

backend/src/main/resources/application.yml:

server:
  port: 8080
  servlet:
    context-path: /api

file:
  storage:
    # root-path: ${FILE_STORAGE_ROOT:/opt/app/images}
    root-path: /home/dico/Desktop/log


Notes:

Backend runs at: http://localhost:8080/api

Make sure file storage path exists:

mkdir -p /home/dico/Desktop/log

3. Run the backend using Gradle

Using Gradle wrapper (recommended):

./gradlew bootRun


Windows:

gradlew.bat bootRun

📄 Swagger API Documentation

Once backend is running, open:

➡️ http://localhost:8080/api/swagger-ui/index.html

🅰️ Frontend Setup (Angular)
1. Go to frontend folder
cd frontend

2. Install dependencies
npm install

3. Configure API URL

Set backend API base URL inside:

src/environments/environment.ts

src/environments/environment.prod.ts

Example:

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api'
};

4. Run in development mode
ng serve


or

npm start


Frontend available at:

➡️ http://localhost:4200

🔗 Running Frontend & Backend Together

Start backend

cd backend
./gradlew bootRun


Start frontend

cd frontend
ng serve


Access the app

Frontend: http://localhost:4200

Backend: http://localhost:8080/api

Swagger Docs: http://localhost:8080/api/swagger-ui/index.html

🏗️ Build for Production
Backend JAR (Gradle)
cd backend
./gradlew clean build


Output JAR located in:

backend/build/libs/*.jar


Run it:

java -jar build/libs/your-app-name.jar

Frontend production build
cd frontend
ng build --configuration production


Build output folder:

frontend/dist/

🧰 Git & GitHub Setup

Once this README is added:

git add README.md
git commit -m "Add README with Spring Boot + Angular instructions (Gradle)"
git push origin main

✅ Summary
Component	URL
Frontend	http://localhost:4200

Backend Base URL	http://localhost:8080/api

Swagger UI	http://localhost:8080/api/swagger-ui/index.html

File Storage Path	/home/dico/Desktop/log