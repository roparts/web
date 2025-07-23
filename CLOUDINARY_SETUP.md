# How to Set Up Cloudinary and Connect it to Your App

This guide will walk you through the process of creating a free Cloudinary account, finding your API credentials, and adding them to your application.

The application's code is already configured to use these credentials. Once you complete these steps, image uploads from your admin panel will work automatically.

## Step 1: Create a Free Cloudinary Account

1.  Go to the [Cloudinary website](https://cloudinary.com/users/register/free).
2.  Sign up for a new account. The free tier is very generous and more than enough to get started.
3.  Complete the registration process.

## Step 2: Find Your Credentials

1.  After signing in, you will be taken to your **Dashboard**.
2.  In the "Account Details" section at the top, you will find your **Product Environment Credentials**.
3.  You need three pieces of information from here:
    *   **Cloud Name**
    *   **API Key**
    *   **API Secret**

![Cloudinary Dashboard Credentials](https://res.cloudinary.com/demo/image/upload/v1626330 demo/general/dashboard_credentials.png)
*(This is an example image, your credentials will be different)*

## Step 3: Add Credentials to Your Project

1.  In your project code, open the `.env` file.
2.  You will see the following lines:

    ```
    CLOUDINARY_CLOUD_NAME=""
    CLOUDINARY_API_KEY=""
    CLOUDINARY_API_SECRET=""
    FIREBASE_SERVICE_ACCOUNT_BASE64=""
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
    ```

3.  Copy the `Cloud Name`, `API Key`, and `API Secret` from your Cloudinary dashboard and paste them into the corresponding empty quotes (`""`) in the `.env` file.

    **Example:**
    ```
    CLOUDINARY_CLOUD_NAME="your-unique-cloud-name"
    CLOUDINARY_API_KEY="123456789012345"
    CLOUDINARY_API_SECRET="aBcDeFgHiJkLmNoPqRsTuVwXyZ"
    ```

## That's It!

You don't need to make any code changes. The application is already set up to:
- Use these credentials to upload images to your Cloudinary account.
- Receive a unique URL for each uploaded image.
- Save **only the URL** to your Firebase database, keeping your database light and efficient.
