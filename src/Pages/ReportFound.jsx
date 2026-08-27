import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import LocationPicker from "../components/LocationPicker";

import {
  reportFoundItem,
} from "../api";


export default function ReportFound() {

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


    if (!photo) {

      setError(
        "Please add a photo of the item."
      );

      return;
    }


    if (!location) {

      setError(
        "Please select where you found the item."
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
        "found_date",
        date
      );


      formData.append(
        "found_time",
        time
      );


      formData.append(
        "photo",
        photo
      );


      await reportFoundItem(
        formData
      );


      alert(
        "Thank you! Your found item was reported. ♡"
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
            FOUND ITEM
          </span>

          <h1>
            Let's find its owner.
          </h1>

          <p>
            Your little act of kindness might
            make someone's day.
          </p>

        </div>


        <div className="report-illustration">
          🧸
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
                What did you find?
              </h2>

              <p>
                Add a few details about the item.
              </p>

            </div>

          </div>


          <label className="full-label">

            Description

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Example: Black wireless earbuds with a blue case..."
              rows={5}
              required
            />

          </label>


          <label className="file-input required-file">

            <span>
              📷 Add a photo
            </span>

            <small>
              A photo is required for found items.
            </small>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPhoto(
                  e.target.files?.[0] || null
                )
              }
              required
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
                When did you find it?
              </h2>

              <p>
                Enter the date and time separately.
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
                Where did you find it?
              </h2>

              <p>
                Choose the location directly
                from the map.
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
              : "Report found item ♡"}
          </button>

        </div>

      </form>

    </div>
  );
}