import api from "@/api/client";
import { useState, type SubmitEventHandler } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface FormFieldErrors {
    email?: string;
    password?: string;
}

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const rawReturnUrl = searchParams.get('returnUrl') || '/'
    const returnUrl = (rawReturnUrl && rawReturnUrl.startsWith('/') && !rawReturnUrl.startsWith('//')) ? rawReturnUrl : '/';

    const [email, setEmail] = useState('');
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
            const response = await api.post("/auth/login", { email, password });

            if (response.status === 200) {
                const { accessToken } = response.data.data;
                (window as any).__accessToken = accessToken;
                navigate(returnUrl)
            }
        } catch (err: any) {
            const status = err.response?.status;
            const errorBody = err.response?.data?.error;

            if (status === 401) {
                setFormError(errorBody.message)
            } else if (status === 422 && Array.isArray(errorBody?.details)) {
                const errors: FormFieldErrors = {}

                for (const { field, message } of errorBody.details as { field: string, message: string }[]) {
                    errors[field as keyof FormFieldErrors] = message;
                }

                setFieldErrors(errors);
            } else {
                setFormError(errorBody?.message ?? err.message ?? "Sign in failed. Please try again")
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <h1>Welcome Back!</h1>
            <section>
                {formError && <p>{formError}</p>}
                <form onSubmit={handleSubmit} noValidate>
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
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>
                <p> Don't have an account <Link to='/register' > Create one</Link></p>
            </section>
        </div >
    )
}
