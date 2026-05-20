# Intelligent PDF Form Extractor 📄⚡

An elite, full-stack, AI-powered interactive document digitization app. Upload handwritten banking or official forms (like the India Post Savings Bank application form), extract data using Google Gemini Vision AI, and edit details in a synchronized glassmorphic form with real-time bounding box highlighting on the PDF canvas.

---

## 🚀 Key Features

* **AI-Powered OCR**: Leverages Google Gemini Vision models (`gemini-2.5-flash` with fallback to `gemini-2.0-flash`) to instantly parse handwritten text, numbers, and checkbox states.
* **Interaction Sync**: Focusing on any form field on the right panel instantly centers and renders a glowing, spring-animated highlight box over the corresponding physical field in the PDF viewer panel.
* **Responsive Coordinate Scaling**: Highlights automatically adapt dynamically to browser resize events and document aspect ratio fluctuations using scale factor calculations (`yScale`).
* **Resilient API Fallback**: Built-in try/catch fallbacks route requests gracefully in case of upstream rate-limits (`429`) or server busy errors (`503`), falling back to a local high-fidelity OCR mock dataset to ensure 100% application uptime.
* **Elite Dark Theme**: Glassmorphic dark panel overlays, custom scrollbars, vibrant electric blue radial gradients, and fluid entrance animations powered by **Framer Motion**.

---

## 📂 Project Structure

This project is organized as a unified monorepo for simple orchestration and single-server hosting:

```
├── public/                 # Static assets (logo.png, etc.)
├── server/                 # Express backend
│   ├── server.js           # API endpoints, Gemini client & fallback logic
│   └── package.json        # Backend dependencies (express, multer, @google/genai)
├── src/                    # Frontend source (Vite + React)
│   ├── components/         # React components (UploadOverlay, DynamicFormPanel, PDFViewerPanel)
│   ├── data/               # Static pixel coordinate schema
│   ├── store/              # Zustand global state store (useFormStore)
│   ├── index.css           # Global Tailwind CSS configurations & Custom variables
│   └── App.jsx             # Main layout shell
├── package.json            # Unified scripts & Frontend dependencies
├── tailwind.config.js      # Custom theme setup
└── README.md               # Setup and project documentation
```

---

## 🛠️ Local Setup Guide

Follow these steps to run the client and server on your local machine:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended) and a **Google Gemini API Key**. You can obtain a free API key from [Google AI Studio](https://aistudio.google.com/).

### 2. Configure Environment Variables
Navigate into the `server` directory and create a `.env` file to securely store your API Key:

```bash
# Go to server directory
cd server

# Create .env file (or do it manually in your editor)
echo GEMINI_API_KEY=your_actual_api_key_here > .env
```

Ensure `.env` matches the following format:
```env
GEMINI_API_KEY=AIzaSy...
PORT=3001
```

### 3. Install Dependencies
Run the install script from the **root directory** to install frontend dependencies, and do the same for the **server directory**:

```bash
# Install frontend packages (at root level)
npm install

# Install backend packages
cd server
npm install
```

### 4. Start Development Servers

To run the application locally, you will start the Backend API and Vite Frontend simultaneously:

#### Run the Backend Server
From the `server/` directory:
```bash
node server.js
```
The server will boot up on `http://localhost:3001`.

#### Run the Frontend Client
From the root directory (open a separate terminal window):
```bash
npm run dev
```
Vite will compile and serve the frontend at `http://localhost:5173`. Open this URL in your web browser!

---

## ⚡ How it Works (Under the Hood)

### 1. Hybrid OCR Architecture
 LLMs are excellent at reading handwriting but poor at predicting pixel-perfect bounding box coordinates. To solve this:
* The backend **Gemini Vision API** strictly operates as a text extractor.
* The frontend parses the PDF using **React-PDF** and matches the extracted text fields to a handcrafted coordinate grid (`src/data/schema.js`).
* This guarantees the overlay highlight boxes are always completely stable and perfectly aligned to the grid of the document.

### 2. Mathematical Scaling (`yScale`)
To prevent boxes from drifting when the screen size or PDF dimensions change, a scale factor is calculated dynamically:
$$\text{yScale} = \frac{\text{Target aspect ratio } (1.4142)}{\text{Rendered canvas aspect ratio}}$$
This multiplier is applied to the vertical `top` and `height` CSS values dynamically to maintain alignment.

---

## ☁️ Deployment Guide (Render.com)

This application is ready to deploy on **Render.com** or similar PaaS providers as a single Node web service:

1. Connect your Github repository to Render.
2. Select **Web Service**.
3. Use the following build and start configurations:
   * **Build Command**: `npm run heroku-postbuild`
   * **Start Command**: `npm start`
4. Add your **Environment Variable** in the Render dashboard:
   * Key: `GEMINI_API_KEY`
   * Value: `your_actual_api_key_here`
5. Deploy! The server will build the production bundle of the React app and host it statically from the single Node.js port.
