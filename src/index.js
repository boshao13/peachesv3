// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import KidsCare from './KidsCare';
import Classes from './Classes';
import { HeaderProvider } from './HeaderContext'; // Import the provider
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DayPasses from './DayPasses';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/kidscare",
    element: <KidsCare />,
  },
  {
    path: "/classes",
    element: <Classes />,
  },
  {
    path: "/daypass",
    element: <DayPasses />,
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
