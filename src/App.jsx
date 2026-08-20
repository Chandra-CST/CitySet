import { useEffect, useState } from "react";
import classifyGrievance from "./utils/classifier";

const API_URL = "http://localhost:8080/api/grievances";
const ADMIN_PASSCODE = "admin123";

function App() {
  const [role, setRole] = useState("citizen");
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  const [grievance, setGrievance] = useState({
    name: "",
    description: "",
    location: "",
  });

  const [grievances, setGrievances] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [trackingId, setTrackingId] = useState("");
  const [trackedGrievance, setTrackedGrievance] = useState(null);
  const [trackingMessage, setTrackingMessage] = useState("");

  useEffect(() => {
    fetchGrievances();
  }, []);

  async function fetchGrievances() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load grievances.");
      }

      const data = await response.json();
      setGrievances(data);
    } catch (error) {
      console.error(error);
      setError(
        "Could not connect to the backend. Make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    setGrievance({
      ...grievance,
      [event.target.name]: event.target.value,
    });

    setError("");
  }

  async function handleSubmit(event) {
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
      setError("Please describe the grievance in at least 10 characters.");
      return;
    }

    const duplicate = grievances.some(
      (item) =>
        item.name?.toLowerCase() === name.toLowerCase() &&
        item.location?.toLowerCase() === location.toLowerCase() &&
        item.description?.toLowerCase() === description.toLowerCase()
    );

    if (duplicate) {
      setError("A similar grievance has already been submitted.");
      return;
    }

    try {
      const classification = classifyGrievance(description);

      const newGrievance = {
        name,
        description,
        location,
        category: classification.category,
        department: classification.department,
        priority: classification.priority,
        status: "Pending",
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGrievance),
      });

      if (!response.ok) {
        throw new Error("Failed to submit grievance.");
      }

      const savedGrievance = await response.json();

      setGrievances((previous) => [...previous, savedGrievance]);

      setGrievance({
        name: "",
        description: "",
        location: "",
      });

      setError("");
      setTrackedGrievance(savedGrievance);
      setTrackingId(String(savedGrievance.id));
      setTrackingMessage("");

      alert(
        `Grievance submitted successfully!\nYour Grievance ID is ${savedGrievance.id}`
      );
    } catch (error) {
      console.error(error);
      setError(
        "Could not submit grievance. Make sure the backend is running."
      );
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      const response = await fetch(
        `${API_URL}/${id}/status?status=${encodeURIComponent(newStatus)}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status.");
      }

      const updatedGrievance = await response.json();

      setGrievances((previous) =>
        previous.map((item) =>
          item.id === updatedGrievance.id ? updatedGrievance : item
        )
      );

      if (trackedGrievance?.id === id) {
        setTrackedGrievance(updatedGrievance);
      }
    } catch (error) {
      console.error(error);
      alert("Could not update grievance status.");
    }
  }

  async function deleteGrievance(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this grievance?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete grievance.");
      }

      setGrievances((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (trackedGrievance?.id === id) {
        setTrackedGrievance(null);
      }
    } catch (error) {
      console.error(error);
      alert("Could not delete grievance.");
    }
  }

  function trackGrievance(event) {
    event.preventDefault();

    const id = trackingId.trim();

    const result = grievances.find((item) => String(item.id) === id);

    if (result) {
      setTrackedGrievance(result);
      setTrackingMessage("");
    } else {
      setTrackedGrievance(null);
      setTrackingMessage("No grievance found with this ID.");
    }
  }

  function formatDate(date) {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString();
  }

  function getStatusClass(status) {
    if (status === "Resolved") {
      return "badge resolved";
    }

    if (status === "In Progress") {
      return "badge progress";
    }

    return "badge pending";
  }

  function getPriorityClass(priority) {
    if (priority === "High") {
      return "badge high";
    }

    return "badge medium";
  }

  function handleAdminClick() {
    if (adminUnlocked) {
      setRole("admin");
      return;
    }

    const enteredCode = window.prompt("Enter admin passcode:");

    if (enteredCode === null) {
      return;
    }

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
    ];

    const rows = grievances.map((item) => [
      item.id,
      item.name,
      item.location,
      item.category,
      item.department,
      item.priority,
      item.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `cityset-grievances-${Date.now()}.csv`;
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
      item.description?.toLowerCase().includes(searchText) ||
      item.name?.toLowerCase().includes(searchText) ||
      item.location?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || item.priority === priorityFilter;

    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

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
    const location = item.location?.trim();

    if (location) {
      counts[location] = (counts[location] || 0) + 1;
    }

    return counts;
  }, {});

  const locationInsights = Object.entries(locationCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const statusBreakdown = [
    {
      label: "Pending",
      count: pending,
      className: "pending",
    },
    {
      label: "In Progress",
      count: inProgress,
      className: "progress",
    },
    {
      label: "Resolved",
      count: resolved,
      className: "resolved",
    },
  ];

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <div className="loading-icon">🏙️</div>
          <h2>Loading CitySet</h2>
          <p>Connecting to the civic services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">🏙️</div>

          <div>
            <h1>CitySet</h1>
            <p>Citizen Grievance Management</p>
          </div>
        </div>

        <nav className="nav-actions">
          <button
            className={role === "citizen" ? "nav-button active" : "nav-button"}
            onClick={() => setRole("citizen")}
          >
            👤 Citizen
          </button>

          <button
            className={role === "admin" ? "nav-button active" : "nav-button"}
            onClick={handleAdminClick}
          >
            🛡️ Admin
          </button>
        </nav>
      </header>

      <main className="dashboard">
        {role === "citizen" && (
          <>
            <section className="hero-card">
              <div className="hero-content">
                <span className="eyebrow">SMART CIVIC PLATFORM</span>

                <h2>Make your city better.</h2>

                <p>
                  Report civic issues, track their progress, and help local
                  authorities build cleaner, safer and better-connected
                  communities.
                </p>

                <div className="hero-stats">
                  <div>
                    <strong>{total}</strong>
                    <span>Total Reports</span>
                  </div>

                  <div>
                    <strong>{resolved}</strong>
                    <span>Resolved</span>
                  </div>

                  <div>
                    <strong>{pending}</strong>
                    <span>Pending</span>
                  </div>
                </div>
              </div>

              <div className="hero-visual">
                <div className="city-circle">🏙️</div>
              </div>
            </section>

            <div className="citizen-grid">
              <section className="card">
                <div className="section-heading">
                  <div className="section-icon">📝</div>

                  <div>
                    <h2>Submit a Grievance</h2>
                    <p>Tell us what needs attention in your area.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Your Name</label>

                    <input
                      name="name"
                      placeholder="Enter your full name"
                      value={grievance.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>

                    <input
                      name="location"
                      placeholder="City, area or landmark"
                      value={grievance.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Describe the Issue</label>

                    <textarea
                      name="description"
                      placeholder="Describe the problem in detail..."
                      value={grievance.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {error && (
                    <div className="error-message">
                      ⚠️ {error}
                    </div>
                  )}

                  <button className="primary-button" type="submit">
                    Submit Grievance →
                  </button>
                </form>
              </section>

              <section className="card tracking-card">
                <div className="section-heading">
                  <div className="section-icon">🔎</div>

                  <div>
                    <h2>Track Your Grievance</h2>
                    <p>Check the current status of your report.</p>
                  </div>
                </div>

                <form onSubmit={trackGrievance}>
                  <div className="form-group">
                    <label>Grievance ID</label>

                    <input
                      type="text"
                      placeholder="e.g. 1"
                      value={trackingId}
                      onChange={(event) =>
                        setTrackingId(event.target.value)
                      }
                      required
                    />
                  </div>

                  <button className="secondary-button" type="submit">
                    Track Status
                  </button>
                </form>

                {trackingMessage && (
                  <div className="error-message">
                    {trackingMessage}
                  </div>
                )}

                {trackedGrievance && (
                  <div className="tracking-result">
                    <div className="tracking-header">
                      <div>
                        <span>Grievance</span>
                        <strong>#{trackedGrievance.id}</strong>
                      </div>

                      <span
                        className={getStatusClass(
                          trackedGrievance.status
                        )}
                      >
                        {trackedGrievance.status}
                      </span>
                    </div>

                    <h3>{trackedGrievance.description}</h3>

                    <div className="detail-grid">
                      <div>
                        <span>Category</span>
                        <strong>{trackedGrievance.category}</strong>
                      </div>

                      <div>
                        <span>Department</span>
                        <strong>{trackedGrievance.department}</strong>
                      </div>

                      <div>
                        <span>Priority</span>
                        <strong>
                          <span
                            className={getPriorityClass(
                              trackedGrievance.priority
                            )}
                          >
                            {trackedGrievance.priority}
                          </span>
                        </strong>
                      </div>

                      <div>
                        <span>Location</span>
                        <strong>{trackedGrievance.location}</strong>
                      </div>
                    </div>

                    <p className="submitted-date">
                      Submitted: {formatDate(trackedGrievance.createdAt)}
                    </p>
                  </div>
                )}

                {!trackedGrievance && !trackingMessage && (
                  <div className="empty-state">
                    <span>📍</span>
                    <p>Enter your grievance ID to see its status.</p>
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        {role === "admin" && (
          <>
            <section className="admin-header-card">
              <div>
                <span className="eyebrow">ADMINISTRATION</span>
                <h2>CitySet Control Center</h2>
                <p>
                  Monitor, analyze and manage citizen grievances from one
                  place.
                </p>
              </div>

              <button
                className="export-button"
                type="button"
                onClick={exportToCSV}
                disabled={total === 0}
              >
                ↓ Export CSV
              </button>
            </section>

            <section className="metric-grid">
              <div className="metric-card">
                <span className="metric-icon blue">📊</span>
                <div>
                  <span>Total Grievances</span>
                  <strong>{total}</strong>
                </div>
              </div>

              <div className="metric-card">
                <span className="metric-icon yellow">⏳</span>
                <div>
                  <span>Pending</span>
                  <strong>{pending}</strong>
                </div>
              </div>

              <div className="metric-card">
                <span className="metric-icon purple">⚙️</span>
                <div>
                  <span>In Progress</span>
                  <strong>{inProgress}</strong>
                </div>
              </div>

              <div className="metric-card">
                <span className="metric-icon green">✓</span>
                <div>
                  <span>Resolved</span>
                  <strong>{resolved}</strong>
                </div>
              </div>

              <div className="metric-card">
                <span className="metric-icon red">!</span>
                <div>
                  <span>High Priority</span>
                  <strong>{highPriority}</strong>
                </div>
              </div>
            </section>

            <div className="analytics-grid">
              <section className="card">
                <div className="section-heading">
                  <div className="section-icon">📈</div>

                  <div>
                    <h2>Status Overview</h2>
                    <p>Current grievance resolution progress.</p>
                  </div>
                </div>

                {total === 0 ? (
                  <div className="empty-state">
                    <span>📭</span>
                    <p>No grievances submitted yet.</p>
                  </div>
                ) : (
                  <div className="analytics-list">
                    {statusBreakdown.map((item) => (
                      <div className="stat-row" key={item.label}>
                        <span className="stat-label">{item.label}</span>

                        <span className="stat-track">
                          <span
                            className={`stat-fill ${item.className}`}
                            style={{
                              width: `${(item.count / total) * 100}%`,
                            }}
                          />
                        </span>

                        <span className="stat-count">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="card">
                <div className="section-heading">
                  <div className="section-icon">🗂️</div>

                  <div>
                    <h2>Category Analytics</h2>
                    <p>Issues grouped by civic department.</p>
                  </div>
                </div>

                {Object.keys(categoryCounts).length === 0 ? (
                  <div className="empty-state">
                    <span>📂</span>
                    <p>No category data available.</p>
                  </div>
                ) : (
                  <div className="analytics-list">
                    {Object.entries(categoryCounts).map(
                      ([category, count]) => (
                        <div className="stat-row" key={category}>
                          <span className="stat-label">{category}</span>

                          <span className="stat-track">
                            <span
                              className="stat-fill category"
                              style={{
                                width: `${(count / total) * 100}%`,
                              }}
                            />
                          </span>

                          <span className="stat-count">{count}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>
            </div>

            <section className="card">
              <div className="section-heading">
                <div className="section-icon">📍</div>

                <div>
                  <h2>Location Insights</h2>
                  <p>Areas generating the highest number of reports.</p>
                </div>
              </div>

              {locationInsights.length === 0 ? (
                <div className="empty-state">
                  <span>📍</span>
                  <p>No location data available.</p>
                </div>
              ) : (
                <div className="location-grid">
                  {locationInsights.map(([location, count], index) => (
                    <div className="location-card" key={location}>
                      <div className="location-rank">
                        #{index + 1}
                      </div>

                      <div>
                        <strong>{location}</strong>
                        <span>
                          {count} grievance{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <div className="section-heading">
                <div className="section-icon">🔍</div>

                <div>
                  <h2>Search & Filter</h2>
                  <p>Find specific grievances quickly.</p>
                </div>
              </div>

              <div className="filter-grid">
                <input
                  type="text"
                  placeholder="Search by name, location or issue..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
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
                  <option value="Water Supply">Water Supply</option>
                  <option value="Roads & Transport">
                    Roads & Transport
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </section>

            <section className="card">
              <div className="section-heading">
                <div className="section-icon">📋</div>

                <div>
                  <h2>Manage Grievances</h2>
                  <p>
                    {filteredGrievances.length} of {total} grievances shown.
                  </p>
                </div>
              </div>

              {filteredGrievances.length === 0 ? (
                <div className="empty-state">
                  <span>🔎</span>
                  <p>No grievances match your filters.</p>
                </div>
              ) : (
                <div className="grievance-list">
                  {filteredGrievances.map((item) => (
                    <div className="grievance-card" key={item.id}>
                      <div className="grievance-top">
                        <div>
                          <span className="grievance-id">
                            GRIEVANCE #{item.id}
                          </span>

                          <h3>{item.description}</h3>
                        </div>

                        <span
                          className={getStatusClass(item.status)}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="grievance-details">
                        <div>
                          <span>Citizen</span>
                          <strong>{item.name}</strong>
                        </div>

                        <div>
                          <span>Location</span>
                          <strong>{item.location}</strong>
                        </div>

                        <div>
                          <span>Category</span>
                          <strong>{item.category}</strong>
                        </div>

                        <div>
                          <span>Department</span>
                          <strong>{item.department}</strong>
                        </div>

                        <div>
                          <span>Priority</span>
                          <strong>
                            <span
                              className={getPriorityClass(
                                item.priority
                              )}
                            >
                              {item.priority}
                            </span>
                          </strong>
                        </div>
                      </div>

                      <div className="grievance-actions">
                        <select
                          value={item.status}
                          onChange={(event) =>
                            updateStatus(
                              item.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">
                            In Progress
                          </option>
                          <option value="Resolved">Resolved</option>
                        </select>

                        <button
                          className="delete-button"
                          type="button"
                          onClick={() =>
                            deleteGrievance(item.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <footer>
        <strong>CitySet</strong>
        <span>Building better cities, one grievance at a time.</span>
      </footer>
    </div>
  );
}

export default App;