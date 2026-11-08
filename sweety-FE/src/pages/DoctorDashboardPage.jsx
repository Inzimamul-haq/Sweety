import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Lock,
  Mail,
  Search,
  Stethoscope,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getErrorPayload } from '../api/client.js';
import { Button } from '../components/ui/Button.jsx';
import { ErrorMessage } from '../components/ui/ErrorMessage.jsx';
import { useToast } from '../components/ui/ToastContext.jsx';
import { useAuth } from '../features/auth/AuthContext.jsx';
import {
  fetchDoctorPatients,
  fetchDoctorStats,
  linkPatientByEmail,
  lookupPatientByEmail,
} from '../features/doctor/doctor.api.js';
import { StatsCard } from '../features/reports/components/StatsCard.jsx';
import { formatPretty } from '../utils/date.js';

const emailLookupSchema = z
  .string({ error: 'Please enter a patient email.' })
  .trim()
  .min(1, 'Please enter a patient email.')
  .email('Please enter a valid email address.');

const statusChipMeta = {
  low: {
    label: 'Low',
    className: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
  },
  in_range: {
    label: 'In range',
    className: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  },
  high: {
    label: 'High',
    className: 'bg-rose-50 text-rose-800 ring-1 ring-rose-200',
  },
  no_data: {
    label: 'No data',
    className: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200',
  },
};

