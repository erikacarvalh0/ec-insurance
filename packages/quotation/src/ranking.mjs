export function rankVerifiedOffers(offers) {
  return offers
    .filter((offer) => (
      offer?.verified === true &&
      offer.simulated === false &&
      typeof offer.premium === 'number' &&
      Number.isFinite(offer.premium) &&
      offer.premium >= 0
    ))
    .sort((left, right) => left.premium - right.premium);
}
