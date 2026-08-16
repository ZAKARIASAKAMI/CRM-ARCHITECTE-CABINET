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
    <div className="mb-16 mt-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Créer un compte
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          Entrez vos informations pour créer un compte
        </p>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <InputField
            variant="auth"
            extra="mb-3"
            label="Nom complet*"
            placeholder="Votre nom"
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <InputField
            variant="auth"
            extra="mb-3"
            label="Email*"
            placeholder="votre@email.com"
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <InputField
            variant="auth"
            extra="mb-3"
            label="Mot de passe*"
            placeholder="Min. 8 caractères"
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <InputField
            variant="auth"
            extra="mb-3"
            label="Confirmer le mot de passe*"
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
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            {loading ? "Création en cours..." : "Créer un compte"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-sm font-medium text-gray-600">
            Vous avez déjà un compte ?{" "}
            <Link
              to="/auth/sign-in"
              className="text-brand-500 hover:text-brand-600"
            >
              Se connecter
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
