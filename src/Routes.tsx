import { RoomBookingPage } from "@/src/pages/RoomBookingPage";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    element: (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    ),
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
