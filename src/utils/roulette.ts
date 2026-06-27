export function selectWinnerIndex(participantCount: number): number {
  if (participantCount <= 0) return -1;

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    return randomValues[0] % participantCount;
  }

  return Math.floor(Math.random() * participantCount);
}
