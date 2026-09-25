/**
 * Deterministic Smart Ride Matching Algorithm
 * Calculates compatibility score (0-100%) between passenger query and offered ride.
 */

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0; // Default estimate
  const R = 6371; // Radius of Earth in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function computeMatchScore(ride, query) {
  let score = 100;

  // 1. Text Similarity / Location check (30% weight)
  const reqSource = (query.source || '').toLowerCase();
  const reqDest = (query.destination || '').toLowerCase();
  const rideSource = (ride.source || '').toLowerCase();
  const rideDest = (ride.destination || '').toLowerCase();

  const sourceExact = rideSource.includes(reqSource) || reqSource.includes(rideSource);
  const destExact = rideDest.includes(reqDest) || reqDest.includes(rideDest);

  if (!sourceExact) score -= 15;
  if (!destExact) score -= 15;

  // 2. Departure Time Proximity (30% weight)
  if (query.departureTime && ride.departureTime) {
    const parseMins = (t) => {
      const [h, m] = t.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const diff = Math.abs(parseMins(query.departureTime) - parseMins(ride.departureTime));
    if (diff > 60) score -= 25;
    else if (diff > 30) score -= 15;
    else if (diff > 15) score -= 5;
  }

  // 3. Driver Rating Bonus/Penalty (20% weight)
  const driverRating = ride.driverId?.rating || 4.8;
  if (driverRating >= 4.8) score += 5;
  else if (driverRating < 4.0) score -= 15;

  // 4. Seats Feasibility (10% weight)
  const requestedSeats = Number(query.seats || 1);
  if (ride.availableSeats < requestedSeats) {
    score = 0; // Infeasible
  } else if (ride.availableSeats === requestedSeats) {
    score += 5; // Perfect fit
  }

  // 5. Verification Status Boost (10% weight)
  if (ride.driverId?.verificationStatus === 'verified') {
    score += 5;
  }

  // Cap between 40 and 99
  if (score <= 0) return 0;
  return Math.min(99, Math.max(45, Math.round(score)));
}

module.exports = {
  calculateDistanceKm,
  computeMatchScore,
};
