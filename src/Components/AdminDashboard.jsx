function AdminDashboard({
  total,
  pending,
  inProgress,
  resolved,
  highPriority,
  statusBreakdown,
  categoryCounts,
  locationInsights,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  filteredGrievances,
  updateStatus,
  deleteGrievance,
  exportToCSV,
}) {
  return (
    <>
      <section>
        <h2>Admin Dashboard</h2>

        <div>
          <h3>Total</h3>
          <p>{total}</p>
        </div>

        <div>
          <h3>Pending</h3>
          <p>{pending}</p>
        </div>

        <div>
          <h3>In Progress</h3>
          <p>{inProgress}</p>
        </div>

        <div>
          <h3>Resolved</h3>
          <p>{resolved}</p>
        </div>

        <div>
          <h3>High Priority</h3>
          <p>{highPriority}</p>
        </div>

        <button
          type="button"
          onClick={exportToCSV}
          disabled={total === 0}
        >
          Export CSV
        </button>
      </section>

      <section>
        <h2>Status Overview</h2>

        {total === 0 ? (
          <p>No grievances submitted yet.</p>
        ) : (
          statusBreakdown.map((item) => (
            <div
              className="stat-row"
              key={item.label}
            >
              <span className="stat-label">
                {item.label}
              </span>

              <span className="stat-track">
                <span
                  className={`stat-fill ${item.className}`}
                  style={{
                    width: `${(item.count / total) * 100}%`,
                  }}
                />
              </span>

              <span className="stat-count">
                {item.count}
              </span>
            </div>
          ))
        )}
      </section>

      <section>
        <h2>Category Analytics</h2>

        {Object.keys(categoryCounts).length === 0 ? (
          <p>No category data available.</p>
        ) : (
          Object.entries(categoryCounts).map(
            ([category, count]) => (
              <div
                className="stat-row"
                key={category}
              >
                <span className="stat-label">
                  {category}
                </span>

                <span className="stat-track">
                  <span
                    className="stat-fill category"
                    style={{
                      width: `${(count / total) * 100}%`,
                    }}
                  />
                </span>

                <span className="stat-count">
                  {count}
                </span>
              </div>
            )
          )
        )}
      </section>

      <section>
        <h2>Location Insights</h2>

        {locationInsights.length === 0 ? (
          <p>No location data available.</p>
        ) : (
          locationInsights.map(
            ([location, count], index) => (
              <div key={location}>
                <h3>
                  #{index + 1} {location}
                </h3>

                <p>
                  {count} grievance
                  {count !== 1 ? "s" : ""}
                </p>
              </div>
            )
          )
        )}
      </section>

      <section>
        <h2>Search & Filter</h2>

        <input
          type="text"
          placeholder="Search grievances..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">
            In Progress
          </option>
          <option value="Resolved">Resolved</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value)
          }
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(event.target.value)
          }
        >
          <option value="All">All Categories</option>
          <option value="Sanitation">
            Sanitation
          </option>
          <option value="Electricity">
            Electricity
          </option>
          <option value="Water Supply">
            Water Supply
          </option>
          <option value="Roads & Transport">
            Roads & Transport
          </option>
          <option value="Other">Other</option>
        </select>
      </section>

      <section>
        <h2>Manage Grievances</h2>

        {filteredGrievances.length === 0 ? (
          <p>No grievances match your filters.</p>
        ) : (
          filteredGrievances.map((item) => (
            <div key={item.id}>
              <p>
                <strong>ID:</strong> {item.id}
              </p>

              <h3>{item.description}</h3>

              <p>Name: {item.name}</p>
              <p>Location: {item.location}</p>
              <p>Category: {item.category}</p>
              <p>Department: {item.department}</p>

              <p>
                Priority:{" "}
                <span
                  className={
                    item.priority === "High"
                      ? "badge high"
                      : "badge medium"
                  }
                >
                  {item.priority}
                </span>
              </p>

              <p>
                Status:{" "}
                <span
                  className={
                    item.status === "Resolved"
                      ? "badge resolved"
                      : item.status === "In Progress"
                      ? "badge progress"
                      : "badge pending"
                  }
                >
                  {item.status}
                </span>
              </p>

              <select
                value={item.status}
                onChange={(event) =>
                  updateStatus(
                    item.id,
                    event.target.value
                  )
                }
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Resolved">
                  Resolved
                </option>
              </select>

              <button
                type="button"
                onClick={() =>
                  deleteGrievance(item.id)
                }
              >
                Delete
              </button>
            </div>
          ))
        )}
      </section>
    </>
  );
}

export default AdminDashboard;