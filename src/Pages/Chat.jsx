import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getMessages,
  sendMessage,
  getMatches,
  shareContact,
  getSharedContact,
} from "../api";


export default function Chat({
  user,
}) {

  const {
    matchId
  } = useParams();


  const [
    match,
    setMatch
  ] = useState(null);


  const [
    messages,
    setMessages
  ] = useState([]);


  const [
    message,
    setMessage
  ] = useState("");


  const [
    contact,
    setContact
  ] = useState(null);


  const [
    sending,
    setSending
  ] = useState(false);


  async function loadChat() {

    try {

      const [
        matches,
        messagesData,
        contactData
      ] = await Promise.all([
        getMatches(),
        getMessages(matchId),
        getSharedContact(matchId),
      ]);


      const currentMatch =
        matches.find(
          (item) =>
            String(item.id) ===
            String(matchId)
        );


      setMatch(currentMatch);

      setMessages(
        messagesData
      );

      setContact(
        contactData
      );

    } catch (err) {

      console.error(err);

    }

  }


  useEffect(() => {

    loadChat();

    const interval =
      setInterval(
        loadChat,
        5000
      );

    return () =>
      clearInterval(interval);

  }, [matchId]);


  async function handleSend(e) {

    e.preventDefault();

    if (!message.trim()) return;


    setSending(true);


    try {

      const newMessage =
        await sendMessage(
          matchId,
          message
        );


      setMessages(
        (current) => [
          ...current,
          newMessage,
        ]
      );


      setMessage("");

    } catch (err) {

      alert(err.message);

    } finally {

      setSending(false);

    }

  }


  async function handleShareContact() {

    if (
      !window.confirm(
        "Share your email and phone number with this person?"
      )
    ) {
      return;
    }


    try {

      const result =
        await shareContact(
          matchId
        );

      setContact({
        ...result,
        shared: true,
      });

      alert(
        "Your contact information has been shared."
      );

    } catch (err) {

      alert(err.message);

    }

  }


  if (!match) {

    return (
      <div className="simple-page">
        <div className="empty-state">
          Loading conversation...
        </div>
      </div>
    );

  }


  const isLostReporter =
    match.lost_item.user_id === user.id;


  const otherItem =
    isLostReporter
      ? match.found_item
      : match.lost_item;


  return (
    <div className="chat-page">

      <div className="chat-header">

        <Link
          to="/inbox"
          className="back-button"
        >
          ←
        </Link>


        <div className="chat-person">

          <div className="chat-avatar">
            ♡
          </div>

          <div>

            <h2>
              Potential match
            </h2>

            <span>
              Match confidence:{" "}
              {Math.round(
                match.score * 100
              )}%
            </span>

          </div>

        </div>


        {!contact?.shared && (

          <button
            className="share-button"
            onClick={
              handleShareContact
            }
          >
            📱 Share my contact
          </button>

        )}

      </div>


      <div className="match-summary">

        <div>

          <span>
            POSSIBLE MATCH
          </span>

          <strong>
            {otherItem.description}
          </strong>

        </div>


        <div className="match-score">

          {Math.round(
            match.score * 100
          )}%

        </div>

      </div>


      {contact?.shared && (

        <div className="shared-contact">

          <div>
            📱
          </div>

          <div>

            <strong>
              Contact information shared
            </strong>

            <p>
              {contact.first_name}{" "}
              {contact.last_name}
            </p>

            {contact.email && (
              <p>
                ✉️ {contact.email}
              </p>
            )}

            {contact.phone_number && (
              <p>
                ☎️ {contact.phone_number}
              </p>
            )}

          </div>

        </div>

      )}


      <div className="messages">

        {messages.length === 0 ? (

          <div className="chat-empty">

            <div>
              💬
            </div>

            <p>
              Start the conversation!
            </p>

            <small>
              Remember: your contact details
              stay private unless you choose
              to share them.
            </small>

          </div>

        ) : (

          messages.map(
            (msg) => {

              const mine =
                msg.sender_id === user.id;

              return (
                <div
                  key={msg.id}
                  className={
                    mine
                      ? "message-row mine"
                      : "message-row"
                  }
                >

                  <div className="message-bubble">

                    <p>
                      {msg.content}
                    </p>

                    <small>
                      {new Date(
                        msg.created_at
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      )}
                    </small>

                  </div>

                </div>
              );

            }
          )

        )}

      </div>


      <form
        className="chat-input"
        onSubmit={handleSend}
      >

        <input
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
          placeholder="Type a message..."
        />


        <button
          type="submit"
          disabled={
            sending ||
            !message.trim()
          }
        >
          →
        </button>

      </form>

    </div>
  );
}