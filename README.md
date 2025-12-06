# ShotVision (Next.js App)

This application consists of two parts:

1.  **Next.js Application** (Frontend & Backend API): Contained in this repository.
2.  **Python Model API**: Contained in this [Tennis CV Repository](https://github.com/efmendel/tennis-cv).

For the full application pipeline to work, both of these repositories need to be hosted. They can be hosted locally.

## Getting Started

First, run

```bash
npm install
```

This initializes the modules needed to run the Next.js application.

Next, you must have a necessary `.env` file. Create a `.env` file in the root directory. Please contact (bryanly@g.ucla.edu) for the contents, or see the Google Doc linked in our submission.

Next, run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The Next.js app is now hosted.

Next, host the Python API, so that the Next.js app can call and send uploaded videos to it. Follow the `README.md` in the [model repository](https://github.com/efmendel/tennis-cv) listed above. You should be able to upload and analyze videos now!

## Diagrams:

<img width="4377" height="5592" alt="image" src="https://github.com/user-attachments/assets/ca33e5f5-81c7-43ce-b329-7c797bd564dc" />
This sequence diagram outlines our asynchronous video processing architecture where the Next.js frontend manages user interactions and secure direct uploads to Backblaze B2, keeping the main server responsive.
Upon upload, the system triggers a background Flask worker thread that performs the heavy lifting—downloading the raw footage, running computer vision algorithms (MediaPipe) to analyze the tennis swing, and rendering the output.
The workflow concludes when the worker sends a webhook notification back to the Next.js server to update the database, allowing the user to stream their fully analyzed video.

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/c987ac36-f9e8-431b-ac63-3cb21ff35c9e" />
This sequence diagram outlines a "Standard Login Flow" where our application delegates authentication duties to Clerk's pre-built <SignIn /> UI component.
Instead of the local server handling credentials, the user interacts directly with this component, which securely validates input and communicates with the remote Clerk Cloud Service to obtain a session token.
Once the cloud service confirms the identity, the component updates the local client state using the useAuth hook and automatically redirects the user to the dashboard.

