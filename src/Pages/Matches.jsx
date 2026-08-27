import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getMatches,
} from "../api";


export default function Matches() {

  const [
    matches,
    setMatches
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  useEffect(() => {

    async function load() {

      try {

        const data =
          await getMatches();

        setMatches(data);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    }

    load();

  }, []);


  return (
    <div className="simple-page">

      <div className="page-heading">

        <div>

          <span>
            YOUR REPORTS
          </span>

          <h1>
            Potential Matches
          </h1>

        </div>

      </div>


      {loading ? (

        <div className="empty-state">
          Looking for matches...
        </div>

      ) : matches.length === 0 ? (

        <div className="empty-state">

          <div className="empty-icon">
            🔎
          </div>

          <h3>
            No matches yet
          </h3>

          <p>
            Don't worry! We'll notify you
            as soon as something looks like
            a match.
          </p>

        </div>

      ) : (

        <div className="match-grid">

          {matches.map(
            (match) => (

              <div
                className="match-card"
                key={match.id}
              >

                <div className="match-card-top">

                  <span className="match-pill">
                    {Math.round(
                      match.score * 100
                    )}% match
                  </span>

                </div>


                <div className="match-items">

                  <div>

                    <small>
                      LOST
                    </small>

                    <h3>
                      {match.lost_item.description}
                    </h3>

                    <p>
                      📍{" "}
                      {match.lost_item.location}
                    </p>

                  </div>


                  <div className="match-arrow">
                    ↕
                  </div>


                  <div>

                    <small>
                      FOUND
                    </small>

                    <h3>
                      {match.found_item.description}
                    </h3>

                    <p>
                      📍{" "}
                      {match.found_item.location}
                    </p>

                  </div>

                </div>


                <Link
                  to={`/chat/${match.id}`}
                  className="primary-button match-chat-button"
                >
                  Open chat →
                </Link>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}