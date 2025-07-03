# Backend API

This directory contains the Node.js Express backend server for the application.

## Configuration

To run the backend server, you need to configure its connection to the PostgreSQL database and other services. This is done using environment variables.

1.  **Create a `.env` file:**
    In the `backend` directory, create a new file named `.env`.

2.  **Copy from example:**
    Copy the contents of `backend/.env.example` into your newly created `.env` file.
    ```bash
    cp .env.example .env
    ```

3.  **Understand Environment Variables:**
    The `.env` file will contain variables like:

    *   `DB_HOST`: The hostname or IP address of your PostgreSQL database server (e.g., a Neon host).
    *   `DB_PORT`: The port number on which your PostgreSQL server is listening (usually 5432).
    *   `DB_USER`: The username for connecting to your PostgreSQL database.
    *   `DB_PASSWORD`: The password for the specified database user.
    *   `DB_NAME`: The name of the PostgreSQL database to connect to.
    *   `DATABASE_URL`: A comprehensive connection string for PostgreSQL. This is often preferred by services like Neon and typically includes the user, password, host, port, database name, and SSL requirements. Example: `postgresql://your_user:your_password@your_host:5432/your_database?sslmode=require`
    *   `JWT_SECRET`: A secret key used for signing and verifying JSON Web Tokens (JWTs) for authentication.
    *   `EMAIL_USER`: The email address used for sending emails (e.g., for password resets, notifications), often a Gmail account.
    *   `EMAIL_PASS`: The password (or app-specific password if using services like Gmail with 2FA) for the `EMAIL_USER` account.
    *   `FRONTEND_URL`: The base URL of the frontend application. This is used for constructing links in emails sent from the backend.
    *   `PORT`: (Optional) The port on which the backend server should run. Defaults to 3001 if not specified.

    Ensure these variables are correctly set up in your `.env` file for your development or production environment. For a Neon database, you will typically use the connection details provided in your Neon project dashboard, often using the `DATABASE_URL` format.
