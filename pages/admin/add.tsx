// pages/admin/index.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/authContext";
import { getSupabase } from "../../utils/supabaseClient";

type Rezervare = {
  id: number;
  nume: string;
  telefon: string;
  medic: string;
  serviciu: string;
  data: string;
  ora: string;
  created_at?: string;
};

type Medic = {
  id: number;
  nume: string;
  specializare?: string;
  created_at?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, initialized, signOut } = useAuth();
  const [checked, setChecked] = useState(false);
  const [rezervari, setRezervari] = useState<Rezervare[]>([]);
  const [medici, setMedici] = useState<Medic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // state formular rezervare
  const [form, setForm] = useState({ nume: "", telefon: "", medic: "", serviciu: "", ora: "" });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  const [submitting, setSubmitting] = useState(false);

  // state pentru medic
  const [newMedic, setNewMedic] = useState("");
  const [newSpecializare, setNewSpecializare] = useState("");

  // --- State pentru editare rezervări ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nume: "", telefon: "", medic: "", serviciu: "", ora: "" });

  // Verificare autentificare
  useEffect(() => {
    if (!initialized || checked) return;
    if (!user) {
      const redirect = encodeURIComponent("/admin");
      router.replace(`/admin/login?redirect=${redirect}`);
      setChecked(true);
    }
  }, [initialized, user, router, checked]);

  // Fetch rezervări
  const fetchRezervari = async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("rezervari")
      .select("id, nume, telefon, medic, serviciu, data, ora, created_at")
      .order("data", { ascending: true })
      .order("ora", { ascending: true });

    if (error) setError(error.message);
    else if (data) setRezervari(sortReservations(data as Rezervare[]));
    setLoading(false);
  };

  // Fetch medici
  const fetchMedici = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("medici")
      .select("id, nume, specializare, created_at")
      .order("nume", { ascending: true });

    if (!error && data) setMedici(data as Medic[]);
  };

  useEffect(() => {
    if (user) {
      fetchRezervari();
      fetchMedici();
    }
  }, [user]);

  // Adaugă medic
  const handleAddMedic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedic) {
      alert("Introdu numele medicului!");
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from("medici").insert([{ nume: newMedic, specializare: newSpecializare }]);
    if (error) {
      alert("Eroare la adăugare medic: " + error.message);
    } else {
      setNewMedic("");
      setNewSpecializare("");
      fetchMedici();
    }
  };

  // Ștergere medic
  const deleteMedic = async (id: number) => {
    if (!confirm("Sigur dorești să ștergi acest medic?")) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from("medici").delete().eq("id", id);
    if (!error) fetchMedici();
  };

  // Adaugă rezervare
  const handleAddRezervare = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = getSupabase();
    if (!supabase) return;

    const newRez = { ...form, data: selectedDate };
    const { error } = await supabase.from("rezervari").insert([newRez]);
    setSubmitting(false);

    if (error) alert("Eroare: " + error.message);
    else {
      setForm({ nume: "", telefon: "", medic: "", serviciu: "", ora: "" });
      fetchRezervari();
    }
  };

  // Ștergere rezervare
  const handleDeleteRezervare = async (id: number) => {
    if (!confirm("Sigur dorești să ștergi această rezervare?")) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from("rezervari").delete().eq("id", id);
    if (!error) fetchRezervari();
  };

  // Editare rezervare - preia date
  const handleEditRezervare = (rez: Rezervare) => {
    setEditingId(rez.id);
    setEditForm({
      nume: rez.nume,
      telefon: rez.telefon,
      medic: rez.medic,
      serviciu: rez.serviciu,
      ora: rez.ora,
    });
    setSelectedDate(rez.data);
  };

  // Salvare modificări rezervare
  const handleUpdateRezervare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from("rezervari")
      .update({ ...editForm, data: selectedDate })
      .eq("id", editingId);

    if (error) alert("Eroare: " + error.message);
    else {
      setEditingId(null);
      setEditForm({ nume: "", telefon: "", medic: "", serviciu: "", ora: "" });
      fetchRezervari();
    }
  };

  return (
    <main className="mx-auto max-w-6xl p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Panou Admin</h1>
        <button onClick={signOut} className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600">
          Logout
        </button>
      </div>

      {/* Gestionare Medici */}
      <div className="mb-8 rounded-lg border border-gray-200 p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Gestionare medici</h2>
        <form onSubmit={handleAddMedic} className="flex flex-col md:flex-row gap-4 mb-4">
          <input type="text" placeholder="Nume medic" value={newMedic} onChange={(e) => setNewMedic(e.target.value)}
            className="flex-1 rounded-md border px-3 py-2" required />
          <input type="text" placeholder="Specializare (opțional)" value={newSpecializare}
            onChange={(e) => setNewSpecializare(e.target.value)} className="flex-1 rounded-md border px-3 py-2" />
          <button type="submit" className="rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
            Adaugă medic
          </button>
        </form>
        {medici.length === 0 ? <p className="text-gray-500">Nu există medici înregistrați.</p> : (
          <ul className="divide-y divide-gray-200">
            {medici.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2">
                <span>{m.nume} {m.specializare ? `- ${m.specializare}` : ""}</span>
                <button onClick={() => deleteMedic(m.id)} className="bg-red-500 px-3 py-1 text-white text-sm rounded-md">
                  Șterge
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Formular rezervări */}
      <div className="mb-8 rounded-lg border p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Adaugă rezervare</h2>
        <form onSubmit={handleAddRezervare} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Nume" value={form.nume}
            onChange={(e) => setForm({ ...form, nume: e.target.value })} className="border px-3 py-2 rounded-md" required />
          <input type="text" placeholder="Telefon" value={form.telefon}
            onChange={(e) => setForm({ ...form, telefon: e.target.value })} className="border px-3 py-2 rounded-md" required />
          <select value={form.medic} onChange={(e) => setForm({ ...form, medic: e.target.value })}
            className="border px-3 py-2 rounded-md" required>
            <option value="">Selectează medic</option>
            {medici.map((m) => <option key={m.id} value={m.nume}>{m.nume}</option>)}
          </select>
          <input type="text" placeholder="Serviciu" value={form.serviciu}
            onChange={(e) => setForm({ ...form, serviciu: e.target.value })} className="border px-3 py-2 rounded-md" required />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-2 rounded-md" required />
          <input type="time" value={form.ora}
            onChange={(e) => setForm({ ...form, ora: e.target.value })} className="border px-3 py-2 rounded-md" required />
          <button type="submit" disabled={submitting} className="md:col-span-2 bg-green-500 px-4 py-2 text-white rounded-md">
            {submitting ? "Se adaugă..." : "Adaugă rezervare"}
          </button>
        </form>
      </div>

      {/* Listă rezervări */}
      <div className="rounded-lg border p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Rezervări</h2>
        {loading ? <p>Se încarcă...</p> : rezervari.length === 0 ? <p>Nu există rezervări.</p> : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">Nume</th>
                <th className="px-2 py-1 border">Telefon</th>
                <th className="px-2 py-1 border">Medic</th>
                <th className="px-2 py-1 border">Serviciu</th>
                <th className="px-2 py-1 border">Data</th>
                <th className="px-2 py-1 border">Ora</th>
                <th className="px-2 py-1 border">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {rezervari.map((rez) => (
                <tr key={rez.id} className="text-center">
                  <td className="border px-2 py-1">{rez.nume}</td>
                  <td className="border px-2 py-1">{rez.telefon}</td>
                  <td className="border px-2 py-1">{rez.medic}</td>
                  <td className="border px-2 py-1">{rez.serviciu}</td>
                  <td className="border px-2 py-1">{rez.data}</td>
                  <td className="border px-2 py-1">{rez.ora}</td>
                  <td className="border px-2 py-1 space-x-2">
                    <button onClick={() => handleEditRezervare(rez)}
                      className="bg-blue-500 px-3 py-1 text-white rounded-md text-sm">Editează</button>
                    <button onClick={() => handleDeleteRezervare(rez.id)}
                      className="bg-red-500 px-3 py-1 text-white rounded-md text-sm">Șterge</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Formular editare rezervare */}
      {editingId && (
        <div className="mt-8 rounded-lg border p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Editează rezervare</h2>
          <form onSubmit={handleUpdateRezervare} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={editForm.nume}
              onChange={(e) => setEditForm({ ...editForm, nume: e.target.value })}
              className="border px-3 py-2 rounded-md" required />
            <input type="text" value={editForm.telefon}
              onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })}
              className="border px-3 py-2 rounded-md" required />
            <select value={editForm.medic} onChange={(e) => setEditForm({ ...editForm, medic: e.target.value })}
              className="border px-3 py-2 rounded-md" required>
              <option value="">Selectează medic</option>
              {medici.map((m) => <option key={m.id} value={m.nume}>{m.nume}</option>)}
            </select>
            <input type="text" value={editForm.serviciu}
              onChange={(e) => setEditForm({ ...editForm, serviciu: e.target.value })}
              className="border px-3 py-2 rounded-md" required />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="border px-3 py-2 rounded-md" required />
            <input type="time" value={editForm.ora}
              onChange={(e) => setEditForm({ ...editForm, ora: e.target.value })}
              className="border px-3 py-2 rounded-md" required />
            <div className="md:col-span-2 space-x-2">
              <button type="submit" className="bg-blue-500 px-4 py-2 text-white rounded-md">Salvează</button>
              <button type="button" onClick={() => setEditingId(null)}
                className="bg-gray-400 px-4 py-2 text-white rounded-md">Anulează</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

// --- Helper sort ---
function sortReservations(data: Rezervare[]): Rezervare[] {
  return data.sort((a, b) => {
    if (a.data === b.data) return a.ora.localeCompare(b.ora);
    return a.data.localeCompare(b.data);
  });
}
