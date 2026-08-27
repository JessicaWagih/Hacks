import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import LocationPicker from "../components/LocationPicker";

import {
  reportLostItem,
} from "../api";


export default function ReportLost() {

  const navigate = useNavigate();


  const [
    description,
    setDescription
  ] = useState("");


  const [
    date,
    setDate
  ] = useState("");


  const [
    time,
    setTime
  ] = useState("");


  const [
    photo,
    setPhoto
  ] = useState(null);


  const [
    location,
    setLocation
  ] = useState(null);


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  async function handleSubmit(e) {

    e.preventDefault();

    setError("");


    if (!location) {

      setError(
        "Please select where you lost the item on the map."
      );

      return;
    }


    setLoading(true);


    try {

      const formData =
        new FormData();


      formData.append(
        "description",
        description
      );


      formData.append(
        "location",
        location.location ||
        "Selected map location"
      );


      formData.append(
        "latitude",
        location.latitude
      );


      formData.append(
        "longitude",
        location.longitude
      );


      if (location.place_id) {

        formData.append(
          "place_id",
          location.place_id
        );

      }


      formData.append(
        "address",
        location.address || ""
      );


      formData.append(
        "location_name",
        location.location || ""
      );


      formData.append(
        "lost_date",
        date
      );


      formData.append(
        "lost_time",
        time
      );


      if (photo) {

        formData.append(
          "photo",
          photo
        );

      }


      await reportLostItem(
        formData
      );


      alert(
        "Your lost item was reported! ♡"
      );

      navigate("/matches");

    } catch (err) {

      setError(
        err.message
      );

    } finally {

      setLoading(false);

    }

  }


  return (
    <div className="report-page">

      <div className="report-header">

        <div>

          <span className="eyebrow">
            LOST ITEM
          </span>

          <h1>
            Let's find your item.
          </h1>

          <p>
            Don't worry — we'll keep an eye
            out for possible matches.
          </p>

        </div>


        <div className="report-illustration">
          🔎
        </div>

      </div>


      <form
        onSubmit={handleSubmit}
        className="report-form"
      >

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}


        <section className="form-section">

          <div className="form-section-heading">

            <span>
              01
            </span>

            <div>

              <h2>
                Tell us about it
              </h2>

              <p>
                Give us enough detail to
                recognize your item.
              </p>

            </div>

          </div>


          <label className="full-label">

            What did you lose?

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Example: Black AirPods Pro with a blue silicone case..."
              rows={5}
              required
            />

          </label>


          <label className="file-input">

            <span>
              📷 Add a photo
            </span>

            <small>
              Optional, but helpful!
            </small>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPhoto(
                  e.target.files?.[0] || null
                )
              }
            />

          </label>

        </section>


        <section className="form-section">

          <div className="form-section-heading">

            <span>
              02
            </span>

            <div>

              <h2>
                When did you lose it?
              </h2>

              <p>
                Date and time are separate
                so you can be as precise as possible.
              </p>

            </div>

          </div>


          <div className="two-column">

            <label>

              Date

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                required
              />

            </label>


            <label>

              Time

              <input
                type="time"
                value={time}
                onChange={(e) =>
                  setTime(e.target.value)
                }
                required
              />

            </label>

          </div>

        </section>


        <section className="form-section">

          <div className="form-section-heading">

            <span>
              03
            </span>

            <div>

              <h2>
                Where did you lose it?
              </h2>

              <p>
                Tap the map instead of typing
                the location manually.
              </p>

            </div>

          </div>


          <LocationPicker
            value={location}
            onChange={setLocation}
          />

        </section>


        <div className="report-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/")
            }
          >
            Cancel
          </button>


          <button
            type="submit"
            className="primary-button submit-button"
            disabled={loading}
          >
            {loading
              ? "Reporting..."
              : "Report lost item ♡"}
          </button>

        </div>

      </form>

    </div>
  );
}