# How to Set Up ImageKit.io and Connect it to Your App

This guide will walk you through the process of creating a free ImageKit.io account, finding your credentials, and adding them to your application.

The application's code is already configured to use these credentials. Once you complete these steps, image uploads from your admin panel will work automatically.

## Step 1: Create a Free ImageKit.io Account

1.  Go to the [ImageKit.io website](https://imagekit.io/registration) and sign up.
2.  The free plan is generous and perfect for getting started. Complete the registration process.
3.  During setup, choose your **Origin**. For this app, the default **ImageKit Media Library** is the easiest option.
4.  You will be asked to choose a unique **ImageKit ID**. This will be part of your URL endpoint.

## Step 2: Find Your Credentials

1.  Once your account is set up, navigate to the **Dashboard**.
2.  In the left-hand menu, go to **Developer -> API Keys**.
3.  Here you will find the three pieces of information you need:
    *   **URL-endpoint**
    *   **Public key**
    *   **Private key**

![ImageKit API Keys](https://ik.imagekit.io/ikmedia/docs/assets/img/api-keys.png)

## Step 3: Add Credentials to Your Project

1.  In your project code, open the `.env` file.
2.  You will see the following lines:

    ```
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=""
    IMAGEKIT_PUBLIC_KEY=""
    IMAGEKIT_PRIVATE_KEY=""
    FIREBASE_SERVICE_ACCOUNT_BASE64=""
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
    ```

3.  Copy the `URL-endpoint`, `Public key`, and `Private key` from your ImageKit dashboard and paste them into the corresponding empty quotes (`""`) in the `.env` file.

    **Example:**
    ```
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-unique-id"
    IMAGEKIT_PUBLIC_KEY="public_AbcDEfg12345="
    IMAGEKIT_PRIVATE_KEY="private_aBcDeFgHiJkLmNoPqRsTuVwXyZ="
    ```

## That's It!

You don't need to make any code changes. The application is now set up to:
- Use these credentials to upload images to your ImageKit.io account.
- Receive a unique URL for each uploaded image.
- Save **only the URL** to your Firebase database, keeping your database light and efficient.
