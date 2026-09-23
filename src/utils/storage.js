// Storage & API Management for Codex Results and Quests

const STORAGE_KEY = 'epitech_codex_results_v1';
const ACTIVE_USER_KEY = 'epitech_codex_active_user_v1';

// Base API URL (relative to current host)
const API_BASE = '/api';

export const getStoredResults = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// Save locally and persist to SQLite Database via REST API
export const saveUserResult = async (userEmail, resultData) => {
  const cleanEmail = userEmail.toLowerCase().trim();
  const completedAt = new Date().toISOString();

  // 1. Instant optimistic local cache
  try {
    const all = getStoredResults();
    all[cleanEmail] = {
      ...resultData,
      email: cleanEmail,
      completedAt
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('LocalStorage save notice:', e);
  }

  // 2. Persistent Database Record via backend API
  try {
    const res = await fetch(`${API_BASE}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        ...resultData,
        completedAt
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('API DB Save response:', res.status, errData);
      return { success: false, status: res.status, error: errData.error };
    }

    const saved = await res.json();
    return { success: true, data: saved.data };
  } catch (err) {
    console.warn('Offline or local fallback: DB API unreachable', err);
    return { success: true, fallback: true };
  }
};

// Fetch fresh results from SQLite DB and update local cache (used by Admin Dashboard)
export const fetchResultsFromDB = async () => {
  try {
    const res = await fetch(`${API_BASE}/results`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (e) {
    console.warn('Could not fetch DB results, using local cache:', e);
  }
  return getStoredResults();
};

// Sync specific student result from DB
export const syncStudentResultFromDB = async (email) => {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  try {
    const res = await fetch(`${API_BASE}/results/${encodeURIComponent(cleanEmail)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        const all = getStoredResults();
        all[cleanEmail] = json.data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return json.data;
      }
    } else if (res.status === 404) {
      // The result does not exist on the server (e.g. was reset by admin)
      const all = getStoredResults();
      if (all[cleanEmail]) {
        delete all[cleanEmail];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      }
      return null;
    }
  } catch (e) {
    console.warn('Could not sync student result from DB:', e);
  }
  return getStoredResults()[cleanEmail] || null;
};

// Remove result locally and in DB (Admin only)
export const removeUserResult = async (userEmail) => {
  if (!userEmail) return false;
  const cleanEmail = userEmail.toLowerCase().trim();
  try {
    const all = getStoredResults();
    delete all[cleanEmail];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Error removing local result:', e);
  }

  try {
    const res = await fetch(`${API_BASE}/results/${encodeURIComponent(cleanEmail)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    console.warn('DB delete API unreachable:', e);
    return false;
  }
};

export const getActiveUserSession = () => {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setActiveUserSession = (user) => {
  try {
    if (user) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  } catch (e) {
    console.error('Error setting session:', e);
  }
};

// Fetch all students from SQLite DB (or fallback to students.json)
export const fetchStudentsFromDB = async () => {
  try {
    const res = await fetch(`${API_BASE}/students`);
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (e) {
    console.warn('Could not fetch DB students, using local fallback:', e);
  }
  return null;
};

// Add or update student with house attribution in DB
export const addStudentToDB = async (studentData) => {
  try {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de l\'enregistrement de l\'étudiant');
    }
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.error('Error adding student:', e);
    throw e;
  }
};

// Update student's house attribution
export const updateStudentHouseInDB = async (email, teamId) => {
  try {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(email)}/house`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de la mise à jour de la Maison');
    }
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.error('Error updating student house:', e);
    throw e;
  }
};

// Delete student
export const deleteStudentFromDB = async (email) => {
  try {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    console.error('Error deleting student:', e);
    return false;
  }
};
