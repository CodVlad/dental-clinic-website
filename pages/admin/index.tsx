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
  status?: string;
  created_at?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, initialized, signOut } = useAuth();
  const [checked, setChecked] = useState(false);
  const [rezervari, setRezervari] = useState<Rezervare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ nume: "", telefon: "", medic: "", serviciu: "", ora: "" });
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  const [showFuture, setShowFuture] = useState<boolean>(false);
  const [exportingDoc, setExportingDoc] = useState<boolean>(false);

  // --- State pentru editare ---
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

  // Fetch reservations
  const fetchRezervari = async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("rezervari")
      .select("id, nume, telefon, medic, serviciu, data, ora, status, created_at")
      .order("data", { ascending: true })
      .order("ora", { ascending: true });

    if (error) setError(error.message);
    else if (data) setRezervari(sortReservations(data as Rezervare[]));
    setLoading(false);
  };

  // Export DOC
  const exportDOC = () => {
    try {
      setExportingDoc(true);
      const rows = rezervari;
      const title = "Raport Rezervări";
      const subtitle = showFuture
        ? "Toate rezervările din azi și viitor"
        : `Rezervări pentru ${selectedDate}`;
      const generatedAt = new Date().toLocaleString();

      const style = `
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #111827; }
          h1 { font-size: 22px; margin: 0 0 6px; }
          p { margin: 4px 0 12px; color: #374151; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; }
          th { background: #f3f4f6; text-align: left; }
          tr:nth-child(even) { background: #fafafa; }
        </style>
      `;

      const header = `
        <tr>
          <th>ID</th>
          <th>Nume</th>
          <th>Telefon</th>
          <th>Medic</th>
          <th>Serviciu</th>
          <th>Data</th>
          <th>Ora</th>
          <th>Status</th>
          <th>Creat la</th>
        </tr>
      `;

      const body = rows
        .map(
          (r) => `
          <tr>
            <td>${r.id ?? ""}</td>
            <td>${r.nume ?? ""}</td>
            <td>${r.telefon ?? ""}</td>
            <td>${r.medic ?? ""}</td>
            <td>${r.serviciu ?? ""}</td>
            <td>${r.data ?? ""}</td>
            <td>${r.ora ?? ""}</td>
            <td>${r.status ?? "Pending"}</td>
            <td>${r.created_at ?? ""}</td>
          </tr>`
        )
        .join("");

      const html = `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            ${style}
            <title>${title}</title>
          </head>
          <body>
            <h1>${title}</h1>
            <p>${subtitle}</p>
            <p><strong>Generat la:</strong> ${generatedAt}</p>
            <table>
              <thead>${header}</thead>
              <tbody>${body}</tbody>
            </table>
          </body>
        </html>`;

      const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const suffix = showFuture ? "toate_viitor" : selectedDate;
      a.href = url;
      a.download = `rezervari_${suffix}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExportingDoc(false);
    }
  };

  useEffect(() => {
    if (user) fetchRezervari();
  }, [user]);

  const fetchForFilter = async (date: string, showAll: boolean) => {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    let query = supabase
      .from("rezervari")
      .select("id, nume, telefon, medic, serviciu, data, ora, status, created_at");
    if (showAll) {
      // Afișează toate rezervările (trecut, prezent, viitor)
      query = query.order("data", { ascending: true }).order("ora", { ascending: true });
    } else {
      query = query.eq("data", date).order("ora", { ascending: true });
    }
    const { data, error } = await query;
    if (error) setError(error.message);
    else setRezervari(sortReservations((data || []) as Rezervare[]));
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchForFilter(selectedDate, showFuture);
  }, [user, selectedDate, showFuture]);

  // Add reservation
  const handleAddRezervare = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.nume || !form.telefon || !form.medic || !form.serviciu || !form.ora) {
      alert("Completează toate câmpurile: nume, telefon, medic, serviciu și ora.");
      return;
    }

    const supabase = getSupabase();
    if (!supabase) return;

    try {
      setSubmitting(true);
      const now = new Date();
      const data = now.toISOString().slice(0, 10);

      const { error } = await supabase.from("rezervari").insert([{
        nume: form.nume,
        telefon: form.telefon,
        medic: form.medic,
        serviciu: form.serviciu,
        data,
        ora: form.ora,
        status: "Pending"
      }]);

      if (error) {
        alert("Eroare la adăugare: " + error.message);
      } else {
        setForm({ nume: "", telefon: "", medic: "", serviciu: "", ora: "" });
        await fetchRezervari();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm rezervare
  const confirmRezervare = async (id: number) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from("rezervari").update({ status: "Confirmed" }).eq("id", id);
    if (error) {
      alert("Eroare la confirmare: " + error.message);
    } else {
      setRezervari((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Confirmed" } : r))
      );
    }
  };

  // Delete reservation
  const deleteRezervare = async (id: number) => {
    if (!confirm("Sigur doriți să ștergeți această rezervare?")) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const prev = rezervari;
    setRezervari((cur) => cur.filter((r) => r.id !== id));
    const { error } = await supabase.from("rezervari").delete().eq("id", id);
    if (error) {
      alert("Eroare la ștergere: " + error.message);
      setRezervari(prev);
    }
  };

  // --- Funcții editare ---
  const startEdit = (r: Rezervare) => {
    setEditingId(r.id);
    setEditForm({ nume: r.nume, telefon: r.telefon, medic: r.medic, serviciu: r.serviciu, ora: r.ora });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ nume: "", telefon: "", medic: "", serviciu: "", ora: "" });
  };

  const saveEdit = async (id: number) => {
    if (!editForm.nume || !editForm.telefon || !editForm.medic || !editForm.serviciu || !editForm.ora) {
      alert("Completează toate câmpurile!");
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase
      .from("rezervari")
      .update({ ...editForm })
      .eq("id", id);
    if (error) {
      alert("Eroare la salvare: " + error.message);
    } else {
      setRezervari((prev) => prev.map((r) => (r.id === id ? { ...r, ...editForm } : r)));
      cancelEdit();
    }
  };

  if (!initialized || !user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Se verifică autentificarea...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Rezervări</h1>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={exportDOC}
            disabled={exportingDoc || rezervari.length === 0}
            className="rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {exportingDoc ? "Se exportă..." : "Export DOC"}
          </button>
          <button
            onClick={() => fetchRezervari()}
            className="rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
          >
            Reîncarcă
          </button>
          <button
            onClick={signOut}
            className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Selector dată */}
      <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Alege data</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={showFuture}
            className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white disabled:opacity-60"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showFuture}
            onChange={(e) => setShowFuture(e.target.checked)}
            className="h-4 w-4"
          />
          Afișează toate rezervările (trecut, prezent, viitor)
        </label>
      </div>

      {/* Formular adăugare rezervare */}
      <div className="mb-6 rounded-lg border border-gray-200 p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Adaugă rezervare</h2>
        <form onSubmit={handleAddRezervare} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nume pacient</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.nume}
              onChange={(e) => setForm({ ...form, nume: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Telefon</label>
            <input
              type="tel"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.telefon}
              onChange={(e) => setForm({ ...form, telefon: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Alege medic</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.medic}
              onChange={(e) => setForm({ ...form, medic: e.target.value })}
              required
            >
              <option value="">-- Selectează medic --</option>
              <option value="Dr. Popescu">Dr. Popescu</option>
              <option value="Dr. Ionescu">Dr. Ionescu</option>
              <option value="Dr. Georgescu">Dr. Georgescu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Serviciu</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.serviciu}
              onChange={(e) => setForm({ ...form, serviciu: e.target.value })}
              required
            >
              <option value="">-- Selectează serviciu --</option>
              <option value="Consult">Consult</option>
              <option value="Analize">Analize</option>
              <option value="Tratament">Tratament</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ora rezervare</label>
            <input
              type="time"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.ora}
              onChange={(e) => setForm({ ...form, ora: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:opacity-60"
            >
              {submitting ? "Se adaugă..." : "Adaugă"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel rezervări */}
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-4">{error}</div>
      ) : loading ? (
        <div className="text-gray-500 mb-4">Se încarcă...</div>
      ) : rezervari.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-6 text-gray-600 bg-white shadow-sm">
          Nu există rezervări încă.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
          <table className="min-w-full table-auto">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nume</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Telefon</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Medic</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Serviciu</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Data</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ora</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rezervari.map((r) => (
                <tr key={r.id}>
                  {editingId === r.id ? (
                    <>
                      <td><input value={editForm.nume} onChange={(e) => setEditForm({ ...editForm, nume: e.target.value })} className="border rounded px-2 py-1 w-full" /></td>
                      <td><input value={editForm.telefon} onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })} className="border rounded px-2 py-1 w-full" /></td>
                      <td><input value={editForm.medic} onChange={(e) => setEditForm({ ...editForm, medic: e.target.value })} className="border rounded px-2 py-1 w-full" /></td>
                      <td><input value={editForm.serviciu} onChange={(e) => setEditForm({ ...editForm, serviciu: e.target.value })} className="border rounded px-2 py-1 w-full" /></td>
                      <td>{r.data}</td>
                      <td><input value={editForm.ora} onChange={(e) => setEditForm({ ...editForm, ora: e.target.value })} className="border rounded px-2 py-1 w-full" /></td>
                      <td>{r.status || "Pending"}</td>
                      <td className="flex gap-2">
                        <button className="bg-green-500 px-3 py-1 text-white rounded" onClick={() => saveEdit(r.id)}>Salvează</button>
                        <button className="bg-gray-400 px-3 py-1 text-white rounded" onClick={cancelEdit}>Renunță</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-3 text-sm text-gray-700">{r.nume}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{r.telefon}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{r.medic}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{r.serviciu}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{r.data}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{r.ora}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{r.status || "Pending"}</td>
                      <td className="px-6 py-3 text-sm text-gray-700 flex gap-2">
                        {r.status !== "Confirmed" && (
                          <button
                            className="rounded-md bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                            onClick={() => confirmRezervare(r.id)}
                          >
                            Confirmă
                          </button>
                        )}
                        <button
                          className="rounded-md bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                          onClick={() => startEdit(r)}
                        >
                          Editează
                        </button>
                        <button
                          className="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                          onClick={() => deleteRezervare(r.id)}
                        >
                          Șterge
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

// --- Helper sort function ---
function sortReservations(data: Rezervare[]): Rezervare[] {
  return data.sort((a, b) => {
    if (a.data === b.data) return a.ora.localeCompare(b.ora);
    return a.data.localeCompare(b.data);
  });
}
