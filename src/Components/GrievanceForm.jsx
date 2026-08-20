function GrievanceForm({
  grievance,
  onChange,
  onSubmit,
  error,
  selectedFiles,
  onFilesChange,
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

        <div className="description-upload">
          <textarea
            name="description"
            placeholder="Describe your grievance"
            value={grievance.description}
            onChange={onChange}
            required
          />

          <label className="media-upload">
            <span>📎 Attach photos or videos</span>

            <input
              type="file"
              accept="image/*,video/mp4"
              multiple
              onChange={onFilesChange}
            />

            <small>
              Maximum 3 files. Images and MP4 videos only.
              Maximum 20 MB per file.
            </small>
          </label>

          {selectedFiles && selectedFiles.length > 0 && (
            <div className="selected-files">
              <strong>Selected files:</strong>

              {Array.from(selectedFiles).map((file, index) => (
                <div className="selected-file" key={`${file.name}-${index}`}>
                  <span>
                    {file.type.startsWith("video/")
                      ? "🎥"
                      : "🖼️"}{" "}
                    {file.name}
                  </span>

                  <small>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p>{error}</p>}

        <button type="submit">
          Submit Grievance
        </button>
      </form>
    </section>
  );
}

export default GrievanceForm;