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
        // loader:  여기서 로딩 처리하는 방법도  생각해볼만하다. 
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
