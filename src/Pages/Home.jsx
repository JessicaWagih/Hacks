import {
  Link,
} from "react-router-dom";


export default function Home({
  user,
}) {

  return (
    <div className="home-page">

      <section className="hero">

        <div className="hero-content">

          <div className="hero-pill">
            Helping things find their way home
          </div>


          <h1>
            Lost something?
            <br />
            <span>
              We can help.
            </span>
          </h1>


          <p className="hero-description">
            Report a lost or found item and let
            our matching system help connect
            it with its owner.
          </p>


          {user && (
            <p className="welcome-message">
              Welcome back, {user.first_name}!
            </p>
          )}

        </div>

      </section>


      <section className="choice-section">

        <div className="section-heading">

          <span>
            What happened?
          </span>

          <h2>
            Let's get your item home.
          </h2>

        </div>


        <div className="choice-grid">


          <Link
            to="/report-lost"
            className="choice-card lost-card"
          >

            <div className="choice-content">

              <span className="choice-label">
                I LOST SOMETHING
              </span>

              <h3>
                Help me find it
              </h3>

              <p>
                Tell us about your lost item
                and where you last saw it.
              </p>

            </div>

          </Link>


          <Link
            to="/report-found"
            className="choice-card found-card"
          >

            <div className="choice-content">

              <span className="choice-label">
                I FOUND SOMETHING
              </span>

              <h3>
                Help it find its owner
              </h3>

              <p>
                Report something you've found
                and we'll look for its owner.
              </p>

              <span className="choice-arrow">
                →
              </span>

            </div>

          </Link>


        </div>

      </section>


      <section className="how-section">

        <div className="section-heading center">

          <span>
            HOW IT WORKS
          </span>

          <h2>
            Simple. Safe. Connected.
          </h2>

        </div>


        <div className="steps">

          <div className="step">

            <div className="step-number">
              01
            </div>

            <h3>
              Report
            </h3>

            <p>
              Tell us what was lost or found
              and pick the location on the map.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              02
            </div>

            <h3>
              We Match
            </h3>

            <p>
              Our matching system compares
              descriptions, locations and times.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              03
            </div>

            <h3>
              Connect
            </h3>

            <p>
              If there's a potential match,
              you'll receive a notification and
              can chat privately.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}