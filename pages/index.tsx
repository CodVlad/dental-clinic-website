import React, { useEffect, useMemo, useState } from "react";
import { getSupabase } from "../utils/supabaseClient";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTooth } from '@fortawesome/free-solid-svg-icons';
import 'animate.css';

function generateTimeSlots(start = 9, end = 20, stepMinutes = 60) {
  const slots: string[] = [];
  for (let h = start; h < end; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

function todayISO() {
  const now = new Date();
  const romaniaTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Bucharest"}));
  return romaniaTime.toISOString().split("T")[0];
}

function getRomaniaDate() {
  return new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Bucharest"}));
}

function isValidFutureDate(dateString: string) {
  const selectedDate = new Date(dateString + 'T00:00:00');
  const romaniaNow = getRomaniaDate();
  romaniaNow.setHours(0, 0, 0, 0);
  return selectedDate >= romaniaNow;
}

const medici = [
  { id: "popescu", name: "Dr. Alexandru Popescu", role: "Medic Stomatolog Principal" },
  { id: "ionescu", name: "Dr. Adrian Ionescu", role: "Ortodont" },
  { id: "marinescu", name: "Dr. Maria Marinescu", role: "Chirurg Oral" },
  { id: "constantinescu", name: "Dr. Ana Constantinescu", role: "Igienist Dentar" },
];

const services = [
  { 
    id: "consultatie", 
    name: "Consultație", 
    durata: 30,
    description: "Examinare completă a sănătății dentare, diagnostic profesional și planificare tratament personalizat pentru nevoile tale specifice."
  },
  { 
    id: "detartraj", 
    name: "Detartraj", 
    durata: 60,
    description: "Curățare profesională profundă pentru eliminarea tartrului și a plăcii bacteriene, asigurând igiena orală optimă."
  },
  { 
    id: "extractie", 
    name: "Extracție", 
    durata: 45,
    description: "Extracție dentară sigură și fără durere, efectuată cu tehnici moderne și în condiții de siguranță maximă."
  },
  { 
    id: "implant", 
    name: "Implant Dentar", 
    durata: 120,
    description: "Soluție durabilă pentru înlocuirea dinților, folosind tehnologie avansată pentru rezultate naturale și de lungă durată."
  },
  { 
    id: "ortodontie", 
    name: "Ortodonție", 
    durata: 90,
    description: "Corectarea poziției dinților cu aparate dentare moderne, pentru un zâmbet armonios și sănătate orală optimă."
  },
  { 
    id: "estetica", 
    name: "Estetică Dentară", 
    durata: 60,
    description: "Tratamente estetice pentru un zâmbet strălucitor: albire profesională, fațete dentare și proceduri cosmetice de înaltă calitate."
  },
];

function ClientAvailability({ selectedDate, selectedMedic, onSelectSlot, onSlotsChange, onMedicChange }: {
  selectedDate: string;
  selectedMedic: string;
  onSelectSlot: (date: string, time: string) => void;
  onSlotsChange: (slots: string[]) => void;
  onMedicChange: (medic: string) => void;
}) {
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const freeSlots = useMemo(() => {
    const free = timeSlots.filter(t => !bookedTimes.includes(t));
    onSlotsChange(free);
    return free;
  }, [timeSlots, bookedTimes, onSlotsChange]);

  useEffect(() => {
    const fetchBookedTimes = async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      
      setLoading(true);
      const { data } = await supabase
        .from("rezervari")
        .select("ora")
        .eq("data", selectedDate)
        .eq("medic", selectedMedic);
      
      setBookedTimes(data?.map(r => r.ora) || []);
      setLoading(false);
    };

    fetchBookedTimes();

    const supabase = getSupabase();
    if (supabase) {
      const channel = supabase
        .channel('rezervari-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'rezervari'
          }, 
          (payload: any) => {
            if (payload.new && payload.new.data === selectedDate && payload.new.medic === selectedMedic) {
              fetchBookedTimes();
            } else if (payload.old && payload.old.data === selectedDate && payload.old.medic === selectedMedic) {
              fetchBookedTimes();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedDate, selectedMedic]);

  return (
    <div className="space-y-8">
      <div>
        <label className="flex items-center text-sm font-bold text-gray-800 mb-3">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Selectează Data
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onSelectSlot(e.target.value, "")}
          min={todayISO()}
          className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-900 bg-white shadow-md hover:border-blue-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
        />
      </div>

      <div>
        <label className="flex items-center text-sm font-bold text-gray-800 mb-3">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Selectează Medicul
        </label>
        <select
          value={selectedMedic}
          onChange={(e) => {
            const newMedic = e.target.value;
            onMedicChange(newMedic);
            onSelectSlot(selectedDate, "");
          }}
          className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-900 bg-white shadow-md hover:border-blue-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer text-lg font-medium"
        >
          {medici.map((medic) => (
            <option key={medic.id} value={medic.id}>
              {medic.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center text-sm font-bold text-gray-800 mb-3">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ore Disponibile
        </label>
        <div className="grid grid-cols-3 gap-4 max-h-80 overflow-y-auto p-2 bg-gray-50 rounded-2xl">
          {loading ? (
            <div className="col-span-3 flex items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FontAwesomeIcon icon={faTooth} className="text-blue-600 text-lg" />
                </div>
              </div>
            </div>
          ) : timeSlots.filter(t => !bookedTimes.includes(t)).length === 0 ? (
            <div className="col-span-3 text-center py-16">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-base text-gray-600 font-semibold">Nu sunt ore disponibile pentru această dată</p>
              <p className="text-sm text-gray-500 mt-2">Te rugăm să alegi o altă dată</p>
            </div>
          ) : (
            timeSlots.filter(t => !bookedTimes.includes(t)).map((t) => (
              <button
                key={t}
                onClick={() => onSelectSlot(selectedDate, t)}
                className="rounded-2xl px-5 py-4 text-base font-bold transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 border-2 border-transparent hover:border-blue-300"
              >
                {t}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ReservationForm({ selectedDate, onChangeDate, prefillTime, freeSlots }: {
  selectedDate: string;
  onChangeDate: (date: string) => void;
  prefillTime: string;
  freeSlots: string[];
}) {
  const [form, setForm] = useState({
    nume: "",
    telefon: "",
    email: "",
    medic: medici[0].id,
    serviciu: services[0].id,
    data: selectedDate,
    ora: prefillTime,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setForm(prev => ({ ...prev, data: selectedDate, ora: prefillTime }));
  }, [selectedDate, prefillTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.data || !form.ora) {
      alert("Te rugăm să selectezi data și ora!");
      return;
    }
    
    if (!isValidFutureDate(form.data)) {
      alert("Te rugăm să selectezi o dată din viitor!");
      return;
    }

    setSubmitting(true);
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data: existingBookings } = await supabase
        .from("rezervari")
        .select("ora")
        .eq("data", form.data)
        .eq("medic", form.medic)
        .eq("ora", form.ora);
      
      if (existingBookings && existingBookings.length > 0) {
        alert("Această oră a fost deja rezervată! Te rugăm să alegi o altă oră.");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("rezervari").insert([form]);
      if (error) throw error;
      
      setSubmitted(true);
      setForm({
        nume: "",
        telefon: "",
        email: "",
        medic: medici[0].id,
        serviciu: services[0].id,
        data: selectedDate,
        ora: "",
      });
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      alert("Eroare: " + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200 rounded-3xl p-12 text-center shadow-2xl">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-pulse">
          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-4xl font-extrabold text-black mb-4">Mulțumim!</h3>
        <p className="text-xl text-gray-700 font-medium mb-2">Rezervarea ta a fost trimisă cu succes!</p>
        <p className="text-base text-gray-600">Vei primi un email de confirmare în scurt timp.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="flex items-center text-sm font-bold text-gray-800 mb-3">
            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Nume Complet *
          </label>
      <input
            type="text"
        value={form.nume}
        onChange={(e) => setForm({ ...form, nume: e.target.value })}
        required
            className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-900 bg-white shadow-md hover:border-blue-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
            placeholder="Nume complet"
          />
        </div>
        <div>
          <label className="flex items-center text-sm font-bold text-gray-800 mb-3">
            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email *
          </label>
      <input
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-900 bg-white shadow-md hover:border-blue-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
            placeholder="Email"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="flex items-center text-sm font-bold text-gray-800 mb-3">
            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Data Programării *
          </label>
      <input
        type="date"
        value={form.data}
            onChange={(e) => {
              setForm({ ...form, data: e.target.value });
              onChangeDate(e.target.value);
            }}
        required
            min={todayISO()}
            className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-900 bg-white shadow-md hover:border-blue-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
          />
        </div>
        <div>
          <label className="flex items-center text-sm font-bold text-gray-800 mb-3">
            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ora Programării *
          </label>
          <select
        value={form.ora}
        onChange={(e) => setForm({ ...form, ora: e.target.value })}
        required
            className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-900 bg-white shadow-md hover:border-blue-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer text-lg font-medium"
          >
            <option value="">Selectează ora</option>
            {freeSlots.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center text-sm font-bold text-gray-800 mb-3">
          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Număr Telefon *
        </label>
        <input
          type="tel"
          value={form.telefon}
          onChange={(e) => setForm({ ...form, telefon: e.target.value })}
          required
          className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-900 bg-white shadow-md hover:border-blue-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
          placeholder="Număr telefon"
        />
      </div>

      <div>
        <label className="flex items-center text-sm font-bold text-gray-800 mb-3">
          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Note Adiționale
        </label>
        <textarea
          rows={4}
          className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-900 bg-white shadow-md hover:border-blue-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none text-lg"
          placeholder="Note adiționale (opțional)"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white font-bold py-5 px-8 rounded-2xl hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] text-lg"
      >
        {submitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Se procesează...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            Rezervă Locul Tău
          </span>
        )}
      </button>
    </form>
  );
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [selectedMedic, setSelectedMedic] = useState<string>(medici[0].id);
  const [prefillTime, setPrefillTime] = useState<string>("");
  const [freeSlots, setFreeSlots] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleSelectSlot = (date: string, time: string) => {
    if (date) {
      setSelectedDate(date);
    }
    if (time) {
      setPrefillTime(time);
    }
  };

  const handleMedicChange = (medic: string) => {
    setSelectedMedic(medic);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white border-b border-blue-50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
            <a href="#home" className="flex items-center space-x-1.5 sm:space-x-2 group flex-shrink-0" onClick={() => setMobileMenuOpen(false)}>
              <img src="/logo.png" alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain transition-all duration-300 transform group-hover:scale-110" />
              <div className="min-w-0">
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 bg-clip-text text-transparent block truncate">ApexCare</span>
                <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-blue-600 uppercase tracking-wider hidden sm:block">Stomatologie Premium</span>
              </div>
            </a>

            {/* Navigare Desktop */}
            <nav className="hidden lg:flex items-center space-x-10">
              <a href="#home" className="text-gray-800 hover:text-blue-600 transition-colors font-semibold relative group text-base">
                Acasă
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 to-blue-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </a>
              <a href="#despre" className="text-gray-800 hover:text-blue-600 transition-colors font-semibold relative group text-base">
                Despre
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 to-blue-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </a>
              <a href="#dece" className="text-gray-800 hover:text-blue-600 transition-colors font-semibold relative group text-base">
                De ce noi
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 to-blue-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </a>
              <a href="#servicii" className="text-gray-800 hover:text-blue-600 transition-colors font-semibold relative group text-base">
                Servicii
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 to-blue-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </a>
              <a href="#echipa" className="text-gray-800 hover:text-blue-600 transition-colors font-semibold relative group text-base">
                Echipa
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 to-blue-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </a>
              <a href="#preturi" className="text-gray-800 hover:text-blue-600 transition-colors font-semibold relative group text-base">
                Prețuri
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 to-blue-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </a>
            </nav>

            {/* Buton Desktop */}
            <button 
              onClick={() => document.getElementById('programare')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden lg:block bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white px-8 py-3.5 rounded-[50px] hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-105 text-base"
            >
              Programează-te
            </button>

            {/* Buton Meniu Mobil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex flex-col justify-center items-center w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 space-y-1.5 focus:outline-none ml-2"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 sm:w-6 h-0.5 bg-gray-800 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-5 sm:w-6 h-0.5 bg-gray-800 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 sm:w-6 h-0.5 bg-gray-800 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>

          {/* Meniu Mobil */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <nav className="py-6 sm:py-8 bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 border-t-2 border-blue-100 shadow-lg">
              <div className="space-y-1">
                <a 
                  href="#home" 
                  className="block text-gray-800 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-semibold py-3 px-4 rounded-lg text-base relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="relative z-10">Acasă</span>
                  <span className="absolute left-0 top-0 w-1 h-full bg-blue-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                </a>
                <a 
                  href="#despre" 
                  className="block text-gray-800 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-semibold py-3 px-4 rounded-lg text-base relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="relative z-10">Despre</span>
                  <span className="absolute left-0 top-0 w-1 h-full bg-blue-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                </a>
                <a 
                  href="#dece" 
                  className="block text-gray-800 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-semibold py-3 px-4 rounded-lg text-base relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="relative z-10">De ce noi</span>
                  <span className="absolute left-0 top-0 w-1 h-full bg-blue-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                </a>
                <a 
                  href="#servicii" 
                  className="block text-gray-800 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-semibold py-3 px-4 rounded-lg text-base relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="relative z-10">Servicii</span>
                  <span className="absolute left-0 top-0 w-1 h-full bg-blue-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                </a>
                <a 
                  href="#echipa" 
                  className="block text-gray-800 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-semibold py-3 px-4 rounded-lg text-base relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="relative z-10">Echipa</span>
                  <span className="absolute left-0 top-0 w-1 h-full bg-blue-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                </a>
                <a 
                  href="#preturi" 
                  className="block text-gray-800 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-semibold py-3 px-4 rounded-lg text-base relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="relative z-10">Prețuri</span>
                  <span className="absolute left-0 top-0 w-1 h-full bg-blue-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                </a>
              </div>
              <div className="mt-6 pt-6 border-t-2 border-blue-100">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.getElementById('programare')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white px-6 py-4 rounded-[50px] hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-105 text-base"
                >
                  Programează-te
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Secțiunea Principală */}
      <section id="home" className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-16 pb-32 lg:pt-20 lg:pb-40 relative overflow-hidden mx-[15px] rounded-b-3xl">
        {/* Umbră de culoarea butonului pe jumătate din partea de jos */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-600/40 via-blue-600/25 to-transparent"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%233b82f6' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Partea stângă - Conținut text */}
            <div>
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-5 py-2 rounded-full text-xs font-semibold mb-8 shadow-sm border border-blue-200">
                #1 Centru Stomatologic Premium
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 sm:mb-8 leading-tight sm:leading-relaxed">
                Luminează-ți<br />
                <span className="text-gray-900">Zâmbetul</span>
                <br />
                <span className="text-gray-900 italic">cu Îngrijire Expertă</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 md:mb-10 leading-relaxed font-light">
                Oferim servicii stomatologice de cea mai înaltă calitate cu tehnologie modernă și echipă de specialiști experimentați pentru zâmbetul tău perfect.
              </p>
              <div className="flex items-center">
                <button 
                  onClick={() => document.getElementById('programare')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white px-6 sm:px-8 md:px-10 pr-16 sm:pr-20 md:pr-20 py-3 sm:py-3.5 md:py-4 rounded-[50px] text-sm sm:text-base md:text-lg font-bold hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 inline-flex items-center focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-xl hover:shadow-2xl transform hover:scale-105 relative w-full sm:w-auto"
                >
                  <span>Programează Vizita</span>
                  <div className="absolute right-[3px] top-1/2 -translate-y-1/2 w-12 h-12 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
              </div>
            </div>

        {/* Imagine poziționată în partea dreaptă jos - Ascunsă pe mobil */}
        <div className="hidden lg:flex absolute bottom-0 right-0 w-full lg:w-1/2 items-end justify-end overflow-visible z-[0]">
              <img 
            src="/dental2-removebg-preview.png" 
                alt="Medic stomatolog și pacient mulțumit"
            className="h-auto max-w-full object-contain scale-150 lg:scale-[1.50] origin-bottom-right"
                loading="eager"
              />
        </div>
      </section>

      {/* Secțiunea cu Trei Carduri - Poziționată între Secțiunea Principală și Despre */}
      <div className="relative -mt-25  z-[1] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Cardul 1 - Medici Îngrijitori cu 2 carduri mici în interior */}
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-row lg:grid lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 items-start">
                {/* Partea stângă - Conținut text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Medici Îngrijitori</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                    Sănătatea și siguranța ta sunt prioritatea noastră
                  </p>
                  <a href="#servicii" className="inline-flex items-center space-x-2 text-blue-600 font-bold hover:text-blue-700 transition-colors group text-xs sm:text-sm">
                <span>Explorează Mai Mult</span>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
                
                {/* Partea dreaptă - Două carduri mici */}
                <div className="flex-shrink-0 grid grid-cols-2 gap-2 sm:gap-3 w-40 sm:w-60 md:w-75 lg:w-auto">
                  {/* Cardul mic 1 - Zâmbete Transformate */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-gray-100 shadow-sm min-w-0">
                    <div className="mb-1.5 sm:mb-2">
                      <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider sm:tracking-widest leading-tight break-words">Zâmbete Transformate</span>
              </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600 leading-none whitespace-nowrap">
                      5,000+
            </div>
          </div>
                  
                  {/* Cardul mic 2 - Imagine */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-1.5 sm:p-2 border border-gray-100 shadow-sm overflow-hidden min-w-0">
                    <div className="relative h-20 sm:h-24 rounded-md sm:rounded-lg overflow-hidden">
                      <img 
                        src="https://cdn.prod.website-files.com/68a75398e3a48150f39441ec/68a8c93215f3c5d927e4c128_80efffe52aada4fdd2ec2c88b5a412ba_dental-implants-surgery-concept-3d-rendering-transparent-psd-file%201.avif" 
                        alt="Chirurgie implanturi dentare"
                  className="w-full h-full object-cover"
                />
              </div>
                </div>
              </div>
            </div>
              </div>
              
            {/* Cardul 3 - Testimonial */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 h-full relative">
              {/* Iconiță coroană în stânga sus */}
              <div className="absolute top-4 left-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
              <div className="flex flex-col items-center justify-center text-center h-full space-y-2">
                <p className="text-base text-gray-700 italic leading-relaxed">
                  "Best dentist experience ever! Friendly staff and pain-free visits."
                </p>
                <p className="text-gray-600 font-semibold text-sm">— Sarah M.</p>
                </div>
              </div>

                </div>
                </div>
                </div>

      {/* Secțiunea Despre */}
      <section id="despre" className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center space-x-2 text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Despre ApexCare</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black leading-tight">
                Partenerii tăi de <span className="text-black">încredere</span> în <span className="text-black">îngrijirea dentară</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                La ApexCare, credem că un zâmbet sănătos este un zâmbet fericit. Echipa noastră dedicată de profesioniști combină ani de experiență, tehnologie de ultimă generație și o atmosferă caldă și îngrijitoare pentru a vă asigura cea mai bună îngrijire dentară posibilă.
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                  <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">15+</div>
                  <p className="text-sm sm:text-base text-gray-600 font-semibold">Ani Experiență</p>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                  <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">5K+</div>
                  <p className="text-sm sm:text-base text-gray-600 font-semibold">Pacienți Mulțumiți</p>
                </div>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-teal-200 rounded-2xl sm:rounded-3xl transform -rotate-3 opacity-50"></div>
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white md:max-w-lg md:mx-auto lg:max-w-none">
                <img 
                  src="https://cdn.prod.website-files.com/68a75398e3a48150f39441ec/68aaa0f7663e114eb6ee158a_Appointment.avif" 
                  alt="Echipă medicală profesională ApexCare"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secțiunea De Ce Să Ne Alegi */}
      <section id="dece" className="py-16 sm:py-24 md:py-32 bg-white relative overflow-hidden">
        {/* Elemente de fundal subtile */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-blue-50/30"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Antet și Badge Certificat pe același rând */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center mb-12 sm:mb-16 md:mb-20">
            {/* Partea stângă - Antet */}
            <div>
            <div className="inline-block mb-4 sm:mb-6">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em]">De Ce Să Ne Alegi</span>
            </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                De ce ne iubesc pacienții noștri
            </h2>
          </div>

            {/* Partea dreaptă - Badge Certificat */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 justify-end">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl sm:rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm flex-shrink-0">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
              <div className="text-center md:text-left">
              <p className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">Certificat de Asociația Stomatologilor din România</p>
              <button 
                onClick={() => document.getElementById('programare')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center space-x-2 transition-colors text-sm sm:text-base"
              >
                <span>Programează Vizita</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              </div>
            </div>
          </div>

          {/* Grid Caracteristici - 2 coloane pe mobil, 2 pe tabletă, 4 pe desktop */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-0">
            {/* Caracteristica 1 */}
            <div className="group bg-white rounded-tl-3xl md:rounded-tl-3xl lg:rounded-tl-3xl rounded-tr-none md:rounded-tr-none lg:rounded-tr-none rounded-bl-none md:rounded-bl-none lg:rounded-bl-3xl rounded-br-none md:rounded-br-none lg:rounded-br-none p-6 md:p-12 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon icon={faTooth} className="text-blue-600 text-xl md:text-2xl" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">Medici Experți și Îngrijitori</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Cu peste 25 de ani de experiență, echipa noastră oferă îngrijire expertă cu o atingere blândă, asigurând o experiență confortabilă și eficientă de fiecare dată.
              </p>
            </div>

            {/* Caracteristica 2 */}
            <div className="group bg-white rounded-tr-3xl md:rounded-tr-3xl lg:rounded-none rounded-tl-none md:rounded-tl-none lg:rounded-tl-none rounded-bl-none md:rounded-bl-none lg:rounded-bl-none rounded-br-none md:rounded-br-none lg:rounded-br-none p-6 md:p-12 border border-gray-100 hover:border-teal-200 transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">Tehnologie de Ultimă Generație</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Folosim cea mai recentă tehnologie dentară pentru a oferi tratamente precise, eficiente și eficiente, reducând disconfortul.
              </p>
            </div>

            {/* Caracteristica 3 */}
            <div className="group bg-white rounded-bl-3xl md:rounded-bl-3xl lg:rounded-none rounded-tl-none md:rounded-tl-none lg:rounded-tl-none rounded-tr-none md:rounded-tr-none lg:rounded-tr-none rounded-br-none md:rounded-br-none lg:rounded-br-none p-6 md:p-12 border border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">Îngrijire Completă pentru Întreaga Familie</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                De la consultații de rutină la tratamente avansate, oferim servicii dentare pentru toate vârstele — asigurând că întreaga familie primește cea mai bună îngrijire.
              </p>
            </div>

            {/* Caracteristica 4 */}
            <div className="group relative rounded-br-3xl md:rounded-br-3xl lg:rounded-tr-3xl lg:rounded-br-3xl rounded-tl-none md:rounded-tl-none lg:rounded-tl-none rounded-tr-none md:rounded-tr-none rounded-bl-none md:rounded-bl-none lg:rounded-bl-none p-6 md:p-12 border border-gray-100 hover:border-green-200 transition-all duration-300 hover:shadow-lg overflow-hidden h-full flex items-end">
              {/* Imagine de Fundal */}
              <div className="absolute inset-0">
                <img 
                  src="https://cdn.prod.website-files.com/68a75398e3a48150f39441ec/68aaaa6dd68127fbc66780c7_7f541bd1534d80f11485561bcf16ea48_Whitening.avif" 
                  alt="Whitening"
                  className="w-full h-full object-cover"
                />
                {/* Suprapunere albastru închis doar în partea de jos */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-900 via-blue-900/90 to-transparent"></div>
              </div>
              {/* Conținut */}
              <div className="relative z-10 w-full">
                <h3 className="text-base md:text-lg font-bold text-white">Prețuri Accesibile și Transparente</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secțiunea Servicii */}
      <section id="servicii" className="py-32 bg-gray-50 relative overflow-hidden">
        {/* Elemente de fundal subtile */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Antet */}
          <div className="text-left mb-20">
            <div className="inline-block mb-6">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em]">SERVICII</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Îngrijire dentară completă pentru zâmbetul tău
            </h2>
          </div>

          {/* Layout Servicii și Imagine */}
          <div className="grid lg:grid-cols-2 gap-12 items-stretch mb-16">
            {/* Partea stângă - Lista Servicii */}
            <div className="space-y-0 flex flex-col">
            {services.map((service, index) => {
              return (
                  <div key={service.id} className="group py-6 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors animate__animated animate__fadeInLeft" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="text-3xl font-extrabold text-black italic">
                        0{index + 1}
                      </div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {service.name}
                    </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

            {/* Partea dreaptă - Imagine */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl md:max-w-lg md:mx-auto lg:max-w-none">
                <img 
                  src="https://cdn.prod.website-files.com/68ab46f5adc877b0da3d62f7/68ab47d9c3a6a586fe0ec9c7_blog-img-1.jpg" 
                  alt="Servicii dentare"
                  className="w-full h-auto object-contain"
                />
              </div>
                </div>
              </div>

        </div>
      </section>

      {/* Secțiunea Poveste de Succes */}
      <section className="py-24 bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all duration-300 relative">
              {/* Iconiță citat */}
              <div className="absolute top-6 right-6">
                <svg className="w-12 h-12 text-blue-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                      </svg>
                  </div>
              <p className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wider"># Poveste de Succes</p>
              <p className="text-3xl text-gray-900 mb-8 leading-relaxed font-medium relative z-10">
                "Cea mai bună experiență dentară pe care am avut-o vreodată! Personal prietenos și tratament fără durere."
              </p>
              <div className="flex items-center space-x-4 pt-6 border-t border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SM</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Sarah M</p>
                  <p className="text-gray-600">Pacient Albire Dentară</p>
                  </div>
                </div>
              </div>
            <div className="rounded-2xl h-96 overflow-hidden shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all duration-300">
              <img 
                src="https://cdn.prod.website-files.com/68a75398e3a48150f39441ec/68ac3354f430da4defbfc5f5_group-medical-experts-talking-while-using-laptop-meeting-hospital%201.avif" 
                alt="Poveste de Succes" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="mb-6">
                <svg className="w-12 h-12 text-blue-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.432.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              <p className="text-gray-700 mb-8 text-lg italic leading-relaxed">
                "Experiență uimitoare! Echipa este îngrijitoare, blândă și profesională. Zâmbetul meu nu a arătat niciodată mai bine—recomand cu căldură serviciile lor dentare"
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  J
                </div>
                <div>
                  <p className="font-bold text-gray-900">Juairiya</p>
                  <p className="text-sm text-gray-600">Asistent Medical</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="mb-6">
                <svg className="w-12 h-12 text-blue-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.432.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              <p className="text-gray-700 mb-8 text-lg italic leading-relaxed">
                "Personalul m-a făcut să mă simt atât de confortabil și îngrijit. Tratament fără durere, serviciu prietenos și un zâmbet mai strălucitor—nu aș putea cere o îngrijire mai bună!"
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  CK
                </div>
                <div>
                  <p className="font-bold text-gray-900">Cooper, Kristin</p>
                  <p className="text-sm text-gray-600">Asistent Medical</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secțiunea Echipa Noastră */}
      <section id="echipa" className="py-24 bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Zona de Sus: Titlu + Descriere + Buton */}
          <div className="grid lg:grid-cols-2 gap-8 items-start mb-16">
            {/* Partea stângă - Conținut text */}
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wider"># Echipa Noastră</p>
              {/* Titlu - Bold, potrivit stilului site-ului */}
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Profesioniștii tăi de încredere în stomatologie
              </h2>
              
              {/* Paragraf descriere */}
              <p className="text-gray-600 text-lg leading-relaxed">
                Echipa noastră dedicată de profesioniști combină ani de experiență, tehnologie de ultimă generație și o atmosferă caldă și îngrijitoare pentru a vă asigura cea mai bună îngrijire dentară posibilă.
              </p>
            </div>
            
            {/* Partea dreaptă - Buton aliniat cu titlul */}
            <div className="flex items-start justify-end lg:justify-end">
              <button 
                onClick={() => document.getElementById('programare')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white px-10 py-4 rounded-[50px] text-lg font-bold hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 inline-flex items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-xl hover:shadow-2xl transform hover:scale-105 mt-12 lg:mt-[52px]"
              >
                <span>Programează-te Astăzi</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            </div>
          </div>

          {/* Grid Echipa - 4 coloane peste 1024px, 2 coloane până la 1024px - potrivit stilului grid site-ului */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-20 sm:mt-32 md:mt-40">
            {medici.map((medic, index) => {
              // Obține inițialele pentru imaginea circulară
              const initials = medic.name
                .split(' ')
                .map(n => n[0])
                .filter(char => char && char !== '.')
                .join('')
                .toUpperCase()
                .slice(0, 2);
              
              // Verifică dacă acest card ar trebui să folosească fotografie reală
              const isPopescuCard = medic.id === "popescu";
              const isIonescuCard = medic.id === "ionescu";
              const isMariaCard = medic.id === "marinescu";
              const isLastCard = index === medici.length - 1;
              const hasPhoto = isPopescuCard || isIonescuCard || isMariaCard || isLastCard;
              
              return (
                <div 
                  key={medic.id}
                  className="animate__animated animate__fadeInUp bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-blue-200 relative overflow-visible w-full sm:w-[calc(100%+4px)] -mx-0 sm:-mx-0.5"
                  style={{ animationDelay: `${index * 0.1}s`, animationDuration: '0.8s' }}
                >
                  {hasPhoto ? (
                    <div className="relative flex flex-col h-full min-h-[280px] sm:min-h-[350px] lg:min-h-[380px] xl:min-h-[400px]">
                      {/* Fotografie - Până la 1023px (mobil și tabletă): ca la mobil, de la 1024px: se extinde în afara cardului */}
                      <div className={`left-0 right-0 w-full z-0 ${isPopescuCard
                        ? 'relative lg:absolute lg:-top-24 xl:absolute xl:-top-28'
                        : isLastCard
                        ? 'relative lg:absolute lg:-top-24 xl:absolute xl:-top-28'
                        : isIonescuCard 
                        ? 'relative lg:absolute lg:-top-24 xl:absolute xl:-top-28' 
                        : isMariaCard 
                        ? 'relative lg:absolute lg:-top-32 xl:absolute xl:-top-36' 
                        : 'relative lg:absolute lg:-top-24 xl:absolute xl:-top-28'}`}>
                        <div className={`w-full h-[240px] sm:h-[400px] ${isMariaCard ? 'lg:h-[480px] xl:h-[520px]' : 'lg:h-[420px] xl:h-[450px]'} overflow-visible`}>
                          <img 
                            src={isPopescuCard 
                              ? "/doctorp.png"
                              : isIonescuCard
                              ? "/doctorI1.png"
                              : isMariaCard 
                              ? "/doctor.png"
                              : "https://www.trustfamilydental.com/wp-content/uploads/2025/06/dentist-with-jaw-2021-08-30-09-27-03-utc.png"
                            }
                            alt={medic.name}
                            className="w-full h-full object-contain object-center"
                          />
                </div>
                      </div>
                      
                      {/* Conținut text în partea de jos - fără suprapunere */}
                      <div className={`mt-auto pb-4 sm:pb-6 lg:pb-6 xl:pb-6 px-4 sm:px-6 lg:px-6 xl:px-6 pt-2 relative z-10 bg-white rounded-b-2xl`}>
                        <h3 className="text-base sm:text-lg lg:text-xl xl:text-xl font-bold text-gray-900 mb-1 sm:mb-2 text-center">
                          {medic.name}
                        </h3>
                        <p className="text-gray-600 text-center font-medium text-xs sm:text-sm">
                          {medic.role}
                </p>
              </div>
          </div>
                  ) : (
                    <div className="p-4 sm:p-6 lg:p-8">
                      {/* Imagine Circulară - Inițiale pentru celelalte carduri - Mai mică pe mobil */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 mx-auto mb-4 sm:mb-5 lg:mb-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{initials}</span>
        </div>
                      
                      {/* Nume - Bold, potrivit tipografiei site-ului */}
                      <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 text-center">
                        {medic.name}
                      </h3>
                      
                      {/* Rol - Gri, potrivit stilului site-ului */}
                      <p className="text-gray-600 text-center font-medium text-xs sm:text-sm">
                        {medic.role}
                      </p>
            </div>
                  )}
            </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Secțiunea Prețuri */}
      <section id="preturi" className="py-24 bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wider"># Prețuri</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Prețuri Transparente</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Oferim prețuri clare și competitive pentru toate serviciile noastre</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Cardul 1 - Consultație */}
            <div className="group bg-white rounded-2xl p-6 sm:p-8 md:p-10 border-2 border-gray-100 hover:border-blue-300 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 relative overflow-hidden">
              {/* Gradient decorativ */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 opacity-20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                {/* Iconiță */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Consultație</h3>
              <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-6 sm:mb-8">150 RON</div>
                
                <ul className="space-y-3 sm:space-y-4 text-gray-700 mb-6 sm:mb-8">
                <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                    <span>Evaluare completă</span>
                </li>
                <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                    <span>Plan de tratament</span>
                </li>
                <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                    <span>Consultație detaliată</span>
                </li>
              </ul>
                
                <button 
                  onClick={() => document.getElementById('programare')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-[50px] font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Rezervă Acum
                </button>
              </div>
            </div>

            {/* Cardul 2 - Detartraj */}
            <div className="group bg-white rounded-2xl p-6 sm:p-8 md:p-10 border-2 border-gray-100 hover:border-blue-300 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 relative overflow-hidden">
              {/* Gradient decorativ */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 opacity-20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                {/* Iconiță */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Detartraj</h3>
              <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-6 sm:mb-8">200 RON</div>
                
                <ul className="space-y-3 sm:space-y-4 text-gray-700 mb-6 sm:mb-8">
                <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                    <span>Curățare profesională</span>
                </li>
                <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                    <span>Îndepărtare tartru</span>
                </li>
                <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                    <span>Fluorizare</span>
                </li>
              </ul>
                
                <button 
                  onClick={() => document.getElementById('programare')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-[50px] font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Rezervă Acum
                </button>
              </div>
            </div>

            {/* Cardul 3 - Implant (Recomandat) */}
            <div className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 md:p-10 border-2 border-blue-500 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-3 relative overflow-hidden">
              {/* Badge Popular */}
              <div className="absolute top-6 right-6 bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              
              {/* Elemente decorative */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                {/* Iconiță */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Implant</h3>
                <div className="text-4xl sm:text-5xl font-extrabold text-white mb-6 sm:mb-8">2000 RON</div>
                
                <ul className="space-y-3 sm:space-y-4 text-white/90 mb-6 sm:mb-8">
                <li className="flex items-center">
                    <svg className="w-5 h-5 text-white mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                    <span>Implant de calitate</span>
                </li>
                <li className="flex items-center">
                    <svg className="w-5 h-5 text-white mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                    <span>Garantie 5 ani</span>
                </li>
                <li className="flex items-center">
                    <svg className="w-5 h-5 text-white mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                    <span>Consultație inclusă</span>
                </li>
              </ul>
                
                <button 
                  onClick={() => document.getElementById('programare')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full bg-white text-blue-600 py-3 rounded-[50px] font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Rezervă Acum
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secțiunea Rezervare Programare */}
      <section id="programare" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-4"># Programare</p>
            <h2 className="text-4xl font-bold text-black mb-4">Rezervare programare ușoară și rapidă</h2>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 rounded-3xl shadow-2xl p-12 lg:p-16 border-2 border-blue-100">
              <div className="grid lg:grid-cols-2 gap-16">
                <div className="border-r-2 border-blue-200 pr-16">
                  <div className="mb-8">
                    <h3 className="text-3xl font-black text-black mb-3 flex items-center">
                      <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Selectează Data și Ora
                    </h3>
                    <p className="text-gray-600 text-lg">Alege momentul potrivit pentru consultația ta</p>
                  </div>
                  <ClientAvailability
                    selectedDate={selectedDate}
                    selectedMedic={selectedMedic}
                    onSelectSlot={handleSelectSlot}
                    onSlotsChange={setFreeSlots}
                    onMedicChange={handleMedicChange}
                  />
                </div>
            <div>
                  <div className="mb-8">
                    <h3 className="text-3xl font-black text-black mb-3 flex items-center">
                      <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Completează Datele
                    </h3>
                    <p className="text-gray-600 text-lg">Informațiile tale pentru rezervare</p>
              </div>
                  <ReservationForm
                    selectedDate={selectedDate}
                    onChangeDate={setSelectedDate}
                    prefillTime={prefillTime}
                    freeSlots={freeSlots}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subsol */}
      <footer id="contact" className="bg-gray-900 text-white py-8 sm:py-12 md:py-16 rounded-2xl sm:rounded-3xl mx-[10px] mb-[10px]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10 md:mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <img src="/logo.png" alt="Logo" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
                <span className="text-xl sm:text-2xl font-bold">ApexCare</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 leading-relaxed">
                Îngrijire medicală expertă, programată ușor la confortul tău
              </p>
              <div className="space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-400">
                <p>+(1234)-123-56</p>
                <p>info@apexcare.com</p>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Link-uri Rapide</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#despre" className="hover:text-white transition-colors">Despre</a></li>
                <li><a href="#servicii" className="hover:text-white transition-colors">Servicii</a></li>
                <li><a href="#preturi" className="hover:text-white transition-colors">Prețuri</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Buletin Informativ</h3>
              <form className="relative group">
                <input
                  type="email"
                  placeholder="Adresă Email"
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-[50px] px-4 sm:px-6 pr-16 sm:pr-20 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base transition-all duration-200 group-hover:border-gray-600"
                />
                <button
                  type="submit"
                  className="absolute right-[3px] top-[3px] bottom-[3px] aspect-square w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 transform rotate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </form>
            </div>

            <div className="w-full">
              {/* Titlu - Tipografie Responsivă */}
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl font-bold mb-3 sm:mb-4 md:mb-5 lg:mb-6 text-center sm:text-left">
                Rețele Sociale
              </h3>
              
              {/* Descriere - Tipografie Responsivă */}
              <p className="text-gray-400 text-xs sm:text-sm md:text-base mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-relaxed text-center sm:text-left">
                Urmărește-ne pentru sfaturi și actualizări
              </p>
              
              {/* Container Iconițe Sociale - Layout Responsiv */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                {/* Facebook */}
                <a 
                  href="#" 
                  className="group w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md sm:shadow-lg hover:shadow-xl transform hover:scale-110 hover:-translate-y-1 active:scale-95"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                
                {/* LinkedIn */}
                <a 
                  href="#" 
                  className="group w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md sm:shadow-lg hover:shadow-xl transform hover:scale-110 hover:-translate-y-1 active:scale-95"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                
                {/* Instagram */}
                <a 
                  href="#" 
                  className="group w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md sm:shadow-lg hover:shadow-xl transform hover:scale-110 hover:-translate-y-1 active:scale-95"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-xs sm:text-sm">&copy; 2025, ApexCare. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