export function DoctorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Dashboard Stats & Patients State
  const [stats, setStats] = useState({
    totalPatients: 0,
    loggedToday: 0,
    inRange: 0,
    needsAttention: 0,
  });
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Lookup & Add Patient State
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [addingPatient, setAddingPatient] = useState(false);

  const loadDashboard = useCallback(
    async (searchTerm = '') => {
      try {
        setLoading(true);
        const [statsData, patientsData] = await Promise.all([
          fetchDoctorStats(),
          fetchDoctorPatients(searchTerm),
        ]);
        setStats(statsData);
        setPatients(patientsData);
      } catch (err) {
        const payload = getErrorPayload(err);
        toast.error(payload.message, 'Failed to Load Dashboard');
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboard(search);
    }, 180);
    return () => clearTimeout(timer);
  }, [search, loadDashboard]);

  async function handleLookup(event) {
    event.preventDefault();
    setLookupError('');

    const parsed = emailLookupSchema.safeParse(lookupEmail);
    if (!parsed.success) {
      setLookupError(parsed.error.issues[0].message);
      return;
    }

    setLookingUp(true);
    try {
      const patient = await lookupPatientByEmail(parsed.data);
      setLookupResult(patient);
    } catch (err) {
      const payload = getErrorPayload(err);
      setLookupResult(null);
      setLookupError(payload.message);
    } finally {
      setLookingUp(false);
    }
  }

  async function handleAddPatient() {
    if (!lookupResult || lookupResult.alreadyLinked) return;

    setAddingPatient(true);
    setLookupError('');
    try {
      await linkPatientByEmail(lookupResult.email);
      toast.success(`${lookupResult.name} has been added to your patient list.`);
      setLookupResult((prev) =>
        prev
          ? {
              ...prev,
              alreadyLinked: true,
              linkedToSelf: true,
              linkedToAnotherDoctor: false,
              doctorName: user?.name || 'You',
              connectedDoctor: {
                id: user?.id,
                name: user?.name || 'You',
                email: user?.email,
              },
            }
          : null,
      );
      setLookupEmail('');
      await loadDashboard(search);
    } catch (err) {
      const payload = getErrorPayload(err);
      setLookupError(payload.message);
      toast.error(payload.message, 'Could Not Link Patient');
    } finally {
      setAddingPatient(false);
    }
  }

  return (
    <div className="space-y-5 pb-10">
      {/* 1. Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">
              Clinician Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 ring-1 ring-rose-200/70">
              <Stethoscope className="h-3 w-3" />
              {user?.name}
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium">
            Monitor linked patients’ recent glucose logs and 7-day rolling averages
          </p>
        </div>
      </div>

      {/* 2. Four Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard
          label="Total Patients"
          value={stats.totalPatients}
          unit="linked"
          icon={Users}
        />
        <StatsCard
          label="Logged Today"
          value={stats.loggedToday}
          unit="active"
          icon={CalendarCheck}
        />
        <StatsCard
          label="In Range (7d)"
          value={stats.inRange}
          unit="70–180 mg/dl"
          icon={Activity}
        />
        <StatsCard
          label="Needs Attention"
          value={stats.needsAttention}
          unit="<70 or >180"
          icon={AlertTriangle}
        />
      </div>

      {/* 3. Add Patient by Email Box */}
      <section className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-stone-200/80 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-rose-100 text-rose-700">
                <UserPlus className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-stone-900">
                  Add Patient by Email
                </h2>
                <p className="text-xs text-stone-500">
                  Look up an existing patient account by email to connect them to your care list
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLookup} className="flex flex-1 max-w-xl flex-col gap-2 sm:flex-row" noValidate>
            <div className="flex-1">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={lookupEmail}
                  onChange={(e) => {
                    setLookupEmail(e.target.value);
                    if (lookupError) setLookupError('');
                  }}
                  placeholder="Enter patient email (e.g. rohan@sweety.app)"
                  className="w-full rounded-2xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 shadow-2xs outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                />
              </div>
              <ErrorMessage>{lookupError}</ErrorMessage>
            </div>
            <Button type="submit" variant="secondary" loading={lookingUp} className="shrink-0 self-start">
              <Search className="h-4 w-4" />
              Look up
            </Button>
          </form>
        </div>

        {/* Lookup Result Card */}
        {lookupResult ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 flex flex-col justify-between gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center ${
              lookupResult.linkedToAnotherDoctor
                ? 'border-amber-200 bg-amber-50/70'
                : lookupResult.linkedToSelf
                  ? 'border-stone-200 bg-stone-50/90'
                  : 'border-emerald-200 bg-emerald-50/60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white font-display text-lg font-bold text-rose-800 shadow-2xs ring-1 ring-stone-200/80">
                {lookupResult.name ? lookupResult.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-stone-900 text-sm">{lookupResult.name}</h3>
                  {lookupResult.linkedToAnotherDoctor ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-300/70">
                      <Lock className="h-3 w-3" />
                      Connected to {lookupResult.doctorName}
                    </span>
                  ) : lookupResult.linkedToSelf ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-200/80 px-2.5 py-0.5 text-xs font-semibold text-stone-800">
                      <UserCheck className="h-3 w-3" />
                      Connected to {lookupResult.doctorName || user?.name} (You)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      Available to link
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 mt-0.5">{lookupResult.email}</p>

                {lookupResult.linkedToAnotherDoctor ? (
                  <p className="mt-1.5 text-xs font-medium text-amber-900">
                    This patient profile is already connected to{' '}
                    <span className="font-bold underline">{lookupResult.doctorName}</span>. You cannot add a patient who is already linked to another doctor.
                  </p>
                ) : lookupResult.linkedToSelf ? (
                  <p className="mt-1.5 text-xs text-stone-500">
                    This patient is already linked to your profile ({lookupResult.doctorName || user?.name}).
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-emerald-800">
                    Not linked to any clinician yet. Click Add Patient to link this profile.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setLookupResult(null)}
                className="px-2.5 py-1.5 text-xs"
              >
                <X className="h-4 w-4" />
                Dismiss
              </Button>
              <Button
                type="button"
                onClick={handleAddPatient}
                loading={addingPatient}
                disabled={lookupResult.alreadyLinked}
              >
                <UserPlus className="h-4 w-4" />
                {lookupResult.linkedToAnotherDoctor
                  ? `Linked to ${lookupResult.doctorName}`
                  : lookupResult.linkedToSelf
                    ? 'Already Linked'
                    : 'Add Patient'}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </section>

      {/* 4. Linked Patients List */}
      <section className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-stone-200/80 sm:p-6">
        <div className="flex flex-col gap-3 border-b border-stone-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900">Linked Patients</h2>
            <p className="text-xs text-stone-500">
              Click any patient row to open their read-only glucose reports
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients by name or email…"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 py-2 pl-9 pr-3.5 text-xs text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-stone-400">
            Loading linked patients…
          </div>
        ) : patients.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-display text-lg text-stone-800">
              {search ? 'No matching patients found' : 'No linked patients yet'}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              {search
                ? 'Try a different name or email search term.'
                : 'Use the email lookup box above to link your first patient.'}
            </p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-stone-200/70">
            {patients.map((patient) => {
              const chip = statusChipMeta[patient.status] || statusChipMeta.no_data;

              return (
                <div
                  key={patient.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/doctor/patients/${patient.id}/reports`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/doctor/patients/${patient.id}/reports`);
                    }
                  }}
                  className="group flex flex-col gap-3 py-3.5 px-3 -mx-3 rounded-2xl transition hover:bg-stone-50/90 cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Patient Identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-100/80 font-display text-sm font-bold text-rose-800">
                      {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-bold text-sm text-stone-900 group-hover:text-rose-800 transition">
                          {patient.name}
                        </p>
                        {patient.loggedToday ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                            Logged today
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-stone-500">{patient.email}</p>
                    </div>
                  </div>

                  {/* Metrics: Last Reading, 7-day Average, Status Chip */}
                  <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                    <div className="text-left sm:text-right min-w-[140px]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Last Reading
                      </p>
                      {patient.lastReading ? (
                        <p className="text-xs font-semibold text-stone-800">
                          <span className="font-bold text-stone-900">
                            {patient.lastReading.value} mg/dl
                          </span>{' '}
                          <span className="text-stone-500">
                            · {patient.lastReading.slot} ({formatPretty(patient.lastReading.date)})
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-stone-400">No readings yet</p>
                      )}
                    </div>

                    <div className="text-left sm:text-right min-w-[90px]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        7-Day Avg
                      </p>
                      <p className="text-xs font-extrabold text-stone-900">
                        {patient.sevenDayAverage !== null
                          ? `${patient.sevenDayAverage} mg/dl`
                          : '—'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex min-w-[74px] justify-center rounded-full px-2.5 py-1 text-xs font-bold ${chip.className}`}
                      >
                        {chip.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-rose-700" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

