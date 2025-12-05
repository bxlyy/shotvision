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
