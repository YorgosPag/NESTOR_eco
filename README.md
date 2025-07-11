
# NESTOR eco - Your Project Management App

This is a Next.js application built with Firebase, Next.js, and Genkit for AI features.

---

## 🚀 Deploying Your Application

To get your application live on the internet, you need to deploy it to **Firebase App Hosting**. Here are the essential steps.

### 1. Setting Up Environment Variables

Your application needs a few secret keys to connect to Firebase services (like the database) and Google's AI models. These are called **environment variables**.

#### Required Variables:

*   `FIREBASE_PROJECT_ID`: Your Firebase project's unique ID.
*   `FIREBASE_CLIENT_EMAIL`: The email for the service account.
*   `FIREBASE_PRIVATE_KEY`: The private key for the service account.
*   `GEMINI_API_KEY`: Your API key for using Google's AI models (Gemini).

#### Step A: Get Your Firebase Credentials

The first three variables come from a **service account key file** in your Firebase project.

1.  Go to your **Firebase Console**.
2.  Click the gear icon ⚙️ next to "Project Overview" and select **Project settings**.
3.  Go to the **Service accounts** tab.
4.  Click **Generate new private key**. A JSON file will be downloaded to your computer.
5.  Open this file. You will find the values for:
    *   `project_id`
    *   `client_email`
    *   `private_key` (This is a long string that starts with `-----BEGIN PRIVATE KEY-----`).

**Important:** When you copy the `private_key`, make sure to copy the entire string, including the `-----BEGIN...` and `-----END...` parts, exactly as it appears inside the quotes `""`.

#### Step B: Get Your Gemini API Key

1.  Go to **Google AI Studio**.
2.  Click **"Get API key"**.
3.  Create a new API key in a new or existing Google Cloud project.
4.  Copy the generated key.

#### Step C: Add Variables to Firebase App Hosting

1.  Go back to your **Firebase Console**.
2.  From the left menu, select **Build > App Hosting**.
3.  Find your backend and click on its name to go to its details page.
4.  Go to the **Settings** tab.
5.  In the "Backend secret management" section, click **Add secret**.
6.  Add each of the four variables one by one:
    *   Secret name: `FIREBASE_PROJECT_ID`, Secret value: (paste the value from the JSON file)
    *   Secret name: `FIREBASE_CLIENT_EMAIL`, Secret value: (paste the value from the JSON file)
    *   Secret name: `FIREBASE_PRIVATE_KEY`, Secret value: (paste the value from the JSON file)
    *   Secret name: `GEMINI_API_KEY`, Secret value: (paste your Gemini key)
7.  Click **Save changes**. You might need to deploy a new version for the changes to take effect.

### 2. Deploy Your App

Once your environment variables are set up, deploying is straightforward. If you have the Firebase CLI installed on your local machine, you can run:

```bash
firebase deploy
```

If you are using a continuous deployment (CI/CD) setup through Firebase Studio or another service, a new deployment will likely be triggered automatically when you push your changes.

After the deployment is complete, your application will be live at the URL provided by Firebase!
