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


export default function Inbox() {

  const [
    matches,
    setMatches
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  useEffect(() => {

    async function loadMatches() {

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

    loadMatches();

  }, []);


  return (
    <div className="simple-page">

      <div className="page-heading">

        <div>

          <span>
            PRIVATE MESSAGES
          </span>

          <h1>
            Inbox
          </h1>

        </div>

      </div>


      {loading ? (

        <div className="empty-state">
          Loading conversations...
        </div>

      ) : matches.length === 0 ? (

        <div className="empty-state">

          <div className="empty-icon">
            💌
          </div>

          <h3>
            No conversations yet
          </h3>

          <p>
            When we find a potential match,
            you'll be able to chat privately
            with the other person here.
          </p>

        </div>

      ) : (

        <div className="conversation-list">

          {matches.map(
            (match) => (

              <Link
                key={match.id}
                to={`/chat/${match.id}`}
                className="conversation-card"
              >

                <div className="conversation-avatar">
                  ♡
                </div>


                <div className="conversation-main">

                  <div className="conversation-top">

                    <h3>
                      Potential match
                    </h3>

                    <span>
                      {Math.round(
                        match.score * 100
                      )}%
                    </span>

                  </div>


                  <p>
                    {match.lost_item.description}
                  </p>


                  <small>
                    Tap to open conversation →
                  </small>

                </div>

              </Link>

            )
          )}

        </div>

      )}

    </div>
  );
}