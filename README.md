# Survey Application

A full-stack application for creating and managing surveys, built with **Spring Boot** (backend) and **Angular** (frontend).

## Features

*   **Admin Dashboard**: Create, edit, and manage surveys.
*   **Public Survey View**: Responsive interface for users to fill out surveys.
*   **Dynamic Forms**: Support for various question types (Text, Checkbox, Radio, Dropdown, File).
*   **Data Export**: Export survey responses to CSV.
*   **Secure**: Admin routes protected by Keycloak (optional/configurable).

## Prerequisites

*   **Java 17+**
*   **Node.js 18+** (for frontend development)
*   **Docker** (optional, for running Keycloak/Database)

## Running the Application

### Standalone JAR (Recommended)

The application is packaged as a single executable JAR file containing both the backend and the frontend.

1.  **Build the application:**
    ```bash
    ./gradlew clean build
    ```
    This will build the Angular frontend and package it into the Spring Boot JAR.

2.  **Run the JAR:**
    ```bash
    java -jar build/libs/survey-0.0.1-SNAPSHOT.jar
    ```

3.  **Access the application:**
    Open your browser and navigate to: [http://localhost:8081/survey](http://localhost:8081/survey)

### Development Mode

#### Backend (Spring Boot)
```bash
./gradlew bootRun
```
Runs on `http://localhost:8081/survey`.

#### Frontend (Angular)
```bash
cd src/main/frontend
npm install
npm start
```
Runs on `http://localhost:4200`.

## Configuration

The application is configured via `src/main/resources/application.properties`.

*   **Server Port**: `8081`
*   **Context Path**: `/survey`
*   **Database**: H2 (In-memory) by default.

## Project Structure

*   `src/main/java`: Spring Boot backend source code.
*   `src/main/frontend`: Angular frontend source code.
*   `src/main/resources`: Backend resources and configuration.

## License

MIT
