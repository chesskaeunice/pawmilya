import "./Profile.css";

function Profile() {
  return (
    <div className="profile">

      <section className="profile__header">

        <p className="profile__eyebrow">
          My Account
        </p>

        <h1>
          Welcome Back!
        </h1>

        <p>
          Manage your profile and keep your
          account information updated.
        </p>

      </section>


      <section className="profile__layout">

        <aside className="profile__sidebar">

          <div className="profile__avatar">
            U
          </div>

          <h2>Username</h2>

          <p>user@email.com</p>


          <nav>

            <button type="button">
              Account Information
            </button>

          </nav>

        </aside>


        <div className="profile__content">

          <section className="profile__card">

            <div>
              <h2>
                Personal Information
              </h2>

              <button type="button">
                Edit
              </button>
            </div>


            <div className="profile__grid">

              <label>
                Full Name
                <input value="Username" readOnly />
              </label>

              <label>
                Date of Birth
                <input type="date" />
              </label>

            </div>

          </section>


          <section className="profile__card">

            <div>
              <h2>
                Contact Details
              </h2>

              <button type="button">
                Edit
              </button>
            </div>


            <div className="profile__grid">

              <label>
                Email Address
                <input
                  value="user@email.com"
                  readOnly
                />
              </label>

              <label>
                Phone Number
                <input />
              </label>

              <label>
                Address
                <input />
              </label>

            </div>

          </section>


          <section className="profile__card">

            <div>
              <h2>
                Password & Security
              </h2>

              <button type="button">
                Edit
              </button>
            </div>

            <input
              type="password"
              value="password123"
              readOnly
            />

          </section>

        </div>

      </section>

    </div>
  );
}

export default Profile;