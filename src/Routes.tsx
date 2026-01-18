import { RoomBookingPage } from "@/src/pages/RoomBookingPage";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    element: <Outlet />,
    children: [
      {
        path: "/",
        element: <RoomBookingPage />,
      },

      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export const Routes = () => {
  return <RouterProvider router={router} />;
};
