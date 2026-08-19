import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "services/api";
import InputField from "components/fields/InputField";
import { setAuthSession } from "services/auth";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.password_confirmation) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      const { access_token, user } = response.data;
      setAuthSession({ access_token, user });
      navigate("/admin/default", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.password?.[0] ||
        "Erreur lors de la création du compte. Veuillez réessayer.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                fill="#422AFB"
              />
            </svg>
          </div>
          <h4 className="text-2xl font-bold text-navy-700">Créer un compte</h4>
          <p className="mt-1 text-sm text-gray-500">
            Entrez vos informations pour commencer
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm-.5 3h1v5h-1V4zm.5 8a.75.75 0 110-1.5.75.75 0 010 1.5z"
                fill="currentColor"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <InputField
            variant="auth"
            extra="mb-4"
            label="Nom complet"
            placeholder="Votre nom"
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <InputField
            variant="auth"
            extra="mb-4"
            label="Email"
            placeholder="votre@email.com"
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <InputField
            variant="auth"
            extra="mb-4"
            label="Mot de passe"
            placeholder="Min. 8 caractères"
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <InputField
            variant="auth"
            extra="mb-4"
            label="Confirmer le mot de passe"
            placeholder="Répétez votre mot de passe"
            id="password_confirmation"
            type="password"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-200 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Création en cours...
              </span>
            ) : (
              "Créer un compte"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-500">
            Vous avez déjà un compte ?{" "}
          </span>
          <Link
            to="/auth/sign-in"
            className="text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
