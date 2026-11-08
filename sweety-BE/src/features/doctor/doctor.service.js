import { invalidateUserCache } from '../../config/redis.js';
import { AppError } from '../../shared/errors/AppError.js';
import * as reportsService from '../reports/reports.service.js';
import * as doctorRepository from './doctor.repository.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getStats(doctorId) {
  return doctorRepository.getDoctorStats(doctorId);
}

export async function listPatients(doctorId, search) {
  return doctorRepository.listDoctorPatients(doctorId, search);
}

export async function lookupPatient(doctorId, email) {
  const user = await doctorRepository.findUserWithLinkByEmail(email);

  if (!user || user.role !== 'patient') {
    throw new AppError(404, 'No patient account found with this email.', 'email');
  }

  const alreadyLinked = Boolean(user.doctor_id);
  const linkedToSelf = user.doctor_id === doctorId;
  const linkedToAnotherDoctor = Boolean(user.doctor_id && user.doctor_id !== doctorId);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    alreadyLinked,
    linkedToSelf,
    linkedToAnotherDoctor,
    doctorName: user.doctor_name || null,
    connectedDoctor: user.doctor_id
      ? {
          id: user.doctor_id,
          name: user.doctor_name,
          email: user.doctor_email,
        }
      : null,
  };
}

export async function addPatient(doctorId, email) {
  const user = await doctorRepository.findUserWithLinkByEmail(email);

  if (!user) {
    throw new AppError(404, 'No patient account found with this email.', 'email');
  }

  if (user.id === doctorId) {
    throw new AppError(400, 'You cannot link yourself as a patient.', 'email');
  }

  if (user.role !== 'patient') {
    throw new AppError(400, 'Only patient accounts can be linked.', 'email');
  }

  if (user.doctor_id) {
    if (user.doctor_id === doctorId) {
      throw new AppError(409, 'This patient is already in your patient list.', 'email');
    }
    throw new AppError(
      409,
      `This patient is already connected to ${user.doctor_name}.`,
      'email',
    );
  }

  try {
    const patient = await doctorRepository.linkPatient(doctorId, user.id);
    // Invalidate patient's cached profile so their /auth/me reflects the connected doctor
    await invalidateUserCache(user.id);
    return patient;
  } catch (error) {
    if (error?.code === '23505') {
      throw new AppError(409, 'This patient is already linked to a doctor.', 'email');
    }
    throw error;
  }
}

export async function getPatientReport(doctorId, patientId, kind, date, pagination) {
  if (!UUID_REGEX.test(patientId)) {
    throw new AppError(403, 'You do not have access to this patient’s reports.');
  }

  const linkedPatient = await doctorRepository.findLinkedPatient(doctorId, patientId);
  if (!linkedPatient) {
    throw new AppError(403, 'You do not have access to this patient’s reports.');
  }

  const report = await reportsService.getReport(patientId, kind, date, pagination);

  return {
    report,
    patient: {
      id: linkedPatient.id,
      name: linkedPatient.name,
      email: linkedPatient.email,
      linkedAt: linkedPatient.linked_at,
      connectedDoctor: {
        id: linkedPatient.doctor_id,
        name: linkedPatient.doctor_name,
        email: linkedPatient.doctor_email,
      },
    },
  };
}

