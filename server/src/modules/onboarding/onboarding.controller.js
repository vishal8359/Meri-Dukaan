/**
 * Onboarding Controller
 */
import * as onboardingService from "./onboarding.service.js";

export const upload = async (req, res) => {
  const result = await onboardingService.initiateOnboarding(
    req.user.id,
    req.files,
    req.body
  );
  res.status(201).json(result);
};

export const status = async (req, res) => {
  const result = await onboardingService.getStatus(req.user.id);
  res.json(result);
};

export const review = async (req, res) => {
  const result = await onboardingService.submitReview(req.user.id, req.body);
  res.json(result);
};

export const result = async (req, res) => {
  const data = await onboardingService.getResult(req.user.id);
  res.json(data);
};
