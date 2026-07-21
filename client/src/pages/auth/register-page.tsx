import { useState, type SubmitEventHandler } from "react"
import { Link, useNavigate } from "react-router";

import api from "@/api/client";

interface FormFieldErrors {
    email?: string;
    name?: string;
    password?: string;
}

export default function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setFieldErrors({});
        setFormError(null);
        setIsSubmitting(true);

        try {
            const response = await api.post("/auth/register", { email, password, name });

            if (response.status === 201) {
                // Temporary in memory storage until auth context is added in story 2.4
                const { accessToken } = response.data.data;
                (window as any).__accessToken = accessToken;
                navigate('/');
            }
        } catch (err: any) {
            const status = err.response?.status;
            const errorBody = err.response?.data?.error;

            if (status === 409) {
                setFormError(errorBody.message);
            } else if (status === 422 && Array.isArray(errorBody?.details)) {
                const errors: FormFieldErrors = {};

                for (const { field, message } of errorBody.details as { field: string, message: string }[]) {
                    errors[field as keyof FormFieldErrors] = message;
                }

                setFieldErrors(errors);
            } else {
                setFormError(errorBody?.message ?? err.message ?? "Registration failed. Please try again");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <h1>Create Account</h1>
            <section>
                {formError && <p>{formError}</p>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@email.com"
                        />
                        {fieldErrors.email && <p>{fieldErrors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="john doe"
                            required
                        />
                        {fieldErrors.name && <p>{fieldErrors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="******"
                            required
                        />
                        {fieldErrors.password && <p>{fieldErrors.password}</p>}
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p>
                    Already have an account <Link to="/login">Sign in</Link>
                </p>
            </section>
        </div>
    )
}
