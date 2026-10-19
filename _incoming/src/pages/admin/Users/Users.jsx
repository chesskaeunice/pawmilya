import users from "../../../data/users.js";

import "./Users.css";

function Users() {
  return (
    <div className="admin-page">

      <div className="admin-page__heading">

        <div>
          <p className="admin-page__eyebrow">
            Accounts
          </p>

          <h1>
            Users
          </h1>

          <p>
            Manage registered Pawmilya accounts.
          </p>
        </div>

      </div>


      <div className="admin-table-card">

        <table className="admin-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>


          <tbody>

            {users.map((user) => (

              <tr key={user.id}>

                <td>
                  {user.id}
                </td>

                <td>
                  {user.name}
                </td>

                <td>
                  {user.email}
                </td>

                <td>
                  {user.role}
                </td>

                <td>
                  <span className="admin-status admin-status--green">
                    {user.status}
                  </span>
                </td>

                <td>

                  <button className="admin-button admin-button--secondary">
                    Disable
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Users;