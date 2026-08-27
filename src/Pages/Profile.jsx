import {
  useState,
} from "react";

import {
  uploadProfilePicture,
} from "../api";


export default function Profile({
  user,
  setUser,
}) {

  const [
    loading,
    setLoading
  ] = useState(false);


  async function handlePhoto(
    e
  ) {

    const file =
      e.target.files?.[0];

    if (!file) return;


    setLoading(true);


    try {

      const updated =
        await uploadProfilePicture(
          file
        );

      setUser(updated);

    } catch (err) {

      alert(err.message);

    } finally {

      setLoading(false);

    }

  }


  const initials = (
    `${user.first_name?.[0] || ""}` +
    `${user.last_name?.[0] || ""}`
  ).toUpperCase();


  return (
    <div className="simple-page">

      <div className="profile-card">

        <div className="profile-top">

          <div className="large-avatar">

            {user.profile_picture ? (

              <img
                src={
                  `http://127.0.0.1:8000/${user.profile_picture}`
                }
                alt="Profile"
              />

            ) : (

              initials

            )}

          </div>


          <label className="photo-button">

            {loading
              ? "Uploading..."
              : "Change photo"}

            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              hidden
            />

          </label>

        </div>


        <div className="profile-heading">

          <span>
            MY PROFILE
          </span>

          <h1>
            {user.first_name}{" "}
            {user.last_name}
          </h1>

        </div>


        <div className="profile-info">

          <div className="profile-info-row">

            <span>
              Email
            </span>

            <strong>
              {user.email}
            </strong>

          </div>


          <div className="profile-info-row">

            <span>
              Phone
            </span>

            <strong>
              {user.phone_number ||
                "Not provided"}
            </strong>

          </div>


          <div className="profile-info-row">

            <span>
              Member since
            </span>

            <strong>
              {new Date(
                user.created_at
              ).toLocaleDateString()}
            </strong>

          </div>

        </div>


        <div className="privacy-note">

          🔒 <strong>Your contact info stays private.</strong>

          <p>
            Other users cannot see your phone
            number or email just because you
            matched with them. You choose if
            and when you want to share it.
          </p>

        </div>

      </div>

    </div>
  );
}