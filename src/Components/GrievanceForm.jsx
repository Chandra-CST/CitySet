function GrievanceForm({
  grievance,
  onChange,
  onSubmit,
  error,
}) {
  return (
    <section>
      <h2>Submit a Grievance</h2>

      <form onSubmit={onSubmit}>
        <input
          name="name"
          placeholder="Your Name"
          value={grievance.name}
          onChange={onChange}
          required
        />

        <input
          name="location"
          placeholder="Location"
          value={grievance.location}
          onChange={onChange}
          required
        />

        <textarea
          name="description"
          placeholder="Describe your grievance"
          value={grievance.description}
          onChange={onChange}
          required
        />

        {error && <p>{error}</p>}

        <button type="submit">
          Submit Grievance
        </button>
      </form>
    </section>
  );
}

export default GrievanceForm;