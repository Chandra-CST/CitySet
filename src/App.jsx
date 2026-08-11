import { useState } from "react";
import classifyGrievance from "./utils/classifier";

// NOTE: this is a client-side-only gate for demo purposes.
// It is NOT real authentication - anyone reading the source can
// find this code. For production this must be replaced with a
// real backend + JWT-based role auth (see README roadmap).
const ADMIN_PASSCODE = "admin123";

function App() {
  const [role, setRole] = useState("citizen");
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  const [grievance, setGrievance] = useState({
    name: "",
    description: "",
    location: "",
  });

  const [error, setError] = useState("");

  const [grievances, setGrievances] = useState(() => {
    const savedGrievances = localStorage.getItem("grievances");
    return savedGrievances ? JSON.parse(savedGrievances) : [];
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [trackingId, setTrackingId] = useState("");
  const [trackedGrievance, setTrackedGrievance] = useState(null);
  const [trackingMessage, setTrackingMessage] = useState("");

  function handleChange(event) {
    setGrievance({
      ...grievance,
      [event.target.name]: event.target.value,
    });

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = grievance.name.trim();
    const description = grievance.description.trim();
    const location = grievance.location.trim();

    if (name.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (location.length < 2) {
      setError("Please enter a valid location.");
      return;
    }

    if (description.length < 10) {
      setError(
        "Please describe the grievance in at least 10 characters."
      );
      return;
    }

    const duplicate = grievances.some(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.location.toLowerCase() === location.toLowerCase() &&
        item.description.toLowerCase() === description.toLowerCase()
    );

    if (duplicate) {
      setError("A similar grievance has already been submitted.");
      return;
    }

    const classification = classifyGrievance(description);

    const newGrievance = {
      id: `GF-${Date.now()}`,
      name,
      description,
      location,
      ...classification,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const updatedGrievances = [...grievances, newGrievance];

    setGrievances(updatedGrievances);

    localStorage.setItem(
      "grievances",
      JSON.stringify(updatedGrievances)
    );

    setGrievance({
      name: "",
      description: "",
      location: "",
    });

    setError("");
  }

  function updateStatus(id, newStatus) {
    const updatedGrievances = grievances.map((item) =>
      item.id === id
        ? {
            ...item,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }
        : item
    );

    setGrievances(updatedGrievances);

    localStorage.setItem(
      "grievances",
      JSON.stringify(updatedGrievances)
    );

    if (trackedGrievance?.id === id) {
      setTrackedGrievance(
        updatedGrievances.find((item) => item.id === id)
      );
    }
  }

  function deleteGrievance(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this grievance?"
    );

    if (!confirmed) return;

    const updatedGrievances = grievances.filter(
      (item) => item.id !== id
    );

    setGrievances(updatedGrievances);

    localStorage.setItem(
      "grievances",
      JSON.stringify(updatedGrievances)
    );
  }

  function trackGrievance(event) {
    event.preventDefault();

    const id = trackingId.trim().toUpperCase();

    const result = grievances.find((item) => item.id === id);

    if (result) {
      setTrackedGrievance(result);
      setTrackingMessage("");
    } else {
      setTrackedGrievance(null);
      setTrackingMessage("No grievance found with this ID.");
    }
  }

  function formatDate(date) {
    if (!date) return "Not available";

    return new Date(date).toLocaleString();
  }

  function getStatusClass(status) {
    if (status === "Resolved") return "badge resolved";
    if (status === "In Progress") return "badge progress";
    return "badge pending";
  }

  function getPriorityClass(priority) {
    if (priority === "High") return "badge high";
    return "badge medium";
  }

  function handleAdminClick() {
    if (adminUnlocked) {
      setRole("admin");
      return;
    }

    const enteredCode = window.prompt("Enter admin passcode:");

    // User cancelled the prompt - do nothing.
    if (enteredCode === null) return;

    if (enteredCode === ADMIN_PASSCODE) {
      setAdminUnlocked(true);
      setRole("admin");
    } else {
      alert("Incorrect passcode.");
    }
  }

  function exportToCSV() {
    const headers = [
      "ID",
      "Name",
      "Location",
      "Category",
      "Department",
      "Priority",
      "Status",
      "Submitted",
    ];

    const rows = grievances.map((item) => [
      item.id,
      item.name,
      item.location,
      item.category,
      item.department,
      item.priority,
      item.status,
      formatDate(item.createdAt),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `grievances-${Date.now()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  const total = grievances.length;

  const pending = grievances.filter(
    (item) => item.status === "Pending"
  ).length;

  const inProgress = grievances.filter(
    (item) => item.status === "In Progress"
  ).length;

  const resolved = grievances.filter(
    (item) => item.status === "Resolved"
  ).length;

  const highPriority = grievances.filter(
    (item) => item.priority === "High"
  ).length;

  const filteredGrievances = grievances.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.description.toLowerCase().includes(searchText) ||
      item.name.toLowerCase().includes(searchText) ||
      item.location.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" ||
      item.priority === priorityFilter;

    const matchesCategory =
      categoryFilter === "All" ||
      item.category === categoryFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory
    );
  });

  const categoryCounts = grievances.reduce((counts, item) => {
    counts[item.category] = (counts[item.category] || 0) + 1;
    return counts;
  }, {});

  const locationCounts = grievances.reduce((counts, item) => {
    const location = item.location.trim();

    counts[location] = (counts[location] || 0) + 1;

    return counts;
  }, {});

  const locationInsights = Object.entries(locationCounts).sort(
    (a, b) => b[1] - a[1]
  );

  // Status breakdown, reused for the bar-chart visualization below.
  const statusBreakdown = [
    { label: "Pending", count: pending, className: "pending" },
    { label: "In Progress", count: inProgress, className: "progress" },
    { label: "Resolved", count: resolved, className: "resolved" },
  ];

  return (
    <div>
      <header>
        <h1>CitySet</h1>
        <p>Citizen Grievance Management System</p>

        <div>
          <button onClick={() => setRole("citizen")}>
            Citizen
          </button>

          <button onClick={handleAdminClick}>Admin</button>
        </div>
      </header>

      <main>
        {role === "citizen" && (
          <>
            <section>
              <h2>Submit a Grievance</h2>

              <form onSubmit={handleSubmit}>
                <input
                  name="name"
                  placeholder="Your Name"
                  value={grievance.name}
                  onChange={handleChange}
                  required
                />

                <input
                  name="location"
                  placeholder="Location"
                  value={grievance.location}
                  onChange={handleChange}
                  required
                />

                <textarea
                  name="description"
                  placeholder="Describe your grievance"
                  value={grievance.description}
                  onChange={handleChange}
                  required
                />

                {error && <p>{error}</p>}

                <button type="submit">
                  Submit Grievance
                </button>
              </form>
            </section>

            <section>
              <h2>Track Grievance</h2>

              <form onSubmit={trackGrievance}>
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

                  <p>ID: {trackedGrievance.id}</p>

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
          </>
        )}

        {role === "admin" && (
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

              <div>
                <button
                  type="button"
                  onClick={exportToCSV}
                  disabled={total === 0}
                >
                  Export CSV
                </button>
              </div>
            </section>

            <section>
              <h2>Status Overview</h2>

              {total === 0 ? (
                <p>No grievances submitted yet.</p>
              ) : (
                statusBreakdown.map((item) => (
                  <div className="stat-row" key={item.label}>
                    <span className="stat-label">
                      {item.label}
                    </span>

                    <span className="stat-track">
                      <span
                        className={`stat-fill ${item.className}`}
                        style={{
                          width: `${
                            (item.count / total) * 100
                          }%`,
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
                    <div className="stat-row" key={category}>
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
                <option value="In Progress">In Progress</option>
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
                <option value="Sanitation">Sanitation</option>
                <option value="Electricity">Electricity</option>
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

              {filteredGrievances.map((item) => (
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
                      className={getPriorityClass(
                        item.priority
                      )}
                    >
                      {item.priority}
                    </span>
                  </p>

                  <p>
                    Status:{" "}
                    <span
                      className={getStatusClass(item.status)}
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
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
