import { AppError } from '../../shared/errors/AppError.js';
import * as readingsRepository from './readings.repository.js';

function duplicateSlotMessage(slot) {
  return `You already have an ${slot} reading for this date.`;
}

function isUniqueViolation(error) {
  return error?.code === '23505';
}

async function assertSlotAndLimit({ userId, date, slot, excludeId }) {
  const duplicate = await readingsRepository.findByUserDateSlot({
    userId,
    date,
    slot,
    excludeId,
  });

  if (duplicate) {
    throw new AppError(409, duplicateSlotMessage(slot), 'slot');
  }

  const count = await readingsRepository.countByUserDate({
    userId,
    date,
    excludeId,
  });

  if (count >= 4) {
    throw new AppError(400, 'You can add only 4 readings per day.', 'date');
  }
}

export async function createReading(userId, payload) {
  await assertSlotAndLimit({
    userId,
    date: payload.date,
    slot: payload.slot,
  });

  try {
    return await readingsRepository.insertReading({
      userId,
      date: payload.date,
      slot: payload.slot,
      value: payload.value,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(409, duplicateSlotMessage(payload.slot), 'slot');
    }
    throw error;
  }
}

export async function listReadings(userId, date) {
  return readingsRepository.listByUserAndDate(userId, date);
}

export async function updateReading(userId, id, payload) {
  const existing = await readingsRepository.findByIdForUser(id, userId);
  if (!existing) {
    throw new AppError(404, 'Reading not found.');
  }

  await assertSlotAndLimit({
    userId,
    date: payload.date,
    slot: payload.slot,
    excludeId: Number(id),
  });

  try {
    return await readingsRepository.updateReading({
      id,
      userId,
      date: payload.date,
      slot: payload.slot,
      value: payload.value,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(409, duplicateSlotMessage(payload.slot), 'slot');
    }
    throw error;
  }
}

export async function deleteReading(userId, id) {
  const deleted = await readingsRepository.deleteReading({ id, userId });
  if (!deleted) {
    throw new AppError(404, 'Reading not found.');
  }
}
