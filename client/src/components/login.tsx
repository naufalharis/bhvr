import { useState } from "react";
import "../styles/login.css";

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <div>
      <div>
        {/* Header */}
        <header>
          <div>
            <a href="#">
              <div>
                <svg
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <h2>Kursus</h2>
            </a>
            <div>
              <a href="#">Sign up</a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <div>
            <div>
              <h1>Login to Your Account</h1>
              <p>Enter your credentials to access your courses.</p>
            </div>

            <form onSubmit={handleLogin}>
              <div>
                <label htmlFor="email">Email</label>
                <div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="youremail@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div>
                  <label htmlFor="password">Password</label>
                  <div>
                    <a href="#">Forgot your password?</a>
                  </div>
                </div>
                <div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button type="submit">Log in</button>
              </div>
            </form>

            <div>
              <div>
                <div></div>
              </div>
            </div>
            <p>
              Don&apos;t have an account?{" "}
              <a href="#">Sign up</a>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
