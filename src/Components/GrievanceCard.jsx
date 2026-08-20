function GrievanceCard({
  item,
  onStatusChange,
  onDelete,
  getPriorityClass,
  getStatusClass,
}) {
  return (
    <div className="grievance-card">
      <div className="grievance-card-header">
        <div>
          <span className="grievance-id">
            #{item.id}
          </span>

          <h3>{item.description}</h3>
        </div>

        <span className={getStatusClass(item.status)}>
          {item.status}
        </span>
      </div>

      <div className="grievance-info">
        <p>
          <span>Name</span>
          {item.name}
        </p>

        <p>
          <span>Location</span>
          {item.location}
        </p>

        <p>
          <span>Category</span>
          {item.category}
        </p>

        <p>
          <span>Department</span>
          {item.department}
        </p>

        <p>
          <span>Priority</span>
          <span className={getPriorityClass(item.priority)}>
            {item.priority}
          </span>
        </p>
      </div>

      <div className="grievance-actions">
        <select
          value={item.status}
          onChange={(event) =>
            onStatusChange(
              item.id,
              event.target.value
            )
          }
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <button
          type="button"
          className="delete-button"
          onClick={() => onDelete(item.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default GrievanceCard;