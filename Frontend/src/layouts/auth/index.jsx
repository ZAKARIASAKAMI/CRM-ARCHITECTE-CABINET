import { Suspense } from "react";
import Footer from "components/footer/FooterAuthDefault";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "routes.js";

export default function Auth() {
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/auth") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };

  document.documentElement.dir = "ltr";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-brand-50 px-4">
      <div className="w-full max-w-[420px]">
        <Suspense
          fallback={
            <div className="p-8 text-center text-sm text-gray-500">
              Chargement...
            </div>
          }
        >
          <Routes>
            {getRoutes(routes)}
            <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
          </Routes>
        </Suspense>
      </div>
      <div className="mt-auto w-full pb-6 pt-8">
        <Footer />
      </div>
    </div>
  );
}
