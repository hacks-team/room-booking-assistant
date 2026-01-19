import { RoomBookingPage } from "@/src/pages/RoomBookingPage";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";

const router = createBrowserRouter([
  {
    element: (
      <NuqsAdapter>
        <main className="mx-auto max-w-7xl px-4 py-8">
          <Outlet />
        </main>
      </NuqsAdapter>
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
