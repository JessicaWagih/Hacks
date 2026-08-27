const API_URL = "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("token");
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function logout() {
  localStorage.removeItem("token");
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message);
  }

  return response.json();
}


// ============================================================
// AUTH
// ============================================================

export async function signup(data) {
  return request("/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  saveToken(data.access_token);

  return data;
}

export async function getMe() {
  return request("/auth/me");
}


// ============================================================
// ITEMS
// ============================================================

export async function reportLostItem(formData) {
  return request("/items/lost", {
    method: "POST",
    body: formData,
  });
}

export async function reportFoundItem(formData) {
  return request("/items/found", {
    method: "POST",
    body: formData,
  });
}

export async function getMyLostItems() {
  return request("/items/lost/my");
}

export async function getMyFoundItems() {
  return request("/items/found/my");
}

export async function getMatches() {
  return request("/matches");
}

export async function getLostItemMatches(id) {
  return request(`/items/lost/${id}/matches`);
}


// ============================================================
// NOTIFICATIONS
// ============================================================

export async function getNotifications() {
  return request("/notifications");
}

export async function getUnreadNotificationCount() {
  return request("/notifications/unread-count");
}

export async function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead() {
  return request("/notifications/read-all", {
    method: "PATCH",
  });
}


// ============================================================
// CHAT
// ============================================================

export async function getMessages(matchId) {
  return request(`/matches/${matchId}/messages`);
}

export async function sendMessage(matchId, content) {
  return request(`/matches/${matchId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    }),
  });
}


// ============================================================
// CONTACT SHARING
// ============================================================

export async function shareContact(matchId) {
  return request(`/matches/${matchId}/share-contact`, {
    method: "POST",
  });
}

export async function getSharedContact(matchId) {
  return request(`/matches/${matchId}/contact`);
}


// ============================================================
// PROFILE
// ============================================================

export async function uploadProfilePicture(file) {
  const formData = new FormData();

  formData.append("photo", file);

  return request("/users/profile-picture", {
    method: "POST",
    body: formData,
  });
}


// ============================================================
// LOCATION
// ============================================================

export async function getLocationContact(locationName) {
  return request(
    `/locations/${encodeURIComponent(locationName)}/contact`
  );
}

export { API_URL };