import { Link } from "react-router-dom";

import "./Signup.css";

function Signup() {
  return (
    <div className="signup">
      <section className="signup__container">

        <div className="signup__intro">
          <p className="signup__eyebrow">
            Join PAWmilya
          </p>

          <h1>
            Create an account and stay connected.
          </h1>

          <p className="signup__description">
            Create a PAWmilya account to submit adoption applications,
            manage missing pet reports, and receive updates about your requests.
          </p>

          <div className="signup__image-placeholder">
            <span>Image Placeholder</span>
          </div>
        </div>


        <div className="signup__card">

          <div className="signup__card-header">
            <p className="signup__eyebrow">
              Create Account
            </p>

            <h2>Sign Up</h2>

            <p>
              Enter your basic information to create a PAWmilya account.
            </p>
          </div>


          <form className="signup__form">

            <div className="signup__name-grid">

              <div className="signup__field">
                <label htmlFor="firstName">
                  First Name
                </label>

                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name"
                />
              </div>


              <div className="signup__field">
                <label htmlFor="lastName">
                  Last Name
                </label>

                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Enter last name"
                />
              </div>

            </div>


            <div className="signup__field">
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


            <div className="signup__field">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="09XX XXX XXXX"
              />
            </div>


            <div className="signup__name-grid">

              <div className="signup__field">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter password"
                />
              </div>


              <div className="signup__field">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Repeat password"
                />
              </div>

            </div>


            <label className="signup__terms">

              <input
                type="checkbox"
                name="terms"
              />

              <span>
                I agree to the Terms of Use and Privacy Policy.
              </span>

            </label>


            <button
              type="submit"
              className="signup__submit"
            >
              Create Account
            </button>

          </form>


          <p className="signup__login-text">
            Already have an account?

            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </section>
    </div>
  );
}

export default Signup;