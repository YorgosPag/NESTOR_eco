
# NESTOR eco - Your Project Management App

This is a Next.js application built with Firebase, Next.js, and Genkit for AI features.

---

## 🚀 Deploying and Configuring Your Application

To get your application running correctly, you need to connect it to your Firebase project by setting up the necessary environment variables.

### 1. Firebase Project Details (From `firebase.json`)

*   **Project ID (`projectId`):** The application is configured to use the Firebase project ID you provide in the environment variables.
*   **Firestore Region (`location`):** `eur3`
*   **Hosting Region (`region`):** `us-central1`

### 2. Environment Variables (`.env`)

For the Firebase Admin SDK to connect to Firestore, you must set up the following environment variables in your deployment environment (e.g., Firebase App Hosting secrets, Netlify environment variables).

#### Required Variables:

*   `FIREBASE_PROJECT_ID`: Your Firebase project's unique ID.
*   `FIREBASE_CLIENT_EMAIL`: The email for the service account you will create.
*   `FIREBASE_PRIVATE_KEY`: The private key for that service account.
*   `GEMINI_API_KEY`: Your API key for using Google's AI models (Gemini).

#### How to Get These Values:

1.  **Get Your Firebase Credentials:**
    *   Go to your **Firebase Console**.
    *   Click the gear icon ⚙️ next to "Project Overview" and select **Project settings**.
    *   Go to the **Service accounts** tab.
    *   Click **Generate new private key**. A JSON file will be downloaded.
    *   Open this file. You will find the exact values for:
        *   `project_id`
        *   `client_email`
        *   `private_key` (This is a long string that starts with `-----BEGIN PRIVATE KEY-----`). **Important:** When you copy the `private_key`, make sure to copy the entire string, including the `-----BEGIN...` and `-----END...` parts.

2.  **Get Your Gemini API Key:**
    *   Go to **Google AI Studio**.
    *   Click **"Get API key"** and create a new key.

### 3. Data Source and Consistency

*   The application uses a **single Firestore database**. It does not connect to multiple databases.
*   The data displayed in the application comes directly from the collections (`projects`, `contacts`, etc.) within the Firebase project you have configured with the environment variables above.
*   Therefore, the data is always consistent and reflects the current state of that single database.

### 4. Seeding the Database (For First-Time Use)

If your Firestore database is empty, you can populate it with sample data.
1.  Navigate to the `/settings` page in the application.
2.  Click the "Εκτέλεση Αρχικοποίησης (Seed)" button.
3.  This will add sample projects, contacts, and other necessary data to get you started. **This should only be done once on an empty database.**
