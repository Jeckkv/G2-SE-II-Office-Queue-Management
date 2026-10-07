// Story 3: Call customer
// TODO(story 3): show called tickets with their counter and the updated queue lengths,
// refreshed in real time (polling or WebSocket, to decide with the backend).
import { Link } from 'react-router'

export default function DisplayPage() {
  return (
    
    <section className="display">
      <h1>Now serving</h1>
      <p className="placeholder">Called tickets and queue lengths will be shown here in Story 3.</p>
      <Link to="/" className="display-back">Back</Link>
    </section>
  )
}