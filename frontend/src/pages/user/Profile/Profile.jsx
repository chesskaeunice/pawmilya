import "./Profile.css";
import BackButton from "../../../components/common/BackButton.jsx";
import AccountForm from "../../../components/common/AccountForm/AccountForm.jsx";

function Profile() {
  return (
    <div className="profile">

      <section className="profile__header">

        <BackButton fallback="/" />

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


      <AccountForm />

    </div>
  );
}

export default Profile;
