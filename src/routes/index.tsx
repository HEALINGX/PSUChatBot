import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../pages/Login";
import RegisterPage from "../pages/SignUp";
import Sidebar from "../components/Sidebar";
import User from "../pages/User";
export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: <Sidebar />,
    children: [
      {
        index: true,
        element: <User />,
      },
    ],
  },
]);
