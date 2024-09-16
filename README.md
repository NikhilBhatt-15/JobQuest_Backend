# Job Hunt Application

This is a Job Hunt application built with Node.js, Express, and Prisma. It allows employers to create profiles, post jobs, and manage job listings.

## Features

- Employer profile creation
- Job posting
- Job listing retrieval
- Job deletion

## Technologies Used

- JavaScript
- Node.js
- Express
- Prisma
- PostgreSQL
- Cloudinary

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/NikhilBhatt-15/jobhunt.git
    cd jobhunt
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
    ```dotenv
    DATABASE_URL="postgresql://postgres:nikhil@localhost:5432/jobhunt"
    JWT_SECRET="your_jwt_secret"
    PORT=5000
    CLOUDINARY_URL=cloudinary://your_cloudinary_url
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

4. Run the application:
    ```sh
   npx prisma migrate dev
    npm start
    ```

## API Endpoints

### Auth Routes

- `POST /register` - Register a new user
- `POST /login` - Login a user
- `GET /profile` - Get current user

### Job Seeker Routes

- `POST /profile` - Create job seeker profile
- `GET /profile` - Get job seeker profile
- `PUT /profile` - Update job seeker profile
- `GET /jobs` - Get all jobs

### Employer Routes

- `POST /profile` - Create employer profile
- `GET /profile` - Get employer profile
- `GET /jobs` - Get posted jobs
- `POST /jobs` - Post a new job
- `DELETE /jobs/:id` - Delete a job

## License

This project is licensed under the MIT License.