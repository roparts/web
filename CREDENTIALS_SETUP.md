# How to Set Up Your App Credentials

This guide will walk you through the process of setting up both ImageKit.io (for image hosting) and Firebase (for server-side operations). Your application's code is already configured to use these credentials. Once you complete these steps, your admin panel will be fully functional.

## Part 1: ImageKit.io for Image Uploads

### Step 1: Create a Free ImageKit.io Account

1.  Go to the [ImageKit.io website](https://imagekit.io/registration) and sign up.
2.  The free plan is generous and perfect for getting started. Complete the registration process.
3.  During setup, choose your **Origin**. For this app, the default **ImageKit Media Library** is the easiest option.
4.  You will be asked to choose a unique **ImageKit ID**. This will be part of your URL endpoint.

### Step 2: Find Your ImageKit Credentials

1.  Once your account is set up, navigate to the **Dashboard**.
2.  In the left-hand menu, go to **Developer -> API Keys**.
3.  Here you will find the three pieces of information you need:
    *   **URL-endpoint**
    *   **Public key**
    *   **Private key**

![ImageKit API Keys](https://ik.imagekit.io/ikmedia/docs/assets/img/api-keys.png)

### Step 3: Add ImageKit Credentials to Your Project

1.  In your project code, open the `.env` file.
2.  Copy the `URL-endpoint`, `Public key`, and `Private key` from your ImageKit dashboard and paste them into the corresponding empty quotes (`""`) in the `.env` file.

    **Example:**
    ```
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-unique-id"
    IMAGEKIT_PUBLIC_KEY="public_AbcDEfg12345="
    IMAGEKIT_PRIVATE_KEY="private_aBcDeFgHiJkLmNoPqRsTuVwXyZ="
    ```

---

## Part 2: Firebase for Server-Side Admin Access

Your application uses the Firebase Admin SDK on the server to manage your product database securely. This requires a special "service account" key.

### Step 1: Generate Your Firebase Private Key

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (`roparts-hub`).
3.  Click the gear icon next to **Project Overview** in the top-left corner, and select **Project settings**.
4.  In the settings menu, click on the **Service accounts** tab.
5.  Click the button that says **Generate new private key**.
6.  A warning will appear. Click **Generate key**. This will download a JSON file to your computer. The filename will be similar to `roparts-hub-firebase-adminsdk-....json`.

### Step 2: Convert the Key to Base64

Because the JSON key contains multiple lines, we need to convert it into a single line of text so we can safely store it in our `.env` file. The standard way to do this is with Base64 encoding.

1.  Go to a reliable online Base64 encoder, such as [www.base64encode.org](https://www.base64encode.org/).
2.  Open the JSON file you downloaded from Firebase in a text editor.
3.  Copy the **entire content** of the file.
4.  Paste the content into the top box on the Base64 encode website and click **Encode**.
5.  This will produce a very long, single line of text in the box below. Copy this entire string.

### Step 3: Add the Base64 Key to Your Project

1.  Return to your `.env` file in your project.
2.  Find the line that says `FIREBASE_SERVICE_ACCOUNT_BASE64=""`.
3.  Paste the long Base64 string you just copied inside the quotes.

    **Example:**
    ```
    FIREBASE_SERVICE_ACCOUNT_BASE64="eyJhY2NvdW50X2lkIjoi..."
    ```

## That's It!

You have now configured all the necessary credentials. Your application is now set up to:
- Securely connect to your Firebase project from the server.
- Use these credentials to upload images to your ImageKit.io account.
- Receive a unique URL for each uploaded image.
- Save **only the URL** to your Firebase database, keeping your database light and efficient.
