import { useEffect, useState } from "react";
import axios from "axios";

// ---------- API SETUP ----------
// Change this to your Render backend URL once deployed.
const API_URL = "http://localhost:8080";

const api = axios.create({ baseURL: API_URL });

// Automatically attach the saved login token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------- MAIN APP ----------
export default function App() {
  // page = "login" | "register" | "contacts"
  const [page, setPage] = useState(localStorage.getItem("token") ? "contacts" : "login");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  function handleLoginSuccess(name) {
    setUsername(name);
    setPage("contacts");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername("");
    setPage("login");
  }

  if (page === "login") {
    return <LoginPage onSuccess={handleLoginSuccess} goToRegister={() => setPage("register")} />;
  }

  if (page === "register") {
    return <RegisterPage onSuccess={handleLoginSuccess} goToLogin={() => setPage("login")} />;
  }

  return <ContactsPage username={username} onLogout={handleLogout} />;
}

// ---------- LOGIN PAGE ----------
function LoginPage({ onSuccess, goToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/api/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      onSuccess(res.data.username);
    } catch (err) {
      setError("Invalid username or password");
    }
  }

  return (
    <div style={styles.wrapper}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Log in to Contact Book</h2>
        <input style={styles.input} placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)} required />
        <input style={styles.input} placeholder="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} type="submit">Log in</button>
        <p style={styles.footerText}>
          No account?{" "}
          <span style={styles.link} onClick={goToRegister}>Register</span>
        </p>
      </form>
    </div>
  );
}

// ---------- REGISTER PAGE ----------
function RegisterPage({ onSuccess, goToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/api/auth/register", { username, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      onSuccess(res.data.username);
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    }
  }

  return (
    <div style={styles.wrapper}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Create your account</h2>
        <input style={styles.input} placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)} required />
        <input style={styles.input} placeholder="Email address" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input style={styles.input} placeholder="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        {error && <p style={styles.error}>{String(error)}</p>}
        <button style={styles.button} type="submit">Create account</button>
        <p style={styles.footerText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={goToLogin}>Log in</span>
        </p>
      </form>
    </div>
  );
}

// ---------- CONTACTS PAGE (your original app, now with a navbar) ----------
function ContactsPage({ username, onLogout }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", email: "", address: "" });
  const [editingId, setEditingId] = useState(null);

  async function loadContacts(query = "") {
    const res = await api.get("/api/contacts", { params: query ? { search: query } : {} });
    setContacts(res.data);
  }

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadContacts(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await api.put(`/api/contacts/${editingId}`, form);
    } else {
      await api.post("/api/contacts", form);
    }
    setForm({ fullName: "", phoneNumber: "", email: "", address: "" });
    setEditingId(null);
    loadContacts(search);
  }

  function handleEdit(contact) {
    setForm({
      fullName: contact.fullName,
      phoneNumber: contact.phoneNumber,
      email: contact.email,
      address: contact.address,
    });
    setEditingId(contact.id);
  }

  async function handleDelete(id) {
    await api.delete(`/api/contacts/${id}`);
    loadContacts(search);
  }

  return (
    <div>
      {/* Navbar */}
      <div style={styles.navbar}>
        <span style={styles.brand}>📇 Contact Book</span>
        <div style={styles.navRight}>
          <span style={styles.navUser}>{username}</span>
          <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.container}>
        <h2 style={styles.heading}>Contact Book</h2>
        <p style={styles.subheading}>Manage your contacts — add, edit, search, and delete.</p>

        <form style={styles.formCard} onSubmit={handleSubmit}>
          <h3 style={styles.formTitle}>{editingId ? "Edit Contact" : "Add New Contact"}</h3>
          <div style={styles.grid}>
            <input style={styles.input} name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
            <input style={styles.input} name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} />
            <input style={styles.input} name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
            <input style={styles.input} name="address" placeholder="Address" value={form.address} onChange={handleChange} />
          </div>
          <button style={styles.addButton} type="submit">
            {editingId ? "Save Changes" : "Add Contact"}
          </button>
        </form>

        <input
          style={styles.search}
          placeholder="Search contacts by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>NAME</th>
              <th style={styles.th}>PHONE</th>
              <th style={styles.th}>EMAIL</th>
              <th style={styles.th}>ADDRESS</th>
              <th style={styles.th}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr><td colSpan={5} style={styles.empty}>No contacts yet — add your first one above.</td></tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id}>
                <td style={styles.td}><strong>{c.fullName}</strong></td>
                <td style={styles.td}>{c.phoneNumber}</td>
                <td style={styles.td}>{c.email}</td>
                <td style={styles.td}>{c.address}</td>
                <td style={styles.td}>
                  <span style={styles.editLink} onClick={() => handleEdit(c)}>Edit</span>{" "}
                  <span style={styles.deleteLink} onClick={() => handleDelete(c.id)}>Delete</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- STYLES ----------
const styles = {
  wrapper: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" },
  card: { width: 320, padding: 32, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" },
  title: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  input: { width: "100%", padding: "10px 12px", marginBottom: 12, border: "1px solid #ccc", borderRadius: 8, fontSize: 14, boxSizing: "border-box" },
  button: { width: "100%", padding: "10px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" },
  error: { color: "#dc2626", fontSize: 13, marginBottom: 12 },
  footerText: { fontSize: 13, textAlign: "center", marginTop: 16, color: "#555" },
  link: { color: "#2563eb", cursor: "pointer" },

  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid #e5e7eb", background: "#fff" },
  brand: { fontWeight: 600, fontSize: 16 },
  navRight: { display: "flex", alignItems: "center", gap: 14 },
  navUser: { fontSize: 14, color: "#555" },
  logoutBtn: { background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13 },

  container: { maxWidth: 960, margin: "0 auto", padding: "32px 20px" },
  heading: { fontSize: 26, marginBottom: 4 },
  subheading: { color: "#666", marginBottom: 24 },
  formCard: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24, background: "#fff" },
  formTitle: { fontSize: 16, marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  addButton: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" },
  search: { width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: "border-box" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 8px", background: "#f3f4f6", fontSize: 12, color: "#555" },
  td: { padding: "12px 8px", borderBottom: "1px solid #eee", fontSize: 14 },
  editLink: { color: "#2563eb", cursor: "pointer" },
  deleteLink: { color: "#dc2626", cursor: "pointer" },
  empty: { padding: 20, textAlign: "center", color: "#888" },
};
