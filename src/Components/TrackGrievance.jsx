function TrackGrievance({
  trackingId,
  setTrackingId,
  onTrack,
  trackedGrievance,
  trackingMessage,
  getPriorityClass,
  getStatusClass,
  formatDate,
}) {
  return (
    <section>
      <h2>Track Grievance</h2>

      <form onSubmit={onTrack}>
        <input
          type="text"
          placeholder="Enter Grievance ID"
          value={trackingId}
          onChange={(event) =>
            setTrackingId(event.target.value)
          }
          required
        />

        <button type="submit">
          Track Grievance
        </button>
      </form>

      {trackingMessage && <p>{trackingMessage}</p>}

      {trackedGrievance && (
        <div>
          <h3>{trackedGrievance.description}</h3>

          <p>
            ID: {trackedGrievance.id}
          </p>

          <p>
            Category: {trackedGrievance.category}
          </p>

          <p>
            Department: {trackedGrievance.department}
          </p>

          <p>
            Priority:{" "}
            <span
              className={getPriorityClass(
                trackedGrievance.priority
              )}
            >
              {trackedGrievance.priority}
            </span>
          </p>

          <p>
            Status:{" "}
            <span
              className={getStatusClass(
                trackedGrievance.status
              )}
            >
              {trackedGrievance.status}
            </span>
          </p>

          <p>
            Submitted:{" "}
            {formatDate(trackedGrievance.createdAt)}
          </p>
        </div>
      )}
    </section>
  );
}

export default TrackGrievance;