import { getCache, setCache, invalidateReadingsCache } from '../../config/redis.js';
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
    const reading = await readingsRepository.insertReading({
      userId,
      date: payload.date,
      slot: payload.slot,
      value: payload.value,
    });
    // Invalidate readings cache so fresh data is fetched
    await invalidateReadingsCache(userId);
    return reading;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(409, duplicateSlotMessage(payload.slot), 'slot');
    }
    throw error;
  }
}

export async function listReadings(userId, date) {
  const cacheKey = `cache:readings:${userId}:${date}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const readings = await readingsRepository.listByUserAndDate(userId, date);
  await setCache(cacheKey, readings);
  return readings;
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
    excludeId: id,
  });

  try {
    const reading = await readingsRepository.updateReading({
      id,
      userId,
      date: payload.date,
      slot: payload.slot,
      value: payload.value,
    });
    // Invalidate readings cache
    await invalidateReadingsCache(userId);
    return reading;
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
  // Invalidate readings cache
  await invalidateReadingsCache(userId);
}
