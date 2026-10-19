import { Link } from "react-router-dom";

import "./Login.css";

function Login() {
  return (
    <div className="login">
      <section className="login__container">

        <div className="login__intro">
          <p className="login__eyebrow">
            Welcome Back
          </p>

          <h1>
            Continue your PAWmilya journey.
          </h1>

          <p className="login__description">
            Sign in to view your adoption applications,
            manage your reports, and keep your account
            information updated.
          </p>

          <div className="login__image-placeholder">
          </div>    
        </div>


        <div className="login__card">

          <div className="login__card-header">
            <p className="login__eyebrow">
              Account
            </p>

            <h2>Login</h2>

            <p>
              Enter your email address and password.
            </p>
          </div>


          <form className="login__form">

            <div className="login__field">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@email.com"
              />
            </div>


            <div className="login__field">
              <label htmlFor="password">
                Password
              </label>

              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
              />
            </div>


            <div className="login__options">

              <label className="login__remember">
                <input type="checkbox" />

                <span>
                  Remember me
                </span>
              </label>


              <button
                type="button"
                className="login__forgot"
              >
                Forgot Password?
              </button>

            </div>


            <button
              type="submit"
              className="login__submit"
            >
              Login
            </button>

          </form>


          <p className="login__signup-text">
            Don't have an account?

            <Link to="/signup">
              Sign Up
            </Link>
          </p>

        </div>

      </section>
    </div>
  );
}

export default Login;