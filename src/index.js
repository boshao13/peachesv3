// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import KidsCare from './KidsCare';
import { HeaderProvider } from './HeaderContext'; // Import the provider
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PreEnrollment from './PreEnrollment';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/kidscare",
    element: <KidsCare />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HeaderProvider>
      <RouterProvider router={router} />
    </HeaderProvider>
  </React.StrictMode>
);
