import * as readingsService from './readings.service.js';

export async function create(req, res, next) {
  try {
    const reading = await readingsService.createReading(req.user.id, req.validated);
    res.status(201).json({ reading });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const readings = await readingsService.listReadings(req.user.id, req.validated.date);
    res.json({ readings });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const reading = await readingsService.updateReading(
      req.user.id,
      req.params.id,
      req.validated,
    );
    res.json({ reading });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await readingsService.deleteReading(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
