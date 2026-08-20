const API_URL = "http://localhost:8080/api/grievances";

export async function getGrievances() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to load grievances.");
  }

  return response.json();
}

export async function createGrievance(grievance) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(grievance),
  });

  if (!response.ok) {
    throw new Error("Failed to submit grievance.");
  }

  return response.json();
}

export async function uploadGrievanceMedia(id, files) {
  if (!files || files.length === 0) {
    return [];
  }

  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(
    `${API_URL}/${id}/media`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to upload media.");
  }

  return response.json();
}

export async function getGrievanceMedia(id) {
  const response = await fetch(
    `${API_URL}/${id}/media`
  );

  if (!response.ok) {
    throw new Error("Failed to load grievance media.");
  }

  return response.json();
}

export async function updateGrievanceStatus(id, status) {
  const response = await fetch(
    `${API_URL}/${id}/status?status=${encodeURIComponent(status)}`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update grievance status.");
  }

  return response.json();
}

export async function deleteGrievanceById(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete grievance.");
  }
}